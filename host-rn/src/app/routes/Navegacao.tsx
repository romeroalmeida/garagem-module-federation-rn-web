import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { Veiculo } from '@busca/tipos'
import { TelaBusca } from '@/features/busca/screens/TelaBusca'
import { TelaVeiculo } from '@/features/veiculo/screens/TelaVeiculo'

export type Rotas = {
  Busca: undefined
  Veiculo: { veiculo: Veiculo }
}

const Stack = createNativeStackNavigator<Rotas>()

export function Navegacao() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Busca" component={TelaBusca} options={{ title: 'Garagem · host app' }} />
      <Stack.Screen name="Veiculo" component={TelaVeiculo} options={{ title: 'Detalhe' }} />
    </Stack.Navigator>
  )
}
