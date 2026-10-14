import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { Filtros } from '@busca/tipos'
import { RemoteBusca } from '../components/RemoteBusca'
import type { Rotas } from '@/shared/types/rotas'

export function TelaBusca({ navigation }: NativeStackScreenProps<Rotas, 'Busca'>) {
  // A pilha mantém esta tela montada; o useState só importa se o mini-app remontar
  const [filtros, setFiltros] = useState<Filtros>()

  return (
    <RemoteBusca
      filtrosIniciais={filtros}
      onFiltrosMudaram={setFiltros}
      onSelecionarVeiculo={(veiculo) => navigation.navigate('Veiculo', { veiculo })}
    />
  )
}
