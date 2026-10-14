# Simulador de financiamento (2º micro-frontend) — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um segundo remote, `financiamento`, que os dois hosts compõem na página/tela de detalhe do carro, ao lado do remote `busca`.

**Architecture:** Projeto novo `financiamento/` com a mesma receita do `mini-app` (código React Native; build web Rspack + react-native-web na 3003; build nativo Re.Pack na 8083). Os remotes não se conhecem: o host passa `preco` ao simulador e recebe `onInteresse`. Nos hosts, `Fronteira` e `LimiteDeErro` sobem para `shared/components` (duas features passam a usá-los) e nasce `features/veiculo/components/RemoteFinanciamento`.

**Tech Stack:** React 19.2.3 · React Native 0.86.3 · react-native-web 0.21.4 · Rspack 1.6.0 · @module-federation/enhanced 2.9.2 · @callstack/repack 5.4.2 · Vitest 4 · TypeScript 5.9

**Spec:** `docs/superpowers/specs/2026-10-14-financiamento-design.md` (base: `2026-10-14-busca-veiculos-design.md`)

**Regras para quem executa:**
- Raiz: `/Users/romeroalmeida/Romero/estudos/estudo-mf`, branch `feat/financiamento`. Caminhos abaixo são relativos à raiz.
- Versões **exatas** onde o plano diz (React 19.2.3, RN 0.86.3, Rspack 1.6.0 — 1.6.2+ quebra o MF v2 —, MF enhanced 2.9.2, Re.Pack 5.4.2). Nunca `--force`/`--legacy-peer-deps`; se o install falhar, parar e reportar.
- Commit por tarefa: `git add` por caminho (nunca `-A`), mensagem em português terminando com linha em branco + `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nunca `push`. Nunca abrir `.env`.
- Escapes visíveis em strings/regex (`\u00A0`), nunca caractere invisível.
- **Servidores do Romero rodando** em 3000, 3001, 8081 e 8082: não matar. 3002 é a API do meu-tramite e 9000 é o MinIO (Docker): **nunca** `kill` nessas portas. Parar só o que você subir, por porta: `lsof -ti tcp:3003 | xargs kill`, `lsof -ti tcp:8083 | xargs kill`.
- `curl` não existe neste shell: use `node -e "fetch(...)"`. Processos longos: `nohup … > /tmp/x.log 2>&1 &`.

---

## Mapa de arquivos

```
financiamento/                               (novo — Tasks 1-5)
├── package.json · tsconfig.json · babel.config.js · react-native.config.js · index.native.js
├── rspack.web.config.mjs                     web 3003 (remote + página standalone)
├── rspack.native.config.mjs                  nativo 8083
└── src/
    ├── index.tsx · bootstrap.tsx · app/App.tsx
    └── features/simulador/
        ├── types.ts                          Prazo, Simulacao, SimuladorProps (sem imports)
        ├── index.ts                          barrel = módulo exposto ./Simulador
        ├── utils/parcela.ts (+ .test.ts)     PRAZOS, PRAZO_PADRAO, TAXA_MENSAL, calcularParcela
        ├── utils/entrada.ts (+ .test.ts)     limitesEntrada, entradaValida, lerNumero
        ├── utils/formatar.ts (+ .test.ts)    formatarMoeda, formatarReais, formatarTaxa
        ├── components/SeletorPrazo.tsx
        └── pages/Simulador.tsx

host-react/src/                              (Task 6)
├── shared/components/Fronteira.tsx          ← movido de features/busca/components, prop `nome`
├── shared/components/LimiteDeErro.tsx       ← extraído do RemoteBusca, prop `mensagem`
├── features/busca/components/RemoteBusca.tsx         usa os dois de shared
├── features/veiculo/components/RemoteFinanciamento.tsx   novo
├── features/veiculo/pages/PaginaVeiculo.tsx          compõe o simulador + "Proposta enviada"
├── remotes.d.ts · ../tsconfig.json · ../rspack.config.mjs

