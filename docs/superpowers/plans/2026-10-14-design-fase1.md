# Design Fase 1 — design system compartilhado + visual novo — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a identidade visual do prompt "Webmotors + Carwow" aos 4 projetos por meio de um design system único, `@garagem/ds`, compartilhado como singleton pelo Module Federation.

**Architecture:** Pacote `design-system/` (componentes React Native compilados para `dist/`, distribuído por tarball `npm pack` + `file:`). Os 4 projetos instalam o pacote e declaram `@garagem/ds` e `react-native-svg` como `shared` singleton (na web também `react-native`, que é o react-native-web pelo alias); o Lucide **não** é shared (sem tree-shaking ele pesaria 725 KiB por build). O host-react ganha react-native-web. O código nativo (`react-native-svg`) e as fontes ficam no host-rn. A busca evolui o contrato (carroceria, câmbio, combustível, ordem); o financiamento só troca o visual.

**Tech Stack:** React 19.2.3 · RN 0.86.3 · react-native-web 0.21.4 · react-native-svg 15.15.5 · lucide-react-native 1.57.0 · Rspack 1.6.0 · MF enhanced 2.9.2 · Re.Pack 5.4.2 · Vitest 4 · TS 5.9

**Spec:** `docs/superpowers/specs/2026-10-14-design-fase1-design.md`

**Regras para quem executa:**
- Raiz `/Users/romeroalmeida/Romero/estudos/estudo-mf`, branch `feat/design-fase1`. Caminhos relativos à raiz.
- Versões **exatas** (`npm install -E`). Nunca `--force`/`--legacy-peer-deps`; se o install falhar, parar e reportar.
- Commit por tarefa, `git add` por caminho (nunca `-A`), mensagem em português + linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (ex.: `git commit -m "…" -m "Co-Authored-By: …"`). Nunca `push`. Nunca abrir `.env`.
- **Servidores** do controller rodando em 3000, 3001, 3003, 8081, 8082, 8083: não parar nem reiniciar (o controller reinicia na Task 10). 3002 (meu-tramite) e 9000 (MinIO): nunca. Se precisar parar algo seu: `lsof -ti tcp:<porta> -sTCP:LISTEN | xargs kill` (sem o `-sTCP:LISTEN` derruba Chrome e o app do simulador).
- Verificar builds **sem** subir servidor: web com `npx rspack build --config <arquivo>` e apagar o `dist/` gerado; nativo com o `bundle` do Re.Pack (comando em cada task) e apagar o `build/` gerado.
- Escapes visíveis (`\u00A0`), nunca caractere invisível; a ferramenta Write converte `\uXXXX` — prefira heredoc e confira com `grep`/`od`.
- `curl` não existe: use `node -e "fetch(...)"`.

---

## Mapa de arquivos

```
design-system/                                   (novo — Tasks 1-3)
├── package.json · tsconfig.json · garagem-ds-1.0.0.tgz (gerado e commitado)
└── src/
    ├── index.ts · tokens.ts
    └── componentes/ Botao · Chip · Card · Selo · Skeleton · Titulo · Icone · Silhueta

host-rn/                                         (Task 4)
├── assets/fonts/*.ttf · assets/licencas/OFL-*.txt
├── react-native.config.js (+ assets) · rspack.config.mjs (shared) · package.json
└── ios/ (react-native-asset + pod install)

mini-app/                                        (Tasks 5-6)
├── src/features/busca-veiculos/
│   ├── types.ts (+ Carroceria, Cambio, Combustivel, Ordem)
│   ├── services/veiculos.json (+ 3 campos, + BYD Dolphin)
│   ├── utils/ordenar.ts (+ teste) · utils/filtros.ts (+ chipsAtivos, ordem) · utils/formatar.ts (+ rótulos)
│   ├── components/BarraBusca · CardVeiculo · PainelFiltros (reescritos com o DS)
│   └── pages/BuscaVeiculos.tsx (reescrita)
├── rspack.web.config.mjs · rspack.native.config.mjs (shared + HTML)

financiamento/                                   (Task 7)
├── src/features/simulador/utils/entrada.ts (+ entradaPorPercentual, + teste)
├── src/features/simulador/pages/Simulador.tsx (reescrita) · components/SeletorPrazo.tsx (apagado)
├── rspack.web.config.mjs · rspack.native.config.mjs

host-react/                                      (Task 8)
├── package.json (+ RNW, RN, svg, lucide, ds) · rspack.config.mjs (alias RNW, shared, HTML)
├── src/features/busca/utils/filtrosUrl.ts (+ ordem, + teste)
├── src/app/layout/Layout.tsx (header)
├── src/features/busca/components/RemoteBusca.tsx · src/features/veiculo/components/RemoteFinanciamento.tsx (skeleton)
└── src/features/veiculo/pages/PaginaVeiculo.tsx (reescrita)

host-rn/src/                                     (Task 9)
├── app/routes/Navegacao.tsx (header) · features/busca/components/RemoteBusca.tsx · features/veiculo/components/RemoteFinanciamento.tsx
└── features/veiculo/screens/TelaVeiculo.tsx (reescrita)
```

---

## Chunk 1: `@garagem/ds`

### Task 1: Pacote, tokens

**Files:** Create `design-system/package.json`, `design-system/tsconfig.json`, `design-system/src/tokens.ts`

- [ ] **Step 1: `design-system/package.json`**

```json
{
  "name": "@garagem/ds",
  "version": "1.0.0",
  "private": true,
  "description": "Design system do estudo-mf: tokens e componentes base em React Native (web via react-native-web)",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "rm -rf dist && tsc -p tsconfig.json",
    "pacote": "npm run build && npm pack",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "peerDependencies": {
    "lucide-react-native": "^1.57.0",
    "react": "^19.2.0",
    "react-native": ">=0.80",
    "react-native-svg": "^15.15.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "lucide-react-native": "1.57.0",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-svg": "15.15.5",
    "typescript": "~5.9.0"
  }
}
```

- [ ] **Step 2: `design-system/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": [],
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: `design-system/src/tokens.ts`**

```ts
import { Platform, type TextStyle } from 'react-native'

export const cores = {
  ink: '#171717',
  inkSoft: '#6A6977',
  bg: '#FFFFFF',
  surface: '#F5F2F8',
  carStage: '#E4E2DF',
  line: '#DCDCE9',
  accent: '#00E0A0',
  accentSoft: '#C9FFF0',
  // accent escurecido para texto sobre fundo claro: 5,36:1 no branco (o accent puro dá 1,73:1)
  accentInk: '#007A57',
  alert: '#E22446',
} as const

export const raios = { pilula: 100, card: 16, botao: 12 } as const
export const espaco = (n: number) => n * 8
export const CONTAINER = 1200

// iOS: cada peso é uma família (nome PostScript da fonte); web: família + fontWeight
const familias = Platform.select({
  web: {
    display: '"Archivo Black", sans-serif',
    regular: 'Figtree, sans-serif',
    semibold: 'Figtree, sans-serif',
    bold: 'Figtree, sans-serif',
  },
  default: {
    display: 'ArchivoBlack-Regular',
    regular: 'Figtree-Regular',
    semibold: 'Figtree-SemiBold',
    bold: 'Figtree-Bold',
  },
})
const peso = (fontWeight: '400' | '600' | '700'): Pick<TextStyle, 'fontWeight'> => (Platform.OS === 'web' ? { fontWeight } : {})

export const tipo = {
  display: { fontFamily: familias.display, textTransform: 'uppercase', letterSpacing: 0.5, color: cores.ink },
  titulo: { fontFamily: familias.bold, ...peso('700'), fontSize: 20, color: cores.ink },
  corpo: { fontFamily: familias.regular, ...peso('400'), fontSize: 16, color: cores.ink },
  corpoForte: { fontFamily: familias.semibold, ...peso('600'), fontSize: 16, color: cores.ink },
  legenda: { fontFamily: familias.regular, ...peso('400'), fontSize: 13, color: cores.inkSoft },
  preco: { fontFamily: familias.bold, ...peso('700'), fontSize: 22, color: cores.ink },
} satisfies Record<string, TextStyle>
```

- [ ] **Step 4: Instalar e checar**

Run: `cd design-system && npm install && npx tsc --noEmit -p tsconfig.json`
Expected: install sem ERESOLVE; typecheck limpo.

- [ ] **Step 5: Commit** — `git add design-system/package.json design-system/package-lock.json design-system/tsconfig.json design-system/src/tokens.ts` · `feat(ds): pacote @garagem/ds com tokens`

### Task 2: Componentes

**Files:** Create `design-system/src/componentes/{Icone,Botao,Chip,Card,Selo,Skeleton,Titulo,Silhueta}.tsx`, `design-system/src/index.ts`

- [ ] **Step 1: `componentes/Icone.tsx`**

```tsx
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
```

- [ ] **Step 2: `componentes/Botao.tsx`**

```tsx
import { Pressable, StyleSheet, Text } from 'react-native'
import { cores, raios, tipo } from '../tokens'

