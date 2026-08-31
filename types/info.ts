export interface InfoGeralItem {
    descricao: string
    valor: string
    destaque?: boolean
  }
  
  export interface PrincipalItem {
    id?: string
    data: string
    valor: string | number
    observacoes?: string | null
    origem?: string | null
  }
  
  export interface LancamentoItem {
    semanaRef: string
    sacado: string
    valorDevido: string
    retiradas: string
    data: string
    status: 'Concluído' | 'Pendente' | 'Cancelado'
  }
  
  export interface ForecastItem {
    semana: string
    semanaNum: number
    metaRendimento: string
    metaAcumulada: string
    resultadoRealizado: string
    devidoChris: string
    devidoVania: string
    metaAtingidaPct: string
    isNegative?: boolean
  }