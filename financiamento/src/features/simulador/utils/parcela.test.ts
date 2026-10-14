import { describe, expect, it } from 'vitest'
import { calcularParcela } from './parcela'

describe('calcularParcela', () => {
  it('bate com os valores de referência (R$ 112.900, entrada R$ 22.580, 1,49% a.m.)', () => {
    expect(calcularParcela(112900, 22580, 12)).toBe(8275.38)
    expect(calcularParcela(112900, 22580, 48)).toBe(2647.49)
    expect(calcularParcela(112900, 22580, 60)).toBe(2287.64)
  })

  it('devolve o valor já arredondado para centavos', () => {
    const parcela = calcularParcela(99999, 20000, 36)
    expect(parcela).toBe(Math.round(parcela * 100) / 100)
  })
})
