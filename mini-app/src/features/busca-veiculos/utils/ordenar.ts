import type { Ordem, Veiculo } from '../types'

export const ORDENS: readonly Ordem[] = ['relevancia', 'menor-preco', 'maior-preco', 'menor-km', 'mais-novos']

export const ROTULOS_ORDEM: Record<Ordem, string> = {
  relevancia: 'Mais relevantes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'menor-km': 'Menor km',
  'mais-novos': 'Mais novos',
}

const COMPARADORES: Record<Exclude<Ordem, 'relevancia'>, (a: Veiculo, b: Veiculo) => number> = {
  'menor-preco': (a, b) => a.preco - b.preco,
  'maior-preco': (a, b) => b.preco - a.preco,
  'menor-km': (a, b) => a.km - b.km,
  'mais-novos': (a, b) => b.ano - a.ano,
}

/** Cópia ordenada (sort estável); relevância = ordem dos dados. */
export function ordenarVeiculos(veiculos: Veiculo[], ordem: Ordem | undefined): Veiculo[] {
  if (!ordem || ordem === 'relevancia') return veiculos
  return [...veiculos].sort(COMPARADORES[ordem])
}
