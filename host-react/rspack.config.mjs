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
      },
    }),
  ],
  devServer: { port: 3000, historyApiFallback: true },
})
