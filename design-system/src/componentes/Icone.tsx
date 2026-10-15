// Um import por ícone: o barrel do lucide traz o ícone "infinity", que declara `const Infinity`
// e o parser do Hermes recusa ("shadows a global property") — nenhum bundle nativo compilaria.
import Calendar from 'lucide-react-native/icons/calendar'
import Check from 'lucide-react-native/icons/check'
import Cog from 'lucide-react-native/icons/cog'
import Fuel from 'lucide-react-native/icons/fuel'
import Gauge from 'lucide-react-native/icons/gauge'
import Heart from 'lucide-react-native/icons/heart'
import MapPin from 'lucide-react-native/icons/map-pin'
import Menu from 'lucide-react-native/icons/menu'
import Search from 'lucide-react-native/icons/search'
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal'
import X from 'lucide-react-native/icons/x'
import { cores } from '../tokens'

const ICONES = { Calendar, Check, Cog, Fuel, Gauge, Heart, MapPin, Menu, Search, SlidersHorizontal, X }
export type NomeIcone = keyof typeof ICONES

type Props = { nome: NomeIcone; tamanho?: number; cor?: string }

/** Subconjunto do Lucide, traço fino. Decorativo: quem usa dá o texto ao lado. */
export function Icone({ nome, tamanho = 18, cor = cores.ink }: Props) {
  const Componente = ICONES[nome]
  return <Componente size={tamanho} color={cor} strokeWidth={1.75} />
}