type Props = {
  rotulo: string
  onPress: () => void
  variante?: 'primario' | 'acao' | 'contorno'
  desabilitado?: boolean
}

/** 48px, raio 12. `acao` = accent com texto ink (accent só aparece onde há ação). */
export function Botao({ rotulo, onPress, variante = 'primario', desabilitado = false }: Props) {
  return (
    <Pressable
      role="button"
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [estilos.base, estilos[variante], pressed && estilos.pressionado, desabilitado && estilos.desabilitado]}
    >
      <Text style={[tipo.corpoForte, estilos.texto, variante === 'primario' && estilos.textoClaro]}>{rotulo}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: raios.botao,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.ink, borderColor: cores.ink },
  acao: { backgroundColor: cores.accent, borderColor: cores.accent },
  contorno: { backgroundColor: cores.bg, borderColor: cores.ink },
  pressionado: { opacity: 0.8 },
  desabilitado: { opacity: 0.4 },
  texto: { color: cores.ink, textAlign: 'center' },
  textoClaro: { color: cores.bg },
})
```

- [ ] **Step 3: `componentes/Chip.tsx`**

```tsx
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
```

- [ ] **Step 4: `componentes/Card.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { cores, raios } from '../tokens'

type Props = {
  children: ReactNode
  onPress?: () => void
  /** nome acessível quando o card é tocável */
  rotulo?: string
}

/** Raio 16, borda `line`, sem sombra. Com `onPress` vira botão. */
export function Card({ children, onPress, rotulo }: Props) {
  if (!onPress) return <View style={estilos.card}>{children}</View>
  return (
    <Pressable role="button" aria-label={rotulo} onPress={onPress} style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}>
      {children}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  card: { borderRadius: raios.card, borderWidth: 1, borderColor: cores.line, backgroundColor: cores.bg, overflow: 'hidden' },
  pressionado: { opacity: 0.85 },
})
```

- [ ] **Step 5: `componentes/Selo.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native'
import { cores, raios, tipo } from '../tokens'

type Props = { texto: string; tom?: 'positivo' | 'neutro' }

export function Selo({ texto, tom = 'neutro' }: Props) {
  return (
    <View style={[estilos.base, tom === 'positivo' ? estilos.positivo : estilos.neutro]}>
      <Text style={[tipo.corpoForte, estilos.texto]}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: raios.pilula },
  positivo: { backgroundColor: cores.accentSoft },
  neutro: { backgroundColor: cores.surface },
  texto: { fontSize: 13 },
})
```

- [ ] **Step 6: `componentes/Skeleton.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Platform, StyleSheet, type DimensionValue } from 'react-native'
import { cores } from '../tokens'

type Props = { largura: DimensionValue; altura: DimensionValue; raio?: number }

/** Bloco pulsando no lugar do conteúdo; parado se o sistema pede menos movimento. */
export function Skeleton({ largura, altura, raio = 8 }: Props) {
  const opacidade = useRef(new Animated.Value(1)).current
  const [reduzir, setReduzir] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzir)
  }, [])

  useEffect(() => {
    if (reduzir) return
    const nativo = Platform.OS !== 'web'
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 0.5, duration: 450, useNativeDriver: nativo }),
        Animated.timing(opacidade, { toValue: 1, duration: 450, useNativeDriver: nativo }),
      ]),
    )
    pulso.start()
    return () => pulso.stop()
  }, [reduzir, opacidade])

  return <Animated.View aria-hidden style={[estilos.base, { width: largura, height: altura, borderRadius: raio, opacity: opacidade }]} />
}

const estilos = StyleSheet.create({
  base: { backgroundColor: cores.carStage },
})
```

- [ ] **Step 7: `componentes/Titulo.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Text, useWindowDimensions } from 'react-native'
import { tipo } from '../tokens'

type Props = { children: ReactNode; tamanho?: 'grande' | 'medio' }

