import * as webpack from 'webpack';
import * as path from 'path';
import * as nodeExternals from 'webpack-node-externals';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';

function resolve(dir: any) {
    return path.join(__dirname, '..', dir);
}
export const config: webpack.Configuration = {
    context: resolve('./'),
    entry: {
        serverApp: './src/server/main.ts',
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: [(nodeExternals as any)()],
    output: {
        path: resolve('./dist'),
        filename: '[name].js',
    },
    plugins: [
        new (CleanWebpackPlugin as any)(
            [
                path.join(resolve('./dist'), '*.*'),
                path.join(resolve('./dist'), 'res'),
            ],
            {
                allowExternal: true,
            }),
    ],
    resolve: {
        alias: {
            server: resolve('./src/server'),
            common: resolve('./src/common'),
        },
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [resolve('src/common'), resolve('src/server'), resolve('test')],
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        logLevel: 'error',
                        configFile: 'tsconfig.server.json',
                    },
                }],
            },
        ],
    },
};
