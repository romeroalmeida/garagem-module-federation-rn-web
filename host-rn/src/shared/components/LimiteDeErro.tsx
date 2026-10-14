import { Component, type ReactNode } from 'react'
import { DevSettings, Pressable, StyleSheet, Text, View } from 'react-native'

type Props = { mensagem: string; children: ReactNode }

/** A falha de um remote fica dentro da caixa dele; o resto da tela segue. */
export class LimiteDeErro extends Component<Props, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <View style={estilos.centro} role="alert">
        <Text style={estilos.titulo}>{this.props.mensagem}</Text>
        {/* ponytail: o runtime do MF guarda a falha; recarregar o app (só em dev) é o único retry que funciona.
            No dev, feche o LogBox para ver esta tela. */}
        <Pressable role="button" style={estilos.botao} onPress={() => DevSettings.reload()}>
          <Text style={estilos.botaoTexto}>Tentar de novo</Text>
        </Pressable>
      </View>
    )
  }
}

const estilos = StyleSheet.create({
  // flexGrow (não flex: 1): centraliza na caixa da busca e, dentro do ScrollView do detalhe,
  // fica do tamanho do conteúdo em vez de colapsar
  centro: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  titulo: { fontSize: 16, fontWeight: '600' },
  botao: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
})
