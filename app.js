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
  const inputLogo = document.getElementById('input-logo');
  const btnUploadLogo = document.getElementById('btn-upload-logo');
  
  const uploadBox = document.getElementById('upload-box');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const watermarkLayer = document.getElementById('watermark-layer');
  const logoLayer = document.getElementById('logo-layer');
  const exportCanvas = document.getElementById('export-canvas');
  const exportCtx = exportCanvas.getContext('2d');
  const editorControls = document.getElementById('editor-controls');

  // Nuevos selectores y grupos de control
  const typeSelector = document.getElementById('watermark-type-selector');
  const textControlsGroup = document.getElementById('text-controls-group');
  const imageControlsGroup = document.getElementById('image-controls-group');
  const colorControlCol = document.getElementById('color-control-col');
  const fontSelect = document.getElementById('watermark-font');

  // Inputs de la marca de agua
  const textInput = document.getElementById('watermark-text');
  const colorInput = document.getElementById('watermark-color');
  const sizeInput = document.getElementById('watermark-size');
  const opacityInput = document.getElementById('watermark-opacity');
  const btnReset = document.getElementById('btn-reset');
  const btnDownload = document.getElementById('btn-download');

  let currentImage = null;
  let currentLogoImage = null;

  // Posiciones normalizadas en porcentaje (0 a 100) respecto a la imagen visible
  let posX = 50; 
  let posY = 50; 
  let logoPosX = 50;
  let logoPosY = 50;

  let activeDraggable = null; // 'text' o 'logo'
  let isDragging = false;

  // Botones de carga de foto principal
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
          logoPosX = 50;
          logoPosY = 50;
          updateWatermarkPosition();
          updateLogoPosition();
          
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

  // Carga de Imagen Secundaria (Logo)
  btnUploadLogo.addEventListener('click', () => inputLogo.click());
  inputLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          currentLogoImage = img;
          logoLayer.src = event.target.result;
          logoLayer.classList.remove('hidden');
          logoPosX = 50;
          logoPosY = 50;
          updateLogoPosition();
          updateStyles();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Alternar entre modo Texto e Imagen
  typeSelector.addEventListener('change', () => {
    if (typeSelector.value === 'text') {
      textControlsGroup.classList.remove('hidden');
      imageControlsGroup.classList.add('hidden');
      colorControlCol.classList.remove('hidden');
      watermarkLayer.classList.remove('hidden');
      logoLayer.classList.add('hidden');
    } else {
      textControlsGroup.classList.add('hidden');
      imageControlsGroup.classList.remove('hidden');
      colorControlCol.classList.add('hidden');
      watermarkLayer.classList.add('hidden');
      if (currentLogoImage) {
        logoLayer.classList.remove('hidden');
      }
    }
  });

  // Actualizar estilos visuales en tiempo real
  function updateStyles() {
    const opacityVal = parseFloat(opacityInput.value);
    const sizeVal = parseInt(sizeInput.value);

    // Estilos de Texto
    const text = textInput.value || 'Leire';
    const color = colorInput.value;
    const fontFamily = fontSelect.value;

    watermarkLayer.textContent = text;
    watermarkLayer.style.color = color;
    watermarkLayer.style.fontFamily = fontFamily;
    watermarkLayer.style.fontSize = `${sizeVal * 0.6}px`;
    watermarkLayer.style.opacity = opacityVal;

    // Estilos de Logo
    logoLayer.style.opacity = opacityVal;
    logoLayer.style.width = `${sizeVal * 2.5}px`;
  }

  // Posicionar capas en pantalla
  function updateWatermarkPosition() {
    watermarkLayer.style.left = `${posX}%`;
    watermarkLayer.style.top = `${posY}%`;
  }

  function updateLogoPosition() {
    logoLayer.style.left = `${logoPosX}%`;
    logoLayer.style.top = `${logoPosY}%`;
  }

  // Coordenadas de arrastre optimizadas
  function getContainerCoordinates(e) {
    const rect = previewImg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    return {
      xPercent: (x / rect.width) * 100,
      yPercent: (y / rect.height) * 100
    };
  }

  function startDrag(targetType, e) {
    isDragging = true;
    activeDraggable = targetType;
    moveDrag(e);
  }

  function moveDrag(e) {
    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      const coords = getContainerCoordinates(e);
      if (activeDraggable === 'text') {
        posX = coords.xPercent;
        posY = coords.yPercent;
        updateWatermarkPosition();
      } else if (activeDraggable === 'logo') {
        logoPosX = coords.xPercent;
        logoPosY = coords.yPercent;
        updateLogoPosition();
      }
    }
  }

  function stopDrag() {
    isDragging = false;
    activeDraggable = null;
  }

  // Eventos de arrastre independientes (Texto / Logo)
  watermarkLayer.addEventListener('mousedown', (e) => startDrag('text', e));
  watermarkLayer.addEventListener('touchstart', (e) => startDrag('text', e), { passive: true });

  logoLayer.addEventListener('mousedown', (e) => startDrag('logo', e));
  logoLayer.addEventListener('touchstart', (e) => startDrag('logo', e), { passive: true });

  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);

  // Eventos de controles
  textInput.addEventListener('input', updateStyles);
  fontSelect.addEventListener('change', updateStyles);
  colorInput.addEventListener('input', updateStyles);
  sizeInput.addEventListener('input', updateStyles);
  opacityInput.addEventListener('input', updateStyles);

  // Cambiar foto
  btnReset.addEventListener('click', () => {
    currentImage = null;
    currentLogoImage = null;
    inputCamera.value = '';
    inputGallery.value = '';
    inputLogo.value = '';
    logoLayer.classList.add('hidden');
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

    const opacity = parseFloat(opacityInput.value);
    const sizeVal = parseInt(sizeInput.value);

    exportCtx.save();
    exportCtx.globalAlpha = opacity;

    if (typeSelector.value === 'text') {
      // Dibujar Marca de Agua de Texto
      const finalX = (posX / 100) * exportCanvas.width;
      const finalY = (posY / 100) * exportCanvas.height;
      const scaledFontSize = sizeVal * (exportCanvas.width / 400);

      const text = textInput.value || 'Leire';
      const color = colorInput.value;
      const fontFamily = fontSelect.value;

      exportCtx.font = `bold ${scaledFontSize}px ${fontFamily}`;
      exportCtx.fillStyle = color;
      exportCtx.textAlign = 'center';
      exportCtx.textBaseline = 'middle';

      // Sombra para legibilidad en la foto descargada
      exportCtx.shadowColor = 'rgba(0,0,0,0.6)';
      exportCtx.shadowBlur = Math.round(scaledFontSize * 0.15);

      exportCtx.fillText(text, finalX, finalY);

    } else if (typeSelector.value === 'image' && currentLogoImage) {
      // Dibujar Marca de Agua de Imagen / Logo
      const logoW = currentLogoImage.width;
      const logoH = currentLogoImage.height;
      
      const targetLogoWidth = (sizeVal / 100) * exportCanvas.width * 0.8;
      const targetLogoHeight = (logoH * targetLogoWidth) / logoW;

      const finalLogoX = (logoPosX / 100) * exportCanvas.width - (targetLogoWidth / 2);
      const finalLogoY = (logoPosY / 100) * exportCanvas.height - (targetLogoHeight / 2);

      exportCtx.drawImage(currentLogoImage, finalLogoX, finalLogoY, targetLogoWidth, targetLogoHeight);
    }

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
