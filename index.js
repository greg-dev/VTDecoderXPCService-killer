'use strict';

const { exec } = require('child_process');

const processName = 'VTDecoderXPCService';
const interval = 10000;

function now() {
  const dt = new Date();
  const time = [
    dt.getHours(), dt.getMinutes(), dt.getSeconds()
  ].map(part => part.toString().padStart(2, '0')).join(':');
  return time;
}

function getProcessesIds(processName) {
  const filter = `grep ${processName}`;
  const filteredListCommand = `ps aux | ${filter}`;
  return new Promise((resolve, reject) => {
    exec(filteredListCommand, (error, stdout) => {
      if (error) {
        reject([]);
        return;
      }
      const lines = stdout.split(/\r?\n/).filter(line => !line.includes(filter));
      const ids = lines
        .map(line => line.trim()
        .replace(/  +/g, ' ')
        .split(' ')[1])
        .filter(id => id);
      resolve(ids);
    });
  });
}

async function killProcesses(processName, interval) {
  const ids = await getProcessesIds(processName);
  ids.forEach(id => {
    console.log(`${now()} Killing process ${id}`);
    exec(`kill -9 ${id}`);
  });

  setTimeout(function() {
    killProcesses(processName, interval);
  }, interval);  
}

killProcesses(processName, interval);
