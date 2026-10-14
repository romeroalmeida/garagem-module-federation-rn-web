import { describe, expect, it } from 'vitest'
import type { Veiculo } from '../types'
import { ordenarVeiculos } from './ordenar'

const v = (id: string, preco: number, km: number, ano: number): Veiculo => ({
  id, marca: 'X', modelo: 'Y', versao: 'Z', ano, km, preco, cidade: 'C', uf: 'RJ',
  carroceria: 'hatch', cambio: 'manual', combustivel: 'flex', cor: 'prata',
})
const lista = [v('a', 100, 30, 2020), v('b', 50, 10, 2022), v('c', 100, 20, 2021)]
const ids = (l: Veiculo[]) => l.map((x) => x.id)

describe('ordenarVeiculos', () => {
  it('sem ordem ou relevância mantém a ordem dos dados', () => {
    expect(ids(ordenarVeiculos(lista, undefined))).toEqual(['a', 'b', 'c'])
    expect(ids(ordenarVeiculos(lista, 'relevancia'))).toEqual(['a', 'b', 'c'])
  })

  it('ordena por preço, km e ano, com empate estável', () => {
    expect(ids(ordenarVeiculos(lista, 'menor-preco'))).toEqual(['b', 'a', 'c'])
    expect(ids(ordenarVeiculos(lista, 'maior-preco'))).toEqual(['a', 'c', 'b'])
    expect(ids(ordenarVeiculos(lista, 'menor-km'))).toEqual(['b', 'c', 'a'])
    expect(ids(ordenarVeiculos(lista, 'mais-novos'))).toEqual(['b', 'c', 'a'])
  })

  it('não altera a lista recebida', () => {
    ordenarVeiculos(lista, 'menor-preco')
    expect(ids(lista)).toEqual(['a', 'b', 'c'])
  })
})
