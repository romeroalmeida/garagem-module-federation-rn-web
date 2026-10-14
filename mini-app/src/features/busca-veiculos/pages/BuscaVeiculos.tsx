import { useMemo, useState } from 'react'
import { FlatList, Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions, type DimensionValue } from 'react-native'
import { Botao, Chip, cores, tipo } from '@garagem/ds'
import { BarraBusca } from '../components/BarraBusca'
import { CardVeiculo } from '../components/CardVeiculo'
import { PainelFiltros } from '../components/PainelFiltros'
import { listarMarcas, listarVeiculos } from '../services/veiculosService'
import type { BuscaVeiculosProps, Filtros } from '../types'
import { filtrarVeiculos } from '../utils/filtrarVeiculos'
import { FILTROS_VAZIOS, chipsAtivos, contarFiltrosAtivos, normalizarFiltros } from '../utils/filtros'
import { formatarResultado, formatarVerCarros } from '../utils/formatar'
import { ROTULOS_ORDEM, ordenarVeiculos } from '../utils/ordenar'

const LARGURA_PAINEL_LATERAL = 768
const veiculos = listarVeiculos()
const marcas = listarMarcas()
const colunasPara = (largura: number) => (largura >= 1100 ? 3 : largura >= LARGURA_PAINEL_LATERAL ? 2 : 1)

export default function BuscaVeiculos({ filtrosIniciais, onFiltrosMudaram, onSelecionarVeiculo }: BuscaVeiculosProps) {
  // filtrosIniciais é lido só na montagem; depois o estado é do mini-app
  const [filtros, setFiltros] = useState(() => normalizarFiltros(filtrosIniciais, marcas))
  const [modalAberto, setModalAberto] = useState(false)
  const { width } = useWindowDimensions()
  const largo = width >= LARGURA_PAINEL_LATERAL
  // ao virar largo (redimensionar/girar), o modal fecha — senão reabre sozinho ao voltar a estreito
  if (largo && modalAberto) setModalAberto(false)
  const colunas = colunasPara(width)
  const resultado = useMemo(() => ordenarVeiculos(filtrarVeiculos(veiculos, filtros), filtros.ordem), [filtros])
  const ativos = contarFiltrosAtivos(filtros)
  const chips = chipsAtivos(filtros)
  const contador =
    formatarResultado(resultado.length) +
    (filtros.ordem && filtros.ordem !== 'relevancia' ? ` · ordenados por ${ROTULOS_ORDEM[filtros.ordem].toLowerCase()}` : '')

  // Avisa o host aqui, no handler — nunca num useEffect (loop com setSearchParams do host)
  function atualizar(novos: Filtros) {
    setFiltros(novos)
    onFiltrosMudaram?.(novos)
  }

  const painel = <PainelFiltros marcas={marcas} filtros={filtros} onChange={atualizar} />
  const larguraCelula = `${100 / colunas}%` as DimensionValue

  return (
    <View style={estilos.raiz}>
      {largo && (
        <ScrollView style={estilos.lateral} contentContainerStyle={estilos.lateralConteudo} keyboardShouldPersistTaps="handled">
          {painel}
        </ScrollView>
      )}

      <View style={estilos.conteudo}>
        <BarraBusca valor={filtros.texto} onChange={(texto) => atualizar({ ...filtros, texto })} />

        {(!largo || chips.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
            {!largo && (
              <Chip icone="SlidersHorizontal" rotulo={ativos > 0 ? `Filtros (${ativos})` : 'Filtros'} onPress={() => setModalAberto(true)} />
            )}
            {chips.map((chip) => (
              <Chip key={chip.id} rotulo={chip.rotulo} removivel onPress={() => atualizar(chip.sem)} />
            ))}
            {chips.length > 0 && (
              <Chip rotulo="Limpar" onPress={() => atualizar({ ...FILTROS_VAZIOS, texto: filtros.texto, ordem: filtros.ordem })} />
            )}
          </ScrollView>
        )}

        <Text style={tipo.legenda}>{contador}</Text>

        <FlatList
          key={`colunas-${colunas}`}
          numColumns={colunas}
          data={resultado}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => (
            <View style={[estilos.celula, { width: larguraCelula }]}>
              <CardVeiculo veiculo={item} onPress={() => onSelecionarVeiculo(item)} />
            </View>
          )}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={tipo.corpo}>Nenhum carro com esses filtros</Text>
              <Botao rotulo="Limpar busca e filtros" onPress={() => atualizar(FILTROS_VAZIOS)} />
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
          <Botao rotulo={formatarVerCarros(resultado.length)} onPress={() => setModalAberto(false)} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, flexDirection: 'row', width: '100%', maxWidth: 1200, alignSelf: 'center', backgroundColor: cores.bg },
  lateral: { width: 280, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: cores.line },
  lateralConteudo: { padding: 16 },
  conteudo: { flex: 1, padding: 16, gap: 12 },
  chips: { gap: 8, alignItems: 'center' },
  lista: { paddingBottom: 24 },
  celula: { padding: 6 },
  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  modal: { flex: 1, backgroundColor: cores.bg },
  modalConteudo: { padding: 20, gap: 16 },
})
