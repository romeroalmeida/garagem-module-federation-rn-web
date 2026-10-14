export type Prazo = 12 | 24 | 36 | 48 | 60

export type Simulacao = {
  preco: number
  entrada: number
  prazo: Prazo
  /** em reais, arredondada para centavos */
  parcela: number
  /** fixa e fictícia (0.0149) */
  taxaMensal: number
}

export type SimuladorProps = {
  preco: number
  onInteresse?: (simulacao: Simulacao) => void
}