host-rn/src/                                 (Task 7, simétrico)
├── shared/components/Fronteira.tsx          prop `nome` + `preencher` (flex: 1 só na busca)
├── shared/components/LimiteDeErro.tsx       retry = DevSettings.reload()
├── features/busca/components/RemoteBusca.tsx
├── features/veiculo/components/RemoteFinanciamento.tsx
├── features/veiculo/screens/TelaVeiculo.tsx
├── remotes.d.ts · ../tsconfig.json · ../rspack.config.mjs
```

---

## Chunk 1: Projeto `financiamento` — base e regras

### Task 1: Esqueleto

**Files:**
- Create: `financiamento/package.json`, `financiamento/tsconfig.json`, `financiamento/babel.config.js`, `financiamento/react-native.config.js`, `financiamento/index.native.js`

- [ ] **Step 1: `financiamento/package.json`**

```json
{
  "name": "financiamento",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev:web": "rspack serve --config rspack.web.config.mjs",
    "dev:native": "react-native start --config rspack.native.config.mjs --port 8083",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-web": "0.21.4"
  },
  "devDependencies": {
    "@babel/core": "^7.29.0",
    "@callstack/repack": "5.4.2",
    "@module-federation/enhanced": "2.9.2",
    "@react-native-community/cli": "20.2.0",
    "@react-native-community/cli-platform-ios": "20.2.0",
    "@react-native/babel-preset": "0.86.3",
    "@rspack/cli": "1.6.0",
    "@rspack/core": "1.6.0",
    "@swc/helpers": "0.5.17",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "~5.9.0",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 2: `financiamento/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: arquivos do build nativo** (iguais aos do `mini-app`)

`financiamento/babel.config.js`:
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
}
```

`financiamento/react-native.config.js`:
```js
module.exports = {
  commands: require('@callstack/repack/commands'),
}
```

`financiamento/index.native.js`:
```js
// O remote nativo só expõe módulos via Module Federation; o Re.Pack exige um entry.
```

- [ ] **Step 4: Instalar e conferir**

Run: `cd financiamento && npm install && npm ls react react-dom react-native react-native-web @rspack/core @module-federation/enhanced @callstack/repack --depth=0`
Expected: react@19.2.3, react-dom@19.2.3, react-native@0.86.3, react-native-web@0.21.4, @rspack/core@1.6.0, @module-federation/enhanced@2.9.2, @callstack/repack@5.4.2; sem ERESOLVE.

- [ ] **Step 5: Commit**

```bash
git add financiamento/package.json financiamento/package-lock.json financiamento/tsconfig.json financiamento/babel.config.js financiamento/react-native.config.js financiamento/index.native.js
git commit -m "chore(financiamento): esqueleto do segundo remote com versões fixas"
```

### Task 2: Tipos e regras do cálculo (TDD)

**Files:**
- Create: `financiamento/src/features/simulador/types.ts`
- Create: `financiamento/src/features/simulador/utils/parcela.ts` + `parcela.test.ts`
- Create: `financiamento/src/features/simulador/utils/entrada.ts` + `entrada.test.ts`
- Create: `financiamento/src/features/simulador/utils/formatar.ts` + `formatar.test.ts`

- [ ] **Step 1: `types.ts`** (sem nenhum `import` — os hosts leem este arquivo)

```ts
export type Prazo = 12 | 24 | 36 | 48 | 60

export type Simulacao = {
  preco: number
  entrada: number
  prazo: Prazo
  /** em reais, arredondada para centavos */
  parcela: number
  /** fixa e fictícia (0.0149) */
  taxaMensal: number
}

export type SimuladorProps = {
  preco: number
  onInteresse?: (simulacao: Simulacao) => void
}
```

- [ ] **Step 2: Escrever os três testes**

`utils/parcela.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { calcularParcela } from './parcela'

describe('calcularParcela', () => {
  it('bate com os valores de referência (R$ 112.900, entrada R$ 22.580, 1,49% a.m.)', () => {
    expect(calcularParcela(112900, 22580, 12)).toBe(8275.38)
    expect(calcularParcela(112900, 22580, 48)).toBe(2647.49)
    expect(calcularParcela(112900, 22580, 60)).toBe(2287.64)
  })

  it('devolve o valor já arredondado para centavos', () => {
    const parcela = calcularParcela(99999, 20000, 36)
    expect(parcela).toBe(Math.round(parcela * 100) / 100)
  })
})
```

`utils/entrada.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { entradaValida, lerNumero, limitesEntrada } from './entrada'

describe('limitesEntrada', () => {
  it('20% e 90% do preço, em reais inteiros', () => {
    expect(limitesEntrada(112900)).toEqual({ min: 22580, max: 101610 })
    expect(limitesEntrada(99999)).toEqual({ min: 20000, max: 89999 })
  })
})

describe('entradaValida', () => {
  it('é inclusiva nos dois limites', () => {
    expect(entradaValida(22580, 112900)).toBe(true)
    expect(entradaValida(101610, 112900)).toBe(true)
  })

  it('é falsa fora dos limites e sem valor', () => {
    expect(entradaValida(22579, 112900)).toBe(false)
    expect(entradaValida(101611, 112900)).toBe(false)
    expect(entradaValida(undefined, 112900)).toBe(false)
  })
})

describe('lerNumero', () => {
  it('mantém só dígitos; vazio vira undefined', () => {
    expect(lerNumero('30.000')).toBe(30000)
    expect(lerNumero('abc')).toBeUndefined()
    expect(lerNumero('')).toBeUndefined()
  })
})
```

`utils/formatar.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { formatarMoeda, formatarReais, formatarTaxa } from './formatar'

describe('formatar', () => {
  it('moeda com centavos (parcela)', () => {
    expect(formatarMoeda(2647.49)).toBe('R$\u00A02.647,49')
  })

  it('reais sem centavos (preço do carro)', () => {
    expect(formatarReais(112900)).toBe('R$\u00A0112.900')
  })

  it('taxa mensal', () => {
    expect(formatarTaxa(0.0149)).toBe('1,49% a.m.')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd financiamento && npx vitest run`
Expected: FAIL nos três arquivos (módulos `./parcela`, `./entrada`, `./formatar` inexistentes).

- [ ] **Step 4: Implementar `utils/parcela.ts`**

```ts
import type { Prazo } from '../types'

export const PRAZOS: readonly Prazo[] = [12, 24, 36, 48, 60]
export const PRAZO_PADRAO: Prazo = 48
// ponytail: taxa fixa e fictícia; a real viria de uma API de crédito
export const TAXA_MENSAL = 0.0149

/** Tabela Price: parcela fixa, arredondada para centavos. */
export function calcularParcela(preco: number, entrada: number, prazo: Prazo, taxaMensal = TAXA_MENSAL): number {
  const financiado = preco - entrada
  const parcela = (financiado * taxaMensal) / (1 - (1 + taxaMensal) ** -prazo)
  return Math.round(parcela * 100) / 100
}
```

- [ ] **Step 5: Implementar `utils/entrada.ts`**

```ts
/** Entrada mínima de 20% e máxima de 90% do preço, em reais inteiros (conta inteira, sem 0.2 em ponto flutuante). */
export function limitesEntrada(preco: number): { min: number; max: number } {
  return { min: Math.ceil((preco * 20) / 100), max: Math.floor((preco * 90) / 100) }
}

export function entradaValida(entrada: number | undefined, preco: number): entrada is number {
  const { min, max } = limitesEntrada(preco)
  return entrada !== undefined && entrada >= min && entrada <= max
}

/** Texto digitado → número; descarta o que não é dígito. Vazio = undefined. */
export function lerNumero(texto: string): number | undefined {
  const digitos = texto.replace(/\D/g, '')
  return digitos === '' ? undefined : Number(digitos)
}
```

- [ ] **Step 6: Implementar `utils/formatar.ts`**

```ts
// mínimo explícito nos três: só o máximo dá RangeError no Hermes do Android
const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const reais = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const percentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatarMoeda = (n: number) => moeda.format(n)
export const formatarReais = (n: number) => reais.format(n)
export const formatarTaxa = (taxa: number) => `${percentual.format(taxa)} a.m.`
```

- [ ] **Step 7: Rodar e ver passar**

Run: `cd financiamento && npx vitest run && npx tsc --noEmit`
Expected: PASS (3 arquivos, 9 testes); typecheck sem erros.

- [ ] **Step 8: Commit**

```bash
git add financiamento/src/features/simulador/types.ts financiamento/src/features/simulador/utils
git commit -m "feat(financiamento): contrato e regras da Tabela Price"
```

---

## Chunk 2: Interface e builds do `financiamento`

### Task 3: Seletor de prazo, página `Simulador` e barrel

**Files:**
- Create: `financiamento/src/features/simulador/components/SeletorPrazo.tsx`
- Create: `financiamento/src/features/simulador/pages/Simulador.tsx`
- Create: `financiamento/src/features/simulador/index.ts`

- [ ] **Step 1: `components/SeletorPrazo.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Prazo } from '../types'
import { PRAZOS } from '../utils/parcela'

type Props = { valor: Prazo; onChange: (prazo: Prazo) => void }

export function SeletorPrazo({ valor, onChange }: Props) {
  return (
    <View role="radiogroup" aria-label="Prazo em meses" style={estilos.grupo}>
      {PRAZOS.map((prazo) => {
        const marcado = prazo === valor
        return (
          <Pressable
            key={prazo}
            role="radio"
            aria-checked={marcado}
            aria-label={`${prazo} meses`}
            onPress={() => onChange(prazo)}
            style={[estilos.opcao, marcado && estilos.marcado]}
          >
            <Text style={[estilos.texto, marcado && estilos.textoMarcado]}>{prazo}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const estilos = StyleSheet.create({
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
  },
  marcado: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  texto: { fontSize: 15, fontWeight: '600', color: '#18181b' },
  textoMarcado: { color: '#fff' },
})
```

- [ ] **Step 2: `pages/Simulador.tsx`**

```tsx
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SeletorPrazo } from '../components/SeletorPrazo'
import type { Prazo, SimuladorProps } from '../types'
import { entradaValida, lerNumero, limitesEntrada } from '../utils/entrada'
import { formatarMoeda, formatarReais, formatarTaxa } from '../utils/formatar'
import { PRAZO_PADRAO, TAXA_MENSAL, calcularParcela } from '../utils/parcela'

export default function Simulador({ preco, onInteresse }: SimuladorProps) {
  const limites = limitesEntrada(preco)
  // estado inicial vem do preço; trocar de carro remonta o simulador (o host passa key={veiculo.id})
  const [entrada, setEntrada] = useState<number | undefined>(limites.min)
  const [prazo, setPrazo] = useState<Prazo>(PRAZO_PADRAO)
  const parcela = entradaValida(entrada, preco) ? calcularParcela(preco, entrada, prazo) : undefined
  const bloqueado = parcela === undefined

  // avisa o host só no clique — nunca num efeito
  function interesse() {
    if (parcela === undefined || entrada === undefined) return
    onInteresse?.({ preco, entrada, prazo, parcela, taxaMensal: TAXA_MENSAL })
  }

  return (
    <View style={estilos.caixa}>
      <Text role="heading" style={estilos.titulo}>
        Simule o financiamento
      </Text>

      <View style={estilos.linha}>
        <Text style={estilos.rotulo}>Preço do carro</Text>
        <Text style={estilos.valor}>{formatarReais(preco)}</Text>
      </View>

      <View style={estilos.linha}>
        <Text style={estilos.rotulo}>Entrada</Text>
        <TextInput
          value={entrada === undefined ? '' : String(entrada)}
          onChangeText={(texto) => setEntrada(lerNumero(texto))}
          inputMode="numeric"
          maxLength={9}
          aria-label="Entrada"
          style={estilos.input}
        />
      </View>
      <Text style={estilos.ajuda}>mín. 20% do preço</Text>

      <Text style={estilos.rotulo}>Prazo (meses)</Text>
      <SeletorPrazo valor={prazo} onChange={setPrazo} />

      {parcela !== undefined ? (
        <View style={estilos.resultado}>
          <Text style={estilos.parcela}>
            {prazo}x de {formatarMoeda(parcela)}
          </Text>
          <Text style={estilos.ajuda}>taxa {formatarTaxa(TAXA_MENSAL)} · simulação, sem valor de proposta</Text>
        </View>
      ) : (
        <Text role="alert" style={estilos.erro}>
          Entrada entre {formatarReais(limites.min)} e {formatarReais(limites.max)}
        </Text>
      )}

      <Pressable
        role="button"
        disabled={bloqueado}
        aria-disabled={bloqueado}
        onPress={interesse}
        style={[estilos.botao, bloqueado && estilos.botaoBloqueado]}
      >
        <Text style={estilos.botaoTexto}>Tenho interesse</Text>
      </Pressable>
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { gap: 10, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e4e4e7', backgroundColor: '#fff' },
  titulo: { fontSize: 18, fontWeight: '700', color: '#18181b' },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rotulo: { fontSize: 14, fontWeight: '600', color: '#3f3f46' },
  valor: { fontSize: 16, fontWeight: '700', color: '#18181b' },
  input: {
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#fff',
  },
  ajuda: { fontSize: 12, color: '#71717a' },
  resultado: { gap: 2, marginTop: 6 },
  parcela: { fontSize: 22, fontWeight: '700', color: '#18181b' },
  erro: { marginTop: 6, fontSize: 14, color: '#b91c1c' },
  botao: {
    minHeight: 44,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  botaoBloqueado: { opacity: 0.4 },
  botaoTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
```

- [ ] **Step 3: `index.ts`** (o módulo que o Module Federation expõe)

```ts
export { default } from './pages/Simulador'
export type { Prazo, Simulacao, SimuladorProps } from './types'
```

- [ ] **Step 4: Typecheck e testes**

Run: `cd financiamento && npx tsc --noEmit && npx vitest run`
Expected: sem erros; 9 testes passando.

- [ ] **Step 5: Commit**

```bash
git add financiamento/src/features/simulador/components financiamento/src/features/simulador/pages financiamento/src/features/simulador/index.ts
git commit -m "feat(financiamento): tela do simulador com seletor de prazo"
```

### Task 4: Build web (remote + página standalone na 3003)

**Files:**
- Create: `financiamento/src/index.tsx`, `financiamento/src/bootstrap.tsx`, `financiamento/src/app/App.tsx`
- Create: `financiamento/rspack.web.config.mjs`

- [ ] **Step 1: `src/index.tsx`**

```tsx
// Fronteira assíncrona: dá tempo do runtime do MF negociar react/react-dom
// antes de qualquer import deles (senão: "Shared module is not available for eager consumption").
import('./bootstrap')
```

- [ ] **Step 2: `src/bootstrap.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: `src/app/App.tsx`**

```tsx
import { ScrollView, StyleSheet, Text } from 'react-native'
import Simulador from '@/features/simulador'

export function App() {
  return (
    <ScrollView contentContainerStyle={estilos.raiz}>
      <Text style={estilos.aviso}>mini-app financiamento · modo standalone (sem host)</Text>
      <Simulador preco={112900} onInteresse={(simulacao) => console.log('[financiamento] interesse', simulacao)} />
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  raiz: { gap: 12, padding: 16, width: '100%', maxWidth: 520, alignSelf: 'center' },
  aviso: { padding: 8, textAlign: 'center', backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12 },
})
```

- [ ] **Step 4: `rspack.web.config.mjs`**

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@rspack/cli'
import { rspack } from '@rspack/core'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import reactPkg from 'react/package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// versão instalada (exata), não a declarada — um ^ no package.json afrouxaria o requiredVersion
const versaoReact = reactPkg.version

const HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>financiamento · standalone</title>
    <style>html, body, #root { height: 100%; margin: 0 } #root { display: flex; flex-direction: column }</style>
  </head>
  <body><div id="root"></div></body>
</html>`

export default defineConfig({
  context: __dirname,
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    publicPath: 'auto',
    uniqueName: 'financiamento',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    // chunks: ['main'] — sem isso a página standalone também injeta o remoteEntry.js
    new rspack.HtmlRspackPlugin({ templateContent: HTML, chunks: ['main'] }),
    new ModuleFederationPlugin({
      name: 'financiamento',
      filename: 'remoteEntry.js',
      exposes: { './Simulador': './src/features/simulador/index.ts' },
      dts: false,
      shared: {
        react: { singleton: true, requiredVersion: versaoReact },
        'react-dom': { singleton: true, requiredVersion: versaoReact },
      },
    }),
  ],
  devServer: {
    port: 3003,
    historyApiFallback: true,
    // os hosts baixam o mf-manifest.json com fetch, de outra origem
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})
```

- [ ] **Step 5: Subir e conferir o manifesto**

```bash
cd financiamento && nohup npm run dev:web > /tmp/estudo-mf-fin-web.log 2>&1 &
until node -e "fetch('http://localhost:3003/mf-manifest.json').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do sleep 2; done
node -e "fetch('http://localhost:3003/mf-manifest.json').then(r=>{console.log(r.headers.get('access-control-allow-origin'));return r.json()}).then(m=>console.log(m.name, m.exposes.map(e=>e.name)))"
```
Expected: `*` e `financiamento [ 'Simulador' ]`. O aviso de `publicPath='auto'` no log é normal.

- [ ] **Step 6: Conferir a página standalone** (Chrome via `mcp__claude-in-chrome__*`, aba nova; clicar em `Pressable` por **coordenada** — clique por `ref` não aciona o react-native-web)

`http://localhost:3003`: "48x de R$ 2.647,49"; tocar "12" → "12x de R$ 8.275,38"; apagar a entrada → "Entrada entre R$ 22.580 e R$ 101.610" e botão apagado; console com `[financiamento] interesse` ao clicar "Tenho interesse" com entrada válida; sem erro de "Shared module"/"Invalid hook call".
Se o Chrome não estiver disponível, conferir só o manifesto e o HTML via node e reportar DONE_WITH_CONCERNS.

- [ ] **Step 7: Typecheck, parar o servidor e commitar**

```bash
cd financiamento && npx tsc --noEmit && lsof -ti tcp:3003 | xargs kill
cd .. && git add financiamento/src/index.tsx financiamento/src/bootstrap.tsx financiamento/src/app financiamento/rspack.web.config.mjs
git commit -m "feat(financiamento): build web via Module Federation com página standalone"
```

### Task 5: Build nativo (Re.Pack na 8083)

**Files:**
- Create: `financiamento/rspack.native.config.mjs`

- [ ] **Step 1: `rspack.native.config.mjs`**

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Repack from '@callstack/repack'
import reactPkg from 'react/package.json' with { type: 'json' }
import reactNativePkg from 'react-native/package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default Repack.defineRspackConfig((env) => {
  const { mode } = env
  const resolveBase = Repack.getResolveOptions({ enablePackageExports: true })

  return {
    mode,
    context: __dirname,
    entry: './index.native.js',
    resolve: {
      ...resolveBase,
      alias: { ...resolveBase.alias, '@': path.resolve(__dirname, 'src') },
    },
    output: { path: '[context]/build/native/[platform]', uniqueName: 'financiamento' },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          use: { loader: '@callstack/repack/babel-swc-loader', parallel: true, options: {} },
          type: 'javascript/auto',
        },
        ...Repack.getAssetTransformRules({ inline: true }),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'financiamento',
        filename: 'financiamento.container.js.bundle',
        exposes: { './Simulador': './src/features/simulador/index.ts' },
        dts: false,
        // eager: false EXPLÍCITO — o padrão do plugin é eager: true até no remote
        shared: {
          react: { singleton: true, eager: false, version: reactPkg.version, requiredVersion: reactPkg.version },
          'react-native': {
            singleton: true,
            eager: false,
            version: reactNativePkg.version,
            requiredVersion: reactNativePkg.version,
          },
        },
      }),
    ],
  }
})
```

- [ ] **Step 2: Subir e conferir** (8083 livre; conferir antes com `lsof -nP -iTCP:8083 -sTCP:LISTEN`, que deve sair vazio)

```bash
cd financiamento && nohup npm run dev:native > /tmp/estudo-mf-fin-native.log 2>&1 &
until node -e "fetch('http://127.0.0.1:8083/ios/mf-manifest.json').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do sleep 3; done
node -e "fetch('http://127.0.0.1:8083/ios/mf-manifest.json').then(r=>r.json()).then(m=>console.log(m.name, m.exposes.map(e=>e.name)))"
```
Expected: `financiamento [ 'Simulador' ]` em `127.0.0.1` (IPv4 — confirma que nada mais ocupa a porta).

- [ ] **Step 3: Parar e commitar**

```bash
lsof -ti tcp:8083 | xargs kill
git add financiamento/rspack.native.config.mjs
git commit -m "feat(financiamento): build nativo via Re.Pack"
```

---

## Chunk 3: Hosts compõem os dois remotes

### Task 6: host-react

**Files:**
- Move: `host-react/src/features/busca/components/Fronteira.tsx` → `host-react/src/shared/components/Fronteira.tsx`
- Create: `host-react/src/shared/components/LimiteDeErro.tsx`
- Create: `host-react/src/features/veiculo/components/RemoteFinanciamento.tsx`
- Modify: `host-react/src/features/busca/components/RemoteBusca.tsx`, `host-react/src/features/veiculo/pages/PaginaVeiculo.tsx`, `host-react/src/remotes.d.ts`, `host-react/tsconfig.json`, `host-react/rspack.config.mjs`

- [ ] **Step 1: Mover a Fronteira** — `git mv host-react/src/features/busca/components/Fronteira.tsx host-react/src/shared/components/Fronteira.tsx` e trocar o conteúdo por:

```tsx
import type { CSSProperties, ReactNode } from 'react'

