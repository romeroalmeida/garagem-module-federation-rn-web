# Design — Fase 1 (fundação visual + design system compartilhado) — design

**Data:** 14/10/2026 · **Status:** aprovado no brainstorm
**Base:** specs `2026-10-14-busca-veiculos-design.md` e `2026-10-14-financiamento-design.md`
(versões, regras feature-based, ports e regras de execução/commit dos planos anteriores continuam
valendo — inclusive parar servidor só com `lsof -ti tcp:<porta> -sTCP:LISTEN | xargs kill`).
**Referência visual:** prompt "Portal de compra e venda de carros (mix Webmotors + Carwow)" que o
Romero colou na conversa de 14/10/2026 — tokens, tipografia, card de veículo, filtros, anúncio.

## Objetivo

Aplicar a identidade visual do prompt ao estudo **sem perder o foco em micro-frontends**: um design
system único, versionado, consumido pelos 2 hosts e pelos 2 remotes, compartilhado em tempo de
execução pelo Module Federation (uma cópia só, a do host).

Sucesso = web (390px e 1280px) e app (iPhone e iPad) com header, card de veículo, filtros,
simulador e página do anúncio no visual novo; os 4 projetos usando `@garagem/ds` como `shared`
singleton; testes, typecheck e lint passando.

## Fora do escopo (Fase 1)

Home (Fase 2), página do anúncio como 3º remote (Fase 3), barra de navegação inferior, favoritos,
"ou 48x de R$ X" no card (cálculo de outro time), WhatsApp/mensagem/formulário de contato, FIPE,
avaliações, notícias, quiz, vender, SEO, LGPD, fotos reais, Android, hover animado no card.

## Correções ao prompt (contraste medido)

Bordas de controles (chips, campos, busca) usam `inkSoft` (5,38:1): `line` sobre branco dá 1,36:1 e
reprova o mínimo de 3:1 para bordas de componentes interativos. `alert` só sobre branco (4,59:1; sobre
`surface` cai para 4,14:1). Rótulos de `cambio`/`combustivel`/`carroceria` (ex.: `automatico` →
"Automático"): uma cópia pequena na busca e em cada host — não há código compartilhado em runtime.


| Par | Contraste | Decisão |
|---|---|---|
| `--accent #00E0A0` sobre branco | 1,73:1 | nunca como texto/ícone/foco sobre claro |
| `--accent` sobre `--ink` | 10,4:1 | ok — accent só sobre escuro (ou com texto `ink` em cima) |
| `--ink-soft` sobre `--car-stage` | 4,17:1 | reprova AA: legenda sobre `car-stage` usa `ink` |
| novo `accentInk #007A57` sobre branco / surface | 5,36 / 4,83:1 | texto/links em verde sobre claro (ex.: MODELO no anúncio) |

Foco: anel duplo — 2px `ink` + 2px `accent` por fora (web: `outline` + `box-shadow`), visível em
qualquer fundo.

## 1. Pacote `@garagem/ds` (`design-system/`)

```
design-system/
├── package.json        name @garagem/ds · version 1.0.0 · main/types em dist/ · files: [dist]
├── tsconfig.json       emite ESM + .d.ts em dist/ (jsx react-jsx)
└── src/
    ├── index.ts        exporta tokens e componentes
    ├── tokens.ts       cores, tipo, raios, espaços
    └── componentes/    Botao · Chip · Card · Selo · Skeleton · Titulo · Icone · Silhueta
```

- **Componentes React Native** (rodam na web via react-native-web). Sem lógica de negócio.
- **Compilado para JS** (`npm run build` → `dist/`): as regras web dos projetos excluem
  `node_modules` do loader de TS, então o pacote não pode ser só fonte TS.
- **peerDependencies:** `react`, `react-native`, `react-native-svg`, `lucide-react-native` (cada
  projeto instala; o pacote não traz cópia).
- **Distribuição:** `npm run build && npm pack` → `garagem-ds-1.0.0.tgz` (commitado, para um clone novo
  instalar); cada projeto instala `"@garagem/ds": "file:../design-system/garagem-ds-1.0.0.tgz"`.
  **Não** link simbólico: o `design-system/` tem `node_modules` próprio (devDependencies `typescript`,
  `@types/react`, `react`, `react-native`, `react-native-svg`, `lucide-react-native` para compilar), e
  com symlink o pacote resolveria uma **segunda cópia** de React/RN pelo caminho real.
  **Versão nova = bump (1.0.1…) + `npm run pacote` + `npm i -E ../design-system/garagem-ds-<v>.tgz`
  (caminho explícito) nos 4 + reiniciar os dev servers.** Reempacotar a mesma versão é invisível
  (`npm install` diz "up to date"; `npm ci` restaura o conteúdo antigo pelo hash do lockfile).
