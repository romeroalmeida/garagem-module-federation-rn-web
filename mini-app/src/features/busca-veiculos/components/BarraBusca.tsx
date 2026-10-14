import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type Props = { valor: string; onChange: (texto: string) => void }

export function BarraBusca({ valor, onChange }: Props) {
  return (
    <View style={estilos.barra}>
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Buscar marca ou modelo"
        aria-label="Buscar marca ou modelo"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={estilos.input}
      />
      {valor !== '' && (
        <Pressable role="button" aria-label="Limpar busca" onPress={() => onChange('')} style={estilos.limpar}>
          <Text style={estilos.limparTexto}>×</Text>
        </Pressable>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  limpar: { paddingHorizontal: 12, paddingVertical: 8 },
  limparTexto: { fontSize: 20, color: '#71717a' },
})