/** Display condensado em caixa alta. `grande`: 32 no mobile, 56 a partir de 1024px. */
export function Titulo({ children, tamanho = 'medio' }: Props) {
  const { width } = useWindowDimensions()
  const fontSize = tamanho === 'grande' ? (width >= 1024 ? 56 : 32) : 22
  // sem role="heading": o RN 0.86 não tipa aria-level, e sem ele o react-native-web gera <h1>
  return <Text style={[tipo.display, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}>{children}</Text>
}
```

- [ ] **Step 8: `componentes/Silhueta.tsx`**

```tsx
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
```

- [ ] **Step 9: `src/index.ts`**

```ts
export { CONTAINER, cores, espaco, raios, tipo } from './tokens'
export { Botao } from './componentes/Botao'
export { Card } from './componentes/Card'
export { Chip } from './componentes/Chip'
export { Icone, type NomeIcone } from './componentes/Icone'
export { Selo } from './componentes/Selo'
export { Silhueta } from './componentes/Silhueta'
export { Skeleton } from './componentes/Skeleton'
export { Titulo } from './componentes/Titulo'
```

- [ ] **Step 10: Typecheck** — `cd design-system && npx tsc --noEmit -p tsconfig.json` (se algum nome de ícone não existir no lucide-react-native 1.57.0, o tsc acusa: trocar pelo nome atual do Lucide e reportar).

- [ ] **Step 11: Commit** — `git add design-system/src` · `feat(ds): componentes base (Botao, Chip, Card, Selo, Skeleton, Titulo, Icone, Silhueta)`

### Task 3: Build e pacote

- [ ] **Step 1:** `cd design-system && npm run pacote && tar tzf garagem-ds-1.0.0.tgz`
Expected: `package/package.json`, `package/dist/index.js`, `package/dist/index.d.ts`, `package/dist/componentes/*.js` e `.d.ts`; **sem** `src/`.
- [ ] **Step 2:** `printf 'dist\n' > design-system/.gitignore` (o `.tgz` é o artefato publicado e vai para o git; o `dist/` não).
- [ ] **Step 3: Commit** — `git add design-system/.gitignore design-system/garagem-ds-1.0.0.tgz` · `build(ds): pacote 1.0.0`

> **Depois da revisão:** saiu a **1.0.1** (silhuetas de hatch e SUV redesenhadas, contorno nas rodas, Espaço nos chips da web, `Titulo` com `role="heading"` + `aria-level`, Skeleton sem congelar, `peso` com `Pick<TextStyle, 'fontWeight'>`). Depois, a **1.0.2**: ícones importados um a um (`lucide-react-native/icons/<nome>`) — o barrel traz o ícone `infinity`, que declara `const Infinity`, e o Hermes recusa o arquivo (nenhum bundle nativo compilava). As tasks seguintes instalam `garagem-ds-1.0.2.tgz` e o host-rn já está nela.
- **Regra para depois:** mudou o DS → subir a versão (1.0.1…), `npm run pacote`, e nos 4 projetos `npm i -E ../design-system/garagem-ds-<versão>.tgz` (caminho explícito) e reiniciar os dev servers. Reempacotar a mesma versão é invisível: `npm install` diz "up to date" e `npm ci` restaura o conteúdo antigo do cache pelo hash do lockfile.

---

## Chunk 2: host-rn nativo (rebuild)

### Task 4: `react-native-svg`, fontes e shared no host-rn

**Files:** Modify `host-rn/package.json`, `host-rn/react-native.config.js`, `host-rn/rspack.config.mjs`; Create `host-rn/assets/fonts/*.ttf`, `host-rn/assets/licencas/OFL-*.txt`

- [ ] **Step 1: Dependências**

```bash
cd host-rn && npm install -E react-native-svg@15.15.5 lucide-react-native@1.57.0 ../design-system/garagem-ds-1.0.2.tgz
npm ls react react-native react-native-svg lucide-react-native @garagem/ds --depth=0
```
Expected: react 19.2.3, react-native 0.86.3, svg 15.15.5, lucide 1.57.0, `@garagem/ds@1.0.1`.

- [ ] **Step 2: Fontes** (Google Fonts / autor da Figtree, licença OFL)

```bash
mkdir -p host-rn/assets/fonts host-rn/assets/licencas && cd host-rn/assets && node -e "
const g='https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/'
const f='https://raw.githubusercontent.com/erikdkennedy/figtree/master/'
const arquivos=[[g+'ArchivoBlack-Regular.ttf','fonts/ArchivoBlack-Regular.ttf'],[g+'OFL.txt','licencas/OFL-ArchivoBlack.txt'],
 [f+'fonts/ttf/Figtree-Regular.ttf','fonts/Figtree-Regular.ttf'],[f+'fonts/ttf/Figtree-SemiBold.ttf','fonts/Figtree-SemiBold.ttf'],
 [f+'fonts/ttf/Figtree-Bold.ttf','fonts/Figtree-Bold.ttf'],[f+'OFL.txt','licencas/OFL-Figtree.txt']]
;(async()=>{for(const [u,n] of arquivos){const r=await fetch(u);if(!r.ok)throw new Error(u+' '+r.status);require('fs').writeFileSync(n,Buffer.from(await r.arrayBuffer()));console.log('ok',n)}})()"
for t in fonts/*.ttf; do mdls -name com_apple_ats_name_postscript "$t"; done
```
Expected: 6 arquivos `ok`; nomes PostScript `ArchivoBlack-Regular`, `Figtree-Regular`, `Figtree-SemiBold`, `Figtree-Bold` (se o `mdls` não listar, conferir depois pelo app).

- [ ] **Step 3: `host-rn/react-native.config.js`**

```js
module.exports = {
  commands: require('@callstack/repack/commands'),
  // fontes ligadas no iOS (Info.plist UIAppFonts + recursos do Xcode) pelo react-native-asset;
  // iosAssets para não mexer no android/ (fora do escopo)
  iosAssets: ['./assets/fonts'],
}
```

Run: `cd host-rn && npx --yes react-native-asset@2.3.0` → Expected: fontes adicionadas só ao projeto iOS. Conferir `grep -c "Figtree" ios/HostRn/Info.plist` ≥ 3.

- [ ] **Step 4: Shared no `host-rn/rspack.config.mjs`** — acrescentar os imports no topo:

```js
import pkg from './package.json' with { type: 'json' }
import dsPkg from '@garagem/ds/package.json' with { type: 'json' }
```
e, dentro de `shared`, depois de `'react-native'`:
```js
          // design system e svg: uma cópia só em tempo de execução (a do host). Lucide fica fora do shared:
          // shared não sofre tree-shaking (725 KiB), e só o DS o importa
          '@garagem/ds': { singleton: true, eager: true, version: dsPkg.version, requiredVersion: '^1.0.0' },
          'react-native-svg': {
            singleton: true,
            eager: true,
            version: pkg.dependencies['react-native-svg'],
            requiredVersion: pkg.dependencies['react-native-svg'],
          },
```
(versões fixadas com `-E`: a declarada é a exata.)

- [ ] **Step 5: Pods e rebuild** — é o primeiro portão da fase: se o `react-native-svg` 15.15.5 não compilar com o RN 0.86.3, parar e reportar

```bash
cd host-rn/ios && bundle exec pod install
cd .. && npx react-native run-ios --simulator "iPhone 17" --no-packager
```
Expected: `Pod installation complete!` (com `RNSVG`), `BUILD SUCCEEDED`, app aberto (o 8081 do controller serve o bundle). Timeout longo.

- [ ] **Step 6: Checks** — `cd host-rn && npx tsc --noEmit && npm run lint`.

- [ ] **Step 7: Commit** — `git add host-rn/package.json host-rn/package-lock.json host-rn/react-native.config.js host-rn/rspack.config.mjs host-rn/assets host-rn/ios/HostRn/Info.plist host-rn/ios/HostRn.xcodeproj/project.pbxproj host-rn/ios/Podfile.lock` (conferir `git status --short host-rn`: nada em `android/`, nada de `Pods/`/`build/`) · `feat(host-rn): react-native-svg, fontes e design system como shared`

---

## Chunk 3: remote `busca`

### Task 5: Contrato, dados, ordenação e chips (TDD)

**Files:** Modify `mini-app/src/features/busca-veiculos/types.ts`, `services/veiculos.json`, `utils/filtros.ts`, `utils/formatar.ts`, `utils/filtros.test.ts`, `utils/filtrarVeiculos.test.ts`; Create `utils/ordenar.ts`, `utils/ordenar.test.ts`

- [ ] **Step 1: `types.ts`** — acrescentar antes de `Veiculo` e estender os tipos (sem imports):

```ts
export type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'
export type Cambio = 'manual' | 'automatico'
export type Combustivel = 'flex' | 'diesel' | 'eletrico'
export type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco' | 'menor-km' | 'mais-novos'
```
Em `Veiculo`, depois de `uf: string`: `carroceria: Carroceria`, `cambio: Cambio`, `combustivel: Combustivel`.
Em `Filtros`, depois de `kmMax?: number`: `/** ausente = relevância (ordem dos dados) */ ordem?: Ordem`.
No barrel `index.ts`, exportar também os tipos novos: `export type { BuscaVeiculosProps, Cambio, Carroceria, Combustivel, Filtros, Ordem, Veiculo } from './types'`.

- [ ] **Step 2: Dados** — rodar uma vez (escreve o JSON no formato de hoje, `{ "id": … }` por linha). Em `services/veiculosService.ts`, a linha `const veiculos: Veiculo[] = dados` vira `const veiculos = dados as Veiculo[]` (o JSON tipa `carroceria` como `string`).

```bash
cd mini-app/src/features/busca-veiculos/services && node <<'EOF'

const fs=require('fs'); const v=JSON.parse(fs.readFileSync('veiculos.json','utf8'))
const c={1:['sedan','automatico','flex'],2:['sedan','automatico','flex'],3:['suv','automatico','flex'],4:['hatch','automatico','flex'],5:['sedan','automatico','flex'],6:['suv','automatico','flex'],7:['hatch','manual','flex'],8:['picape','automatico','diesel'],9:['hatch','automatico','flex'],10:['suv','automatico','flex'],11:['suv','automatico','flex'],12:['hatch','manual','flex'],13:['hatch','manual','flex'],14:['sedan','automatico','flex'],15:['suv','automatico','flex'],16:['picape','automatico','diesel'],17:['hatch','manual','flex'],18:['sedan','automatico','flex'],19:['suv','automatico','flex'],20:['picape','automatico','diesel'],21:['hatch','manual','flex'],22:['hatch','manual','flex'],23:['sedan','automatico','flex'],24:['suv','automatico','flex'],25:['suv','automatico','flex'],26:['suv','automatico','flex'],27:['suv','automatico','diesel'],28:['hatch','manual','flex'],29:['suv','automatico','flex'],30:['hatch','manual','flex']}
const novo=v.map(x=>{const [carroceria,cambio,combustivel]=c[x.id];return {...x,carroceria,cambio,combustivel}})
novo.push({id:'31',marca:'BYD',modelo:'Dolphin',versao:'GS 180',ano:2024,km:8000,preco:149800,cidade:'Resende',uf:'RJ',carroceria:'hatch',cambio:'automatico',combustivel:'eletrico'})
const linha=(x)=>'  { '+Object.entries(x).map(([k,v])=>JSON.stringify(k)+': '+JSON.stringify(v)).join(', ')+' }'
fs.writeFileSync('veiculos.json','[\n'+novo.map(linha).join(',\n')+'\n]\n')
console.log(novo.length, new Set(novo.map(x=>x.marca)).size, novo.filter(x=>x.carroceria===undefined).length)
EOF
```
Expected: `31 9 0`.

- [ ] **Step 3: Fixture do teste existente** — em `utils/filtrarVeiculos.test.ts`, no objeto padrão do builder `carro(...)`, acrescentar `carroceria: 'sedan', cambio: 'automatico', combustivel: 'flex',` (senão o `tsc` reprova o teste).

- [ ] **Step 4: Testes novos** — `utils/ordenar.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Veiculo } from '../types'
import { ordenarVeiculos } from './ordenar'

const v = (id: string, preco: number, km: number, ano: number): Veiculo => ({
  id, marca: 'X', modelo: 'Y', versao: 'Z', ano, km, preco, cidade: 'C', uf: 'RJ',
  carroceria: 'hatch', cambio: 'manual', combustivel: 'flex',
})
const lista = [v('a', 100, 30, 2020), v('b', 50, 10, 2022), v('c', 100, 20, 2021)]
const ids = (l: Veiculo[]) => l.map((x) => x.id)

describe('ordenarVeiculos', () => {
  it('sem ordem ou relevância mantém a ordem dos dados', () => {
    expect(ids(ordenarVeiculos(lista, undefined))).toEqual(['a', 'b', 'c'])
    expect(ids(ordenarVeiculos(lista, 'relevancia'))).toEqual(['a', 'b', 'c'])
  })

  it('ordena por preço, km e ano, com empate estável', () => {
    expect(ids(ordenarVeiculos(lista, 'menor-preco'))).toEqual(['b', 'a', 'c'])
    expect(ids(ordenarVeiculos(lista, 'maior-preco'))).toEqual(['a', 'c', 'b'])
    expect(ids(ordenarVeiculos(lista, 'menor-km'))).toEqual(['b', 'c', 'a'])
    expect(ids(ordenarVeiculos(lista, 'mais-novos'))).toEqual(['b', 'c', 'a'])
  })

  it('não altera a lista recebida', () => {
    ordenarVeiculos(lista, 'menor-preco')
    expect(ids(lista)).toEqual(['a', 'b', 'c'])
  })
})
```

Em `utils/filtros.test.ts`, acrescentar (e `chipsAtivos` ao import de `./filtros`):

```ts
describe('normalizarFiltros com ordem', () => {
  it('mantém ordem válida e descarta desconhecida', () => {
    expect(normalizarFiltros({ texto: '', marcas: [], ordem: 'menor-preco' }, marcas).ordem).toBe('menor-preco')
    expect(normalizarFiltros({ texto: '', marcas: [], ordem: 'xyz' as never }, marcas).ordem).toBeUndefined()
  })
})

