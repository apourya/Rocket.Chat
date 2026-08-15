import fs from 'fs';
import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

import { supportedLocales } from './src/supportedLocales';
import 'webpack-dev-server';

// Helper to use absolute paths in the webpack config
const _ = (p: string) => path.resolve(__dirname, p);

const FILE_UPLOAD_ENV_KEYS = [
	'LIVECHAT_FILE_UPLOAD_IMAGE_MAX_SIZE_MB',
	'LIVECHAT_FILE_UPLOAD_EXCEL_MAX_SIZE_MB',
	'LIVECHAT_FILE_UPLOAD_VIDEO_MAX_SIZE_MB',
] as const;

const parseEnvFile = (filePath: string, target: Record<string, string>) => {
	if (!fs.existsSync(filePath)) {
		return;
	}

	for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim();
		let value = trimmed.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		target[key] = value;
	}
};

const loadLivechatEnv = (mode: string): Record<string, string> => {
	const env: Record<string, string> = {};
	parseEnvFile(_('.env'), env);
	parseEnvFile(_('.env.local'), env);
	parseEnvFile(_(`.env.${mode}`), env);
	parseEnvFile(_(`.env.${mode}.local`), env);
	return env;
};

const common = (args: webpack.WebpackOptionsNormalized): Partial<webpack.Configuration> => ({
	stats: 'errors-warnings',
	mode: args.mode,
	devtool: args.mode === 'production' ? 'source-map' : 'eval',
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
		symlinks: false,
		alias: {
			react: 'preact/compat',
			'react-dom': 'preact/compat',
			'date-fns': path.dirname(require.resolve('date-fns/package.json')),
		},
	},
	optimization: {
		sideEffects: false,
		splitChunks: {
			chunks: 'all',
		},
		emitOnErrors: false,
	},
});

const config = (_env: any, args: webpack.WebpackOptionsNormalized): webpack.Configuration[] => {
	const mode = args.mode === 'production' ? 'production' : 'development';
	const livechatEnv = loadLivechatEnv(mode);
	const fileUploadEnvDefines = Object.fromEntries(
		FILE_UPLOAD_ENV_KEYS.map((key) => [
			`process.env.${key}`,
			JSON.stringify(livechatEnv[key] ?? process.env[key] ?? ''),
		]),
	);

	return [
	// =========================
	// MAIN APP BUILD
	// =========================
	{
		...common(args),
		entry: {
			bundle: ['core-js', 'regenerator-runtime/runtime', _('./src/entry')],
			polyfills: _('./src/polyfills'),
		} as webpack.Entry,
		output: {
			path: _('./dist'),
			publicPath: args.mode === 'production' ? '/livechat/' : '/',
			filename: args.mode === 'production' ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js',
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: [/\/node_modules\/core-js\//],
					type: 'javascript/auto',
					use: ['babel-loader'],
				},
				{
					test: /\.tsx?$/,
					use: 'babel-loader',
					exclude: ['/node_modules/'],
				},
				{
					test: /\.svg$/,
					use: [require.resolve('./svg-component-loader'), 'svg-loader', 'image-webpack-loader'],
				},
				{
					test: /\.s?css$/,
					exclude: [_('./src/components'), _('./src/routes')],
					use: [
						args.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
						{
							loader: 'css-loader',
							options: { importLoaders: 1, sourceMap: true },
						},
						{
							loader: 'postcss-loader',
							options: { sourceMap: true },
						},
					],
				},
				{
					test: /\.s?css$/,
					include: [_('./src/components'), _('./src/routes')],
					use: [
						args.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
						{
							loader: 'css-loader',
							options: {
								modules: { localIdentName: '[local]__[hash:base64:5]' },
								importLoaders: 1,
								sourceMap: true,
							},
						},
						{
							loader: 'postcss-loader',
							options: { sourceMap: true },
						},
					],
				},
				{
					enforce: 'pre',
					test: /\.scss$/,
					use: [
						{
							loader: 'sass-loader',
							options: { sassOptions: { fiber: false } },
						},
					],
				},
				{
					test: /\.(woff2?|ttf|eot)(\?.*)?$/i,
					type: 'asset/resource',
					generator: {
						filename: '[name].[hash:8][ext]'
					},
				},
				{
					test: /\.(jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
					loader: args.mode === 'production' ? 'file-loader' : 'url-loader',
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: args.mode === 'production' ? '[name].[contenthash:5].css' : '[name].css',
				chunkFilename:
					args.mode === 'production'
						? '[name].chunk.[contenthash:5].css'
						: '[name].chunk.css',
			}) as unknown as webpack.WebpackPluginInstance,
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(mode),
				...fileUploadEnvDefines,
			}),
			new HtmlWebpackPlugin({
				title: 'Livechat - Rocket.Chat',
				chunks: ['polyfills', 'vendor', 'bundle'],
				chunksSortMode: 'manual',
			}),
			new webpack.ContextReplacementPlugin(
				/date-fns[/\\]locale/,
				new RegExp(`(${supportedLocales.join('|')})\\.js$`),
			),
		],
		devServer: {
			hot: true,
			port: 8080,
			host: '0.0.0.0',
			allowedHosts: 'all',
			open: true,
			devMiddleware: {
				publicPath: args.mode === 'production' ? '/livechat/' : '/',
				stats: 'normal',
			},
			client: { logging: 'verbose' },
			static: {
				directory: _('./src'),
				publicPath: args.mode === 'production' ? '/livechat/' : '/',
				watch: {
					ignored: [_('./dist'), _('./node_modules')],
				},
			},
		},
	},

	// =========================
	// WIDGET BUILD
	// =========================
	{
		...common(args),
		entry: {
			'rocketchat-livechat.min': _('./src/widget.ts'),
		} as webpack.Entry,
		output: {
			path: _('./dist'),
			publicPath: args.mode === 'production' ? '/livechat/' : '/',
			filename: '[name].js',
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: 'babel-loader',
					exclude: ['/node_modules/'],
				},
			],
		},
	},
];
};

export default config;
