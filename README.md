# estudo-mf — micro-frontends com Module Federation (busca + financiamento)

Dois micro-frontends (código React Native) — a **busca** e o **simulador de financiamento**, de "times"
diferentes — carregados em tempo de execução por um host web e por um host nativo. Os remotes não se
conhecem: o host faz a ponte (busca → detalhe do carro → simulador). O visual vem de um design system
versionado, `@garagem/ds` (`design-system/`), compartilhado como singleton pelo Module Federation.
Specs: `docs/superpowers/specs/` (busca, financiamento, design Fase 1).

| Projeto | O que é | Porta |
|---|---|---|
| `mini-app` (web) | remote `busca` + página standalone | 3001 |
| `mini-app` (nativo) | remote `busca` via Re.Pack | 8082 |
| `financiamento` (web) | remote `financiamento` + página standalone | 3003 |
| `financiamento` (nativo) | remote `financiamento` via Re.Pack | 8083 |
| `host-react` | host web (Rspack + React Router) | 3000 |
| `host-rn` | host nativo (RN 0.86 + Re.Pack) | 8081 |
| `design-system` | pacote `@garagem/ds` (tokens + componentes RN) | — |

## Instalar (uma vez)

```bash
nvm use
# o tarball do design system já está commitado (design-system/garagem-ds-<versão>.tgz)
(cd mini-app && npm install)
(cd financiamento && npm install)
(cd host-react && npm install)
(cd host-rn && npm install && bundle install && cd ios && bundle exec pod install)
```

## Rodar o web (3 terminais)

```bash
cd mini-app && npm run dev:web      # 3001 — abra sozinho para ver o modo standalone
cd financiamento && npm run dev:web # 3003 — idem
cd host-react && npm run dev        # 3000 — o host
```

## Rodar o nativo (4 terminais)

```bash
cd mini-app && npm run dev:native   # 8082
cd financiamento && npm run dev:native # 8083
cd host-rn && npm start             # 8081
cd host-rn && npx react-native run-ios --simulator "iPhone 17" --no-packager
```

## Mudar o design system

1. Editar `design-system/src/`, subir a versão em `design-system/package.json` (1.1.1 → 1.1.2…).
2. `cd design-system && npm install && npm run pacote` (gera `garagem-ds-<versão>.tgz`).
3. Nos 4 projetos: `npm i -E ../design-system/garagem-ds-<versão>.tgz` (**caminho explícito**) e reiniciar os
   dev servers. Reempacotar a mesma versão é invisível para o npm ("up to date").

Em tempo de execução vale a cópia do **host** (singleton): atualizar o host já muda o visual dos remotes
compatíveis (`^1.x`).

## Fotos

As fotos dos anúncios são do Wikimedia Commons (CC0, CC BY, CC BY-SA), com autor, licença e link em
`mini-app/src/features/busca-veiculos/services/fotos/creditos.json`; o crédito aparece no card e, com
links, na página do anúncio.

## Testes

```bash
(cd mini-app && npm test && npm run typecheck)
(cd financiamento && npm test && npm run typecheck)
(cd host-react && npm test && npm run typecheck)
(cd host-rn && npx tsc --noEmit && npm run lint)
```

## O que observar

- As bordas tracejadas `remote: busca` e `remote: financiamento` marcam onde termina o host e começa cada remote.
- Derrube o servidor de um remote e recarregue: só a caixa dele mostra "… indisponível" (sem a 3003, o
  detalhe do carro e a busca seguem). No app (dev), o LogBox abre antes em tela cheia — o Re.Pack reporta a
  falha do remote como erro fatal; feche-o.
- Na web, os filtros vão para a URL; no app, a pilha de telas mantém a busca viva.
- Para parar um servidor: `lsof -ti tcp:<porta> -sTCP:LISTEN | xargs kill` — o `-sTCP:LISTEN` é obrigatório: sem ele
  o `kill` derruba também quem está conectado (Chrome, o app no simulador).

## Licença

Código sob a licença MIT (`LICENSE`). Ficam fora dela, cada um com a licença própria:
- as fotos em `mini-app/src/features/busca-veiculos/services/fotos/` (CC0, CC BY e CC BY-SA, do Wikimedia
  Commons; autor, licença e link em `creditos.json`);
- as fontes Archivo Black e Figtree em `host-rn/assets/fonts/` (SIL Open Font License, em `host-rn/assets/licencas/`).