describe('chipsAtivos', () => {
  const f = { texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 120000, anoMin: 2019, kmMax: 80000, ordem: 'menor-preco' as const }

  it('um chip por marca e por limite, sem texto nem ordem', () => {
    expect(chipsAtivos(f).map((c) => c.rotulo)).toEqual(['Honda', 'Toyota', 'Até R$\u00A0120.000', 'A partir de 2019', 'Até 80.000 km'])
  })

  it('cada chip sabe os filtros sem ele', () => {
    const [honda, , preco] = chipsAtivos(f)
    expect(honda.sem.marcas).toEqual(['Toyota'])
    expect(preco.sem).toEqual({ ...f, precoMax: undefined })
  })
})
```

- [ ] **Step 5: Rodar e ver falhar** — `cd mini-app && npx vitest run` → FAIL (`./ordenar` inexistente; `chipsAtivos` não exportado).

- [ ] **Step 6: `utils/ordenar.ts`**

```ts
import type { Ordem, Veiculo } from '../types'

export const ORDENS: readonly Ordem[] = ['relevancia', 'menor-preco', 'maior-preco', 'menor-km', 'mais-novos']

export const ROTULOS_ORDEM: Record<Ordem, string> = {
  relevancia: 'Mais relevantes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'menor-km': 'Menor km',
  'mais-novos': 'Mais novos',
}

const COMPARADORES: Record<Exclude<Ordem, 'relevancia'>, (a: Veiculo, b: Veiculo) => number> = {
  'menor-preco': (a, b) => a.preco - b.preco,
  'maior-preco': (a, b) => b.preco - a.preco,
  'menor-km': (a, b) => a.km - b.km,
  'mais-novos': (a, b) => b.ano - a.ano,
}

/** Cópia ordenada (sort estável); relevância = ordem dos dados. */
export function ordenarVeiculos(veiculos: Veiculo[], ordem: Ordem | undefined): Veiculo[] {
  if (!ordem || ordem === 'relevancia') return veiculos
  return [...veiculos].sort(COMPARADORES[ordem])
}
```

- [ ] **Step 7: `utils/formatar.ts`** — acrescentar no fim:

```ts
export const ROTULO_CAMBIO = { manual: 'Manual', automatico: 'Automático' } as const
export const ROTULO_COMBUSTIVEL = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' } as const
```

- [ ] **Step 8: `utils/filtros.ts`** — `normalizarFiltros` passa a incluir a ordem, e entra `chipsAtivos`:

no topo:
```ts
import type { Filtros } from '../types'
import { formatarKm, formatarPreco } from './formatar'
import { ORDENS } from './ordenar'
```
no objeto devolvido por `normalizarFiltros`, depois de `kmMax`:
```ts
    ordem: filtros.ordem && ORDENS.includes(filtros.ordem) ? filtros.ordem : undefined,
```
e no fim do arquivo:
```ts
export type ChipAtivo = { id: string; rotulo: string; sem: Filtros }

/** Um chip por filtro ativo do painel (texto e ordem ficam de fora), cada um com os filtros sem ele. */
export function chipsAtivos(f: Filtros): ChipAtivo[] {
  const chips: ChipAtivo[] = f.marcas.map((marca) => ({
    id: `marca-${marca}`,
    rotulo: marca,
    sem: { ...f, marcas: f.marcas.filter((m) => m !== marca) },
  }))
  if (f.precoMax !== undefined) chips.push({ id: 'preco', rotulo: `Até ${formatarPreco(f.precoMax)}`, sem: { ...f, precoMax: undefined } })
  if (f.anoMin !== undefined) chips.push({ id: 'ano', rotulo: `A partir de ${f.anoMin}`, sem: { ...f, anoMin: undefined } })
  if (f.kmMax !== undefined) chips.push({ id: 'km', rotulo: `Até ${formatarKm(f.kmMax)}`, sem: { ...f, kmMax: undefined } })
  return chips
}
```

- [ ] **Step 9: Rodar e ver passar** — `cd mini-app && npx vitest run && npx tsc --noEmit` → todos passando, typecheck limpo.

- [ ] **Step 10: Commit** — `git add mini-app/src/features/busca-veiculos/types.ts mini-app/src/features/busca-veiculos/index.ts mini-app/src/features/busca-veiculos/services/veiculos.json mini-app/src/features/busca-veiculos/services/veiculosService.ts mini-app/src/features/busca-veiculos/utils` · `feat(busca): carroceria, câmbio, combustível, ordenação e chips de filtros ativos`

### Task 6: Visual da busca com o DS + shared

**Files:** Modify `mini-app/package.json`, `mini-app/rspack.web.config.mjs`, `mini-app/rspack.native.config.mjs`, `components/BarraBusca.tsx`, `components/CardVeiculo.tsx`, `components/PainelFiltros.tsx`, `pages/BuscaVeiculos.tsx`

- [ ] **Step 1: Dependências** — `cd mini-app && npm install -E react-native-svg@15.15.5 lucide-react-native@1.57.0 ../design-system/garagem-ds-1.0.2.tgz`

- [ ] **Step 2: `rspack.web.config.mjs`**
  - imports no topo: `import pkg from './package.json' with { type: 'json' }`, `import dsPkg from '@garagem/ds/package.json' with { type: 'json' }`, `import rnwPkg from 'react-native-web/package.json' with { type: 'json' }`;
  - `shared` passa a ser:
```js
      shared: {
        react: { singleton: true, requiredVersion: versaoReact },
        'react-dom': { singleton: true, requiredVersion: versaoReact },
        // a chave é 'react-native' (é o que o código importa; o alias não muda a chave), com a versão do RNW
        'react-native': { singleton: true, version: rnwPkg.version, requiredVersion: rnwPkg.version },
        '@garagem/ds': { singleton: true, requiredVersion: '^1.0.0', version: dsPkg.version },
        // svg compartilhado (registro de views uma vez só); lucide NÃO — shared não sofre tree-shaking (725 KiB)
        'react-native-svg': { singleton: true, requiredVersion: pkg.dependencies['react-native-svg'] },
      },
```
  - no `HTML`, dentro do `<head>`, antes do `<style>`:
```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Figtree:wght@400;600;700&display=swap" />
```
    e no `<style>` acrescentar: `body { font-family: Figtree, system-ui, sans-serif } :focus-visible { outline: 2px solid #171717; outline-offset: 0; box-shadow: 0 0 0 4px #00E0A0 }`.

- [ ] **Step 3: `rspack.native.config.mjs`** — imports `pkg` e `dsPkg` como acima; em `shared`, depois de `'react-native'`:
```js
          '@garagem/ds': { singleton: true, eager: false, version: dsPkg.version, requiredVersion: '^1.0.0' },
          'react-native-svg': {
            singleton: true,
            eager: false,
            version: pkg.dependencies['react-native-svg'],
            requiredVersion: pkg.dependencies['react-native-svg'],
          },
```

- [ ] **Step 4: `components/BarraBusca.tsx`** (substituir)

```tsx
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Icone, cores, raios, tipo } from '@garagem/ds'

type Props = { valor: string; onChange: (texto: string) => void }

export function BarraBusca({ valor, onChange }: Props) {
  return (
    <View style={estilos.barra}>
      <Icone nome="Search" cor={cores.inkSoft} />
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Buscar marca ou modelo"
        placeholderTextColor={cores.inkSoft}
        aria-label="Buscar marca ou modelo"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={[tipo.corpo, estilos.input]}
      />
      {valor !== '' && (
        <Pressable role="button" aria-label="Limpar busca" onPress={() => onChange('')} style={estilos.limpar}>
          <Icone nome="X" />
        </Pressable>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingLeft: 16,
    borderRadius: raios.pilula,
    borderWidth: 1,
    borderColor: cores.inkSoft,
    backgroundColor: cores.bg,
  },
  input: { flex: 1, paddingVertical: 10 },
  limpar: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
})
```

- [ ] **Step 5: `components/CardVeiculo.tsx`** (substituir)

```tsx
import { StyleSheet, Text, View } from 'react-native'
import { Card, Icone, Silhueta, cores, tipo, type NomeIcone } from '@garagem/ds'
import type { Veiculo } from '../types'
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL, formatarKm, formatarPreco } from '../utils/formatar'

type Props = { veiculo: Veiculo; onPress: () => void }

export function CardVeiculo({ veiculo, onPress }: Props) {
  const rotulo = `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}, ${veiculo.ano}, ${formatarKm(veiculo.km)}, ${formatarPreco(veiculo.preco)}`
  return (
    <Card onPress={onPress} rotulo={rotulo}>
      <Silhueta carroceria={veiculo.carroceria} />
      <View style={estilos.corpo}>
        <Text style={[tipo.corpoForte, estilos.nome]} numberOfLines={1}>
          {veiculo.marca} {veiculo.modelo}
        </Text>
        <Text style={tipo.legenda} numberOfLines={1}>
          {veiculo.versao}
        </Text>
        <View style={estilos.specs}>
          <Spec icone="Calendar" texto={String(veiculo.ano)} />
          <Spec icone="Gauge" texto={formatarKm(veiculo.km)} />
          <Spec icone="Cog" texto={ROTULO_CAMBIO[veiculo.cambio]} />
          <Spec icone="Fuel" texto={ROTULO_COMBUSTIVEL[veiculo.combustivel]} />
        </View>
        <Spec icone="MapPin" texto={`${veiculo.cidade} (${veiculo.uf})`} />
        <Text style={[tipo.preco, estilos.preco]}>{formatarPreco(veiculo.preco)}</Text>
      </View>
    </Card>
  )
}

function Spec({ icone, texto }: { icone: NomeIcone; texto: string }) {
  return (
    <View style={estilos.spec}>
      <Icone nome={icone} tamanho={14} cor={cores.inkSoft} />
      <Text style={tipo.legenda}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  corpo: { gap: 6, padding: 16 },
  nome: { textTransform: 'uppercase' },
  specs: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  preco: { marginTop: 4 },
})
```