- **Tokens (`tokens.ts`):**
  - `cores`: ink `#171717`, inkSoft `#6A6977`, bg `#FFFFFF`, surface `#F5F2F8`,
    carStage `#E4E2DF`, line `#DCDCE9`, accent `#00E0A0`, accentSoft `#C9FFF0`,
    accentInk `#007A57`, alert `#E22446`.
  - `raios`: pilula 100, card 16, botao 12. `espaco(n)` = n × 8. `container` 1200.
  - `tipo` — estilos prontos por papel, com família por plataforma (`Platform.select`): na web
    `"Archivo Black"` / `Figtree` + `fontWeight`; no iOS cada peso é uma família
    (`ArchivoBlack-Regular`, `Figtree-Regular`, `Figtree-SemiBold`, `Figtree-Bold`).
    Papéis: `display` (caixa alta, 32 mobile / 56 desktop — o componente escolhe pelo
    `useWindowDimensions`), `titulo` (Figtree 700, 20–24), `corpo` (16/400), `corpoForte`
    (16/600), `legenda` (13/400 inkSoft), `preco` (Figtree 700, 22).
- **Componentes:**

| Componente | Props | Notas |
|---|---|---|
| `Botao` | `variante: 'primario' \| 'acao' \| 'contorno'`, `rotulo`, `onPress`, `desabilitado?` | 48px, raio 12; `acao` = accent com texto ink; `role="button"`, `aria-disabled` |
| `Chip` | `rotulo`, `selecionado?`, `onPress`, `papel?: 'checkbox' \| 'radio' \| 'button'`, `removivel?` (mostra ×), `icone?` | pílula, mín. 44px; borda `inkSoft` (3:1); marcado = fundo ink **+ ✓** |
| `Card` | `children`, `onPress?` | raio 16, borda `line`, sem sombra; com `onPress` vira `Pressable role="button"` |
| `Selo` | `texto`, `tom?: 'positivo' \| 'neutro'` | positivo = accentSoft + ink |
| `Skeleton` | `largura`, `altura`, `raio?` | pulsa (opacidade 0.5↔1, 900ms); parado se `AccessibilityInfo.isReduceMotionEnabled()` / `prefers-reduced-motion` |
| `Titulo` | `children`, `tamanho?: 'grande' \| 'medio'`, `nivel?: 1 \| 2 \| 3` (padrão 2) | `tipo.display`; grande = 32 / 56 a partir de 1024px, médio = 22; `role="heading"` + `aria-level` por spread (o RN 0.86 não tipa `aria-level`; sem ele o RNW gera sempre `<h1>`) |
| `Icone` | `nome` (subconjunto do Lucide: `Calendar`, `Gauge`, `Cog`, `Fuel`, `MapPin`, `Search`, `SlidersHorizontal`, `X`, `Check`), `tamanho?`, `cor?` | traço 1.75, cor padrão ink |
| `Silhueta` | `carroceria: 'hatch' \| 'sedan' \| 'suv' \| 'picape'` | ocupa a largura do container; SVG de perfil (viewBox 320×120, corpo + 2 rodas) em `ink` a 85% sobre `carStage`, 4:3 |

## 2. Compartilhamento (Module Federation)

| Pacote | web (host-react, mini-app, financiamento) | nativo (host-rn, mini-app, financiamento) |
|---|---|---|
| `react` | singleton, versão exata | singleton, exata; host eager |
| `react-dom` | singleton, exata | — |
| `react-native` | — | singleton, exata; host eager |
| `react-native` → react-native-web | **singleton com a chave `react-native`** e versão/requiredVersion do RNW (o código importa `react-native`; o alias não muda a chave — a chave `react-native-web` nunca casa) | — |
| `@garagem/ds` | singleton, `requiredVersion: '^1.0.0'` | idem; host eager, remotes `eager: false` |
| `lucide-react-native` | **não compartilhado**: shared não sofre tree-shaking (725 KiB por build); só o DS importa, e o DS já é singleton | idem |
| `react-native-svg` | singleton, `^` | idem — **módulo nativo, vem do host** |

- **host-react passa a ter `react-native-web`** + alias `react-native$ → react-native-web` + extensões
  `.web.*` antes das comuns (senão o `react-native-svg` resolve a entrada nativa) + `react-native@0.86.3`
  fixo (o npm instalaria o 0.87 como peer, que não tem o `@react-native/assets-registry` que o web do
  svg importa). Compartilhar o RNW acaba com as cópias duplicadas na mesma folha de estilos.
