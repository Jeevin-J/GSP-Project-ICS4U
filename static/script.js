
const canvas = new fabric.Canvas('drawing-canvas', {
    width: window.innerWidth,
    height: window.innerHeight - 100,
    backgroundColor: '#f9f9f9',
});

// Resize the canvas dynamically
window.addEventListener('resize', () => {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight - 100);
});

// Customize transform controls globally
fabric.Object.prototype.set({
    cornerColor: 'blue',
    cornerStyle: 'circle',
    borderColor: 'blue',
    transparentCorners: false,
    rotatingPointOffset: 20,
});

// Variables for drawing
let isDrawing = false;
let drawMode = false;

document.getElementById('add-sticky').addEventListener('click', () => {
    const sticky = new fabric.Textbox('Sticky Note', {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 16,
        backgroundColor: '#ffff88',
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerStyle: 'circle',
        editable: true,
        padding: 10,
    });
    canvas.add(sticky);
});

document.getElementById('add-image').addEventListener('click', () => {
    document.getElementById('image-upload').click();
});

document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            img.set({
                left: 100,
                top: 100,
                cornerColor: 'blue',
                cornerStyle: 'circle',
                lockUniScaling: false,
            });
            canvas.add(img);
        });
    };
    reader.readAsDataURL(file);
});

document.getElementById('draw-mode').addEventListener('click', () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    const btn = document.getElementById('draw-mode');
    btn.textContent = canvas.isDrawingMode ? 'Stop Drawing' : 'Draw';

    // Configure the drawing brush
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 5;
});

document.getElementById('clear-board').addEventListener('click', () => {
    canvas.clear();
    canvas.backgroundColor = '#f9f9f9';
});

