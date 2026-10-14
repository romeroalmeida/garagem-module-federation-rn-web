import type { ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Botao, Chip, Titulo, cores, raios, tipo } from '@garagem/ds'
import type { Filtros } from '../types'
import { FILTROS_VAZIOS, lerNumero } from '../utils/filtros'
import { ORDENS, ROTULOS_ORDEM } from '../utils/ordenar'

type Props = { marcas: string[]; filtros: Filtros; onChange: (filtros: Filtros) => void }

export function PainelFiltros({ marcas, filtros, onChange }: Props) {
  const alternarMarca = (marca: string) =>
    onChange({
      ...filtros,
      marcas: filtros.marcas.includes(marca) ? filtros.marcas.filter((m) => m !== marca) : [...filtros.marcas, marca],
    })
  const ordemAtual = filtros.ordem ?? 'relevancia'

  return (
    <View style={estilos.painel}>
      <Titulo>Filtros</Titulo>

      <Secao titulo="Marca">
        <View role="group" aria-label="Marca" style={estilos.chips}>
          {marcas.map((marca) => (
            <Chip key={marca} papel="checkbox" rotulo={marca} selecionado={filtros.marcas.includes(marca)} onPress={() => alternarMarca(marca)} />
          ))}
        </View>
      </Secao>

      <CampoNumero rotulo="Preço até (R$)" valor={filtros.precoMax} onChange={(precoMax) => onChange({ ...filtros, precoMax })} />
      <CampoNumero rotulo="Ano a partir de" valor={filtros.anoMin} onChange={(anoMin) => onChange({ ...filtros, anoMin })} />
      <CampoNumero rotulo="Km até" valor={filtros.kmMax} onChange={(kmMax) => onChange({ ...filtros, kmMax })} />

      <Secao titulo="Ordenar por">
        <View role="radiogroup" aria-label="Ordenar por" style={estilos.chips}>
          {ORDENS.map((ordem) => (
            <Chip
              key={ordem}
              papel="radio"
              rotulo={ROTULOS_ORDEM[ordem]}
              selecionado={ordemAtual === ordem}
              onPress={() => onChange({ ...filtros, ordem: ordem === 'relevancia' ? undefined : ordem })}
            />
          ))}
        </View>
      </Secao>

      {/* limpa os filtros do painel; o texto da busca e a ordem ficam */}
      <Botao variante="contorno" rotulo="Limpar filtros" onPress={() => onChange({ ...FILTROS_VAZIOS, texto: filtros.texto, ordem: filtros.ordem })} />
    </View>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={tipo.corpoForte}>{titulo}</Text>
      {children}
    </View>
  )
}

type CampoNumeroProps = { rotulo: string; valor?: number; onChange: (valor: number | undefined) => void }

function CampoNumero({ rotulo, valor, onChange }: CampoNumeroProps) {
  return (
    <Secao titulo={rotulo}>
      <TextInput
        value={valor === undefined ? '' : String(valor)}
        onChangeText={(texto) => onChange(lerNumero(texto))}
        inputMode="numeric"
        maxLength={9}
        aria-label={rotulo}
        style={[tipo.corpo, estilos.input]}
      />
    </Secao>
  )
}

const estilos = StyleSheet.create({
  painel: { gap: 20 },
  secao: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.inkSoft,
    borderRadius: raios.botao,
    backgroundColor: cores.bg,
  },
})
