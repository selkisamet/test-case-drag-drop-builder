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

// TC-001: ELEMENT SÜRÜKLEME BAŞLATMA

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



// TC-002: DROP ZONE ALGILAMA

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

        const type = e.dataTransfer.getData('text/plain');
        console.log('Bırakılan element tipi:', type);
        console.log('Mouse X:', e.clientX);
        console.log('Mouse Y:', e.clientY);
    });
}