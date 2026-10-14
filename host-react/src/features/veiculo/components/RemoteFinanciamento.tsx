import { Suspense, lazy, type CSSProperties } from 'react'
import type { SimuladorProps } from '@financiamento/tipos'
import { Skeleton } from '@garagem/ds'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: abrir outro carro não baixa o remote de novo
const Simulador = lazy(() => import('financiamento/Simulador'))

export function RemoteFinanciamento(props: SimuladorProps) {
  return (
    <Fronteira nome="financiamento">
      <LimiteDeErro mensagem="Simulador indisponível">
        <Suspense
          fallback={
            <div style={estilos.carregando} aria-busy="true" aria-label="Carregando simulador">
              <Skeleton largura="100%" altura={460} raio={16} />
            </div>
          }
        >
          <Simulador {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = {
  carregando: { padding: 8 },
} satisfies Record<string, CSSProperties>
