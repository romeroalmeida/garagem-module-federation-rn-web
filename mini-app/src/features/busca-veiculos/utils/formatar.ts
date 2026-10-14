const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const inteiro = new Intl.NumberFormat('pt-BR')

// Intl.NumberFormat insere um espaço não separável (U+00A0) entre "R$" e o número; normaliza para espaço comum.
export const formatarPreco = (n: number) => moeda.format(n).replace(' ', ' ')
export const formatarKm = (n: number) => `${inteiro.format(n)} km`
export const formatarResultado = (n: number) =>
  n === 1 ? '1 carro encontrado' : `${n} carros encontrados`
export const formatarVerCarros = (n: number) => (n === 1 ? 'Ver 1 carro' : `Ver ${n} carros`)
