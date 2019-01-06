/**
 * 使用帮助: node pm2Script.js -h
 */
import * as path from 'path';
import * as file from 'fs';
import * as chalk from 'chalk';
import * as ora from 'ora';
import * as PM2 from 'pm2';
import { spawnSync } from 'child_process';

// tslint:disable:no-console
function printHelp() {
    console.log((chalk as any).yellow('启动服务程序：'));
    console.log((chalk as any).cyan('   node pm2Script --start'));
    console.log((chalk as any).cyan('   参数"--config"可以指定自定义配置文件'));
    console.log((chalk as any).cyan('   node pm2Script --start --config:pm2_custom.config.js'));
    console.log((chalk as any).yellow('重启服务程序：（--config参数同适用）'));
    console.log((chalk as any).cyan('   node pm2Script --reload'));
    console.log((chalk as any).yellow('停止服务程序：'));
    console.log((chalk as any).cyan('   停止服务程序进程，但不从pm项目列表中移出'));
    console.log((chalk as any).cyan('   node pm2Script --stop'));
    console.log((chalk as any).cyan('   停止服务程序进程，并从pm项目列表中移出'));
    console.log((chalk as any).cyan('   node pm2Script --delete'));
    console.log((chalk as any).cyan('   停止PM2实例（daemon）'));
    console.log((chalk as any).cyan('   node pm2Script --kill'));
    console.log((chalk as any).cyan('   强行杀掉（pkill）PM2实例（daemon）,只针对Linux用户'));
    console.log((chalk as any).cyan('   node pm2Script --forcekill'));
    console.log((chalk as any).yellow('其它：'));
    console.log((chalk as any).cyan('   dump pm2信息'));
    console.log((chalk as any).cyan('   node pm2Script --dump'));
    console.log((chalk as any).cyan('   显示服务程序进程的详细信息'));
    console.log((chalk as any).cyan('   node pm2Script --describe'));
    console.log((chalk as any).cyan('   停止服务程序以及其依赖的服务（mongodb，elasticsearch）'));
    console.log((chalk as any).cyan('   node pm2Script --stopAll'));
}
enum PM2API {
    None,
    Start,
    List,
    Stop,
    Delete,
    Reload,
    Dump,
    Kill,
    ForceKill,
    Describe,
    StopAll,
    Log,
}
function executePM2API(apiCode: PM2API, appName?: string) {
    const apiName = PM2API[apiCode];
    const targetApp = appName == null ? '全部' : appName;
    spinner.start();
    spinner.text = `执行PM2指令：${apiName}，目标app：${targetApp}`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.connect((connectErr: any) => {
            if (connectErr) {
                spinner.fail(`连接pm2实例失败：${connectErr.toString()}`);
                reject(0);
                process.exit();
            }
            (async () => {
                switch (apiCode) {
                    case PM2API.Start:
                        await pm2Start();
                        resolve(1);
                        break;
                    case PM2API.List:
                        await pm2List();
                        resolve(1);
                        break;
                    case PM2API.Stop:
                        await pm2Stop(appName);
                        resolve(1);
                        break;
                    case PM2API.Delete:
                        await pm2Delete(appName);
                        resolve(1);
                        break;
                    case PM2API.Reload:
                        await pm2Reload(appName);
                        resolve(1);
                        break;
                    case PM2API.Dump:
                        await pm2Dump();
                        resolve(1);
                        break;
                    case PM2API.Kill:
                        await pm2Kill();
                        resolve(1);
                        break;
                    case PM2API.ForceKill:
                        await forceKill();
                        resolve(1);
                        break;
                    case PM2API.Describe:
                        await pm2Describe(appName);
                        resolve(1);
                        break;
                    default:
                        spinner.fail(`不支持的PM2操作：${apiName}`);
                        reject(0);
                }
                if (spinner.isSpinning) {
                    spinner.succeed(`PM2命令（${apiName}）执行成功，断开pm2连接`);
                }
                pm2Inst.disconnect();
            })().catch((ex) => {
                if (spinner.isSpinning) {
                    spinner.fail(`PM2命令（${apiName}）执行失败：${ex.toString()}`);
                }
                pm2Inst.disconnect();
                process.exit();
            });
        });
    });
}

