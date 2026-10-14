import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { cores, tipo } from '@garagem/ds'

export function Layout() {
  return (
    <div style={estilos.raiz}>
      <header style={estilos.cabecalho}>
        <span style={estilos.logo}>Garagem</span>
        <nav aria-label="Principal">
          <NavLink to="/busca" style={({ isActive }) => ({ ...estilos.link, ...(isActive ? estilos.ativo : {}) })}>
            Comprar
          </NavLink>
        </nav>
        <span style={estilos.etiqueta}>host web</span>
      </header>
      <main style={estilos.main}>
        <Outlet />
      </main>
    </div>
  )
}

const estilos = {
  raiz: { display: 'flex', flexDirection: 'column', height: '100%', background: cores.bg },
  cabecalho: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '12px 16px',
    background: cores.bg,
    borderBottom: `1px solid ${cores.line}`,
  },
  logo: { ...tipo.display, fontSize: 24 },
  link: { ...tipo.corpoForte, color: cores.ink, textDecoration: 'none', paddingBottom: 2 },
  ativo: { borderBottom: `2px solid ${cores.ink}` },
  etiqueta: { ...tipo.legenda, marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: cores.surface },
  main: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' },
} satisfies Record<string, CSSProperties>
