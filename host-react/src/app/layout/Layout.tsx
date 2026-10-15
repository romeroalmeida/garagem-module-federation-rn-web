import type { CSSProperties } from 'react'
import { Outlet } from 'react-router'
import { cores } from '@garagem/ds'
import { FronteirasProvider } from '@/shared/components/Fronteira'
import { Cabecalho } from './Cabecalho'
import { Rodape } from './Rodape'

export function Layout() {
  return (
    <FronteirasProvider>
      <div style={estilos.raiz}>
        <Cabecalho />
        <main style={estilos.main}>
          <Outlet />
          {/* dentro do <main>: o rodapé aparece no fim do scroll, não fixo na tela */}
          <Rodape />
        </main>
      </div>
    </FronteirasProvider>
  )
}

const estilos = {
  raiz: { display: 'flex', flexDirection: 'column', height: '100%', background: cores.surface },
  // o <main> é quem rola (o aside sticky da página do carro conta a partir dele)
  main: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' },
} satisfies Record<string, CSSProperties>