function pm2Start() {
    spinner.text = `执行PM2命令：start`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.start(path.join(__dirname, pm2ConfigFile),
            (error: any, apps: PM2.Proc[] | PM2.Proc) => {
                if (error) {
                    spinner.fail(`PM2命令（start）执行失败：${error.toString()}`);
                    reject(0);
                } else if (apps == null || (apps as PM2.Proc[]).length === 0) {
                    spinner.fail(`PM2命令（start）执行后，未获得任何App信息`);
                    reject(0);
                } else {
                    let allApps: PM2.Proc[];
                    if (!Array.isArray(apps)) {
                        allApps = [];
                        allApps.push(apps);
                    } else {
                        allApps = apps;
                    }
                    spinner.succeed(`PM2命令（start）执行成功，共有${allApps.length}个进程被启动`);
                    resolve(1);
                }
            });
    });
}

function pm2List() {
    spinner.text = `执行PM2命令：list`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.list(
            (error: any, apps: any) => {
                if (error) {
                    spinner.fail(`PM2命令（list）执行失败：${error.toString()}`);
                    reject(0);
                } else if (apps == null || (apps as any[]).length === 0) {
                    spinner.warn(`PM2命令（list）执行后，未获得任何App信息`);
                    reject(0);
                } else {
                    spinner.succeed(`PM2命令（list）执行成功`);
                    for (const app of apps) {
                        console.log((chalk as any).cyan(JSON.stringify({
                            pid: app.pid,
                            name: app.name,
                            status: app.pm2_env.status,
                            cpu: app.monit.cpu,
                            mem: app.monit.memory,
                            restart: app.pm2_env.restart_time,
                        })));
                    }
                    resolve(1);
                }
            });
    });
}
function pm2Stop(appName: string | undefined) {
    spinner.text = `执行PM2命令：stop，目标对象：${appName}`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.stop(appName,
            (error: any, apps: any) => {
                if (error) {
                    spinner.fail(`PM2命令（stop）执行失败：${error.toString()}。目标对象：${appName}`);
                    reject(0);
                } else if (apps == null || (apps as any[]).length === 0) {
                    spinner.warn(`PM2命令（stop）执行后，未获得任何App信息，目标对象：${appName}`);
                    reject(0);
                } else {
                    spinner.succeed(`PM2命令（stop）执行成功，目标对象：${appName}，共${(apps as any[]).length}进程被停止`);
                    resolve(1);
                }
            });
    });
}
function pm2Delete(appName: string | undefined) {
    spinner.text = `执行PM2命令：delete，目标对象：${appName}`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.delete(appName,
            (error: any, apps: any) => {
                if (error) {
                    spinner.fail(`PM2命令（delete）执行失败：${error.toString()}。目标对象：${appName}`);
                    reject(0);
                } else if (apps == null || (apps as any[]).length === 0) {
                    spinner.warn(`PM2命令（delete）执行后，未获得任何App信息，目标对象：${appName}`);
                    reject(0);
                } else {
                    spinner.succeed(`PM2命令（delete）执行成功，目标对象：${appName}，共${(apps as any[]).length}进程被删除`);
                    resolve(1);
                }
            });
    });

}
function pm2Reload(appName: string | undefined) {
    spinner.text = `执行PM2命令：reload，目标对象：${appName}`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.reload(appName, { updateEnv: true }, (error: any, apps: any) => {
            if (error) {
                spinner.fail(`PM2命令（reload）执行执行失败：${error.toString()}。目标对象：${appName}`);
                reject(0);
            } else if (apps == null || (apps as any[]).length === 0) {
                spinner.warn(`PM2命令（reload）执行后，未获得任何App信息，目标对象：${appName}`);
                reject(0);
            } else {
                let allApps: PM2.Proc[];
                if (!Array.isArray(apps)) {
                    allApps = [];
                    allApps.push(apps);
                } else {
                    allApps = apps;
                }
                spinner.succeed(`PM2命令（reload）执行成功，目标对象：${appName}，共${allApps.length}进程被重启`);
                resolve(1);
            }
        });
    });

}
function pm2Dump() {
    spinner.text = `执行PM2命令：dump`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.dump(
            (error: any) => {
                if (error) {
                    spinner.fail(`PM2命令（dump）执行执行失败：${error.toString()}`);
                    reject(0);
                } else {
                    spinner.succeed(`PM2命令（dump）执行成功。`);
                    resolve(1);
                }
            });
    });
}
function pm2Kill() {
    spinner.text = `执行PM2命令：kill`;
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.killDaemon((error: Error, procDesc: PM2.ProcessDescription) => {
            if (error) {
                spinner.fail(`PM2命令（kill）执行失败：${error.toString()}`);
                reject(0);
            } else {
                spinner.succeed(`PM2命令（kill）执行成功。`);
                resolve(1);
            }
        });
    });
}
function pm2Describe(appName: string | undefined) {
    return new Promise((resolve: any, reject: any) => {
        pm2Inst.describe(appName, (error: any, apps: PM2.ProcessDescription[]) => {
            if (error) {
                spinner.fail(`PM2命令（kill）执行失败：${error.toString()}。目标对象：${appName}`);
                reject(0);
            } else if (apps == null || apps.length === 0) {
                spinner.warn(`PM2命令（describe）执行后，未获得任何App信息，目标对象：${appName}`);
                reject(0);
            } else {
                spinner.succeed(`PM2命令（describe）执行成功。目标对象：${appName}`);
                for (const app of apps) {
                    console.log((chalk as any).cyan(JSON.stringify(app)));
                }
                resolve(1);
            }
        });
    });
}
function pm2Log(pm2Name: string) {
    const env = Object.create(process.env);
    env.PM2_HOME = pm2Name;
    const pm2Logs = spawnSync('./node_modules/pm2/bin/pm2', ['logs', '--nostream', '--lines', '50'], { env });
    console.log((chalk as any).cyan(pm2Logs.stdout.toString()));
}
function forceKill() {
    spinner.text = `执行系统命令：pkill`;
    return new Promise((resolve: any, reject: any) => {
        const killPM2 = spawnSync('pkill', ['-f', pm2InstName], { encoding: 'utf8' });
        let errorMsg = '';
        if (killPM2.stdout != null) {
            spinner.succeed(`强制停止PM2（pkill）执行成功：${killPM2.stdout}`);
            resolve(1);
        } else {
            if (killPM2.stderr != null) {
                errorMsg += killPM2.stderr;
            }
            if (killPM2.error != null) {
                errorMsg += killPM2.error;
            }
            spinner.fail(`强制停止PM2（pkill）执行失败：${errorMsg}`);
            reject(0);
        }
    });
}

