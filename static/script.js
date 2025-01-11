// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('drawing-canvas', {
    width: window.innerWidth,
    height: window.innerHeight - 100,
    backgroundColor: '#f9f9f9',
});

window.addEventListener('resize', () => {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight - 100);
});

fabric.Object.prototype.set({
    cornerColor: 'blue',
    cornerStyle: 'circle',
    borderColor: 'blue',
    transparentCorners: false,
    rotatingPointOffset: 20,
});

const customizationMenu = document.getElementById('customization-menu');

// Undo/Redo Stacks
let undoStack = [];
let redoStack = [];
let isUndoing = false;
let isRedoing = false;
let clipboard = null; // To store the copied objects

// Function to save the current state of the canvas
function saveState() {
    if (!isUndoing && !isRedoing) {
        const json = JSON.stringify(canvas.toJSON());
        undoStack.push(json);
        redoStack = []; // Clear the redo stack whenever a new action is performed
    }
}

// Save canvas content to localStorage
function saveCanvas() {
    const json = JSON.stringify(canvas.toJSON());
    localStorage.setItem('canvasContent', json);
}

// Load canvas content from localStorage
function loadCanvas() {
    const canvasContent = localStorage.getItem('canvasContent');
    if (canvasContent) {
        canvas.loadFromJSON(canvasContent, () => {
            canvas.renderAll();
        });
    }
}

// Listen for object changes and new paths to save the state
canvas.on('object:modified', saveState);
canvas.on('path:created', saveState);

// Add Text Button
document.getElementById('add-text').addEventListener('click', () => {
    const text = new fabric.Textbox('Custom Text', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: '#000000',
        fontFamily: 'Arial',
        editable: true,
        textAlign: 'center',
        lockScalingX: true,
        lockScalingY: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    saveState();
});

// Remove existing selection event listeners
canvas.off('selection:created');
canvas.off('selection:updated');

// Add double-click event listener for text objects
canvas.on('mouse:dblclick', (e) => {
    const activeObject = canvas.findTarget(e.e);

    if (activeObject && activeObject.type === 'textbox') {
        customizationMenu.style.display = 'flex';
        customizationMenu.style.left = `${activeObject.left + canvas._offset.left}px`;
        customizationMenu.style.top = `${activeObject.top + canvas._offset.top + activeObject.height + 10}px`;

        document.getElementById('menu-font-size').value = activeObject.fontSize;
        document.getElementById('menu-font-color').value = activeObject.fill;
        document.getElementById('menu-font-family').value = activeObject.fontFamily;
    } else {
        customizationMenu.style.display = 'none';
    }
});

// Hide customization menu when selection is cleared
canvas.on('selection:cleared', () => {
    customizationMenu.style.display = 'none';
});

canvas.on('object:moving', (e) => {
    const activeObject = e.target;
    if (activeObject && activeObject.type === 'textbox') {
        positionMenu(activeObject);
    }
});

function positionMenu(activeObject) {
    customizationMenu.style.left = `${activeObject.left + canvas._offset.left}px`;
    customizationMenu.style.top = `${activeObject.top + canvas._offset.top + activeObject.height + 10}px`;
}

document.getElementById('menu-font-size').addEventListener('input', (e) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontSize', parseInt(e.target.value, 10));
        canvas.renderAll();
    }
});

document.getElementById('menu-font-color').addEventListener('input', (e) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fill', e.target.value);
        canvas.renderAll();
    }
});

document.getElementById('menu-font-family').addEventListener('change', (e) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontFamily', e.target.value);
        canvas.renderAll();
    }
});

document.querySelectorAll('.menu-align').forEach((button) => {
    button.addEventListener('click', (e) => {
        const alignment = e.target.dataset.align;
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            activeObject.set('textAlign', alignment);
            canvas.renderAll();
        }
    });
});

// Bold Button
document.getElementById('bold-btn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const currentFontWeight = activeObject.fontWeight;
        activeObject.set('fontWeight', currentFontWeight === 'bold' ? '' : 'bold');
        canvas.renderAll();
    }
});

// Italic Button
document.getElementById('italic-btn').addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const currentFontStyle = activeObject.fontStyle;
        activeObject.set('fontStyle', currentFontStyle === 'italic' ? '' : 'italic');
        canvas.renderAll();
    }
});

// Prompt for API Key if not available
function getApiKey() {
    let apiKey = localStorage.getItem('huggingfaceApiKey');
    if (!apiKey) {
        apiKey = prompt("Please enter your Hugging Face API key:");
        if (apiKey) {
            localStorage.setItem('huggingfaceApiKey', apiKey);
        } else {
            alert("API key is required to use the Rewrite functionality.");
        }
    }
    return apiKey;
}

// Function to paraphrase text using Hugging Face API
async function paraphraseText(text) {
    const apiKey = getApiKey();
    if (!apiKey) return text;

    const response = await fetch('https://api-inference.huggingface.co/models/t5-small', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: `paraphrase: ${text}`, parameters: { max_length: 200 } })
    });
    const data = await response.json();
    return data[0]?.generated_text || text;
}

