import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { CONTAINER, Logo, cores, raios, tipo } from '@garagem/ds'
import { useFronteiras } from '@/shared/components/Fronteira'

const COLUNAS = [
  {
    titulo: 'Comprar',
    links: [
      { rotulo: 'Todos os carros', para: '/busca' },
      { rotulo: 'Mais baratos', para: '/busca?ordem=menor-preco' },
      { rotulo: 'Mais novos', para: '/busca?ordem=mais-novos' },
      { rotulo: 'Menor km', para: '/busca?ordem=menor-km' },
    ],
  },
  {
    titulo: 'Vender e financiar',
    links: [
      { rotulo: 'Anunciar grátis', para: '/em-breve/vender' },
      { rotulo: 'Simular parcela', para: '/em-breve/financiar' },
      { rotulo: 'Tabela FIPE', para: '/em-breve/fipe' },
    ],
  },
  {
    titulo: 'Garagem',
    links: [
      { rotulo: 'Sobre o estudo', para: '/em-breve/sobre' },
      { rotulo: 'Privacidade', para: '/em-breve/privacidade' },
    ],
  },
] as const

// o padding de baixo fica no CSS global: ele cresce quando há a barra fixa de preço (celular)
export function Rodape() {
  const { visivel, alternar } = useFronteiras()

  return (
    <footer className="rodape" style={estilos.rodape}>
      <div style={estilos.interno}>
        <div style={estilos.marca}>
          <Logo />
          <p style={estilos.slogan}>O jeito fácil de trocar de carro.</p>
        </div>

        <div style={estilos.colunas}>
          {COLUNAS.map(({ titulo, links }) => (
            <nav key={titulo} aria-label={titulo}>
              <h2 style={estilos.tituloColuna}>{titulo}</h2>
              <ul style={estilos.lista}>
                {links.map(({ rotulo, para }) => (
                  <li key={para}>
                    <Link to={para} style={estilos.link}>
                      {rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div style={estilos.base}>
          <p style={estilos.legal}>© 2026 Garagem · estudo de micro-frontends · dados fictícios</p>
          {/* rótulo fixo: o estado vai no aria-pressed (o leitor de tela anuncia "pressionado") */}
          <button
            type="button"
            aria-pressed={visivel}
            onClick={alternar}
            style={visivel ? { ...estilos.alternar, ...estilos.alternarLigado } : estilos.alternar}
          >
            Ver micro-frontends
          </button>
        </div>
      </div>
    </footer>
  )
}

const estilos = {
  // marginTop auto: em página curta o rodapé desce até o fim do <main>, sem faixa vazia embaixo
  rodape: { flexShrink: 0, marginTop: 'auto', background: cores.ink, color: cores.bg },
  interno: {
    maxWidth: CONTAINER,
    margin: '0 auto',
    boxSizing: 'border-box',
    padding: '48px 16px 0',
    display: 'grid',
    gap: 40,
  },
  // coluna flex: o Logo é uma View (display flex) e, num bloco comum, esticaria na largura toda
  marca: { display: 'flex', flexDirection: 'column', gap: 16 },
  slogan: { ...tipo.corpoForte, fontSize: 18, color: cores.bg, margin: 0 },
  colunas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '32px 24px' },
  // accent liberado aqui: sobre o ink ele tem contraste (no fundo claro, não)
  tituloColuna: {
    ...tipo.corpoForte,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: cores.accent,
    margin: '0 0 16px',
  },
  lista: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 },
  link: { ...tipo.corpo, fontSize: 15, color: cores.bg },
  base: {
    borderTop: '1px solid rgba(255, 255, 255, 0.16)',
    paddingTop: 20,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  legal: { ...tipo.legenda, color: 'rgba(255, 255, 255, 0.72)', margin: 0 },
  alternar: {
    ...tipo.corpoForte,
    fontSize: 14,
    height: 40,
    padding: '0 16px',
    borderRadius: raios.pilula,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'transparent',
    color: cores.bg,
    cursor: 'pointer',
  },
  // border inteiro (não só a cor): trocar shorthand por longhand faz o React avisar de conflito
  alternarLigado: { background: cores.accent, color: cores.ink, border: `1px solid ${cores.accent}` },
} satisfies Record<string, CSSProperties>
