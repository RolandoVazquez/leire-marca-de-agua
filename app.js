window.addEventListener('DOMContentLoaded', () => {
  // Splash Screen
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app-container');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.classList.add('hidden');
      app.classList.remove('hidden');
    }, 500);
  }, 2200);

  // Elementos DOM
  const btnCamera = document.getElementById('btn-camera');
  const btnGallery = document.getElementById('btn-gallery');
  const inputCamera = document.getElementById('input-camera');
  const inputGallery = document.getElementById('input-gallery');
  
  const uploadBox = document.getElementById('upload-box');
  const canvas = document.getElementById('watermark-canvas');
  const ctx = canvas.getContext('2d');
  const editorControls = document.getElementById('editor-controls');

  // Inputs de la marca de agua
  const textInput = document.getElementById('watermark-text');
  const colorInput = document.getElementById('watermark-color');
  const sizeInput = document.getElementById('watermark-size');
  const opacityInput = document.getElementById('watermark-opacity');
  const btnReset = document.getElementById('btn-reset');
  const btnDownload = document.getElementById('btn-download');

  let currentImage = null;
  let textX = 50;
  let textY = 50;
  let isDragging = false;

  // Botones de carga
  btnCamera.addEventListener('click', () => inputCamera.click());
  btnGallery.addEventListener('click', () => inputGallery.click());

  inputCamera.addEventListener('change', handleFileSelect);
  inputGallery.addEventListener('change', handleFileSelect);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          currentImage = img;
          canvas.width = img.width;
          canvas.height = img.height;
          // Posición inicial al centro del canvas
          textX = canvas.width / 2;
          textY = canvas.height / 2;
          
          uploadBox.classList.add('hidden');
          canvas.classList.remove('hidden');
          editorControls.classList.remove('hidden');
          
          drawCanvas();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Dibujar imagen y marca de agua en el Canvas
  function drawCanvas() {
    if (!currentImage) return;

    // Redibujar imagen de fondo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Ajustes de texto
    const text = textInput.value || 'Leire';
    const size = parseInt(sizeInput.value) * (canvas.width / 400); // Escalado dinámico
    const opacity = parseFloat(opacityInput.value);
    const color = colorInput.value;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra sutil para legibilidad
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    
    ctx.fillText(text, textX, textY);
    ctx.restore();
  }

  // Eventos para arrastrar el texto sobre el Canvas (Mouse y Táctil)
  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDrag(e) {
    isDragging = true;
    updateTextPosition(e);
  }

  function moveDrag(e) {
    if (isDragging) {
      e.preventDefault();
      updateTextPosition(e);
    }
  }

  function stopDrag() {
    isDragging = false;
  }

  function updateTextPosition(e) {
    const coords = getCanvasCoordinates(e);
    textX = coords.x;
    textY = coords.y;
    drawCanvas();
  }

  // Eventos de ratón
  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);

  // Eventos táctiles para celular
  canvas.addEventListener('touchstart', startDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);

  // Eventos de controles
  textInput.addEventListener('input', drawCanvas);
  colorInput.addEventListener('input', drawCanvas);
  sizeInput.addEventListener('input', drawCanvas);
  opacityInput.addEventListener('input', drawCanvas);

  // Cambiar foto
  btnReset.addEventListener('click', () => {
    currentImage = null;
    inputCamera.value = '';
    inputGallery.value = '';
    canvas.classList.add('hidden');
    editorControls.classList.add('hidden');
    uploadBox.classList.remove('hidden');
  });

  // Descargar la imagen lista
  btnDownload.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `Leire-marca-de-agua-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});