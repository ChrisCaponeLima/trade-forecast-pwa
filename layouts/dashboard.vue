<template>
    <div class="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <!-- Sidebar / Branding Left -->
      <aside class="w-72 bg-white border-r border-slate-200 p-6 flex flex-col items-center">
        <div class="w-32 h-32 mb-4">
          <img src="/logo-daytrade.png" alt="Day Trade Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-xl font-bold tracking-wider text-slate-900 text-center">DAY TRADE</h1>
        <span class="text-xs tracking-widest text-slate-500 uppercase font-semibold">RELATÓRIO</span>
        <hr class="w-full my-3 border-slate-200" />
        <p class="text-[10px] text-slate-400 tracking-wide uppercase text-center font-medium">
          DESEMPENHO | DISCIPLINA | RESULTADOS
        </p>
      </aside>
  
      <!-- Main Content Right -->
      <main class="flex-1 p-8 space-y-6">
        <slot />
      </main>
    </div>
  </template>