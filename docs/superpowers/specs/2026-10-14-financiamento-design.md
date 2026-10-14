# Simulador de financiamento — 2º micro-frontend — design

**Data:** 14/10/2026 · **Status:** aprovado no brainstorm · **Base:** `2026-10-14-busca-veiculos-design.md`
(tudo que não estiver aqui segue a spec da busca: versões, arquitetura feature-based, regras de commit)

## Objetivo

Transformar o estudo em micro-frontends "de verdade": um **segundo remote, de outro time**, que
os dois hosts compõem na mesma tela junto com a busca. O simulador de financiamento aparece na
página/tela de detalhe do carro, no host web e no host nativo.

Sucesso = nos dois hosts, abrir um carro mostra o simulador (vindo de um servidor separado da
busca); mudar entrada/prazo recalcula a parcela; "Tenho interesse" faz o host mostrar "Proposta
enviada"; derrubar só o servidor do financiamento deixa o detalhe e a busca funcionando, com só a
caixa do simulador indisponível.

## Fora do escopo

Formulário de proposta (nome/telefone), taxa variável/real, biblioteca ou design system
compartilhado entre remotes, resiliência do nativo (a falha de remote continua fatal no Re.Pack —
é o próximo ciclo), Android, deploy.

## Arquitetura

```
estudo-mf/
├── mini-app/        remote "busca"          web 3001 · nativo 8082
├── financiamento/   remote "financiamento"  web 3003 · nativo 8083   ← novo
├── host-react/      carrega busca + financiamento (3000)
└── host-rn/         carrega busca + financiamento (8081)
```

(3002 é da API do meu-tramite; 9000 é do MinIO dele.)

- **Os remotes não se conhecem.** Fluxo sempre pelo host:
  1. busca → `onSelecionarVeiculo(veiculo)` → host abre o detalhe (já existe);
  2. detalhe do host → `<Simulador preco={veiculo.preco} onInteresse={…} />` (remote `financiamento`);
  3. simulador → `onInteresse(simulacao)` → host mostra "Proposta enviada ✓ — 48x de R$ 2.647,49".
- **Projeto independente:** `financiamento/` tem seu `package.json`, `npm install`, dois builds e
  manifestos. Mesma receita do `mini-app`: código React Native; build web com Rspack 1.6.0 +
  react-native-web + `@module-federation/enhanced/rspack`; build nativo com Re.Pack 5.4.2
  (`ModuleFederationPluginV2`, `react-native.config.js` com `@callstack/repack/commands`,
  `babel.config.js`, `index.native.js` como entry, configs `rspack.web.config.mjs` e
  `rspack.native.config.mjs`).
- **MF do remote:** `name: 'financiamento'` (identificador JS), `exposes: { './Simulador':
  './src/features/simulador/index.ts' }`, `uniqueName: 'financiamento'`, `dts: false`. Web:
  `filename: 'remoteEntry.js'`, `publicPath: 'auto'`, CORS no dev server, `HtmlRspackPlugin` com
  `chunks: ['main']`, fronteira assíncrona na página standalone. Nativo: `filename:
  'financiamento.container.js.bundle'`.
- **Shared:** só `react` + `react-dom` (web) e `react` + `react-native` (nativo), `singleton`,
  `requiredVersion` = versão **instalada** (lida de `react/package.json` / `react-native/package.json`),
  remote nativo com `eager: false` explícito. Mesmas versões exatas da busca (React 19.2.3,
  react-dom 19.2.3, RN 0.86.3, react-native-web 0.21.4, Rspack 1.6.0, MF enhanced 2.9.2,
  Re.Pack 5.4.2), instaladas com versão exata.
- **Remotes nos hosts:**
  - web: `financiamento@http://localhost:3003/mf-manifest.json`
  - nativo: `` `financiamento@http://localhost:8083/${platform}/mf-manifest.json` ``
- **Tipos nos hosts:** alias `@financiamento/tipos` →
  `../financiamento/src/features/simulador/types.ts` (só tipos, sem imports) e um segundo
  `declare module 'financiamento/Simulador'` no `remotes.d.ts`, com os `import type` **dentro** do
  bloco.
- **Duplicação deliberada:** formatação de moeda e leitura de número ficam duplicadas no
  financiamento (times diferentes; biblioteca comum agora seria acoplamento antes da hora).

## Estrutura de pastas

