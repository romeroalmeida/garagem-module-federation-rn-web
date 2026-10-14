import { describe, expect, it } from 'vitest'
import type { Filtros } from '@busca/tipos'
import { gravarFiltros, lerFiltros } from './filtrosUrl'

describe('filtrosUrl', () => {
  it('ida e volta preserva os filtros', () => {
    const filtros: Filtros = { texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 120000, anoMin: 2019, kmMax: 80000 }
    expect(lerFiltros(gravarFiltros(filtros))).toEqual(filtros)
  })

  it('omite o que está vazio', () => {
    expect(gravarFiltros({ texto: '', marcas: [] }).toString()).toBe('')
    expect(gravarFiltros({ texto: 'gol', marcas: [], kmMax: 50000 }).toString()).toBe('q=gol&kmMax=50000')
  })

  it('URL vazia vira filtros vazios', () => {
    expect(lerFiltros(new URLSearchParams())).toEqual({ texto: '', marcas: [] })
  })

  it('ignora número inválido ou negativo', () => {
    const f = lerFiltros(new URLSearchParams('precoMax=abc&anoMin=-1&kmMax=50000'))
    expect(f.precoMax).toBeUndefined()
    expect(f.anoMin).toBeUndefined()
    expect(f.kmMax).toBe(50000)
  })
})
