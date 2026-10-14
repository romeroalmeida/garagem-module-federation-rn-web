# Busca de veículos via Module Federation — design

**Data:** 14/10/2026 · **Status:** aprovado no brainstorm

## Objetivo

Estudar Module Federation com um mini-app de verdade: a **busca de veículos** de um
marketplace de carros (inspirado no domínio de sites como o Webmotors, sem nome nem
marca deles). Um único código-fonte do mini-app roda dentro de dois hosts — um app
React web e um app React Native — sem publicar biblioteca.

Sucesso = nos dois hosts dá para buscar, filtrar, abrir o detalhe de um carro e
voltar com os filtros intactos, com o mini-app carregado em tempo de execução de um
servidor separado.

## Fora do escopo (v1)

Fotos reais, ordenação, paginação, host Next, Android (anotado: `localhost` vira
`10.0.2.2`), `getVeiculo` exposto, plugin `dts` do MF, deploy, testes e2e.

## Arquitetura

```
estudo-mf/                      3 projetos independentes, cada um com seu node_modules
├── mini-app/   remote "busca"  um código RN, dois builds
│   ├── web:    Rspack + react-native-web  → http://localhost:3001/mf-manifest.json
│   └── nativo: Re.Pack                    → http://localhost:8082/ios/mf-manifest.json
├── host-react/ Rspack + React Router      → http://localhost:3000
└── host-rn/    RN CLI + Re.Pack + React Navigation (native-stack), simulador iOS
                dev server na 8081
```

- **Nome do container:** `busca` (precisa ser identificador JS válido).
- **Módulo exposto:** `exposes: { './BuscaVeiculos': './src/features/busca-veiculos/index.ts' }`.
  O barrel da feature é o módulo exposto.
- **Remotes nos hosts:**
  - web: `busca@http://localhost:3001/mf-manifest.json`
  - nativo: `` `busca@http://localhost:8082/${platform}/mf-manifest.json` ``
- **Carregamento:** `React.lazy(() => import('busca/BuscaVeiculos'))` criado **no
  escopo do módulo** (não dentro do componente), dentro de `Suspense`. Assim voltar
  do detalhe não pisca "Carregando busca…".
- **Plugin web:** `ModuleFederationPlugin` de `@module-federation/enhanced/rspack`
  (o plugin embutido do Rspack é MF 1.5). Plugin nativo:
  `Repack.plugins.ModuleFederationPluginV2`.
- **Shared (singleton), sempre declarado explicitamente** (passar `shared` substitui
  os padrões do plugin):
  - web: `react`, `react-dom`. Host **e** página standalone do mini-app têm
    fronteira assíncrona (`index.tsx` faz `import('./bootstrap')`); sem ela dá
    "Shared module is not available for eager consumption".
  - nativo: `react`, `react-native`. Host `eager: true`; remote `eager: false`
    **explícito** (o padrão do `ModuleFederationPluginV2` é `eager: true` também no
    remote).
  - `requiredVersion`: `react` e `react-dom` na versão exata do React;
    `react-native` na versão exata do RN.
- **`shareStrategy: 'loaded-first'` nos dois hosts.** O padrão (`version-first`)
  busca o manifesto de todo remote na inicialização dos shared: com o remote fora
  do ar o host nem renderiza e o `ErrorBoundary` nunca aparece.
- **Remote web servido com CORS** (`Access-Control-Allow-Origin: *` no dev server da
  3001), porque o host da 3000 baixa o `mf-manifest.json` com `fetch`.
  `output.publicPath: 'auto'`.
- **Versões fixas (a combinação que o Re.Pack 5.4.2 testa):** React Native 0.86.3,
  React 19.2.3 (exata, igual ao renderer do RN), `react-dom` 19.2.3,
  `react-native-web` 0.21.x, `@callstack/repack` 5.4.2, `@rspack/core` 1.6.0,
  `@module-federation/enhanced` 2.9.2, React Router **7** (a v8 exige React 19.2.7+),
  React Navigation 7.
