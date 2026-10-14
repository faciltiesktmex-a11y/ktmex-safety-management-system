const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function browserContext(extra = {}) {
  const context = {
    window: {},
    console,
    setTimeout, clearTimeout,
    sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
    localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
    location: { pathname: '/index.html' },
    document: { addEventListener(){}, querySelectorAll(){ return []; }, getElementById(){ return null; } },
    ...extra
  };
  context.window = Object.assign(context.window, context);
  return vm.createContext(context);
}

function runAsset(relative, context) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  new vm.Script(source, { filename: relative }).runInContext(context);
  return context;
}

module.exports = { ROOT, browserContext, runAsset };

