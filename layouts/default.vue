<!-- layouts/default.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const menuAberto = ref(false)

const fecharMenu = () => {
  menuAberto.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
    <!-- Sidebar / Topbar Mobile -->
    <aside class="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col items-center flex-shrink-0">
      
      <!-- Cabeçalho da Sidebar (Logo + Botão Mobile) -->
      <div class="w-full flex md:flex-col items-center justify-between">
        <NuxtLink to="/" @click="fecharMenu" class="w-32 h-32 md:w-48 md:h-48 block">
          <img 
            src="/logo-daytrade.png" 
            alt="Day Trade Logo" 
            class="w-full h-full object-contain" 
          />
        </NuxtLink>

        <!-- Botão Hambúrguer Mobile -->
        <button 
          @click="menuAberto = !menuAberto"
          class="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <svg v-if="!menuAberto" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Links de Navegação -->
      <nav 
        :class="[
          'w-full mt-4 md:mt-6 flex-col gap-1.5',
          menuAberto ? 'flex' : 'hidden md:flex'
        ]"
      >
        <NuxtLink 
          to="/" 
          @click="fecharMenu"
          class="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-2"
          active-class="bg-slate-100 text-[#556b2f] font-bold"
        >
          <span>📊 Dashboard</span>
        </NuxtLink>

        <NuxtLink 
          to="/relatperformance" 
          @click="fecharMenu"
          class="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-2"
          active-class="bg-slate-100 text-[#556b2f] font-bold"
        >
          <span>📈 Relatório Performance</span>
        </NuxtLink>

        <NuxtLink 
          to="/info" 
          @click="fecharMenu"
          class="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-2"
          active-class="bg-slate-100 text-[#556b2f] font-bold"
        >
          <span>ℹ️ Informações</span>
        </NuxtLink>

        <NuxtLink 
          to="/alterar-senha" 
          @click="fecharMenu"
          class="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100"
          active-class="bg-slate-100 text-[#556b2f] font-bold"
        >
          <span>🔒 Alterar Senha</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-3 md:p-6 space-y-4 overflow-x-hidden w-full max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>