- **Sem workspaces:** cada projeto tem seu `npm install`, como repos de times
  diferentes. O template do RN tem caminhos `../node_modules` fixos no Xcode e no
  Gradle, que quebram com hoisting de workspace.
- **Tipos:** cada host tem um alias de TS (`paths`) `@busca/tipos` →
  `../mini-app/src/features/busca-veiculos/types.ts` (arquivo só com tipos, sem
  imports) e um `remotes.d.ts` com `declare module 'busca/BuscaVeiculos'` tipado com
  `BuscaVeiculosProps` — os `import type` ficam **dentro** do bloco `declare module`
  (no topo do arquivo viram augmentation e dão TS2664). `verbatimModuleSyntax` nos
  hosts garante que o alias só aparece em `import type`, que some na compilação:
  zero código compartilhado.
- **Build nativo do mini-app** (não tem `ios/` nem `android/`): `react-native.config.js`
  com os comandos do Re.Pack, `@react-native-community/cli` + `cli-platform-ios`,
  `babel.config.js` com `@react-native/babel-preset`, entry explícito
  (`index.native.js`) e configs com nomes distintos (`rspack.web.config.mjs` e
  `rspack.native.config.mjs`, passados por `--config`).
- **Bundler:** Rspack nos três (o Re.Pack já é Rspack).
- **Gerenciador:** npm. CocoaPods com Ruby 3.3.8 (`.ruby-version` em `host-rn/`, ao
  lado do Gemfile).

## Estrutura de pastas (arquitetura feature-based do Romero)

```
mini-app/src/
├── features/busca-veiculos/
│   ├── components/  BarraBusca.tsx · PainelFiltros.tsx · CardVeiculo.tsx
│   ├── pages/       BuscaVeiculos.tsx
│   ├── services/    veiculos.json · veiculosService.ts
│   ├── utils/       filtrarVeiculos.ts · filtros.ts · formatar.ts (+ testes)
│   ├── types.ts     ← só tipos, sem imports (os hosts leem daqui)
│   └── index.ts     ← barrel = módulo exposto
├── app/App.tsx      ← roda o mini-app sozinho na web (dev isolado)
└── index.tsx · bootstrap.tsx

host-react/src/
├── app/       routes/ · App.tsx · layout/Layout.tsx
├── features/
│   ├── busca/    pages/PaginaBusca.tsx · components/RemoteBusca.tsx · components/Fronteira.tsx
│   │             utils/filtrosUrl.ts (+ teste)
│   └── veiculo/  pages/PaginaVeiculo.tsx
├── remotes.d.ts
└── index.tsx · bootstrap.tsx

host-rn/src/
├── app/       routes/Navegacao.tsx · App.tsx
├── shared/    types/rotas.ts   ← mapa da pilha (app + as duas features)
├── remotes.d.ts
└── features/
    ├── busca/    screens/TelaBusca.tsx · components/RemoteBusca.tsx · components/Fronteira.tsx
    └── veiculo/  screens/TelaVeiculo.tsx
```

Só o host-rn tem `shared/types/rotas.ts` (mapa da pilha usado pelo app e pelas duas
features). Fora isso, sem `shared/`, `api/` ou `state/` (YAGNI). Aliases `@/` nos três.
`RemoteBusca` e `Fronteira` são da feature `busca` (não de `app/layout`): só ela os usa,
e feature não importa de `app/` — a dependência vai só de `app` para `features`.
Estilo: `StyleSheet` do RN no mini-app e no host-rn; objetos de estilo inline no
host-react (simétrico ao `StyleSheet` e dispensa configurar CSS no Rspack).

## Contrato do mini-app

```ts
type Veiculo = {
  id: string; marca: string; modelo: string; versao: string
  ano: number; km: number; preco: number; cidade: string; uf: string
}

type Filtros = {
  texto: string        // marca + modelo + versão
  marcas: string[]     // vazio = todas
  precoMax?: number
  anoMin?: number
  kmMax?: number
}

type BuscaVeiculosProps = {
  filtrosIniciais?: Filtros
  onFiltrosMudaram?: (filtros: Filtros) => void
  onSelecionarVeiculo: (veiculo: Veiculo) => void
}
```

