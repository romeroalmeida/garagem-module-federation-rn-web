export type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'
export type Cambio = 'manual' | 'automatico'
export type Combustivel = 'flex' | 'diesel' | 'eletrico'
export type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco' | 'menor-km' | 'mais-novos'
export type Cor = 'prata' | 'preto' | 'branco' | 'cinza' | 'vermelho' | 'azul' | 'verde' | 'amarelo' | 'laranja' | 'marrom' | 'bege' | 'vinho'
/** número = asset do bundle nativo; { uri } = URL (na web, o asset/resource dá a URL) */
export type FonteImagem = number | { uri: string; width?: number; height?: number }
export type CreditoFoto = { autor: string; licenca: string; licencaUrl: string; fonte: string }

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
  cor: Cor
  foto?: FonteImagem
  creditoFoto?: CreditoFoto
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
