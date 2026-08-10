/* ==========================================================================
   Little Smashers - LogicLike Puzzles & Early Learning Games Suite (15 Games, Ages 0 to 4)
   ========================================================================== */

class LogicGamesEngine {
  constructor() {
    this.container = null;
    this.active = false;
    this.currentSubGame = 'odd_one_out'; // 15 Sub-Games!
    this.ageLevel = 'toddler'; // 'baby' (0-2 yrs) or 'toddler' (2-4 yrs)
    this.theme = 'boy'; // 'boy', 'girl', 'neutral'

    this.stars = 0;
    this.streak = 0;

    // Theme Configs
    this.themes = {
      boy: {
        id: 'boy',
        avatar: '👦',
        name: 'Superhero Hero',
        accent: '#2980b9',
        badge: '🦸‍♂️',
        cheerMessage: 'Super Hero!',
        rewards: ['🦸‍♂️', '🦖', '🚀', '🏎️', '⚡', '🏆']
      },
      girl: {
        id: 'girl',
        avatar: '👧',
        name: 'Princess Hero',
        accent: '#e84393',
        badge: '👸',
        cheerMessage: 'Princess Power!',
        rewards: ['👸', '🦄', '🧚‍♀️', '👑', '💖', '🌟']
      },
      neutral: {
        id: 'neutral',
        avatar: '🦊',
        name: 'Animal Explorer',
        accent: '#00b894',
        badge: '🦊',
        cheerMessage: 'Great Explorer!',
        rewards: ['🦊', '🐻', '🌈', '⭐', '🎈', '🎉']
      }
    };

    // Alphabet reference
    this.upperAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.lowerAlpha = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Item pools
    this.pools = {
      fruits: [
        { emoji: '🍎', name: 'apple', color: 'red' },
        { emoji: '🍌', name: 'banana', color: 'yellow' },
        { emoji: '🍓', name: 'strawberry', color: 'red' },
        { emoji: '🍊', name: 'orange', color: 'orange' },
        { emoji: '🍇', name: 'grapes', color: 'purple' },
        { emoji: '🍉', name: 'watermelon', color: 'green' }
      ],
      vehicles: [
        { emoji: '🚗', name: 'car', color: 'red' },
        { emoji: '🚀', name: 'rocket', color: 'red' },
        { emoji: '✈️', name: 'airplane', color: 'blue' },
        { emoji: '🚒', name: 'fire truck', color: 'red' },
        { emoji: '🚜', name: 'tractor', color: 'green' },
        { emoji: '⛵', name: 'boat', color: 'blue' }
      ],
      animals: [
        { emoji: '🐶', name: 'dog', weight: 5 },
        { emoji: '🐱', name: 'cat', weight: 3 },
        { emoji: '🐥', name: 'bird', weight: 1 },
        { emoji: '🐘', name: 'elephant', weight: 10 },
        { emoji: '🐼', name: 'panda', weight: 8 },
        { emoji: '🐰', name: 'bunny', weight: 2 }
      ],
      shapes: [
        { emoji: '🔴', name: 'red circle', shape: 'circle', color: 'red' },
        { emoji: '🟦', name: 'blue square', shape: 'square', color: 'blue' },
        { emoji: '⭐️', name: 'yellow star', shape: 'star', color: 'yellow' },
        { emoji: '💚', name: 'green heart', shape: 'heart', color: 'green' },
        { emoji: '🔺', name: 'red triangle', shape: 'triangle', color: 'red' }
      ]
    };
  }

  init(containerElement) {
    this.container = containerElement;
  }

  show() {
    if (!this.container) return;
    this.active = true;
    this.container.classList.remove('hidden');
    this.render();
    this.generatePuzzle();
  }

  hide() {
    if (!this.container) return;
    this.active = false;
    this.container.classList.add('hidden');
  }

  setTheme(themeKey) {
    if (this.themes[themeKey]) {
      this.theme = themeKey;
      this.renderHeader();
      this.applyThemeClass();
    }
  }

  setAgeLevel(level) {
    if (['baby', 'toddler'].includes(level)) {
      this.ageLevel = level;
      this.renderHeader();
      this.generatePuzzle();
    }
  }

  setSubGame(gameKey) {
    const validGames = [
      'odd_one_out', 'shadow_match', 'pattern', 'sorting', 'memory', 'counting',
      'size_compare', 'shape_assembly', 'dot_to_dot', 'color_paint', 'balance_scale', 'mini_sudoku',
      'letter_match', 'letter_sequence', 'number_100', 'number_tens'
    ];
    if (validGames.includes(gameKey)) {
      this.currentSubGame = gameKey;
      this.renderNav();
      this.generatePuzzle();
    }
  }