- `requiredVersion` = versão **instalada** para `react`/`react-dom`/`react-native` (como hoje);
  `^1.0.0` para o DS (é o ponto de usar semver).
- Versões: `react-native-svg` 15.15.5 e `lucide-react-native` 1.57.0 (peers `*` e `^15`), com `-E` nos
  4 projetos. O svg é de antes do RN 0.86: o `pod install` + build no Xcode é o primeiro portão.

## 3. Nativo no host-rn (rebuild)

- `react-native-svg` instalado no host-rn (e nos remotes, para compilar) → `pod install` +
  rebuild no Xcode. Remote nunca traz código nativo; o host precisa ter.
- **Fontes** (Google Fonts, licença OFL): `ArchivoBlack-Regular.ttf`, `Figtree-Regular.ttf`,
  `Figtree-SemiBold.ttf`, `Figtree-Bold.ttf` em `host-rn/assets/fonts/`, ligadas no iOS com
  `react-native-asset` (`iosAssets` no `react-native.config.js`, para não mexer no `android/` →
  `Info.plist UIAppFonts` + recursos do Xcode). Download: Archivo Black do `google/fonts`, Figtree
  estática do repositório do autor (`erikdkennedy/figtree/fonts/ttf`), licenças OFL junto.
- Na web: `<link>` do Google Fonts (`Archivo Black` + `Figtree` 400/600/700, `display=swap`) no
  HTML do host-react e das páginas standalone dos dois remotes.

## 4. Remote `busca`

**Contrato** (evolução compatível — só acrescenta):

```ts
type Carroceria = 'hatch' | 'sedan' | 'suv' | 'picape'
type Cambio = 'manual' | 'automatico'
type Combustivel = 'flex' | 'diesel' | 'eletrico'
type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco' | 'menor-km' | 'mais-novos'

type Veiculo = { /* atuais */ carroceria: Carroceria; cambio: Cambio; combustivel: Combustivel }
type Filtros = { /* atuais */ ordem?: Ordem }   // ausente = relevância (ordem do JSON)
```

- **Dados:** os 30 carros ganham os 3 campos (classificação no plano; diesel = Hilux, S10, Toro,
  Commander) + **carro 31: BYD Dolphin GS 180, 2024, 8.000 km, R$ 149.800, Resende-RJ, hatch,
  automático, elétrico**. Marcas passam a 9.
- **`ordenarVeiculos(lista, ordem)`** (pura, testada; cópia ordenada, sort estável):
  relevância = ordem original; menor/maior preço; menor km; mais novos (ano desc).
  Aplicada depois de `filtrarVeiculos`.
- **`normalizarFiltros`** descarta `ordem` fora da lista.
- **Card de veículo** (vertical): `Silhueta` 4:3 sobre carStage; MARCA MODELO (`corpoForte`, caixa
  alta); versão (`legenda`, 1 linha); specs com `Icone` — ano · km · câmbio · combustível; cidade
  (UF) com `MapPin`; preço (`tipo.preco`). Card inteiro tocável (`Card onPress`).
- **Grade:** 1 coluna < 768px, 2 ≥ 768px, 3 ≥ 1100px — `FlatList numColumns` com `key` por número
  de colunas.
- **Topo:** barra de busca em pílula com `Icone Search`; linha com `Chip` "Filtros (n)"
  (`SlidersHorizontal`) + **chips dos filtros ativos** removíveis ("Honda ×", "Até R$ 120.000 ×",
  "A partir de 2019 ×", "Até 80.000 km ×") + "Limpar"; contador "31 carros · ordenados por
  menor preço" (sem o sufixo quando relevância).
- **Painel** (lateral ≥ 768px, modal < 768px — mesmo componente): `Titulo` "FILTROS"; marcas como
  `Chip papel="checkbox"`; preço/ano/km como hoje; "Ordenar por" com `Chip papel="radio"`;
  rodapé com `Botao contorno` "Limpar" e `Botao primario` "Ver N carros" (no modal).

## 5. Remote `financiamento`

Contrato não muda. Visual com o DS:
- `Titulo` "SIMULE O FINANCIAMENTO"; preço do carro.
- **Entrada:** `Chip papel="radio"` 20% · 30% · 40% · 50% + campo livre; chip marcado quando
  `entrada === entradaPorPercentual(preco, pct)`. Nova util **`entradaPorPercentual(preco, pct)`**
  = `Math.ceil((preco * pct) / 100)` (20% = `limitesEntrada(preco).min`), testada.
  Sem slider: o do core saiu do RN e o da comunidade é módulo nativo.
