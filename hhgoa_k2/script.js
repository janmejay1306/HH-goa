/**
 * HHGOA 2026 Task 1 Photo Frame & ID Card Generator
 * Frontend logic, state management, and HTML5 Canvas composite engine
 * Team NetGlide
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
    });
  }
  
  // Load background image for canvas rendering
  const bgImage = new Image();
  bgImage.src = 'img/bg.png';
  bgImage.onload = () => {
    drawIndividualCanvas();
    drawTeamCanvas();
  };
  bgImage.onerror = () => {
    console.error('Failed to load background image: img/bg.png');
  };

  // --- State Configuration ---
  const state = {
    activeTab: 'individual',
    
    individual: {
      name: '',           // CHANGE 4: starts blank
      stack: 'Full Stack',
      customStack: '',
      builderClass: '',
      photoSrc: null,
      photoFile: null,
      photoOffsetX: 0,
      photoOffsetY: 0,
      nameValid: false    // CHANGE 5: validation flag
    },
    
    team: {
      members: [],
      tempMember: {
        name: '',
        stack: 'Full Stack',
        customStack: '',
        builderClass: '',
        photoSrc: null,
        photoFile: null
      }
    }
  };

  // CHANGE 7 & 8: Stack-specific builder class pools
  const STACK_BUILDER_CLASSES = {
    'Full Stack': [
      'Stack Architect',
      'Ship Captain',
      'Systems Builder',
      'Product Shipper',
      'Full Stack Ranger',
      'Code Commander'
    ],
    'Frontend': [
      'Pixel Architect',
      'Interface Crafter',
      'UI Engineer',
      'Interaction Builder',
      'Layout Wizard',
      'Component Artisan'
    ],
    'Backend': [
      'API Alchemist',
      'Systems Architect',
      'Service Engineer',
      'Backend Builder',
      'Data Plumber',
      'Request Handler'
    ],
    'AI / ML': [
      'Model Architect',
      'Prompt Engineer',
      'Neural Builder',
      'AI Tinkerer',
      'Data Sculptor',
      'Inference Wrangler'
    ],
    'Design': [
      'Visual Architect',
      'Interface Designer',
      'Experience Crafter',
      'Design Engineer',
      'Pixel Painter',
      'UX Strategist'
    ],
    'Product': [
      'Product Shipper',
      'Product Architect',
      'Growth Builder',
      'Product Strategist',
      'Feature Launcher',
      'Roadmap Navigator'
    ],
    'Web3': [
      'Chain Architect',
      'Protocol Builder',
      'Smart Contract Engineer',
      'Onchain Builder',
      'DeFi Ranger',
      'Wallet Wizard'
    ],
    'Other': [
      'Stack Navigator',
      'Code Cartographer',
      'Debug Raider',
      'Systems Generalist',
      'Tech Polyglot',
      'Build Strategist'
    ]
  };

  // Returns a random class from the pool matching the given stack
  function getClassForStack(stack) {
    const pool = STACK_BUILDER_CLASSES[stack] || STACK_BUILDER_CLASSES['Other'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Pre-load NetGlide Logo (for navbar fallback, NOT canvas) ---
  // CHANGE 3: Canvas no longer uses the logo; it draws HHGOA text on left
  let isLogoLoaded = false; // kept for compatibility, unused in canvas now

  // --- DOM Selectors ---
  const tabIndividualBtn   = document.getElementById('tab-individual');
  const tabTeamBtn         = document.getElementById('tab-team');
  const individualWorkspace = document.getElementById('individual-workspace');
  const teamWorkspace      = document.getElementById('team-workspace');
  
  const inputIndName       = document.getElementById('input-name');
  const nameError          = document.getElementById('name-error');
  const selectIndStack     = document.getElementById('select-stack');
  const groupIndCustomStack = document.getElementById('custom-stack-group');
  const inputIndCustomStack = document.getElementById('input-custom-stack');
  const inputIndClass      = document.getElementById('input-class');
  const btnIndShuffleClass = document.getElementById('btn-shuffle-class');
  
  const fileIndInput       = document.getElementById('file-individual');
  const dropzoneInd        = document.getElementById('dropzone-individual');
  const promptInd          = document.getElementById('prompt-individual');
  const previewIndContainer = document.getElementById('preview-container-individual');
  const thumbnailInd       = document.getElementById('thumbnail-individual');
  const filenameInd        = document.getElementById('filename-individual');
  const btnIndRemovePhoto  = document.getElementById('btn-remove-individual');
  
  const canvasInd          = document.getElementById('individual-canvas');
  const ctxInd             = canvasInd.getContext('2d');
  const canvasLoader       = document.getElementById('canvas-loader');
  const btnIndDownload     = document.getElementById('btn-download-individual');
  const textareaIndCaption = document.getElementById('caption-individual');
  const btnIndCopyCaption  = document.getElementById('btn-copy-individual');
  const btnIndShareX       = document.getElementById('btn-share-individual');
  const validationStatus   = document.getElementById('validation-status');
  const validationMessage  = document.getElementById('validation-message');
  
  const teammatesListContainer = document.getElementById('teammates-list-container');
  const teamEmptyStateMsg  = document.getElementById('team-empty-state-msg');
  const teamSizeCounter    = document.getElementById('team-size-counter');
  const btnTriggerAddForm  = document.getElementById('btn-trigger-add-form');
  const teammateFormContainer = document.getElementById('teammate-form-container');
  
  const fileTeamInput      = document.getElementById('file-teammate');
  const dropzoneTeam       = document.getElementById('dropzone-teammate');
  const promptTeam         = document.getElementById('prompt-teammate');
  const previewTeamContainer = document.getElementById('preview-container-teammate');
  const thumbnailTeam      = document.getElementById('thumbnail-teammate');
  const btnTeamRemovePhoto = document.getElementById('btn-remove-teammate');
  const inputTeamName      = document.getElementById('team-input-name');
  const selectTeamStack    = document.getElementById('team-select-stack');
  const groupTeamCustomStack = document.getElementById('team-custom-stack-group');
  const inputTeamCustomStack = document.getElementById('team-input-custom-stack');
  const inputTeamClass     = document.getElementById('team-input-class');
  const btnTeamShuffleClass = document.getElementById('btn-team-shuffle-class');
  const btnCancelTeammate  = document.getElementById('btn-cancel-teammate');
  const btnSaveTeammate    = document.getElementById('btn-save-teammate');
  
  const canvasTeam         = document.getElementById('team-canvas');
  const ctxTeam            = canvasTeam.getContext('2d');
  const btnTeamDownload    = document.getElementById('btn-download-team');
  const textareaTeamCaption = document.getElementById('caption-team');
  const btnTeamCopyCaption = document.getElementById('btn-copy-team');
  const btnTeamShareX      = document.getElementById('btn-share-team');
  
  const toastContainer     = document.getElementById('toast-container');

  // Canvas high-res resolution
  const CANVAS_RESOLUTION = 1200;
  canvasInd.width  = CANVAS_RESOLUTION;
  canvasInd.height = CANVAS_RESOLUTION;
  canvasTeam.width  = CANVAS_RESOLUTION;
  canvasTeam.height = CANVAS_RESOLUTION;

  // --- Dynamic Fonts State ---
  state.fonts = {
    main:   'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    header: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    mono:   'JetBrains Mono, monospace'
  };

  // =====================================
  // TOAST NOTIFICATION
  // =====================================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = type === 'success'
      ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3200);
  }

  // =====================================
  // CHANGE 5 & 6: NAME VALIDATION & FIELD GATING
  // =====================================
  const NAME_REGEX = /^[A-Za-z\s]+$/;

  function isNameValid(val) {
    return val.length > 0 && NAME_REGEX.test(val);
  }

  function validateAndUpdateActionState() {
    const hasPhoto   = !!state.individual.photoSrc;
    const hasName    = state.individual.nameValid;
    const hasClass   = !!state.individual.builderClass;
    const hasStack   = true; // stack always has a default value

    const allValid = hasPhoto && hasName && hasClass && hasStack;

    // Update button states
    btnIndDownload.disabled      = !allValid;
    btnIndCopyCaption.disabled   = !allValid;

    if (allValid) {
      btnIndShareX.classList.remove('disabled-link');
      btnIndShareX.style.pointerEvents = '';
      btnIndShareX.style.opacity = '';
    } else {
      btnIndShareX.classList.add('disabled-link');
      btnIndShareX.style.pointerEvents = 'none';
      btnIndShareX.style.opacity = '0.5';
    }

    // Validation status bar message
    if (validationStatus && validationMessage) {
      if (allValid) {
        validationStatus.classList.add('valid');
        validationStatus.querySelector('.status-icon').innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
        validationStatus.querySelector('.status-icon').setAttribute('viewBox', '0 0 24 24');
        validationMessage.textContent = 'All set — your frame is ready to download and share!';
      } else {
        validationStatus.classList.remove('valid');
        let msg = '';
        if (!hasPhoto)       msg = 'Upload your photo to continue.';
        else if (!hasName)   msg = 'Enter your name to enable sharing.';
        else if (!hasClass)  msg = 'Roll your Builder Class to continue.';
        validationMessage.textContent = msg;
      }
    }

    // Update caption if all valid
    if (allValid) {
      updateIndividualCaption();
    } else {
      textareaIndCaption.value = '';
      if (btnIndShareX) btnIndShareX.href = '';
    }
  }

  // =====================================
  // CHANGE 5: NAME INPUT VALIDATION
  // =====================================
  inputIndName.addEventListener('input', (e) => {
    const rawVal = e.target.value;

    // Strip invalid characters on-the-fly (allow only letters+spaces)
    const cleaned = rawVal.replace(/[^A-Za-z\s]/g, '');
    if (cleaned !== rawVal) {
      e.target.value = cleaned;
    }

    const trimmed = cleaned.trim();
    state.individual.name = trimmed;

    if (rawVal.length > 0 && !NAME_REGEX.test(rawVal)) {
      // Show validation error
      nameError.classList.remove('hidden');
      inputIndName.classList.add('input-invalid');
      state.individual.nameValid = false;
    } else if (trimmed.length === 0) {
      nameError.classList.add('hidden');
      inputIndName.classList.remove('input-invalid');
      state.individual.nameValid = false;
    } else {
      nameError.classList.add('hidden');
      inputIndName.classList.remove('input-invalid');
      state.individual.nameValid = true;
    }

    drawIndividualCanvas();
    validateAndUpdateActionState();
  });

  // =====================================
  // STACK & BUILDER CLASS LOGIC (CHANGE 7 & 8)
  // =====================================
  selectIndStack.addEventListener('change', (e) => {
    state.individual.stack = e.target.value;
    if (e.target.value === 'Other') {
      groupIndCustomStack.classList.remove('hidden');
      state.individual.customStack = inputIndCustomStack.value.trim() || 'Custom Stack';
    } else {
      groupIndCustomStack.classList.add('hidden');
      state.individual.customStack = '';
    }
    // Auto-roll a class relevant to new stack
    const cls = getClassForStack(state.individual.stack);
    state.individual.builderClass = cls;
    inputIndClass.value = cls;

    drawIndividualCanvas();
    validateAndUpdateActionState();
  });

  inputIndCustomStack.addEventListener('input', (e) => {
    state.individual.customStack = e.target.value.trim() || 'Custom Stack';
    drawIndividualCanvas();
    validateAndUpdateActionState();
  });

  function rollIndividualClass() {
    const cls = getClassForStack(state.individual.stack);
    state.individual.builderClass = cls;
    inputIndClass.value = cls;
    // Micro-animation: quick spin-once on the icon
    const icon = btnIndShuffleClass.querySelector('.shuffle-icon');
    if (icon) {
      icon.classList.remove('spin-once');
      void icon.offsetWidth; // reflow to restart
      icon.classList.add('spin-once');
      icon.addEventListener('transitionend', () => icon.classList.remove('spin-once'), { once: true });
    }
    drawIndividualCanvas();
    validateAndUpdateActionState();
  }

  btnIndShuffleClass.addEventListener('click', rollIndividualClass);

  // Teammate stack change also auto-rolls class
  selectTeamStack.addEventListener('change', (e) => {
    state.team.tempMember.stack = e.target.value;
    if (e.target.value === 'Other') {
      groupTeamCustomStack.classList.remove('hidden');
      state.team.tempMember.customStack = inputTeamCustomStack.value.trim() || 'Custom Stack';
    } else {
      groupTeamCustomStack.classList.add('hidden');
      state.team.tempMember.customStack = '';
    }
    const cls = getClassForStack(state.team.tempMember.stack);
    state.team.tempMember.builderClass = cls;
    inputTeamClass.value = cls;
  });

  inputTeamCustomStack.addEventListener('input', (e) => {
    state.team.tempMember.customStack = e.target.value.trim() || 'Custom Stack';
  });

  btnTeamShuffleClass.addEventListener('click', () => {
    const cls = getClassForStack(state.team.tempMember.stack);
    state.team.tempMember.builderClass = cls;
    inputTeamClass.value = cls;
    // Micro-animation on team roll icon
    const icon = btnTeamShuffleClass.querySelector('.shuffle-icon');
    if (icon) {
      icon.classList.remove('spin-once');
      void icon.offsetWidth;
      icon.classList.add('spin-once');
      icon.addEventListener('transitionend', () => icon.classList.remove('spin-once'), { once: true });
    }
  });

  // =====================================
  // TAB TOGGLING
  // =====================================
  function switchTab(target) {
    if (state.activeTab === target) return;
    state.activeTab = target;
    if (target === 'individual') {
      tabIndividualBtn.classList.add('active');
      tabIndividualBtn.setAttribute('aria-selected', 'true');
      tabTeamBtn.classList.remove('active');
      tabTeamBtn.setAttribute('aria-selected', 'false');
      individualWorkspace.classList.add('active');
      teamWorkspace.classList.remove('active');
      drawIndividualCanvas();
    } else {
      tabTeamBtn.classList.add('active');
      tabTeamBtn.setAttribute('aria-selected', 'true');
      tabIndividualBtn.classList.remove('active');
      tabIndividualBtn.setAttribute('aria-selected', 'false');
      teamWorkspace.classList.add('active');
      individualWorkspace.classList.remove('active');
      drawTeamCanvas();
    }
  }

  tabIndividualBtn.addEventListener('click', () => switchTab('individual'));
  tabTeamBtn.addEventListener('click', () => switchTab('team'));

  // =====================================
  // FILE UPLOAD HANDLING
  // =====================================
  function configureDropzone(dropzoneEl, fileInputEl, fileHandlerCallback) {
    dropzoneEl.addEventListener('click', () => fileInputEl.click());
    dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneEl.classList.add('dragover');
    });
    ['dragleave', 'dragend'].forEach(type => {
      dropzoneEl.addEventListener(type, () => dropzoneEl.classList.remove('dragover'));
    });
    dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileHandlerCallback(e.dataTransfer.files[0]);
      }
    });
    fileInputEl.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        fileHandlerCallback(e.target.files[0]);
      }
    });
  }

  function validateFileType(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Unsupported format. Use PNG, JPG, or WebP.', 'error');
      return false;
    }
    return true;
  }

  function handleIndividualFile(file) {
    if (!validateFileType(file)) return;
    state.individual.photoFile = file;
    filenameInd.textContent = file.name;
    canvasLoader.classList.remove('hidden');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        state.individual.photoSrc = img;
        state.individual.photoOffsetX = 0;
        state.individual.photoOffsetY = 0;
        thumbnailInd.src = e.target.result;
        promptInd.classList.add('hidden');
        previewIndContainer.classList.remove('hidden');
        canvasLoader.classList.add('hidden');
        showToast('Photo uploaded successfully!', 'success');
        drawIndividualCanvas();
        validateAndUpdateActionState();
      };
      img.onerror = () => {
        canvasLoader.classList.add('hidden');
        showToast('Error loading image. Try another file.', 'error');
      };
    };
    reader.readAsDataURL(file);
  }

  function handleTeammateFile(file) {
    if (!validateFileType(file)) return;
    state.team.tempMember.photoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        state.team.tempMember.photoSrc = img;
        thumbnailTeam.src = e.target.result;
        promptTeam.classList.add('hidden');
        previewTeamContainer.classList.remove('hidden');
        showToast('Teammate avatar uploaded!', 'success');
      };
    };
    reader.readAsDataURL(file);
  }

  btnIndRemovePhoto.addEventListener('click', (e) => {
    e.stopPropagation();
    state.individual.photoSrc = null;
    state.individual.photoFile = null;
    state.individual.photoOffsetX = 0;
    state.individual.photoOffsetY = 0;
    fileIndInput.value = '';
    previewIndContainer.classList.add('hidden');
    promptInd.classList.remove('hidden');
    drawIndividualCanvas();
    validateAndUpdateActionState();
    showToast('Photo removed', 'success');
  });

  btnTeamRemovePhoto.addEventListener('click', (e) => {
    e.stopPropagation();
    state.team.tempMember.photoSrc = null;
    state.team.tempMember.photoFile = null;
    fileTeamInput.value = '';
    previewTeamContainer.classList.add('hidden');
    promptTeam.classList.remove('hidden');
  });

  configureDropzone(dropzoneInd, fileIndInput, handleIndividualFile);
  configureDropzone(dropzoneTeam, fileTeamInput, handleTeammateFile);

  // =====================================
  // INDIVIDUAL PHOTO DRAGGING
  // =====================================
  let isDraggingIndividualPhoto = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialPhotoOffsetX = 0;
  let initialPhotoOffsetY = 0;

  function getCanvasPointerPosition(event) {
    const rect = canvasInd.getBoundingClientRect();
    const scaleX = CANVAS_RESOLUTION / rect.width;
    const scaleY = CANVAS_RESOLUTION / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function clampPhotoOffset(offset, containerSize, imageSize) {
    const maxOffset = Math.max((imageSize - containerSize) / 2, 0);
    return Math.min(Math.max(offset, -maxOffset), maxOffset);
  }

  function updateCanvasCursor() {
    if (state.individual.photoSrc) {
      canvasInd.style.cursor = 'grab';
    } else {
      canvasInd.style.cursor = 'default';
    }
  }

  canvasInd.addEventListener('pointerdown', (event) => {
    if (!state.individual.photoSrc) return;

    const pos = getCanvasPointerPosition(event);
    const centerX = CANVAS_RESOLUTION / 2;
    const centerY = 530;
    const photoRadius = 240;
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;

    if (Math.sqrt(dx * dx + dy * dy) > photoRadius) return;

    isDraggingIndividualPhoto = true;
    dragStartX = pos.x;
    dragStartY = pos.y;
    initialPhotoOffsetX = state.individual.photoOffsetX;
    initialPhotoOffsetY = state.individual.photoOffsetY;
    canvasInd.style.cursor = 'grabbing';
    canvasInd.setPointerCapture(event.pointerId);
  });

  canvasInd.addEventListener('pointermove', (event) => {
    if (!isDraggingIndividualPhoto) return;

    const pos = getCanvasPointerPosition(event);
    if (state.individual.photoSrc) {
      const photoRadius = 240;
      const drawWidth = state.individual.photoSrc.width * Math.max((photoRadius * 2) / state.individual.photoSrc.width, (photoRadius * 2) / state.individual.photoSrc.height);
      const drawHeight = state.individual.photoSrc.height * Math.max((photoRadius * 2) / state.individual.photoSrc.width, (photoRadius * 2) / state.individual.photoSrc.height);
      const nextOffsetX = initialPhotoOffsetX + (pos.x - dragStartX);
      const nextOffsetY = initialPhotoOffsetY + (pos.y - dragStartY);
      state.individual.photoOffsetX = clampPhotoOffset(nextOffsetX, photoRadius * 2, drawWidth);
      state.individual.photoOffsetY = clampPhotoOffset(nextOffsetY, photoRadius * 2, drawHeight);
    }
    drawIndividualCanvas();
  });

  canvasInd.addEventListener('pointerup', (event) => {
    isDraggingIndividualPhoto = false;
    canvasInd.releasePointerCapture(event.pointerId);
    updateCanvasCursor();
  });

  canvasInd.addEventListener('pointerleave', () => {
    if (!isDraggingIndividualPhoto) {
      updateCanvasCursor();
    }
  });

  canvasInd.addEventListener('pointercancel', () => {
    isDraggingIndividualPhoto = false;
    updateCanvasCursor();
  });

  // =====================================
  // CANVAS DRAWING HELPERS
  // =====================================
  function roundRectPath(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawBadge(ctx, text, centerX, centerY, fontSize, textColor, badgeBg, borderStroke = null, monoFont = false) {
    ctx.font = monoFont
      ? `700 ${fontSize}px ${state.fonts.mono}`
      : `600 ${fontSize}px ${state.fonts.main}`;
    const textWidth = ctx.measureText(text).width;
    const paddingX = 24, paddingY = 12;
    const width = textWidth + paddingX * 2;
    const height = fontSize + paddingY * 2;
    const radius = height / 2;
    const x = centerX - width / 2;
    const y = centerY - height / 2;
    ctx.fillStyle = badgeBg;
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.fill();
    if (borderStroke) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = borderStroke;
      ctx.stroke();
    }
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY + 1);
  }

  // Draw a subtle translucent backing panel for canvas labels
  function drawTranslucentTab(ctx, x, y, width, height, radius = 8) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 4, 16, 0.80)';
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 117, 246, 0.30)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // Render img/bg.png as canvas background with proper cover aspect ratio fitting
  function drawBackgroundBranding(ctx, w, h) {
    if (bgImage.complete && bgImage.naturalWidth > 0) {
      const imgRatio = bgImage.width / bgImage.height;
      const canvasRatio = w / h;
      let sWidth, sHeight, sx, sy;

      if (imgRatio > canvasRatio) {
        sHeight = bgImage.height;
        sWidth = bgImage.height * canvasRatio;
        sx = (bgImage.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = bgImage.width;
        sHeight = bgImage.width / canvasRatio;
        sx = 0;
        sy = (bgImage.height - sHeight) / 2;
      }
      ctx.drawImage(bgImage, sx, sy, sWidth, sHeight, 0, 0, w, h);
    } else {
      // Fallback base gradient - deep indigo to near-black
      const bgGrad = ctx.createRadialGradient(w * 0.4, h * 0.25, 0, w * 0.5, h * 0.5, w * 0.85);
      bgGrad.addColorStop(0,   '#141040');
      bgGrad.addColorStop(0.35,'#0c0828');
      bgGrad.addColorStop(0.7, '#070518');
      bgGrad.addColorStop(1,   '#030209');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawCanvasFrame(ctx, w, h) {
    const borderInset = 35;
    const cornerLength = 40;
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, '#3875f6');
    borderGrad.addColorStop(0.5, '#17c9c6');
    borderGrad.addColorStop(1, '#8838f6');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(borderInset, borderInset, w - borderInset * 2, h - borderInset * 2);
    ctx.strokeStyle = '#17c9c6';
    ctx.lineWidth = 4;
    const c1 = borderInset - 5;
    const c2 = borderInset + cornerLength;
    ctx.beginPath(); ctx.moveTo(c1, c2); ctx.lineTo(c1, c1); ctx.lineTo(c2, c1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - c1, c2); ctx.lineTo(w - c1, c1); ctx.lineTo(w - c2, c1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c1, h - c2); ctx.lineTo(c1, h - c1); ctx.lineTo(c2, h - c1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - c1, h - c2); ctx.lineTo(w - c1, h - c1); ctx.lineTo(w - c2, h - c1); ctx.stroke();
  }

  // =====================================
  // CHANGE 3: INDIVIDUAL CANVAS RENDERER — HHGOA left, TASK 1 right
  // =====================================
  function drawIndividualCanvas() {
    const ctx = ctxInd;
    const w = CANVAS_RESOLUTION;
    const h = CANVAS_RESOLUTION;

    ctx.clearRect(0, 0, w, h);
    drawBackgroundBranding(ctx, w, h);
    drawCanvasFrame(ctx, w, h);

    const headerY = 110;
    const headerX = 80;

    // LEFT: HHGOA in electric blue with translucent tab
    ctx.font = `800 34px ${state.fonts.header}`;
    const hhgoaText = 'HHGOA';
    const hhgoaWidth = ctx.measureText(hhgoaText).width;
    const hhgoaPaddingX = 24;
    const hhgoaPaddingY = 12;
    const hhgoaTabW = hhgoaWidth + hhgoaPaddingX * 2;
    const hhgoaTabH = 34 + hhgoaPaddingY * 2;
    drawTranslucentTab(ctx, headerX, headerY - hhgoaTabH / 2, hhgoaTabW, hhgoaTabH, 8);
    ctx.fillStyle = '#3875f6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(hhgoaText, headerX + hhgoaPaddingX, headerY);

    // RIGHT: TASK 1 with translucent tab
    ctx.font = `700 22px ${state.fonts.mono}`;
    const taskText = 'TASK 1';
    const taskWidth = ctx.measureText(taskText).width;
    const taskPaddingX = 20;
    const taskPaddingY = 10;
    const taskTabW = taskWidth + taskPaddingX * 2;
    const taskTabH = 22 + taskPaddingY * 2;
    drawTranslucentTab(ctx, w - headerX - taskTabW, headerY - taskTabH / 2, taskTabW, taskTabH, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(taskText, w - headerX - taskPaddingX, headerY);

    // Dividing line
    ctx.strokeStyle = 'rgba(56, 117, 246, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headerX, headerY + 38);
    ctx.lineTo(w - headerX, headerY + 38);
    ctx.stroke();

    // Profile photo area
    const centerX = w / 2;
    const centerY = 530;
    const photoRadius = 240;

    // Glow ring
    const innerGlowGrad = ctx.createRadialGradient(centerX, centerY, photoRadius - 20, centerX, centerY, photoRadius + 40);
    innerGlowGrad.addColorStop(0, 'rgba(56, 117, 246, 0)');
    innerGlowGrad.addColorStop(0.8, 'rgba(56, 117, 246, 0.28)');
    innerGlowGrad.addColorStop(1, 'rgba(136, 56, 246, 0)');
    ctx.fillStyle = innerGlowGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, photoRadius + 45, 0, Math.PI * 2);
    ctx.fill();

    // Dashed circle ring
    ctx.strokeStyle = '#17c9c6';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, photoRadius + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Clip photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, photoRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (state.individual.photoSrc) {
      const img = state.individual.photoSrc;
      const scale = Math.max((photoRadius * 2) / img.width, (photoRadius * 2) / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const clampedOffsetX = clampPhotoOffset(state.individual.photoOffsetX, photoRadius * 2, drawWidth);
      const clampedOffsetY = clampPhotoOffset(state.individual.photoOffsetY, photoRadius * 2, drawHeight);
      state.individual.photoOffsetX = clampedOffsetX;
      state.individual.photoOffsetY = clampedOffsetY;
      const drawX = centerX - drawWidth / 2 + clampedOffsetX;
      const drawY = centerY - drawHeight / 2 + clampedOffsetY;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    } else {
      ctx.fillStyle = '#0e0b26';
      ctx.fillRect(centerX - photoRadius, centerY - photoRadius, photoRadius * 2, photoRadius * 2);
      ctx.strokeStyle = 'rgba(23, 201, 198, 0.3)';
      ctx.lineWidth = 6;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(centerX, centerY - 30, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(centerX, centerY + 125, 105, Math.PI, 0); ctx.stroke();
      ctx.font = '72px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(23, 201, 198, 0.1)';
      ctx.fillText('🌴', centerX, centerY + 20);
    }
    ctx.restore();

    // Goa badge
    const badgeAngle = -Math.PI / 4;
    const badgeX = centerX + (photoRadius + 10) * Math.cos(badgeAngle);
    const badgeY = centerY + (photoRadius + 10) * Math.sin(badgeAngle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌴', badgeX, badgeY - 2);

    // Identity section with translucent tabs
    const detailsStart = 870;
    const displayName = state.individual.name || 'YOUR NAME';

    const nameText = displayName.toUpperCase();
    ctx.font = `800 52px ${state.fonts.header}`;
    const nameWidth = ctx.measureText(nameText).width;
    const namePaddingX = 32;
    const namePaddingY = 14;
    const nameTabW = nameWidth + namePaddingX * 2;
    const nameTabH = 52 + namePaddingY * 2;
    const nameCenterY = detailsStart - 20;
    drawTranslucentTab(ctx, centerX - nameTabW / 2, nameCenterY - nameTabH / 2, nameTabW, nameTabH, 10);

    ctx.fillStyle = state.individual.name ? '#ffffff' : 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameText, centerX, nameCenterY);

    const displayStack = (state.individual.stack === 'Other' && state.individual.customStack)
      ? state.individual.customStack
      : state.individual.stack;

    // Use consistent dark translucent background for badges
    drawBadge(ctx, displayStack.toUpperCase(), centerX, detailsStart + 60, 28, '#17c9c6', 'rgba(8, 6, 22, 0.65)', 'rgba(23, 201, 198, 0.45)');

    if (state.individual.builderClass) {
      drawBadge(ctx, state.individual.builderClass.toUpperCase(), centerX, detailsStart + 145, 37, '#ffffff', 'rgba(8, 6, 22, 0.65)', 'rgba(136, 56, 246, 0.55)', true);
    }

    ctx.font = `700 30px ${state.fonts.main}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa', centerX, h - 78);
  }

  // =====================================
  // TEAM CANVAS RENDERER (CHANGE 3 applied here too)
  // =====================================
  function drawTeamCanvas() {
    const ctx = ctxTeam;
    const w = CANVAS_RESOLUTION;
    const h = CANVAS_RESOLUTION;

    ctx.clearRect(0, 0, w, h);
    drawBackgroundBranding(ctx, w, h);
    drawCanvasFrame(ctx, w, h);

    const headerY = 110;
    const headerX = 80;

    // LEFT: HHGOA with translucent tab
    ctx.font = `800 34px ${state.fonts.header}`;
    const hhgoaText = 'HHGOA';
    const hhgoaWidth = ctx.measureText(hhgoaText).width;
    const hhgoaPaddingX = 24;
    const hhgoaPaddingY = 12;
    const hhgoaTabW = hhgoaWidth + hhgoaPaddingX * 2;
    const hhgoaTabH = 34 + hhgoaPaddingY * 2;
    drawTranslucentTab(ctx, headerX, headerY - hhgoaTabH / 2, hhgoaTabW, hhgoaTabH, 8);
    ctx.fillStyle = '#3875f6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(hhgoaText, headerX + hhgoaPaddingX, headerY);

    // RIGHT: TASK 1 with translucent tab
    ctx.font = `700 22px ${state.fonts.mono}`;
    const taskText = 'TASK 1';
    const taskWidth = ctx.measureText(taskText).width;
    const taskPaddingX = 20;
    const taskPaddingY = 10;
    const taskTabW = taskWidth + taskPaddingX * 2;
    const taskTabH = 22 + taskPaddingY * 2;
    drawTranslucentTab(ctx, w - headerX - taskTabW, headerY - taskTabH / 2, taskTabW, taskTabH, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(taskText, w - headerX - taskPaddingX, headerY);

    ctx.strokeStyle = 'rgba(56, 117, 246, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headerX, headerY + 38);
    ctx.lineTo(w - headerX, headerY + 38);
    ctx.stroke();

    const members = state.team.members;

    if (members.length === 0) {
      ctx.font = `500 26px ${state.fonts.main}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD TEAM MEMBERS TO COMPOSE YOUR TEAM FRAME', w / 2, h / 2);
      ctx.font = `16px ${state.fonts.mono}`;
      ctx.fillStyle = 'rgba(23, 201, 198, 0.3)';
      ctx.fillText('Awaiting members...', w / 2, h / 2 + 48);
      drawTeamFrameFooter(ctx, w, h);
      return;
    }

    const count = members.length;
    let gridConfig = [];

    if (count === 1) {
      gridConfig = [{ x: w/2, y: h/2 - 20, width: 450, height: 600, photoRadius: 180, isLarge: true }];
    } else if (count === 2) {
      const cy = h/2 - 20;
      gridConfig = [
        { x: w * 0.28, y: cy, width: 440, height: 580, photoRadius: 130 },
        { x: w * 0.72, y: cy, width: 440, height: 580, photoRadius: 130 }
      ];
    } else if (count === 3) {
      const cy = h/2 - 20;
      gridConfig = [
        { x: w * 0.20, y: cy, width: 320, height: 550, photoRadius: 100 },
        { x: w * 0.50, y: cy, width: 320, height: 550, photoRadius: 100 },
        { x: w * 0.80, y: cy, width: 320, height: 550, photoRadius: 100 }
      ];
    } else if (count === 4) {
      const y1 = h * 0.37, y2 = h * 0.73;
      gridConfig = [
        { x: w * 0.28, y: y1, width: 440, height: 360, photoRadius: 85, isGridCompact: true },
        { x: w * 0.72, y: y1, width: 440, height: 360, photoRadius: 85, isGridCompact: true },
        { x: w * 0.28, y: y2, width: 440, height: 360, photoRadius: 85, isGridCompact: true },
        { x: w * 0.72, y: y2, width: 440, height: 360, photoRadius: 85, isGridCompact: true }
      ];
    } else {
      const y1 = h * 0.37, y2 = h * 0.73;
      gridConfig = [
        { x: w * 0.20, y: y1, width: 320, height: 360, photoRadius: 75, isGridCompact: true },
        { x: w * 0.50, y: y1, width: 320, height: 360, photoRadius: 75, isGridCompact: true },
        { x: w * 0.80, y: y1, width: 320, height: 360, photoRadius: 75, isGridCompact: true },
        { x: w * 0.20, y: y2, width: 320, height: 360, photoRadius: 75, isGridCompact: true },
        { x: w * 0.50, y: y2, width: 320, height: 360, photoRadius: 75, isGridCompact: true }
      ];
      if (count === 6) {
        gridConfig.push({ x: w * 0.80, y: y2, width: 320, height: 360, photoRadius: 75, isGridCompact: true });
      } else {
        gridConfig[3].x = w * 0.33;
        gridConfig[4].x = w * 0.67;
      }
    }

    members.forEach((member, index) => {
      const config = gridConfig[index];
      if (!config) return;
      const { x, y, width, height, photoRadius, isLarge, isGridCompact } = config;

      ctx.fillStyle = 'rgba(16, 13, 35, 0.72)';
      ctx.strokeStyle = 'rgba(56, 117, 246, 0.12)';
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, x - width/2, y - height/2, width, height, 16);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(23, 201, 198, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x - width/2 + 20, y - height/2);
      ctx.lineTo(x + width/2 - 20, y - height/2);
      ctx.stroke();

      const avatarY = isGridCompact ? y - height/2 + photoRadius + 30 : y - height/2 + photoRadius + 45;

      ctx.strokeStyle = '#3875f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, avatarY, photoRadius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, avatarY, photoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (member.photoSrc) {
        const img = member.photoSrc;
        const scale = Math.max((photoRadius * 2) / img.width, (photoRadius * 2) / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, x - dw/2, avatarY - dh/2, dw, dh);
      } else {
        ctx.fillStyle = '#0a081a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 117, 246, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, avatarY - 15, photoRadius * 0.25, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, avatarY + 55, photoRadius * 0.45, Math.PI, 0); ctx.stroke();
      }
      ctx.restore();

      const tAngle = -Math.PI / 4;
      const bX = x + (photoRadius + 3) * Math.cos(tAngle);
      const bY = avatarY + (photoRadius + 3) * Math.sin(tAngle);
      const bRad = isGridCompact ? 16 : 22;
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(bX, bY, bRad, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${isGridCompact ? 14 : 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌴', bX, bY - 1);

      ctx.textAlign = 'center';
      if (isGridCompact) {
        ctx.font = `700 22px ${state.fonts.header}`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(member.name.toUpperCase(), x, y + 60);
        ctx.font = `600 13px ${state.fonts.mono}`;
        ctx.fillStyle = '#17c9c6';
        ctx.fillText(member.stack.toUpperCase(), x, y + 90);
        ctx.font = `700 13px ${state.fonts.mono}`;
        ctx.fillStyle = '#8838f6';
        ctx.fillText(member.builderClass.toUpperCase(), x, y + 120);
      } else {
        const textStartY = avatarY + photoRadius + 45;
        ctx.font = `800 ${isLarge ? 38 : 28}px ${state.fonts.header}`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(member.name.toUpperCase(), x, textStartY);
        drawBadge(ctx, member.stack.toUpperCase(), x, textStartY + (isLarge ? 50 : 42), isLarge ? 19 : 16, '#17c9c6', 'rgba(8, 6, 22, 0.65)', 'rgba(23, 201, 198, 0.45)');
        drawBadge(ctx, member.builderClass.toUpperCase(), x, textStartY + (isLarge ? 120 : 100), isLarge ? 26 : 22, '#ffffff', 'rgba(8, 6, 22, 0.65)', 'rgba(136, 56, 246, 0.55)', true);
      }
    });

    drawTeamFrameFooter(ctx, w, h);
  }

  function drawTeamFrameFooter(ctx, w, h) {
    ctx.font = `700 30px ${state.fonts.main}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('#FrameInGoa', w / 2, h - 78);
  }

  // =====================================
  // CAPTION & SHARING (CHANGE 11 & 12)
  // =====================================
  const SUBMISSION_DOMAIN = window.location.href.split('#')[0];

  function updateIndividualCaption() {
    const name  = state.individual.name;
    const stack = (state.individual.stack === 'Other' && state.individual.customStack)
      ? state.individual.customStack : state.individual.stack;
    const cls   = state.individual.builderClass;

    const caption =
`Just generated my HH Goa 2026 frame from Team NetGlide. 🌴

Name: ${name}
Stack: ${stack}
Builder Class: ${cls}

Create yours and share it with #FrameInGoa.
`

    textareaIndCaption.value = caption;
    const encodedText = encodeURIComponent(caption);
    btnIndShareX.href = `https://twitter.com/intent/post?text=${encodedText}`;
  }

  function updateTeamCaption() {
    const members = state.team.members;
    if (members.length === 0) {
      textareaTeamCaption.value = '';
      btnTeamShareX.href = '';
      btnTeamShareX.classList.add('disabled-link');
      btnTeamCopyCaption.disabled = true;
      btnTeamDownload.disabled = true;
      return;
    }
    btnTeamCopyCaption.disabled = false;
    btnTeamDownload.disabled = false;
    btnTeamShareX.classList.remove('disabled-link');

    const names = members.map(m => m.name).join(', ');
    const caption =
`Team NetGlide is ready for HH Goa 2026. 🚀

Our build squad: ${names}

One team. One frame. One Goa build sprint.

#FrameInGoa
${SUBMISSION_DOMAIN}`;

    textareaTeamCaption.value = caption;
    btnTeamShareX.href = `https://twitter.com/intent/post?text=${encodeURIComponent(caption)}`;
  }

  // CHANGE 11: Copy caption with success feedback
  btnIndCopyCaption.addEventListener('click', () => {
    if (!textareaIndCaption.value) return;
    navigator.clipboard.writeText(textareaIndCaption.value)
      .then(() => showToast('Caption copied!', 'success'))
      .catch(() => showToast('Failed to copy caption.', 'error'));
  });

  btnTeamCopyCaption.addEventListener('click', () => {
    if (!textareaTeamCaption.value) return;
    navigator.clipboard.writeText(textareaTeamCaption.value)
      .then(() => showToast('Team caption copied!', 'success'))
      .catch(() => showToast('Failed to copy caption.', 'error'));
  });

  // CHANGE 10: Download — always re-draws latest canvas before downloading
  function downloadCanvasImage(canvas, filename) {
    showToast('Preparing download...', 'success');
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download started!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Download failed. Try again.', 'error');
    }
  }

  btnIndDownload.addEventListener('click', () => {
    // Re-draw just before download to guarantee latest state
    drawIndividualCanvas();
    const safeName = (state.individual.name || 'frame').replace(/\s+/g, '_');
    downloadCanvasImage(canvasInd, `HHGOA_NetGlide_${safeName}.png`);
  });

  btnTeamDownload.addEventListener('click', () => {
    if (state.team.members.length === 0) return;
    drawTeamCanvas();
    downloadCanvasImage(canvasTeam, 'HHGOA_NetGlide_Team_Frame.png');
  });

  // =====================================
  // TEAMMATE MANAGER CRUD
  // =====================================
  function renderTeammateCards() {
    teammatesListContainer.innerHTML = '';
    const list = state.team.members;
    if (list.length === 0) {
      teammatesListContainer.appendChild(teamEmptyStateMsg);
      return;
    }
    list.forEach(member => {
      const card = document.createElement('div');
      card.className = 'teammate-card';
      const displayStack = (member.stack === 'Other' && member.customStack) ? member.customStack : member.stack;
      card.innerHTML = `
        <div class="teammate-card-left">
          <img src="${member.photoFile ? URL.createObjectURL(member.photoFile) : 'assets/logo.png'}" alt="${member.name}" class="teammate-card-avatar">
          <div class="teammate-card-info">
            <span class="teammate-card-name">${member.name}</span>
            <span class="teammate-card-meta">
              <span>${displayStack}</span>
              <span class="teammate-meta-divider">•</span>
              <span class="teammate-card-class">${member.builderClass}</span>
            </span>
          </div>
        </div>
        <button type="button" class="btn-icon-danger btn-remove-member-trigger" data-id="${member.id}" title="Remove member">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;
      card.querySelector('.btn-remove-member-trigger').addEventListener('click', (e) => {
        removeTeammate(e.currentTarget.getAttribute('data-id'));
      });
      teammatesListContainer.appendChild(card);
    });
  }

  function addTeammate(member) {
    if (state.team.members.length >= 6) {
      showToast('Maximum capacity reached (6 members).', 'error');
      return;
    }
    state.team.members.push({ ...member });
    showToast(`${member.name} added to the squad!`, 'success');
    renderTeammateCards();
    teamSizeCounter.textContent = `${state.team.members.length} / 6 Members`;
    if (state.team.members.length >= 6) btnTriggerAddForm.disabled = true;
    drawTeamCanvas();
    updateTeamCaption();
  }

  function removeTeammate(id) {
    const origLen = state.team.members.length;
    state.team.members = state.team.members.filter(m => m.id !== id);
    if (state.team.members.length < origLen) {
      showToast('Teammate removed', 'success');
      renderTeammateCards();
      teamSizeCounter.textContent = `${state.team.members.length} / 6 Members`;
      btnTriggerAddForm.disabled = false;
      drawTeamCanvas();
      updateTeamCaption();
    }
  }

  btnTriggerAddForm.addEventListener('click', () => {
    teammateFormContainer.classList.remove('hidden');
    btnTriggerAddForm.classList.add('hidden');
    const initStack = 'Full Stack';
    const initClass = getClassForStack(initStack);
    state.team.tempMember = {
      id: Date.now().toString(),
      name: '',
      stack: initStack,
      customStack: '',
      builderClass: initClass,
      photoSrc: null,
      photoFile: null
    };
    inputTeamName.value = '';
    selectTeamStack.value = initStack;
    groupTeamCustomStack.classList.add('hidden');
    inputTeamCustomStack.value = '';
    fileTeamInput.value = '';
    inputTeamClass.value = initClass;
    previewTeamContainer.classList.add('hidden');
    promptTeam.classList.remove('hidden');
  });

  btnCancelTeammate.addEventListener('click', () => {
    teammateFormContainer.classList.add('hidden');
    btnTriggerAddForm.classList.remove('hidden');
  });

  btnSaveTeammate.addEventListener('click', () => {
    const temp = state.team.tempMember;
    const nameVal = inputTeamName.value.trim();
    if (!nameVal) {
      showToast('Please enter a name for the teammate.', 'error');
      return;
    }
    if (!NAME_REGEX.test(nameVal)) {
      showToast('Only letters and spaces are allowed in the name.', 'error');
      return;
    }
    temp.name = nameVal;
    temp.id = Date.now().toString();
    if (temp.stack === 'Other') {
      temp.customStack = inputTeamCustomStack.value.trim() || 'Custom Stack';
    }
    addTeammate(temp);
    teammateFormContainer.classList.add('hidden');
    btnTriggerAddForm.classList.remove('hidden');
  });

  // =====================================
  // INITIAL STATE ON LOAD
  // =====================================
  // CHANGE 4: Name field blank, no pre-filled name
  inputIndName.value = '';
  state.individual.name = '';
  state.individual.nameValid = false;

  // Seed initial builder class for selected (default) stack
  const initClass = getClassForStack(state.individual.stack);
  state.individual.builderClass = initClass;
  inputIndClass.value = initClass;

  selectIndStack.value = state.individual.stack;

  // Initial draw
  drawIndividualCanvas();
  drawTeamCanvas();

  // Fonts ready — redraw with premium typography
  if (document.fonts) {
    document.fonts.ready.then(() => {
      drawIndividualCanvas();
      drawTeamCanvas();
    });
  }

  // Initial validation gate
  validateAndUpdateActionState();

  // Expose for debugging
  window.NetGlideApp = { state, drawIndividualCanvas, drawTeamCanvas, showToast };
});