/**
 * check MongoDB status, if not started, start it
 * @param dbFolder -- mongodb folder name
 * @param spinnerRef
 */
function checkDBStatus(dbFolder: string, spinnerRef: any) {
    if (spinnerRef != null) { spinnerRef.start(); }
    if (file.existsSync(path.join(parentDir, dbFolder))) {
        const mongodProc = spawnSync('pgrep', ['-f', dbFolder]);
        const psOutput = mongodProc.stdout.toString();
        if (isDebugMode) {
            if (spinnerRef != null) {
                spinnerRef.clear();
            }
            console.log((chalk as any).cyan(`mongod process: ${psOutput}`));
        }
        if (psOutput == null || psOutput === '') {
            if (!file.existsSync(dbDataPath) ||
                !file.existsSync(dbLogPath)) {
                if (spinnerRef != null) {
                    spinnerRef.fail(`MongoDB数据目录不存在：${dbDataPath} 和 ${dbLogPath}`);
                }
            } else {
                const mongodStart = spawnSync(`../${dbFolder}/bin/mongod`,
                    ['--dbpath', dbDataPath, '--logpath', dbLogPath, '--fork']);
                if (isDebugMode) {
                    if (spinnerRef != null) {
                        spinnerRef.clear();
                    }
                    console.log((chalk as any).cyan(mongodStart));
                }
                spinnerRef.succeed('MongoDB启动完毕');
            }
        } else {
            if (spinnerRef != null) {
                spinnerRef.succeed('MongoDB正在运行');
            }
        }
    } else {
        const mongodCmd = spawnSync('command', ['-v', 'mongod'], { encoding: 'utf8' });
        if (isDebugMode) {
            if (spinnerRef != null) {
                spinnerRef.clear();
            }
            console.log((chalk as any).cyan(`command output: ${mongodCmd.stdout}`));
        }
        if (mongodCmd.stdout == null || mongodCmd.stdout === '') {
            if (spinnerRef != null) {
                spinnerRef = spinnerRef.warn('未在本机发现mongod命令，也未发现上层目录中安装了mongodb');
            }
        } else {
            const mongodVersion = spawnSync('mongod', ['-version'], { encoding: 'utf8' });
            if (mongodVersion.stdout != null && mongodVersion.stdout.indexOf(dbVersion) >= 0) {
                if (spinnerRef != null) {
                    spinnerRef = spinnerRef.warn(`mongod命令版本不匹配： ${dbVersion}`);
                }
            } else {
                const mongodStart = spawnSync(`mongod`,
                    ['--dbpath', dbDataPath, '--logpath', dbLogPath, '--fork']);
                if (isDebugMode) {
                    if (spinnerRef != null) {
                        spinnerRef.clear();
                    }
                    console.log((chalk as any).cyan(mongodStart));
                }
                if (spinnerRef != null) {
                    spinnerRef.succeed('MongoDB启动完毕');
                }
            }
        }
    }
}

