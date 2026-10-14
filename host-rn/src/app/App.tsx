import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Navegacao } from './routes/Navegacao'

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navegacao />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
