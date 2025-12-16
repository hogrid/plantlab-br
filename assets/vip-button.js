/**
 * VIP Button - Redirecionamento direto para WhatsApp
 */

class VIPButton {
  constructor() {
    // Usa a configuração dinâmica do tema ou fallback para o link padrão
    this.whatsappUrl = window.VIP_CONFIG?.whatsappGroupLink || 'https://chat.whatsapp.com/C8oUYnWED2GFiJpr4Qfwig';
  }

  /**
   * Initialize the VIP Button
   */
  init() {
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const triggers = Array.from(document.querySelectorAll('.vip-button, .vip-button-header'));
    if (triggers.length) {
      triggers.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          // Se o botão tem data-use-configured-url, sempre usa o href configurado
          if (btn.dataset.useConfiguredUrl === 'true') {
            // Permite o comportamento padrão do link (navegação normal)
            return;
          }

          // Caso contrário (botões do header), força WhatsApp
          e.preventDefault();
          this.redirectToWhatsApp();
        });
      });
    }

    // Bind mobile VIP button events
    this.bindMobileEvents();
  }

  /**
   * Bind mobile VIP button events
   */
  bindMobileEvents() {
    const mobileButtons = Array.from(document.querySelectorAll('[data-vip-mobile-button]'));
    if (mobileButtons.length) {
      mobileButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleMobileClick(btn);
        });

        // Add touch feedback for mobile
        btn.addEventListener('touchstart', (e) => {
          this.addClickFeedback(btn);
        });
      });
    }
  }

  /**
   * Handle mobile button click with feedback
   */
  handleMobileClick(button) {
    // Se o botão tem data-use-configured-url, usa o href configurado
    if (button.dataset.useConfiguredUrl === 'true') {
      const href = button.getAttribute('href');
      // Navega para o href configurado
      window.location.href = href;
      return;
    }

    // Add visual feedback
    this.addClickFeedback(button);

    // Small delay for visual feedback before redirect
    setTimeout(() => {
      this.redirectToWhatsApp();
    }, 150);
  }

  /**
   * Add visual click feedback
   */
  addClickFeedback(button) {
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200);
  }

  /**
   * Redirect to WhatsApp
   */
  redirectToWhatsApp() {
    window.open(this.whatsappUrl, '_blank');
  }
}

// Initialize VIP Button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const hasTrigger = document.querySelector('.vip-button, .vip-button-header, [data-vip-mobile-button]');
  if (hasTrigger) {
    const vipButton = new VIPButton();
    vipButton.init();
    // expõe para debug no console
    try { window.vipButton = vipButton; } catch (e) {}
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VIPButton;
}
