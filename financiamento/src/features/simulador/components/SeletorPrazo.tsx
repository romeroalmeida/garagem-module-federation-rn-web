import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Prazo } from '../types'
import { PRAZOS } from '../utils/parcela'

type Props = { valor: Prazo; onChange: (prazo: Prazo) => void }

export function SeletorPrazo({ valor, onChange }: Props) {
  return (
    <View role="radiogroup" aria-label="Prazo em meses" style={estilos.grupo}>
      {PRAZOS.map((prazo) => {
        const marcado = prazo === valor
        return (
          <Pressable
            key={prazo}
            role="radio"
            aria-checked={marcado}
            aria-label={`${prazo} meses`}
            onPress={() => onChange(prazo)}
            style={[estilos.opcao, marcado && estilos.marcado]}
          >
            <Text style={[estilos.texto, marcado && estilos.textoMarcado]}>{prazo}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const estilos = StyleSheet.create({
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
  },
  marcado: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  texto: { fontSize: 15, fontWeight: '600', color: '#18181b' },
  textoMarcado: { color: '#fff' },
})
