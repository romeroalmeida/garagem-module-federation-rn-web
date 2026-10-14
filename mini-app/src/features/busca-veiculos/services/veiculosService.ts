import type { CreditoFoto, Veiculo } from '../types'
import { fonteDaImagem } from '../utils/fonteImagem'
import { FOTOS } from './fotos'
import creditos from './fotos/creditos.json'
import dados from './veiculos.json'

const creditosPorId = creditos as Record<string, CreditoFoto | undefined>

// ponytail: JSON local; quando virar API, só este arquivo muda
const veiculos: Veiculo[] = (dados as Omit<Veiculo, 'foto' | 'creditoFoto'>[]).map((v) => {
  const credito = creditosPorId[v.id]
  return {
    ...v,
    foto: fonteDaImagem(FOTOS[v.id]),
    // só os campos do contrato (o creditos.json também traz a cor)
    creditoFoto: credito && {
      autor: credito.autor,
      licenca: credito.licenca,
      licencaUrl: credito.licencaUrl,
      fonte: credito.fonte,
    },
  }
})

export function listarVeiculos(): Veiculo[] {
  return veiculos
}

export function listarMarcas(): string[] {
  return [...new Set(veiculos.map((v) => v.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
