import type { ReactNode } from 'react'
import { Text, useWindowDimensions } from 'react-native'
import { tipo } from '../tokens'

type Props = { children: ReactNode; tamanho?: 'grande' | 'medio'; nivel?: 1 | 2 | 3 }

/** Display condensado em caixa alta. `grande`: 32 no mobile, 56 a partir de 1024px. */
export function Titulo({ children, tamanho = 'medio', nivel = 2 }: Props) {
  const { width } = useWindowDimensions()
  const fontSize = tamanho === 'grande' ? (width >= 1024 ? 56 : 32) : 22
  // role="heading": traço de cabeçalho no VoiceOver e <hN> na web. O RN 0.86 não tipa aria-level,
  // por isso ele entra por spread (sem ele o react-native-web gera sempre <h1>)
  return (
    <Text role="heading" {...{ 'aria-level': nivel }} style={[tipo.display, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}>
      {children}
    </Text>
  )
}
