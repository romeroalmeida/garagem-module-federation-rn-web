import { Platform, type TextStyle } from 'react-native'

export const cores = {
  ink: '#171717',
  inkSoft: '#6A6977',
  bg: '#FFFFFF',
  surface: '#F5F2F8',
  carStage: '#E4E2DF',
  line: '#DCDCE9',
  accent: '#00E0A0',
  accentSoft: '#C9FFF0',
  // accent escurecido para texto sobre fundo claro: 5,36:1 no branco (o accent puro dá 1,73:1)
  accentInk: '#007A57',
  alert: '#E22446',
} as const

export const raios = { pilula: 100, card: 16, botao: 12 } as const

// sombras suaves; boxShadow funciona no RN 0.76+ (nova arquitetura) e no react-native-web
export const sombras = {
  card: '0 1px 2px rgba(23, 23, 23, 0.06), 0 8px 24px rgba(23, 23, 23, 0.08)',
  elevada: '0 2px 4px rgba(23, 23, 23, 0.08), 0 16px 32px rgba(23, 23, 23, 0.14)',
} as const
export const espaco = (n: number) => n * 8
export const CONTAINER = 1200

// iOS: cada peso é uma família (nome PostScript da fonte); web: família + fontWeight
const familias = Platform.select({
  web: {
    display: '"Archivo Black", sans-serif',
    regular: 'Figtree, sans-serif',
    semibold: 'Figtree, sans-serif',
    bold: 'Figtree, sans-serif',
  },
  default: {
    display: 'ArchivoBlack-Regular',
    regular: 'Figtree-Regular',
    semibold: 'Figtree-SemiBold',
    bold: 'Figtree-Bold',
  },
})
const peso = (fontWeight: '400' | '600' | '700'): Pick<TextStyle, 'fontWeight'> => (Platform.OS === 'web' ? { fontWeight } : {})

export const tipo = {
  // 400 explícito: a Archivo Black só tem esse peso (sem isso, um <h1> na web vira negrito falso)
  display: { fontFamily: familias.display, ...peso('400'), textTransform: 'uppercase', letterSpacing: 0.5, color: cores.ink },
  titulo: { fontFamily: familias.bold, ...peso('700'), fontSize: 20, color: cores.ink },
  corpo: { fontFamily: familias.regular, ...peso('400'), fontSize: 16, color: cores.ink },
  corpoForte: { fontFamily: familias.semibold, ...peso('600'), fontSize: 16, color: cores.ink },
  legenda: { fontFamily: familias.regular, ...peso('400'), fontSize: 13, color: cores.inkSoft },
  preco: { fontFamily: familias.bold, ...peso('700'), fontSize: 22, color: cores.ink },
} satisfies Record<string, TextStyle>
