import { Suspense, lazy } from 'react'
import { StyleSheet, Text } from 'react-native'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: só baixa o remote uma vez.
// Com o remote fora, o require protegido do Re.Pack (guardedRequire) reporta a falha como
// erro FATAL (LogBox cheio no dev; crash no release) e o import() resolve { default: undefined }.
// A guarda dá ao boundary um erro claro em vez do "Element type is invalid" do React.
const BuscaVeiculos = lazy(() =>
  import('busca/BuscaVeiculos').then((m) => {
    if (!m.default) throw new Error('remote busca indisponível')
    return m
  }),
)

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira nome="busca" preencher>
      <LimiteDeErro mensagem="Busca indisponível">
        <Suspense fallback={<Text style={estilos.carregando}>Carregando busca…</Text>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  carregando: { padding: 32, textAlign: 'center' },
})
