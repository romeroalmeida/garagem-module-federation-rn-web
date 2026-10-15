import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@rspack/cli'
import { rspack } from '@rspack/core'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import reactPkg from 'react/package.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }
import dsPkg from '@garagem/ds/package.json' with { type: 'json' }
import rnwPkg from 'react-native-web/package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// versão instalada (exata), não a declarada — um ^ no package.json afrouxaria o requiredVersion
const versaoReact = reactPkg.version

const HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Garagem</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Figtree:wght@400;600;700&display=swap" />
    <style>html, body, #root { height: 100%; margin: 0 } #root { display: flex; flex-direction: column } body { font-family: Figtree, system-ui, sans-serif } :focus-visible { outline: 2px solid #171717; outline-offset: 0; box-shadow: 0 0 0 4px #00E0A0 }</style>
  </head>
  <body><div id="root"></div></body>
</html>`

export default defineConfig({
  context: __dirname,
  entry: './src/index.tsx',
  output: { publicPath: '/', uniqueName: 'hostReact' },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js', '.json'],
    alias: { 'react-native$': 'react-native-web', '@': path.resolve(__dirname, 'src') },
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
      remotes: {
        busca: 'busca@http://localhost:3001/mf-manifest.json',
        financiamento: 'financiamento@http://localhost:3003/mf-manifest.json',
      },
      dts: false,
      // o padrão (version-first) busca o manifesto de todo remote na inicialização:
      // com o remote fora do ar, a página nem renderiza e o ErrorBoundary nunca aparece
      shareStrategy: 'loaded-first',
      shared: {
        react: { singleton: true, requiredVersion: versaoReact },
        'react-dom': { singleton: true, requiredVersion: versaoReact },
        // a chave é 'react-native' (é o que o código importa; o alias não muda a chave), com a versão do RNW
        'react-native': { singleton: true, version: rnwPkg.version, requiredVersion: rnwPkg.version },
        '@garagem/ds': { singleton: true, requiredVersion: '^1.2.0' /* o host usa o Logo e os ícones Heart/Menu (1.2.0); os remotes pedem ^1.1.0 */, version: dsPkg.version },
        // svg compartilhado (registro de views uma vez só); lucide NÃO — shared não sofre tree-shaking (725 KiB)
        'react-native-svg': { singleton: true, requiredVersion: pkg.dependencies['react-native-svg'] },
      },
    }),
  ],
  devServer: { port: 3000, historyApiFallback: true },
})
