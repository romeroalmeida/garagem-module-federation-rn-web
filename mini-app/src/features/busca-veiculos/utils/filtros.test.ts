import { describe, expect, it } from 'vitest'
import { FILTROS_VAZIOS, chipsAtivos, contarFiltrosAtivos, lerNumero, normalizarFiltros } from './filtros'

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

describe('normalizarFiltros com ordem', () => {
  it('mantém ordem válida e descarta desconhecida', () => {
    expect(normalizarFiltros({ texto: '', marcas: [], ordem: 'menor-preco' }, marcas).ordem).toBe('menor-preco')
    expect(normalizarFiltros({ texto: '', marcas: [], ordem: 'xyz' as never }, marcas).ordem).toBeUndefined()
  })
})

describe('chipsAtivos', () => {
  const f = { texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 120000, anoMin: 2019, kmMax: 80000, ordem: 'menor-preco' as const }

  it('um chip por marca e por limite, sem texto nem ordem', () => {
    expect(chipsAtivos(f).map((c) => c.rotulo)).toEqual(['Honda', 'Toyota', 'Até R$\u00A0120.000', 'A partir de 2019', 'Até 80.000 km'])
  })

  it('cada chip sabe os filtros sem ele', () => {
    const [honda, , preco] = chipsAtivos(f)
    expect(honda.sem.marcas).toEqual(['Toyota'])
    expect(preco.sem).toEqual({ ...f, precoMax: undefined })
  })
})
