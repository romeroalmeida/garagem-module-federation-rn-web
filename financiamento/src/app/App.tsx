import { ScrollView, StyleSheet, Text } from 'react-native'
import Simulador from '@/features/simulador'

export function App() {
  return (
    <ScrollView contentContainerStyle={estilos.raiz}>
      <Text style={estilos.aviso}>mini-app financiamento · modo standalone (sem host)</Text>
      <Simulador preco={112900} onInteresse={(simulacao) => console.log('[financiamento] interesse', simulacao)} />
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  raiz: { gap: 12, padding: 16, width: '100%', maxWidth: 520, alignSelf: 'center' },
  aviso: { padding: 8, textAlign: 'center', backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12 },
})
