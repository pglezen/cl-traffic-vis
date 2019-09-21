const fs = require('fs');
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

const d3 = require('d3');
const {inoutSplit, procSplit} = require('./nodeHierarchy');
const normalizer = require('./normalizer');

const dataFile = dialog.showOpenDialogSync({
  title: "Traffic Data",
  defaultPath: __dirname,
  filters: [{name: 'JSON', extensions: ['json'] }],
  properties: ['openFile']});

let choices = [];
if (dataFile.length) {
  const flatListStr = fs.readFileSync(dataFile[0], 'utf8');
  const flatList = JSON.parse(flatListStr);
  for (let [name, value] of Object.entries(flatList)) {
    choices.push({name, value});
  }
    
  const form = d3.select('form');
  const divs = form.selectAll('div')
    .data(choices)
    .enter().append((d, i) => {
      const div = document.createElement('div');
      const inputElement = document.createElement('input');
      inputElement.type = 'checkbox';
      inputElement.id   = d.name;
      inputElement.name = d.name;
      inputElement.defaultChecked = true;

      const labelElement = document.createElement('label');
      labelElement.htmlFor = d.name;
      labelElement.innerHTML = `${i+1} ${d.name} ${d.value}`;

      div.appendChild(inputElement);
      div.appendChild(labelElement);
      return div;
    });
} else {
  console.log('No data file was chosen.');
}

let checkedSelection = null;
const viewSelectionButton = document.getElementById('viewSelection');
viewSelectionButton.onclick = function(event) {
  checkedSelection = d3.selectAll('input[type=checkbox]').filter(':checked');
  console.log('Clicked View Selection. Number seleced', checkedSelection.size());
  let filteredNodes = {};
  checkedSelection.each(function() {
    let { name, value } = this.parentNode.__data__;
    console.log('Encountered node', name, value);
    if (normalizer[name]) {
      console.log('Normalizing', name, 'to', normalizer[name]);
      name = normalizer[name];
    }
    filteredNodes[name] = value;
  });
  const hierarchy = inoutSplit(filteredNodes);
  ipcRenderer.send('filter:done', hierarchy);
}
  
