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
