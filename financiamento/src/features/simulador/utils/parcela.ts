import type { Prazo } from '../types'

export const PRAZOS: readonly Prazo[] = [12, 24, 36, 48, 60]
export const PRAZO_PADRAO: Prazo = 48
// ponytail: taxa fixa e fictícia; a real viria de uma API de crédito
export const TAXA_MENSAL = 0.0149

/** Tabela Price: parcela fixa, arredondada para centavos. */
export function calcularParcela(preco: number, entrada: number, prazo: Prazo, taxaMensal = TAXA_MENSAL): number {
  const financiado = preco - entrada
  const parcela = (financiado * taxaMensal) / (1 - (1 + taxaMensal) ** -prazo)
  return Math.round(parcela * 100) / 100
}
