import type { ReactNode } from 'react'
import { Text, useWindowDimensions } from 'react-native'
import { tipo } from '../tokens'

type Props = { children: ReactNode; tamanho?: 'grande' | 'medio' }

/** Display condensado em caixa alta. `grande`: 32 no mobile, 56 a partir de 1024px. */
export function Titulo({ children, tamanho = 'medio' }: Props) {
  const { width } = useWindowDimensions()
  const fontSize = tamanho === 'grande' ? (width >= 1024 ? 56 : 32) : 22
  // sem role="heading": o RN 0.86 não tipa aria-level, e sem ele o react-native-web gera <h1>
  return <Text style={[tipo.display, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}>{children}</Text>
}
