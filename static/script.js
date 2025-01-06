const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Variables for drawing
let isDrawing = false;
let drawMode = false;

// Drawing functionality
canvas.addEventListener('mousedown', (e) => {
    if (!drawMode) return;
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || !drawMode) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

document.getElementById('add-sticky').addEventListener('click', () => {
    const sticky = document.createElement('div');
    sticky.contentEditable = true;
    sticky.classList.add('sticky-note');
    sticky.style.position = 'absolute';
    sticky.style.left = '100px';
    sticky.style.top = '100px';
    sticky.style.width = '150px';
    sticky.style.height = '150px';
    sticky.style.backgroundColor = '#ffff88';
    sticky.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.3)';
    sticky.style.border = '1px solid #ccc';
    sticky.style.borderRadius = '5px';
    sticky.style.padding = '10px';
    sticky.style.zIndex = '2';
    sticky.setAttribute('draggable', 'true');

    // Drag functionality
    sticky.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', null); // Required for Firefox
        sticky.dataset.offsetX = e.offsetX;
        sticky.dataset.offsetY = e.offsetY;
    });

    sticky.addEventListener('drag', (e) => {
        if (e.pageX === 0 && e.pageY === 0) return; // Ignore invalid events
        const offsetX = sticky.dataset.offsetX || 0;
        const offsetY = sticky.dataset.offsetY || 0;
        sticky.style.left = `${e.pageX - offsetX}px`;
        sticky.style.top = `${e.pageY - offsetY}px`;
    });

    sticky.addEventListener('dragend', () => {
        sticky.removeAttribute('data-offset-x');
        sticky.removeAttribute('data-offset-y');
    });

    document.getElementById('board-container').appendChild(sticky);
});

document.getElementById('add-image').addEventListener('click', () => {
    document.getElementById('image-upload').click();
});

document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.style.position = 'absolute';
    img.style.left = '100px';
    img.style.top = '100px';
    img.style.width = '200px';
    img.style.height = 'auto';
    img.draggable = true;

    img.addEventListener('dragstart', (e) => {
        img.dataset.offsetX = e.offsetX;
        img.dataset.offsetY = e.offsetY;
    });

    img.addEventListener('drag', (e) => {
        if (e.pageX === 0 && e.pageY === 0) return;
        const offsetX = img.dataset.offsetX || 0;
        const offsetY = img.dataset.offsetY || 0;
        img.style.left = `${e.pageX - offsetX}px`;
        img.style.top = `${e.pageY - offsetY}px`;
    });

    img.addEventListener('dragend', () => {
        img.removeAttribute('data-offset-x');
        img.removeAttribute('data-offset-y');
    });

    document.getElementById('board-container').appendChild(img);
});
