import { StyleSheet, Text, View } from 'react-native'
import BuscaVeiculos from '@/features/busca-veiculos'

export function App() {
  return (
    <View style={estilos.raiz}>
      <Text style={estilos.aviso}>mini-app busca · modo standalone (sem host)</Text>
      <BuscaVeiculos
        onFiltrosMudaram={(filtros) => console.log('[busca] filtros', filtros)}
        onSelecionarVeiculo={(veiculo) => console.log('[busca] selecionado', veiculo)}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  aviso: { padding: 8, textAlign: 'center', backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12 },
})
