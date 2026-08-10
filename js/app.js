/* ==========================================================================
   Little Smashers - Application Main Controller & Event Interceptor
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const openKioskSplashBtn = document.getElementById('open-kiosk-splash-btn');
  const controlBar = document.getElementById('control-bar');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const lockToolbarBtn = document.getElementById('lock-toolbar-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const kioskGuideBtn = document.getElementById('kiosk-guide-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const kioskFromSettingsBtn = document.getElementById('kiosk-guide-from-settings');

  // Sub-Options Elements
  const optAnimalStatic = document.getElementById('opt-animal-static');
  const optAnimalFloat = document.getElementById('opt-animal-floating');
  const optBubblePop = document.getElementById('opt-bubble-pop');
  const optBubbleFloat = document.getElementById('opt-bubble-float');

  // Parent Gate Elements
  const parentGateTrigger = document.getElementById('parent-gate-trigger');
  const progressCircle = document.getElementById('gate-progress-circle');

  // Settings Inputs
  const volumeSlider = document.getElementById('volume-slider');
  const volumeVal = document.getElementById('volume-val');
  const synthSelect = document.getElementById('synth-type');
  const popBubblesToggle = document.getElementById('pop-bubbles-toggle');
  const staticAnimalsToggle = document.getElementById('static-animals-toggle');
  const speechToggle = document.getElementById('speech-toggle');
  const particleToggle = document.getElementById('particle-toggle');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const canvasElement = document.getElementById('smash-canvas');

  let isPlaying = false;
  let isDraggingItem = false;
  let parentGateTimer = null;
  let parentGateProgress = 0;
  const GATE_HOLD_DURATION_MS = 3000; // 3 Seconds hold
  const CIRCLE_CIRCUMFERENCE = 113.1; // 2 * PI * 18

  // Fullscreen API detection (iOS Safari supports NONE of these)
  const fullscreenEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled || false;
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;

  // Hide fullscreen button when already running as installed PWA (already fullscreen)
  if (isStandalone && fullscreenBtn) {
    fullscreenBtn.style.display = 'none';
  }

  // Register PWA Service Worker for offline play
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('Little Smashers Service Worker Registered');
    }).catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
  }

  // Initialize Logic Games Engine
  const logicContainer = document.getElementById('logic-game-container');
  if (window.logicGamesEngine && logicContainer) {
    window.logicGamesEngine.init(logicContainer);
  }

  // Prevent Default Touch & Context Menu Gestures (Web Kiosk Controls)
  document.addEventListener('touchstart', (e) => {
    // Only allow touches inside parent modals, control bar, or logic game container
    if (!isPlaying && startOverlay.classList.contains('active')) return;
    if (e.target.closest('.modal-card') || e.target.closest('.control-bar') || e.target.closest('#parent-gate-trigger') || e.target.closest('#logic-game-container')) return;

    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.modal-card') || e.target.closest('#logic-game-container')) return;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Touch & Pointer Down Handler (Smash / Drag Animal / Pop Bubble)
  document.addEventListener('pointerdown', (e) => {
    // Ignore interactive UI elements
    if (e.target.closest('.modal-card') || e.target.closest('.control-bar') || e.target.closest('#parent-gate-trigger') || e.target.closest('#start-overlay') || e.target.closest('#logic-game-container')) {
      return;
    }

    if (!isPlaying) return;

    // Ensure Web Audio context is un-suspended on touch
    window.soundEngine.ensureContext();

    // Check if touching an animal to drag in Animals mode
    if (window.modeManager.currentMode === 'animals' && window.modeManager.staticAnimals) {
      const animal = window.canvasEngine.getAnimalAt(e.clientX, e.clientY);
      if (animal) {
        window.canvasEngine.startDrag(animal, e.clientX, e.clientY);
        isDraggingItem = true;
        window.soundEngine.playTone();
        return;
      }
    }

    // Trigger smash effect / bubble pop / spawn animal for touch point
    window.modeManager.handleSmash(e.clientX, e.clientY);
  });

  // Pointer Move Handler (Dragging animals around)
  document.addEventListener('pointermove', (e) => {
    if (isDraggingItem) {
      window.canvasEngine.moveDrag(e.clientX, e.clientY);
    }
  });

  // Pointer Up & Cancel Handler (End dragging)
  const handlePointerEnd = () => {
    if (isDraggingItem) {
      window.canvasEngine.endDrag();
      isDraggingItem = false;
    }
  };

  document.addEventListener('pointerup', handlePointerEnd);
  document.addEventListener('pointercancel', handlePointerEnd);

  // Keyboard Smash Handler (Physical / Bluetooth Keyboard)
  document.addEventListener('keydown', (e) => {
    // Allow typing inside setting inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    // Prevent default browser shortcuts (e.g., F5 refresh, Tab, Space page scroll)
    if (['Space', 'Tab', 'F5', 'F11', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }

    if (!isPlaying) return;

    window.soundEngine.ensureContext();
    window.modeManager.handleSmash(null, null, e.key);
  });

  // Request Fullscreen (with webkit prefix fallback)
  function requestFullscreenMode() {
    const el = document.documentElement;
    const currentFs = document.fullscreenElement || document.webkitFullscreenElement;

    if (fullscreenEnabled && !currentFs) {
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rfs) rfs.call(el).catch(() => {});
    } else if (!fullscreenEnabled && !isStandalone) {
      // No Fullscreen API (iOS Safari) — show a helpful toast
      showFullscreenToast();
    }
  }

  // Toast helper for iOS: guides parents to Add to Home Screen
  function showFullscreenToast() {
    const existing = document.getElementById('ios-fs-toast');
    if (existing) existing.remove();

    // Detect iOS non-Safari browsers (Chrome, Firefox, Edge all use WebKit but can't install PWAs)
    const isIOSNonSafari = /CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);
    const message = isIOSNonSafari
      ? '📱 For fullscreen, open this page in <strong>Safari</strong> → tap <strong>Share</strong> ↗ → <strong>Add to Home Screen</strong>'
      : '📱 For fullscreen on iOS, tap <strong>Share</strong> ↗ then <strong>Add to Home Screen</strong>';

    const toast = document.createElement('div');
    toast.id = 'ios-fs-toast';
    toast.className = 'ios-fullscreen-toast';
    toast.innerHTML = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    const dismiss = () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    };

    setTimeout(dismiss, 5000);
    toast.addEventListener('click', dismiss);
  }

  // Start Playing Action — requests fullscreen only when the API exists
  startBtn.addEventListener('click', () => {
    startOverlay.classList.remove('active');
    controlBar.classList.remove('hidden');
    parentGateTrigger.classList.add('hidden');
    isPlaying = true;
    window.soundEngine.ensureContext();
    if (fullscreenEnabled) requestFullscreenMode();
  });

  openKioskSplashBtn.addEventListener('click', () => {
    window.kioskGuide.show();
  });

  // Lock Toolbar into Toddler Play Mode (Hides Toolbar & Shows 3-second Parental Lock Icon)
  if (lockToolbarBtn) {
    lockToolbarBtn.addEventListener('click', () => {
      controlBar.classList.add('hidden');
      parentGateTrigger.classList.remove('hidden');
    });
  }

  // Fullscreen Button — toggles fullscreen or shows iOS toast
  fullscreenBtn.addEventListener('click', () => {
    const currentFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (currentFs) {
      const efs = document.exitFullscreen || document.webkitExitFullscreen;
      if (efs) efs.call(document).catch(() => {});
    } else {
      requestFullscreenMode();
    }
  });

  // Sensory Mode Selection Buttons (Shows sub-options on tap, toggles if already active)
  modeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const clickedBtn = e.currentTarget;
      const selectedMode = clickedBtn.getAttribute('data-mode');

      if (window.modeManager.currentMode === selectedMode) {
        window.modeManager.toggleSubOptions();
      } else {
        modeBtns.forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
        window.modeManager.setMode(selectedMode);
      }
    });
  });

  // Sub-Options Bar Buttons (Retracts menu once selected)
  if (optAnimalStatic) {
    optAnimalStatic.addEventListener('click', () => {
      window.modeManager.setStaticAnimals(true);
    });
  }
  if (optAnimalFloat) {
    optAnimalFloat.addEventListener('click', () => {
      window.modeManager.setStaticAnimals(false);
    });
  }
  if (optBubblePop) {
    optBubblePop.addEventListener('click', () => {
      window.modeManager.setPoppableBubbles(true);
    });
  }
  if (optBubbleFloat) {
    optBubbleFloat.addEventListener('click', () => {
      window.modeManager.setPoppableBubbles(false);
    });
  }

  // Parent Gate Hold-to-Unlock Controller (3 Seconds Hold to restore toolbar WITHOUT exiting fullscreen)
  function startParentGateHold() {
    parentGateProgress = 0;
    const interval = 50;
    const increment = (interval / GATE_HOLD_DURATION_MS) * 100;

    parentGateTimer = setInterval(() => {
      parentGateProgress += increment;
      const dashOffset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * (parentGateProgress / 100));
      progressCircle.style.strokeDashoffset = Math.max(0, dashOffset);

      if (parentGateProgress >= 100) {
        clearInterval(parentGateTimer);
        parentGateTimer = null;
        
        // Restore Toolbar & Hide 3s Lock Icon WITHOUT exiting fullscreen!
        controlBar.classList.remove('hidden');
        parentGateTrigger.classList.add('hidden');

        resetParentGateCircle();
      }
    }, interval);
  }

  function stopParentGateHold() {
    if (parentGateTimer) {
      clearInterval(parentGateTimer);
      parentGateTimer = null;
    }
    resetParentGateCircle();
  }

  function resetParentGateCircle() {
    parentGateProgress = 0;
    progressCircle.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
  }

  parentGateTrigger.addEventListener('pointerdown', startParentGateHold);
  parentGateTrigger.addEventListener('pointerup', stopParentGateHold);
  parentGateTrigger.addEventListener('pointerleave', stopParentGateHold);

  // Modal Dialog Handlers
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  saveSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  kioskGuideBtn.addEventListener('click', () => {
    window.kioskGuide.show();
  });

  kioskFromSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    window.kioskGuide.show();
  });

  // Settings Configuration Controls
  volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    volumeVal.textContent = `${val}%`;
    window.soundEngine.setVolume(val / 100);
  });

  synthSelect.addEventListener('change', (e) => {
    window.soundEngine.setTheme(e.target.value);
  });

  popBubblesToggle.addEventListener('change', (e) => {
    window.modeManager.setPoppableBubbles(e.target.checked);
  });

  staticAnimalsToggle.addEventListener('change', (e) => {
    window.modeManager.setStaticAnimals(e.target.checked);
  });

  speechToggle.addEventListener('change', (e) => {
    window.soundEngine.setSpeechEnabled(e.target.checked);
  });

  particleToggle.addEventListener('change', (e) => {
    window.canvasEngine.setHighDensity(e.target.checked);
  });

  darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      canvasElement.classList.add('dark-mode');
    } else {
      canvasElement.classList.remove('dark-mode');
    }
  });
});
