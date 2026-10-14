import { useState, type CSSProperties } from 'react'
import { useWindowDimensions } from 'react-native'
import { Link, useLocation, useNavigate } from 'react-router'
import { Botao, Selo, Silhueta, cores, raios, tipo } from '@garagem/ds'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const inteiro = new Intl.NumberFormat('pt-BR')
// o host não importa código do remote: rótulos próprios, tipados pelo contrato
const CAMBIO: Record<Veiculo['cambio'], string> = { manual: 'Manual', automatico: 'Automático' }
const COMBUSTIVEL: Record<Veiculo['combustivel'], string> = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' }
const CARROCERIA: Record<Veiculo['carroceria'], string> = { hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape' }
const DESKTOP = 1024

function irParaSimulador() {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('simulador')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
}

export function PaginaVeiculo() {
  const navigate = useNavigate()
  const veiculo = (useLocation().state as { veiculo?: Veiculo } | null)?.veiculo
  const [proposta, setProposta] = useState<Simulacao>()
  const { width } = useWindowDimensions()
  const desktop = width >= DESKTOP

  // Sem state = URL aberta numa aba nova (F5 na mesma aba mantém o state)
  if (!veiculo) {
    return (
      <div style={estilos.vazio}>
        <h1 style={estilos.titulo}>Anúncio não encontrado</h1>
        <Link to="/busca">Ir para a busca</Link>
      </div>
    )
  }

  const specs: [string, string][] = [
    ['Cidade', `${veiculo.cidade} - ${veiculo.uf}`],
    ['Ano', String(veiculo.ano)],
    ['Km', inteiro.format(veiculo.km)],
    ['Câmbio', CAMBIO[veiculo.cambio]],
    ['Combustível', COMBUSTIVEL[veiculo.combustivel]],
    ['Carroceria', CARROCERIA[veiculo.carroceria]],
  ]

  const simulador = (
    <div id="simulador" style={estilos.simulador}>
      <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
      {/* região viva sempre montada: inserida já com texto, a primeira proposta pode não ser anunciada */}
      <div role="status">
        {proposta && <Selo tom="positivo" texto={`Proposta enviada ✓ — ${proposta.prazo}x de ${parcela.format(proposta.parcela)}`} />}
      </div>
    </div>
  )

  return (
    <div style={desktop ? estilos.grade : estilos.coluna}>
      <div style={estilos.principal}>
        <div style={estilos.foto}>
          <Silhueta carroceria={veiculo.carroceria} />
        </div>
        <h1 style={estilos.titulo}>
          {veiculo.marca} <span style={{ color: cores.accentInk }}>{veiculo.modelo}</span>
        </h1>
        <p style={estilos.versao}>{veiculo.versao}</p>
        <dl style={estilos.specs}>
          {specs.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt style={estilos.specRotulo}>{rotulo}</dt>
              <dd style={estilos.specValor}>{valor}</dd>
            </div>
          ))}
        </dl>
        {!desktop && simulador}
        <Botao variante="contorno" rotulo="Voltar para a busca" onPress={() => navigate(-1)} />
      </div>

      {desktop ? (
        <aside style={estilos.lateral}>
          <p style={estilos.preco}>{preco.format(veiculo.preco)}</p>
          {simulador}
        </aside>
      ) : (
        // correção em relação à Webmotors: o preço não some no celular
        <div style={estilos.barra}>
          <span style={estilos.preco}>{preco.format(veiculo.preco)}</span>
          <Botao variante="acao" rotulo="Ver parcelas" onPress={irParaSimulador} />
        </div>
      )}
    </div>
  )
}

const estilos = {
  vazio: { maxWidth: 720, width: '100%', margin: '0 auto', padding: 24, boxSizing: 'border-box' },
  coluna: { maxWidth: 720, width: '100%', margin: '0 auto', padding: '16px 16px 112px', boxSizing: 'border-box' },
  grade: {
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: 24,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 420px',
    gap: 32,
    alignItems: 'start',
  },
  principal: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  foto: { borderRadius: raios.card, overflow: 'hidden' },
  // fontWeight 400: o <h1> aplica bold e a Archivo Black só tem 400 (o navegador faria negrito falso)
  titulo: { ...tipo.display, fontWeight: 400, fontSize: 32, lineHeight: 1.1, margin: 0 },
  versao: { ...tipo.legenda, margin: 0, textTransform: 'uppercase' },
  specs: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, margin: 0 },
  specRotulo: { ...tipo.legenda },
  specValor: { ...tipo.corpoForte, margin: 0 },
  simulador: { display: 'flex', flexDirection: 'column', gap: 12 },
  // o scroll é do <main> (abaixo do header), então o sticky conta a partir dele
  lateral: { position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  preco: { ...tipo.preco, fontSize: 28, margin: 0 },
  barra: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    background: cores.bg,
    borderTop: `1px solid ${cores.line}`,
    zIndex: 10,
  },
} satisfies Record<string, CSSProperties>