type Props = { nome: string; children: ReactNode }

/** Só visual: mostra no estudo onde termina o host e começa cada remote. */
export function Fronteira({ nome, children }: Props) {
  return (
    <div style={estilos.borda}>
      <span style={estilos.etiqueta}>remote: {nome}</span>
      {children}
    </div>
  )
}

const estilos = {
  borda: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: 8,
    border: '2px dashed #7c3aed',
    borderRadius: 8,
  },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: 600, color: '#7c3aed' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 2: `shared/components/LimiteDeErro.tsx`**

```tsx
import { Component, type CSSProperties, type ReactNode } from 'react'

type Props = { mensagem: string; children: ReactNode }

/** A falha de um remote fica dentro da caixa dele; o resto da página segue. */
export class LimiteDeErro extends Component<Props, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div style={estilos.centro} role="alert">
        <p>{this.props.mensagem}</p>
        {/* ponytail: o runtime do MF guarda a falha do módulo; recarregar é o único retry que funciona */}
        <button type="button" onClick={() => window.location.reload()}>
          Tentar de novo
        </button>
      </div>
    )
  }
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 3: `features/busca/components/RemoteBusca.tsx`** (substituir o arquivo)

```tsx
import { Suspense, lazy, type CSSProperties } from 'react'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: voltar do detalhe não pisca "Carregando busca…"
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira nome="busca">
      <LimiteDeErro mensagem="Busca indisponível">
        <Suspense fallback={<p style={estilos.centro}>Carregando busca…</p>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 4: `features/veiculo/components/RemoteFinanciamento.tsx`**

```tsx
import { Suspense, lazy, type CSSProperties } from 'react'
import type { SimuladorProps } from '@financiamento/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: abrir outro carro não baixa o remote de novo
const Simulador = lazy(() => import('financiamento/Simulador'))

export function RemoteFinanciamento(props: SimuladorProps) {
  return (
    <Fronteira nome="financiamento">
      <LimiteDeErro mensagem="Simulador indisponível">
        <Suspense fallback={<p style={estilos.centro}>Carregando simulador…</p>}>
          <Simulador {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = {
  centro: { padding: 32, textAlign: 'center' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 5: `features/veiculo/pages/PaginaVeiculo.tsx`** — três mudanças:

1. Imports (topo do arquivo):
```tsx
import { useState, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Veiculo } from '@busca/tipos'
import type { Simulacao } from '@financiamento/tipos'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'
```
e, junto dos outros formatadores:
```tsx
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
```
2. Logo depois de `const veiculo = …` (hooks antes do `if (!veiculo) return`):
```tsx
  const [proposta, setProposta] = useState<Simulacao>()
```
3. Entre o `<p>` de ano/km/cidade e o botão "Voltar para a busca":
```tsx
      <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
      {proposta && (
        <p style={estilos.proposta} role="status">
          Proposta enviada ✓ — {proposta.prazo}x de {parcela.format(proposta.parcela)}
        </p>
      )}
```
e no objeto `estilos`:
```tsx
  proposta: { margin: '8px', fontWeight: 600, color: '#15803d' },
```

- [ ] **Step 6: Tipos e config**

`src/remotes.d.ts` — acrescentar ao final:
```ts

declare module 'financiamento/Simulador' {
  import type { ComponentType } from 'react'
  import type { SimuladorProps } from '@financiamento/tipos'

  const Simulador: ComponentType<SimuladorProps>
  export default Simulador
}
```

`tsconfig.json` — em `paths`, depois de `@busca/tipos`:
```json
      "@financiamento/tipos": ["../financiamento/src/features/simulador/types"]
```

`rspack.config.mjs` — trocar a linha `remotes`:
```js
      remotes: {
        busca: 'busca@http://localhost:3001/mf-manifest.json',
        financiamento: 'financiamento@http://localhost:3003/mf-manifest.json',
      },
```

- [ ] **Step 7: Conferir**

Run: `cd host-react && npx tsc --noEmit && npx vitest run && npx rspack build && rm -rf dist`
Expected: sem erros; 4 testes; build ok (remotes por manifesto resolvem em tempo de execução). `grep -rn "busca/components/Fronteira" src` deve sair vazio.

- [ ] **Step 8: Commit**

```bash
git add host-react/src/shared host-react/src/features/busca/components host-react/src/features/veiculo host-react/src/remotes.d.ts host-react/tsconfig.json host-react/rspack.config.mjs
git commit -m "feat(host-react): detalhe compõe o remote financiamento; Fronteira e LimiteDeErro em shared"
```

### Task 7: host-rn

**Files:**
- Move: `host-rn/src/features/busca/components/Fronteira.tsx` → `host-rn/src/shared/components/Fronteira.tsx`
- Create: `host-rn/src/shared/components/LimiteDeErro.tsx`
- Create: `host-rn/src/features/veiculo/components/RemoteFinanciamento.tsx`
- Modify: `host-rn/src/features/busca/components/RemoteBusca.tsx`, `host-rn/src/features/veiculo/screens/TelaVeiculo.tsx`, `host-rn/src/remotes.d.ts`, `host-rn/tsconfig.json`, `host-rn/rspack.config.mjs`

- [ ] **Step 1: Mover a Fronteira** — `git mv host-rn/src/features/busca/components/Fronteira.tsx host-rn/src/shared/components/Fronteira.tsx` e trocar o conteúdo por:

```tsx
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  nome: string
  /** flex: 1 — só para a busca, que ocupa a tela; dentro de ScrollView o flex: 1 colapsa para altura zero */
  preencher?: boolean
  children: ReactNode
}

