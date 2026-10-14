# Busca de veículos via Module Federation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um mini-app de busca de veículos (código React Native) carregado em tempo de execução, via Module Federation 2.0, por um host React web e por um host React Native.

**Architecture:** Três projetos independentes em `estudo-mf/` (cada um com seu `npm install`). O `mini-app` tem um código e dois builds: web (Rspack + `react-native-web`, porta 3001) e nativo (Re.Pack, porta 9000). `host-react` (Rspack + React Router 7, porta 3000) e `host-rn` (RN CLI 0.86.3 + Re.Pack + React Navigation, porta 8081) importam `busca/BuscaVeiculos` com `React.lazy`. Os hosts só compartilham **tipos** com o mini-app (alias de TS para `types.ts`).

**Tech Stack:** React 19.2.3 · React Native 0.86.3 · react-native-web 0.21.4 · Rspack 1.6.0 · @module-federation/enhanced 2.9.2 · @callstack/repack 5.4.2 · React Router 7 · React Navigation 7 · Vitest 4 · TypeScript 5.9

**Spec:** `docs/superpowers/specs/2026-10-14-busca-veiculos-design.md`

**Regras para quem executa:**
- Raiz de tudo: `/Users/romeroalmeida/Romero/estudos/estudo-mf`. Caminhos abaixo são relativos a ela.
- Versões são **exatas** onde o plano diz exato. Nunca deixe o npm instalar outra versão de `react`/`react-dom`/`react-native` (duas cópias de React quebram hooks no Module Federation).
- Commit: `git add` por caminho (nunca `-A`), mensagem em português, terminando com
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nunca `push`.
- Processos longos (dev servers): rodar em background e ler o log.
- Nunca abrir `.env`.

---

## Mapa de arquivos

```
estudo-mf/
├── .nvmrc                                  Node 24
├── README.md                               como rodar os 4 processos
├── mini-app/
│   ├── package.json · tsconfig.json · babel.config.js · react-native.config.js
│   ├── rspack.web.config.mjs               build web (remote + página standalone)
│   ├── rspack.native.config.mjs            build nativo (Re.Pack)
│   ├── index.native.js                     entry vazio exigido pelo Re.Pack
│   └── src/
│       ├── index.tsx · bootstrap.tsx       fronteira assíncrona da página standalone
│       ├── app/App.tsx                     página standalone (dev isolado)
│       └── features/busca-veiculos/
│           ├── types.ts                    só tipos, sem imports (hosts leem daqui)
│           ├── index.ts                    barrel = módulo exposto
│           ├── services/veiculos.json · veiculosService.ts
│           ├── utils/filtrarVeiculos.ts (+ .test.ts)
│           ├── utils/filtros.ts (+ .test.ts)      FILTROS_VAZIOS, normalizarFiltros, contarFiltrosAtivos, lerNumero
│           ├── utils/formatar.ts (+ .test.ts)
│           ├── components/BarraBusca.tsx · PainelFiltros.tsx · CardVeiculo.tsx
│           └── pages/BuscaVeiculos.tsx
├── host-react/
│   ├── package.json · tsconfig.json · rspack.config.mjs
│   └── src/
│       ├── index.tsx · bootstrap.tsx · remotes.d.ts
│       ├── app/App.tsx · app/routes/router.tsx
│       ├── app/layout/Layout.tsx · Fronteira.tsx · RemoteBusca.tsx
│       └── features/
│           ├── busca/pages/PaginaBusca.tsx · busca/utils/filtrosUrl.ts (+ .test.ts)
│           └── veiculo/pages/PaginaVeiculo.tsx
└── host-rn/                                gerado pelo RN CLI, depois ajustado
    ├── .ruby-version · react-native.config.js · rspack.config.mjs · index.js · tsconfig.json
    └── src/
        ├── remotes.d.ts
        ├── app/App.tsx · app/routes/Navegacao.tsx
        ├── app/layout/Fronteira.tsx · RemoteBusca.tsx
        └── features/
            ├── busca/screens/TelaBusca.tsx
            └── veiculo/screens/TelaVeiculo.tsx
```

---

## Chunk 1: Base do mini-app (dados, tipos e regras)

### Task 1: Esqueleto do mini-app

**Files:**
- Create: `.nvmrc`, `mini-app/package.json`, `mini-app/tsconfig.json`

- [ ] **Step 1: Criar `.nvmrc`**

```
24
```

- [ ] **Step 2: Criar `mini-app/package.json`**

```json
{
  "name": "mini-app",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev:web": "rspack serve --config rspack.web.config.mjs",
    "dev:native": "react-native start --config rspack.native.config.mjs --port 9000",
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
    "@swc/helpers": "~0.5.17",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "~5.9.0",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 3: Criar `mini-app/tsconfig.json`**

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
    "resolveJsonModule": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Instalar e conferir as versões**

Run: `cd mini-app && npm install && npm ls react react-dom react-native --depth=0`
Expected: `react@19.2.3`, `react-dom@19.2.3`, `react-native@0.86.3`. Se o `npm install` falhar por peer dependency, **pare e reporte** (não use `--force`/`--legacy-peer-deps` sem decidir junto).

- [ ] **Step 5: Commit**

```bash
git add .nvmrc mini-app/package.json mini-app/package-lock.json mini-app/tsconfig.json
git commit -m "chore(mini-app): esqueleto com versões fixas"
```

### Task 2: Tipos, dados e serviço

**Files:**
- Create: `mini-app/src/features/busca-veiculos/types.ts`
- Create: `mini-app/src/features/busca-veiculos/services/veiculos.json`
- Create: `mini-app/src/features/busca-veiculos/services/veiculosService.ts`

- [ ] **Step 1: Criar `types.ts`** (sem nenhum `import` — os hosts leem este arquivo)

```ts
export type Veiculo = {
  id: string
  marca: string
  modelo: string
  versao: string
  ano: number
  km: number
  preco: number
  cidade: string
  uf: string
}

export type Filtros = {
  texto: string
  marcas: string[]
  precoMax?: number
  anoMin?: number
  kmMax?: number
}

