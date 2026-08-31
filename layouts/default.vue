<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
    <!-- Sidebar / Topbar Mobile -->
    <aside class="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col items-center flex-shrink-0">
      <div class="w-64 h-64 md:w-128 md:h-128 mb-2 md:mb-4">
        <img 
          src="/logo-daytrade.png" 
          alt="Day Trade Logo" 
          class="w-full h-full object-contain" 
        />
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-3 md:p-6 space-y-4 overflow-x-hidden w-full max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>