```
financiamento/
├── package.json · tsconfig.json · babel.config.js · react-native.config.js · index.native.js
├── rspack.web.config.mjs · rspack.native.config.mjs
└── src/
    ├── index.tsx · bootstrap.tsx          fronteira assíncrona da página standalone
    ├── app/App.tsx                        simulador sozinho, preço fixo R$ 112.900
    └── features/simulador/
        ├── types.ts                       só tipos, sem imports
        ├── index.ts                       barrel = módulo exposto
        ├── utils/parcela.ts (+ teste)     PRAZOS, TAXA_MENSAL, PRAZO_PADRAO, calcularParcela
        ├── utils/entrada.ts (+ teste)     limitesEntrada, entradaValida, lerNumero
        ├── utils/formatar.ts (+ teste)    formatarMoeda, formatarTaxa
        ├── components/SeletorPrazo.tsx
        └── pages/Simulador.tsx

host-react/src/                            (mudanças)
├── shared/components/Fronteira.tsx        ← sai de features/busca/components, ganha prop `nome`
├── features/busca/components/RemoteBusca.tsx      usa a Fronteira de shared
├── features/veiculo/components/RemoteFinanciamento.tsx   ← novo
├── features/veiculo/pages/PaginaVeiculo.tsx       compõe o simulador + "Proposta enviada"
└── remotes.d.ts                           + declare module 'financiamento/Simulador'

host-rn/src/                               (mudanças, simétricas)
├── shared/components/Fronteira.tsx        ← sai de features/busca/components, ganha prop `nome`
├── features/busca/components/RemoteBusca.tsx
├── features/veiculo/components/RemoteFinanciamento.tsx   ← novo
├── features/veiculo/screens/TelaVeiculo.tsx
└── remotes.d.ts
```

`Fronteira` sobe para `shared/` porque agora duas features a usam (regra feature-based do Romero:
2+ features → `shared/`).

## Contrato do remote

```ts
type Prazo = 12 | 24 | 36 | 48 | 60

type Simulacao = {
  preco: number
  entrada: number
  prazo: Prazo
  parcela: number      // em reais, arredondada para centavos
  taxaMensal: number   // 0.0149 — fixa e fictícia
}

type SimuladorProps = {
  preco: number
  onInteresse?: (simulacao: Simulacao) => void
}
```

- O barrel exporta o componente como `default` e os tipos `Prazo`, `Simulacao`, `SimuladorProps`.
- `preco` é lido **só na montagem** (estado inicial). Trocar de carro remonta o simulador: o host
  passa `key={veiculo.id}`. Sem `useEffect` de sincronização.
- `onInteresse` é chamado só no clique de "Tenho interesse" (handler), nunca em efeito.
- O simulador não navega e não guarda a proposta: quem mostra "Proposta enviada" é o host.

## Regras do cálculo

- **Tabela Price:** `financiado = preco − entrada`;
  `parcela = financiado × i / (1 − (1 + i)^−n)`, com `i = TAXA_MENSAL = 0.0149` e `n = prazo`;
  resultado arredondado para centavos (`Math.round(x * 100) / 100`).
- **Prazos:** `PRAZOS = [12, 24, 36, 48, 60]`, `PRAZO_PADRAO = 48`.
- **Entrada:** `limitesEntrada(preco)` → `{ min: Math.ceil(preco * 0.2), max: Math.floor(preco * 0.9) }`.
  Estado inicial = `min`. `entradaValida(entrada, preco)` = entrada definida e dentro de
  `[min, max]` (inclusivo).
- **Valores de referência** (preço R$ 112.900, entrada R$ 22.580, financiado R$ 90.320):
  12x = R$ 8.275,38 · 48x = R$ 2.647,49 · 60x = R$ 2.287,64. Limites: min 22.580, max 101.610.
- `lerNumero(texto)`: mantém só dígitos; vazio → `undefined` (mesma regra da busca, cópia própria).

## Tela

Um bloco só, sem modal nem navegação interna:

```
┌ Simule o financiamento ───────────────────┐
│ Preço do carro      R$ 112.900            │
│ Entrada             [ 22580 ]  mín. 20%   │
│ Prazo   (12)(24)(36)[48](60) meses        │
│                                            │
│ 48x de R$ 2.647,49                         │
│ taxa 1,49% a.m. · simulação, sem valor     │
│ de proposta                                │
│                                            │
│ [ Tenho interesse ]                        │
└────────────────────────────────────────────┘
```

- Preço do carro sem centavos (`R$ 112.900`); parcela **com** centavos (`R$ 2.647,49`).
- Entrada: `TextInput` com `inputMode="numeric"`, `maxLength={9}`, `aria-label="Entrada"`;
  digitar recalcula na hora.
