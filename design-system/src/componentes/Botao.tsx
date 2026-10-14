import { Pressable, StyleSheet, Text } from 'react-native'
import { cores, raios, tipo } from '../tokens'

type Props = {
  rotulo: string
  onPress: () => void
  variante?: 'primario' | 'acao' | 'contorno'
  desabilitado?: boolean
}

/** 48px, raio 12. `acao` = accent com texto ink (accent só aparece onde há ação). */
export function Botao({ rotulo, onPress, variante = 'primario', desabilitado = false }: Props) {
  return (
    <Pressable
      role="button"
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [estilos.base, estilos[variante], pressed && estilos.pressionado, desabilitado && estilos.desabilitado]}
    >
      <Text style={[tipo.corpoForte, estilos.texto, variante === 'primario' && estilos.textoClaro]}>{rotulo}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: raios.botao,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.ink, borderColor: cores.ink },
  acao: { backgroundColor: cores.accent, borderColor: cores.accent },
  contorno: { backgroundColor: cores.bg, borderColor: cores.ink },
  pressionado: { opacity: 0.8 },
  desabilitado: { opacity: 0.4 },
  texto: { color: cores.ink, textAlign: 'center' },
  textoClaro: { color: cores.bg },
})
