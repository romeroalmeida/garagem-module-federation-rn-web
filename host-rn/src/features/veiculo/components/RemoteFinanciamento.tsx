import { Suspense, lazy } from 'react'
import { StyleSheet, Text } from 'react-native'
import type { SimuladorProps } from '@financiamento/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// Mesmo cuidado da busca: no nativo a falha resolve { default: undefined } em vez de rejeitar
const Simulador = lazy(() =>
  import('financiamento/Simulador').then((m) => {
    if (!m.default) throw new Error('remote financiamento indisponível')
    return m
  }),
)

export function RemoteFinanciamento(props: SimuladorProps) {
  return (
    <Fronteira nome="financiamento">
      <LimiteDeErro mensagem="Simulador indisponível">
        <Suspense fallback={<Text style={estilos.carregando}>Carregando simulador…</Text>}>
          <Simulador {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  carregando: { padding: 32, textAlign: 'center' },
})