- [ ] **Step 6: `components/PainelFiltros.tsx`** (substituir)

```tsx
import type { ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Botao, Chip, Titulo, cores, raios, tipo } from '@garagem/ds'
import type { Filtros } from '../types'
import { FILTROS_VAZIOS, lerNumero } from '../utils/filtros'
import { ORDENS, ROTULOS_ORDEM } from '../utils/ordenar'

type Props = { marcas: string[]; filtros: Filtros; onChange: (filtros: Filtros) => void }

export function PainelFiltros({ marcas, filtros, onChange }: Props) {
  const alternarMarca = (marca: string) =>
    onChange({
      ...filtros,
      marcas: filtros.marcas.includes(marca) ? filtros.marcas.filter((m) => m !== marca) : [...filtros.marcas, marca],
    })
  const ordemAtual = filtros.ordem ?? 'relevancia'

  return (
    <View style={estilos.painel}>
      <Titulo>Filtros</Titulo>

      <Secao titulo="Marca">
        <View role="group" aria-label="Marca" style={estilos.chips}>
          {marcas.map((marca) => (
            <Chip key={marca} papel="checkbox" rotulo={marca} selecionado={filtros.marcas.includes(marca)} onPress={() => alternarMarca(marca)} />
          ))}
        </View>
      </Secao>

      <CampoNumero rotulo="Preço até (R$)" valor={filtros.precoMax} onChange={(precoMax) => onChange({ ...filtros, precoMax })} />
      <CampoNumero rotulo="Ano a partir de" valor={filtros.anoMin} onChange={(anoMin) => onChange({ ...filtros, anoMin })} />
      <CampoNumero rotulo="Km até" valor={filtros.kmMax} onChange={(kmMax) => onChange({ ...filtros, kmMax })} />

      <Secao titulo="Ordenar por">
        <View role="radiogroup" aria-label="Ordenar por" style={estilos.chips}>
          {ORDENS.map((ordem) => (
            <Chip
              key={ordem}
              papel="radio"
              rotulo={ROTULOS_ORDEM[ordem]}
              selecionado={ordemAtual === ordem}
              onPress={() => onChange({ ...filtros, ordem: ordem === 'relevancia' ? undefined : ordem })}
            />
          ))}
        </View>
      </Secao>

      {/* limpa os filtros do painel; o texto da busca e a ordem ficam */}
      <Botao variante="contorno" rotulo="Limpar filtros" onPress={() => onChange({ ...FILTROS_VAZIOS, texto: filtros.texto, ordem: filtros.ordem })} />
    </View>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={tipo.corpoForte}>{titulo}</Text>
      {children}
    </View>
  )
}

type CampoNumeroProps = { rotulo: string; valor?: number; onChange: (valor: number | undefined) => void }

function CampoNumero({ rotulo, valor, onChange }: CampoNumeroProps) {
  return (
    <Secao titulo={rotulo}>
      <TextInput
        value={valor === undefined ? '' : String(valor)}
        onChangeText={(texto) => onChange(lerNumero(texto))}
        inputMode="numeric"
        maxLength={9}
        aria-label={rotulo}
        style={[tipo.corpo, estilos.input]}
      />
    </Secao>
  )
}

const estilos = StyleSheet.create({
  painel: { gap: 20 },
  secao: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.inkSoft,
    borderRadius: raios.botao,
    backgroundColor: cores.bg,
  },
})
```

- [ ] **Step 7: `pages/BuscaVeiculos.tsx`** (substituir)

```tsx
import { useMemo, useState } from 'react'
import { FlatList, Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions, type DimensionValue } from 'react-native'
import { Botao, Chip, cores, tipo } from '@garagem/ds'
import { BarraBusca } from '../components/BarraBusca'
import { CardVeiculo } from '../components/CardVeiculo'
import { PainelFiltros } from '../components/PainelFiltros'
import { listarMarcas, listarVeiculos } from '../services/veiculosService'
import type { BuscaVeiculosProps, Filtros } from '../types'
import { filtrarVeiculos } from '../utils/filtrarVeiculos'
import { FILTROS_VAZIOS, chipsAtivos, contarFiltrosAtivos, normalizarFiltros } from '../utils/filtros'
import { formatarResultado, formatarVerCarros } from '../utils/formatar'
import { ROTULOS_ORDEM, ordenarVeiculos } from '../utils/ordenar'

const LARGURA_PAINEL_LATERAL = 768
const veiculos = listarVeiculos()
const marcas = listarMarcas()
const colunasPara = (largura: number) => (largura >= 1100 ? 3 : largura >= LARGURA_PAINEL_LATERAL ? 2 : 1)

export default function BuscaVeiculos({ filtrosIniciais, onFiltrosMudaram, onSelecionarVeiculo }: BuscaVeiculosProps) {
  // filtrosIniciais é lido só na montagem; depois o estado é do mini-app
  const [filtros, setFiltros] = useState(() => normalizarFiltros(filtrosIniciais, marcas))
  const [modalAberto, setModalAberto] = useState(false)
  const { width } = useWindowDimensions()
  const largo = width >= LARGURA_PAINEL_LATERAL
  // ao virar largo (redimensionar/girar), o modal fecha — senão reabre sozinho ao voltar a estreito
  if (largo && modalAberto) setModalAberto(false)
  const colunas = colunasPara(width)
  const resultado = useMemo(() => ordenarVeiculos(filtrarVeiculos(veiculos, filtros), filtros.ordem), [filtros])
  const ativos = contarFiltrosAtivos(filtros)
  const chips = chipsAtivos(filtros)
  const contador =
    formatarResultado(resultado.length) +
    (filtros.ordem && filtros.ordem !== 'relevancia' ? ` · ordenados por ${ROTULOS_ORDEM[filtros.ordem].toLowerCase()}` : '')

  // Avisa o host aqui, no handler — nunca num useEffect (loop com setSearchParams do host)
  function atualizar(novos: Filtros) {
    setFiltros(novos)
    onFiltrosMudaram?.(novos)
  }

  const painel = <PainelFiltros marcas={marcas} filtros={filtros} onChange={atualizar} />
  const larguraCelula = `${100 / colunas}%` as DimensionValue

  return (
    <View style={estilos.raiz}>
      {largo && (
        <ScrollView style={estilos.lateral} contentContainerStyle={estilos.lateralConteudo} keyboardShouldPersistTaps="handled">
          {painel}
        </ScrollView>
      )}

      <View style={estilos.conteudo}>
        <BarraBusca valor={filtros.texto} onChange={(texto) => atualizar({ ...filtros, texto })} />

        {(!largo || chips.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
            {!largo && (
              <Chip icone="SlidersHorizontal" rotulo={ativos > 0 ? `Filtros (${ativos})` : 'Filtros'} onPress={() => setModalAberto(true)} />
            )}
            {chips.map((chip) => (
              <Chip key={chip.id} rotulo={chip.rotulo} removivel onPress={() => atualizar(chip.sem)} />
            ))}
            {chips.length > 0 && (
              <Chip rotulo="Limpar" onPress={() => atualizar({ ...FILTROS_VAZIOS, texto: filtros.texto, ordem: filtros.ordem })} />
            )}
          </ScrollView>
        )}

        <Text style={tipo.legenda}>{contador}</Text>

        <FlatList
          key={`colunas-${colunas}`}
          numColumns={colunas}
          data={resultado}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => (
            <View style={[estilos.celula, { width: larguraCelula }]}>
              <CardVeiculo veiculo={item} onPress={() => onSelecionarVeiculo(item)} />
            </View>
          )}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={tipo.corpo}>Nenhum carro com esses filtros</Text>
              <Botao rotulo="Limpar busca e filtros" onPress={() => atualizar(FILTROS_VAZIOS)} />
            </View>
          }
          contentContainerStyle={estilos.lista}
        />
      </View>

      <Modal
        visible={modalAberto}
        animationType="slide"
        presentationStyle="pageSheet"
        allowSwipeDismissal
        onRequestClose={() => setModalAberto(false)}
      >
        {/* rola e solta o teclado: o teclado numérico do iPhone não tem tecla de retorno */}
        <ScrollView
          style={estilos.modal}
          contentContainerStyle={estilos.modalConteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {painel}
          <Botao rotulo={formatarVerCarros(resultado.length)} onPress={() => setModalAberto(false)} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, flexDirection: 'row', width: '100%', maxWidth: 1200, alignSelf: 'center', backgroundColor: cores.bg },
  lateral: { width: 280, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: cores.line },
  lateralConteudo: { padding: 16 },
  conteudo: { flex: 1, padding: 16, gap: 12 },
  chips: { gap: 8, alignItems: 'center' },
  lista: { paddingBottom: 24 },
  celula: { padding: 6 },
  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  modal: { flex: 1, backgroundColor: cores.bg },
  modalConteudo: { padding: 20, gap: 16 },
})
```

