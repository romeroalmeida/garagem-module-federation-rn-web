import { StyleSheet, TextInput, type TextInputProps } from 'react-native'
import { cores, raios, tipo } from '../tokens'

/** Campo de texto preenchido (sem contorno); o foco usa o anel global da web. */
export function Campo({ style, ...props }: TextInputProps) {
  return <TextInput placeholderTextColor={cores.inkSoft} {...props} style={[tipo.corpo, estilos.base, style]} />
}

const estilos = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: 14, borderRadius: raios.botao, backgroundColor: cores.surface },
})
