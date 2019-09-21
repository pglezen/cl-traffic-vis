const { ipcRenderer } = require('electron');
const d3 = require("d3");

const svg = d3.select("svg"),
      width = svg.attr("width"),
      height = svg.attr("height");

const fader = color => d3.interpolateRgb(color, "#fff")(0.2);
const color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));
const format = d3.format(",d");

let allData = null;
let inout = 'in';
let siteName = 'all';

const treemap = d3.treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .round(true)
  .paddingInner(1);

const createTreemap = (data) => {
  const root = d3.hierarchy(data)
    .eachBefore(d => { d.data.id = (d.parent ? `${d.parent.data.id}.` : '') + d.data.name})
    .sum(d =>  d.size)
    .sort((a,b) => b.height - a.height || b.value - a.value)

  console.log('root height:', root.height, 'root depth', root.depth);
  treemap(root);
  console.log('root x1:', root.x1, 'root y1', root.y1);

  svg.selectAll('g').remove();

  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

  cell.append('rect')
    .attr('id', d => d.data.id)
    .attr('width',  d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill',   d => color(d.parent.data.id));

  cell.append('clipPath')
    .attr('id', d => `clip-${d.data.id}`)
    .append('use')
      .attr('xlink:href', d => `#${d.data.id}`);

  cell.append('text')
    .attr('clip-path', d => `url(#clip-${d.data.id})`)
    .selectAll('tspan')
      .data(d => [d.data.id.split('.').slice(4).concat(format(d.value)).join(' - ')])
      .enter().append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i*14)
      .text(d => d);

  cell.append('title').text(d => `${d.data.id}\n${format(d.value)}`);

}

ipcRenderer.on('newdata', (event, hierarchy) => {
  console.log('Received newdata event.');
  console.log('hierarchy = ', hierarchy);
  allData = hierarchy;
  createTreemap(hierarchy);
})

const updateView = () => {
  console.log('changeSite function invoked with', siteName);
  let data = allData;
  let inoutChildren = allData.children
  if (inout !== 'inout') {
    inoutChildren = [ allData.children.find(child => child.name === inout) ];
  }
  if (siteName !== 'all') {
    data = {
      name: 'inout',
      children: []
    }
    if (inout.includes('in')) {
      data.children.push({
        name: 'in',
        children: inoutChildren.find(node => node.name === 'in')
                               .children.filter(node => node.name === siteName)
      })
    }
    if (inout.includes('out')) {
      data.children.push({
        name: 'out',
        children: inoutChildren.find(node => node.name === 'out')
                               .children.filter(node => node.name === siteName)
      })
    }
  } else {
    data = {
      name: 'inout',
      children: inoutChildren
    }
  }
  createTreemap(data);
  
  const inoutLabel = document.getElementById("direction");
  const labels = {
    inout: 'Both Inbound and Outbound',
    in: 'Inbound',
    out: 'Outbound'
  }
  inoutLabel.innerHTML = labels[inout];
}

function changeSite(name) {
  siteName = name;
  updateView();
}

function changeDirection(direction) {
  inout = direction;
  updateView();
}

d3.selectAll('form#site input')
  .data(['all', 'jail', 'court', 'probation', 'misc', 'subpoena'])
  .on('change', changeSite);


d3.selectAll('form#direction input')
  .data(['inout', 'in', 'out'])
  .on('change', changeDirection)
