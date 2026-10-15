import { createNativeStackNavigator, type NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Logo, cores, raios, tipo } from '@garagem/ds'
import type { Rotas } from '@/shared/types/rotas'
import { useFronteiras } from '@/shared/components/Fronteira'
import { TelaBusca } from '@/features/busca/screens/TelaBusca'
import { TelaVeiculo } from '@/features/veiculo/screens/TelaVeiculo'

const Stack = createNativeStackNavigator<Rotas>()

/** Liga/desliga as bordas dos remotes: o app parece produto, e o estudo ainda mostra onde cada remote começa. */
function BotaoFronteiras() {
  const { visivel, alternar } = useFronteiras()
  return (
    <Pressable
      role="switch"
      aria-checked={visivel}
      aria-label="Mostrar micro-frontends"
      onPress={alternar}
      // pílula de 28pt + 8 em cima e embaixo = alvo de toque de 44pt
      hitSlop={8}
      style={[estilos.pilula, visivel && estilos.pilulaLigada]}
    >
      <Text style={[estilos.rotulo, visivel && estilos.rotuloLigado]}>MF</Text>
    </Pressable>
  )
}

// fora do componente: definir headerTitle/headerRight no render cria um tipo de componente novo a cada render
const opcoesDoHeader: NativeStackNavigationOptions = {
  headerTitle: () => <Logo />,
  headerRight: () => <BotaoFronteiras />,
  headerStyle: { backgroundColor: cores.bg },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: cores.surface },
}

export function Navegacao() {
  return (
    <Stack.Navigator screenOptions={opcoesDoHeader}>
      {/* o header mostra o logo; o title ainda vale para o "voltar" do iOS e para o leitor de tela */}
      <Stack.Screen name="Busca" component={TelaBusca} options={{ title: 'Carros' }} />
      <Stack.Screen name="Veiculo" component={TelaVeiculo} options={{ title: 'Anúncio' }} />
    </Stack.Navigator>
  )
}

const estilos = StyleSheet.create({
  pilula: {
    height: 28,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: raios.pilula,
    borderWidth: 1,
    borderColor: cores.line,
    backgroundColor: 'transparent',
  },
  // accent só sobre fundo escuro: em fundo claro o contraste é 1,73:1
  pilulaLigada: { backgroundColor: cores.ink, borderColor: cores.ink },
  rotulo: { ...tipo.corpoForte, fontSize: 13, color: cores.inkSoft },
  rotuloLigado: { color: cores.accent },
})
