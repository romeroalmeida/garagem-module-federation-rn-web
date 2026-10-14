import { Suspense, lazy } from 'react'
import { StyleSheet, View } from 'react-native'
import { Skeleton } from '@garagem/ds'
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
        <Suspense
          fallback={
            <View style={estilos.carregando}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} largura="100%" altura={300} raio={16} />
              ))}
            </View>
          }
        >
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  carregando: { gap: 16, padding: 16 },
})
