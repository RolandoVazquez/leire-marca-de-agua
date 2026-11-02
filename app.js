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
  const btnVideo = document.getElementById('btn-video');
  const inputCamera = document.getElementById('input-camera');
  const inputGallery = document.getElementById('input-gallery');
  const inputLogo = document.getElementById('input-logo');
  const inputVideo = document.getElementById('input-video');
  const btnUploadLogo = document.getElementById('btn-upload-logo');
  
  const uploadBox = document.getElementById('upload-box');
  const previewContainer = document.getElementById('preview-container');
  const videoPreviewContainer = document.getElementById('video-preview-container');
  
  const previewImg = document.getElementById('preview-img');
  const previewVideo = document.getElementById('preview-video');

  const watermarkLayer = document.getElementById('watermark-layer');
  const logoLayer = document.getElementById('logo-layer');
  
  const watermarkLayerVideo = document.getElementById('watermark-layer-video');
  const logoLayerVideo = document.getElementById('logo-layer-video');

  const exportCanvas = document.getElementById('export-canvas');
  const exportCtx = exportCanvas.getContext('2d');
  const exportVideoCanvas = document.getElementById('export-video-canvas');
  
  const editorControls = document.getElementById('editor-controls');

  const typeSelector = document.getElementById('watermark-type-selector');
  const textControlsGroup = document.getElementById('text-controls-group');
  const imageControlsGroup = document.getElementById('image-controls-group');
  const colorControlCol = document.getElementById('color-control-col');
  const fontSelect = document.getElementById('watermark-font');

  const textInput = document.getElementById('watermark-text');
  const colorInput = document.getElementById('watermark-color');
  const sizeInput = document.getElementById('watermark-size');
  const opacityInput = document.getElementById('watermark-opacity');
  const btnReset = document.getElementById('btn-reset');
  const btnDownload = document.getElementById('btn-download');

  let currentImage = null;
  let currentLogoImage = null;
  let currentVideoFile = null;
  let isVideoMode = false;

  let posX = 50; 
  let posY = 50; 
  let logoPosX = 50;
  let logoPosY = 50;

  let activeDraggable = null; 
  let isDragging = false;

  btnCamera.addEventListener('click', () => inputCamera.click());
  btnGallery.addEventListener('click', () => inputGallery.click());
  btnVideo.addEventListener('click', () => inputVideo.click());

  inputCamera.addEventListener('change', handleFileSelect);
  inputGallery.addEventListener('change', handleFileSelect);
  inputVideo.addEventListener('change', handleVideoSelect);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      isVideoMode = false;
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          currentImage = img;
          currentVideoFile = null;
          previewImg.src = event.target.result;
          
          posX = 50; posY = 50; logoPosX = 50; logoPosY = 50;
          updateWatermarkPosition();
          updateLogoPosition();
          
          uploadBox.classList.add('hidden');
          previewContainer.classList.remove('hidden');
          videoPreviewContainer.classList.add('hidden');
          editorControls.classList.remove('hidden');
          updateStyles();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleVideoSelect(e) {
    const file = e.target.files[0];
    if (file) {
      isVideoMode = true;
      currentVideoFile = file;
      currentImage = null;

      const videoUrl = URL.createObjectURL(file);
      previewVideo.src = videoUrl;
      
      posX = 50; posY = 50; logoPosX = 50; logoPosY = 50;
      updateWatermarkPosition();
      updateLogoPosition();

      uploadBox.classList.add('hidden');
      previewContainer.classList.add('hidden');
      videoPreviewContainer.classList.remove('hidden');
      editorControls.classList.remove('hidden');
      updateStyles();
    }
  }

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
          logoLayerVideo.src = event.target.result;
          logoLayer.classList.remove('hidden');
          logoLayerVideo.classList.remove('hidden');
          logoPosX = 50; logoPosY = 50;
          updateLogoPosition();
          updateStyles();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  typeSelector.addEventListener('change', () => {
    if (typeSelector.value === 'text') {
      textControlsGroup.classList.remove('hidden');
      imageControlsGroup.classList.add('hidden');
      colorControlCol.classList.remove('hidden');
      watermarkLayer.classList.remove('hidden');
      watermarkLayerVideo.classList.remove('hidden');
      logoLayer.classList.add('hidden');
      logoLayerVideo.classList.add('hidden');
    } else {
      textControlsGroup.classList.add('hidden');
      imageControlsGroup.classList.remove('hidden');
      colorControlCol.classList.add('hidden');
      watermarkLayer.classList.add('hidden');
      watermarkLayerVideo.classList.add('hidden');
      if (currentLogoImage) {
        logoLayer.classList.remove('hidden');
        logoLayerVideo.classList.remove('hidden');
      }
    }
  });

  function updateStyles() {
    const opacityVal = parseFloat(opacityInput.value);
    const sizeVal = parseInt(sizeInput.value);

    const text = textInput.value || 'Leire';
    const color = colorInput.value;
    const fontFamily = fontSelect.value;

    watermarkLayer.textContent = text;
    watermarkLayer.style.color = color;
    watermarkLayer.style.fontFamily = fontFamily;
    watermarkLayer.style.fontSize = `${sizeVal * 0.6}px`;
    watermarkLayer.style.opacity = opacityVal;

    watermarkLayerVideo.textContent = text;
    watermarkLayerVideo.style.color = color;
    watermarkLayerVideo.style.fontFamily = fontFamily;
    watermarkLayerVideo.style.fontSize = `${sizeVal * 0.6}px`;
    watermarkLayerVideo.style.opacity = opacityVal;

    logoLayer.style.opacity = opacityVal;
    logoLayer.style.width = `${sizeVal * 2.5}px`;

    logoLayerVideo.style.opacity = opacityVal;
    logoLayerVideo.style.width = `${sizeVal * 2.5}px`;
  }

  function updateWatermarkPosition() {
    watermarkLayer.style.left = `${posX}%`;
    watermarkLayer.style.top = `${posY}%`;
    watermarkLayerVideo.style.left = `${posX}%`;
    watermarkLayerVideo.style.top = `${posY}%`;
  }

  function updateLogoPosition() {
    logoLayer.style.left = `${logoPosX}%`;
    logoLayer.style.top = `${logoPosY}%`;
    logoLayerVideo.style.left = `${logoPosX}%`;
    logoLayerVideo.style.top = `${logoPosY}%`;
  }

  // --- ARRASTRE LIBRE Y FLUIDO EN VIDEO E IMAGEN ---
  function getContainerCoordinates(e) {
    const activeContainerElement = isVideoMode ? videoPreviewContainer : previewImg;
    const rect = activeContainerElement.getBoundingClientRect();
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

  // Eventos de puntero directos para mover libremente
  watermarkLayer.addEventListener('pointerdown', (e) => startDrag('text', e));
  watermarkLayerVideo.addEventListener('pointerdown', (e) => startDrag('text', e));

  logoLayer.addEventListener('pointerdown', (e) => startDrag('logo', e));
  logoLayerVideo.addEventListener('pointerdown', (e) => startDrag('logo', e));

  window.addEventListener('pointermove', moveDrag);
  window.addEventListener('pointerup', stopDrag);

  textInput.addEventListener('input', updateStyles);
  fontSelect.addEventListener('change', updateStyles);
  colorInput.addEventListener('input', updateStyles);
  sizeInput.addEventListener('input', updateStyles);
  opacityInput.addEventListener('input', updateStyles);

  btnReset.addEventListener('click', () => {
    currentImage = null;
    currentLogoImage = null;
    currentVideoFile = null;
    isVideoMode = false;
    inputCamera.value = '';
    inputGallery.value = '';
    inputLogo.value = '';
    inputVideo.value = '';
    logoLayer.classList.add('hidden');
    logoLayerVideo.classList.add('hidden');
    previewContainer.classList.add('hidden');
    videoPreviewContainer.classList.add('hidden');
    editorControls.classList.add('hidden');
    uploadBox.classList.remove('hidden');
    previewVideo.pause();
    previewVideo.src = '';
  });

  // --- DESCARGA SEGURA, RÁPIDA Y A PRUEBA DE ERRORES ---
  btnDownload.addEventListener('click', () => {
    if (isVideoMode && currentVideoFile) {
      btnDownload.textContent = '⏳ Procesando Video...';
      btnDownload.disabled = true;

      const vidElement = document.createElement('video');
      vidElement.src = URL.createObjectURL(currentVideoFile);
      vidElement.crossOrigin = 'anonymous';
      vidElement.muted = true;
      vidElement.playsInline = true;

      vidElement.onloadedmetadata = () => {
        exportVideoCanvas.width = vidElement.videoWidth;
        exportVideoCanvas.height = vidElement.videoHeight;
        const ctx = exportVideoCanvas.getContext('2d');

        const stream = exportVideoCanvas.captureStream();
        let recordedChunks = [];
        let mediaRecorder;

        // Selección automática del formato compatible para evitar cualquier error de navegador
        const mimeTypes = ['video/webm; codecs=vp9', 'video/webm; codecs=vp8', 'video/webm', ''];
        let selectedMimeType = '';
        for (let type of mimeTypes) {
          if (type === '' || MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
          }
        }

        try {
          mediaRecorder = selectedMimeType ? 
            new MediaRecorder(stream, { mimeType: selectedMimeType, videoBitsPerSecond: 8000000 }) : 
            new MediaRecorder(stream);
        } catch (err) {
          mediaRecorder = new MediaRecorder(stream); // Fallback absoluto a prueba de errores
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `Leire-marca-de-agua-${Date.now()}.webm`;
          link.href = url;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);

          btnDownload.textContent = '⬇️ Descargar Archivo';
          btnDownload.disabled = false;
        };

        mediaRecorder.start();
        vidElement.currentTime = 0;
        vidElement.play().catch(err => {
          console.error("Error al reproducir video para exportar:", err);
          btnDownload.textContent = '⬇️ Descargar Archivo';
          btnDownload.disabled = false;
        });

        function renderExportFrame() {
          if (vidElement.ended || vidElement.paused) {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            return;
          }

          ctx.clearRect(0, 0, exportVideoCanvas.width, exportVideoCanvas.height);
          ctx.drawImage(vidElement, 0, 0, exportVideoCanvas.width, exportVideoCanvas.height);

          const opacity = parseFloat(opacityInput.value);
          const sizeVal = parseInt(sizeInput.value);

          ctx.save();
          ctx.globalAlpha = opacity;

          if (typeSelector.value === 'text') {
            const finalX = (posX / 100) * exportVideoCanvas.width;
            const finalY = (posY / 100) * exportVideoCanvas.height;
            const scaledFontSize = sizeVal * (exportVideoCanvas.width / 400);

            const text = textInput.value || 'Leire';
            const color = colorInput.value;
            const fontFamily = fontSelect.value;

            ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = Math.round(scaledFontSize * 0.15);

            ctx.fillText(text, finalX, finalY);

          } else if (typeSelector.value === 'image' && currentLogoImage) {
            const logoW = currentLogoImage.width;
            const logoH = currentLogoImage.height;
            
            const targetLogoWidth = (sizeVal / 100) * exportVideoCanvas.width * 0.8;
            const targetLogoHeight = (logoH * targetLogoWidth) / logoW;

            const finalLogoX = (logoPosX / 100) * exportVideoCanvas.width - (targetLogoWidth / 2);
            const finalLogoY = (logoPosY / 100) * exportVideoCanvas.height - (targetLogoHeight / 2);

            ctx.drawImage(currentLogoImage, finalLogoX, finalLogoY, targetLogoWidth, targetLogoHeight);
          }

          ctx.restore();
          
          if (!vidElement.paused && !vidElement.ended) {
            requestAnimationFrame(renderExportFrame);
          }
        }

        vidElement.onplay = () => {
          renderExportFrame();
        };
      };

    } else if (currentImage) {
      // Tu lógica intacta de imágenes
      exportCanvas.width = currentImage.width;
      exportCanvas.height = currentImage.height;

      exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportCtx.drawImage(currentImage, 0, 0);

      const opacity = parseFloat(opacityInput.value);
      const sizeVal = parseInt(sizeInput.value);

      exportCtx.save();
      exportCtx.globalAlpha = opacity;

      if (typeSelector.value === 'text') {
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

        exportCtx.shadowColor = 'rgba(0,0,0,0.6)';
        exportCtx.shadowBlur = Math.round(scaledFontSize * 0.15);

        exportCtx.fillText(text, finalX, finalY);

      } else if (typeSelector.value === 'image' && currentLogoImage) {
        const logoW = currentLogoImage.width;
        const logoH = currentLogoImage.height;
        
        const targetLogoWidth = (sizeVal / 100) * exportCanvas.width * 0.8;
        const targetLogoHeight = (logoH * targetLogoWidth) / logoW;

        const finalLogoX = (logoPosX / 100) * exportCanvas.width - (targetLogoWidth / 2);
        const finalLogoY = (logoPosY / 100) * exportCanvas.height - (targetLogoHeight / 2);

        exportCtx.drawImage(currentLogoImage, finalLogoX, finalLogoY, targetLogoWidth, targetLogoHeight);
      }

      exportCtx.restore();

      exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Leire-marca-de-agua-${Date.now()}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    }
  });
});
