const sidebarElements = document.querySelectorAll('.sidebar .element');
const canvas = document.querySelector('.canvas');
const propForm = document.getElementById('propForm');
const propText = document.getElementById('propText');
const propFontSize = document.getElementById('propFontSize');
const propTextColor = document.getElementById('propTextColor');
const propBgColor = document.getElementById('propBgColor');
const propImageURL = document.getElementById('propImageURL');
const applyBtn = document.getElementById('applyBtn');
const deleteBtn = document.getElementById('deleteBtn');

let selectedElement = null;
let dragOffset = {x:0, y:0};
let isDraggingCanvasElem = false;

function clearSelection() {
  if(selectedElement) selectedElement.classList.remove('selected');
  selectedElement = null;
  propText.value = '';
  propFontSize.value = '';
  propTextColor.value = '#000000';
  propBgColor.value = '#ffffff';
  propImageURL.value = '';
  applyBtn.disabled = true;
  deleteBtn.disabled = true;
}

function populateForm(elem) {
  applyBtn.disabled = false;
  deleteBtn.disabled = false;
  if(elem.tagName === 'IMG') {
    propText.value = '';
    propFontSize.value = '';
    propTextColor.value = '#000000';
    propBgColor.value = '#ffffff';
    propImageURL.value = elem.src || '';
    propText.disabled = true;
    propFontSize.disabled = true;
    propTextColor.disabled = true;
    propBgColor.disabled = true;
    propImageURL.disabled = false;
  } else {
    propText.disabled = false;
    propFontSize.disabled = false;
    propTextColor.disabled = false;
    propBgColor.disabled = false;
    propImageURL.disabled = true;
    propText.value = elem.textContent || '';
    const computedStyle = window.getComputedStyle(elem);
    propFontSize.value = parseInt(computedStyle.fontSize) || 14;
    propTextColor.value = rgbToHex(computedStyle.color);
    propBgColor.value = rgbToHex(computedStyle.backgroundColor) || '#ffffff';
    propImageURL.value = '';
  }
}

function rgbToHex(rgb) {
  if(!rgb || rgb === 'transparent') return '#000000';
  const result = rgb.match(/\d+/g);
  if(!result) return '#000000';
  return '#' + result.slice(0,3).map(x => (+x).toString(16).padStart(2,'0')).join('');
}

// Drag from sidebar
sidebarElements.forEach(elem => {
  elem.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', elem.dataset.type);
  });
});

// Drag over canvas
canvas.addEventListener('dragover', e => {
  e.preventDefault();
});

// Drop on canvas
canvas.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('text/plain');
  if(!type) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let newElem;
  if(type === 'text') {
    newElem = document.createElement('div');
    newElem.textContent = 'Sample Text';
    newElem.style.fontSize = '16px';
    newElem.style.color = '#000000';
    newElem.style.backgroundColor = '#ffffff';
  } else if(type === 'image') {
    newElem = document.createElement('img');
    newElem.src = 'https://via.placeholder.com/150?text=Image';
    newElem.style.maxWidth = '200px';
    newElem.style.maxHeight = '150px';
    newElem.style.display = 'block';
  } else if(type === 'button') {
    newElem = document.createElement('button');
    newElem.textContent = 'Click Me';
    newElem.style.fontSize = '16px';
    newElem.style.color = '#000000';
    newElem.style.backgroundColor = '#e7e7e7';
    newElem.style.border = '1px solid #ccc';
    newElem.style.borderRadius = '4px';
    newElem.style.padding = '6px 12px';
    newElem.style.cursor = 'pointer';
  }

  newElem.classList.add('draggable');
  newElem.style.left = x + 'px';
  newElem.style.top = y + 'px';
  newElem.style.position = 'absolute';

  canvas.appendChild(newElem);
  selectElement(newElem);
});

// Select element on canvas
canvas.addEventListener('click', e => {
  if(e.target === canvas) {
    clearSelection();
    return;
  }
  if(e.target.classList.contains('draggable')) {
    selectElement(e.target);
  }
});

function selectElement(elem) {
  if(selectedElement) selectedElement.classList.remove('selected');
  selectedElement = elem;
  elem.classList.add('selected');
  populateForm(elem);
}

// Apply changes from form
propForm.addEventListener('submit', e => {
  e.preventDefault();
  if(!selectedElement) return;

  if(selectedElement.tagName === 'IMG') {
    if(propImageURL.value.trim() !== '') {
      selectedElement.src = propImageURL.value.trim();
    }
  } else {
    selectedElement.textContent = propText.value;
    selectedElement.style.fontSize = propFontSize.value + 'px';
    selectedElement.style.color = propTextColor.value;
    selectedElement.style.backgroundColor = propBgColor.value;
  }
});

// Live preview image URL
propImageURL.addEventListener('input', () => {
  if(selectedElement && selectedElement.tagName === 'IMG') {
    selectedElement.src = propImageURL.value || 'https://via.placeholder.com/150?text=Image';
  }
});

// Drag element inside canvas
canvas.addEventListener('mousedown', e => {
  if(e.target.classList.contains('draggable')) {
    selectedElement = e.target;
    selectElement(selectedElement);
    isDraggingCanvasElem = true;
    const rect = selectedElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    e.preventDefault();
  }
});
window.addEventListener('mousemove', e => {
  if(isDraggingCanvasElem && selectedElement) {
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;

    x = Math.max(0, Math.min(x, canvas.clientWidth - selectedElement.offsetWidth));
    y = Math.max(0, Math.min(y, canvas.clientHeight - selectedElement.offsetHeight));

    selectedElement.style.left = x + 'px';
    selectedElement.style.top = y + 'px';
  }
});
window.addEventListener('mouseup', e => {
  isDraggingCanvasElem = false;
});

// Delete selected element
deleteBtn.addEventListener('click', () => {
  if(selectedElement) {
    selectedElement.remove();
    clearSelection();
  }
});
