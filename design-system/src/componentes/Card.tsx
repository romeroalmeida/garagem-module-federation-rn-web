import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { cores, raios, sombras } from '../tokens'

type Props = {
  children: ReactNode
  onPress?: () => void
  /** nome acessível quando o card é tocável */
  rotulo?: string
}

/** Branco, raio 16, sombra suave. Com `onPress` vira botão e sobe 2px no hover (web). */
export function Card({ children, onPress, rotulo }: Props) {
  const [elevado, setElevado] = useState(false)
  // o recorte (overflow) fica num View interno: no iOS, overflow no mesmo View cortaria a sombra
  const conteudo = <View style={estilos.recorte}>{children}</View>
  if (!onPress) return <View style={estilos.card}>{conteudo}</View>
  return (
    <Pressable
      role="button"
      aria-label={rotulo}
      onPress={onPress}
      onHoverIn={() => setElevado(true)}
      onHoverOut={() => setElevado(false)}
      style={({ pressed }) => [estilos.card, elevado && estilos.elevado, pressed && estilos.pressionado]}
    >
      {conteudo}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  card: { borderRadius: raios.card, backgroundColor: cores.bg, boxShadow: sombras.card },
  recorte: { borderRadius: raios.card, overflow: 'hidden' },
  elevado: { boxShadow: sombras.elevada, transform: [{ translateY: -2 }] },
  pressionado: { opacity: 0.9 },
})
