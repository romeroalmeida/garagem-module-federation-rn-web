import { createContext, use, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'

type Props = { nome: string; children: ReactNode }
type Fronteiras = { visivel: boolean; alternar: () => void }

const CHAVE = 'garagem:fronteiras'
// padrão sem provider: escondida (um remote renderizado fora do Layout continua funcionando)
const ContextoFronteiras = createContext<Fronteiras>({ visivel: false, alternar: () => {} })

function lerPreferencia() {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    // aba privada ou armazenamento bloqueado: começa escondida
    return false
  }
}

/** Liga/desliga as fronteiras do estudo; a escolha sobrevive ao F5. */
export function FronteirasProvider({ children }: { children: ReactNode }) {
  const [visivel, setVisivel] = useState(lerPreferencia)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, visivel ? '1' : '0')
    } catch {
      // sem armazenamento: vale só para esta visita
    }
  }, [visivel])

  const valor = useMemo(() => ({ visivel, alternar: () => setVisivel((v) => !v) }), [visivel])
  return <ContextoFronteiras value={valor}>{children}</ContextoFronteiras>
}

export function useFronteiras(): Fronteiras {
  return use(ContextoFronteiras)
}

/** Só visual: mostra no estudo onde termina o host e começa cada remote. */
export function Fronteira({ nome, children }: Props) {
  const { visivel } = useFronteiras()
  // uma árvore só (o rótulo ocupa a 1ª posição mesmo quando é false): alternar não remonta o remote
  return (
    <div style={visivel ? estilos.borda : estilos.encaixe}>
      {visivel && <span style={estilos.etiqueta}>remote: {nome}</span>}
      {children}
    </div>
  )
}

const encaixe = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } satisfies CSSProperties

const estilos = {
  encaixe,
  borda: { ...encaixe, margin: 8, border: '2px dashed #7c3aed', borderRadius: 8 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: 600, color: '#7c3aed' },
} satisfies Record<string, CSSProperties>
