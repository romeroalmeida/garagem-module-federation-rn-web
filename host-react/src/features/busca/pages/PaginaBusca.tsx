import { useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router'
import { RemoteBusca } from '../components/RemoteBusca'
import { gravarFiltros, lerFiltros } from '../utils/filtrosUrl'

export function PaginaBusca() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const navegacao = useNavigationType()
  // o mini-app só lê filtrosIniciais na montagem: link para /busca?… (PUSH/POP) remonta a busca; o replace dos filtros, não
  const [chave, setChave] = useState(location.key)
  if (navegacao !== 'REPLACE' && location.key !== chave) setChave(location.key)

  return (
    // altura exata da tela sob o header: a lista rola por dentro e o rodapé fica logo abaixo
    <div style={estilos.pagina}>
      <RemoteBusca
        key={chave}
        // o mini-app só lê isto na montagem; depois ele é dono do estado
        filtrosIniciais={lerFiltros(params)}
        onFiltrosMudaram={(filtros) => setParams(gravarFiltros(filtros), { replace: true })}
        onSelecionarVeiculo={(veiculo) => navigate(`/veiculo/${encodeURIComponent(veiculo.id)}`, { state: { veiculo } })}
      />
    </div>
  )
}

const estilos = {
  pagina: { flex: '0 0 100%', minHeight: 0, display: 'flex', flexDirection: 'column' },
} satisfies Record<string, CSSProperties>