// Add this event listener for the rewrite button
document.getElementById('rewrite-btn').addEventListener('click', async () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const newText = await paraphraseText(activeObject.text);
        activeObject.set('text', newText);
        canvas.renderAll();
        saveState();
    }
});

document.getElementById('draw-mode').addEventListener('click', () => {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    const btn = document.getElementById('draw-mode');
    btn.textContent = canvas.isDrawingMode ? 'Stop Drawing' : 'Draw';
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 5;
});

// Add Image Button
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
            saveState();
        });
    };
    reader.readAsDataURL(file);
});

document.getElementById('clear-board').addEventListener('click', () => {
    canvas.clear();
    canvas.backgroundColor = '#f9f9f9';
    canvas.renderAll();
    saveState();
});

// Initialize pen color, size
const penColorInput = document.getElementById('pen-color');
const penSizeInput = document.getElementById('pen-size');

penColorInput.addEventListener('input', (e) => {
    canvas.freeDrawingBrush.color = e.target.value;
});

penSizeInput.addEventListener('input', (e) => {
    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
});

// Add this event listener for keydown events (for delete, undo, redo, and save)
window.addEventListener('keydown', (e) => {
    const activeObjects = canvas.getActiveObjects();

    // Check for Ctrl+X (or Cmd+X on macOS) to cut objects
    if ((e.ctrlKey && e.key === 'x') || (e.metaKey && e.key === 'x')) {
        if (activeObjects.length) {
            clipboard = new fabric.Group(activeObjects).toObject();
            canvas.remove(...activeObjects);
        }
        canvas.discardActiveObject();
        saveState();
        e.preventDefault(); // Prevent the default cut behavior
    }

    // Check for Ctrl+C (or Cmd+C on macOS) to copy objects
    if ((e.ctrlKey && e.key === 'c') || (e.metaKey && e.key === 'c')) {
        if (activeObjects.length) {
            clipboard = new fabric.Group(activeObjects).toObject();
        }
        e.preventDefault(); // Prevent the default copy behavior
    }

    // Check for Ctrl+V (or Cmd+V on macOS) to paste objects
    if ((e.ctrlKey && e.key === 'v') || (e.metaKey && e.key === 'v')) {
        if (clipboard) {
            fabric.util.enlivenObjects([clipboard], (objects) => {
                objects.forEach((obj) => {
                    obj.set({
                        left: obj.left + 10,
                        top: obj.top + 10,
                    });
                    canvas.add(obj);
                });
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                saveState();
                clipboard = null; // Clear the clipboard after pasting
            });
        } else {
            // Handle external image pasting
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
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
                            saveState();
                        });
                    };
                    reader.readAsDataURL(blob);
                    e.preventDefault(); // Prevent the default paste behavior
                    break; // Break the loop once an image is found and processed
                }
            }
        }
    }

    // Check for Ctrl+Shift+V to clear the clipboard
    if ((e.ctrlKey && e.shiftKey && e.key === 'V') || (e.metaKey && e.shiftKey && e.key === 'V')) {
        clipboard = null;
        e.preventDefault(); // Prevent the default behavior
    }

    // Check for Delete key to remove selected objects
    if (e.key === 'Delete') {
        if (activeObjects.length) {
            canvas.remove(...activeObjects);
            canvas.discardActiveObject();
            saveState();
        }
        e.preventDefault(); // Prevent the default delete behavior
    }

    // Undo (Ctrl+Z or Cmd+Z)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault(); // Prevent default undo action
        if (undoStack.length > 0) {
            isUndoing = true;
            const lastState = undoStack.pop(); // Get the last state
            redoStack.push(JSON.stringify(canvas.toJSON())); // Push the current state to the redo stack before changing it
            canvas.loadFromJSON(lastState, () => {
                canvas.renderAll();
                isUndoing = false;
            });
        }
    }

    // Redo (Ctrl+Y or Cmd+Y)
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault(); // Prevent default redo action
        if (redoStack.length > 0) {
            isRedoing = true;
            const nextState = redoStack.pop(); // Get the next state from redo stack
            undoStack.push(JSON.stringify(canvas.toJSON())); // Push the current state to the undo stack before changing it
            canvas.loadFromJSON(nextState, () => {
                canvas.renderAll();
                isRedoing = false;
            });
        }
    }

    // Save (Ctrl+S or Cmd+S)
    if ((e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's')) {
        e.preventDefault(); // Prevent default save action
        if (confirm("Would you like to save the current board?")) {
            saveCanvas();
            alert("Board saved successfully!");
        }
    }
});

// Paste image from clipboard (handle external image pasting separately)
window.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
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
                    saveState();
                });
            };
            reader.readAsDataURL(blob);
            e.preventDefault(); // Prevent the default paste behavior
            break; // Break the loop once an image is found and processed
        }
    }
});

// Initialize the first state (when the page loads)
saveState();
loadCanvas(); // Load the saved canvas content when the page loads