export type BuscaVeiculosProps = {
  filtrosIniciais?: Filtros
  onFiltrosMudaram?: (filtros: Filtros) => void
  onSelecionarVeiculo: (veiculo: Veiculo) => void
}
```

- [ ] **Step 2: Criar `veiculos.json`** (30 carros fictícios, 8 marcas)

```json
[
  { "id": "1", "marca": "Honda", "modelo": "Civic", "versao": "EXL 2.0", "ano": 2020, "km": 45000, "preco": 112900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "2", "marca": "Honda", "modelo": "City", "versao": "Touring 1.5", "ano": 2022, "km": 28000, "preco": 109900, "cidade": "Barra Mansa", "uf": "RJ" },
  { "id": "3", "marca": "Honda", "modelo": "HR-V", "versao": "EXL 1.5", "ano": 2021, "km": 39000, "preco": 129900, "cidade": "Resende", "uf": "RJ" },
  { "id": "4", "marca": "Honda", "modelo": "Fit", "versao": "EX 1.5", "ano": 2019, "km": 61000, "preco": 79900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "5", "marca": "Toyota", "modelo": "Corolla", "versao": "XEi 2.0", "ano": 2021, "km": 30000, "preco": 128500, "cidade": "Barra Mansa", "uf": "RJ" },
  { "id": "6", "marca": "Toyota", "modelo": "Corolla Cross", "versao": "XRE 2.0", "ano": 2023, "km": 15000, "preco": 159900, "cidade": "Resende", "uf": "RJ" },
  { "id": "7", "marca": "Toyota", "modelo": "Yaris", "versao": "XL 1.5", "ano": 2022, "km": 22000, "preco": 94900, "cidade": "Itatiaia", "uf": "RJ" },
  { "id": "8", "marca": "Toyota", "modelo": "Hilux", "versao": "SRV 2.8", "ano": 2020, "km": 88000, "preco": 239900, "cidade": "Valença", "uf": "RJ" },
  { "id": "9", "marca": "Volkswagen", "modelo": "Polo", "versao": "TSI 1.0", "ano": 2022, "km": 18000, "preco": 94900, "cidade": "Resende", "uf": "RJ" },
  { "id": "10", "marca": "Volkswagen", "modelo": "T-Cross", "versao": "Comfortline 1.0", "ano": 2021, "km": 42000, "preco": 114900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "11", "marca": "Volkswagen", "modelo": "Nivus", "versao": "Highline 1.0", "ano": 2023, "km": 12000, "preco": 132900, "cidade": "Barra Mansa", "uf": "RJ" },
  { "id": "12", "marca": "Volkswagen", "modelo": "Gol", "versao": "1.0", "ano": 2019, "km": 74000, "preco": 52900, "cidade": "Pinheiral", "uf": "RJ" },
  { "id": "13", "marca": "Chevrolet", "modelo": "Onix", "versao": "LT 1.0", "ano": 2021, "km": 47000, "preco": 72900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "14", "marca": "Chevrolet", "modelo": "Onix Plus", "versao": "Premier 1.0", "ano": 2022, "km": 26000, "preco": 98900, "cidade": "Barra do Piraí", "uf": "RJ" },
  { "id": "15", "marca": "Chevrolet", "modelo": "Tracker", "versao": "LTZ 1.0", "ano": 2022, "km": 33000, "preco": 119900, "cidade": "Resende", "uf": "RJ" },
  { "id": "16", "marca": "Chevrolet", "modelo": "S10", "versao": "LTZ 2.8", "ano": 2019, "km": 112000, "preco": 189900, "cidade": "Valença", "uf": "RJ" },
  { "id": "17", "marca": "Fiat", "modelo": "Argo", "versao": "Drive 1.0", "ano": 2022, "km": 31000, "preco": 74900, "cidade": "Barra Mansa", "uf": "RJ" },
  { "id": "18", "marca": "Fiat", "modelo": "Cronos", "versao": "Precision 1.3", "ano": 2021, "km": 44000, "preco": 82900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "19", "marca": "Fiat", "modelo": "Pulse", "versao": "Impetus 1.0", "ano": 2023, "km": 9000, "preco": 119900, "cidade": "Porto Real", "uf": "RJ" },
  { "id": "20", "marca": "Fiat", "modelo": "Toro", "versao": "Volcano 2.0", "ano": 2021, "km": 67000, "preco": 149900, "cidade": "Barra do Piraí", "uf": "RJ" },
  { "id": "21", "marca": "Fiat", "modelo": "Mobi", "versao": "Like 1.0", "ano": 2020, "km": 58000, "preco": 49900, "cidade": "Pinheiral", "uf": "RJ" },
  { "id": "22", "marca": "Hyundai", "modelo": "HB20", "versao": "Comfort 1.0", "ano": 2021, "km": 41000, "preco": 69900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "23", "marca": "Hyundai", "modelo": "HB20S", "versao": "Platinum 1.0", "ano": 2023, "km": 14000, "preco": 104900, "cidade": "Resende", "uf": "RJ" },
  { "id": "24", "marca": "Hyundai", "modelo": "Creta", "versao": "Limited 1.0", "ano": 2022, "km": 29000, "preco": 134900, "cidade": "Barra Mansa", "uf": "RJ" },
  { "id": "25", "marca": "Jeep", "modelo": "Renegade", "versao": "Longitude 1.3", "ano": 2021, "km": 51000, "preco": 109900, "cidade": "Volta Redonda", "uf": "RJ" },
  { "id": "26", "marca": "Jeep", "modelo": "Compass", "versao": "Limited 1.3", "ano": 2022, "km": 38000, "preco": 164900, "cidade": "Resende", "uf": "RJ" },
  { "id": "27", "marca": "Jeep", "modelo": "Commander", "versao": "Overland 2.0", "ano": 2023, "km": 21000, "preco": 239900, "cidade": "Itatiaia", "uf": "RJ" },
  { "id": "28", "marca": "Renault", "modelo": "Kwid", "versao": "Zen 1.0", "ano": 2022, "km": 19000, "preco": 54900, "cidade": "Porto Real", "uf": "RJ" },
  { "id": "29", "marca": "Renault", "modelo": "Duster", "versao": "Iconic 1.3", "ano": 2021, "km": 46000, "preco": 104900, "cidade": "Barra do Piraí", "uf": "RJ" },
  { "id": "30", "marca": "Renault", "modelo": "Sandero", "versao": "Stepway 1.6", "ano": 2020, "km": 63000, "preco": 69900, "cidade": "Valença", "uf": "RJ" }
]
```

- [ ] **Step 3: Criar `veiculosService.ts`**

```ts
import type { Veiculo } from '../types'
import dados from './veiculos.json'

// ponytail: JSON local; quando virar API, só este arquivo muda
const veiculos: Veiculo[] = dados

export function listarVeiculos(): Veiculo[] {
  return veiculos
}