- O barrel exporta o componente como `default` e os três tipos.
- `filtrosIniciais` é lido **só na montagem** e passa por `normalizarFiltros`
  (descarta marcas que não existem nos dados, números inválidos ou negativos).
  Depois disso o mini-app é dono do estado e só **avisa** o host. Nunca reaplica a
  prop (evita o loop host → prop → mini-app → host).
- `onFiltrosMudaram` é chamado **no handler**, dentro de uma única função
  `atualizar(novos)` que faz `setFiltros(novos)` e avisa o host. Nunca num
  `useEffect` (o host passa uma arrow function nova a cada render, e um efeito que
  dependesse dela entraria em loop com o `setSearchParams`). Não dispara na montagem.
- O mini-app **não navega**. Tocar num card chama `onSelecionarVeiculo(veiculo)`
  com o objeto inteiro.

## Dados e regra de filtro

- `veiculos.json`: 30 carros fictícios de 8 marcas, cidades do Sul Fluminense.
  `listarVeiculos()` devolve o array; `listarMarcas()` deriva a lista de marcas do
  filtro (ordenada, sem repetição). Os dois vêm de `services/veiculosService.ts`.
- `filtrarVeiculos(veiculos, filtros)` — função pura:
  - texto: ignora acento e caixa, procura em `marca modelo versao`; vazio = sem filtro.
  - marcas: OU entre as marcadas; vazio = todas.
  - `precoMax`, `anoMin`, `kmMax`: inclusivos; `undefined` = sem limite.
  - entre filtros diferentes: E.
- Sem debounce: 30 itens filtram na hora.

## Telas

**Mini-app:** largura medida com `useWindowDimensions`.

- **≥ 768px:** `PainelFiltros` em coluna lateral + barra de busca e lista à direita.
- **< 768px:** barra de busca, botão `Filtros (n)` (n = filtros ativos do painel;
  marcas contam como um, o texto não conta) e lista.
  O botão abre um `Modal` com o **mesmo** `PainelFiltros` e um botão
  "Ver N carros" que só fecha o modal.
- Filtro aplica na hora em qualquer layout.
- `PainelFiltros`: checkboxes de marca (`Pressable` com `role="checkbox"` e
  `aria-checked` — funcionam no RN e no react-native-web, onde os props
  `accessibility*` estão depreciados), campos
  "Preço até", "Ano a partir de", "Km até" (`TextInput inputMode="numeric"`,
  caracteres não numéricos descartados, vazio = sem limite) e "Limpar filtros"
  (limpa o painel e preserva o texto da busca).
- Cabeçalho da lista: "N carros encontrados" (singular para 1).
- `CardVeiculo`: caixa cinza com a inicial da marca no lugar da foto; marca +
  modelo + versão, `ano · km`, preço, `cidade - UF`. Formatação com
  `Intl.NumberFormat('pt-BR')`.
- Lista vazia: "Nenhum carro com esses filtros" + "Limpar busca e filtros" (zera tudo).
- Lista com `FlatList`; a área tem largura máxima de 1100px (centralizada).

**Hosts (web e app iguais):** marca fictícia **Garagem**.

- **Busca:** cabeçalho do host ("Garagem") + mini-app dentro de `Fronteira` — borda
  tracejada com a etiqueta `remote: busca`. Só visual.
- **Veículo:** detalhe do host com os dados do carro e "Voltar para a busca".

## Estado dos filtros nos hosts

