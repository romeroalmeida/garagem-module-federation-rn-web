import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Repack from '@callstack/repack'
import { rspack } from '@rspack/core'
import reactPkg from 'react/package.json' with { type: 'json' }
import reactNativePkg from 'react-native/package.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }
import dsPkg from '@garagem/ds/package.json' with { type: 'json' }

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
        remotes: {
          busca: `busca@http://localhost:8082/${platform}/mf-manifest.json`,
          financiamento: `financiamento@http://localhost:8083/${platform}/mf-manifest.json`,
        },
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
          // design system e svg: uma cópia só em tempo de execução (a do host). Lucide fica fora do shared:
          // shared não sofre tree-shaking (725 KiB), e só o DS o importa
          '@garagem/ds': { singleton: true, eager: true, version: dsPkg.version, requiredVersion: '^1.1.0' /* FotoCarro, Campo e sombras chegaram na 1.1.0 */ },
          'react-native-svg': {
            singleton: true,
            eager: true,
            version: pkg.dependencies['react-native-svg'],
            requiredVersion: pkg.dependencies['react-native-svg'],
          },
        },
      }),
      // dependência opcional do @react-navigation/elements que não usamos
      new rspack.IgnorePlugin({ resourceRegExp: /^@react-native-masked-view/ }),
    ],
  }
})
