import type { Veiculo } from '@busca/tipos'

/** Mapa das telas da pilha; fica em shared porque as duas features e o app usam. */
export type Rotas = {
  Busca: undefined
  Veiculo: { veiculo: Veiculo }
}
