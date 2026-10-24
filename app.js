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
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const watermarkLayer = document.getElementById('watermark-layer');
  const exportCanvas = document.getElementById('export-canvas');
  const exportCtx = exportCanvas.getContext('2d');
  const editorControls = document.getElementById('editor-controls');

  // Inputs de la marca de agua
  const textInput = document.getElementById('watermark-text');
  const colorInput = document.getElementById('watermark-color');
  const sizeInput = document.getElementById('watermark-size');
  const opacityInput = document.getElementById('watermark-opacity');
  const btnReset = document.getElementById('btn-reset');
  const btnDownload = document.getElementById('btn-download');

  let currentImage = null;
  // Posición normalizada en porcentaje (0 a 100) respecto a la imagen visible
  let posX = 50; 
  let posY = 50; 
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
          previewImg.src = event.target.result;
          
          // Posición inicial centrada
          posX = 50;
          posY = 50;
          updateWatermarkPosition();
          
          uploadBox.classList.add('hidden');
          previewContainer.classList.remove('hidden');
          editorControls.classList.remove('hidden');
          
          updateStyles();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Actualizar estilos visuales de la marca de agua en tiempo real
  function updateStyles() {
    const text = textInput.value || 'Leire';
    const color = colorInput.value;
    const sizeVal = parseInt(sizeInput.value);
    const opacityVal = parseFloat(opacityInput.value);

    watermarkLayer.textContent = text;
    watermarkLayer.style.color = color;
    // Tamaño relativo y fluido adaptado al contenedor de la imagen
    watermarkLayer.style.fontSize = `${sizeVal * 0.6}px`;
    watermarkLayer.style.opacity = opacityVal;
  }

  // Posicionar la capa de texto en pantalla
  function updateWatermarkPosition() {
    watermarkLayer.style.left = `${posX}%`;
    watermarkLayer.style.top = `${posY}%`;
  }

  // Eventos para arrastrar el texto de manera ultra fluida (Mouse y Táctil)
  function getContainerCoordinates(e) {
    const rect = previewImg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    // Limitar dentro de los bordes de la imagen visible
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    return {
      xPercent: (x / rect.width) * 100,
      yPercent: (y / rect.height) * 100
    };
  }

  function startDrag(e) {
    isDragging = true;
    moveDrag(e);
  }

  function moveDrag(e) {
    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      const coords = getContainerCoordinates(e);
      posX = coords.xPercent;
      posY = coords.yPercent;
      updateWatermarkPosition();
    }
  }

  function stopDrag() {
    isDragging = false;
  }

  // Eventos de ratón
  watermarkLayer.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);

  // Eventos táctiles para celular
  watermarkLayer.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);

  // Eventos de controles
  textInput.addEventListener('input', updateStyles);
  colorInput.addEventListener('input', updateStyles);
  sizeInput.addEventListener('input', updateStyles);
  opacityInput.addEventListener('input', updateStyles);

  // Cambiar foto
  btnReset.addEventListener('click', () => {
    currentImage = null;
    inputCamera.value = '';
    inputGallery.value = '';
    previewContainer.classList.add('hidden');
    editorControls.classList.add('hidden');
    uploadBox.classList.remove('hidden');
  });

  // Descargar la imagen lista procesando en alta calidad en segundo plano
  btnDownload.addEventListener('click', () => {
    if (!currentImage) return;

    // Ajustar el canvas oculto a la resolución real y original de la foto
    exportCanvas.width = currentImage.width;
    exportCanvas.height = currentImage.height;

    // 1. Dibujar imagen original intacta y en alta resolución
    exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(currentImage, 0, 0);

    // 2. Calcular posición exacta proporcional en la imagen real
    const finalX = (posX / 100) * exportCanvas.width;
    const finalY = (posY / 100) * exportCanvas.height;

    // 3. Calcular tamaño de fuente proporcional a la resolución de la foto
    const baseSize = parseInt(sizeInput.value);
    const scaledFontSize = baseSize * (exportCanvas.width / 500);

    const text = textInput.value || 'Leire';
    const opacity = parseFloat(opacityInput.value);
    const color = colorInput.value;

    exportCtx.save();
    exportCtx.globalAlpha = opacity;
    exportCtx.font = `bold ${scaledFontSize}px sans-serif`;
    exportCtx.fillStyle = color;
    exportCtx.textAlign = 'center';
    exportCtx.textBaseline = 'middle';

    // Sombra para legibilidad en la foto descargada
    exportCtx.shadowColor = 'rgba(0,0,0,0.6)';
    exportCtx.shadowBlur = Math.round(scaledFontSize * 0.15);

    exportCtx.fillText(text, finalX, finalY);
    exportCtx.restore();

    // 4. Exportar el resultado final limpio y rápido
    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Leire-marca-de-agua-${Date.now()}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
});