export function listarMarcas(): string[] {
  return [...new Set(veiculos.map((v) => v.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
```

- [ ] **Step 4: Typecheck**

Run: `cd mini-app && npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add mini-app/src/features/busca-veiculos/types.ts mini-app/src/features/busca-veiculos/services
git commit -m "feat(mini-app): tipos do contrato e 30 veículos fictícios"
```

### Task 3: `filtrarVeiculos` (TDD)

**Files:**
- Create: `mini-app/src/features/busca-veiculos/utils/filtrarVeiculos.test.ts`
- Create: `mini-app/src/features/busca-veiculos/utils/filtrarVeiculos.ts`

- [ ] **Step 1: Escrever o teste**

```ts
import { describe, expect, it } from 'vitest'
import type { Filtros, Veiculo } from '../types'
import { filtrarVeiculos } from './filtrarVeiculos'

const carro = (parcial: Partial<Veiculo> & Pick<Veiculo, 'id'>): Veiculo => ({
  marca: 'Honda', modelo: 'Civic', versao: 'EXL 2.0', ano: 2020, km: 45000,
  preco: 100000, cidade: 'Volta Redonda', uf: 'RJ', ...parcial,
})

const veiculos: Veiculo[] = [
  carro({ id: 'civic' }),
  carro({ id: 'corolla', marca: 'Toyota', modelo: 'Corolla', versao: 'XEi 2.0', ano: 2021, km: 30000, preco: 128500 }),
  carro({ id: 'c3', marca: 'Citroën', modelo: 'C3', versao: 'Feel 1.6', ano: 2019, km: 80000, preco: 60000 }),
]

const vazio: Filtros = { texto: '', marcas: [] }
const ids = (lista: Veiculo[]) => lista.map((v) => v.id)

describe('filtrarVeiculos', () => {
  it('sem filtros devolve tudo', () => {
    expect(ids(filtrarVeiculos(veiculos, vazio))).toEqual(['civic', 'corolla', 'c3'])
  })

  it('texto ignora caixa e acento e procura em marca, modelo e versão', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: 'CITROEN' }))).toEqual(['c3'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: 'xei' }))).toEqual(['corolla'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, texto: '  honda civic ' }))).toEqual(['civic'])
  })

  it('marcas marcadas combinam com OU', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, marcas: ['Honda', 'Toyota'] }))).toEqual(['civic', 'corolla'])
  })

  it('limites são inclusivos', () => {
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, precoMax: 100000 }))).toEqual(['civic', 'c3'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, anoMin: 2020 }))).toEqual(['civic', 'corolla'])
    expect(ids(filtrarVeiculos(veiculos, { ...vazio, kmMax: 45000 }))).toEqual(['civic', 'corolla'])
  })

  it('filtros diferentes combinam com E', () => {
    const filtros: Filtros = { texto: '2.0', marcas: ['Honda', 'Toyota'], precoMax: 120000 }
    expect(ids(filtrarVeiculos(veiculos, filtros))).toEqual(['civic'])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd mini-app && npx vitest run src/features/busca-veiculos/utils/filtrarVeiculos.test.ts`
Expected: FAIL — `Failed to resolve import "./filtrarVeiculos"` (ou equivalente).

- [ ] **Step 3: Implementar**

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd mini-app && npx vitest run src/features/busca-veiculos/utils/filtrarVeiculos.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add mini-app/src/features/busca-veiculos/utils/filtrarVeiculos.ts mini-app/src/features/busca-veiculos/utils/filtrarVeiculos.test.ts
git commit -m "feat(mini-app): regra de filtro de veículos"
```

### Task 4: `filtros.ts` e `formatar.ts` (TDD)

**Files:**
- Create: `mini-app/src/features/busca-veiculos/utils/filtros.test.ts`, `filtros.ts`
- Create: `mini-app/src/features/busca-veiculos/utils/formatar.test.ts`, `formatar.ts`

- [ ] **Step 1: Escrever `filtros.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { FILTROS_VAZIOS, contarFiltrosAtivos, lerNumero, normalizarFiltros } from './filtros'

const marcas = ['Honda', 'Toyota']

describe('normalizarFiltros', () => {
  it('sem filtros iniciais devolve vazio', () => {
    expect(normalizarFiltros(undefined, marcas)).toEqual(FILTROS_VAZIOS)
  })

  it('descarta marca que não existe nos dados', () => {
    expect(normalizarFiltros({ texto: 'x', marcas: ['Honda', 'Ferrari'] }, marcas).marcas).toEqual(['Honda'])
  })

  it('descarta número negativo ou não finito', () => {
    const r = normalizarFiltros({ texto: '', marcas: [], precoMax: -1, anoMin: Number.NaN, kmMax: 50000 }, marcas)
    expect(r).toEqual({ texto: '', marcas: [], precoMax: undefined, anoMin: undefined, kmMax: 50000 })
  })
})

describe('contarFiltrosAtivos', () => {
  it('marca conta como um filtro; texto não conta', () => {
    expect(contarFiltrosAtivos({ texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 1 })).toBe(2)
    expect(contarFiltrosAtivos(FILTROS_VAZIOS)).toBe(0)
  })
})

describe('lerNumero', () => {
  it('mantém só dígitos; vazio vira undefined', () => {
    expect(lerNumero('120.000')).toBe(120000)
    expect(lerNumero('abc')).toBeUndefined()
    expect(lerNumero('')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Escrever `formatar.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { formatarKm, formatarPreco, formatarResultado, formatarVerCarros } from './formatar'

describe('formatar', () => {
  it('preço em reais sem centavos', () => {
    expect(formatarPreco(112900)).toBe('R$ 112.900')
  })

  it('km com separador de milhar', () => {
    expect(formatarKm(45000)).toBe('45.000 km')
  })

  it('singular e plural', () => {
    expect(formatarResultado(1)).toBe('1 carro encontrado')
    expect(formatarResultado(12)).toBe('12 carros encontrados')
    expect(formatarVerCarros(1)).toBe('Ver 1 carro')
    expect(formatarVerCarros(0)).toBe('Ver 0 carros')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd mini-app && npx vitest run src/features/busca-veiculos/utils`
Expected: FAIL nos dois arquivos novos (módulos inexistentes); `filtrarVeiculos` continua passando.

- [ ] **Step 4: Implementar `filtros.ts`**

```ts
import type { Filtros } from '../types'

export const FILTROS_VAZIOS: Filtros = { texto: '', marcas: [] }

const limite = (n: number | undefined) =>
  n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined

/** Limpa os filtros que chegam do host: marcas inexistentes e números inválidos saem. */
export function normalizarFiltros(filtros: Filtros | undefined, marcasExistentes: string[]): Filtros {
  if (!filtros) return FILTROS_VAZIOS
  return {
    texto: filtros.texto ?? '',
    marcas: filtros.marcas.filter((m) => marcasExistentes.includes(m)),
    precoMax: limite(filtros.precoMax),
    anoMin: limite(filtros.anoMin),
    kmMax: limite(filtros.kmMax),
  }
}

/** Quantos filtros do painel estão ativos (marcas contam como um). */
export function contarFiltrosAtivos(f: Filtros): number {
  return (f.marcas.length > 0 ? 1 : 0) + [f.precoMax, f.anoMin, f.kmMax].filter((v) => v !== undefined).length
}

/** Texto digitado → número; descarta o que não é dígito. Vazio = sem limite. */
export function lerNumero(texto: string): number | undefined {
  const digitos = texto.replace(/\D/g, '')
  return digitos === '' ? undefined : Number(digitos)
}
```

- [ ] **Step 5: Implementar `formatar.ts`**

```ts
const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const inteiro = new Intl.NumberFormat('pt-BR')

export const formatarPreco = (n: number) => moeda.format(n)
export const formatarKm = (n: number) => `${inteiro.format(n)} km`
export const formatarResultado = (n: number) =>
  n === 1 ? '1 carro encontrado' : `${n} carros encontrados`
export const formatarVerCarros = (n: number) => (n === 1 ? 'Ver 1 carro' : `Ver ${n} carros`)
```

- [ ] **Step 6: Rodar tudo e ver passar**

Run: `cd mini-app && npx vitest run && npx tsc --noEmit`
Expected: PASS (3 arquivos) e typecheck sem erros.

- [ ] **Step 7: Commit**

```bash
git add mini-app/src/features/busca-veiculos/utils
git commit -m "feat(mini-app): normalização, contagem e formatação dos filtros"
```

---

## Chunk 2: Interface do mini-app e build web

### Task 5: Componentes e página `BuscaVeiculos`

**Files:**
- Create: `mini-app/src/features/busca-veiculos/components/BarraBusca.tsx`
- Create: `mini-app/src/features/busca-veiculos/components/CardVeiculo.tsx`
- Create: `mini-app/src/features/busca-veiculos/components/PainelFiltros.tsx`
- Create: `mini-app/src/features/busca-veiculos/pages/BuscaVeiculos.tsx`
- Create: `mini-app/src/features/busca-veiculos/index.ts`

Sem teste de componente na v1 (decisão da spec). Verificação visual na Task 6.

- [ ] **Step 1: `BarraBusca.tsx`**

```tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type Props = { valor: string; onChange: (texto: string) => void }

export function BarraBusca({ valor, onChange }: Props) {
  return (
    <View style={estilos.barra}>
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="Buscar marca ou modelo"
        aria-label="Buscar marca ou modelo"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={estilos.input}
      />
      {valor !== '' && (
        <Pressable role="button" aria-label="Limpar busca" onPress={() => onChange('')} style={estilos.limpar}>
          <Text style={estilos.limparTexto}>×</Text>
        </Pressable>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  limpar: { paddingHorizontal: 12, paddingVertical: 8 },
  limparTexto: { fontSize: 20, color: '#71717a' },
})
```

- [ ] **Step 2: `CardVeiculo.tsx`**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Veiculo } from '../types'
import { formatarKm, formatarPreco } from '../utils/formatar'

type Props = { veiculo: Veiculo; onPress: () => void }

export function CardVeiculo({ veiculo, onPress }: Props) {
  return (
    <Pressable
      role="button"
      aria-label={`${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}, ${formatarPreco(veiculo.preco)}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}
    >
      {/* ponytail: sem fotos na v1 — caixa com a inicial da marca */}
      <View style={estilos.foto}>
        <Text style={estilos.inicial}>{veiculo.marca[0]}</Text>
      </View>
      <View style={estilos.info}>
        <Text style={estilos.nome}>
          {veiculo.marca} {veiculo.modelo} <Text style={estilos.versao}>{veiculo.versao}</Text>
        </Text>
        <Text style={estilos.detalhe}>
          {veiculo.ano} · {formatarKm(veiculo.km)}
        </Text>
        <Text style={estilos.preco}>{formatarPreco(veiculo.preco)}</Text>
        <Text style={estilos.detalhe}>
          {veiculo.cidade} - {veiculo.uf}
        </Text>
      </View>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  pressionado: { opacity: 0.7 },
  foto: {
    width: 96,
    height: 72,
    borderRadius: 6,
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { fontSize: 28, fontWeight: '700', color: '#71717a' },
  info: { flex: 1, gap: 2 },
  nome: { fontSize: 16, fontWeight: '600', color: '#18181b' },
  versao: { fontWeight: '400', color: '#52525b' },
  detalhe: { fontSize: 13, color: '#71717a' },
  preco: { fontSize: 17, fontWeight: '700', color: '#18181b' },
})
```

- [ ] **Step 3: `PainelFiltros.tsx`**

```tsx
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Filtros } from '../types'
import { FILTROS_VAZIOS, lerNumero } from '../utils/filtros'

type Props = { marcas: string[]; filtros: Filtros; onChange: (filtros: Filtros) => void }

export function PainelFiltros({ marcas, filtros, onChange }: Props) {
  const alternarMarca = (marca: string) =>
    onChange({
      ...filtros,
      marcas: filtros.marcas.includes(marca)
        ? filtros.marcas.filter((m) => m !== marca)
        : [...filtros.marcas, marca],
    })

  return (
    <View style={estilos.painel}>
      <Text style={estilos.titulo}>Marca</Text>
      {marcas.map((marca) => {
        const marcada = filtros.marcas.includes(marca)
        return (
          <Pressable
            key={marca}
            role="checkbox"
            aria-checked={marcada}
            onPress={() => alternarMarca(marca)}
            style={estilos.opcao}
          >
            <View style={[estilos.caixa, marcada && estilos.caixaMarcada]}>
              {marcada && <Text style={estilos.check}>✓</Text>}
            </View>
            <Text style={estilos.opcaoTexto}>{marca}</Text>
          </Pressable>
        )
      })}

      <CampoNumero rotulo="Preço até (R$)" valor={filtros.precoMax} onChange={(precoMax) => onChange({ ...filtros, precoMax })} />
      <CampoNumero rotulo="Ano a partir de" valor={filtros.anoMin} onChange={(anoMin) => onChange({ ...filtros, anoMin })} />
      <CampoNumero rotulo="Km até" valor={filtros.kmMax} onChange={(kmMax) => onChange({ ...filtros, kmMax })} />

      {/* Limpa o painel e preserva o texto da barra de busca */}
      <Pressable role="button" onPress={() => onChange({ ...FILTROS_VAZIOS, texto: filtros.texto })}>
        <Text style={estilos.link}>Limpar filtros</Text>
      </Pressable>
    </View>
  )
}

type CampoNumeroProps = { rotulo: string; valor?: number; onChange: (valor: number | undefined) => void }

function CampoNumero({ rotulo, valor, onChange }: CampoNumeroProps) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.titulo}>{rotulo}</Text>
      <TextInput
        value={valor === undefined ? '' : String(valor)}
        onChangeText={(texto) => onChange(lerNumero(texto))}
        keyboardType="numeric"
        inputMode="numeric"
        aria-label={rotulo}
        style={estilos.input}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  painel: { gap: 6 },
  titulo: { fontSize: 13, fontWeight: '600', color: '#3f3f46', marginTop: 8 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  caixa: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#a1a1aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  check: { color: '#fff', fontSize: 13, fontWeight: '700' },
  opcaoTexto: { fontSize: 15, color: '#18181b' },
  campo: { gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  link: { color: '#7c3aed', fontWeight: '600', marginTop: 12 },
})
```

- [ ] **Step 4: `pages/BuscaVeiculos.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { BarraBusca } from '../components/BarraBusca'
import { CardVeiculo } from '../components/CardVeiculo'
import { PainelFiltros } from '../components/PainelFiltros'
import { listarMarcas, listarVeiculos } from '../services/veiculosService'
import type { BuscaVeiculosProps, Filtros } from '../types'
import { filtrarVeiculos } from '../utils/filtrarVeiculos'
import { FILTROS_VAZIOS, contarFiltrosAtivos, normalizarFiltros } from '../utils/filtros'
import { formatarResultado, formatarVerCarros } from '../utils/formatar'

const LARGURA_PAINEL_LATERAL = 768
const veiculos = listarVeiculos()
const marcas = listarMarcas()

export default function BuscaVeiculos({ filtrosIniciais, onFiltrosMudaram, onSelecionarVeiculo }: BuscaVeiculosProps) {
  // filtrosIniciais é lido só na montagem; depois o estado é do mini-app
  const [filtros, setFiltros] = useState(() => normalizarFiltros(filtrosIniciais, marcas))
  const [modalAberto, setModalAberto] = useState(false)
  const { width } = useWindowDimensions()
  const largo = width >= LARGURA_PAINEL_LATERAL
  const resultado = useMemo(() => filtrarVeiculos(veiculos, filtros), [filtros])
  const ativos = contarFiltrosAtivos(filtros)

  // Avisa o host aqui, no handler — nunca num useEffect (loop com setSearchParams do host)
  function atualizar(novos: Filtros) {
    setFiltros(novos)
    onFiltrosMudaram?.(novos)
  }

  const painel = <PainelFiltros marcas={marcas} filtros={filtros} onChange={atualizar} />

  return (
    <View style={estilos.raiz}>
      {largo && <View style={estilos.lateral}>{painel}</View>}

      <View style={estilos.conteudo}>
        <BarraBusca valor={filtros.texto} onChange={(texto) => atualizar({ ...filtros, texto })} />

        {!largo && (
          <Pressable role="button" style={estilos.botaoFiltros} onPress={() => setModalAberto(true)}>
            <Text style={estilos.botaoFiltrosTexto}>{ativos > 0 ? `Filtros (${ativos})` : 'Filtros'}</Text>
          </Pressable>
        )}

        <Text style={estilos.contador}>{formatarResultado(resultado.length)}</Text>

        <FlatList
          data={resultado}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => <CardVeiculo veiculo={item} onPress={() => onSelecionarVeiculo(item)} />}
          ListEmptyComponent={
            <View style={estilos.vazio}>
              <Text style={estilos.vazioTexto}>Nenhum carro com esses filtros</Text>
              <Pressable role="button" style={estilos.botaoPrimario} onPress={() => atualizar(FILTROS_VAZIOS)}>
                <Text style={estilos.botaoPrimarioTexto}>Limpar busca e filtros</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={estilos.lista}
        />
      </View>

      <Modal
        visible={!largo && modalAberto}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={estilos.modal}>
          {painel}
          <Pressable role="button" style={estilos.botaoPrimario} onPress={() => setModalAberto(false)}>
            <Text style={estilos.botaoPrimarioTexto}>{formatarVerCarros(resultado.length)}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    backgroundColor: '#f4f4f5',
  },
  lateral: { width: 240, padding: 16, borderRightWidth: 1, borderRightColor: '#e4e4e7' },
  conteudo: { flex: 1, padding: 16, gap: 10 },
  botaoFiltros: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  botaoFiltrosTexto: { color: '#7c3aed', fontWeight: '600' },
  contador: { fontSize: 13, color: '#52525b' },
  lista: { paddingBottom: 24 },
  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  vazioTexto: { fontSize: 15, color: '#52525b' },
  modal: { flex: 1, padding: 20, gap: 16, backgroundColor: '#f4f4f5' },
  botaoPrimario: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
  },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
```

- [ ] **Step 5: Barrel `index.ts`** (é o módulo que o Module Federation expõe)

```ts
export { default } from './pages/BuscaVeiculos'
export type { BuscaVeiculosProps, Filtros, Veiculo } from './types'
```

- [ ] **Step 6: Typecheck e testes**

Run: `cd mini-app && npx tsc --noEmit && npx vitest run`
Expected: sem erros; testes passando.

- [ ] **Step 7: Commit**

```bash
git add mini-app/src/features/busca-veiculos/components mini-app/src/features/busca-veiculos/pages mini-app/src/features/busca-veiculos/index.ts
git commit -m "feat(mini-app): tela de busca com painel de filtros responsivo"
```

### Task 6: Build web do mini-app (remote + página standalone)

**Files:**
- Create: `mini-app/src/index.tsx`, `mini-app/src/bootstrap.tsx`, `mini-app/src/app/App.tsx`
- Create: `mini-app/rspack.web.config.mjs`

- [ ] **Step 1: Fronteira assíncrona — `src/index.tsx`**

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

- [ ] **Step 3: `src/app/App.tsx`** (o mini-app sozinho, sem host)

```tsx
import { StyleSheet, Text, View } from 'react-native'
import BuscaVeiculos from '@/features/busca-veiculos'

export function App() {
  return (
    <View style={estilos.raiz}>
      <Text style={estilos.aviso}>mini-app busca · modo standalone (sem host)</Text>
      <BuscaVeiculos
        onFiltrosMudaram={(filtros) => console.log('[busca] filtros', filtros)}
        onSelecionarVeiculo={(veiculo) => console.log('[busca] selecionado', veiculo)}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
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
import pkg from './package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const versaoReact = pkg.dependencies.react

const HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>busca · standalone</title>
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
    uniqueName: 'busca',
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
      name: 'busca',
      filename: 'remoteEntry.js',
      exposes: { './BuscaVeiculos': './src/features/busca-veiculos/index.ts' },
      dts: false,
      shared: {
        react: { singleton: true, requiredVersion: versaoReact },
        'react-dom': { singleton: true, requiredVersion: versaoReact },
      },
    }),
  ],
  devServer: {
    port: 3001,
    historyApiFallback: true,
    // o host da 3000 baixa o mf-manifest.json com fetch
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})
```

- [ ] **Step 5: Subir o dev server em background**

Run: `cd mini-app && nohup npm run dev:web > /tmp/estudo-mf-mini-web.log 2>&1 &`
Esperar: `until node -e "fetch('http://localhost:3001/mf-manifest.json').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do sleep 2; done` (timeout 120s).
Conferir: `node -e "fetch('http://localhost:3001/mf-manifest.json').then(r=>{console.log(r.headers.get('access-control-allow-origin'));return r.json()}).then(m=>console.log(m.name, m.exposes.map(e=>e.name)))"`
Expected: `*` e depois `busca [ 'BuscaVeiculos' ]`. Um aviso do plugin de manifesto sobre `publicPath='auto'` no log é normal.

- [ ] **Step 6: Verificar a página standalone no navegador**

Abrir `http://localhost:3001` (Chrome via ferramentas `mcp__claude-in-chrome__*`, carregando-as primeiro com ToolSearch). Conferir:
- Janela larga (≥ 768px): painel de filtros à esquerda, "30 carros encontrados", cards.
- Digitar "civic" → "1 carro encontrado". Marcar Toyota e limpar o texto → só Toyota.
- Janela estreita (`resize_window` para ~400px): botão "Filtros (1)"; abre o modal com o mesmo painel e o botão "Ver N carros".
- Console: `[busca] filtros` a cada mudança; sem erro de "Invalid hook call" nem "Shared module".
Tirar um screenshot de cada layout.

- [ ] **Step 7: Typecheck, parar o dev server e commitar**

Run: `cd mini-app && npx tsc --noEmit && lsof -ti tcp:3001 | xargs kill`

```bash
git add mini-app/src/index.tsx mini-app/src/bootstrap.tsx mini-app/src/app mini-app/rspack.web.config.mjs
git commit -m "feat(mini-app): build web via Module Federation com página standalone"
```

---

## Chunk 3: Host web (`host-react`)

### Task 7: Esqueleto do host-react e `filtrosUrl` (TDD)

**Files:**
- Create: `host-react/package.json`, `host-react/tsconfig.json`
- Create: `host-react/src/features/busca/utils/filtrosUrl.test.ts`, `filtrosUrl.ts`

- [ ] **Step 1: `host-react/package.json`**

```json
{
  "name": "host-react",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "rspack serve",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-router": "^7.18.4"
  },
  "devDependencies": {
    "@module-federation/enhanced": "2.9.2",
    "@rspack/cli": "1.6.0",
    "@rspack/core": "1.6.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "~5.9.0",
    "vitest": "^4.1.0"
  }
}
```

- [ ] **Step 2: `host-react/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "@/*": ["./src/*"],
      "@busca/tipos": ["../mini-app/src/features/busca-veiculos/types"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Instalar**

Run: `cd host-react && npm install && npm ls react react-dom --depth=0`
Expected: `react@19.2.3`, `react-dom@19.2.3`.

- [ ] **Step 4: Escrever `filtrosUrl.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { Filtros } from '@busca/tipos'
import { gravarFiltros, lerFiltros } from './filtrosUrl'

describe('filtrosUrl', () => {
  it('ida e volta preserva os filtros', () => {
    const filtros: Filtros = { texto: 'civic', marcas: ['Honda', 'Toyota'], precoMax: 120000, anoMin: 2019, kmMax: 80000 }
    expect(lerFiltros(gravarFiltros(filtros))).toEqual(filtros)
  })

  it('omite o que está vazio', () => {
    expect(gravarFiltros({ texto: '', marcas: [] }).toString()).toBe('')
    expect(gravarFiltros({ texto: 'gol', marcas: [], kmMax: 50000 }).toString()).toBe('q=gol&kmMax=50000')
  })

  it('URL vazia vira filtros vazios', () => {
    expect(lerFiltros(new URLSearchParams())).toEqual({ texto: '', marcas: [] })
  })

  it('ignora número inválido ou negativo', () => {
    const f = lerFiltros(new URLSearchParams('precoMax=abc&anoMin=-1&kmMax=50000'))
    expect(f.precoMax).toBeUndefined()
    expect(f.anoMin).toBeUndefined()
    expect(f.kmMax).toBe(50000)
  })
})
```

- [ ] **Step 5: Rodar e ver falhar**

Run: `cd host-react && npx vitest run`
Expected: FAIL — módulo `./filtrosUrl` inexistente.

- [ ] **Step 6: Implementar `filtrosUrl.ts`**

```ts
import type { Filtros } from '@busca/tipos'

const numero = (valor: string | null) => {
  if (valor === null || valor.trim() === '') return undefined
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

/** URL → Filtros. Valor inválido é ignorado (vira "sem limite"). */
export function lerFiltros(params: URLSearchParams): Filtros {
  return {
    texto: params.get('q') ?? '',
    marcas: (params.get('marcas') ?? '').split(',').map((m) => m.trim()).filter(Boolean),
    precoMax: numero(params.get('precoMax')),
    anoMin: numero(params.get('anoMin')),
    kmMax: numero(params.get('kmMax')),
  }
}

/** Filtros → URL, omitindo o que está vazio. */
export function gravarFiltros(filtros: Filtros): URLSearchParams {
  const params = new URLSearchParams()
  if (filtros.texto) params.set('q', filtros.texto)
  if (filtros.marcas.length > 0) params.set('marcas', filtros.marcas.join(','))
  if (filtros.precoMax !== undefined) params.set('precoMax', String(filtros.precoMax))
  if (filtros.anoMin !== undefined) params.set('anoMin', String(filtros.anoMin))
  if (filtros.kmMax !== undefined) params.set('kmMax', String(filtros.kmMax))
  return params
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `cd host-react && npx vitest run`
Expected: PASS (4 testes).

- [ ] **Step 8: Commit**

```bash
git add host-react/package.json host-react/package-lock.json host-react/tsconfig.json host-react/src/features/busca/utils
git commit -m "feat(host-react): filtros da busca na URL"
```

### Task 8: App, rotas, fronteira e páginas do host-react

**Files:**
- Create: `host-react/rspack.config.mjs`
- Create: `host-react/src/index.tsx`, `bootstrap.tsx`, `remotes.d.ts`
- Create: `host-react/src/app/App.tsx`, `app/routes/router.tsx`
- Create: `host-react/src/app/layout/Layout.tsx`, `Fronteira.tsx`, `RemoteBusca.tsx`
- Create: `host-react/src/features/busca/pages/PaginaBusca.tsx`
- Create: `host-react/src/features/veiculo/pages/PaginaVeiculo.tsx`

Estilo: objetos de estilo inline (simétrico ao `StyleSheet` do RN e dispensa configurar CSS no Rspack).

- [ ] **Step 1: `rspack.config.mjs`**

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@rspack/cli'
import { rspack } from '@rspack/core'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import pkg from './package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const versaoReact = pkg.dependencies.react

const HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Garagem</title>
    <style>html, body, #root { height: 100%; margin: 0; font-family: system-ui, sans-serif } #root { display: flex; flex-direction: column }</style>
  </head>
  <body><div id="root"></div></body>
</html>`

export default defineConfig({
  context: __dirname,
  entry: './src/index.tsx',
  output: { publicPath: '/', uniqueName: 'hostReact' },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: { '@': path.resolve(__dirname, 'src') },
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
    new rspack.HtmlRspackPlugin({ templateContent: HTML }),
    new ModuleFederationPlugin({
      name: 'hostReact',
      remotes: { busca: 'busca@http://localhost:3001/mf-manifest.json' },
      dts: false,
      // o padrão (version-first) busca o manifesto de todo remote na inicialização:
      // com o remote fora do ar, a página nem renderiza e o ErrorBoundary nunca aparece
      shareStrategy: 'loaded-first',
      shared: {
        react: { singleton: true, requiredVersion: versaoReact },
        'react-dom': { singleton: true, requiredVersion: versaoReact },
      },
    }),
  ],
  devServer: { port: 3000, historyApiFallback: true },
})
```

- [ ] **Step 2: `src/index.tsx` e `src/bootstrap.tsx`**

```tsx
// src/index.tsx — fronteira assíncrona (o runtime do MF negocia o React antes do primeiro import)
import('./bootstrap')
```

```tsx
// src/bootstrap.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: `src/remotes.d.ts`** (os `import type` ficam **dentro** do `declare module`; no topo do arquivo viram augmentation e dão TS2664)

```ts
declare module 'busca/BuscaVeiculos' {
  import type { ComponentType } from 'react'
  import type { BuscaVeiculosProps } from '@busca/tipos'

  const BuscaVeiculos: ComponentType<BuscaVeiculosProps>
  export default BuscaVeiculos
}
```

- [ ] **Step 4: `app/App.tsx` e `app/routes/router.tsx`**

```tsx
// app/App.tsx
import { RouterProvider } from 'react-router'
import { router } from './routes/router'

export function App() {
  return <RouterProvider router={router} />
}
```

```tsx
// app/routes/router.tsx
import { Navigate, createBrowserRouter } from 'react-router'
import { PaginaBusca } from '@/features/busca/pages/PaginaBusca'
import { PaginaVeiculo } from '@/features/veiculo/pages/PaginaVeiculo'
import { Layout } from '../layout/Layout'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/busca" replace /> },
      { path: '/busca', element: <PaginaBusca /> },
      { path: '/veiculo/:id', element: <PaginaVeiculo /> },
    ],
  },
])
```

- [ ] **Step 5: `app/layout/Layout.tsx`**

```tsx
import type { CSSProperties } from 'react'
import { Outlet } from 'react-router'