> **Revisão (aplicada depois):** o `ScrollView` horizontal dos chips precisa de `style={{ flexGrow: 0, flexShrink: 0, margin: -4 }}` + `padding: 4` no conteúdo e `keyboardShouldPersistTaps="handled"` — por padrão ele cresce/encolhe e a fileira virava 7px no celular (o "Filtros" sumia). Também: grade com `marginHorizontal: -6` e rótulo do card com câmbio, combustível e cidade.

- [ ] **Step 8: Checks**

```bash
cd mini-app && npx tsc --noEmit && npx vitest run
npx rspack build --config rspack.web.config.mjs && node -e "const m=require('./dist/web/mf-manifest.json');console.log(m.shared.map(s=>s.name+'@'+s.version).join(', '))" && rm -rf dist
rm -f /tmp/estudo-mf-busca-ios.bundle
npx react-native bundle --platform ios --dev true --entry-file index.native.js --bundle-output /tmp/estudo-mf-busca-ios.bundle --config rspack.native.config.mjs > /tmp/estudo-mf-busca-bundle.log 2>&1
# o bundle do Re.Pack sai com código 0 mesmo com erro de compilação: conferir o arquivo e o log
test -s /tmp/estudo-mf-busca-ios.bundle && ! grep -qiE "compiled with [0-9]+ error" /tmp/estudo-mf-busca-bundle.log && echo BUNDLE_OK; rm -rf build
```
Expected: typecheck limpo; testes passando; shared do manifesto web com react, react-dom, react-native (versão 0.21.4 = RNW), @garagem/ds, react-native-svg — **sem** lucide; `BUNDLE_OK`.

- [ ] **Step 9: Commit** — `git add mini-app/package.json mini-app/package-lock.json mini-app/rspack.web.config.mjs mini-app/rspack.native.config.mjs mini-app/src/features/busca-veiculos/components mini-app/src/features/busca-veiculos/pages` · `feat(busca): visual do design system (card, chips, painel, busca em pílula)`

---

## Chunk 4: remote `financiamento`

### Task 7: Entrada por percentual (TDD) e visual do simulador

**Files:** Modify `financiamento/package.json`, `rspack.web.config.mjs`, `rspack.native.config.mjs`, `src/features/simulador/utils/entrada.ts`, `entrada.test.ts`, `pages/Simulador.tsx`; Delete `components/SeletorPrazo.tsx`

- [ ] **Step 1: Teste** — em `utils/entrada.test.ts` (e `entradaPorPercentual` no import):

```ts
describe('entradaPorPercentual', () => {
  it('arredonda para cima em reais inteiros; 20% coincide com o mínimo', () => {
    expect(entradaPorPercentual(112900, 20)).toBe(limitesEntrada(112900).min)
    expect(entradaPorPercentual(112900, 30)).toBe(33870)
    expect(entradaPorPercentual(99999, 50)).toBe(50000)
  })
})
```
- [ ] **Step 2:** `cd financiamento && npx vitest run` → FAIL (não exportada).
- [ ] **Step 3: `utils/entrada.ts`** — acrescentar:

```ts
/** Atalho dos chips de entrada (20%, 30%…): mesmo arredondamento do mínimo. */
export function entradaPorPercentual(preco: number, percentual: number): number {
  return Math.ceil((preco * percentual) / 100)
}
```
- [ ] **Step 4:** `npx vitest run` → PASS (10 testes).
- [ ] **Step 5: Dependências e configs** — igual à Task 6, Steps 1–3, em `financiamento/` (mesmo `shared`, mesmo `<link>` de fontes e `:focus-visible` no `HTML`).
- [ ] **Step 6: `pages/Simulador.tsx`** (substituir) e apagar `components/SeletorPrazo.tsx` (`git rm`)

```tsx
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Botao, Chip, Titulo, cores, raios, tipo } from '@garagem/ds'
import type { Prazo, Simulacao, SimuladorProps } from '../types'
import { entradaPorPercentual, entradaValida, lerNumero, limitesEntrada } from '../utils/entrada'
import { formatarMoeda, formatarReais, formatarTaxa } from '../utils/formatar'
import { PRAZOS, PRAZO_PADRAO, TAXA_MENSAL, calcularParcela } from '../utils/parcela'

const PERCENTUAIS = [20, 30, 40, 50] as const

export default function Simulador({ preco, onInteresse }: SimuladorProps) {
  const limites = limitesEntrada(preco)
  // estado inicial vem do preço; trocar de carro remonta o simulador (o host passa key={veiculo.id})
  const [entrada, setEntrada] = useState<number | undefined>(limites.min)
  const [prazo, setPrazo] = useState<Prazo>(PRAZO_PADRAO)
  // undefined = entrada fora dos limites
  const simulacao: Simulacao | undefined = entradaValida(entrada, preco)
    ? { preco, entrada, prazo, parcela: calcularParcela(preco, entrada, prazo), taxaMensal: TAXA_MENSAL }
    : undefined

  return (
    <View style={estilos.caixa}>
      <Titulo>Simule o financiamento</Titulo>

      <View style={estilos.linha}>
        <Text style={tipo.corpo}>Preço do carro</Text>
        <Text style={tipo.corpoForte}>{formatarReais(preco)}</Text>
      </View>

      <Text style={tipo.corpoForte}>Entrada</Text>
      <View role="radiogroup" aria-label="Entrada em percentual do preço" style={estilos.chips}>
        {PERCENTUAIS.map((percentual) => {
          const valor = entradaPorPercentual(preco, percentual)
          return <Chip key={percentual} papel="radio" rotulo={`${percentual}%`} selecionado={entrada === valor} onPress={() => setEntrada(valor)} />
        })}
      </View>
      <TextInput
        value={entrada === undefined ? '' : String(entrada)}
        onChangeText={(texto) => setEntrada(lerNumero(texto))}
        inputMode="numeric"
        maxLength={9}
        aria-label="Entrada"
        style={[tipo.corpo, estilos.input]}
      />
      <Text style={tipo.legenda}>
        mín. {formatarReais(limites.min)} · máx. {formatarReais(limites.max)}
      </Text>

      <Text style={tipo.corpoForte}>Prazo (meses)</Text>
      <View role="radiogroup" aria-label="Prazo em meses" style={estilos.chips}>
        {PRAZOS.map((p) => (
          <Chip key={p} papel="radio" rotulo={String(p)} selecionado={p === prazo} onPress={() => setPrazo(p)} />
        ))}
      </View>

      {/* região viva sempre montada: anuncia a parcela nova (ou os limites) sem interromper.
          No iOS o VoiceOver não lê região viva — lacuna conhecida. Accent só sobre escuro (10,4:1). */}
      <View aria-live="polite" style={estilos.resultado}>
        {simulacao ? (
          <>
            <Text style={estilos.parcela}>
              {prazo}x de {formatarMoeda(simulacao.parcela)}
            </Text>
            <Text style={estilos.taxa}>taxa {formatarTaxa(TAXA_MENSAL)} · simulação, sem valor de proposta</Text>
          </>
        ) : (
          <Text style={estilos.taxa}>
            Entrada entre {formatarReais(limites.min)} e {formatarReais(limites.max)}
          </Text>
        )}
      </View>

      {/* avisa o host só no clique — nunca num efeito */}
      <Botao rotulo="Tenho interesse" desabilitado={!simulacao} onPress={() => simulacao && onInteresse?.(simulacao)} />
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: 12, padding: 16, borderRadius: raios.card, borderWidth: 1, borderColor: cores.line, backgroundColor: cores.bg },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.inkSoft,
    borderRadius: raios.botao,
    backgroundColor: cores.bg,
  },
  resultado: { gap: 4, padding: 16, borderRadius: raios.card, backgroundColor: cores.ink },
  parcela: { ...tipo.preco, fontSize: 26, color: cores.accent },
  taxa: { ...tipo.legenda, color: cores.bg },
})
```

