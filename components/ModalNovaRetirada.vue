<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface ItemSaldoSemanal {
  semanaRef: string
  valorDevido: number
}

const props = defineProps<{
  isOpen: boolean
  saldosChris: ItemSaldoSemanal[]
  saldosVania: ItemSaldoSemanal[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: {
    sacadoNome: string
    semanas: ItemSaldoSemanal[]
    valorTotalRetirada: number
    dataRetirada: string
  }): void
}>()

// Vânia como padrão
const sacadoNome = ref<'Vânia' | 'Chris'>('Vânia')
const semanaSelecionadaIndex = ref<number>(0)
const valorRetirada = ref<number | ''>('')
const dataRetirada = ref<string>(new Date().toISOString().split('T')[0])

// Opção Valor Total (marcado por padrão)
const valorTotalCheck = ref<boolean>(true)

// Opções de semanas com saldo em haver do sacado selecionado
const semanasDisponiveis = computed(() => {
  return sacadoNome.value === 'Vânia' ? props.saldosVania : props.saldosChris
})

// Soma total de todos os saldos em haver do sacado selecionado
const somaTotalHaver = computed(() => {
  const total = semanasDisponiveis.value.reduce((acc, item) => acc + Number(item.valorDevido || 0), 0)
  return Number(total.toFixed(2))
})

// Semana atualmente destacada (quando não for valor total)
const semanaAtual = computed(() => {
  if (semanasDisponiveis.value.length === 0) return null
  return semanasDisponiveis.value[semanaSelecionadaIndex.value] || semanasDisponiveis.value[0]
})

// Atualiza os valores reativamente
const atualizarValorRetirada = () => {
  if (valorTotalCheck.value) {
    valorRetirada.value = somaTotalHaver.value
  } else if (semanaAtual.value) {
    valorRetirada.value = Number(semanaAtual.value.valorDevido.toFixed(2))
  } else {
    valorRetirada.value = ''
  }
}

// Reseta o índice e recalcula o valor ao trocar o sacado
watch(sacadoNome, () => {
  semanaSelecionadaIndex.value = 0
  atualizarValorRetirada()
})

// Reage a mudanças no checkbox Valor Total
watch(valorTotalCheck, () => {
  atualizarValorRetirada()
})

// Reage à alteração de semana selecionada
watch(semanaSelecionadaIndex, () => {
  if (!valorTotalCheck.value) {
    atualizarValorRetirada()
  }
})

// Reage a mudanças de props (quando o modal abre ou recalcula)
watch([() => props.saldosChris, () => props.saldosVania], () => {
  atualizarValorRetirada()
}, { immediate: true })

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const handleSubmit = () => {
  if (!valorRetirada.value || valorRetirada.value <= 0) return

  // Mapeia garantindo o valor da string semanaRef exatamente como está vindo na prop saldos
  const semanasParaAbater: ItemSaldoSemanal[] = valorTotalCheck.value
    ? semanasDisponiveis.value.map(s => ({
        semanaRef: String(s.semanaRef),
        valorDevido: Number(s.valorDevido)
      }))
    : semanaAtual.value
      ? [{ semanaRef: String(semanaAtual.value.semanaRef), valorDevido: Number(semanaAtual.value.valorDevido) }]
      : []

  if (semanasParaAbater.length === 0) {
    alert('Nenhuma semana de origem selecionada ou disponível para abate.')
    return
  }

  emit('submit', {
    sacadoNome: sacadoNome.value,
    semanas: semanasParaAbater,
    valorTotalRetirada: Number(Number(valorRetirada.value).toFixed(2)),
    dataRetirada: dataRetirada.value
  })

  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-800">Informar Nova Retirada</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Caixa de Seleção do Sacado -->
        <div>
          <label for="sacado-select" class="block text-xs font-semibold text-slate-600 mb-1">Sacado</label>
          <select 
            id="sacado-select"
            v-model="sacadoNome"
            class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#556b2f] outline-hidden"
          >
            <option value="Vânia">Vânia</option>
            <option value="Chris">Chris</option>
          </select>
        </div>

        <!-- Detalhamento dos Valores em Haver -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Semanas com Saldo em Haver</label>
          
          <div v-if="semanasDisponiveis.length === 0" class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            Não há saldo disponível em haver registrado para {{ sacadoNome }}.
          </div>

          <div v-else class="space-y-2 max-h-40 overflow-y-auto pr-1">
            <div 
              v-for="(item, idx) in semanasDisponiveis" 
              :key="idx"
              @click="() => { valorTotalCheck = false; semanaSelecionadaIndex = idx; }"
              :class="[
                'p-3 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition-all',
                !valorTotalCheck && semanaSelecionadaIndex === idx 
                  ? 'bg-[#dce6d5]/40 border-[#556b2f] ring-1 ring-[#556b2f]' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <div>
                <p class="font-bold text-slate-800">{{ item.semanaRef }}</p>
                <span class="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  Pendente
                </span>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-slate-500 uppercase font-medium">Em Haver</p>
                <p class="font-extrabold text-slate-900">{{ formatCurrency(item.valorDevido) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Opção Valor Total -->
        <div class="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg">
          <label for="checkbox-valor-total" class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input 
              id="checkbox-valor-total"
              type="checkbox" 
              v-model="valorTotalCheck"
              class="w-4 h-4 text-[#556b2f] border-slate-300 rounded focus:ring-[#556b2f] cursor-pointer"
            />
            Valor Total em Haver
          </label>
          <span class="text-xs font-extrabold text-[#556b2f]">
            {{ formatCurrency(somaTotalHaver) }}
          </span>
        </div>

        <!-- Formulário de Lançamento da Retirada -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Data da Retirada</label>
            <input 
              v-model="dataRetirada"
              type="date" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#556b2f] outline-hidden"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Valor da Retirada (R$)</label>
            <input 
              v-model.number="valorRetirada"
              type="number" 
              step="0.01"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-[#556b2f] outline-hidden"
            />
          </div>
        </div>

        <!-- Ações -->
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button 
            type="button" 
            @click="emit('close')"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            :disabled="!valorRetirada || valorRetirada <= 0"
            class="px-4 py-2 bg-[#556b2f] hover:bg-[#435424] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs"
          >
            Informar Retirada
          </button>
        </div>
      </form>
    </div>
  </div>
</template>