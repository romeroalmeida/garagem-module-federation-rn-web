// imports dentro do declare module: no topo viraria augmentation (TS2664)
declare module 'busca/BuscaVeiculos' {
  import type { ComponentType } from 'react'
  import type { BuscaVeiculosProps } from '@busca/tipos'

  const BuscaVeiculos: ComponentType<BuscaVeiculosProps>
  export default BuscaVeiculos
}
