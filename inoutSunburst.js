const { ipcRenderer } = require('electron');
const d3 = require("d3");

const svg = d3.select("svg"),
      width = svg.attr("width"),
      height = svg.attr("height"),
      radius = width / 2;

const format = d3.format(",d");
const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0)/ 2, 0.005))
          .padRadius(radius / 2)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1 - 1);

function autoBox() {
  const {x, y, width, height} = this.getBBox();
  return [x, y, width, height];
}

let allData = null;
let inout = 'in';
let siteName = 'all';

const createSunburst = (data) => {

  const hierarchyRoot = d3.hierarchy(data)
    .sum(d =>  d.size)
    .sort((a,b) => b.value - a.value);

  const root = d3.partition().size([2*Math.PI, radius])(hierarchyRoot);
  console.log('root x1:', root.x1, 'root y1', root.y1);
//  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  const color = d3.scaleOrdinal(d3.schemeDark2);

  svg.selectAll('g').remove();
  svg.style("max-width", "100%")
     .style("height", "auto")
     .style("font", "10px sans-serif")
     .style("margin", "5px");

  svg.append('g')
     .attr("fill-opacity", 0.6)
   .selectAll("path")
   .data(root.descendants().filter(d => d.depth))
   .enter().append("path")
     .attr("fill", d => { while (d.depth > 3) d = d.parent; return color(d.data.name)})
//     .attr("fill", d => color(d.depth > 0 ? d.parent.data.name : d.data.name))
     .attr("d", arc)
   .append("title")
     .text(d => `${d.ancestors().map(d => d.data.name).reverse().join('/')}\n${format(d.value)}`);

  svg.append('g')
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1)/2 * (d.x1 - d.x0) > 10)
                            .filter(d => (d.y0 + d.y1)/2 * (d.x1 - d.x0) < 30))
    .enter().append("text")
      .attr("transform", function(d) {
        const x = (d.x0 + d.x1)/2 * 180 / Math.PI;
        const y = (d.y0 + d.y1)/2;
        return `rotate(${x-90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.2em")
    .text(d => d.data.name)

  svg.append('g')
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1)/2 * (d.x1 - d.x0) > 30))
    .enter().append("text")
      .attr("transform", function(d) {
        const x = (d.x0 + d.x1)/2 * 180 / Math.PI;
        const y = (d.y0 + d.y1)/2;
        return `rotate(${x-90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "-0.2em")
    .text(d => d.data.name)

  svg.append('g')
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1)/2 * (d.x1 - d.x0) > 30))
    .enter().append("text")
      .attr("transform", function(d) {
        const x = (d.x0 + d.x1)/2 * 180 / Math.PI;
        const y = (d.y0 + d.y1)/2;
        return `rotate(${x-90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.85em")
    .text(d => format(d.value));

  svg.attr("viewBox", autoBox);
}

ipcRenderer.on('newdata', (event, hierarchy) => {
  console.log('Received newdata event.');
  console.log('hierarchy = ', hierarchy);
  allData = hierarchy;
  createSunburst(hierarchy);
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
  createSunburst(data);
  
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
