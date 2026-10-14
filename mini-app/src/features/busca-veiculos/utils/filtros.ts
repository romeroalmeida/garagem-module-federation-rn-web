import type { Filtros } from '../types'
import { formatarKm, formatarPreco } from './formatar'
import { ORDENS } from './ordenar'

export const FILTROS_VAZIOS: Filtros = { texto: '', marcas: [] }

const limite = (n: number | undefined) =>
  n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined

/** Limpa os filtros que chegam do host: marcas inexistentes e números inválidos saem. */
export function normalizarFiltros(filtros: Filtros | undefined, marcasExistentes: string[]): Filtros {
  if (!filtros) return FILTROS_VAZIOS
  return {
    texto: filtros.texto,
    marcas: filtros.marcas.filter((m) => marcasExistentes.includes(m)),
    precoMax: limite(filtros.precoMax),
    anoMin: limite(filtros.anoMin),
    kmMax: limite(filtros.kmMax),
    ordem: filtros.ordem && ORDENS.includes(filtros.ordem) ? filtros.ordem : undefined,
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

export type ChipAtivo = { id: string; rotulo: string; sem: Filtros }

/** Um chip por filtro ativo do painel (texto e ordem ficam de fora), cada um com os filtros sem ele. */
export function chipsAtivos(f: Filtros): ChipAtivo[] {
  const chips: ChipAtivo[] = f.marcas.map((marca) => ({
    id: `marca-${marca}`,
    rotulo: marca,
    sem: { ...f, marcas: f.marcas.filter((m) => m !== marca) },
  }))
  if (f.precoMax !== undefined) chips.push({ id: 'preco', rotulo: `Até ${formatarPreco(f.precoMax)}`, sem: { ...f, precoMax: undefined } })
  if (f.anoMin !== undefined) chips.push({ id: 'ano', rotulo: `A partir de ${f.anoMin}`, sem: { ...f, anoMin: undefined } })
  if (f.kmMax !== undefined) chips.push({ id: 'km', rotulo: `Até ${formatarKm(f.kmMax)}`, sem: { ...f, kmMax: undefined } })
  return chips
}
