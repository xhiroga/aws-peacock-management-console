import { Configuration } from 'webpack'
import * as path from 'path'
import CopyPlugin from 'copy-webpack-plugin'
const srcDir = path.join(__dirname, 'src')

const config: Configuration = {
  entry: {
    content: path.join(srcDir, 'content.ts'),
    options: path.join(srcDir, 'options.tsx'),
    scraping: path.join(srcDir, 'scraping.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
      options: {},
    }),
  ],
}

export default config
