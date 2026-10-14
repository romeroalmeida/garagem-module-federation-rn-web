import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { cores } from '../tokens'

type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'

// Perfis desenhados em viewBox 320×120, chão em y≈112; rodas em y=94
const FORMAS: Record<Carroceria, { corpo: string; rodas: [number, number] }> = {
  // hatch: curto, traseira quase vertical, sem porta-malas
  hatch: {
    corpo: 'M40 92 V72 Q42 62 60 60 L104 56 L134 34 Q140 30 148 30 H240 Q252 30 258 40 L270 62 Q280 64 280 74 V92 Z',
    rodas: [88, 236],
  },
  sedan: {
    corpo: 'M20 92 V74 Q22 64 40 62 L92 58 L126 36 Q132 32 140 32 H204 Q214 32 222 40 L246 58 L288 62 Q300 64 300 74 V92 Z',
    rodas: [74, 250],
  },
  // suv: alto e quadrado, teto até a traseira vertical
  suv: {
    corpo: 'M22 92 V62 Q24 52 42 50 L82 48 L108 24 Q114 20 122 20 H266 Q278 20 282 32 L290 50 Q298 52 298 62 V92 Z',
    rodas: [78, 250],
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
            {/* contorno na cor do fundo separa a roda da carroceria */}
            <Circle cx={x} cy={94} r={18} fill={cores.ink} stroke={cores.carStage} strokeWidth={3} />
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