/** Só visual: mostra no estudo onde termina o host e começa cada remote. */
export function Fronteira({ nome, preencher = false, children }: Props) {
  return (
    <View style={[estilos.borda, preencher && estilos.preencher]}>
      <Text style={estilos.etiqueta}>remote: {nome}</Text>
      {children}
    </View>
  )
}

const estilos = StyleSheet.create({
  borda: { margin: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#7c3aed', borderRadius: 8 },
  preencher: { flex: 1 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: '600', color: '#7c3aed' },
})
```

- [ ] **Step 2: `shared/components/LimiteDeErro.tsx`**

```tsx
import { Component, type ReactNode } from 'react'
import { DevSettings, Pressable, StyleSheet, Text, View } from 'react-native'

type Props = { mensagem: string; children: ReactNode }

/** A falha de um remote fica dentro da caixa dele; o resto da tela segue. */
export class LimiteDeErro extends Component<Props, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <View style={estilos.centro} role="alert">
        <Text style={estilos.titulo}>{this.props.mensagem}</Text>
        {/* ponytail: o runtime do MF guarda a falha; recarregar o app (só em dev) é o único retry que funciona.
            No dev, feche o LogBox para ver esta tela. */}
        <Pressable role="button" style={estilos.botao} onPress={() => DevSettings.reload()}>
          <Text style={estilos.botaoTexto}>Tentar de novo</Text>
        </Pressable>
      </View>
    )
  }
}

