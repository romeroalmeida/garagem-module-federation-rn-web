import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Filtros } from '../types'
import { FILTROS_VAZIOS, lerNumero } from '../utils/filtros'

type Props = { marcas: string[]; filtros: Filtros; onChange: (filtros: Filtros) => void }

export function PainelFiltros({ marcas, filtros, onChange }: Props) {
  const alternarMarca = (marca: string) =>
    onChange({
      ...filtros,
      marcas: filtros.marcas.includes(marca)
        ? filtros.marcas.filter((m) => m !== marca)
        : [...filtros.marcas, marca],
    })

  return (
    <View style={estilos.painel}>
      <Text style={estilos.titulo}>Marca</Text>
      {marcas.map((marca) => {
        const marcada = filtros.marcas.includes(marca)
        return (
          <Pressable
            key={marca}
            role="checkbox"
            aria-checked={marcada}
            onPress={() => alternarMarca(marca)}
            style={estilos.opcao}
          >
            <View style={[estilos.caixa, marcada && estilos.caixaMarcada]}>
              {marcada && <Text style={estilos.check}>✓</Text>}
            </View>
            <Text style={estilos.opcaoTexto}>{marca}</Text>
          </Pressable>
        )
      })}

      <CampoNumero rotulo="Preço até (R$)" valor={filtros.precoMax} onChange={(precoMax) => onChange({ ...filtros, precoMax })} />
      <CampoNumero rotulo="Ano a partir de" valor={filtros.anoMin} onChange={(anoMin) => onChange({ ...filtros, anoMin })} />
      <CampoNumero rotulo="Km até" valor={filtros.kmMax} onChange={(kmMax) => onChange({ ...filtros, kmMax })} />

      {/* Limpa o painel e preserva o texto da barra de busca */}
      <Pressable role="button" style={estilos.limpar} onPress={() => onChange({ ...FILTROS_VAZIOS, texto: filtros.texto })}>
        <Text style={estilos.link}>Limpar filtros</Text>
      </Pressable>
    </View>
  )
}

type CampoNumeroProps = { rotulo: string; valor?: number; onChange: (valor: number | undefined) => void }

function CampoNumero({ rotulo, valor, onChange }: CampoNumeroProps) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.titulo}>{rotulo}</Text>
      <TextInput
        value={valor === undefined ? '' : String(valor)}
        onChangeText={(texto) => onChange(lerNumero(texto))}
        inputMode="numeric"
        maxLength={9}
        aria-label={rotulo}
        style={estilos.input}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  painel: { gap: 6 },
  titulo: { fontSize: 13, fontWeight: '600', color: '#3f3f46', marginTop: 8 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  caixa: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#a1a1aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  check: { color: '#fff', fontSize: 13, fontWeight: '700' },
  opcaoTexto: { fontSize: 15, color: '#18181b' },
  campo: { gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  limpar: { alignSelf: 'flex-start', marginTop: 12 },
  link: { color: '#7c3aed', fontWeight: '600' },
})
