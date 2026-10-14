import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { cores, raios } from '../tokens'

type Props = {
  children: ReactNode
  onPress?: () => void
  /** nome acessível quando o card é tocável */
  rotulo?: string
}

/** Raio 16, borda `line`, sem sombra. Com `onPress` vira botão. */
export function Card({ children, onPress, rotulo }: Props) {
  if (!onPress) return <View style={estilos.card}>{children}</View>
  return (
    <Pressable role="button" aria-label={rotulo} onPress={onPress} style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}>
      {children}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  card: { borderRadius: raios.card, borderWidth: 1, borderColor: cores.line, backgroundColor: cores.bg, overflow: 'hidden' },
  pressionado: { opacity: 0.85 },
})
