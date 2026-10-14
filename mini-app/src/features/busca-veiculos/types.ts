export type Veiculo = {
  id: string
  marca: string
  modelo: string
  versao: string
  ano: number
  km: number
  preco: number
  cidade: string
  uf: string
}

export type Filtros = {
  texto: string
  marcas: string[]
  precoMax?: number
  anoMin?: number
  kmMax?: number
}

export type BuscaVeiculosProps = {
  filtrosIniciais?: Filtros
  onFiltrosMudaram?: (filtros: Filtros) => void
  onSelecionarVeiculo: (veiculo: Veiculo) => void
}
