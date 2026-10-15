import type { CSSProperties } from 'react'
import { useWindowDimensions } from 'react-native'
import { Link, NavLink } from 'react-router'
import { CONTAINER, Icone, Logo, cores, raios, sombras, tipo } from '@garagem/ds'
import { LinkCta } from '@/shared/components/LinkCta'

const DESKTOP = 1024
const ALTURA = 72
const LINKS = [
  { rotulo: 'Comprar', para: '/busca' },
  { rotulo: 'Vender', para: '/em-breve/vender' },
  { rotulo: 'Financiar', para: '/em-breve/financiar' },
  { rotulo: 'Tabela FIPE', para: '/em-breve/fipe' },
] as const

const comAtivo = (base: CSSProperties) => ({ isActive }: { isActive: boolean }) => (isActive ? { ...base, ...estilos.ativo } : base)

export function Cabecalho() {
  const { width } = useWindowDimensions()
  const desktop = width >= DESKTOP

  return (
    <header className="cabecalho" style={estilos.cabecalho}>
      <div style={estilos.interno}>
        {/* "marca": fica fora do sublinhado de hover (ele atravessaria o texto da placa) */}
        <Link to="/" className="marca" aria-label="Garagem, página inicial" style={estilos.marca}>
          <Logo />
        </Link>

        {desktop ? (
          <>
            <nav aria-label="Principal" style={estilos.nav}>
              {LINKS.map(({ rotulo, para }) => (
                <NavLink key={para} to={para} style={comAtivo(estilos.link)}>
                  {rotulo}
                </NavLink>
              ))}
            </nav>
            <div style={estilos.acoes}>
              <NavLink to="/em-breve/favoritos" style={comAtivo(estilos.linkIcone)}>
                <Icone nome="Heart" />
                Favoritos
              </NavLink>
              <NavLink to="/em-breve/entrar" style={comAtivo(estilos.link)}>
                Entrar
              </NavLink>
              <LinkCta to="/em-breve/vender">Anunciar grátis</LinkCta>
            </div>
          </>
        ) : (
          <div style={estilos.acoesMobile}>
            <NavLink to="/em-breve/favoritos" aria-label="Favoritos" style={estilos.botaoIcone}>
              <Icone nome="Heart" tamanho={22} />
            </NavLink>
            <button type="button" popoverTarget="menu-principal" aria-label="Menu" style={estilos.botaoIcone}>
              <Icone nome="Menu" tamanho={22} />
            </button>
          </div>
        )}
      </div>

      {/* popover nativo: abrir, fechar, Esc e clique fora sem estado no React. Fica dentro do
          <header> para valerem as regras de .cabecalho a (o top layer não muda o DOM) */}
      {!desktop && (
        <nav
          id="menu-principal"
          popover="auto"
          aria-label="Principal"
          style={estilos.menu}
          onClick={(e) => {
            // a página não recarrega ao navegar: sem isto o menu continuaria aberto
            if ((e.target as HTMLElement).closest('a')) e.currentTarget.hidePopover()
          }}
        >
          <div style={estilos.menuLista}>
            {LINKS.map(({ rotulo, para }) => (
              <LinhaMenu key={para} para={para} rotulo={rotulo} />
            ))}
            <LinhaMenu para="/em-breve/entrar" rotulo="Entrar" />
            <LinkCta to="/em-breve/vender" style={estilos.ctaMenu}>
              Anunciar grátis
            </LinkCta>
          </div>
        </nav>
      )}
    </header>
  )
}

function LinhaMenu({ para, rotulo }: { para: string; rotulo: string }) {
  return (
    <NavLink to={para} style={estilos.linhaMenu}>
      {/* o realce do ativo vai no texto, não na linha de 48px inteira */}
      {({ isActive }) => <span style={comAtivo(estilos.rotuloLinha)({ isActive })}>{rotulo}</span>}
    </NavLink>
  )
}

// borda transparente reservada: o link ativo não desloca 2px
const sublinhavel = { paddingBottom: 2, borderBottom: '2px solid transparent' } satisfies CSSProperties

const estilos = {
  cabecalho: { flexShrink: 0, background: cores.bg, borderBottom: `1px solid ${cores.line}` },
  interno: {
    maxWidth: CONTAINER,
    margin: '0 auto',
    boxSizing: 'border-box',
    height: ALTURA,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  marca: { display: 'flex', flexShrink: 0 },
  nav: { display: 'flex', alignItems: 'center', gap: 28 },
  link: { ...tipo.corpoForte, color: cores.ink, ...sublinhavel },
  linkIcone: { ...tipo.corpoForte, color: cores.ink, ...sublinhavel, display: 'inline-flex', alignItems: 'center', gap: 6 },
  // shorthand, como na base: trocar borderBottom por borderBottomColor faz o React avisar de conflito
  ativo: { borderBottom: `2px solid ${cores.ink}` },
  acoes: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 },
  acoesMobile: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 },
  botaoIcone: {
    width: 44,
    height: 44,
    padding: 0,
    border: 0,
    borderRadius: raios.botao,
    background: 'transparent',
    color: cores.ink,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // sem `display` aqui: ele venceria o [popover]:not(:popover-open) { display: none } do navegador
  menu: {
    position: 'fixed',
    inset: `${ALTURA}px 0 auto 0`,
    margin: 0,
    width: '100%',
    maxWidth: 'none',
    boxSizing: 'border-box',
    border: 0,
    padding: 16,
    background: cores.bg,
    color: cores.ink,
    boxShadow: sombras.elevada,
  },
  menuLista: { display: 'flex', flexDirection: 'column' },
  linhaMenu: { ...tipo.corpoForte, color: cores.ink, display: 'flex', alignItems: 'center', minHeight: 48 },
  rotuloLinha: sublinhavel,
  ctaMenu: { marginTop: 12 },
} satisfies Record<string, CSSProperties>
