import { describe, expect, it } from 'vitest'
import { entradaValida, lerNumero, limitesEntrada } from './entrada'

describe('limitesEntrada', () => {
  it('20% e 90% do preço, em reais inteiros', () => {
    expect(limitesEntrada(112900)).toEqual({ min: 22580, max: 101610 })
    expect(limitesEntrada(99999)).toEqual({ min: 20000, max: 89999 })
  })
})

describe('entradaValida', () => {
  it('é inclusiva nos dois limites', () => {
    expect(entradaValida(22580, 112900)).toBe(true)
    expect(entradaValida(101610, 112900)).toBe(true)
  })

  it('é falsa fora dos limites e sem valor', () => {
    expect(entradaValida(22579, 112900)).toBe(false)
    expect(entradaValida(101611, 112900)).toBe(false)
    expect(entradaValida(undefined, 112900)).toBe(false)
  })
})

describe('lerNumero', () => {
  it('mantém só dígitos; vazio vira undefined', () => {
    expect(lerNumero('30.000')).toBe(30000)
    expect(lerNumero('abc')).toBeUndefined()
    expect(lerNumero('')).toBeUndefined()
  })
})
