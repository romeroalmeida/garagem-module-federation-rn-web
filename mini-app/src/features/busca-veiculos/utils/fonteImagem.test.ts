import { describe, expect, it } from 'vitest'
import { fonteDaImagem } from './fonteImagem'

describe('fonteDaImagem', () => {
  it('string (URL do asset/resource na web) vira { uri }', () => {
    expect(fonteDaImagem('http://localhost:3001/7a1b.jpg')).toEqual({ uri: 'http://localhost:3001/7a1b.jpg' })
  })

  it('número (asset do bundle nativo) passa direto', () => {
    expect(fonteDaImagem(42)).toBe(42)
  })

  it('objeto { uri } (inline base64 do Re.Pack) passa direto', () => {
    const fonte = { uri: 'data:image/jpeg;base64,AAAA', width: 800, height: 600 }
    expect(fonteDaImagem(fonte)).toBe(fonte)
  })

  it('qualquer outra coisa vira undefined', () => {
    expect(fonteDaImagem(undefined)).toBeUndefined()
    expect(fonteDaImagem(null)).toBeUndefined()
    expect(fonteDaImagem({ width: 800 })).toBeUndefined()
  })
})