export function Layout() {
  return (
    <div style={estilos.raiz}>
      <header style={estilos.cabecalho}>
        <strong style={estilos.marca}>Garagem</strong>
        <span style={estilos.etiqueta}>host web</span>
      </header>
      <main style={estilos.main}>
        <Outlet />
      </main>
    </div>
  )
}

const estilos = {
  raiz: { display: 'flex', flexDirection: 'column', height: '100%' },
  cabecalho: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#18181b', color: '#fff' },
  marca: { fontSize: 20 },
  etiqueta: { fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#3f3f46' },
  main: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 6: `app/layout/Fronteira.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react'

/** Só visual: mostra no estudo onde termina o host e começa o remote. */
export function Fronteira({ children }: { children: ReactNode }) {
  return (
    <div style={estilos.borda}>
      <span style={estilos.etiqueta}>remote: busca</span>
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

- [ ] **Step 7: `app/layout/RemoteBusca.tsx`**

```tsx
import { Component, Suspense, lazy, type CSSProperties, type ReactNode } from 'react'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from './Fronteira'

// No escopo do módulo: voltar do detalhe não pisca "Carregando busca…"
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div style={estilos.centro}>
        <p>Busca indisponível</p>
        {/* ponytail: o runtime do MF guarda a falha do módulo; recarregar é o único retry que funciona */}
        <button type="button" onClick={() => window.location.reload()}>
          Tentar de novo
        </button>
      </div>
    )
  }
}

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira>
      <LimiteDeErro>
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

