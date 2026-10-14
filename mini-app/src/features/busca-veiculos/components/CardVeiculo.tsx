import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Veiculo } from '../types'
import { formatarKm, formatarPreco } from '../utils/formatar'

type Props = { veiculo: Veiculo; onPress: () => void }

export function CardVeiculo({ veiculo, onPress }: Props) {
  return (
    <Pressable
      role="button"
      aria-label={`${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}, ${formatarPreco(veiculo.preco)}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}
    >
      {/* ponytail: sem fotos na v1 — caixa com a inicial da marca */}
      <View style={estilos.foto}>
        <Text style={estilos.inicial}>{veiculo.marca[0]}</Text>
      </View>
      <View style={estilos.info}>
        <Text style={estilos.nome}>
          {veiculo.marca} {veiculo.modelo} <Text style={estilos.versao}>{veiculo.versao}</Text>
        </Text>
        <Text style={estilos.detalhe}>
          {veiculo.ano} · {formatarKm(veiculo.km)}
        </Text>
        <Text style={estilos.preco}>{formatarPreco(veiculo.preco)}</Text>
        <Text style={estilos.detalhe}>
          {veiculo.cidade} - {veiculo.uf}
        </Text>
      </View>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  pressionado: { opacity: 0.7 },
  foto: {
    width: 96,
    height: 72,
    borderRadius: 6,
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { fontSize: 28, fontWeight: '700', color: '#71717a' },
  info: { flex: 1, gap: 2 },
  nome: { fontSize: 16, fontWeight: '600', color: '#18181b' },
  versao: { fontWeight: '400', color: '#52525b' },
  detalhe: { fontSize: 13, color: '#71717a' },
  preco: { fontSize: 17, fontWeight: '700', color: '#18181b' },
})