const estilos = StyleSheet.create({
  // sem flex: 1 — dentro do ScrollView do detalhe colapsaria
  centro: { alignItems: 'center', gap: 12, padding: 32 },
  titulo: { fontSize: 16, fontWeight: '600' },
  botao: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
})
```

- [ ] **Step 3: `features/busca/components/RemoteBusca.tsx`** (substituir o arquivo)

```tsx
import { Suspense, lazy } from 'react'
import { StyleSheet, Text } from 'react-native'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// No escopo do módulo: só baixa o remote uma vez.
// Com o remote fora, o require protegido do Re.Pack (guardedRequire) reporta a falha como
// erro FATAL (LogBox cheio no dev; crash no release) e o import() resolve { default: undefined }.
// A guarda dá ao boundary um erro claro em vez do "Element type is invalid" do React.
const BuscaVeiculos = lazy(() =>
  import('busca/BuscaVeiculos').then((m) => {
    if (!m.default) throw new Error('remote busca indisponível')
    return m
  }),
)

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira nome="busca" preencher>
      <LimiteDeErro mensagem="Busca indisponível">
        <Suspense fallback={<Text style={estilos.carregando}>Carregando busca…</Text>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  carregando: { padding: 32, textAlign: 'center' },
})
```

- [ ] **Step 4: `features/veiculo/components/RemoteFinanciamento.tsx`**

```tsx
import { Suspense, lazy } from 'react'
import { StyleSheet, Text } from 'react-native'
import type { SimuladorProps } from '@financiamento/tipos'
import { Fronteira } from '@/shared/components/Fronteira'
import { LimiteDeErro } from '@/shared/components/LimiteDeErro'

