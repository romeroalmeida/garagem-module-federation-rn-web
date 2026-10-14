import { useState, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const inteiro = new Intl.NumberFormat('pt-BR')
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PaginaVeiculo() {
  const navigate = useNavigate()
  const veiculo = (useLocation().state as { veiculo?: Veiculo } | null)?.veiculo
  const [proposta, setProposta] = useState<Simulacao>()

  // Sem state = URL aberta numa aba nova (F5 na mesma aba mantém o state)
  if (!veiculo) {
    return (
      <div style={estilos.pagina}>
        <h1>Anúncio não encontrado</h1>
        <Link to="/busca">Ir para a busca</Link>
      </div>
    )
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.foto} aria-hidden="true">
        {veiculo.marca[0]}
      </div>
      <h1 style={estilos.nome}>
        {veiculo.marca} {veiculo.modelo} <small style={estilos.versao}>{veiculo.versao}</small>
      </h1>
      <p style={estilos.preco}>{preco.format(veiculo.preco)}</p>
      <p>
        {veiculo.ano} · {inteiro.format(veiculo.km)} km · {veiculo.cidade} - {veiculo.uf}
      </p>
      <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
      {proposta && (
        <p style={estilos.proposta} role="status">
          Proposta enviada ✓ — {proposta.prazo}x de {parcela.format(proposta.parcela)}
        </p>
      )}
      <button type="button" onClick={() => navigate(-1)}>
        Voltar para a busca
      </button>
    </div>
  )
}

const estilos = {
  pagina: { maxWidth: 720, width: '100%', margin: '0 auto', padding: 24, boxSizing: 'border-box' },
  foto: {
    height: 240,
    borderRadius: 8,
    background: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 64,
    fontWeight: 700,
    color: '#71717a',
  },
  nome: { marginBottom: 0 },
  versao: { fontWeight: 400, color: '#52525b' },
  preco: { fontSize: 28, fontWeight: 700, margin: '8px 0' },
  proposta: { margin: '8px', fontWeight: 600, color: '#15803d' },
} satisfies Record<string, CSSProperties>
