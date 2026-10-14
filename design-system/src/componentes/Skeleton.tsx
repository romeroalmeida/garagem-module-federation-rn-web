import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Platform, StyleSheet, type DimensionValue } from 'react-native'
import { cores } from '../tokens'

type Props = { largura: DimensionValue; altura: DimensionValue; raio?: number }

/** Bloco pulsando no lugar do conteúdo; parado se o sistema pede menos movimento. */
export function Skeleton({ largura, altura, raio = 8 }: Props) {
  const opacidade = useRef(new Animated.Value(1)).current
  // null = ainda não sabemos; só anima depois de confirmar que o sistema não pede menos movimento
  const [reduzir, setReduzir] = useState<boolean | null>(null)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzir)
  }, [])

  useEffect(() => {
    if (reduzir !== false) return
    const nativo = Platform.OS !== 'web'
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.5, duration: 450, useNativeDriver: nativo }),
        Animated.timing(opacidade, { toValue: 1, duration: 450, useNativeDriver: nativo }),
      ]),
    )
    pulso.start()
    return () => pulso.stop()
  }, [reduzir, opacidade])

  return <Animated.View aria-hidden style={[estilos.base, { width: largura, height: altura, borderRadius: raio, opacity: opacidade }]} />
}

const estilos = StyleSheet.create({
  base: { backgroundColor: cores.carStage },
})
