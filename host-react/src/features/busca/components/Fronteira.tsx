import type { CSSProperties, ReactNode } from 'react'

/** Só visual: mostra no estudo onde termina o host e começa o remote. */
export function Fronteira({ children }: { children: ReactNode }) {
  return (
    <div style={estilos.borda}>
      <span style={estilos.etiqueta}>remote: busca</span>
      {children}
    </div>
  )
}

const estilos = {
  borda: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: 8,
    border: '2px dashed #7c3aed',
    borderRadius: 8,
  },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: 600, color: '#7c3aed' },
} satisfies Record<string, CSSProperties>
