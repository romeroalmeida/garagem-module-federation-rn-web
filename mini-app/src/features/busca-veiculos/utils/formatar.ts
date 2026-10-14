import type { Cor } from '../types'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  // mínimo explícito: só o máximo dá RangeError no Hermes do Android
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const inteiro = new Intl.NumberFormat('pt-BR')

export const formatarPreco = (n: number) => moeda.format(n)
export const formatarKm = (n: number) => `${inteiro.format(n)} km`
export const formatarResultado = (n: number) =>
  n === 1 ? '1 carro encontrado' : `${n} carros encontrados`
export const formatarVerCarros = (n: number) => (n === 1 ? 'Ver 1 carro' : `Ver ${n} carros`)

export const ROTULO_CAMBIO = { manual: 'Manual', automatico: 'Automático' } as const
export const ROTULO_COMBUSTIVEL = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' } as const
export const ROTULO_COR: Record<Cor, string> = {
  prata: 'Prata',
  preto: 'Preto',
  branco: 'Branco',
  cinza: 'Cinza',
  vermelho: 'Vermelho',
  azul: 'Azul',
  verde: 'Verde',
  amarelo: 'Amarelo',
  laranja: 'Laranja',
  marrom: 'Marrom',
  bege: 'Bege',
  vinho: 'Vinho',
}