- [ ] **Step 7: Checks** — como na Task 6, Step 8, em `financiamento/` (`index.native.js`, bundle em `/tmp/estudo-mf-fin-ios.bundle`, log em `/tmp/estudo-mf-fin-bundle.log`; precisa sair `BUNDLE_OK`).
- [ ] **Step 8: Commit** — `git add financiamento/package.json financiamento/package-lock.json financiamento/rspack.web.config.mjs financiamento/rspack.native.config.mjs financiamento/src/features/simulador` (inclui o `git rm` do SeletorPrazo) · `feat(financiamento): visual do design system com chips de entrada e bloco escuro da parcela`

---

## Chunk 5: hosts

### Task 8: host-react — RNW, shared, header, skeletons e anúncio

**Files:** Modify `host-react/package.json`, `rspack.config.mjs`, `src/features/busca/utils/filtrosUrl.ts`, `filtrosUrl.test.ts`, `src/app/layout/Layout.tsx`, `src/features/busca/components/RemoteBusca.tsx`, `src/features/veiculo/components/RemoteFinanciamento.tsx`, `src/features/veiculo/pages/PaginaVeiculo.tsx`

- [ ] **Step 1: Teste da ordem na URL** — em `filtrosUrl.test.ts`:

```ts
  it('ordem vai e volta pela URL; valor desconhecido é repassado ao mini-app', () => {
    const f: Filtros = { texto: '', marcas: [], ordem: 'menor-preco' }
    expect(gravarFiltros(f).toString()).toBe('ordem=menor-preco')
    expect(lerFiltros(gravarFiltros(f))).toEqual(f)
    expect(lerFiltros(new URLSearchParams('ordem=xyz')).ordem).toBe('xyz')
  })
```
- [ ] **Step 2:** `cd host-react && npx vitest run` → FAIL.
- [ ] **Step 3: `filtrosUrl.ts`** — em `lerFiltros`, depois de `kmMax`:
```ts
    // o host não valida a ordem: repassa, e o mini-app descarta o que não conhece
    ordem: (params.get('ordem') ?? undefined) as Filtros['ordem'],
```
em `gravarFiltros`, antes do `return`: `if (filtros.ordem) params.set('ordem', filtros.ordem)`.
- [ ] **Step 4:** `npx vitest run` → PASS (5 testes).

- [ ] **Step 5: Dependências** — `cd host-react && npm install -E react-native-web@0.21.4 react-native@0.86.3 react-native-svg@15.15.5 lucide-react-native@1.57.0 ../design-system/garagem-ds-1.0.2.tgz` (o `react-native` entra fixo para o npm não escolher outra versão ao satisfazer peers; o bundle usa o react-native-web pelo alias).

- [ ] **Step 6: `rspack.config.mjs`**
  - imports: `import pkg from './package.json' with { type: 'json' }` (**não existe hoje** no host-react), `dsPkg` e `rnwPkg` como na Task 6;
  - `resolve.extensions`: `['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.json']`;
  - `resolve.alias`: `{ 'react-native$': 'react-native-web', '@': path.resolve(__dirname, 'src') }`;
  - `shared`: o mesmo bloco web da Task 6 Step 2 (react, react-dom, react-native→RNW, @garagem/ds, react-native-svg);
  - `HTML`: o mesmo `<link>` de fontes e o `body`/`:focus-visible` da Task 6.

- [ ] **Step 7: `src/app/layout/Layout.tsx`** (substituir)

```tsx
import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { cores, tipo } from '@garagem/ds'

export function Layout() {
  return (
    <div style={estilos.raiz}>
      <header style={estilos.cabecalho}>
        <span style={estilos.logo}>Garagem</span>
        <nav aria-label="Principal">
          <NavLink to="/busca" style={({ isActive }) => ({ ...estilos.link, ...(isActive ? estilos.ativo : {}) })}>
            Comprar
          </NavLink>
        </nav>
        <span style={estilos.etiqueta}>host web</span>
      </header>
      <main style={estilos.main}>
        <Outlet />
      </main>
    </div>
  )
}

const estilos = {
  raiz: { display: 'flex', flexDirection: 'column', height: '100%', background: cores.bg },
  cabecalho: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '12px 16px',
    background: cores.bg,
    borderBottom: `1px solid ${cores.line}`,
  },
  logo: { ...tipo.display, fontSize: 24 },
  link: { ...tipo.corpoForte, color: cores.ink, textDecoration: 'none', paddingBottom: 2 },
  ativo: { borderBottom: `2px solid ${cores.ink}` },
  etiqueta: { ...tipo.legenda, marginLeft: 'auto', padding: '2px 8px', borderRadius: 999, background: cores.surface },
  main: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 8: Skeletons** — em `features/busca/components/RemoteBusca.tsx`, trocar o fallback do `Suspense` por `<CarregandoBusca />` e acrescentar:
```tsx
function CarregandoBusca() {
  return (
    <div style={estilos.carregando} aria-busy="true" aria-label="Carregando busca">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} largura="100%" altura={300} raio={16} />
      ))}
    </div>
  )
}
```
com `import { Skeleton } from '@garagem/ds'` e `carregando: { display: 'grid', gap: 16, padding: 16 }` no `estilos` (pode remover o `centro` se não sobrar uso).
Em `features/veiculo/components/RemoteFinanciamento.tsx`, o fallback vira:
```tsx
<div style={estilos.carregando} aria-busy="true" aria-label="Carregando simulador">
  <Skeleton largura="100%" altura={460} raio={16} />
</div>
```
com `carregando: { padding: 8 }`.

- [ ] **Step 9: `features/veiculo/pages/PaginaVeiculo.tsx`** (substituir)

```tsx
import { useState, type CSSProperties } from 'react'
import { useWindowDimensions } from 'react-native'
import { Link, useLocation, useNavigate } from 'react-router'
import { Botao, Selo, Silhueta, cores, tipo } from '@garagem/ds'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const inteiro = new Intl.NumberFormat('pt-BR')
// o host não importa código do remote: rótulos próprios, tipados pelo contrato
const CAMBIO: Record<Veiculo['cambio'], string> = { manual: 'Manual', automatico: 'Automático' }
const COMBUSTIVEL: Record<Veiculo['combustivel'], string> = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' }
const CARROCERIA: Record<Veiculo['carroceria'], string> = { hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape' }
const DESKTOP = 1024

function irParaSimulador() {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('simulador')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
}

export function PaginaVeiculo() {
  const navigate = useNavigate()
  const veiculo = (useLocation().state as { veiculo?: Veiculo } | null)?.veiculo
  const [proposta, setProposta] = useState<Simulacao>()
  const { width } = useWindowDimensions()
  const desktop = width >= DESKTOP

  // Sem state = URL aberta numa aba nova (F5 na mesma aba mantém o state)
  if (!veiculo) {
    return (
      <div style={estilos.vazio}>
        <h1 style={estilos.titulo}>Anúncio não encontrado</h1>
        <Link to="/busca">Ir para a busca</Link>
      </div>
    )
  }

  const specs: [string, string][] = [
    ['Cidade', `${veiculo.cidade} - ${veiculo.uf}`],
    ['Ano', String(veiculo.ano)],
    ['Km', inteiro.format(veiculo.km)],
    ['Câmbio', CAMBIO[veiculo.cambio]],
    ['Combustível', COMBUSTIVEL[veiculo.combustivel]],
    ['Carroceria', CARROCERIA[veiculo.carroceria]],
  ]

  const simulador = (
    <div id="simulador" style={estilos.simulador}>
      <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
      {/* região viva sempre montada: inserida já com texto, a primeira proposta pode não ser anunciada */}
      <div role="status">
        {proposta && <Selo tom="positivo" texto={`Proposta enviada ✓ — ${proposta.prazo}x de ${parcela.format(proposta.parcela)}`} />}
      </div>
    </div>
  )

  return (
    <div style={desktop ? estilos.grade : estilos.coluna}>
      <div style={estilos.principal}>
        <div style={estilos.foto}>
          <Silhueta carroceria={veiculo.carroceria} />
        </div>
        <h1 style={estilos.titulo}>
          {veiculo.marca} <span style={{ color: cores.accentInk }}>{veiculo.modelo}</span>
        </h1>
        <p style={estilos.versao}>{veiculo.versao}</p>
        <dl style={estilos.specs}>
          {specs.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt style={estilos.specRotulo}>{rotulo}</dt>
              <dd style={estilos.specValor}>{valor}</dd>
            </div>
          ))}
        </dl>
        {!desktop && simulador}
        <Botao variante="contorno" rotulo="Voltar para a busca" onPress={() => navigate(-1)} />
      </div>

      {desktop ? (
        <aside style={estilos.lateral}>
          <p style={estilos.preco}>{preco.format(veiculo.preco)}</p>
          {simulador}
        </aside>
      ) : (
        // correção em relação à Webmotors: o preço não some no celular
        <div style={estilos.barra}>
          <span style={estilos.preco}>{preco.format(veiculo.preco)}</span>
          <Botao variante="acao" rotulo="Ver parcelas" onPress={irParaSimulador} />
        </div>
      )}
    </div>
  )
}

