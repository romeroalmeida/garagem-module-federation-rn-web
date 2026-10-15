import type { CSSProperties } from 'react'
import { useParams } from 'react-router'
import { Titulo, tipo } from '@garagem/ds'
import { LinkCta } from '@/shared/components/LinkCta'

type Secao = { titulo: string; texto?: string }

// os links do cabeçalho e do rodapé que ainda não têm página caem aqui
const SECOES: Record<string, Secao> = {
  vender: { titulo: 'Vender meu carro' },
  financiar: {
    titulo: 'Financiamento',
    texto: 'A simulação fica na página de cada carro: escolha um e veja as parcelas.',
  },
  fipe: { titulo: 'Tabela FIPE' },
  favoritos: { titulo: 'Favoritos' },
  entrar: { titulo: 'Entrar' },
  sobre: {
    titulo: 'Sobre o estudo',
    texto:
      'Garagem é um estudo de micro-frontends com Module Federation: a busca e o simulador são remotes independentes, compostos por um host web e por um app nativo. Os dados são fictícios.',
  },
  privacidade: {
    titulo: 'Privacidade',
    texto: 'Este estudo não tem cadastro nem login e não guarda dados pessoais. As fontes são carregadas do Google Fonts.',
  },
}
const TEXTO_PADRAO = 'Esta parte do portal ainda não foi construída neste estudo.'

export function PaginaEmBreve() {
  const { secao = '' } = useParams()
  // Object.hasOwn: /em-breve/constructor não pode achar o Object.prototype
  const { titulo, texto = TEXTO_PADRAO } = Object.hasOwn(SECOES, secao) ? SECOES[secao] : { titulo: 'Em breve' }

  return (
    <div style={estilos.pagina}>
      <Titulo nivel={1} tamanho="grande">
        {titulo}
      </Titulo>
      <p style={estilos.texto}>{texto}</p>
      <LinkCta to="/busca">Ver carros à venda</LinkCta>
    </div>
  )
}

const estilos = {
  pagina: {
    maxWidth: 720,
    width: '100%',
    margin: '0 auto',
    padding: '64px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
  },
  texto: { ...tipo.corpo, margin: 0 },
} satisfies Record<string, CSSProperties>
