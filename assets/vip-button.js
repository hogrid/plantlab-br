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
          e.preventDefault();
          this.redirectToWhatsApp();
        });
      });
    }
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
  const hasTrigger = document.querySelector('.vip-button, .vip-button-header');
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
