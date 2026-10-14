import { describe, expect, it } from 'vitest'
import { formatarKm, formatarPreco, formatarResultado, formatarVerCarros } from './formatar'

describe('formatar', () => {
  it('preço em reais sem centavos', () => {
    expect(formatarPreco(112900)).toBe('R$ 112.900')
  })

  it('km com separador de milhar', () => {
    expect(formatarKm(45000)).toBe('45.000 km')
  })

  it('singular e plural', () => {
    expect(formatarResultado(1)).toBe('1 carro encontrado')
    expect(formatarResultado(12)).toBe('12 carros encontrados')
    expect(formatarVerCarros(1)).toBe('Ver 1 carro')
    expect(formatarVerCarros(0)).toBe('Ver 0 carros')
  })
})
