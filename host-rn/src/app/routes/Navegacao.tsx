import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { cores, tipo } from '@garagem/ds'
import type { Rotas } from '@/shared/types/rotas'
import { TelaBusca } from '@/features/busca/screens/TelaBusca'
import { TelaVeiculo } from '@/features/veiculo/screens/TelaVeiculo'

const Stack = createNativeStackNavigator<Rotas>()

export function Navegacao() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontFamily: tipo.display.fontFamily, color: cores.ink },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.surface },
      }}
    >
      <Stack.Screen name="Busca" component={TelaBusca} options={{ title: 'GARAGEM · host app' }} />
      <Stack.Screen name="Veiculo" component={TelaVeiculo} options={{ title: 'Detalhe' }} />
    </Stack.Navigator>
  )
}
