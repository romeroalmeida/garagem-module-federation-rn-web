import { describe, expect, it } from 'vitest'
import { FILTROS_VAZIOS, contarFiltrosAtivos, lerNumero, normalizarFiltros } from './filtros'

const marcas = ['Honda', 'Toyota']

describe('normalizarFiltros', () => {
  it('sem filtros iniciais devolve vazio', () => {
    expect(normalizarFiltros(undefined, marcas)).toEqual(FILTROS_VAZIOS)
  })

  it('descarta marca que não existe nos dados', () => {
    expect(normalizarFiltros({ texto: 'x', marcas: ['Honda', 'Ferrari'] }, marcas).marcas).toEqual(['Honda'])
  })

  it('descarta número negativo ou não finito', () => {
    const r = normalizarFiltros({ texto: '', marcas: [], precoMax: -1, anoMin: Number.NaN, kmMax: 50000 }, marcas)
    expect(r).toEqual({ texto: '', marcas: [], precoMax: undefined, anoMin: undefined, kmMax: 50000 })
  })
})

describe('contarFiltrosAtivos', () => {
  it('marca conta como um filtro; texto não conta', () => {
    expect(contarFiltrosAtivos({ texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 1 })).toBe(2)
    expect(contarFiltrosAtivos(FILTROS_VAZIOS)).toBe(0)
  })
})

describe('lerNumero', () => {
  it('mantém só dígitos; vazio vira undefined', () => {
    expect(lerNumero('120.000')).toBe(120000)
    expect(lerNumero('abc')).toBeUndefined()
    expect(lerNumero('')).toBeUndefined()
  })
})
