export interface InfoGeralItem {
    descricao: string
    valor: string
    destaque?: boolean
  }
  
  export interface PrincipalItem {
    data: string
    valor: string
    observacoes: string
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