/**
 * stop dependant services, i.e. mongodb and relastic search
 * @param keywords -- keywords of the dependant process
 * @param spinnerRef
 */
function stopDependentServices(keywords: string[], spinnerRef: any) {
    if (spinnerRef != null) { spinnerRef.start(); }
    keywords.forEach((key) => {
        spawnSync('pkill', ['-2', '-f', key], { encoding: 'utf8' });
    });
    if (spinnerRef != null) {
        spinnerRef.succeed('停止服务完毕: Mongodb, ElasticSearch');
    }
}

const parentDir = path.join(__dirname, '..');

let pm2ServerAppName: string = '';
let pm2InstName: string = '';
let pm2Inst: any = '';
let pm2ConfigFile = 'pm2.config.js';
let paramApiName: PM2API = PM2API.None;
let needHelp = false;
let isDebugMode = false;
let dbVersion = 'v3.6.4';
let dbDataPath = path.join(parentDir, 'data/db');
let dbLogPath = path.join(parentDir, 'data/log/taskManager_db.log');
if (process.argv) {
    paramApiName = PM2API.Start;
}
for (const value of process.argv) {
    if (/^--pm2Start$/i.test(value) || /^--start$/i.test(value)) {
        paramApiName = PM2API.Start;
    } else if (/^--pm2List$/i.test(value) || /^--list$/i.test(value)) {
        paramApiName = PM2API.List;
    } else if (/^--pm2Stop$/i.test(value) || /^--stop$/i.test(value)) {
        paramApiName = PM2API.Stop;
    } else if (/^--pm2Reload$/i.test(value) || /^--reload$/i.test(value)) {
        paramApiName = PM2API.Reload;
    } else if (/^--pm2Delete$/i.test(value) || /^--delete$/i.test(value)) {
        paramApiName = PM2API.Delete;
    } else if (/^--pm2Kill$/i.test(value) || /^--kill$/i.test(value)) {
        paramApiName = PM2API.Kill;
    } else if (/^--pm2Describe$/i.test(value) || /^--describe$/i.test(value)) {
        paramApiName = PM2API.Describe;
    } else if (/^--forceKill$/i.test(value)) {
        paramApiName = PM2API.ForceKill;
    } else if (/^--StopAll$/i.test(value)) {
        paramApiName = PM2API.StopAll;
    } else if (/^--pm2Log$/i.test(value) || /^--log$/i.test(value)) {
        paramApiName = PM2API.Log;
    } else if (/^--pm2InstName:.+$/i.test(value)) {
        pm2InstName = value.split(':')[1];
    } else if (/^--pm2Config:.+$/i.test(value) || /^--config:.+$/i.test(value)) {
        pm2ConfigFile = value.split(':')[1];
    } else if (/^--help$/i.test(value) || /^--h$/i.test(value)) {
        needHelp = true;
    } else if (/^--debugMode$/i.test(value) || /^--debug$/i.test(value)) {
        isDebugMode = true;
    } else if (/^--dbVersion:.+$/i.test(value)) {
        dbVersion = value.split(':')[1];
    } else if (/^--dbDataPath:.+$/i.test(value)) {
        dbDataPath = value.split(':')[1];
    } else if (/^--dbLogPath:.+$/i.test(value)) {
        dbLogPath = value.split(':')[1];
    } else if (/^--/i.test(value) || /^-/i.test(value)) {
        console.log((chalk as any).red(`此参数不支持：${value}`));
        process.exit();
    }
}

