<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RetiradaDB {
  id: string
  semanaRef: string
  sacadoNome: string
  valorDevido: number
  valorRetirada: number
  dataRetirada: string | null
  statusTransferencia: 'PENDENTE' | 'EM_PROCESSAMENTO' | 'CONCLUIDO' | 'CANCELADO'
}

const props = defineProps<{
  items: RetiradaDB[]
  loading: boolean
  error: any
}>()

const emit = defineEmits<{
  (e: 'openModal'): void
  (e: 'aprovar', payload: { id: string; senha: string }): void
}>()

// Modal de Validação por Senha
const selectedRetiradaId = ref<string | null>(null)
const senhaInput = ref('')
const senhaErro = ref(false)

// Computado para obter a retirada selecionada no modal
const retiradaSelecionada = computed(() => {
  return props.items.find(item => item.id === selectedRetiradaId.value) || null
})

const formatCurrency = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'CONCLUIDO':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'PENDENTE':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'EM_PROCESSAMENTO':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CANCELADO':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'CONCLUIDO':
      return 'Concluído'
    case 'PENDENTE':
      return 'Pendente'
    case 'EM_PROCESSAMENTO':
      return 'Em Processamento'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return status
  }
}

const abrirConfirmacao = (id: string) => {
  selectedRetiradaId.value = id
  senhaInput.value = ''
  senhaErro.value = false
}

const confirmarAprovacao = () => {
  if (!senhaInput.value || !selectedRetiradaId.value) return
  emit('aprovar', { id: selectedRetiradaId.value, senha: senhaInput.value })
  selectedRetiradaId.value = null
  senhaInput.value = ''
}
</script>

<template>
  <section>
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Lançamentos / Retiradas</h3>
        <span class="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
          {{ items.length }} registros
        </span>
      </div>

      <button 
        @click="emit('openModal')"
        class="bg-[#556b2f] hover:bg-[#435424] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
      >
        <span>+</span> Informar Retirada
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
      <table class="w-full text-left text-xs md:text-sm">
        <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
          <tr>
            <th class="p-3">Semana Ref.</th>
            <th class="p-3">Sacado</th>
            <th class="p-3">Valor Devido</th>
            <th class="p-3">Retiradas</th>
            <th class="p-3">Data</th>
            <th class="p-3">Status Transferência</th>
            <th class="p-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
          <tr v-if="error">
            <td colspan="7" class="p-4 text-center text-rose-600 font-medium">
              Erro ao carregar retiradas: {{ error.statusMessage || error.message }}
            </td>
          </tr>
          <tr v-else-if="items.length === 0 && !loading">
            <td colspan="7" class="p-4 text-center text-slate-400">Nenhum lançamento registrado no banco.</td>
          </tr>
          <tr v-for="row in items" :key="row.id" class="hover:bg-slate-50 transition-colors">
            <td class="p-3 font-medium whitespace-nowrap">{{ row.semanaRef }}</td>
            <td class="p-3 font-medium text-slate-900 whitespace-nowrap">{{ row.sacadoNome }}</td>
            <td class="p-3 font-semibold text-slate-700 whitespace-nowrap">{{ formatCurrency(row.valorDevido) }}</td>
            <td class="p-3 font-bold text-slate-900 whitespace-nowrap">{{ formatCurrency(row.valorRetirada) }}</td>
            <td class="p-3 text-slate-500 whitespace-nowrap">{{ formatDate(row.dataRetirada) }}</td>
            <td class="p-3 whitespace-nowrap">
              <span 
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                  getStatusBadgeClass(row.statusTransferencia)
                ]"
              >
                {{ getStatusLabel(row.statusTransferencia) }}
              </span>
            </td>
            <td class="p-3 whitespace-nowrap text-center">
              <button 
                v-if="row.statusTransferencia === 'EM_PROCESSAMENTO' || row.statusTransferencia === 'PENDENTE'"
                @click="abrirConfirmacao(row.id)"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors"
              >
                OK (Aprovar)
              </button>
              <span v-else class="text-slate-400 text-xs">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Verificação de Senha -->
    <div v-if="selectedRetiradaId" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200 max-w-sm w-full space-y-4 shadow-xl">
        <h4 class="font-bold text-sm text-slate-800">
          Confirmar Liberação de Retirada {{ retiradaSelecionada ? ` - ${retiradaSelecionada.sacadoNome}` : '' }}
        </h4>
        <p class="text-xs text-slate-600">
          Digite a senha de verificação de <strong>{{ retiradaSelecionada?.sacadoNome }}</strong> para alterar o status para <strong>CONCLUÍDO</strong>.
        </p>
        
        <div>
          <input 
            v-model="senhaInput"
            type="password"
            placeholder="Senha de verificação"
            @keyup.enter="confirmarAprovacao"
            class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#556b2f] outline-hidden"
          />
        </div>

        <div class="flex justify-end gap-2">
          <button 
            @click="selectedRetiradaId = null"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="confirmarAprovacao"
            :disabled="!senhaInput"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Confirmar e Concluir
          </button>
        </div>
      </div>
    </div>
  </section>
</template>