- [ ] **Step 8: `features/busca/pages/PaginaBusca.tsx`**

```tsx
import { useNavigate, useSearchParams } from 'react-router'
import { RemoteBusca } from '@/app/layout/RemoteBusca'
import { gravarFiltros, lerFiltros } from '../utils/filtrosUrl'

export function PaginaBusca() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  return (
    <RemoteBusca
      // o mini-app só lê isto na montagem; depois ele é dono do estado
      filtrosIniciais={lerFiltros(params)}
      onFiltrosMudaram={(filtros) => setParams(gravarFiltros(filtros), { replace: true })}
      onSelecionarVeiculo={(veiculo) => navigate(`/veiculo/${veiculo.id}`, { state: { veiculo } })}
    />
  )
}
```

- [ ] **Step 9: `features/veiculo/pages/PaginaVeiculo.tsx`**

```tsx
import type { CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Veiculo } from '@busca/tipos'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const inteiro = new Intl.NumberFormat('pt-BR')

export function PaginaVeiculo() {
  const navigate = useNavigate()
  const veiculo = (useLocation().state as { veiculo?: Veiculo } | null)?.veiculo

  // Sem state = URL aberta numa aba nova (F5 na mesma aba mantém o state)
  if (!veiculo) {
    return (
      <div style={estilos.pagina}>
        <h1>Anúncio não encontrado</h1>
        <Link to="/busca">Ir para a busca</Link>
      </div>
    )
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.foto}>{veiculo.marca[0]}</div>
      <h1 style={estilos.nome}>
        {veiculo.marca} {veiculo.modelo} <small style={estilos.versao}>{veiculo.versao}</small>
      </h1>
      <p style={estilos.preco}>{preco.format(veiculo.preco)}</p>
      <p>
        {veiculo.ano} · {inteiro.format(veiculo.km)} km · {veiculo.cidade} - {veiculo.uf}
      </p>
      <button type="button" onClick={() => navigate(-1)}>
        Voltar para a busca
      </button>
    </div>
  )
}

const estilos = {
  pagina: { maxWidth: 720, width: '100%', margin: '0 auto', padding: 24, boxSizing: 'border-box' },
  foto: {
    height: 240,
    borderRadius: 8,
    background: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 64,
    fontWeight: 700,
    color: '#71717a',
  },
  nome: { marginBottom: 0 },
  versao: { fontWeight: 400, color: '#52525b' },
  preco: { fontSize: 28, fontWeight: 700, margin: '8px 0' },
} satisfies Record<string, CSSProperties>
```

