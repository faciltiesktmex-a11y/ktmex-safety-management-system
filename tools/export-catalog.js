const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname,'..');
const output = process.argv[2] ? path.resolve(process.cwd(),process.argv[2]) : path.join(root,'data','catalog-draft.json');
const context = vm.createContext({window:{}});
new vm.Script(fs.readFileSync(path.join(root,'assets','catalog.js'),'utf8')).runInContext(context);
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(context.window.KTMEX_CATALOG,null,2)+'\n','utf8');
console.log(output);
