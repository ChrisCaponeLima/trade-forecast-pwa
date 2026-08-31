<script setup lang="ts">
import type { InfoGeralItem } from '~/types/info'

defineProps<{
  items: InfoGeralItem[]
}>()
</script>

<template>
  <section>
    <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Infos Gerais</h3>
    
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden max-w-2xl">
      <table class="w-full text-left text-xs md:text-sm">
        <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th class="py-3 px-4 md:px-6">Descritivo</th>
            <th class="py-3 px-4 md:px-6 text-right">Valor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
          <tr 
            v-for="(item, idx) in items" 
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
</template>