- [ ] **Step 10: Typecheck, testes e build**

Run: `cd host-react && npx tsc --noEmit && npx vitest run && npx rspack build`
Expected: sem erros; 4 testes passando; build ok (funciona com o remote fora do ar, porque remote por manifesto é resolvido em tempo de execução). Apagar o `dist/` gerado (está no `.gitignore`).

- [ ] **Step 11: Commit**

```bash
git add host-react/rspack.config.mjs host-react/src
git commit -m "feat(host-react): host web carregando a busca via Module Federation"
```

### Task 9: Verificação do fluxo web

- [ ] **Step 1: Subir os dois servidores em background**

```bash
cd mini-app && nohup npm run dev:web > /tmp/estudo-mf-mini-web.log 2>&1 &
cd host-react && nohup npm run dev > /tmp/estudo-mf-host-react.log 2>&1 &
until node -e "fetch('http://localhost:3001/mf-manifest.json').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do sleep 2; done
until node -e "fetch('http://localhost:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do sleep 2; done
```

- [ ] **Step 2: Roteiro no Chrome** (`mcp__claude-in-chrome__*`; screenshot de cada passo relevante)

1. `http://localhost:3000` → redireciona para `/busca`; cabeçalho "Garagem · host web"; borda tracejada "remote: busca"; 30 carros.
2. Digitar "civic" → URL vira `/busca?q=civic`, "1 carro encontrado".
3. Limpar o texto, marcar Honda e Toyota, "Preço até" 120000 → URL com `marcas=Honda%2CToyota&precoMax=120000` (o `URLSearchParams` codifica a vírgula; `lerFiltros` lê as duas formas).
4. Clicar num carro → `/veiculo/<id>` com os dados do carro.
5. "Voltar para a busca" → mesma URL e os mesmos filtros marcados na tela.
6. Janela estreita (~400px) → botão "Filtros (2)" e modal.
7. Abrir `http://localhost:3000/veiculo/1` numa aba nova → "Anúncio não encontrado".
8. Copiar a URL da busca com filtros, abrir numa aba nova → mesmos filtros.
9. **Console até aqui** (passos 1–8): sem "Invalid hook call", sem erro de CORS, sem aviso de versão de shared.
10. Remote fora do ar: `lsof -ti tcp:3001 | xargs kill`, recarregar `/busca` → "Busca indisponível" (agora o console tem, corretamente, `ERR_CONNECTION_REFUSED` no manifesto e o erro capturado pelo boundary). Subir de novo (`cd mini-app && nohup npm run dev:web > /tmp/estudo-mf-mini-web.log 2>&1 &`), esperar a 3001 responder e clicar "Tentar de novo" → a busca volta.

- [ ] **Step 3: Se algo falhar**, corrigir com @superpowers:systematic-debugging, commitar a correção com mensagem `fix(...)` e repetir o roteiro. Ao final, parar os servidores: `lsof -ti tcp:3000,3001 | xargs kill`.

---

## Chunk 4: Nativo (`host-rn` + build nativo do mini-app)

### Task 10: Build nativo do mini-app (Re.Pack)

