import type { CSSProperties } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cores, raios, tipo } from '@garagem/ds'

/**
 * Link com cara de botão primário. A classe `cta` vem junto de propósito:
 * o hover (fundo mais escuro) mora no CSS global, porque style inline não faz :hover.
 */
export function LinkCta({ style, ...props }: LinkProps) {
  return <Link {...props} className="cta" style={{ ...estilos.cta, ...style }} />
}

const estilos = {
  cta: {
    ...tipo.corpoForte,
    color: cores.bg,
    background: cores.ink,
    height: 44,
    padding: '0 20px',
    borderRadius: raios.botao,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },
} satisfies Record<string, CSSProperties>
