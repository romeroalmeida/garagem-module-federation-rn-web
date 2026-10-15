import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { FronteirasProvider } from '@/shared/components/Fronteira'
import { Navegacao } from './routes/Navegacao'

export default function App() {
  return (
    <SafeAreaProvider>
      <FronteirasProvider>
        <NavigationContainer>
          <Navegacao />
        </NavigationContainer>
      </FronteirasProvider>
    </SafeAreaProvider>
  )
}
