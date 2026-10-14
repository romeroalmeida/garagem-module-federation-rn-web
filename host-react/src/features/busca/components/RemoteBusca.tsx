import { Suspense, lazy, type CSSProperties } from 'react'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: voltar do detalhe não pisca "Carregando busca…"
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira nome="busca">
      <LimiteDeErro mensagem="Busca indisponível">
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