- **host-react:** a URL é a fonte. `/busca?q=civic&marcas=Honda,Toyota&precoMax=120000&anoMin=2019&kmMax=80000`.
  `lerFiltros(searchParams)` → `Filtros`; `gravarFiltros(filtros)` →
  `URLSearchParams` (omite vazios). `onFiltrosMudaram` grava com
  `setSearchParams(…, { replace: true })`. Ao tocar num carro:
  `navigate('/veiculo/' + id, { state: { veiculo } })`. "Voltar" usa
  `navigate(-1)`, que devolve a URL com os filtros; o mini-app remonta e lê
  `filtrosIniciais` dela. `/` redireciona para `/busca` com `replace`.
- **host-rn:** a native-stack mantém `TelaBusca` montada, então o próprio mini-app
  preserva o estado ao voltar. `TelaBusca` guarda os filtros num `useState` mesmo
  assim — mesmo contrato do web, e é o que restaura os filtros se o mini-app
  remontar. Ao tocar: `navigation.navigate('Veiculo', { veiculo })`.

## Erros

- **Remote fora do ar ou falha de carga:** `ErrorBoundary` em volta do `Suspense`
  (componente `RemoteBusca` de cada host) mostra "Busca indisponível" + "Tentar de
  novo". Recriar o `React.lazy` **não** recupera: o runtime do MF troca a fábrica do
  módulo por uma que lança o erro e guarda isso no cache. Então "Tentar de novo"
  recarrega o app inteiro: `window.location.reload()` na web,
  `DevSettings.reload()` no nativo (o estudo só roda em modo dev).
- **Nativo é diferente (achado na implementação):** o Re.Pack troca o
  `__webpack_require__` pelo `guardedRequire`, que reporta a falha do remote como erro
  **fatal** (`ErrorUtils.reportFatalError`) e devolve `undefined`; o `import()` resolve
  `{ default: undefined }` em vez de rejeitar. No dev o LogBox abre em tela cheia — ao
  fechar, aparece "Busca indisponível". No release o app fecharia (fora do escopo: o
  estudo só roda em dev). O `RemoteBusca` do host-rn checa `m.default` e lança um erro
  claro para o boundary. Para o nativo falhar como a web, sem fatal, o caminho é um
  plugin de runtime do MF com `errorLoadRemote` que marca o erro como `ChunkLoadError`,
  ou `loadRemote()` no lugar do `import()` — fica como evolução.
- **Carregando:** fallback do `Suspense` "Carregando busca…".
- **URL com valor inválido** (`precoMax=abc`, marca inexistente): `lerFiltros`
  ignora o número inválido; `normalizarFiltros` no mini-app descarta a marca.
- **Detalhe web aberto sem `state`** (URL `/veiculo/42` colada numa aba nova — F5
  na mesma aba **mantém** o state, porque o React Router o guarda no
  `history.state`): "Anúncio não encontrado" + link para `/busca`.

## Testes

- **Vitest (unitário):**
  - mini-app: `filtrarVeiculos` (acento/caixa, OU de marcas, E entre filtros,
    limites inclusivos, filtros vazios = tudo), `normalizarFiltros`, `formatar`.
  - host-react: `filtrosUrl` (ida e volta `lerFiltros(gravarFiltros(f))` igual a `f`; ignora
    inválidos; omite vazios).
- **Sem teste de componente na v1** (custo de configurar Testing Library para web
  e nativo não paga o estudo).
- **Verificação manual (roteiro):** nos dois hosts — buscar "civic", marcar 2
  marcas, preço até 120000, abrir um carro, voltar e conferir filtros; layout
  estreito e largo (web redimensionando; no app, iPhone em retrato = estreito e
  simulador de iPad = largo); derrubar o servidor do remote e ver "Busca
  indisponível"; religar e "Tentar de novo". Web: colar a URL de um detalhe numa
  aba nova e ver "Anúncio não encontrado"; copiar a URL da busca numa aba nova e
  ver os mesmos filtros.

## Portas

| Processo | Porta |
|---|---|
| host-react | 3000 |
| mini-app web (remote + página standalone) | 3001 |
| mini-app nativo (Re.Pack dev server) | 8082 — a 9000 é do MinIO do meu-tramite (Docker) |
| host-rn (Re.Pack dev server) | 8081 |
