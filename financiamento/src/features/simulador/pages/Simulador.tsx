import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SeletorPrazo } from '../components/SeletorPrazo'
import type { Prazo, Simulacao, SimuladorProps } from '../types'
import { entradaValida, lerNumero, limitesEntrada } from '../utils/entrada'
import { formatarMoeda, formatarReais, formatarTaxa } from '../utils/formatar'
import { PRAZO_PADRAO, TAXA_MENSAL, calcularParcela } from '../utils/parcela'

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
      {/* sem role="heading": o RN 0.86 não tipa aria-level, e sem ele o react-native-web gera um segundo <h1> */}
      <Text style={estilos.titulo}>Simule o financiamento</Text>

      <View style={estilos.linha}>
        <Text style={estilos.rotulo}>Preço do carro</Text>
        <Text style={estilos.valor}>{formatarReais(preco)}</Text>
      </View>

      <View style={estilos.linha}>
        <Text style={estilos.rotulo}>Entrada</Text>
        <TextInput
          value={entrada === undefined ? '' : String(entrada)}
          onChangeText={(texto) => setEntrada(lerNumero(texto))}
          inputMode="numeric"
          maxLength={9}
          aria-label="Entrada"
          style={estilos.input}
        />
      </View>
      <Text style={estilos.ajuda}>mín. 20% do preço</Text>

      <Text style={estilos.rotulo}>Prazo (meses)</Text>
      <SeletorPrazo valor={prazo} onChange={setPrazo} />

      {/* região viva sempre montada: anuncia a parcela nova (ou os limites) sem interromper.
          No iOS o VoiceOver não lê região viva — lacuna conhecida. */}
      <View aria-live="polite">
        {simulacao ? (
          <View style={estilos.resultado}>
            <Text style={estilos.parcela}>
              {prazo}x de {formatarMoeda(simulacao.parcela)}
            </Text>
            <Text style={estilos.ajuda}>taxa {formatarTaxa(TAXA_MENSAL)} · simulação, sem valor de proposta</Text>
          </View>
        ) : (
          <Text style={estilos.erro}>
            Entrada entre {formatarReais(limites.min)} e {formatarReais(limites.max)}
          </Text>
        )}
      </View>

      {/* avisa o host só no clique — nunca num efeito; `disabled` já expõe aria-disabled nas duas plataformas */}
      <Pressable
        role="button"
        disabled={!simulacao}
        onPress={() => simulacao && onInteresse?.(simulacao)}
        style={[estilos.botao, !simulacao && estilos.botaoBloqueado]}
      >
        <Text style={estilos.botaoTexto}>Tenho interesse</Text>
      </Pressable>
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: 10, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e4e4e7', backgroundColor: '#fff' },
  titulo: { fontSize: 18, fontWeight: '700', color: '#18181b' },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rotulo: { fontSize: 14, fontWeight: '600', color: '#3f3f46' },
  valor: { fontSize: 16, fontWeight: '700', color: '#18181b' },
  input: {
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#fff',
  },
  ajuda: { fontSize: 12, color: '#71717a' },
  resultado: { gap: 2, marginTop: 6 },
  parcela: { fontSize: 22, fontWeight: '700', color: '#18181b' },
  erro: { marginTop: 6, fontSize: 14, color: '#b91c1c' },
  botao: {
    minHeight: 44,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  botaoBloqueado: { opacity: 0.4 },
  botaoTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
