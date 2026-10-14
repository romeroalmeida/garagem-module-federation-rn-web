import type { CSSProperties } from 'react'
import { Outlet } from 'react-router'

export function Layout() {
  return (
    <div style={estilos.raiz}>
      <header style={estilos.cabecalho}>
        <strong style={estilos.marca}>Garagem</strong>
        <span style={estilos.etiqueta}>host web</span>
      </header>
      <main style={estilos.main}>
        <Outlet />
      </main>
    </div>
  )
}

const estilos = {
  raiz: { display: 'flex', flexDirection: 'column', height: '100%' },
  cabecalho: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#18181b', color: '#fff' },
  marca: { fontSize: 20 },
  etiqueta: { fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#3f3f46' },
  main: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' },
} satisfies Record<string, CSSProperties>
