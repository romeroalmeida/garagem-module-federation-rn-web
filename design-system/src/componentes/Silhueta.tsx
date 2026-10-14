import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { cores } from '../tokens'

type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'

// Perfis desenhados em viewBox 320×120, chão em y≈112; rodas em y=94
const FORMAS: Record<Carroceria, { corpo: string; rodas: [number, number] }> = {
  hatch: {
    corpo: 'M28 92 V72 Q30 62 48 60 L96 56 L128 34 Q134 30 142 30 H214 Q226 30 234 38 L262 60 Q286 62 292 70 V92 Z',
    rodas: [76, 244],
  },
  sedan: {
    corpo: 'M20 92 V74 Q22 64 40 62 L92 58 L126 36 Q132 32 140 32 H204 Q214 32 222 40 L246 58 L288 62 Q300 64 300 74 V92 Z',
    rodas: [74, 250],
  },
  suv: {
    corpo: 'M24 92 V64 Q26 54 44 52 L84 50 L112 26 Q118 22 126 22 H232 Q244 22 252 32 L272 50 Q292 52 296 62 V92 Z',
    rodas: [78, 246],
  },
  picape: {
    corpo: 'M18 92 V68 Q20 60 34 58 L76 56 L100 32 Q106 28 114 28 H170 Q178 28 182 36 L190 56 H300 V92 Z',
    rodas: [72, 252],
  },
}

type Props = { carroceria: Carroceria }

/** Carro de perfil sobre o fundo carStage, ocupando a largura disponível em 4:3 (substitui foto). */
export function Silhueta({ carroceria }: Props) {
  const { corpo, rodas } = FORMAS[carroceria]
  return (
    <View style={estilos.palco} aria-hidden>
      <Svg viewBox="0 0 320 120" style={estilos.svg}>
        <Path d={corpo} fill={cores.ink} fillOpacity={0.85} />
        {rodas.map((x) => (
          <G key={x}>
            <Circle cx={x} cy={94} r={18} fill={cores.ink} />
            <Circle cx={x} cy={94} r={8} fill={cores.carStage} />
          </G>
        ))}
      </Svg>
    </View>
  )
}

const estilos = StyleSheet.create({
  palco: { width: '100%', aspectRatio: 4 / 3, backgroundColor: cores.carStage, alignItems: 'center', justifyContent: 'center' },
  svg: { width: '86%', aspectRatio: 320 / 120 },
})