- Prazo com `Chip papel="radio"` (substitui o `SeletorPrazo` próprio).
- **Bloco da parcela** em fundo `ink` com o valor em `accent` (10,4:1) e a taxa em branco.
- `Botao primario` "Tenho interesse"; parcela e mensagem de limites dentro da região
  `aria-live="polite"` que já existe (sem `role="alert"`).

## 6. Hosts

- **Header web** (fixo, branco, borda `line`): logo "GARAGEM" (`tipo.display`, 24px) + link
  "Comprar" ativo; etiqueta "host web" mantida (estudo).
- **Header do app:** `screenOptions` da native-stack com as fontes e cores dos tokens.
- **Skeletons:** fallback do `Suspense` da busca = 3 cards fantasma (`Skeleton`); do simulador =
  um bloco com a altura dele.
- **Página/tela do anúncio:**
  - `Silhueta` grande (4:3) da carroceria;
  - cabeçalho: MARCA em `ink` + MODELO em `accentInk`, `tipo.display`; versão em `legenda`;
  - grid de specs 3 colunas: Cidade · Ano · Km · Câmbio · Combustível · Carroceria
    (rótulo `legenda`, valor `corpoForte`);
  - simulador (remote) com `id`/ref "simulador";
  - "Proposta enviada ✓ — …" com `Selo tom="positivo"`;
  - **mobile (< 1024px web e no app):** barra fixa no rodapé com preço + `Botao acao` "Ver
    parcelas" que rola até o simulador (web: `scrollIntoView`; app: `ScrollView` ref + `onLayout`),
    respeitando a área segura (`useSafeAreaInsets`) no app;
  - **desktop web (≥ 1024px):** duas colunas — esquerda silhueta + cabeçalho + specs; direita
    `position: sticky` com preço + simulador.

## Testes

- **Vitest:** `ordenarVeiculos` (5 ordens, empate estável), `normalizarFiltros` com ordem
  inválida, `filtrosUrl` com `ordem` (ida e volta; valor desconhecido repassado ao mini-app),
  `entradaPorPercentual`; todos os atuais continuam passando.
- DS sem teste unitário (componentes de apresentação; verificados na tela).
- **Visual:** Chrome a 390px e 1280px (lista, filtros/modal, anúncio com barra fixa e duas
  colunas); simuladores iPhone e iPad por screenshot; toques no nativo pelo Romero.
- typecheck nos 5 projetos, lint no host-rn, `rspack build` no host-react.

## Ordem de execução

1. `@garagem/ds` (build + pack).
2. host-rn nativo: `react-native-svg` + fontes, `pod install`, rebuild (o Romero reabre o app).
3. Remote `busca`: contrato, dados, ordenação, card, filtros.
4. Remote `financiamento`: visual.
5. Hosts: shared/config, header, skeletons, anúncio.
6. Verificação, README, cofre.

## Fase 1.1 — acabamento (14/10/2026, depois do feedback "cara de wireframe")

- **Fotos reais** do Wikimedia Commons (licenças CC0, CC BY, CC BY-SA), uma por anúncio, 800×600
  JPEG ≤ 120 KB em `mini-app/src/features/busca-veiculos/services/fotos/` + `creditos.json`
  (autor, licença, URLs). O HB20S (23) usa a foto 16:9 sobre fundo desfocado dela mesma (sem esticar).
  Imagens geradas por IA ficaram de fora: a conta do Higgsfield está sem créditos e comprar é do Romero.
- **Contrato** (só acréscimos): `Veiculo.cor: Cor`, `Veiculo.foto?: FonteImagem`,
  `Veiculo.creditoFoto?: { autor, licenca, licencaUrl, fonte }`.
- **Entrega das fotos:** import estático no mini-app. Web: `asset/resource` (arquivo separado, URL
  absoluta pelo `publicPath: 'auto'` do remote). Nativo: `inline` do Re.Pack (base64 no bundle do
  remote, ~4 MB) — teto conhecido; caminho de upgrade: assets remotos do Re.Pack ou CDN.
- **DS 1.1.0:** `sombras` (card/elevada via `boxShadow`), display com peso 400 explícito, `Card`
  branco com sombra e +2px no hover (web), `Chip` preenchido (`surface`), `Campo` (texto preenchido),
  `FotoCarro` (foto 4:3 + crédito por cima; sem foto, a `Silhueta`).
- **Telas:** fundo da página em `surface` com cards brancos; busca em pílula branca com sombra;
  selo "Elétrico"/"Diesel" sobre a foto do card; anúncio com foto + crédito com link (autor,
  licença, Wikimedia), spec "Cor" e blocos em cards brancos; simulador em card branco com sombra.
