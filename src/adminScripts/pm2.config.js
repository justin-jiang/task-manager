var os = require('os');
var fs = require('fs');
var path = require('path');
var cpuCounts = os.cpus().length;
var maxInsts = 8;
var maxMem = '1G';
var maxRestartCount = 5;
var minUptime = 30 * 60 * 1000; // ms
var restartDelay = 10 * 1000; // ms
var dt = new Date();
var monStr = (dt.getMonth() + 1).toString();
if (monStr.length == 1) {
    monStr = '0' + monStr;
}
var dayStr = dt.getDate().toString();
if (dayStr.length == 1) {
    dayStr = '0' + dayStr;
}
var logNameDateSuffix = dt.getFullYear().toString() + '-' + monStr + '-' + dayStr;

if (cpuCounts > maxInsts) {
    cpuCounts = maxInsts;
}

// !!! please be careful to change the following variables value !!!
// these value will be used in start script of pm2Manager.sh and installation script of oneboxInstaller.sh
// please keep them consistence
const APP_NAME = 'taskManager';
// the INST_NAME value should keep consistant with the one in pm2Manager.sh
const INST_NAME = 'pm2_taskManager';
// !!! end !!!

const APP_LOG = './logs/pm2/' + APP_NAME + '_' + logNameDateSuffix + '.log';
if (fs.existsSync('./logs/pm2')) {
    // remove overdue pm2 log files
    fs.readdir('./logs/pm2', function(err, files) {
        if (err) {
            console.error('Could not list the directory.', err);
            return;
        }
        files.forEach(function(file) {
            const filePath = path.join('./logs/pm2', file);
            fs.stat(filePath, function(error, stat) {
                if (error) {
                    console.error('Error stating file:' + filePath, error);
                    return;
                }

                if (stat.isFile()) {
                    const dateStartIndex = file.lastIndexOf('_');
                    const dateEndIndex = file.lastIndexOf('.log');
                    var oldDateTime;
                    var currentDate = new Date();
                    var overdueTime = currentDate.setDate(currentDate.getDate() - 7);
                    // check whether log file is overdued
                    if (dateStartIndex >= 0 && dateEndIndex >= 0) {
                        const oldDate = new Date(file.substring(dateStartIndex + 1, dateEndIndex));
                        oldDateTime = oldDate.getTime();
                    }
                    if (!isNaN(oldDateTime) && oldDateTime <= overdueTime) {
                        fs.unlink(filePath, function(error) {
                            if (error) {
                                console.error('failed to delete file:' + filePath, error);
                            } else {
                                console.info('success to delete file:' + filePath);
                            }
                        })
                    }
                }
            });
        });
    });
}
module.exports = {
    apps: [
        {
            name: APP_NAME,
            script: './taskManager.js',
            instances: cpuCounts,
            exec_mode: 'cluster',
            max_memory_restart: maxMem,
            max_restarts: maxRestartCount,
            min_uptime: minUptime,
            restart_delay: restartDelay,
            merge_logs: true,
            error_file: APP_LOG,
            out_file: APP_LOG,
            // default environment loaded by pm2 and transfer to App
            env: {
                // the host in request which can get the health data
                // which is used to protect the health data that only the
                // specified host can get the data
                // e.g. if you only allow 127.0.0.1 host to get health data
                // the value of HealthCheckHost should be '127\.0\.0\.1'
                healthCheckHost: '.*',
                
                // the http port which used by App
                appPort: '8081',
                
                // whether start App in debug mode
                debugMode: false,
               
                // Mongoose poolsize
                poolSize: 5,
                
                // Mongodb connection address
                mongoDBURLs: '127.0.0.1:27017',
               
                // whether the logger uses UTC time
                utcLogTime: false,
                
                // Mongodb replicaSet Name which is required if target mongodb support ReplicaSet
                // ReplicaSetName:'rs',
                
                // the timespan in which the executor must pay the margin after applying
                applyingDeadline: 30 * 60 * 1000,
            },
        },
    ]
}
module.exports.AppName = APP_NAME;
module.exports.PM2InstName = INST_NAME;
// please keep the following value consistence with the ones in oneboxInstaller.sh
module.exports.DBFolder = 'mongodb-3.6.4';
