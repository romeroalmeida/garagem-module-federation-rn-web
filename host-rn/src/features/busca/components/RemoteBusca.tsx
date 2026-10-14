import { Component, Suspense, lazy, type ReactNode } from 'react'
import { DevSettings, Pressable, StyleSheet, Text, View } from 'react-native'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from './Fronteira'

// No escopo do módulo: só baixa o remote uma vez
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <View style={estilos.centro} role="alert">
        <Text style={estilos.titulo}>Busca indisponível</Text>
        {/* ponytail: o runtime do MF guarda a falha; recarregar o app (só em dev) é o único retry que funciona */}
        <Pressable role="button" style={estilos.botao} onPress={() => DevSettings.reload()}>
          <Text style={estilos.botaoTexto}>Tentar de novo</Text>
        </Pressable>
      </View>
    )
  }
}

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira>
      <LimiteDeErro>
        <Suspense fallback={<Text style={estilos.carregando}>Carregando busca…</Text>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titulo: { fontSize: 16, fontWeight: '600' },
  botao: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
  carregando: { padding: 32, textAlign: 'center' },
})
