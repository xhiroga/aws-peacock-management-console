import { Configuration } from 'webpack'
import * as path from 'path'
import CopyPlugin from 'copy-webpack-plugin'
const srcDir = path.join(__dirname, 'src')

const config: Configuration = {
  entry: {
    options: path.join(srcDir, 'options.ts'),
    content: path.join(srcDir, 'content.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
      options: {},
    }),
  ],
}

export default config
