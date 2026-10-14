import { describe, expect, it } from 'vitest'
import type { Filtros, Veiculo } from '../types'
import { filtrarVeiculos } from './filtrarVeiculos'

const carro = (parcial: Partial<Veiculo> & Pick<Veiculo, 'id'>): Veiculo => ({
  marca: 'Honda', modelo: 'Civic', versao: 'EXL 2.0', ano: 2020, km: 45000,
  preco: 100000, cidade: 'Volta Redonda', uf: 'RJ', ...parcial,
})

const veiculos: Veiculo[] = [
  carro({ id: 'civic' }),
  carro({ id: 'corolla', marca: 'Toyota', modelo: 'Corolla', versao: 'XEi 2.0', ano: 2021, km: 30000, preco: 128500 }),
  carro({ id: 'c3', marca: 'Citroën', modelo: 'C3', versao: 'Feel 1.6', ano: 2019, km: 80000, preco: 60000 }),
]

const vazio: Filtros = { texto: '', marcas: [] }
const ids = (lista: Veiculo[]) => lista.map((v) => v.id)

describe('filtrarVeiculos', () => {
  it('sem filtros devolve tudo', () => {
    expect(ids(filtrarVeiculos(veiculos, vazio))).toEqual(['civic', 'corolla', 'c3'])
  })

  it('texto ignora caixa e acento e procura em marca, modelo e versão', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: 'CITROEN' }))).toEqual(['c3'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: 'xei' }))).toEqual(['corolla'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: '  honda civic ' }))).toEqual(['civic'])
  })

  it('marcas marcadas combinam com OU', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, marcas: ['Honda', 'Toyota'] }))).toEqual(['civic', 'corolla'])
  })

  it('limites são inclusivos', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, precoMax: 100000 }))).toEqual(['civic', 'c3'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, anoMin: 2020 }))).toEqual(['civic', 'corolla'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, kmMax: 45000 }))).toEqual(['civic', 'corolla'])
  })

  it('filtros diferentes combinam com E', () => {
    const filtros: Filtros = { texto: '2.0', marcas: ['Honda', 'Toyota'], precoMax: 120000 }
    expect(ids(filtrarVeiculos(veiculos, filtros))).toEqual(['civic'])
  })
})
