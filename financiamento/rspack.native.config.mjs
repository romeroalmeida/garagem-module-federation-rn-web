import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Repack from '@callstack/repack'
import reactPkg from 'react/package.json' with { type: 'json' }
import reactNativePkg from 'react-native/package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default Repack.defineRspackConfig((env) => {
  const { mode } = env
  const resolveBase = Repack.getResolveOptions({ enablePackageExports: true })

  return {
    mode,
    context: __dirname,
    entry: './index.native.js',
    resolve: {
      ...resolveBase,
      alias: { ...resolveBase.alias, '@': path.resolve(__dirname, 'src') },
    },
    output: { path: '[context]/build/native/[platform]', uniqueName: 'financiamento' },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          use: { loader: '@callstack/repack/babel-swc-loader', parallel: true, options: {} },
          type: 'javascript/auto',
        },
        ...Repack.getAssetTransformRules({ inline: true }),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'financiamento',
        filename: 'financiamento.container.js.bundle',
        exposes: { './Simulador': './src/features/simulador/index.ts' },
        dts: false,
        // eager: false EXPLÍCITO — o padrão do plugin é eager: true até no remote
        shared: {
          react: { singleton: true, eager: false, version: reactPkg.version, requiredVersion: reactPkg.version },
          'react-native': {
            singleton: true,
            eager: false,
            version: reactNativePkg.version,
            requiredVersion: reactNativePkg.version,
          },
        },
      }),
    ],
  }
})
