// Organize Cloverleaf nodes into a hierarcy.
// There are several ways to do this, each requires
// its own function.


// Seperate the input nodes from the output nodes at the
// highest level.  Since the value of this split is to view
// traffic inbound to Cloverleaf vs outbound from Cloverleaf,
// nodes with _dest_ are filtered out: these inter-site
// traffic within Cloverleaf.
//
const inoutSplit = (nodeList) => {

  const root = {
    name: "inout",
    children: []
  }

  let inoutObj, siteObj, procObj, nodeObj;
  let inout,    site,    proc,    node;
  for (let entry in nodeList) {
    if (entry.includes('_dest_')) {
      console.log('Dropping entry', entry);
    } else {
      [node, site, inout, proc] = entry.split('_');

      inoutObj = root.children.find(child => child.name === inout);
      if (!inoutObj) {
        inoutObj = {name: inout, children: []}
        root.children.push(inoutObj);
      }

      siteObj = inoutObj.children.find(child => child.name === site);
      if (!siteObj) {
        siteObj = {name: site, children: []}
        inoutObj.children.push(siteObj);
      }

      procObj = siteObj.children.find(child => child.name === proc);
      if (!procObj) {
        procObj = {name: proc, children: []};
        siteObj.children.push(procObj);
      }

      nodeObj = procObj.children.find(child => child.name === node);
      if (!nodeObj) {
        nodeObj = {name: node, size: nodeList[entry]}
        procObj.children.push(nodeObj);
      } else {
        console.error('Seems we found the same node for', entry, 'twice');
      }
    }
  }
  return root;
}


// The goal of this arrangement is to view traffic volumes by OS process.
// It will help us balance node volume among processes.
// The _dest_ nodes are used in this case because they consume process
// resources the same way other nodes do.
//
const procSplit = (nodeList) => {

  const root = {
    name: "allnodes",
    children: []
  };

  const prefixMap = {
    j: 'jail',
    c: 'court',
    p: 'probation',
    m: 'misc',
    s: 'subpoena'
  };

  let inout, site, proc, node;
  for (let entry in nodeList) {
    if (entry.includes('_dest_')) {
      const matches = entry.match(/([a-z]+)_[a-z]+_dest_(in|out)_([a-z])(\d\d)/);
      //                              1                    2        3      4
      //                    sample:  pimsa_court_dest_out_p04
      node = matches(1);
      inout = matches(2);
      site = prefixMap[matches(3)];
      proc = [matches(3), matches(4)].join('');
    } else {
      [node, site, inout, proc] = entry.split('_');
    }

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

    let inoutObj = procObj.children.find(child => child.name === inout);
    if (!inoutObj) {
      inoutObj = {name: inout, children: [] };
      procObj.children.push(inoutObj);
    }

    let nodeObj = inoutObj.children.find(child => child.name === node);
    if (!nodeObj) {
      nodeObj = {name: node, size: nodeList[entry]}
      inoutObj.children.push(nodeObj);
    } else {
      console.error('Seems we found the same node for', entry, 'twice');
    }
  }
  return root;
}

module.exports = { inoutSplit, procSplit };
