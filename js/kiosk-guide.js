/* ==========================================================================
   Little Smashers - Mobile Kiosk & Lock Guide Modal Manager
   ========================================================================== */

class KioskGuideManager {
  constructor() {
    this.modal = document.getElementById('kiosk-modal');
    this.closeBtn = document.getElementById('close-kiosk-btn');
    this.gotItBtn = document.getElementById('got-it-kiosk-btn');
    this.tabBtns = document.querySelectorAll('.tab-selectors .tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');

    this.init();
  }

  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }
    if (this.gotItBtn) {
      this.gotItBtn.addEventListener('click', () => this.hide());
    }

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Auto-detect OS platform to activate default tab (iOS vs Android)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      this.switchTab('ios');
    } else {
      this.switchTab('android');
    }
  }

  show() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  switchTab(tabId) {
    this.tabBtns.forEach((btn) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.tabContents.forEach((content) => {
      if (content.id === `tab-${tabId}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }
}

window.kioskGuide = new KioskGuideManager();
