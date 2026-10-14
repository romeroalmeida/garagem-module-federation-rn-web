import { Calendar, Check, Cog, Fuel, Gauge, MapPin, Search, SlidersHorizontal, X } from 'lucide-react-native'
import { cores } from '../tokens'

const ICONES = { Calendar, Check, Cog, Fuel, Gauge, MapPin, Search, SlidersHorizontal, X }
export type NomeIcone = keyof typeof ICONES

type Props = { nome: NomeIcone; tamanho?: number; cor?: string }

/** Subconjunto do Lucide, traço fino. Decorativo: quem usa dá o texto ao lado. */
export function Icone({ nome, tamanho = 18, cor = cores.ink }: Props) {
  const Componente = ICONES[nome]
  return <Componente size={tamanho} color={cor} strokeWidth={1.75} />
}
