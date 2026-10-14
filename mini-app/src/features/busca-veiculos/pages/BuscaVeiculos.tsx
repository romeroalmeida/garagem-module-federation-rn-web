import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { BarraBusca } from '../components/BarraBusca'
import { CardVeiculo } from '../components/CardVeiculo'
import { PainelFiltros } from '../components/PainelFiltros'
import { listarMarcas, listarVeiculos } from '../services/veiculosService'
import type { BuscaVeiculosProps, Filtros } from '../types'
import { filtrarVeiculos } from '../utils/filtrarVeiculos'
import { FILTROS_VAZIOS, contarFiltrosAtivos, normalizarFiltros } from '../utils/filtros'
import { formatarResultado, formatarVerCarros } from '../utils/formatar'

const LARGURA_PAINEL_LATERAL = 768
const veiculos = listarVeiculos()
const marcas = listarMarcas()

export default function BuscaVeiculos({ filtrosIniciais, onFiltrosMudaram, onSelecionarVeiculo }: BuscaVeiculosProps) {
  // filtrosIniciais é lido só na montagem; depois o estado é do mini-app
  const [filtros, setFiltros] = useState(() => normalizarFiltros(filtrosIniciais, marcas))
  const [modalAberto, setModalAberto] = useState(false)
  const { width } = useWindowDimensions()
  const largo = width >= LARGURA_PAINEL_LATERAL
  // ao virar largo (redimensionar/girar), o modal fecha — senão reabre sozinho ao voltar a estreito
  if (largo && modalAberto) setModalAberto(false)
  const resultado = useMemo(() => filtrarVeiculos(veiculos, filtros), [filtros])
  const ativos = contarFiltrosAtivos(filtros)

  // Avisa o host aqui, no handler — nunca num useEffect (loop com setSearchParams do host)
  function atualizar(novos: Filtros) {
    setFiltros(novos)
    onFiltrosMudaram?.(novos)
  }

  const painel = <PainelFiltros marcas={marcas} filtros={filtros} onChange={atualizar} />

  return (
    <View style={estilos.raiz}>
      {largo && (
        <ScrollView style={estilos.lateral} contentContainerStyle={estilos.lateralConteudo} keyboardShouldPersistTaps="handled">
          {painel}
        </ScrollView>
      )}

      <View style={estilos.conteudo}>
        <BarraBusca valor={filtros.texto} onChange={(texto) => atualizar({ ...filtros, texto })} />

        {!largo && (
          <Pressable role="button" style={estilos.botaoFiltros} onPress={() => setModalAberto(true)}>
            <Text style={estilos.botaoFiltrosTexto}>{ativos > 0 ? `Filtros (${ativos})` : 'Filtros'}</Text>
          </Pressable>
        )}

        <Text style={estilos.contador}>{formatarResultado(resultado.length)}</Text>

        <FlatList
          data={resultado}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => <CardVeiculo veiculo={item} onPress={() => onSelecionarVeiculo(item)} />}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={estilos.vazioTexto}>Nenhum carro com esses filtros</Text>
              <Pressable role="button" style={estilos.botaoPrimario} onPress={() => atualizar(FILTROS_VAZIOS)}>
                <Text style={estilos.botaoPrimarioTexto}>Limpar busca e filtros</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={estilos.lista}
        />
      </View>

      <Modal
        visible={modalAberto}
        animationType="slide"
        presentationStyle="pageSheet"
        allowSwipeDismissal
        onRequestClose={() => setModalAberto(false)}
      >
        {/* rola e solta o teclado: o teclado numérico do iPhone não tem tecla de retorno */}
        <ScrollView
          style={estilos.modal}
          contentContainerStyle={estilos.modalConteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {painel}
          <Pressable role="button" style={estilos.botaoPrimario} onPress={() => setModalAberto(false)}>
            <Text style={estilos.botaoPrimarioTexto}>{formatarVerCarros(resultado.length)}</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    backgroundColor: '#f4f4f5',
  },
  lateral: { width: 240, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#e4e4e7' },
  lateralConteudo: { padding: 16 },
  conteudo: { flex: 1, padding: 16, gap: 10 },
  botaoFiltros: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  botaoFiltrosTexto: { color: '#7c3aed', fontWeight: '600' },
  contador: { fontSize: 13, color: '#52525b' },
  lista: { paddingBottom: 24 },
  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  vazioTexto: { fontSize: 15, color: '#52525b' },
  modal: { flex: 1, backgroundColor: '#f4f4f5' },
  modalConteudo: { padding: 20, gap: 16 },
  botaoPrimario: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
