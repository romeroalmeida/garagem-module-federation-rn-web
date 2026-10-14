import { Suspense, lazy, type CSSProperties } from 'react'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Skeleton } from '@garagem/ds'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: voltar do detalhe não pisca "Carregando busca…"
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira nome="busca">
      <LimiteDeErro mensagem="Busca indisponível">
        <Suspense fallback={<CarregandoBusca />}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

function CarregandoBusca() {
  return (
    <div style={estilos.carregando} role="progressbar" aria-label="Carregando busca">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} largura="100%" altura={300} raio={16} />
      ))}
    </div>
  )
}

const estilos = {
  carregando: { display: 'grid', gap: 16, padding: 16 },
} satisfies Record<string, CSSProperties>
