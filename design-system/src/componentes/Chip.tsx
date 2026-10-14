import { Platform, Pressable, StyleSheet, Text } from 'react-native'
import { cores, raios, tipo } from '../tokens'
import { Icone, type NomeIcone } from './Icone'

type Props = {
  rotulo: string
  onPress: () => void
  /** só faz sentido com papel checkbox/radio (aí ganha ✓ e aria-checked) */
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
  // no react-native-web, Espaço só ativa role button/menuitem; checkbox e radio precisam responder a ele
  const teclado =
    Platform.OS === 'web' && marcavel
      ? {
          onKeyDown: (e: { key: string; preventDefault(): void }) => {
            if (e.key === ' ') {
              e.preventDefault()
              onPress()
            }
          },
        }
      : {}
  return (
    <Pressable
      {...teclado}
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
    // branco com borda sutil: aparece tanto sobre o fundo surface da página quanto sobre painéis brancos
    // (o texto identifica o controle; a borda é decorativa, WCAG 1.4.11 não a exige)
    borderWidth: 1,
    borderColor: cores.line,
    backgroundColor: cores.bg,
  },
  selecionado: { backgroundColor: cores.ink, borderColor: cores.ink },
  pressionado: { opacity: 0.8 },
  texto: { fontSize: 14 },
})
