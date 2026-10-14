import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Icone, cores, raios, sombras, tipo } from '@garagem/ds'

type Props = { valor: string; onChange: (texto: string) => void }

export function BarraBusca({ valor, onChange }: Props) {
  return (
    <View style={estilos.barra}>
      <Icone nome="Search" cor={cores.inkSoft} />
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Buscar marca ou modelo"
        placeholderTextColor={cores.inkSoft}
        aria-label="Buscar marca ou modelo"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={[tipo.corpo, estilos.input]}
      />
      {valor !== '' && (
        <Pressable role="button" aria-label="Limpar busca" onPress={() => onChange('')} style={estilos.limpar}>
          <Icone nome="X" />
        </Pressable>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  // pílula branca com sombra sobre o fundo surface (sem contorno)
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingLeft: 16,
    borderRadius: raios.pilula,
    backgroundColor: cores.bg,
    boxShadow: sombras.card,
  },
  input: { flex: 1, paddingVertical: 10 },
  limpar: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
})