const estilos = {
  vazio: { maxWidth: 720, width: '100%', margin: '0 auto', padding: 24, boxSizing: 'border-box' },
  coluna: { maxWidth: 720, width: '100%', margin: '0 auto', padding: '16px 16px 112px', boxSizing: 'border-box' },
  grade: {
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: 24,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 420px',
    gap: 32,
    alignItems: 'start',
  },
  principal: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  foto: { borderRadius: 16, overflow: 'hidden' },
  titulo: { ...tipo.display, fontSize: 32, lineHeight: 1.1, margin: 0 },
  versao: { ...tipo.legenda, margin: 0, textTransform: 'uppercase' },
  specs: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, margin: 0 },
  specRotulo: { ...tipo.legenda },
  specValor: { ...tipo.corpoForte, margin: 0 },
  simulador: { display: 'flex', flexDirection: 'column', gap: 12 },
  // o scroll é do <main> (abaixo do header), então o sticky conta a partir dele
  lateral: { position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  preco: { ...tipo.preco, fontSize: 28, margin: 0 },
  barra: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    background: cores.bg,
    borderTop: `1px solid ${cores.line}`,
    zIndex: 10,
  },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 10: Checks** — `cd host-react && npx tsc --noEmit && npx vitest run && npx rspack build && rm -rf dist` → limpo, 5 testes, build ok.
- [ ] **Step 11: Commit** — `git add host-react/package.json host-react/package-lock.json host-react/rspack.config.mjs host-react/src` · `feat(host-react): design system, header, skeletons e anúncio com barra de preço fixa`

### Task 9: host-rn — header, skeletons e anúncio

**Files:** Modify `host-rn/src/app/routes/Navegacao.tsx`, `src/features/busca/components/RemoteBusca.tsx`, `src/features/veiculo/components/RemoteFinanciamento.tsx`, `src/features/veiculo/screens/TelaVeiculo.tsx`

- [ ] **Step 1: `Navegacao.tsx`** — no `<Stack.Navigator>`: `screenOptions={{ headerTitleStyle: { fontFamily: tipo.display.fontFamily, color: cores.ink }, headerShadowVisible: false }}` (import `{ cores, tipo } from '@garagem/ds'`); título da Busca: `'GARAGEM · host app'`.
- [ ] **Step 2: Skeletons** — fallback do `Suspense` no `RemoteBusca`: `<View style={estilos.carregando}>{[0, 1, 2].map((i) => <Skeleton key={i} largura="100%" altura={300} raio={16} />)}</View>` (`carregando: { gap: 16, padding: 16 }`); no `RemoteFinanciamento`: `<View style={estilos.carregando}><Skeleton largura="100%" altura={460} raio={16} /></View>` (`carregando: { padding: 8 }`). Import `Skeleton` de `@garagem/ds`; no import de `react-native` trocar `Text` por `View` (o `Text` deixa de ser usado); remover o estilo `carregando` de texto antigo.
- [ ] **Step 3: `TelaVeiculo.tsx`** (substituir)

```tsx
import { useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Botao, Selo, Silhueta, cores, raios, tipo } from '@garagem/ds'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import type { Rotas } from '@/shared/types/rotas'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const inteiro = new Intl.NumberFormat('pt-BR')
const CAMBIO: Record<Veiculo['cambio'], string> = { manual: 'Manual', automatico: 'Automático' }
const COMBUSTIVEL: Record<Veiculo['combustivel'], string> = { flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico' }
const CARROCERIA: Record<Veiculo['carroceria'], string> = { hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', picape: 'Picape' }
const ALTURA_BARRA = 72

export function TelaVeiculo({ route, navigation }: NativeStackScreenProps<Rotas, 'Veiculo'>) {
  const { veiculo } = route.params
  const [proposta, setProposta] = useState<Simulacao>()
  const [ySimulador, setYSimulador] = useState(0)
  const rolagem = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const specs: [string, string][] = [
    ['Cidade', `${veiculo.cidade} - ${veiculo.uf}`],
    ['Ano', String(veiculo.ano)],
    ['Km', inteiro.format(veiculo.km)],
    ['Câmbio', CAMBIO[veiculo.cambio]],
    ['Combustível', COMBUSTIVEL[veiculo.combustivel]],
    ['Carroceria', CARROCERIA[veiculo.carroceria]],
  ]

  return (
    <View style={estilos.tela}>
      <ScrollView
        ref={rolagem}
        contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_BARRA + insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={estilos.foto}>
          <Silhueta carroceria={veiculo.carroceria} />
        </View>
        <Text style={[tipo.display, estilos.titulo]}>
          {veiculo.marca} <Text style={{ color: cores.accentInk }}>{veiculo.modelo}</Text>
        </Text>
        <Text style={[tipo.legenda, estilos.versao]}>{veiculo.versao}</Text>
        <View style={estilos.specs}>
          {specs.map(([rotulo, valor]) => (
            <View key={rotulo} style={estilos.spec}>
              <Text style={tipo.legenda}>{rotulo}</Text>
              <Text style={tipo.corpoForte}>{valor}</Text>
            </View>
          ))}
        </View>
        <View onLayout={(e) => setYSimulador(e.nativeEvent.layout.y)}>
          <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
        </View>
        {/* mesmo molde do web; no iOS o role="status" não anuncia (lacuna conhecida) */}
        <View role="status">
          {proposta && <Selo tom="positivo" texto={`Proposta enviada ✓ — ${proposta.prazo}x de ${parcela.format(proposta.parcela)}`} />}
        </View>
        <Botao variante="contorno" rotulo="Voltar para a busca" onPress={() => navigation.goBack()} />
      </ScrollView>

      {/* preço sempre visível no celular (correção em relação à Webmotors) */}
      <View style={[estilos.barra, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={tipo.preco}>{preco.format(veiculo.preco)}</Text>
        <Botao variante="acao" rotulo="Ver parcelas" onPress={() => rolagem.current?.scrollTo({ y: ySimulador, animated: true })} />
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  conteudo: { gap: 16, padding: 16 },
  foto: { borderRadius: raios.card, overflow: 'hidden' },
  titulo: { fontSize: 28, lineHeight: 32 },
  versao: { textTransform: 'uppercase' },
  specs: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  spec: { width: '33.33%', gap: 2, paddingRight: 8 },
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: cores.bg,
    borderTopWidth: 1,
    borderTopColor: cores.line,
  },
})
```

- [ ] **Step 4: Checks** — `cd host-rn && npx tsc --noEmit && npm run lint`.
- [ ] **Step 5: Commit** — `git add host-rn/src` · `feat(host-rn): header, skeletons e anúncio com barra de preço fixa`

### Task 10: Verificação, README e cofre (controller)

- [ ] **Step 1: Reiniciar** os 6 servidores (configs mudaram; `rspack serve`/Re.Pack não releem): `lsof -ti tcp:<p> -sTCP:LISTEN | xargs kill` para 3000, 3001, 3003, 8081, 8082, 8083 e subir de novo com `nohup` (comandos do README). Reabrir o app nos simuladores.
- [ ] **Step 2: Web (Chrome, 390px e 1280px)** — header GARAGEM; card com silhueta, specs com ícones e preço; chips ativos removíveis; ordenação ("31 carros encontrados · ordenados por menor preço"); BYD Dolphin aparece com "Elétrico"; modal de filtros no estreito; anúncio com MARCA + MODELO em verde escuro, specs 3 colunas, simulador com chips de % e bloco escuro, barra fixa no estreito e duas colunas sticky no largo; "Proposta enviada" em selo; skeleton ao recarregar; fontes Archivo Black/Figtree carregadas; foco visível (Tab). Console sem "Invalid hook call" e sem aviso de versão de shared; um `react-native` (RNW) só no `__FEDERATION__` da página.
- [ ] **Step 3: Manifesto** — `shared` dos 3 web com `react-native` 0.21.4 e `@garagem/ds` `^1.0.0`, sem lucide; nativo idem em `:8082/ios` e `:8083/ios`.
- [ ] **Step 4: App** — screenshot no iPhone (busca com cards e fontes) e iPad (painel lateral); toques no anúncio com o Romero.
- [ ] **Step 5: README** (DS: `cd design-system && npm install && npm run pacote` antes de instalar os outros; regra de versão) e **cofre**.
