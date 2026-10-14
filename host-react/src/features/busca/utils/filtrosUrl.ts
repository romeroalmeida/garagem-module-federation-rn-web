import type { Filtros } from '@busca/tipos'

const numero = (valor: string | null) => {
  if (valor === null || valor.trim() === '') return undefined
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/** URL → Filtros. Valor inválido é ignorado (vira "sem limite"). */
export function lerFiltros(params: URLSearchParams): Filtros {
  return {
    texto: params.get('q') ?? '',
    marcas: (params.get('marcas') ?? '').split(',').map((m) => m.trim()).filter(Boolean),
    precoMax: numero(params.get('precoMax')),
    anoMin: numero(params.get('anoMin')),
    kmMax: numero(params.get('kmMax')),
  }
}

/** Filtros → URL, omitindo o que está vazio. */
export function gravarFiltros(filtros: Filtros): URLSearchParams {
  const params = new URLSearchParams()
  if (filtros.texto) params.set('q', filtros.texto)
  if (filtros.marcas.length > 0) params.set('marcas', filtros.marcas.join(','))
  if (filtros.precoMax !== undefined) params.set('precoMax', String(filtros.precoMax))
  if (filtros.anoMin !== undefined) params.set('anoMin', String(filtros.anoMin))
  if (filtros.kmMax !== undefined) params.set('kmMax', String(filtros.kmMax))
  return params
}
