/* ==========================================================================
   Little Smashers - Canvas Rendering & Particle Engine
   ========================================================================== */

class CanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.ripples = [];
    this.floatingItems = []; // For floating letters, numbers, animals & bubbles
    this.highDensity = true;
    this.draggedItem = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  setHighDensity(enable) {
    this.highDensity = enable;
  }

  // Clear all current screen items when switching game modes
  clearAll() {
    this.particles = [];
    this.ripples = [];
    this.floatingItems = [];
    this.draggedItem = null;
  }

  // Spawn particle explosion at (x, y) with specified color palette
  spawnExplosion(x, y, color = null) {
    const count = this.highDensity ? 24 : 12;
    const colors = color ? [color] : ['#FF7675', '#74B9FF', '#55E6C1', '#F8C291', '#E056FD', '#F9CA24'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 4 + Math.random() * 8;
      const selectedColor = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 6 + Math.random() * 10,
        color: selectedColor,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        shape: Math.random() > 0.5 ? 'circle' : 'star'
      });
    }

    // Add ripple effect
    this.ripples.push({
      x: x,
      y: y,
      radius: 10,
      maxRadius: 100 + Math.random() * 50,
      color: colors[0],
      alpha: 0.8
    });
  }

  // Spawn animated giant text (Letter / Number)
  spawnText(x, y, text, color) {
    this.floatingItems.push({
      type: 'text',
      x: x,
      y: y,
      text: text,
      color: color || '#FF7675',
      scale: 0.2,
      maxScale: 1.2 + Math.random() * 0.4,
      rotation: (Math.random() - 0.5) * 0.4,
      vy: -2,
      alpha: 1.0,
      decay: 0.01
    });
  }

  // Spawn shape (Heart, Star, Circle, Square)
  spawnShape(x, y, shapeType, color) {
    this.floatingItems.push({
      type: 'shape',
      shapeType: shapeType,
      x: x,
      y: y,
      size: 40 + Math.random() * 40,
      color: color || '#FD79A8',
      vy: -3 - Math.random() * 2,
      vx: (Math.random() - 0.5) * 3,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.1,
      alpha: 1.0,
      decay: 0.008
    });
  }

  // Spawn Animal Emoji with spring bounce physics or static draggable state (Max 5 static)
  spawnAnimal(x, y, animalEmoji, isStatic = false) {
    if (isStatic) {
      // Find existing static animals
      const staticAnimals = this.floatingItems.filter(item => item.type === 'animal' && item.isStatic);

      // Max 5 visible animals limit: if count >= 5, remove the oldest static animal
      if (staticAnimals.length >= 5) {
        const oldest = staticAnimals[0];
        const index = this.floatingItems.indexOf(oldest);
        if (index !== -1) {
          // Spawn quick pop effect on removal
          this.spawnExplosion(oldest.x, oldest.y, '#FF7675');
          this.floatingItems.splice(index, 1);
        }
      }

      this.floatingItems.push({
        type: 'animal',
        emoji: animalEmoji,
        x: x,
        y: y,
        size: 90,
        scale: 0.2,
        targetScale: 1.0,
        vy: 0,
        vx: 0,
        alpha: 1.0,
        decay: 0,
        isStatic: true
      });
    } else {
      this.floatingItems.push({
        type: 'animal',
        emoji: animalEmoji,
        x: x,
        y: y,
        size: 70 + Math.random() * 30,
        scale: 0.1,
        targetScale: 1.0,
        vy: -4,
        vx: (Math.random() - 0.5) * 4,
        alpha: 1.0,
        decay: 0.006,
        isStatic: false
      });
    }
  }

  // Spawn Bubble
  spawnBubble(x, y, color) {
    this.floatingItems.push({
      type: 'bubble',
      x: x,
      y: y,
      radius: 35 + Math.random() * 25,
      color: color || 'rgba(0, 206, 201, 0.4)',
      vy: -1.5 - Math.random() * 1.5,
      wobble: Math.random() * Math.PI * 2,
      popped: false,
      alpha: 1.0
    });
  }

  // Check if a touch at (x, y) pops any active bubble
  checkBubblePop(x, y) {
    for (let i = this.floatingItems.length - 1; i >= 0; i--) {
      const item = this.floatingItems[i];
      if (item.type === 'bubble') {
        const dist = Math.hypot(item.x - x, item.y - y);
        if (dist <= item.radius + 20) {
          // Pop bubble!
          this.spawnExplosion(item.x, item.y, item.color);
          this.floatingItems.splice(i, 1);
          if (window.soundEngine) {
            window.soundEngine.playPop();
          }
          return true;
        }
      }
    }
    return false;
  }

  // Check if a touch at (x, y) hits a static animal for drag and drop
  getAnimalAt(x, y) {
    for (let i = this.floatingItems.length - 1; i >= 0; i--) {
      const item = this.floatingItems[i];
      if (item.type === 'animal' && item.isStatic) {
        const dist = Math.hypot(item.x - x, item.y - y);
        if (dist <= item.size * 0.6) {
          return item;
        }
      }
    }
    return null;
  }

  startDrag(animal, x, y) {
    this.draggedItem = animal;
    animal.dragOffsetX = x - animal.x;
    animal.dragOffsetY = y - animal.y;
    // Bring dragged animal to top of stack
    const index = this.floatingItems.indexOf(animal);
    if (index !== -1) {
      this.floatingItems.splice(index, 1);
      this.floatingItems.push(animal);
    }
  }

  moveDrag(x, y) {
    if (this.draggedItem) {
      this.draggedItem.x = x - this.draggedItem.dragOffsetX;
      this.draggedItem.y = y - this.draggedItem.dragOffsetY;
    }
  }

  endDrag() {
    this.draggedItem = null;
  }

  // Main animation frame loop
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Render & Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 4;
      r.alpha -= 0.02;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = r.color;
      this.ctx.globalAlpha = Math.max(0, r.alpha);
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 2. Render & Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        this.drawStar(p.x, p.y, 5, p.radius, p.radius / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // 3. Render & Update Floating & Static Items
    for (let i = this.floatingItems.length - 1; i >= 0; i--) {
      const item = this.floatingItems[i];
      item.x += item.vx || 0;
      item.y += item.vy || 0;

      if (!item.isStatic && item.decay) {
        item.alpha -= item.decay;
      }

      if (item.alpha <= 0) {
        this.floatingItems.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, item.alpha);

      switch (item.type) {
        case 'text':
          if (item.scale < item.maxScale) item.scale += 0.08;
          this.ctx.translate(item.x, item.y);
          this.ctx.rotate(item.rotation);
          this.ctx.scale(item.scale, item.scale);
          this.ctx.font = 'bold 90px "Fredoka", cursive';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillStyle = item.color;
          this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
          this.ctx.shadowBlur = 15;
          this.ctx.fillText(item.text, 0, 0);
          break;

        case 'shape':
          item.rotation += item.vRot;
          this.ctx.translate(item.x, item.y);
          this.ctx.rotate(item.rotation);
          this.ctx.fillStyle = item.color;
          if (item.shapeType === 'heart') {
            this.drawHeart(0, 0, item.size);
          } else if (item.shapeType === 'star') {
            this.drawStar(0, 0, 5, item.size, item.size / 2);
          } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, item.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
          break;

        case 'animal':
          if (item.scale < item.targetScale) item.scale += 0.08;
          this.ctx.translate(item.x, item.y);
          this.ctx.scale(item.scale, item.scale);
          this.ctx.font = `${item.size}px sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(item.emoji, 0, 0);
          break;

        case 'bubble':
          item.wobble += 0.05;
          const wobbleX = Math.sin(item.wobble) * 2;
          this.ctx.beginPath();
          this.ctx.arc(item.x + wobbleX, item.y, item.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = item.color;
          this.ctx.fill();
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          this.ctx.lineWidth = 3;
          this.ctx.stroke();

          // Bubble highlight shine
          this.ctx.beginPath();
          this.ctx.arc(item.x + wobbleX - item.radius * 0.3, item.y - item.radius * 0.3, item.radius * 0.25, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          this.ctx.fill();
          break;
      }

      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }

  // Draw Star Helper
  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  // Draw Heart Helper
  drawHeart(x, y, size) {
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    this.ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

window.canvasEngine = new CanvasEngine('smash-canvas');