if (needHelp || paramApiName === PM2API.None) {
    printHelp();
    process.exit();
}

const spinner = (ora as any)().start();

// check the dependencies
let result = true;
const requiredFileOrDir: string[] = ['taskManager.js', pm2ConfigFile, 'client'];
for (const currentFileOrDir of requiredFileOrDir) {
    spinner.text = `检测服务程序运行所需文件： ${currentFileOrDir}`;
    const filePath = path.join(__dirname, currentFileOrDir);
    if (!file.existsSync(filePath)) {
        result = false;
        spinner.fail(`发现缺失文件：${filePath}，请重新安装或者补齐缺失的文件。`);
        process.exit();
    }
}
spinner.text = `检测服务程序配置文件名称格式： ${pm2ConfigFile}`;
if (!/^.+\.config.js$/.test(pm2ConfigFile)) {
    spinner.fail(`配置文件名称（${pm2ConfigFile}）格式错误，请参照：<any name>.config.js的格式。`);
    process.exit();
}

spinner.text = '检测服务程序依赖组件：node_modules';
const nodeModuleFolder = path.join(__dirname, 'node_modules');
if (!file.existsSync(nodeModuleFolder)) {
    result = false;
    spinner.fail('node_modules文件夹缺失。');
}

spinner.text = '检测服务程序依赖组件：pm2';
const pm2Module = path.join(nodeModuleFolder, 'pm2');
if (!file.existsSync(pm2Module)) {
    result = false;
    spinner.fail('pm2依赖缺失。');
}
if (result === false) {
    console.log((chalk as any).yellow(
        // tslint:disable-next-line:max-line-length
        '请确认是否成功运行过 cnpm run prodInstall 指令，此命令所需文件：package-lock.json'));
    process.exit();
}
spinner.succeed('服务程序依赖组件检测完毕');

// execute pm2 actions
(async () => {
    const PM2Config = await __non_webpack_require__(path.join(__dirname, pm2ConfigFile));
    pm2ServerAppName = PM2Config.AppName;
    pm2InstName = PM2Config.PM2InstName;
    if (paramApiName as any === PM2API.Start || paramApiName as any === PM2API.Reload) {
        checkDBStatus(PM2Config.DBFolder, spinner);
    }

    // copy the env items of pm2.config.js into process.env which will be used by reload action
    for (const appConfig of PM2Config.apps) {
        if ((appConfig as PM2.StartOptions).env != null) {
            Object.keys(appConfig.env).forEach((key) => {
                process.env[key] = appConfig.env[key];
            });
        }
    }
    pm2Inst = new (PM2 as any).custom({ pm2_home: pm2InstName });
    if (paramApiName === PM2API.Start) {
        await executePM2API(PM2API.Start);
        await executePM2API(PM2API.List);
    } else if (paramApiName === PM2API.List) {
        await executePM2API(PM2API.List);
    } else if (paramApiName === PM2API.Stop || paramApiName === PM2API.StopAll) {
        await executePM2API(PM2API.Stop, pm2ServerAppName);
        if (paramApiName === PM2API.StopAll) {
            stopDependentServices([PM2Config.DBFolder, PM2Config.ESFolder], spinner);
        }
    } else if (paramApiName === PM2API.Reload) {
        await executePM2API(PM2API.Reload, pm2ServerAppName);
        await executePM2API(PM2API.List);
    } else if (paramApiName === PM2API.Delete) {
        await executePM2API(PM2API.Delete, pm2ServerAppName);
    } else if (paramApiName === PM2API.Kill) {
        await executePM2API(PM2API.Kill);
    } else if (paramApiName === PM2API.ForceKill) {
        await executePM2API(PM2API.ForceKill);
    } else if (paramApiName === PM2API.Describe) {
        await executePM2API(PM2API.Describe, pm2ServerAppName);
    } else if (paramApiName === PM2API.Log) {
        pm2Log(pm2InstName);
    } else {
        spinner.fail(`发现不支持的操作参数：${paramApiName}`);
        process.exit();
    }
    spinner.clear();
    process.exit();
})().catch((ex) => {
    spinner.fail(`执行异常：${ex.toString()}`);
    process.exit();
});
