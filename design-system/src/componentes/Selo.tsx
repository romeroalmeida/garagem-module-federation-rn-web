import { StyleSheet, Text, View } from 'react-native'
import { cores, raios, tipo } from '../tokens'

type Props = { texto: string; tom?: 'positivo' | 'neutro' }

export function Selo({ texto, tom = 'neutro' }: Props) {
  return (
    <View style={[estilos.base, tom === 'positivo' ? estilos.positivo : estilos.neutro]}>
      <Text style={[tipo.corpoForte, estilos.texto]}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: raios.pilula },
  positivo: { backgroundColor: cores.accentSoft },
  neutro: { backgroundColor: cores.surface },
  texto: { fontSize: 13 },
})