// Mesmo cuidado da busca: no nativo a falha resolve { default: undefined } em vez de rejeitar
const Simulador = lazy(() =>
  import('financiamento/Simulador').then((m) => {
    if (!m.default) throw new Error('remote financiamento indisponível')
    return m
  }),
)

export function RemoteFinanciamento(props: SimuladorProps) {
  return (
    <Fronteira nome="financiamento">
      <LimiteDeErro mensagem="Simulador indisponível">
        <Suspense fallback={<Text style={estilos.carregando}>Carregando simulador…</Text>}>
          <Simulador {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  carregando: { padding: 32, textAlign: 'center' },
})
```

- [ ] **Step 5: `features/veiculo/screens/TelaVeiculo.tsx`** — quatro mudanças:

1. Imports (topo):
```tsx
import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Simulacao } from '@financiamento/tipos'
import type { Rotas } from '@/shared/types/rotas'
import { RemoteFinanciamento } from '../components/RemoteFinanciamento'
```
e junto dos formatadores:
```tsx
const parcela = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
```
2. Depois de `const { veiculo } = route.params`:
```tsx
  const [proposta, setProposta] = useState<Simulacao>()
```
3. O `ScrollView` vira:
```tsx
    <ScrollView contentContainerStyle={estilos.tela} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
