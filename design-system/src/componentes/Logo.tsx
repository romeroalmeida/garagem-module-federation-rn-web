import { StyleSheet, Text } from 'react-native'
import { cores, tipo } from '../tokens'

type Props = {
  /** texto branco para o rodapé escuro; o ponto accent fica igual nos dois fundos */
  sobreEscuro?: boolean
}

/**
 * Wordmark minimalista: "garagem" em minúsculas + ponto accent.
 * O ponto é o "." da própria fonte: alinha na linha de base e escala junto, sem desenho à parte.
 */
export function Logo({ sobreEscuro = false }: Props) {
  return (
    <Text style={[estilos.marca, sobreEscuro && estilos.sobreEscuro]}>
      garagem<Text style={estilos.ponto}>.</Text>
    </Text>
  )
}

const estilos = StyleSheet.create({
  marca: { ...tipo.titulo, fontSize: 26, lineHeight: 32, letterSpacing: -0.8 },
  sobreEscuro: { color: cores.bg },
  ponto: { color: cores.accent },
})
