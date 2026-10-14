import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Rotas } from '@/shared/types/rotas'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const inteiro = new Intl.NumberFormat('pt-BR')

export function TelaVeiculo({ route, navigation }: NativeStackScreenProps<Rotas, 'Veiculo'>) {
  const { veiculo } = route.params

  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <View style={estilos.foto} aria-hidden={true}>
        <Text style={estilos.inicial}>{veiculo.marca[0]}</Text>
      </View>
      <Text style={estilos.nome}>
        {veiculo.marca} {veiculo.modelo}
      </Text>
      <Text style={estilos.versao}>{veiculo.versao}</Text>
      <Text style={estilos.preco}>{preco.format(veiculo.preco)}</Text>
      <Text style={estilos.detalhe}>
        {veiculo.ano} · {inteiro.format(veiculo.km)} km · {veiculo.cidade} - {veiculo.uf}
      </Text>
      <Pressable role="button" style={estilos.botao} onPress={() => navigation.goBack()}>
        <Text style={estilos.botaoTexto}>Voltar para a busca</Text>
      </Pressable>
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  tela: { padding: 20, gap: 8 },
  foto: { height: 200, borderRadius: 8, backgroundColor: '#e4e4e7', alignItems: 'center', justifyContent: 'center' },
  inicial: { fontSize: 64, fontWeight: '700', color: '#71717a' },
  nome: { fontSize: 24, fontWeight: '700', color: '#18181b' },
  versao: { fontSize: 16, color: '#52525b' },
  preco: { fontSize: 28, fontWeight: '700', color: '#18181b' },
  detalhe: { fontSize: 14, color: '#52525b' },
  botao: { marginTop: 16, alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
})
