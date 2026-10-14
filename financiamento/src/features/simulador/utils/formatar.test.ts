import { describe, expect, it } from 'vitest'
import { formatarMoeda, formatarReais, formatarTaxa } from './formatar'

describe('formatar', () => {
  it('moeda com centavos (parcela)', () => {
    expect(formatarMoeda(2647.49)).toBe('R$\u00A02.647,49')
  })

  it('reais sem centavos (preço do carro)', () => {
    expect(formatarReais(112900)).toBe('R$\u00A0112.900')
  })

  it('taxa mensal', () => {
    expect(formatarTaxa(0.0149)).toBe('1,49% a.m.')
  })
})
