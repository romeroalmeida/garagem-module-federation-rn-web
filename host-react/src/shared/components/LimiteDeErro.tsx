import { Component, type CSSProperties, type ReactNode } from 'react'

type Props = { mensagem: string; children: ReactNode }

/** A falha de um remote fica dentro da caixa dele; o resto da página segue. */
export class LimiteDeErro extends Component<Props, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div style={estilos.centro} role="alert">
        <p>{this.props.mensagem}</p>
        {/* ponytail: o runtime do MF guarda a falha do módulo; recarregar é o único retry que funciona */}
        <button type="button" onClick={() => window.location.reload()}>
          Tentar de novo
        </button>
      </div>
    )
  }
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
