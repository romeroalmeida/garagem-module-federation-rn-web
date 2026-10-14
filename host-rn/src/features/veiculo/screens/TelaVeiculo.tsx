import { useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Botao, Selo, Silhueta, cores, raios, tipo } from '@garagem/ds'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import type { Rotas } from '@/shared/types/rotas'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const inteiro = new Intl.NumberFormat('pt-BR')
const CAMBIO: Record<Veiculo['cambio'], string> = { manual: 'Manual', automatico: 'Automático' }
const COMBUSTIVEL: Record<Veiculo['combustivel'], string> = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' }
const CARROCERIA: Record<Veiculo['carroceria'], string> = { hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape' }
const ALTURA_BARRA = 72

export function TelaVeiculo({ route, navigation }: NativeStackScreenProps<Rotas, 'Veiculo'>) {
  const { veiculo } = route.params
  const [proposta, setProposta] = useState<Simulacao>()
  const [ySimulador, setYSimulador] = useState(0)
  const rolagem = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const specs: [string, string][] = [
    ['Cidade', `${veiculo.cidade} - ${veiculo.uf}`],
    ['Ano', String(veiculo.ano)],
    ['Km', inteiro.format(veiculo.km)],
    ['Câmbio', CAMBIO[veiculo.cambio]],
    ['Combustível', COMBUSTIVEL[veiculo.combustivel]],
    ['Carroceria', CARROCERIA[veiculo.carroceria]],
  ]

  return (
    <View style={estilos.tela}>
      <ScrollView
        ref={rolagem}
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA + insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={estilos.foto}>
          <Silhueta carroceria={veiculo.carroceria} />
        </View>
        <Text style={[tipo.display, estilos.titulo]}>
          {veiculo.marca} <Text style={{ color: cores.accentInk }}>{veiculo.modelo}</Text>
        </Text>
        <Text style={[tipo.legenda, estilos.versao]}>{veiculo.versao}</Text>
        <View style={estilos.specs}>
          {specs.map(([rotulo, valor]) => (
            <View key={rotulo} style={estilos.spec}>
              <Text style={tipo.legenda}>{rotulo}</Text>
              <Text style={tipo.corpoForte}>{valor}</Text>
            </View>
          ))}
        </View>
        <View onLayout={(e) => setYSimulador(e.nativeEvent.layout.y)}>
          <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
        </View>
        {/* mesmo molde do web; no iOS o role="status" não anuncia (lacuna conhecida) */}
        <View role="status">
          {proposta && <Selo tom="positivo" texto={`Proposta enviada ✓ — ${proposta.prazo}x de ${parcela.format(proposta.parcela)}`} />}
        </View>
        <Botao variante="contorno" rotulo="Voltar para a busca" onPress={() => navigation.goBack()} />
      </ScrollView>

      {/* preço sempre visível no celular (correção em relação à Webmotors) */}
      <View style={[estilos.barra, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={tipo.preco}>{preco.format(veiculo.preco)}</Text>
        <Botao variante="acao" rotulo="Ver parcelas" onPress={() => rolagem.current?.scrollTo({ y: ySimulador, animated: true })} />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { gap: 16, padding: 16 },
  foto: { borderRadius: raios.card, overflow: 'hidden' },
  titulo: { fontSize: 28, lineHeight: 32 },
  versao: { textTransform: 'uppercase' },
  specs: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  spec: { width: '33.33%', gap: 2, paddingRight: 8 },
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: cores.bg,
    borderTopWidth: 1,
    borderTopColor: cores.line,
  },
})
