// ===== GLOBAL DEĞİŞKENLER ===== //

let elementCounter = 0;

let selectedElement = null;
let canvasData = [];

const GRID_SIZE = 20;
const GRID_SNAP = true;



// ===== ELEMENT TİPLERİ VARSAYILAN BOYUTLAR ===== //

const DEFAULT_SIZES = {
    'header': { width: '100%', height: 80 },
    'footer': { width: '100%', height: 60 },
    'card': { width: 300, height: 200 },
    'text-content': { width: 300, height: 120 },
    'slider': { width: '100%', height: 400 }
};



// ===== DOM HAZIR OLDUĞUNDA ===== //

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const exportBtn = document.getElementById('exportBtn');
    const elements = document.querySelectorAll('.sidebar .element');

    canvas.classList.add('grid-enabled');

    initializeDragElements(elements);
    initializeDropZone(canvas);

    document.addEventListener('keydown', handleKeyPress);
    exportBtn.addEventListener('click', exportJSON);

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.canvas-element')) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                removeResizeHandle(selectedElement);
                removeZIndexControls(selectedElement);
                selectedElement = null;
            }
        }
    });
});



// ===== DRAG & DROP ===== //

function initializeDragElements(elements) {
    elements.forEach(element => {
        element.addEventListener('dragstart', function (e) {

            e.dataTransfer.setData('text/plain', this.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
            this.classList.add('dragging');
            this.style.cursor = 'grabbing';
        });

        element.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            this.style.cursor = 'grab';
        });
    });
}

function initializeDropZone(canvas) {
    canvas.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        canvas.classList.add('drag-over');
    });

    canvas.addEventListener('dragleave', function () {
        canvas.classList.remove('drag-over');
    });

    canvas.addEventListener('drop', function (e) {
        e.preventDefault();
        canvas.classList.remove('drag-over');
        handleDrop(e);
    });
}



// ===== ELEMENT YERLEŞTIRME ===== //

function handleDrop(e) {
    const type = e.dataTransfer.getData('text/plain');
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    let mouseY = e.clientY - canvasRect.top;
    let mouseX = e.clientX - canvasRect.left;


    if (GRID_SNAP) {
        mouseY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
        mouseX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
    }

    const size = DEFAULT_SIZES[type];
    let width = size.width === '100%' ? canvas.clientWidth : size.width;
    let height = size.height;

    if (mouseX + width > canvas.clientWidth) {
        mouseX = canvas.clientWidth - width;

        if (GRID_SNAP) {
            mouseX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
        }

        if (mouseX < 0) mouseX = 0;
    }

    if (checkCollision(mouseX, mouseY, width, height)) {
        alert('Bu pozisyonda başka bir element var!');
        return;
    }

    createElement(type, mouseX, mouseY, width, height);
    updateElementCount();
}



// ===== ÇAKIŞMA KONTROLÜ ===== //

function checkCollision(x, y, width, height, ignoreElement = null) {
    const canvas = document.getElementById('canvas');
    const elements = canvas.querySelectorAll('.canvas-element');

    for (let element of elements) {
        if (element === ignoreElement) continue;

        const rect = element.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const elX = rect.left - canvasRect.left;
        const elY = rect.top - canvasRect.top;
        const elWidth = rect.width;
        const elHeight = rect.height;

        if (x < elX + elWidth &&
            x + width > elX &&
            y < elY + elHeight &&
            y + height > elY) {
            return true;
        }
    }

    return false;
}



// ===== ELEMENT OLUŞTURMA ===== //

