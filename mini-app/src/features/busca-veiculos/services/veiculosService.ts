import type { Veiculo } from '../types'
import dados from './veiculos.json'

// ponytail: JSON local; quando virar API, só este arquivo muda
const veiculos = dados as Veiculo[]

export function listarVeiculos(): Veiculo[] {
  return veiculos
}

export function listarMarcas(): string[] {
  return [...new Set(veiculos.map((v) => v.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