- Entrada inválida: some a linha da parcela e aparece "Entrada entre R$ 22.580 e R$ 101.610";
  "Tenho interesse" fica desabilitado (`disabled` + `aria-disabled`).
- `SeletorPrazo`: `View` com `role="radiogroup"` e um `Pressable` por prazo com `role="radio"`
  e `aria-checked`; o selecionado em roxo (`#7c3aed`, mesma cor da busca).
- Formatação com `Intl.NumberFormat('pt-BR')` criada no escopo do módulo; moeda com
  `minimumFractionDigits` explícito (Hermes do Android).
- **Página standalone (3003):** o simulador com preço fixo R$ 112.900 e
  `console.log('[financiamento] interesse', simulacao)`.

## Hosts

- **`Fronteira`** (`shared/components/Fronteira.tsx`, nos dois hosts): mesma borda tracejada,
  etiqueta `remote: {nome}`. `RemoteBusca` passa `nome="busca"`; `RemoteFinanciamento`,
  `nome="financiamento"`.
- **`RemoteFinanciamento`** (`features/veiculo/components/`): mesmo molde do `RemoteBusca` —
  `lazy` no escopo do módulo; `LimiteDeErro` + `Suspense` ("Carregando simulador…"); fallback
  "Simulador indisponível" + "Tentar de novo" (`role="alert"`). Web: retry =
  `window.location.reload()`. Nativo: guarda `m.default` (o `guardedRequire` do Re.Pack resolve
  `{ default: undefined }`) e retry = `DevSettings.reload()`.
- **Detalhe web (`PaginaVeiculo`)** e **nativo (`TelaVeiculo`):** abaixo dos dados do carro,
  `<RemoteFinanciamento key={veiculo.id} preco={veiculo.preco} onInteresse={setProposta} />`.
  Com `proposta`, o host mostra "Proposta enviada ✓ — {prazo}x de {parcela}" (formatação do
  host). O estado `proposta` é do host e some ao trocar de carro (a página/tela remonta).
  O caso "Anúncio não encontrado" (web sem state) não muda: sem carro, sem simulador.
- **host-rn `TelaVeiculo`:** o `ScrollView` ganha `keyboardShouldPersistTaps="handled"` e
  `automaticallyAdjustKeyboardInsets` (o campo de entrada não fica atrás do teclado).
- **Configuração:** remote `financiamento` nos dois `rspack.config.mjs` (mesmo
  `shareStrategy: 'loaded-first'`); alias `@financiamento/tipos` nos dois `tsconfig.json`.

## Erros

- **Financiamento fora do ar:** o detalhe mostra o carro e só a caixa do simulador mostra
  "Simulador indisponível". A busca segue normal. (É o ganho de separar em dois remotes.)
- **Nativo:** como na busca, a falha vira erro fatal no `guardedRequire` do Re.Pack — LogBox em
  tela cheia no dev (fechar mostra o fallback), crash no release. Limitação conhecida; resolvida
  no próximo ciclo (resiliência).
- **Entrada inválida/vazia:** sem parcela, com a mensagem de limites; botão desabilitado.

## Testes

- **Vitest no `financiamento`:**
  - `parcela`: valores de referência (12x, 48x, 60x) e arredondamento em centavos.
  - `entrada`: `limitesEntrada(112900)` = `{ min: 22580, max: 101610 }`; `entradaValida` inclusiva
    nos dois limites, falsa fora e com `undefined`; `lerNumero` (dígitos, vazio).
  - `formatar`: moeda com centavos e NBSP (`'R$\u00A02.647,49'`), taxa `'1,49% a.m.'`.
- **Hosts:** sem lógica nova que peça teste unitário (é composição); typecheck e lint.
- **Roteiro web (Chrome):** abrir o Civic → simulador com "48x de R$ 2.647,49"; mudar prazo para
  12 → "12x de R$ 8.275,38"; entrada fora do limite → mensagem e botão desabilitado; "Tenho
  interesse" → "Proposta enviada ✓ — 12x de R$ 8.275,38"; voltar e abrir outro carro → simulador
  zerado para o novo preço, sem proposta; derrubar a 3003 → detalhe e busca funcionando, só o
  simulador indisponível; religar e "Tentar de novo".
- **Roteiro nativo:** manifesto em `:8083/ios/mf-manifest.json`, bundle do host compilando,
  typecheck; screenshot do que der sem toque. Os toques ficam com o Romero.

## Portas

| Processo | Porta |
|---|---|
| host-react | 3000 |
| mini-app web | 3001 |
| financiamento web | 3003 |
| host-rn (Re.Pack) | 8081 |
| mini-app nativo | 8082 |
| financiamento nativo | 8083 |