**Files:**
- Create: `mini-app/babel.config.js`, `mini-app/react-native.config.js`, `mini-app/index.native.js`, `mini-app/rspack.native.config.mjs`

- [ ] **Step 1: `babel.config.js`** (o `babel-swc-loader` do Re.Pack usa o preset do RN)

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
}
```

- [ ] **Step 2: `react-native.config.js`** (troca os comandos do Metro pelos do Re.Pack)

```js
module.exports = {
  commands: require('@callstack/repack/commands/rspack'),
}
```

- [ ] **Step 3: `index.native.js`**

```js
// O remote nativo só expõe módulos via Module Federation; o Re.Pack exige um entry.
```

- [ ] **Step 4: `rspack.native.config.mjs`**

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
    output: { path: '[context]/build/native/[platform]', uniqueName: 'busca' },
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
        name: 'busca',
        filename: 'busca.container.js.bundle',
        exposes: { './BuscaVeiculos': './src/features/busca-veiculos/index.ts' },
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

- [ ] **Step 5: Subir em background e conferir o manifesto**

Run (background): `cd mini-app && npm run dev:native > /tmp/estudo-mf-mini-native.log 2>&1`
Esperar e conferir: `node -e "fetch('http://localhost:9000/ios/mf-manifest.json').then(r=>r.text()).then(console.log)"`
Expected: manifesto com `"name":"busca"` e o expose `BuscaVeiculos`. Se o comando `start` conflitar com o do RN (erro no log), trocar o script para `react-native webpack-start --config rspack.native.config.mjs --port 9000` e registrar o porquê no commit.

- [ ] **Step 6: Parar o servidor e commitar**

```bash
git add mini-app/babel.config.js mini-app/react-native.config.js mini-app/index.native.js mini-app/rspack.native.config.mjs mini-app/package.json
git commit -m "feat(mini-app): build nativo via Re.Pack"
```

### Task 11: Criar o host-rn com Re.Pack

**Files:**
- Create (gerado): `host-rn/` (template RN 0.86.3)
- Create: `host-rn/.ruby-version`, `host-rn/react-native.config.js`, `host-rn/rspack.config.mjs`
- Delete: `host-rn/metro.config.js`, `host-rn/App.tsx`, `host-rn/__tests__/`
- Modify: `host-rn/index.js`, `host-rn/tsconfig.json`, `host-rn/package.json`

- [ ] **Step 1: Gerar o projeto**

Run: `npx --yes @react-native-community/cli@20.2.0 init HostRn --version 0.86.3 --directory host-rn --skip-git-init --skip-install --install-pods false`
Expected: pasta `host-rn/` com `ios/`, `android/`, `package.json` (react 19.2.3, react-native 0.86.3).

- [ ] **Step 2: Dependências**

```bash
cd host-rn
npm install
npm install @react-navigation/native@^7 @react-navigation/native-stack@^7 react-native-screens@4.26.2 react-native-safe-area-context@5.8.0
npm install -D @callstack/repack@5.4.2 @rspack/core@1.6.0 @swc/helpers@~0.5.17 @module-federation/enhanced@2.9.2
npm ls react react-native --depth=0
```
Expected: `react@19.2.3`, `react-native@0.86.3`, sem `invalid`/`ERESOLVE`.

- [ ] **Step 3: Trocar Metro por Re.Pack**

Apagar `metro.config.js`. Criar `react-native.config.js`:

```js
module.exports = {
  commands: require('@callstack/repack/commands/rspack'),
}
```

Criar `rspack.config.mjs`:

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Repack from '@callstack/repack'
import { rspack } from '@rspack/core'
import reactPkg from 'react/package.json' with { type: 'json' }
import reactNativePkg from 'react-native/package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default Repack.defineRspackConfig((env) => {
  const { mode, platform } = env
  const resolveBase = Repack.getResolveOptions({ enablePackageExports: true })

  return {
    mode,
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...resolveBase,
      alias: { ...resolveBase.alias, '@': path.resolve(__dirname, 'src') },
    },
    output: { uniqueName: 'hostRn' },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          use: { loader: '@callstack/repack/babel-swc-loader', parallel: true, options: {} },
          type: 'javascript/auto',
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'hostRn',
        remotes: { busca: `busca@http://localhost:9000/${platform}/mf-manifest.json` },
        dts: false,
        // version-first buscaria o manifesto na inicialização e derrubaria o app com o remote fora
        shareStrategy: 'loaded-first',
        shared: {
          react: { singleton: true, eager: true, version: reactPkg.version, requiredVersion: reactPkg.version },
          'react-native': {
            singleton: true,
            eager: true,
            version: reactNativePkg.version,
            requiredVersion: reactNativePkg.version,
          },
        },
      }),
      // dependência opcional do @react-navigation/elements que não usamos
      new rspack.IgnorePlugin({ resourceRegExp: /^@react-native-masked-view/ }),
    ],
  }
})
```

- [ ] **Step 4: Ruby e pods**

Criar `host-rn/.ruby-version` com `3.3.8`. Depois:

```bash
cd host-rn && bundle install && cd ios && bundle exec pod install
```
Expected: `Pod installation complete!`. (Leva alguns minutos.)

- [ ] **Step 5: tsconfig** — substituir `host-rn/tsconfig.json` por:

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "paths": {
      "@/*": ["./src/*"],
      "@busca/tipos": ["../mini-app/src/features/busca-veiculos/types"]
    }
  },
  "include": ["src", "index.js"],
  "exclude": ["node_modules", "ios", "android"]
}
```

- [ ] **Step 6: Commit do esqueleto** (antes do código do app, para o diff ficar legível)

```bash
cd /Users/romeroalmeida/Romero/estudos/estudo-mf
git add host-rn
git status --short host-rn | head -50   # conferir: nada de Pods/, build/, node_modules/
git commit -m "chore(host-rn): projeto RN 0.86.3 com Re.Pack no lugar do Metro"
```

### Task 12: Telas, navegação e fronteira do host-rn

**Files:**
- Create: `host-rn/src/remotes.d.ts`
- Create: `host-rn/src/app/App.tsx`, `src/app/routes/Navegacao.tsx`
- Create: `host-rn/src/app/layout/Fronteira.tsx`, `src/app/layout/RemoteBusca.tsx`
- Create: `host-rn/src/features/busca/screens/TelaBusca.tsx`
- Create: `host-rn/src/features/veiculo/screens/TelaVeiculo.tsx`
- Modify: `host-rn/index.js`

- [ ] **Step 1: `src/remotes.d.ts`** — mesmo conteúdo do host-react:

```ts
declare module 'busca/BuscaVeiculos' {
  import type { ComponentType } from 'react'
  import type { BuscaVeiculosProps } from '@busca/tipos'

  const BuscaVeiculos: ComponentType<BuscaVeiculosProps>
  export default BuscaVeiculos
}
```

- [ ] **Step 2: `src/app/routes/Navegacao.tsx`**

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { Veiculo } from '@busca/tipos'
import { TelaBusca } from '@/features/busca/screens/TelaBusca'
import { TelaVeiculo } from '@/features/veiculo/screens/TelaVeiculo'

export type Rotas = {
  Busca: undefined
  Veiculo: { veiculo: Veiculo }
}

const Stack = createNativeStackNavigator<Rotas>()

export function Navegacao() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Busca" component={TelaBusca} options={{ title: 'Garagem · host app' }} />
      <Stack.Screen name="Veiculo" component={TelaVeiculo} options={{ title: 'Detalhe' }} />
    </Stack.Navigator>
  )
}
```

- [ ] **Step 3: `src/app/App.tsx` e `index.js`**

```tsx
// src/app/App.tsx
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Navegacao } from './routes/Navegacao'

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Navegacao />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
```

Em `index.js`, trocar `import App from './App';` por `import App from './src/app/App';`. Apagar `App.tsx` da raiz e a pasta `__tests__/`.

- [ ] **Step 4: `src/app/layout/Fronteira.tsx`**

```tsx
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

/** Só visual: mostra no estudo onde termina o host e começa o remote. */
export function Fronteira({ children }: { children: ReactNode }) {
  return (
    <View style={estilos.borda}>
      <Text style={estilos.etiqueta}>remote: busca</Text>
      {children}
    </View>
  )
}

