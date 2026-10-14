# estudo-mf — busca de veículos via Module Federation

Dois micro-frontends (código React Native) — a **busca** e o **simulador de financiamento**, de "times"
diferentes — carregados em tempo de execução por um host web e por um host nativo. Os remotes não se
conhecem: o host faz a ponte (busca → detalhe do carro → simulador). Specs: `docs/superpowers/specs/` (busca, financiamento).

| Projeto | O que é | Porta |
|---|---|---|
| `mini-app` (web) | remote `busca` + página standalone | 3001 |
| `mini-app` (nativo) | remote `busca` via Re.Pack | 8082 (a 9000 é do MinIO do meu-tramite) |
| `financiamento` (web) | remote `financiamento` + página standalone | 3003 (a 3002 é da API do meu-tramite) |
| `financiamento` (nativo) | remote `financiamento` via Re.Pack | 8083 |
| `host-react` | host web (Rspack + React Router) | 3000 |
| `host-rn` | host nativo (RN 0.86 + Re.Pack) | 8081 |

## Instalar (uma vez)

```bash
nvm use
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

## Testes

```bash
(cd mini-app && npm test && npm run typecheck)
(cd financiamento && npm test && npm run typecheck)
(cd host-react && npm test && npm run typecheck)
(cd host-rn && npx tsc --noEmit && npm run lint)
```

## O que observar

- A borda tracejada `remote: busca` marca onde termina o host e começa o mini-app.
- Derrube o servidor de **um** remote e recarregue: só a caixa dele mostra "… indisponível"; o resto segue
  (ex.: sem o 3003, o detalhe do carro e a busca funcionam, só o simulador some).
- Derrube o servidor do remote e recarregue: o host mostra "Busca indisponível". No app (dev), o
  LogBox abre antes em tela cheia — o Re.Pack reporta a falha do remote como erro fatal; feche-o.
- Na web, os filtros vão para a URL; no app, a pilha de telas mantém a busca viva.
- Para parar um servidor: `lsof -ti tcp:<porta> -sTCP:LISTEN | xargs kill` — o `-sTCP:LISTEN` é obrigatório: sem ele
  o `kill` derruba também quem está conectado (Chrome, o app no simulador). Nunca na 9000 (Docker) nem na 3002 (meu-tramite).
