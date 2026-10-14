import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  nome: string
  /** flex: 1 — só para a busca, que ocupa a tela; dentro de ScrollView o flex: 1 colapsa para altura zero */
  preencher?: boolean
  children: ReactNode
}

/** Só visual: mostra no estudo onde termina o host e começa cada remote. */
export function Fronteira({ nome, preencher = false, children }: Props) {
  return (
    <View style={[estilos.borda, preencher && estilos.preencher]}>
      <Text style={estilos.etiqueta}>remote: {nome}</Text>
      {children}
    </View>
  )
}

const estilos = StyleSheet.create({
  borda: { margin: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#7c3aed', borderRadius: 8 },
  preencher: { flex: 1 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: '600', color: '#7c3aed' },
})
