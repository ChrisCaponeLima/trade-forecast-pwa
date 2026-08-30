<script setup lang="ts">
interface BarSeries {
  label: string
  color: string
  values: number[]
}

const weeks: string[] = ['agosto - Semana 1', 'agosto - Semana 2', 'agosto - Semana 3', 'agosto - Semana 4']

const series: BarSeries[] = [
  { label: 'Meta Rendimento', color: '#0288d1', values: [700, 700, 700, 700] },
  { label: 'Meta Acumulada', color: '#0091ea', values: [700, 1400, 2100, 2800] },
  { label: 'Resultado Realizado', color: '#00b0ff', values: [-600, 1600, -600, 2500] },
  { label: 'Devido Chris', color: '#4fc3f7', values: [0, 600, 0, 1000] },
  { label: 'Devido Vânia', color: '#81d4fa', values: [0, 600, 0, 1000] },
  { label: '% Meta Atingida', color: '#b3e5fc', values: [0, 50, 0, 90] }
]

const minVal: number = -1000
const maxVal: number = 3000
const svgHeight: number = 200

const getYCoordinate = (val: number): number => {
  const percentage = (val - minVal) / (maxVal - minVal)
  return svgHeight - (percentage * svgHeight)
}

const zeroY: number = getYCoordinate(0)
</script>

<template>
  <div class="bg-white p-4 border border-slate-200 rounded-sm flex flex-col md:flex-row gap-4">
    <!-- SVG Chart Area -->
    <div class="flex-1">
      <svg viewBox="0 0 600 220" class="w-full h-64 overflow-visible">
        <!-- Axis Grid Lines -->
        <g stroke="#e2e8f0" stroke-dasharray="2" stroke-width="1">
          <line x1="40" :y1="getYCoordinate(3000)" x2="580" :y2="getYCoordinate(3000)" />
          <line x1="40" :y1="getYCoordinate(2000)" x2="580" :y2="getYCoordinate(2000)" />
          <line x1="40" :y1="getYCoordinate(1000)" x2="580" :y2="getYCoordinate(1000)" />
          <line x1="40" :y1="zeroY" x2="580" :y2="zeroY" stroke="#94a3b8" stroke-dasharray="0" stroke-width="1.5" />
          <line x1="40" :y1="getYCoordinate(-1000)" x2="580" :y2="getYCoordinate(-1000)" />
        </g>

        <!-- Y Axis Labels -->
        <g font-size="10" fill="#64748b" text-anchor="end">
          <text x="35" :y="getYCoordinate(3000) + 4">3000</text>
          <text x="35" :y="getYCoordinate(2000) + 4">2000</text>
          <text x="35" :y="getYCoordinate(1000) + 4">1000</text>
          <text x="35" :y="zeroY + 4">0</text>
          <text x="35" :y="getYCoordinate(-1000) + 4">-1000</text>
        </g>

        <!-- Grouped Bars -->
        <g v-for="(week, wIdx) in weeks" :key="week">
          <g v-for="(s, sIdx) in series" :key="s.label">
            <rect
              :x="60 + (wIdx * 130) + (sIdx * 16)"
              :y="s.values[wIdx] >= 0 ? getYCoordinate(s.values[wIdx]) : zeroY"
              width="14"
              :height="Math.abs(getYCoordinate(s.values[wIdx]) - zeroY)"
              :fill="s.color"
              rx="1"
            />
          </g>
          <!-- X Axis Label -->
          <text 
            :x="60 + (wIdx * 130) + 45" 
            y="215" 
            font-size="11" 
            fill="#0288d1" 
            text-anchor="middle" 
            font-weight="500"
          >
            {{ week }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Chart Legend -->
    <div class="w-full md:w-48 flex flex-col justify-center space-y-2 text-xs text-slate-600 border-l border-slate-100 pl-4">
      <div v-for="item in series" :key="item.label" class="flex items-center space-x-2">
        <span class="w-3 h-3 rounded-xs flex-shrink-0" :style="{ backgroundColor: item.color }" />
        <span class="truncate">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>