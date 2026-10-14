# estudo-mf — busca de veículos via Module Federation

Um mini-app (código React Native) carregado em tempo de execução por um host web e
por um host nativo. Spec: `docs/superpowers/specs/2026-10-14-busca-veiculos-design.md`.

| Projeto | O que é | Porta |
|---|---|---|
| `mini-app` (web) | remote `busca` + página standalone | 3001 |
| `mini-app` (nativo) | remote `busca` via Re.Pack | 8082 (a 9000 é do MinIO do meu-tramite) |
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
cd mini-app && npm run dev:native   # 8082
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
- Derrube o servidor do remote e recarregue: o host mostra "Busca indisponível". No app (dev), o
  LogBox abre antes em tela cheia — o Re.Pack reporta a falha do remote como erro fatal; feche-o.
- Na web, os filtros vão para a URL; no app, a pilha de telas mantém a busca viva.
- Para parar um servidor: `lsof -ti tcp:<porta> | xargs kill` (nunca na 9000 — é o Docker).
