import { Image, StyleSheet, Text, View } from 'react-native'
import { cores, tipo } from '../tokens'
import { Silhueta } from './Silhueta'

type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'
export type FonteImagem = number | { uri: string; width?: number; height?: number }
export type CreditoFoto = { autor: string; licenca: string }

type Props = {
  fonte?: FonteImagem
  carroceria: Carroceria
  /** fotos com licença Creative Commons exigem crédito ao autor */
  credito?: CreditoFoto
  /** texto alternativo; omita quando o contêiner já descreve o carro */
  descricao?: string
}

/** Foto 4:3 do anúncio com o crédito por cima; sem foto, a silhueta da carroceria. */
export function FotoCarro({ fonte, carroceria, credito, descricao }: Props) {
  if (!fonte) return <Silhueta carroceria={carroceria} />
  return (
    <View style={estilos.palco}>
      <Image source={fonte} alt={descricao} resizeMode="cover" style={estilos.imagem} />
      {credito && (
        <Text style={estilos.credito} numberOfLines={1}>
          Foto: {credito.autor} · {credito.licenca}
        </Text>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  palco: { width: '100%', aspectRatio: 4 / 3, backgroundColor: cores.carStage },
  imagem: { width: '100%', height: '100%' },
  credito: {
    ...tipo.legenda,
    position: 'absolute',
    right: 6,
    bottom: 6,
    maxWidth: '90%',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: cores.bg,
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
  },
})