function createElement(type, x, y, width, height) {
    const canvas = document.getElementById('canvas');
    elementCounter++;

    const elementId = `elem_${type}_${String(elementCounter).padStart(3, '0')}`;

    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.id = elementId;
    element.dataset.type = type;
    element.textContent = type.toUpperCase();

    if (type === 'header') {
        element.style.position = 'absolute';
        element.style.top = '0px';
        element.style.left = '0px';
        element.style.width = '100%';
        element.style.height = height + 'px';
    } else if (type === 'footer') {
        element.style.position = 'absolute';
        element.style.bottom = '0px';
        element.style.left = '0px';
        element.style.width = '100%';
        element.style.height = height + 'px';
    } else {
        element.style.position = 'absolute';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.width = width + 'px';
        element.style.height = height + 'px';
    }

    element.style.zIndex = canvasData.length + 1;

    canvas.appendChild(element);

    element.addEventListener('click', function (e) {
        e.stopPropagation();
        selectElement(element);
    });

    initializeElementDrag(element);

    const elementData = {
        id: elementId,
        type: type,
        position: {
            x: type === 'header' || type === 'footer' ? 0 : x,
            y: type === 'header' ? 0 : (type === 'footer' ? 'bottom' : y),
            width: width === canvas.offsetWidth ? '100%' : width,
            height: height,
            zIndex: element.style.zIndex
        },
        content: getDefaultContent(type)
    };

    canvasData.push(elementData);

    const canvasInfo = document.querySelector('.canvas-info');
    if (canvasInfo && canvasData.length > 0) {
        canvasInfo.style.display = 'none';
    }
}

function getDefaultContent(type) {
    const contents = {
        'header': { text: 'Site Başlığı', style: 'default' },
        'footer': { copyright: '© 2024 Test Builder', links: [] },
        'card': { title: 'Card Title', description: 'Card description', image: null },
        'text-content': { html: 'Text content here', plainText: 'Text content here' },
        'slider': { images: [], autoplay: true, interval: 3000 }
    };
    return contents[type] || {};
}

function updateElementCount() {
    const countElement = document.getElementById('elementCount');
    if (countElement) {
        countElement.textContent = canvasData.length;
    }
}



// ===== ELEMENT SEÇME ===== //

function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        removeResizeHandle(selectedElement);
        removeZIndexControls(selectedElement);
    }

    selectedElement = element;
    element.classList.add('selected');

    addResizeHandle(element);
    addZIndexControls(element);
}



// ===== ELEMENT TAŞIMA ===== //

function initializeElementDrag(element) {
    let isDragging = false;
    let startX, startY, elementX, elementY;

    element.addEventListener('mousedown', function (e) {
        if (e.target.classList.contains('resize-handle') ||
            e.target.closest('.z-controls')) {
            return;
        }

        isDragging = true;

        const rect = element.getBoundingClientRect();
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;
        elementX = rect.left - canvasRect.left;
        elementY = rect.top - canvasRect.top;

        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        const canvas = document.getElementById('canvas');

        let deltaX = e.clientX - startX;
        let deltaY = e.clientY - startY;

        let newX = elementX + deltaX;
        let newY = elementY + deltaY;

        if (GRID_SNAP) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;

        const maxX = canvas.offsetWidth - element.offsetWidth;
        if (newX > maxX) {
            newX = GRID_SNAP ? Math.floor(maxX / GRID_SIZE) * GRID_SIZE : maxX;
            if (newX < 0) newX = 0;
        }

        const maxY = canvas.offsetHeight - element.offsetHeight;
        if (newY > maxY) {
            newY = GRID_SNAP ? Math.floor(maxY / GRID_SIZE) * GRID_SIZE : maxY;
            if (newY < 0) newY = 0;
        }

        if (!checkCollision(newX, newY, element.offsetWidth, element.offsetHeight, element)) {
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            updateElementData(element.id, { x: newX, y: newY });
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
        }
    });
}

function updateElementData(elementId, updates) {
    const index = canvasData.findIndex(item => item.id === elementId);
    if (index !== -1) {
        Object.assign(canvasData[index].position, updates);
    }
}



// ===== ELEMENT RESIZE ===== //

