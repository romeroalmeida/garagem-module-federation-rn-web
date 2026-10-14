import type { CSSProperties, ReactNode } from 'react'

type Props = { nome: string; children: ReactNode }

/** Só visual: mostra no estudo onde termina o host e começa cada remote. */
export function Fronteira({ nome, children }: Props) {
  return (
    <div style={estilos.borda}>
      <span style={estilos.etiqueta}>remote: {nome}</span>
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
