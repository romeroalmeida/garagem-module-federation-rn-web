import { Component, Suspense, lazy, type CSSProperties, type ReactNode } from 'react'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from './Fronteira'

// No escopo do módulo: voltar do detalhe não pisca "Carregando busca…"
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div style={estilos.centro}>
        <p>Busca indisponível</p>
        {/* ponytail: o runtime do MF guarda a falha do módulo; recarregar é o único retry que funciona */}
        <button type="button" onClick={() => window.location.reload()}>
          Tentar de novo
        </button>
      </div>
    )
  }
}

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira>
      <LimiteDeErro>
        <Suspense fallback={<p style={estilos.centro}>Carregando busca…</p>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
