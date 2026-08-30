<template>
    <div class="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <!-- Sidebar / Branding Left -->
      <aside class="w-72 bg-white border-r border-slate-200 p-6 flex flex-col items-center">
        <div class="w-64 h-64 mb-4">
          <img src="/logo-daytrade.png" alt="Day Trade Logo" class="w-full h-full object-contain" />
        </div>
      </aside>
  
      <!-- Main Content Right -->
      <main class="flex-1 p-8 space-y-6">
        <slot />
      </main>
    </div>
  </template>