const estilos = StyleSheet.create({
  borda: { flex: 1, margin: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: '#7c3aed', borderRadius: 8 },
  etiqueta: { alignSelf: 'flex-start', margin: 6, fontSize: 12, fontWeight: '600', color: '#7c3aed' },
})
```

- [ ] **Step 5: `src/app/layout/RemoteBusca.tsx`**

```tsx
import { Component, Suspense, lazy, type ReactNode } from 'react'
import { DevSettings, Pressable, StyleSheet, Text, View } from 'react-native'
import type { BuscaVeiculosProps } from '@busca/tipos'
import { Fronteira } from './Fronteira'

// No escopo do módulo: só baixa o remote uma vez
const BuscaVeiculos = lazy(() => import('busca/BuscaVeiculos'))

class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>Busca indisponível</Text>
        {/* ponytail: o runtime do MF guarda a falha; recarregar o app (só em dev) é o único retry que funciona */}
        <Pressable role="button" style={estilos.botao} onPress={() => DevSettings.reload()}>
          <Text style={estilos.botaoTexto}>Tentar de novo</Text>
        </Pressable>
      </View>
    )
  }
}

export function RemoteBusca(props: BuscaVeiculosProps) {
  return (
    <Fronteira>
      <LimiteDeErro>
        <Suspense fallback={<Text style={estilos.carregando}>Carregando busca…</Text>}>
          <BuscaVeiculos {...props} />
        </Suspense>
      </LimiteDeErro>
    </Fronteira>
  )
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titulo: { fontSize: 16, fontWeight: '600' },
  botao: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
  carregando: { padding: 32, textAlign: 'center' },
})
```

- [ ] **Step 6: `src/features/busca/screens/TelaBusca.tsx`**

```tsx
import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { Filtros } from '@busca/tipos'
import { RemoteBusca } from '@/app/layout/RemoteBusca'
import type { Rotas } from '@/app/routes/Navegacao'

export function TelaBusca({ navigation }: NativeStackScreenProps<Rotas, 'Busca'>) {
  // A pilha mantém esta tela montada; o useState só importa se o mini-app remontar
  const [filtros, setFiltros] = useState<Filtros>()

  return (
    <RemoteBusca
      filtrosIniciais={filtros}
      onFiltrosMudaram={setFiltros}
      onSelecionarVeiculo={(veiculo) => navigation.navigate('Veiculo', { veiculo })}
    />
  )
}
```

- [ ] **Step 7: `src/features/veiculo/screens/TelaVeiculo.tsx`**

```tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Rotas } from '@/app/routes/Navegacao'

const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const inteiro = new Intl.NumberFormat('pt-BR')

export function TelaVeiculo({ route, navigation }: NativeStackScreenProps<Rotas, 'Veiculo'>) {
  const { veiculo } = route.params

  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <View style={estilos.foto}>
        <Text style={estilos.inicial}>{veiculo.marca[0]}</Text>
      </View>
      <Text style={estilos.nome}>
        {veiculo.marca} {veiculo.modelo}
      </Text>
      <Text style={estilos.versao}>{veiculo.versao}</Text>
      <Text style={estilos.preco}>{preco.format(veiculo.preco)}</Text>
      <Text style={estilos.detalhe}>
        {veiculo.ano} · {inteiro.format(veiculo.km)} km · {veiculo.cidade} - {veiculo.uf}
      </Text>
      <Pressable role="button" style={estilos.botao} onPress={() => navigation.goBack()}>
        <Text style={estilos.botaoTexto}>Voltar para a busca</Text>
      </Pressable>
    </ScrollView>
  )
}

const estilos = StyleSheet.create({
  tela: { padding: 20, gap: 8 },
  foto: { height: 200, borderRadius: 8, backgroundColor: '#e4e4e7', alignItems: 'center', justifyContent: 'center' },
  inicial: { fontSize: 64, fontWeight: '700', color: '#71717a' },
  nome: { fontSize: 24, fontWeight: '700', color: '#18181b' },
  versao: { fontSize: 16, color: '#52525b' },
  preco: { fontSize: 28, fontWeight: '700', color: '#18181b' },
  detalhe: { fontSize: 14, color: '#52525b' },
  botao: { marginTop: 16, alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: '#7c3aed' },
  botaoTexto: { color: '#fff', fontWeight: '700' },
})
```

- [ ] **Step 8: Typecheck**

Run: `cd host-rn && npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 9: Commit**

```bash
git add host-rn/src host-rn/index.js host-rn/tsconfig.json
git rm -r --cached host-rn/App.tsx host-rn/__tests__ 2>/dev/null; git add -u host-rn
git commit -m "feat(host-rn): host nativo carregando a busca via Module Federation"
```

### Task 13: Verificação do fluxo nativo

- [ ] **Step 1: Subir os servidores em background**

```
cd mini-app && npm run dev:native > /tmp/estudo-mf-mini-native.log 2>&1
cd host-rn && npm start > /tmp/estudo-mf-host-rn.log 2>&1
```
Conferir `http://localhost:9000/ios/mf-manifest.json` e `http://localhost:8081` respondendo.

- [ ] **Step 2: Build e instalação no simulador**

Run: `cd host-rn && npx react-native run-ios --simulator "iPhone 17" --no-packager` (timeout longo; o primeiro build leva vários minutos)
Expected: `BUILD SUCCEEDED` e o app aberto no simulador.

- [ ] **Step 3: Roteiro** (screenshots com `xcrun simctl io booted screenshot /tmp/estudo-mf-<passo>.png` e Read da imagem; toques e digitação pelo usuário quando a automação não alcançar — pedir a ele e conferir o screenshot)

1. Tela "Garagem · host app", borda tracejada "remote: busca", "30 carros encontrados", botão "Filtros" (iPhone em retrato = layout estreito).
2. Abrir "Filtros", marcar Honda, "Ver 4 carros" → lista só com Honda; botão "Filtros (1)".
3. Tocar num carro → tela de detalhe do host. "Voltar para a busca" → mesma lista filtrada.
4. Simulador de iPad (`--simulator "iPad Air 11-inch (M3)"` ou o iPad disponível em `xcrun simctl list devices available`) → painel lateral.
5. Matar o servidor da 9000 e recarregar o app (Cmd+R no simulador) → "Busca indisponível". Subir a 9000 de novo e tocar "Tentar de novo" → busca volta.
6. Log do host-rn sem "Invalid hook call" e sem aviso de versão de shared.

- [ ] **Step 4: Se algo falhar**, @superpowers:systematic-debugging, commit `fix(...)`, repetir. Ao final, parar os servidores.

### Task 14: README e fechamento

**Files:**
- Create: `README.md`

- [ ] **Step 1: `README.md`**

````markdown
# estudo-mf — busca de veículos via Module Federation

Um mini-app (código React Native) carregado em tempo de execução por um host web e
por um host nativo. Spec: `docs/superpowers/specs/2026-10-14-busca-veiculos-design.md`.

| Projeto | O que é | Porta |
|---|---|---|
| `mini-app` (web) | remote `busca` + página standalone | 3001 |
| `mini-app` (nativo) | remote `busca` via Re.Pack | 9000 |
| `host-react` | host web (Rspack + React Router) | 3000 |
| `host-rn` | host nativo (RN 0.86 + Re.Pack) | 8081 |

## Instalar (uma vez)

```bash
nvm use
(cd mini-app && npm install)
(cd host-react && npm install)
(cd host-rn && npm install && bundle install && cd ios && bundle exec pod install)
```

## Rodar o web (2 terminais)

```bash
cd mini-app && npm run dev:web      # 3001 — abra sozinho para ver o modo standalone
cd host-react && npm run dev        # 3000 — o host
```

## Rodar o nativo (3 terminais)

```bash
cd mini-app && npm run dev:native   # 9000
cd host-rn && npm start             # 8081
cd host-rn && npx react-native run-ios --simulator "iPhone 17" --no-packager
```

## Testes

```bash
(cd mini-app && npm test && npm run typecheck)
(cd host-react && npm test && npm run typecheck)
(cd host-rn && npx tsc --noEmit)
```

## O que observar

- A borda tracejada `remote: busca` marca onde termina o host e começa o mini-app.
- Derrube o servidor do remote e recarregue: o host mostra "Busca indisponível".
- Na web, os filtros vão para a URL; no app, a pilha de telas mantém a busca viva.
````

- [ ] **Step 2: Rodar todos os testes e typechecks** (comandos da seção "Testes" do README)
Expected: tudo passando.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: como rodar o estudo"
```
