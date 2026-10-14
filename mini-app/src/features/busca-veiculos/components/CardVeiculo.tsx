import { StyleSheet, Text, View } from 'react-native'
import { Card, FotoCarro, Icone, Selo, cores, tipo, type NomeIcone } from '@garagem/ds'
import type { Veiculo } from '../types'
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL, ROTULO_COR, formatarKm, formatarPreco } from '../utils/formatar'

type Props = { veiculo: Veiculo; onPress: () => void }

export function CardVeiculo({ veiculo, onPress }: Props) {
  const rotulo = `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}, ${ROTULO_COR[veiculo.cor]}, ${veiculo.ano}, ${formatarKm(veiculo.km)}, ${ROTULO_CAMBIO[veiculo.cambio]}, ${ROTULO_COMBUSTIVEL[veiculo.combustivel]}, ${veiculo.cidade} (${veiculo.uf}), ${formatarPreco(veiculo.preco)}`
  return (
    <Card onPress={onPress} rotulo={rotulo}>
      <View style={estilos.foto}>
        <FotoCarro
          fonte={veiculo.foto}
          carroceria={veiculo.carroceria}
          credito={veiculo.creditoFoto && { autor: veiculo.creditoFoto.autor, licenca: veiculo.creditoFoto.licenca }}
        />
        {/* flex é o padrão: só elétrico e diesel ganham selo */}
        {veiculo.combustivel === 'eletrico' && (
          <View style={estilos.selo}>
            <Selo tom="positivo" texto="Elétrico" />
          </View>
        )}
        {veiculo.combustivel === 'diesel' && (
          <View style={estilos.selo}>
            <Selo tom="neutro" texto="Diesel" />
          </View>
        )}
      </View>
      <View style={estilos.corpo}>
        <Text style={[tipo.corpoForte, estilos.nome]} numberOfLines={1}>
          {veiculo.marca} {veiculo.modelo}
        </Text>
        <Text style={tipo.legenda} numberOfLines={1}>
          {veiculo.versao}
        </Text>
        <View style={estilos.specs}>
          <Spec icone="Calendar" texto={String(veiculo.ano)} />
          <Spec icone="Gauge" texto={formatarKm(veiculo.km)} />
          <Spec icone="Cog" texto={ROTULO_CAMBIO[veiculo.cambio]} />
          <Spec icone="Fuel" texto={ROTULO_COMBUSTIVEL[veiculo.combustivel]} />
        </View>
        <Spec icone="MapPin" texto={`${veiculo.cidade} (${veiculo.uf})`} />
        <Text style={[tipo.preco, estilos.preco]}>{formatarPreco(veiculo.preco)}</Text>
      </View>
    </Card>
  )
}

function Spec({ icone, texto }: { icone: NomeIcone; texto: string }) {
  return (
    <View style={estilos.spec}>
      <Icone nome={icone} tamanho={14} cor={cores.inkSoft} />
      <Text style={tipo.legenda}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  foto: { position: 'relative' },
  selo: { position: 'absolute', top: 10, left: 10 },
  corpo: { gap: 6, padding: 16 },
  nome: { textTransform: 'uppercase' },
  specs: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  preco: { marginTop: 4 },
})
