import type { Filtros } from '../types'

export const FILTROS_VAZIOS: Filtros = { texto: '', marcas: [] }

const limite = (n: number | undefined) =>
  n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined

/** Limpa os filtros que chegam do host: marcas inexistentes e números inválidos saem. */
export function normalizarFiltros(filtros: Filtros | undefined, marcasExistentes: string[]): Filtros {
  if (!filtros) return FILTROS_VAZIOS
  return {
    texto: filtros.texto ?? '',
    marcas: filtros.marcas.filter((m) => marcasExistentes.includes(m)),
    precoMax: limite(filtros.precoMax),
    anoMin: limite(filtros.anoMin),
    kmMax: limite(filtros.kmMax),
  }
}

/** Quantos filtros do painel estão ativos (marcas contam como um). */
export function contarFiltrosAtivos(f: Filtros): number {
  return (f.marcas.length > 0 ? 1 : 0) + [f.precoMax, f.anoMin, f.kmMax].filter((v) => v !== undefined).length
}

/** Texto digitado → número; descarta o que não é dígito. Vazio = sem limite. */
export function lerNumero(texto: string): number | undefined {
  const digitos = texto.replace(/\D/g, '')
  return digitos === '' ? undefined : Number(digitos)
}
