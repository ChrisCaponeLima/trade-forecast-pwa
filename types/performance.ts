export interface OperacaoPerformance {
  id: string
  ativo: string
  abertura: string | Date
  fechamento: string | Date
  qtdCompra: number
  qtdVenda: number
  resIntervaloBruto: number
  lotes: number
  criadoEm?: string | Date
}