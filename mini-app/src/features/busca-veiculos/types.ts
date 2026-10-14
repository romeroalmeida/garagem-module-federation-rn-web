export type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'
export type Cambio = 'manual' | 'automatico'
export type Combustivel = 'flex' | 'diesel' | 'eletrico'
export type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco' | 'menor-km' | 'mais-novos'

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
  carroceria: Carroceria
  cambio: Cambio
  combustivel: Combustivel
}

export type Filtros = {
  texto: string
  marcas: string[]
  precoMax?: number
  anoMin?: number
  kmMax?: number
  /** ausente = relevância (ordem dos dados) */
  ordem?: Ordem
}

export type BuscaVeiculosProps = {
  filtrosIniciais?: Filtros
  onFiltrosMudaram?: (filtros: Filtros) => void
  onSelecionarVeiculo: (veiculo: Veiculo) => void
}