```
4. Entre o `<Text style={estilos.detalhe}>` e o `Pressable` "Voltar para a busca":
```tsx
      <RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />
      {proposta && (
        <Text style={estilos.proposta} role="status">
          Proposta enviada ✓ — {proposta.prazo}x de {parcela.format(proposta.parcela)}
        </Text>
      )}
```
e no `StyleSheet`:
```tsx
  proposta: { marginHorizontal: 8, fontSize: 15, fontWeight: '600', color: '#15803d' },
```

- [ ] **Step 6: Tipos e config**

`src/remotes.d.ts` — acrescentar ao final o mesmo bloco do host-react:
```ts

declare module 'financiamento/Simulador' {
  import type { ComponentType } from 'react'
  import type { SimuladorProps } from '@financiamento/tipos'

  const Simulador: ComponentType<SimuladorProps>
  export default Simulador
}
```

`tsconfig.json` — em `paths`:
```json
      "@financiamento/tipos": ["../financiamento/src/features/simulador/types"]
```

`rspack.config.mjs` — trocar a linha `remotes`:
```js
        remotes: {
          busca: `busca@http://localhost:8082/${platform}/mf-manifest.json`,
          financiamento: `financiamento@http://localhost:8083/${platform}/mf-manifest.json`,
        },
```

- [ ] **Step 7: Conferir**

Run: `cd host-rn && npx tsc --noEmit && npm run lint`
Expected: sem erros. `grep -rn "busca/components/Fronteira" src` deve sair vazio.

- [ ] **Step 8: Commit**

```bash
git add host-rn/src/shared host-rn/src/features/busca/components host-rn/src/features/veiculo host-rn/src/remotes.d.ts host-rn/tsconfig.json host-rn/rspack.config.mjs
git commit -m "feat(host-rn): detalhe compõe o remote financiamento; Fronteira e LimiteDeErro em shared"
```

### Task 8: Verificação ponta a ponta, README e cofre (controller)

- [ ] **Step 1: Servidores** — a 3000/3001/8081/8082 já estão no ar (do Romero). Subir os dois novos:
```bash
cd financiamento && nohup npm run dev:web > /tmp/estudo-mf-fin-web.log 2>&1 &
cd financiamento && nohup npm run dev:native > /tmp/estudo-mf-fin-native.log 2>&1 &
```
O host-react recarrega o config? **Não** — `rspack serve` não relê o config: reiniciar só o da 3000 (`lsof -ti tcp:3000 | xargs kill` e `cd host-react && nohup npm run dev …`). O host-rn idem na 8081.

- [ ] **Step 2: Roteiro web (Chrome)** — abrir o Civic: simulador com "48x de R$ 2.647,49"; prazo 12 → "12x de R$ 8.275,38"; entrada fora → mensagem e botão apagado; "Tenho interesse" → "Proposta enviada ✓ — 12x de R$ 8.275,38"; voltar e abrir outro carro → simulador do novo preço, sem proposta; derrubar a 3003 → detalhe e busca funcionando, só "Simulador indisponível"; religar e "Tentar de novo"; console sem "Invalid hook call"/aviso de versão.

- [ ] **Step 3: Roteiro nativo** — recarregar o app no simulador; conferir no log da 8081 o bundle compilando com os dois remotes; screenshot. Os toques (abrir carro, mexer no simulador) ficam com o Romero.

- [ ] **Step 4: README** — tabela de portas com o financiamento (3003/8083), `(cd financiamento && npm install)` no "Instalar", os comandos `dev:web`/`dev:native` dele em "Rodar", `(cd financiamento && npm test && npm run typecheck)` em "Testes". Commit `docs: financiamento no README`.

- [ ] **Step 5: Cofre** — `Projetos/estudo-mf.md` e linha do `INDICE.md` com o 2º remote.