  applyThemeClass() {
    if (!this.container) return;
    this.container.classList.remove('theme-boy', 'theme-girl', 'theme-neutral');
    this.container.classList.add(`theme-${this.theme}`);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="logic-wrapper theme-${this.theme}">
        <!-- Header Controls & Avatar Bar -->
        <div id="logic-header" class="logic-header"></div>

        <!-- Sub-Game Navigation Tabs (15 Games) -->
        <div id="logic-nav" class="logic-nav"></div>

        <!-- Main Game Interactive Canvas Area -->
        <div id="logic-stage" class="logic-stage"></div>

        <!-- Victory Celebration Overlay -->
        <div id="logic-celebration" class="logic-celebration hidden"></div>
      </div>
    `;

    this.renderHeader();
    this.renderNav();
  }

  renderHeader() {
    const headerEl = this.container.querySelector('#logic-header');
    if (!headerEl) return;

    const themeConfig = this.themes[this.theme];

    headerEl.innerHTML = `
      <div class="header-left">
        <!-- Avatar Selector Switcher -->
        <div class="avatar-profile-btn" id="avatar-toggle-btn" title="Change Theme & Character">
          <span class="avatar-emoji">${themeConfig.avatar}</span>
          <div class="avatar-info">
            <span class="avatar-name">${themeConfig.name}</span>
            <span class="avatar-sub">Tap 👦/👧/🦊</span>
          </div>
        </div>

        <!-- Age Level Selector Switcher -->
        <div class="age-selector">
          <button class="age-pill ${this.ageLevel === 'baby' ? 'active' : ''}" data-age="baby">
            👶 0-2 Baby
          </button>
          <button class="age-pill ${this.ageLevel === 'toddler' ? 'active' : ''}" data-age="toddler">
            🧒 2-4 Toddler
          </button>
        </div>
      </div>

      <div class="header-right">
        <!-- Stars counter -->
        <div class="star-badge">
          <span class="star-icon">⭐</span>
          <span class="star-count" id="star-count-num">${this.stars}</span>
        </div>
      </div>
    `;

    headerEl.querySelector('#avatar-toggle-btn').addEventListener('click', () => {
      const themeKeys = ['boy', 'girl', 'neutral'];
      const nextIdx = (themeKeys.indexOf(this.theme) + 1) % themeKeys.length;
      this.setTheme(themeKeys[nextIdx]);
    });

    headerEl.querySelectorAll('.age-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const age = e.currentTarget.getAttribute('data-age');
        this.setAgeLevel(age);
      });
    });
  }

  renderNav() {
    const navEl = this.container.querySelector('#logic-nav');
    if (!navEl) return;

    const games = [
      { id: 'odd_one_out', label: 'Odd One Out', icon: '🔍' },
      { id: 'shadow_match', label: 'Shadow Match', icon: '👤' },
      { id: 'pattern', label: 'Patterns', icon: '➡️' },
      { id: 'sorting', label: 'Sort Bins', icon: '📦' },
      { id: 'memory', label: 'Memory Flip', icon: '🃏' },
      { id: 'counting', label: '1-2-3 Count', icon: '🔢' },
      { id: 'size_compare', label: 'Size Compare', icon: '📏' },
      { id: 'shape_assembly', label: 'Shape Puzzle', icon: '🧩' },
      { id: 'dot_to_dot', label: 'Dot-to-Dot', icon: '✏️' },
      { id: 'color_paint', label: 'Color Paint', icon: '🎨' },
      { id: 'balance_scale', label: 'Balance Scale', icon: '⚖️' },
      { id: 'mini_sudoku', label: 'Mini Sudoku', icon: '🟩' },
      { id: 'letter_match', label: 'Aa Match', icon: '🔤' },
      { id: 'letter_sequence', label: 'ABC Order', icon: '🔤' },
      { id: 'number_100', label: '1-100 Numbers', icon: '💯' },
      { id: 'number_tens', label: '10s to 100', icon: '🔢' }
    ];

    navEl.innerHTML = games.map(g => `
      <button class="logic-tab ${this.currentSubGame === g.id ? 'active' : ''}" data-game="${g.id}">
        <span class="tab-icon">${g.icon}</span>
        <span class="tab-label">${g.label}</span>
      </button>
    `).join('');

    navEl.querySelectorAll('.logic-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameId = e.currentTarget.getAttribute('data-game');
        this.setSubGame(gameId);
      });
    });
  }

  generatePuzzle() {
    const stageEl = this.container.querySelector('#logic-stage');
    if (!stageEl) return;

    switch (this.currentSubGame) {
      case 'odd_one_out': this.generateOddOneOut(stageEl); break;
      case 'shadow_match': this.generateShadowMatch(stageEl); break;
      case 'pattern': this.generatePattern(stageEl); break;
      case 'sorting': this.generateSorting(stageEl); break;
      case 'memory': this.generateMemory(stageEl); break;
      case 'counting': this.generateCounting(stageEl); break;
      case 'size_compare': this.generateSizeCompare(stageEl); break;
      case 'shape_assembly': this.generateShapeAssembly(stageEl); break;
      case 'dot_to_dot': this.generateDotToDot(stageEl); break;
      case 'color_paint': this.generateColorPaint(stageEl); break;
      case 'balance_scale': this.generateBalanceScale(stageEl); break;
      case 'mini_sudoku': this.generateMiniSudoku(stageEl); break;
      case 'letter_match': this.generateLetterMatch(stageEl); break;
      case 'letter_sequence': this.generateLetterSequence(stageEl); break;
      case 'number_100': this.generateNumber100(stageEl); break;
      case 'number_tens': this.generateNumberTens(stageEl); break;
    }
  }

  /* ------------------------------------------------------------------------
     EXISTING GAMES 1-12
     ------------------------------------------------------------------------ */
  generateOddOneOut(stageEl) {
    const count = this.ageLevel === 'baby' ? 3 : 4;
    const categories = ['fruits', 'vehicles', 'animals', 'shapes'];
    const mainCat = categories[Math.floor(Math.random() * categories.length)];
    let oddCat = categories[Math.floor(Math.random() * categories.length)];
    while (oddCat === mainCat) {
      oddCat = categories[Math.floor(Math.random() * categories.length)];
    }

    const mainItems = [...this.pools[mainCat]].sort(() => Math.random() - 0.5).slice(0, count - 1);
    const oddItem = [...this.pools[oddCat]].sort(() => Math.random() - 0.5)[0];

    const cards = [...mainItems.map(item => ({ ...item, isOdd: false })), { ...oddItem, isOdd: true }];
    cards.sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🔍 Which one is different?</h2>
        <div class="cards-grid cols-${cards.length}">
          ${cards.map(card => `
            <div class="logic-card puzzle-item" data-odd="${card.isOdd}" data-name="${card.name}">
              <span class="card-emoji">${card.emoji}</span>
              <span class="card-label">${card.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.puzzle-item').forEach(card => {
      card.addEventListener('click', (e) => {
        const isOdd = e.currentTarget.getAttribute('data-odd') === 'true';
        const name = e.currentTarget.getAttribute('data-name');
        if (isOdd) {
          e.currentTarget.classList.add('correct');
          this.handleSuccess(name);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateShadowMatch(stageEl) {
    const pairCount = this.ageLevel === 'baby' ? 2 : 3;
    const allItems = [...this.pools.animals, ...this.pools.fruits, ...this.pools.vehicles].sort(() => Math.random() - 0.5);
    const selected = allItems.slice(0, pairCount);

    const draggables = [...selected].sort(() => Math.random() - 0.5);
    const targets = [...selected];
    this.shadowMatchedCount = 0;

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">👤 Tap an item, then tap its shadow!</h2>
        <div class="shadow-match-container">
          <div class="draggable-source-row">
            ${draggables.map(item => `
              <div class="logic-card shadow-source" data-name="${item.name}">
                <span class="card-emoji">${item.emoji}</span>
              </div>
            `).join('')}
          </div>

          <div class="shadow-target-row">
            ${targets.map(item => `
              <div class="shadow-target-slot" data-target="${item.name}">
                <span class="shadow-emoji">${item.emoji}</span>
                <span class="shadow-label">Match here</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    let selectedSource = null;
    stageEl.querySelectorAll('.shadow-source').forEach(card => {
      card.addEventListener('click', (e) => {
        stageEl.querySelectorAll('.shadow-source').forEach(c => c.classList.remove('selected'));
        if (selectedSource === e.currentTarget) {
          selectedSource = null;
        } else {
          selectedSource = e.currentTarget;
          selectedSource.classList.add('selected');
          if (window.soundEngine) window.soundEngine.playTone(5);
        }
      });
    });

    stageEl.querySelectorAll('.shadow-target-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (!selectedSource) return;
        const sourceName = selectedSource.getAttribute('data-name');
        const targetName = e.currentTarget.getAttribute('data-target');

        if (sourceName === targetName) {
          e.currentTarget.classList.add('matched');
          e.currentTarget.innerHTML = selectedSource.innerHTML;
          selectedSource.style.visibility = 'hidden';
          selectedSource.classList.remove('selected');
          selectedSource = null;

          this.shadowMatchedCount++;
          if (window.soundEngine) window.soundEngine.playTone(10);

          if (this.shadowMatchedCount === pairCount) {
            this.handleSuccess('Matching Shadows');
          }
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generatePattern(stageEl) {
    const patternTypes = [
      ['🔴', '🔵', '🔴', '🔵'],
      ['🐶', '🐱', '🐶', '🐱'],
      ['⭐️', '🌙', '⭐️', '🌙'],
      ['🍎', '🍌', '🍎', '🍌'],
      ['🚗', '✈️', '🚗', '✈️']
    ];

    const chosenPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const correctAns = chosenPattern[0];

    let wrongOptions = ['🟡', '🐸', '☀️', '🍇', '🚀'].filter(x => x !== correctAns);
    wrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, this.ageLevel === 'baby' ? 1 : 2);

    const choices = [correctAns, ...wrongOptions].sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">➡️ What comes next in the pattern?</h2>
        <div class="pattern-sequence">
          ${chosenPattern.map(item => `<div class="pattern-item">${item}</div>`).join('')}
          <div class="pattern-item question-box">❓</div>
        </div>

        <div class="pattern-choices">
          ${choices.map(choice => `
            <button class="logic-card pattern-choice-btn" data-choice="${choice}">
              <span class="card-emoji">${choice}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.pattern-choice-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.getAttribute('data-choice');
        if (val === correctAns) {
          e.currentTarget.classList.add('correct');
          stageEl.querySelector('.question-box').textContent = correctAns;
          stageEl.querySelector('.question-box').classList.add('solved');
          this.handleSuccess('Pattern Solved');
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateSorting(stageEl) {
    const binPairs = [
      { bin1: { label: 'Fruits 🍎', cat: 'fruits' }, bin2: { label: 'Animals 🐶', cat: 'animals' } },
      { bin1: { label: 'Vehicles 🚗', cat: 'vehicles' }, bin2: { label: 'Shapes 🔴', cat: 'shapes' } }
    ];

    const chosen = binPairs[Math.floor(Math.random() * binPairs.length)];
    const itemCount = this.ageLevel === 'baby' ? 2 : 4;

    const items1 = [...this.pools[chosen.bin1.cat]].sort(() => Math.random() - 0.5).slice(0, itemCount / 2).map(i => ({ ...i, targetBin: 'bin1' }));
    const items2 = [...this.pools[chosen.bin2.cat]].sort(() => Math.random() - 0.5).slice(0, itemCount / 2).map(i => ({ ...i, targetBin: 'bin2' }));

    const allItems = [...items1, ...items2].sort(() => Math.random() - 0.5);
    this.sortedCount = 0;

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">📦 Tap an item, then tap its matching Bin!</h2>
        <div class="sort-items-pool">
          ${allItems.map(item => `
            <div class="logic-card sort-item" data-bin="${item.targetBin}">
              <span class="card-emoji">${item.emoji}</span>
              <span class="card-label">${item.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="sort-bins-row">
          <div class="sort-bin bin-box" data-binid="bin1">
            <div class="bin-header">${chosen.bin1.label}</div>
            <div class="bin-content" id="bin1-content"></div>
          </div>
          <div class="sort-bin bin-box" data-binid="bin2">
            <div class="bin-header">${chosen.bin2.label}</div>
            <div class="bin-content" id="bin2-content"></div>
          </div>
        </div>
      </div>
    `;

    let selectedSortItem = null;
    stageEl.querySelectorAll('.sort-item').forEach(card => {
      card.addEventListener('click', (e) => {
        stageEl.querySelectorAll('.sort-item').forEach(c => c.classList.remove('selected'));
        if (selectedSortItem === e.currentTarget) {
          selectedSortItem = null;
        } else {
          selectedSortItem = e.currentTarget;
          selectedSortItem.classList.add('selected');
          if (window.soundEngine) window.soundEngine.playTone(5);
        }
      });
    });

    stageEl.querySelectorAll('.sort-bin').forEach(bin => {
      bin.addEventListener('click', (e) => {
        if (!selectedSortItem) return;
        const itemTargetBin = selectedSortItem.getAttribute('data-bin');
        const clickedBinId = e.currentTarget.getAttribute('data-binid');

        if (itemTargetBin === clickedBinId) {
          const contentArea = e.currentTarget.querySelector('.bin-content');
          const badge = document.createElement('span');
          badge.className = 'bin-badge-emoji';
          badge.textContent = selectedSortItem.querySelector('.card-emoji').textContent;
          contentArea.appendChild(badge);

          selectedSortItem.style.visibility = 'hidden';
          selectedSortItem.classList.remove('selected');
          selectedSortItem = null;

          this.sortedCount++;
          if (window.soundEngine) window.soundEngine.playTone(8);

          if (this.sortedCount === itemCount) {
            this.handleSuccess('Sorting Complete');
          }
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateMemory(stageEl) {
    const pairCount = this.ageLevel === 'baby' ? 2 : 3;
    const icons = ['🐶', '🐱', '🚀', '🍎', '⭐️', '👑'].sort(() => Math.random() - 0.5).slice(0, pairCount);

    const cards = [];
    icons.forEach((icon, i) => {
      cards.push({ id: i, icon });
      cards.push({ id: i, icon });
    });
    cards.sort(() => Math.random() - 0.5);

    let firstFlipped = null;
    let lockBoard = false;
    let matchesFound = 0;

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🃏 Flip cards to find matching pairs!</h2>
        <div class="memory-grid cols-${cards.length}">
          ${cards.map(c => `
            <div class="memory-card" data-pairid="${c.id}">
              <div class="memory-card-inner">
                <div class="memory-card-front">❓</div>
                <div class="memory-card-back">${c.icon}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.memory-card').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        if (lockBoard || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        if (window.soundEngine) window.soundEngine.playTone(6);

        if (!firstFlipped) {
          firstFlipped = cardEl;
        } else {
          const pair1 = firstFlipped.getAttribute('data-pairid');
          const pair2 = cardEl.getAttribute('data-pairid');

          if (pair1 === pair2) {
            firstFlipped.classList.add('matched');
            cardEl.classList.add('matched');
            firstFlipped = null;
            matchesFound++;
            if (window.soundEngine) window.soundEngine.playTone(12);

            if (matchesFound === pairCount) {
              this.handleSuccess('Memory Pairs Matched');
            }
          } else {
            lockBoard = true;
            setTimeout(() => {
              firstFlipped.classList.remove('flipped');
              cardEl.classList.remove('flipped');
              firstFlipped = null;
              lockBoard = false;
            }, 900);
          }
        }
      });
    });
  }

  generateCounting(stageEl) {
    const maxCount = this.ageLevel === 'baby' ? 3 : 4;
    const targetCount = Math.floor(Math.random() * maxCount) + 1;
    const items = ['⭐️', '🎈', '🦆', '🍓', '🐶', '🚗'];
    const chosenIcon = items[Math.floor(Math.random() * items.length)];

    const options = [1, 2, 3, 4].slice(0, maxCount).sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🔢 Count the items! How many are there?</h2>
        <div class="count-items-display">
          ${Array(targetCount).fill(0).map(() => `<div class="count-item-bubble">${chosenIcon}</div>`).join('')}
        </div>

        <div class="count-number-options">
          ${options.map(num => `
            <button class="logic-card count-num-btn" data-num="${num}">
              <span class="num-digit">${num}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.count-num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.getAttribute('data-num'), 10);
        if (val === targetCount) {
          e.currentTarget.classList.add('correct');
          if (window.soundEngine) window.soundEngine.speak(targetCount.toString());
          this.handleSuccess(`Counted ${targetCount}`);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateSizeCompare(stageEl) {
    const isFindBiggest = Math.random() > 0.5;
    const promptText = isFindBiggest ? "📏 Tap the BIGGEST item!" : "📏 Tap the SMALLEST item!";

    const items = ['🐘', '🐭', '🍎', '🐶', '🚗', '⭐️'];
    const chosenIcon = items[Math.floor(Math.random() * items.length)];

    const count = this.ageLevel === 'baby' ? 2 : 3;
    const sizes = [
      { label: 'small', scale: 0.6, fontSize: '32px' },
      { label: 'medium', scale: 1.0, fontSize: '54px' },
      { label: 'large', scale: 1.5, fontSize: '80px' }
    ].slice(0, count).sort(() => Math.random() - 0.5);

    const targetLabel = isFindBiggest
      ? sizes.reduce((max, s) => s.scale > max.scale ? s : max, sizes[0]).label
      : sizes.reduce((min, s) => s.scale < min.scale ? s : min, sizes[0]).label;

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">${promptText}</h2>
        <div class="size-compare-row">
          ${sizes.map(s => `
            <div class="logic-card size-card" data-size="${s.label}">
              <span class="card-emoji" style="font-size: ${s.fontSize}">${chosenIcon}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.size-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const sizeVal = e.currentTarget.getAttribute('data-size');
        if (sizeVal === targetLabel) {
          e.currentTarget.classList.add('correct');
          this.handleSuccess('Size Matched');
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateShapeAssembly(stageEl) {
    const pieces = [
      { shape: '🔴', name: 'circle' },
      { shape: '🟦', name: 'square' },
      { shape: '🔺', name: 'triangle' },
      { shape: '⭐️', name: 'star' }
    ].sort(() => Math.random() - 0.5).slice(0, this.ageLevel === 'baby' ? 2 : 3);

    const targetSlots = [...pieces];
    const sourceCards = [...pieces].sort(() => Math.random() - 0.5);
    this.assembledCount = 0;

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🧩 Tap a shape piece, then tap its outline slot!</h2>
        <div class="shape-assembly-container">
          <div class="assembly-source-row">
            ${sourceCards.map(p => `
              <div class="logic-card assembly-source" data-name="${p.name}">
                <span class="card-emoji">${p.shape}</span>
              </div>
            `).join('')}
          </div>

          <div class="assembly-target-row">
            ${targetSlots.map(p => `
              <div class="assembly-slot" data-target="${p.name}">
                <span class="slot-silhouette">${p.shape}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    let selectedAssemblyPiece = null;
    stageEl.querySelectorAll('.assembly-source').forEach(card => {
      card.addEventListener('click', (e) => {
        stageEl.querySelectorAll('.assembly-source').forEach(c => c.classList.remove('selected'));
        if (selectedAssemblyPiece === e.currentTarget) {
          selectedAssemblyPiece = null;
        } else {
          selectedAssemblyPiece = e.currentTarget;
          selectedAssemblyPiece.classList.add('selected');
          if (window.soundEngine) window.soundEngine.playTone(5);
        }
      });
    });

    stageEl.querySelectorAll('.assembly-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (!selectedAssemblyPiece) return;
        const pieceName = selectedAssemblyPiece.getAttribute('data-name');
        const targetName = e.currentTarget.getAttribute('data-target');

        if (pieceName === targetName) {
          e.currentTarget.classList.add('matched');
          e.currentTarget.innerHTML = selectedAssemblyPiece.innerHTML;
          selectedAssemblyPiece.style.visibility = 'hidden';
          selectedAssemblyPiece.classList.remove('selected');
          selectedAssemblyPiece = null;

          this.assembledCount++;
          if (window.soundEngine) window.soundEngine.playTone(9);

          if (this.assembledCount === pieces.length) {
            this.handleSuccess('Shape Assembled');
          }
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateDotToDot(stageEl) {
    const totalDots = this.ageLevel === 'baby' ? 3 : 4;
    this.currentDotTarget = 1;

    const items = ['⭐️', '🚀', '🐱', '🎨', '👑'];
    const rewardEmoji = items[Math.floor(Math.random() * items.length)];

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">✏️ Tap dots in order: 1 ➡️ 2 ➡️ ${totalDots}!</h2>
        <div class="dot-stage">
          <div class="dot-reward-hidden" id="dot-reward">${rewardEmoji}</div>
          <div class="dots-container">
            ${Array(totalDots).fill(0).map((_, i) => `
              <button class="dot-btn ${i === 0 ? 'active-target' : ''}" data-dot="${i + 1}">
                <span class="dot-num">${i + 1}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.dot-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dotNum = parseInt(e.currentTarget.getAttribute('data-dot'), 10);
        if (dotNum === this.currentDotTarget) {
          e.currentTarget.classList.add('connected');
          e.currentTarget.classList.remove('active-target');

          if (window.soundEngine) window.soundEngine.playTone(4 + dotNum * 3);
          this.currentDotTarget++;

          if (this.currentDotTarget > totalDots) {
            stageEl.querySelector('#dot-reward').classList.add('revealed');
            this.handleSuccess('Dot-to-Dot Revealed');
          } else {
            const nextBtn = stageEl.querySelector(`.dot-btn[data-dot="${this.currentDotTarget}"]`);
            if (nextBtn) nextBtn.classList.add('active-target');
          }
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateColorPaint(stageEl) {
    const colorOptions = [
      { name: 'Red 🔴', color: '#FF7675', key: 'red' },
      { name: 'Blue 🔵', color: '#74B9FF', key: 'blue' },
      { name: 'Yellow 🟡', color: '#F9CA24', key: 'yellow' },
      { name: 'Green 🟢', color: '#55E6C1', key: 'green' }
    ];

    const targetColorObj = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const shapes = ['🍎', '🚗', '⭐️', '🐶', '🎈'];
    const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🎨 Paint it ${targetColorObj.name.toUpperCase()}!</h2>

        <div class="paint-target-outline" id="paint-target">
          <span class="outline-emoji">${chosenShape}</span>
        </div>

        <div class="color-buckets-row">
          ${colorOptions.map(c => `
            <button class="logic-card color-bucket-btn" data-colorkey="${c.key}" style="border-color: ${c.color}">
              <span class="bucket-color-circle" style="background: ${c.color}"></span>
              <span class="bucket-label">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.color-bucket-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.getAttribute('data-colorkey');
        if (key === targetColorObj.key) {
          const target = stageEl.querySelector('#paint-target');
          target.style.background = targetColorObj.color;
          target.classList.add('painted');
          this.handleSuccess('Painted Correctly');
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateBalanceScale(stageEl) {
    const isFindHeavier = Math.random() > 0.5;
    const prompt = isFindHeavier ? "⚖️ Which side is HEAVIER?" : "⚖️ Which side is LIGHTER?";

    const heavyItems = [{ emoji: '🐘', name: 'Elephant' }, { emoji: '🚗', name: 'Car' }, { emoji: '🐻', name: 'Bear' }];
    const lightItems = [{ emoji: '🐥', name: 'Bird' }, { emoji: '🍓', name: 'Strawberry' }, { emoji: '🎈', name: 'Balloon' }];

    const heavy = heavyItems[Math.floor(Math.random() * heavyItems.length)];
    const light = lightItems[Math.floor(Math.random() * lightItems.length)];

    const isLeftHeavy = Math.random() > 0.5;
    const leftItem = isLeftHeavy ? heavy : light;
    const rightItem = isLeftHeavy ? light : heavy;

    const winnerSide = isFindHeavier
      ? (isLeftHeavy ? 'left' : 'right')
      : (isLeftHeavy ? 'right' : 'left');

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">${prompt}</h2>

        <div class="balance-seesaw ${isLeftHeavy ? 'tilt-left' : 'tilt-right'}">
          <div class="scale-pan logic-card" data-side="left">
            <span class="card-emoji">${leftItem.emoji}</span>
          </div>

          <div class="seesaw-fulcrum">⚖️</div>

          <div class="scale-pan logic-card" data-side="right">
            <span class="card-emoji">${rightItem.emoji}</span>
          </div>
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.scale-pan').forEach(pan => {
      pan.addEventListener('click', (e) => {
        const side = e.currentTarget.getAttribute('data-side');
        if (side === winnerSide) {
          e.currentTarget.classList.add('correct');
          this.handleSuccess('Weight Scale Solved');
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateMiniSudoku(stageEl) {
    const is2x2 = this.ageLevel === 'baby';

    if (is2x2) {
      const correctAns = '🐶';
      const wrongAns = '🐱';
      const choices = [correctAns, wrongAns].sort(() => Math.random() - 0.5);

      stageEl.innerHTML = `
        <div class="puzzle-box">
          <h2 class="puzzle-prompt">🟩 Fill the missing grid cell! No repeats!</h2>
          <div class="sudoku-grid grid-2x2">
            <div class="sudoku-cell">🐶</div>
            <div class="sudoku-cell">🐱</div>
            <div class="sudoku-cell">🐱</div>
            <div class="sudoku-cell missing-cell">❓</div>
          </div>

          <div class="sudoku-choices">
            ${choices.map(c => `
              <button class="logic-card sudoku-choice-btn" data-choice="${c}">
                <span class="card-emoji">${c}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      stageEl.querySelectorAll('.sudoku-choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = e.currentTarget.getAttribute('data-choice');
          if (val === correctAns) {
            e.currentTarget.classList.add('correct');
            stageEl.querySelector('.missing-cell').textContent = correctAns;
            stageEl.querySelector('.missing-cell').classList.add('solved');
            this.handleSuccess('Sudoku Grid Solved');
          } else {
            e.currentTarget.classList.add('wrong');
            if (window.soundEngine) window.soundEngine.playTone(0);
            setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
          }
        });
      });
    } else {
      const correctAns = '🐶';
      const wrongAns1 = '🐱';
      const wrongAns2 = '🍎';
      const choices = [correctAns, wrongAns1, wrongAns2].sort(() => Math.random() - 0.5);

      stageEl.innerHTML = `
        <div class="puzzle-box">
          <h2 class="puzzle-prompt">🟩 Fill the missing grid cell! No repeats!</h2>

          <div class="sudoku-grid grid-3x3">
            <div class="sudoku-cell">🐶</div>
            <div class="sudoku-cell">🐱</div>
            <div class="sudoku-cell">🍎</div>
            <div class="sudoku-cell">🍎</div>
            <div class="sudoku-cell">🐶</div>
            <div class="sudoku-cell">🐱</div>
            <div class="sudoku-cell">🐱</div>
            <div class="sudoku-cell">🍎</div>
            <div class="sudoku-cell missing-cell">❓</div>
          </div>

          <div class="sudoku-choices">
            ${choices.map(c => `
              <button class="logic-card sudoku-choice-btn" data-choice="${c}">
                <span class="card-emoji">${c}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      stageEl.querySelectorAll('.sudoku-choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = e.currentTarget.getAttribute('data-choice');
          if (val === correctAns) {
            e.currentTarget.classList.add('correct');
            stageEl.querySelector('.missing-cell').textContent = correctAns;
            stageEl.querySelector('.missing-cell').classList.add('solved');
            this.handleSuccess('Sudoku Grid Solved');
          } else {
            e.currentTarget.classList.add('wrong');
            if (window.soundEngine) window.soundEngine.playTone(0);
            setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
          }
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     NEW GAME 13: UPPERCASE & LOWERCASE LETTER MATCHING
     ------------------------------------------------------------------------ */
  generateLetterMatch(stageEl) {
    const idx = Math.floor(Math.random() * 26);
    const upperChar = this.upperAlpha[idx];
    const correctLower = this.lowerAlpha[idx];

    // Pick 2 wrong lowercase letters
    let wrongIndices = Array.from({ length: 26 }, (_, i) => i).filter(i => i !== idx);
    wrongIndices = wrongIndices.sort(() => Math.random() - 0.5).slice(0, this.ageLevel === 'baby' ? 1 : 2);
    const wrongLowers = wrongIndices.map(i => this.lowerAlpha[i]);

    const choices = [correctLower, ...wrongLowers].sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🔤 Match Uppercase '${upperChar}' to its Lowercase partner!</h2>

        <div class="letter-target-card">
          <span class="upper-letter-big">${upperChar}</span>
          <span class="letter-sub-tag">Uppercase</span>
        </div>

        <div class="letter-choices-row">
          ${choices.map(c => `
            <button class="logic-card letter-choice-card" data-lower="${c}">
              <span class="lower-letter-glyph">${c}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Speak the target letter
    if (window.soundEngine) window.soundEngine.speak(upperChar);

    stageEl.querySelectorAll('.letter-choice-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.getAttribute('data-lower');
        if (val === correctLower) {
          e.currentTarget.classList.add('correct');
          if (window.soundEngine) window.soundEngine.speak(val);
          this.handleSuccess(`Letter Match '${upperChar}' & '${val}'`);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     NEW GAME 14: ALPHABET ORDER & SEQUENCE
     ------------------------------------------------------------------------ */
  generateLetterSequence(stageEl) {
    const isUpper = Math.random() > 0.5;
    const alphaArr = isUpper ? this.upperAlpha : this.lowerAlpha;

    // Pick starting index (0 to 22) for sequence of 4 letters
    const startIdx = Math.floor(Math.random() * 22);
    const seq = alphaArr.slice(startIdx, startIdx + 4);

    const missingPos = Math.floor(Math.random() * 4); // 0 to 3
    const correctLetter = seq[missingPos];

    // Wrong choices
    let wrongPool = alphaArr.filter(x => !seq.includes(x));
    wrongPool = wrongPool.sort(() => Math.random() - 0.5).slice(0, 2);

    const choices = [correctLetter, ...wrongPool].sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🔤 What letter comes next in the Alphabet?</h2>

        <div class="letter-sequence-row">
          ${seq.map((char, i) => `
            <div class="seq-letter-box ${i === missingPos ? 'missing-box' : ''}">
              ${i === missingPos ? '❓' : char}
            </div>
          `).join('')}
        </div>

        <div class="letter-choices-row">
          ${choices.map(c => `
            <button class="logic-card letter-choice-card" data-letter="${c}">
              <span class="lower-letter-glyph">${c}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.letter-choice-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.getAttribute('data-letter');
        if (val === correctLetter) {
          e.currentTarget.classList.add('correct');
          const missingBox = stageEl.querySelector('.missing-box');
          missingBox.textContent = correctLetter;
          missingBox.classList.add('solved');
          if (window.soundEngine) window.soundEngine.speak(val);
          this.handleSuccess(`Alphabet Solved '${val}'`);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     NEW GAME 15: NUMBERS UP TO 100 & COUNT BY 10S
     ------------------------------------------------------------------------ */
  generateNumber100(stageEl) {
    const isTensCount = Math.random() > 0.5;

    if (isTensCount) {
      this.generateNumberTens(stageEl);
      return;
    }

    // Sequence of 4 numbers between 1 and 100
    const startNum = Math.floor(Math.random() * 95) + 1;
    const seq = [startNum, startNum + 1, startNum + 2, startNum + 3];

    const missingPos = Math.floor(Math.random() * 4);
    const correctNum = seq[missingPos];

    let wrongChoices = [correctNum + 10, Math.max(1, correctNum - 5), correctNum + 2].filter(x => x !== correctNum && x <= 100);
    wrongChoices = wrongChoices.sort(() => Math.random() - 0.5).slice(0, 2);

    const choices = [correctNum, ...wrongChoices].sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">💯 What number comes next up to 100?</h2>

        <div class="num100-sequence-row">
          ${seq.map((num, i) => `
            <div class="seq-num-box ${i === missingPos ? 'missing-box' : ''}">
              ${i === missingPos ? '❓' : num}
            </div>
          `).join('')}
        </div>

        <div class="count-number-options">
          ${choices.map(n => `
            <button class="logic-card count-num-btn" data-num100="${n}">
              <span class="num-digit">${n}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.count-num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.getAttribute('data-num100'), 10);
        if (val === correctNum) {
          e.currentTarget.classList.add('correct');
          const missingBox = stageEl.querySelector('.missing-box');
          missingBox.textContent = correctNum;
          missingBox.classList.add('solved');
          if (window.soundEngine) window.soundEngine.speak(val.toString());
          this.handleSuccess(`Number ${val}`);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  generateNumberTens(stageEl) {
    const tensSeqAll = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const startIdx = Math.floor(Math.random() * 7); // 0 to 6
    const seq = tensSeqAll.slice(startIdx, startIdx + 4);

    const missingPos = Math.floor(Math.random() * 4);
    const correctTens = seq[missingPos];

    let wrongChoices = tensSeqAll.filter(x => !seq.includes(x)).sort(() => Math.random() - 0.5).slice(0, 2);
    const choices = [correctTens, ...wrongChoices].sort(() => Math.random() - 0.5);

    stageEl.innerHTML = `
      <div class="puzzle-box">
        <h2 class="puzzle-prompt">🔢 Count by 10s up to 100!</h2>

        <div class="num100-sequence-row">
          ${seq.map((num, i) => `
            <div class="seq-num-box tens-box ${i === missingPos ? 'missing-box' : ''}">
              ${i === missingPos ? '❓' : num}
            </div>
          `).join('')}
        </div>

        <div class="count-number-options">
          ${choices.map(n => `
            <button class="logic-card count-num-btn" data-numtens="${n}">
              <span class="num-digit">${n}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('.count-num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.getAttribute('data-numtens'), 10);
        if (val === correctTens) {
          e.currentTarget.classList.add('correct');
          const missingBox = stageEl.querySelector('.missing-box');
          missingBox.textContent = correctTens;
          missingBox.classList.add('solved');
          if (window.soundEngine) window.soundEngine.speak(val.toString());
          this.handleSuccess(`Counted Tens ${val}`);
        } else {
          e.currentTarget.classList.add('wrong');
          if (window.soundEngine) window.soundEngine.playTone(0);
          setTimeout(() => e.currentTarget.classList.remove('wrong'), 500);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     SUCCESS & CELEBRATION
     ------------------------------------------------------------------------ */
  handleSuccess(title) {
    this.stars += 1;
    this.streak += 1;

    const starCountEl = this.container.querySelector('#star-count-num');
    if (starCountEl) starCountEl.textContent = this.stars;

    if (window.canvasEngine) {
      window.canvasEngine.spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, '#F9CA24');
    }

    if (window.soundEngine) {
      window.soundEngine.playTone(15);
    }

    const celebEl = this.container.querySelector('#logic-celebration');
    if (!celebEl) return;

    const themeConfig = this.themes[this.theme];
    const rewardBadge = themeConfig.rewards[Math.floor(Math.random() * themeConfig.rewards.length)];

    celebEl.innerHTML = `
      <div class="celeb-card">
        <div class="celeb-badge-burst">${rewardBadge}</div>
        <h2 class="celeb-title">Awesome Job! 🎉</h2>
        <p class="celeb-subtitle">${themeConfig.cheerMessage}</p>

        <div class="celeb-stars">
          <span class="star-pop">⭐</span>
          <span class="star-pop">⭐</span>
          <span class="star-pop">⭐</span>
        </div>

        <button id="next-puzzle-btn" class="primary-btn pulse-glow">
          Next Puzzle ➡️
        </button>
      </div>
    `;

    celebEl.classList.remove('hidden');

    celebEl.querySelector('#next-puzzle-btn').addEventListener('click', () => {
      celebEl.classList.add('hidden');
      this.generatePuzzle();
    });
  }
}

window.logicGamesEngine = new LogicGamesEngine();
