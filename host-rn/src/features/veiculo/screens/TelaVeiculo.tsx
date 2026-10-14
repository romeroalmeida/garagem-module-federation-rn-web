import { useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Botao, FotoCarro, Selo, cores, raios, sombras, tipo } from '@garagem/ds'
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
// hosts não importam código do remote em runtime: só os tipos (@busca/tipos), por isso a cópia local
const COR: Record<Veiculo['cor'], string> = {
  prata: 'Prata',
  preto: 'Preto',
  branco: 'Branco',
  cinza: 'Cinza',
  vermelho: 'Vermelho',
  azul: 'Azul',
  verde: 'Verde',
  amarelo: 'Amarelo',
  laranja: 'Laranja',
  marrom: 'Marrom',
  bege: 'Bege',
  vinho: 'Vinho',
}
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
    ['Cor', COR[veiculo.cor]],
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
          <FotoCarro
            fonte={veiculo.foto}
            carroceria={veiculo.carroceria}
            credito={veiculo.creditoFoto && { autor: veiculo.creditoFoto.autor, licenca: veiculo.creditoFoto.licenca }}
            descricao={`${veiculo.marca} ${veiculo.modelo}`}
          />
        </View>
        {veiculo.creditoFoto && (
          <Pressable
            role="link"
            aria-label="Ver a foto e a licença no Wikimedia Commons"
            onPress={() => Linking.openURL(veiculo.creditoFoto!.fonte)}
            style={estilos.credito}
          >
            <Text style={tipo.legenda}>
              Foto: <Text style={estilos.creditoLink}>{veiculo.creditoFoto.autor}</Text> ·{' '}
              <Text style={estilos.creditoLink}>{veiculo.creditoFoto.licenca}</Text> · Wikimedia Commons
            </Text>
          </Pressable>
        )}
        <Text role="heading" style={[tipo.display, estilos.titulo]}>
          {veiculo.marca} <Text style={{ color: cores.accentInk }}>{veiculo.modelo}</Text>
        </Text>
        <Text style={[tipo.legenda, estilos.versao]}>{veiculo.versao}</Text>
        <View style={estilos.cardSpecs}>
          <View style={estilos.specs}>
            {specs.map(([rotulo, valor]) => (
              <View key={rotulo} style={estilos.spec}>
                <Text style={tipo.legenda}>{rotulo}</Text>
                <Text style={tipo.corpoForte}>{valor}</Text>
              </View>
            ))}
          </View>
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
  tela: { flex: 1, backgroundColor: cores.surface },
  // largura máxima: no iPad deitado a silhueta 4:3 em 100% passaria da altura da tela
  conteudo: { gap: 16, padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  foto: { borderRadius: raios.card, overflow: 'hidden' },
  // mín. 44px de toque; link para a licença no Wikimedia Commons
  credito: { minHeight: 44, justifyContent: 'center' },
  creditoLink: { color: cores.accentInk },
  titulo: { fontSize: 28, lineHeight: 32 },
  versao: { textTransform: 'uppercase' },
  cardSpecs: { backgroundColor: cores.bg, borderRadius: raios.card, boxShadow: sombras.card, padding: 16 },
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
    boxShadow: '0 -4px 16px rgba(23, 23, 23, 0.08)',
  },
})
