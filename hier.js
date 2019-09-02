const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Expecting input filename as an argument.')
  process.exit(1);
}

const datafile = process.argv[2];

try {
  const j1str = fs.readFileSync(datafile, 'utf8');
  const j1 = JSON.parse(j1str);
  const root = {
    name: "inbound",
    children: []
  }

  let inout, site, proc, node;
  for (let entry in j1) {
    [node, site, inout, proc] = entry.split('_');

    let siteObj = root.children.find(child => child.name === site);
    if (!siteObj) {
      siteObj = {name: site, children: []}
      root.children.push(siteObj);
    }

    let procObj = siteObj.children.find(child => child.name === proc);
    if (!procObj) {
      procObj = {name: proc, children: []};
      siteObj.children.push(procObj);
    }

    let nodeObj = procObj.children.find(child => child.name === node);
    if (!nodeObj) {
      nodeObj = {name: node, size: j1[entry]}
      procObj.children.push(nodeObj);
    } else {
      console.error('Seems we found the same node for', entry, 'twice');
    }
  }
  console.log(JSON.stringify(root, null, 2));
} catch (err) {
  switch(err.code) {
    case 'ENOENT':
      console.error('Cannot read file', err.path);
      break;
    default:
      console.error('Error Object', JSON.stringify(err));
  }
}

