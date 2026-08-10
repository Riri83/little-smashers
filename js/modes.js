/* ==========================================================================
   Little Smashers - Sensory Game Modes Controller
   ========================================================================== */

class GameModeManager {
  constructor() {
    this.currentMode = 'shapes'; // Default mode

    this.poppableBubbles = true;
    this.staticAnimals = true;
    this.subOptionsOpen = false; // Track if flyout sub-menu is visible

    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    this.animals = [
      { emoji: '🐶', name: 'dog', sound: 'dog' },
      { emoji: '🐱', name: 'cat', sound: 'cat' },
      { emoji: '🐥', name: 'bird', sound: 'bird' },
      { emoji: '🦁', name: 'lion', sound: 'lion' },
      { emoji: '🦆', name: 'duck', sound: 'duck' },
      { emoji: '🐸', name: 'frog', sound: 'bird' },
      { emoji: '🐵', name: 'monkey', sound: 'cat' },
      { emoji: '🐼', name: 'panda', sound: 'dog' },
      { emoji: '🦄', name: 'unicorn', sound: 'chimes' },
      { emoji: '🐰', name: 'bunny', sound: 'bird' }
    ];

    this.shapes = ['circle', 'star', 'heart'];
    this.colors = [
      '#FF7675', '#74B9FF', '#55E6C1', '#F8C291',
      '#E056FD', '#F9CA24', '#00CEC9', '#FD79A8'
    ];
  }

  setMode(mode) {
    if (['shapes', 'abc', 'animals', 'music', 'bubbles', 'logic'].includes(mode)) {
      this.currentMode = mode;

      // Show/hide Logic Puzzles overlay
      if (window.logicGamesEngine) {
        if (mode === 'logic') {
          window.logicGamesEngine.show();
        } else {
          window.logicGamesEngine.hide();
        }
      }

      // When selecting a main game mode with sub-options (animals/bubbles), open flyout sub-menu
      if (mode === 'animals' || mode === 'bubbles') {
        this.subOptionsOpen = true;
      } else {
        this.subOptionsOpen = false;
      }

      // Clean up previous mode's items from canvas when switching games
      if (window.canvasEngine) {
        window.canvasEngine.clearAll();
      }

      this.updateSubToggleUI();
    }
  }

  toggleSubOptions() {
    this.subOptionsOpen = !this.subOptionsOpen;
    this.updateSubToggleUI();
  }

  setPoppableBubbles(enable) {
    this.poppableBubbles = enable;
    // Retract sub-menu once a choice is selected
    this.subOptionsOpen = false;
    this.updateSubToggleUI();
  }

  setStaticAnimals(enable) {
    this.staticAnimals = enable;
    if (!enable && window.canvasEngine) {
      window.canvasEngine.clearAll();
    }
    // Retract sub-menu once a choice is selected
    this.subOptionsOpen = false;
    this.updateSubToggleUI();
  }

  updateSubToggleUI() {
    const animalsGroup = document.getElementById('sub-opt-animals');
    const bubblesGroup = document.getElementById('sub-opt-bubbles');

    const optAnimalStatic = document.getElementById('opt-animal-static');
    const optAnimalFloat = document.getElementById('opt-animal-floating');
    const optBubblePop = document.getElementById('opt-bubble-pop');
    const optBubbleFloat = document.getElementById('opt-bubble-float');

    const popToggle = document.getElementById('pop-bubbles-toggle');
    const staticToggle = document.getElementById('static-animals-toggle');

    if (!animalsGroup || !bubblesGroup) return;

    // Sync settings modal checkboxes
    if (popToggle) popToggle.checked = this.poppableBubbles;
    if (staticToggle) staticToggle.checked = this.staticAnimals;

    if (this.currentMode === 'animals' && this.subOptionsOpen) {
      animalsGroup.classList.remove('hidden');
      bubblesGroup.classList.add('hidden');

      if (this.staticAnimals) {
        optAnimalStatic.classList.add('active');
        optAnimalFloat.classList.remove('active');
      } else {
        optAnimalStatic.classList.remove('active');
        optAnimalFloat.classList.add('active');
      }
    } else if (this.currentMode === 'bubbles' && this.subOptionsOpen) {
      bubblesGroup.classList.remove('hidden');
      animalsGroup.classList.add('hidden');

      if (this.poppableBubbles) {
        optBubblePop.classList.add('active');
        optBubbleFloat.classList.remove('active');
      } else {
        optBubblePop.classList.remove('active');
        optBubbleFloat.classList.add('active');
      }
    } else {
      animalsGroup.classList.add('hidden');
      bubblesGroup.classList.add('hidden');
    }
  }

  // Process input event at screen position (x, y) with optional keyboard key
  handleSmash(x, y, key = null) {
    const canvas = window.canvasEngine;
    const audio = window.soundEngine;

    // Default coordinates if keyboard smash (center-ish or random variance)
    const posX = x !== null ? x : window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6);
    const posY = y !== null ? y : window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.6);

    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

    switch (this.currentMode) {
      case 'shapes':
        this.processShapesMode(posX, posY, randomColor, canvas, audio);
        break;

      case 'abc':
        this.processAbcMode(posX, posY, key, randomColor, canvas, audio);
        break;

      case 'animals':
        this.processAnimalsMode(posX, posY, canvas, audio);
        break;

      case 'music':
        this.processMusicMode(posX, posY, canvas, audio);
        break;

      case 'bubbles':
        this.processBubblesMode(posX, posY, randomColor, canvas, audio);
        break;

      case 'logic':
        canvas.spawnExplosion(posX, posY, randomColor);
        audio.playTone();
        break;
    }
  }

  processShapesMode(x, y, color, canvas, audio) {
    const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    canvas.spawnExplosion(x, y, color);
    canvas.spawnShape(x, y, shape, color);
    audio.playTone();
  }

  processAbcMode(x, y, key, color, canvas, audio) {
    let char = '';
    if (key && key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
      char = key.toUpperCase();
    } else {
      char = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
    }

    canvas.spawnExplosion(x, y, color);
    canvas.spawnText(x, y, char, color);
    audio.playTone();

    // Text-to-speech for baby learning!
    audio.speak(char);
  }

  processAnimalsMode(x, y, canvas, audio) {
    const animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    canvas.spawnExplosion(x, y, '#55E6C1');
    canvas.spawnAnimal(x, y, animal.emoji, this.staticAnimals);
    audio.playAnimalSound(animal.sound);
  }

  processMusicMode(x, y, canvas, audio) {
    // Map screen X position to musical note pitch index (0 to 15)
    const noteIndex = Math.floor((x / window.innerWidth) * 15);
    const color = this.colors[noteIndex % this.colors.length];

    canvas.spawnExplosion(x, y, color);
    audio.playTone(noteIndex);
  }

  processBubblesMode(x, y, color, canvas, audio) {
    if (this.poppableBubbles) {
      // Check if tapping an existing bubble to pop it
      const popped = canvas.checkBubblePop(x, y);
      if (popped) return; // Bubble popped!
    }

    // Otherwise, spawn a new bubble
    canvas.spawnExplosion(x, y, color);
    canvas.spawnBubble(x, y, color);
    audio.playPop();
  }
}

window.modeManager = new GameModeManager();
