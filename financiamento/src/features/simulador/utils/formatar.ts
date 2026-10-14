// mínimos explícitos: no `reais`, só o máximo (0 < mínimo padrão do BRL) dá RangeError no Hermes do Android;
// no percentual, fixa as duas casas ("1,50%")
const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const reais = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const percentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatarMoeda = (n: number) => moeda.format(n)
export const formatarReais = (n: number) => reais.format(n)
export const formatarTaxa = (taxa: number) => `${percentual.format(taxa)} a.m.`
