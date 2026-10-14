import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Botao, Campo, Chip, Titulo, cores, raios, sombras, tipo } from '@garagem/ds'
import type { Prazo, Simulacao, SimuladorProps } from '../types'
import { entradaPorPercentual, entradaValida, lerNumero, limitesEntrada } from '../utils/entrada'
import { formatarMoeda, formatarReais, formatarTaxa } from '../utils/formatar'
import { PRAZOS, PRAZO_PADRAO, TAXA_MENSAL, calcularParcela } from '../utils/parcela'

const PERCENTUAIS = [20, 30, 40, 50] as const

export default function Simulador({ preco, onInteresse }: SimuladorProps) {
  const limites = limitesEntrada(preco)
  // estado inicial vem do preço; trocar de carro remonta o simulador (o host passa key={veiculo.id})
  const [entrada, setEntrada] = useState<number | undefined>(limites.min)
  const [prazo, setPrazo] = useState<Prazo>(PRAZO_PADRAO)
  // undefined = entrada fora dos limites
  const simulacao: Simulacao | undefined = entradaValida(entrada, preco)
    ? { preco, entrada, prazo, parcela: calcularParcela(preco, entrada, prazo), taxaMensal: TAXA_MENSAL }
    : undefined

  return (
    <View style={estilos.caixa}>
      <Titulo>Simule o financiamento</Titulo>

      <View style={estilos.linha}>
        <Text style={tipo.corpo}>Preço do carro</Text>
        <Text style={tipo.corpoForte}>{formatarReais(preco)}</Text>
      </View>

      <Text style={tipo.corpoForte}>Entrada</Text>
      <View role="radiogroup" aria-label="Entrada em percentual do preço" style={estilos.chips}>
        {PERCENTUAIS.map((percentual) => {
          const valor = entradaPorPercentual(preco, percentual)
          return <Chip key={percentual} papel="radio" rotulo={`${percentual}%`} selecionado={entrada === valor} onPress={() => setEntrada(valor)} />
        })}
      </View>
      <Campo
        value={entrada === undefined ? '' : String(entrada)}
        onChangeText={(texto) => setEntrada(lerNumero(texto))}
        inputMode="numeric"
        maxLength={9}
        aria-label="Entrada"
      />
      <Text style={tipo.legenda}>
        mín. {formatarReais(limites.min)} · máx. {formatarReais(limites.max)}
      </Text>

      <Text style={tipo.corpoForte}>Prazo (meses)</Text>
      <View role="radiogroup" aria-label="Prazo em meses" style={estilos.chips}>
        {PRAZOS.map((p) => (
          <Chip key={p} papel="radio" rotulo={String(p)} selecionado={p === prazo} onPress={() => setPrazo(p)} />
        ))}
      </View>

      {/* região viva sempre montada: anuncia a parcela nova (ou os limites) sem interromper.
          No iOS o VoiceOver não lê região viva — lacuna conhecida. Accent só sobre escuro (10,4:1). */}
      <View aria-live="polite" style={estilos.resultado}>
        {simulacao ? (
          <>
            <Text style={estilos.parcela}>
              {prazo}x de {formatarMoeda(simulacao.parcela)}
            </Text>
            <Text style={estilos.taxa}>taxa {formatarTaxa(TAXA_MENSAL)} · simulação, sem valor de proposta</Text>
          </>
        ) : (
          <Text style={estilos.taxa}>
            Entrada entre {formatarReais(limites.min)} e {formatarReais(limites.max)}
          </Text>
        )}
      </View>

      {/* avisa o host só no clique — nunca num efeito */}
      <Botao rotulo="Tenho interesse" desabilitado={!simulacao} onPress={() => simulacao && onInteresse?.(simulacao)} />
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: 12, padding: 16, borderRadius: raios.card, backgroundColor: cores.bg, boxShadow: sombras.card },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultado: { gap: 4, padding: 16, borderRadius: raios.card, backgroundColor: cores.ink },
  parcela: { ...tipo.preco, fontSize: 26, color: cores.accent },
  taxa: { ...tipo.legenda, color: cores.bg },
})
