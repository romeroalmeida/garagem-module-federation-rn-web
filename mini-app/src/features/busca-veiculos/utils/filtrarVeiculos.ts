import type { Filtros, Veiculo } from '../types'

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function filtrarVeiculos(veiculos: Veiculo[], filtros: Filtros): Veiculo[] {
  const termo = normalizar(filtros.texto.trim())
  return veiculos.filter(
    (v) =>
      (termo === '' || normalizar(`${v.marca} ${v.modelo} ${v.versao}`).includes(termo)) &&
      (filtros.marcas.length === 0 || filtros.marcas.includes(v.marca)) &&
      (filtros.precoMax === undefined || v.preco <= filtros.precoMax) &&
      (filtros.anoMin === undefined || v.ano >= filtros.anoMin) &&
      (filtros.kmMax === undefined || v.km <= filtros.kmMax),
  )
}