function addResizeHandle(element) {
    if (element.dataset.type === 'header' || element.dataset.type === 'footer') {
        return;
    }

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    element.appendChild(handle);

    let isResizing = false;
    let startX, startWidth, startHeight, aspectRatio;

    handle.addEventListener('mousedown', function (e) {
        e.stopPropagation();
        isResizing = true;

        startX = e.clientX;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        aspectRatio = startWidth / startHeight;
    });

    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;

        let deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;
        let newHeight = newWidth / aspectRatio;

        if (newWidth < 100) newWidth = 100;
        if (newHeight < 80) newHeight = 80;

        if (GRID_SNAP) {
            newWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
            newHeight = Math.round(newHeight / GRID_SIZE) * GRID_SIZE;
        }

        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';

        updateElementData(element.id, { width: newWidth, height: newHeight });
    });

    document.addEventListener('mouseup', function () {
        isResizing = false;
    });
}

function removeResizeHandle(element) {
    const handle = element.querySelector('.resize-handle');
    if (handle) handle.remove();
}



// ===== Z-INDEX KONTROLÜ ===== //

function addZIndexControls(element) {
    const controls = document.createElement('div');
    controls.className = 'z-controls';

    const frontBtn = document.createElement('button');
    frontBtn.textContent = '⬆ Front';
    frontBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        bringToFront(element);
    });

    const backBtn = document.createElement('button');
    backBtn.textContent = '⬇ Back';
    backBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        sendToBack(element);
    });

    controls.appendChild(frontBtn);
    controls.appendChild(backBtn);
    element.appendChild(controls);
}

function removeZIndexControls(element) {
    const controls = element.querySelector('.z-controls');
    if (controls) controls.remove();
}

function bringToFront(element) {
    const maxZ = Math.max(...canvasData.map(item => parseInt(item.position.zIndex)));
    const newZIndex = maxZ + 1;

    element.style.zIndex = newZIndex;
    updateElementData(element.id, { zIndex: newZIndex });
}

function sendToBack(element) {
    const minZ = Math.min(...canvasData.map(item => parseInt(item.position.zIndex)));
    const newZIndex = minZ - 1;

    element.style.zIndex = newZIndex;
    updateElementData(element.id, { zIndex: newZIndex });
}



// ===== DELETE ===== //

function handleKeyPress(e) {
    if (e.key === 'Delete' && selectedElement) {
        const elementId = selectedElement.id;

        selectedElement.remove();
        canvasData = canvasData.filter(item => item.id !== elementId);
        selectedElement = null;

        updateElementCount();

        if (canvasData.length === 0) {
            const canvasInfo = document.querySelector('.canvas-info');
            if (canvasInfo) canvasInfo.style.display = 'block';
        }
    }
}



// ===== JSON EXPORT ===== //

function exportJSON() {
    if (canvasData.length === 0) {
        alert('⚠️ Canvas boş! Önce element ekleyin.');
        return;
    }

    const canvas = document.getElementById('canvas');

    const exportData = {
        project: {
            name: 'Test Builder Layout',
            version: '1.0',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        },
        canvas: {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            grid: {
                enabled: true,
                size: GRID_SIZE,
                snap: GRID_SNAP
            }
        },
        elements: canvasData.map(item => ({
            id: item.id,
            type: item.type,
            content: item.content,
            position: {
                x: item.position.x,
                y: item.position.y,
                width: item.position.width,
                height: item.position.height,
                zIndex: parseInt(item.position.zIndex)
            },
            responsive: {
                mobile: {
                    width: item.position.width === '100%' ? '100%' : 'calc(100% - 20px)',
                    height: Math.floor(item.position.height * 0.8)
                },
                tablet: {
                    width: item.position.width === '100%' ? '100%' : Math.floor(item.position.width * 0.9),
                    height: Math.floor(item.position.height * 0.9)
                }
            }
        })),
        metadata: {
            totalElements: canvasData.length,
            exportFormat: 'json',
            exportDate: new Date().toISOString()
        }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `test-builder-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ JSON başarıyla export edildi!');
}