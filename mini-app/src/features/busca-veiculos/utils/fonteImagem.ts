import type { FonteImagem } from '../types'

/** Normaliza o que o bundler devolve no import de uma imagem para o `source` do <Image>. */
export function fonteDaImagem(modulo: unknown): FonteImagem | undefined {
  // web: asset/resource devolve a URL do arquivo
  if (typeof modulo === 'string') return { uri: modulo }
  // nativo: número (registro de assets) ou { uri } (inline em base64 do Re.Pack)
  if (typeof modulo === 'number') return modulo
  if (typeof modulo === 'object' && modulo !== null && typeof (modulo as { uri?: unknown }).uri === 'string') {
    return modulo as FonteImagem
  }
  return undefined
}
