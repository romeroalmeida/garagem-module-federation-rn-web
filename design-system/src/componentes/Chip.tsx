import { Pressable, StyleSheet, Text } from 'react-native'
import { cores, raios, tipo } from '../tokens'
import { Icone, type NomeIcone } from './Icone'

type Props = {
  rotulo: string
  onPress: () => void
  selecionado?: boolean
  papel?: 'checkbox' | 'radio' | 'button'
  /** mostra × e anuncia "Remover {rotulo}" */
  removivel?: boolean
  icone?: NomeIcone
}

/** Pílula com alvo mínimo de 44px. Marcado = fundo ink **e** ✓ (não depende só de cor). */
export function Chip({ rotulo, onPress, selecionado = false, papel = 'button', removivel, icone }: Props) {
  const corConteudo = selecionado ? cores.bg : cores.ink
  const marcavel = papel !== 'button'
  return (
    <Pressable
      role={papel}
      aria-checked={marcavel ? selecionado : undefined}
      aria-label={removivel ? `Remover ${rotulo}` : undefined}
      onPress={onPress}
      style={({ pressed }) => [estilos.base, selecionado && estilos.selecionado, pressed && estilos.pressionado]}
    >
      {marcavel && selecionado && <Icone nome="Check" tamanho={16} cor={corConteudo} />}
      {icone && <Icone nome={icone} tamanho={16} cor={corConteudo} />}
      <Text style={[tipo.corpoForte, estilos.texto, { color: corConteudo }]}>{rotulo}</Text>
      {removivel && <Icone nome="X" tamanho={16} cor={corConteudo} />}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: raios.pilula,
    borderWidth: 1,
    // borda de controle precisa de 3:1 — `line` dá 1,36:1 no branco; inkSoft dá 5,38:1
    borderColor: cores.inkSoft,
    backgroundColor: cores.bg,
  },
  selecionado: { backgroundColor: cores.ink, borderColor: cores.ink },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: 14 },
})
