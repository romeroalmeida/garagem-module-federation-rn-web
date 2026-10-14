import { useNavigate, useSearchParams } from 'react-router'
import { RemoteBusca } from '@/app/layout/RemoteBusca'
import { gravarFiltros, lerFiltros } from '../utils/filtrosUrl'

export function PaginaBusca() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  return (
    <RemoteBusca
      // o mini-app só lê isto na montagem; depois ele é dono do estado
      filtrosIniciais={lerFiltros(params)}
      onFiltrosMudaram={(filtros) => setParams(gravarFiltros(filtros), { replace: true })}
      onSelecionarVeiculo={(veiculo) => navigate(`/veiculo/${veiculo.id}`, { state: { veiculo } })}
    />
  )
}
