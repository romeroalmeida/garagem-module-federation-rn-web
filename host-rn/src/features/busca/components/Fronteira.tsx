import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/** Só visual: mostra no estudo onde termina o host e começa o remote. */
export function Fronteira({ children }: { children: ReactNode }) {
  return (
    <View style={estilos.borda}>
      <Text style={estilos.etiqueta}>remote: busca</Text>
      {children}
    </View>
  )
}

const estilos = StyleSheet.create({
  borda: { flex: 1, margin: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#7c3aed', borderRadius: 8 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: '600', color: '#7c3aed' },
})
