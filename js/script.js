// GLOBAL DEĞİŞKENLER

let elementCounter = 0;        // Her elemente benzersiz ID vermek için sayaç
let selectedElement = null;    // Şu anda seçili olan element
let canvasData = [];           // Tüm elementlerin bilgilerini tutan dizi

// Grid ayarları
const GRID_SIZE = 20;          // Grid kareleri 20px x 20px
const GRID_SNAP = true;        // Grid'e otomatik hizalama açık

const DEFAULT_SIZES = {
    'header': { width: '100%', height: 80 },
    'footer': { width: '100%', height: 60 },
    'card': { width: 300, height: 200 },
    'text-content': { width: 300, height: 120 },
    'slider': { width: '100%', height: 400 }
};

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const exportBtn = document.getElementById('exportBtn');
    const elements = document.querySelectorAll('.sidebar .element');

    canvas.classList.add('grid-enabled');

    console.log('Canvas:', canvas);
    console.log('Export Button:', exportBtn);
    console.log('Elements:', elements);
});



// ===== TC-001: ELEMENT SÜRÜKLEME BAŞLATMA ===== //

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

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const exportBtn = document.getElementById('exportBtn');
    const elements = document.querySelectorAll('.sidebar .element');

    canvas.classList.add('grid-enabled');
    initializeDragElements(elements);
    initializeDropZone(canvas);
});



// ===== TC-002: DROP ZONE ALGILAMA ===== //

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

        handleDrop(e)
    });
}



// ===== TC-003: ELEMENT YERLEŞTIRME VE POZİSYON HESAPLAMA ===== //

function handleDrop(e) {
    const type = e.dataTransfer.getData('text/plain');

    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();


    let mouseX = e.clientX - canvasRect.left;
    let mouseY = e.clientY - canvasRect.top;

    if (GRID_SNAP) {
        mouseX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
        mouseY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
    }

    const size = DEFAULT_SIZES[type];

    let width = size.width === '100%' ? canvasRect.width : size.width;
    let height = size.height;


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

        if (x < elX + elWidth && x + width > elX && y < elY + elHeight && y + height > elY) {
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
    }
    else if (type === 'footer') {
        element.style.position = 'absolute';
        element.style.bottom = '0px';
        element.style.left = '0px';
        element.style.width = '100%';
        element.style.height = height + 'px';
    }
    else {
        element.style.position = 'absolute';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.width = width + 'px';
        element.style.height = height + 'px';
    }

    element.style.zIndex = canvasData.length + 1;

    canvas.appendChild(element);

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

    console.log('Element oluşturuldu:', elementData);
}



// ===== VARSAYILAN İÇERİK OLUŞTUR ===== //

function getDefaultContent(type) {
    // Her element tipi için varsayılan içerik
    const contents = {
        'header': {
            text: 'Site Başlığı',
            style: 'default'
        },
        'footer': {
            copyright: '© 2024 Test Builder',
            links: []
        },
        'card': {
            title: 'Card Title',
            description: 'Card description',
            image: null
        },
        'text-content': {
            html: 'Text content here',
            plainText: 'Text content here'
        },
        'slider': {
            images: [],
            autoplay: true,
            interval: 3000
        }
    };

    return contents[type] || {};
}



// ===== ELEMENT SAYISINI GÜNCELLE ===== //

function updateElementCount() {
    const countElement = document.getElementById('elementCount');
    if (countElement) {
        countElement.textContent = canvasData.length;
    }
}