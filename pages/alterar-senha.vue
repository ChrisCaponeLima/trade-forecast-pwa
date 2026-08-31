<!-- pages/alterar-senha.vue -->
<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

// Formulário Reativo
const usuario = ref('')
const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacaoSenha = ref('')

// Controle de Estados
const credencialValida = ref(false)
const isLoading = ref(false)
const mensagem = ref('')
const isError = ref(false)

// Passo 1: Validar Usuário e Senha Atual
const validarCredenciais = async () => {
  if (!usuario.value || !senhaAtual.value) {
    mensagem.value = 'Preencha o usuário e a senha atual.'
    isError.value = true
    return
  }

  isLoading.value = true
  mensagem.value = ''
  isError.value = false

  try {
    await $fetch('/api/usuarios/senha', {
      method: 'POST',
      body: {
        usuario: usuario.value,
        senhaAtual: senhaAtual.value,
        acao: 'validar'
      }
    })

    credencialValida.value = true
    mensagem.value = 'Credenciais confirmadas. Digite a nova senha abaixo.'
  } catch (err: any) {
    isError.value = true
    mensagem.value = err.data?.statusMessage || 'Erro ao validar credenciais.'
  } finally {
    isLoading.value = false
  }
}

// Passo 2: Confirmar e Alterar no Banco
const alterarSenha = async () => {
  if (!novaSenha.value || !confirmacaoSenha.value) {
    mensagem.value = 'Preencha a nova senha e a confirmação.'
    isError.value = true
    return
  }

  if (novaSenha.value !== confirmacaoSenha.value) {
    mensagem.value = 'A nova senha e a confirmação não coincidem.'
    isError.value = true
    return
  }

  isLoading.value = true
  mensagem.value = ''
  isError.value = false

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/usuarios/senha', {
      method: 'POST',
      body: {
        usuario: usuario.value,
        senhaAtual: senhaAtual.value,
        novaSenha: novaSenha.value,
        acao: 'alterar'
      }
    })

    if (res.success) {
      mensagem.value = res.message
      // Reseta os campos do formulário
      senhaAtual.value = ''
      novaSenha.value = ''
      confirmacaoSenha.value = ''
      credencialValida.value = false
    }
  } catch (err: any) {
    isError.value = true
    mensagem.value = err.data?.statusMessage || 'Erro ao alterar a senha.'
  } finally {
    isLoading.value = false
  }
}

// Resetar o fluxo caso o usuário troque de nome de usuário
const resetarValidacao = () => {
  credencialValida.value = false
  novaSenha.value = ''
  confirmacaoSenha.value = ''
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-6 pt-4">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3">
      <div>
        <h2 class="text-xl font-light text-[#556b2f]">Alterar Senha</h2>
        <p class="text-xs text-slate-500">Atualização da chave de autorização do sistema</p>
      </div>
      <NuxtLink to="/" class="text-xs font-semibold text-sky-700 hover:underline">
        ← Voltar
      </NuxtLink>
    </div>

    <!-- Mensagens de Feedback -->
    <div 
      v-if="mensagem" 
      :class="[
        'p-3 rounded-lg border text-xs font-medium flex items-center justify-between',
        isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      ]"
    >
      <span>{{ mensagem }}</span>
      <button @click="mensagem = ''" class="text-slate-400 hover:text-slate-600 font-bold ml-2">✕</button>
    </div>

    <!-- Card Principal -->
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <!-- ETAPA 1: Usuário e Senha Atual -->
      <form @submit.prevent="validarCredenciais" class="space-y-3">
        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Nome de Usuário</label>
          <input 
            v-model="usuario" 
            type="text" 
            placeholder="Digite seu usuário" 
            :disabled="credencialValida || isLoading"
            @input="resetarValidacao"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 disabled:opacity-60"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Senha Atual</label>
          <input 
            v-model="senhaAtual" 
            type="password" 
            placeholder="Digite a senha atual" 
            :disabled="credencialValida || isLoading"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 disabled:opacity-60"
          />
        </div>

        <button 
          v-if="!credencialValida"
          type="submit" 
          :disabled="isLoading"
          class="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Verificando...' : 'Confirmar Credenciais' }}
        </button>
      </form>

      <!-- ETAPA 2: Campos de Nova Senha (Abrem após validar etapa 1) -->
      <form v-if="credencialValida" @submit.prevent="alterarSenha" class="space-y-3 pt-4 border-t border-slate-100">
        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Nova Senha</label>
          <input 
            v-model="novaSenha" 
            type="password" 
            placeholder="Digite a nova senha" 
            :disabled="isLoading"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Confirmar Nova Senha</label>
          <input 
            v-model="confirmacaoSenha" 
            type="password" 
            placeholder="Repita a nova senha" 
            :disabled="isLoading"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Salvando...' : 'Salvar Nova Senha' }}
        </button>
      </form>
    </div>
  </div>
</template>