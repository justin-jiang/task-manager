
import * as chalk from 'chalk';
import * as path from 'path';
import * as webpack from 'webpack';
import * as BuildConfig from './webpack.server.conf';
import * as fs from 'fs';
// import GitRevisionPlugin = require('git-revision-webpack-plugin');
// import BundleAnalyzer = require('webpack-bundle-analyzer');

// tslint:disable:no-console
// set custom prop in nodejs env object
process.env.NODE_ENV = 'production';
process.env.ANALYZER = 'false';
process.argv.forEach((value: string) => {
    if (value.toLocaleLowerCase() === '--debug') {
        process.env.NODE_ENV = 'debug';
    } else if (value.toLocaleLowerCase() === '--analyzer') {
        process.env.ANALYZER = 'true';
    }
});
const webpackConfig = BuildConfig.config;
// const gitRevision = new GitRevisionPlugin();
console.log((chalk as any).yellow(`current build type:${process.env.NODE_ENV} and analyzer:${process.env.ANALYZER}`));
webpackConfig.plugins = webpackConfig.plugins || [];
if (process.env.NODE_ENV === 'production') {
    console.log('version check done.');
    webpackConfig.mode = 'production';
} else {
    webpackConfig.mode = 'development';
}

if ((process.env.ANALYZER as any) === 'true') {
    // const BundleAnalyzerPlugin = BundleAnalyzer.BundleAnalyzerPlugin;
    // webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

(webpack as any)(webpackConfig, (argErr: any, stats: any) => {
    if (argErr) {
        console.log((chalk as any).red(JSON.stringify(argErr)));
        process.exit(1);
    }
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
    }) + '\n\n');

    if (stats.hasErrors()) {
        console.log((chalk as any).red('  Build failed with errors.\n'));
        process.exit(1);
    }

    // fs.writeFileSync(path.join(
    //     webpackConfig.output.path,
    //     'CommitInfo.txt'),
    //     'Branch:CommitId:Version -- '
    //     + gitRevision.branch() + ':'
    //     + gitRevision.commithash() + ':'
    //     + gitRevision.version());

    console.log('copy other dependencies ...');
    const dependencies: Array<{ src?: string, dest?: string }> = [];
    dependencies.push({
        src: path.join((webpackConfig as any).output.path, '../package.json'),
        dest: path.join((webpackConfig as any).output.path, 'package.json'),
    });

    dependencies.push({
        src: path.join((webpackConfig as any).output.path, '../src/adminScripts/pm2.config.js'),
        dest: path.join((webpackConfig as any).output.path, 'pm2.config.js'),
    });

    for (const dep of dependencies) {
        fs.copyFileSync((dep as any).src, (dep as any).dest);
    }

    console.log((chalk as any).cyan('  Build complete.\n'));
});
