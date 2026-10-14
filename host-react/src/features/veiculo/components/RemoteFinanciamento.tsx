import { Suspense, lazy, type CSSProperties } from 'react'
import type { SimuladorProps } from '@financiamento/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: abrir outro carro não baixa o remote de novo
const Simulador = lazy(() => import('financiamento/Simulador'))

export function RemoteFinanciamento(props: SimuladorProps) {
  return (
    <Fronteira nome="financiamento">
      <LimiteDeErro mensagem="Simulador indisponível">
        <Suspense fallback={<p style={estilos.centro}>Carregando simulador…</p>}>
          <Simulador {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
