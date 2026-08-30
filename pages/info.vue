<script setup lang="ts">
import type { InfoGeralItem, PrincipalItem, LancamentoItem, ForecastItem } from '~/types/info'

definePageMeta({
  layout: 'default'
})

// Dados das Informações Gerais
const infosGerais: InfoGeralItem[] = [
  { descricao: 'Capital Total Atual', valor: 'R$ 23.549,00', destaque: true },
  { descricao: 'Aportes Acumulados', valor: 'R$ 20.000,00' },
  { descricao: 'Meta Mensal', valor: 'R$ 3.000,00' },
  { descricao: 'Total Retirado (Chris)', valor: 'R$ 0,00' },
  { descricao: 'Total Retirado (Vânia)', valor: 'R$ 0,00' },
  { descricao: 'Total Retiradas Gerais', valor: 'R$ 0,00' },
  { descricao: 'Saldo Vânia', valor: 'R$ 1.124,50' },
  { descricao: 'Saldo Chris', valor: 'R$ 0,00' }
]

// Tabela Principal
const principalList: PrincipalItem[] = [
  { data: '01/08/2026', valor: 'R$ 20.000,00', observacoes: 'Capital Inicial' }
]

// Tabela Lançamentos
const lancamentosList: LancamentoItem[] = [
  { 
    semanaRef: 'agosto - Semana 2', 
    sacado: 'Chris', 
    valorDevido: 'R$ 656,10', 
    retiradas: 'R$ 650,00', 
    data: '14/08/2026', 
    status: 'Concluído' 
  }
]

// Tabela Forecast
const forecastList: ForecastItem[] = [
  {
    semana: 'agosto - Semana 1',
    semanaNum: 1,
    metaRendimento: 'R$ 750,00',
    metaAcumulada: 'R$ 750,00',
    resultadoRealizado: '-R$ 436,00',
    devidoChris: '-',
    devidoVania: '-',
    metaAtingidaPct: '-58,13%',
    isNegative: true
  },
  {
    semana: 'agosto - Semana 2',
    semanaNum: 2,
    metaRendimento: 'R$ 750,00',
    metaAcumulada: 'R$ 1.500,00',
    resultadoRealizado: 'R$ 1.748,20',
    devidoChris: 'R$ 656,10',
    devidoVania: 'R$ 656,10',
    metaAtingidaPct: '116,55%'
  },
  {
    semana: 'agosto - Semana 3',
    semanaNum: 3,
    metaRendimento: 'R$ 750,00',
    metaAcumulada: 'R$ 2.250,00',
    resultadoRealizado: '-R$ 448,10',
    devidoChris: '-',
    devidoVania: '-',
    metaAtingidaPct: '-19,92%',
    isNegative: true
  },
  {
    semana: 'agosto - Semana 4',
    semanaNum: 4,
    metaRendimento: 'R$ 750,00',
    metaAcumulada: 'R$ 3.000,00',
    resultadoRealizado: 'R$ 2.684,90',
    devidoChris: 'R$ 1.118,40',
    devidoVania: 'R$ 1.118,40',
    metaAtingidaPct: '89,50%'
  }
]
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3">
      <h2 class="text-xl md:text-2xl font-light text-[#556b2f]">Informações de Controle</h2>
      <NuxtLink to="/" class="text-xs md:text-sm font-semibold text-sky-700 hover:underline">
        ← Voltar ao Dashboard
      </NuxtLink>
    </div>

    <!-- 1. Infos Gerais - Card com Tabela Elegante de Duas Colunas -->
    <section>
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Infos Gerais</h3>
      
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden max-w-2xl">
        <table class="w-full text-left text-xs md:text-sm">
          <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4 md:px-6">Descritivo</th>
              <th class="py-3 px-4 md:px-6 text-right">Valor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
            <tr 
              v-for="(item, idx) in infosGerais" 
              :key="idx" 
              :class="[
                'transition-colors duration-150',
                item.destaque 
                  ? 'bg-[#dce6d5]/50 font-bold text-slate-900' 
                  : idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50'
              ]"
            >
              <td class="py-3 px-4 md:px-6 font-medium text-slate-700">
                {{ item.descricao }}
              </td>
              <td 
                :class="[
                  'py-3 px-4 md:px-6 text-right whitespace-nowrap',
                  item.destaque ? 'text-base text-slate-900 font-extrabold' : 'font-semibold text-slate-800'
                ]"
              >
                {{ item.valor }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 2. Principal (Aportes) -->
    <section>
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Principal</h3>
      <div class="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table class="w-full text-left text-xs md:text-sm">
          <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="p-3">Data</th>
              <th class="p-3">Valor Aporte</th>
              <th class="p-3">Observações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
            <tr v-for="(row, idx) in principalList" :key="idx" class="hover:bg-slate-50">
              <td class="p-3 font-medium whitespace-nowrap">{{ row.data }}</td>
              <td class="p-3 font-bold text-slate-900 whitespace-nowrap">{{ row.valor }}</td>
              <td class="p-3 text-slate-600 whitespace-nowrap">{{ row.observacoes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 3. Lançamentos -->
    <section>
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Lançamentos</h3>
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
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
            <tr v-for="(row, idx) in lancamentosList" :key="idx" class="hover:bg-slate-50">
              <td class="p-3 font-medium whitespace-nowrap">{{ row.semanaRef }}</td>
              <td class="p-3 whitespace-nowrap">{{ row.sacado }}</td>
              <td class="p-3 font-semibold text-slate-900 whitespace-nowrap">{{ row.valorDevido }}</td>
              <td class="p-3 text-slate-700 whitespace-nowrap">{{ row.retiradas }}</td>
              <td class="p-3 text-slate-500 whitespace-nowrap">{{ row.data }}</td>
              <td class="p-3 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {{ row.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 4. Forecast -->
    <section>
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Forecast</h3>
      <div class="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table class="w-full text-left text-xs md:text-sm">
          <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th class="p-3">Semana</th>
              <th class="p-3 text-center">Nº</th>
              <th class="p-3">Meta Rend.</th>
              <th class="p-3">Meta Acum.</th>
              <th class="p-3">Resultado Realizado</th>
              <th class="p-3">Devido Chris</th>
              <th class="p-3">Devido Vânia</th>
              <th class="p-3">% Meta Atingida</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
            <tr v-for="(row, idx) in forecastList" :key="idx" class="hover:bg-slate-50">
              <td class="p-3 font-medium whitespace-nowrap">{{ row.semana }}</td>
              <td class="p-3 text-center text-slate-400 whitespace-nowrap">{{ row.semanaNum }}</td>
              <td class="p-3 text-slate-700 whitespace-nowrap">{{ row.metaRendimento }}</td>
              <td class="p-3 text-slate-700 whitespace-nowrap">{{ row.metaAcumulada }}</td>
              <td 
                :class="[
                  'p-3 font-bold whitespace-nowrap', 
                  row.isNegative ? 'text-rose-600' : 'text-emerald-600'
                ]"
              >
                {{ row.resultadoRealizado }}
              </td>
              <td class="p-3 whitespace-nowrap">{{ row.devidoChris }}</td>
              <td class="p-3 whitespace-nowrap">{{ row.devidoVania }}</td>
              <td 
                :class="[
                  'p-3 font-semibold whitespace-nowrap',
                  row.isNegative ? 'text-rose-600' : 'text-emerald-700'
                ]"
              >
                {{ row.metaAtingidaPct }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>