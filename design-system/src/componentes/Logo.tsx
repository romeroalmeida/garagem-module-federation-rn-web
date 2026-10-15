import { StyleSheet, Text, View } from 'react-native'
import { cores, tipo } from '../tokens'

/**
 * Placa Mercosul estilizada (proporção ~3:1): a faixa azul vira accent, sem brasão nem bandeira.
 * Placa branca de propósito: lê igual sobre o header claro e sobre o rodapé escuro.
 */
export function Logo() {
  return (
    <View style={estilos.placa}>
      <View style={estilos.faixa} />
      <Text style={estilos.texto}>Garagem</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  placa: {
    alignSelf: 'flex-start',
    height: 34,
    paddingHorizontal: 10,
    paddingTop: 6,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.ink,
    borderRadius: 4,
    backgroundColor: cores.bg,
    overflow: 'hidden',
  },
  faixa: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: cores.accent },
  texto: { ...tipo.display, fontSize: 16, lineHeight: 20, letterSpacing: 1.5 },
})
