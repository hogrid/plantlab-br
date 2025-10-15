/**
 * VIP Button Functionality
 * Handles email capture, validation, API integrations, and WhatsApp redirection
 */

class VIPButton {
  constructor() {
    this.isSubmitting = false;
    this.config = null;
  }

  /**
   * Get configuration from the page
   */
  getConfig() {
    // Prioriza configuração global do Klaviyo; fallback para configuração local
    if (window.KLAVIYO_CONFIG && window.KLAVIYO_CONFIG.apiKey && window.KLAVIYO_CONFIG.listId) {
      return {
        klaviyoApiKey: window.KLAVIYO_CONFIG.apiKey,
        klaviyoListId: window.KLAVIYO_CONFIG.listId,
        product: window.VIP_CONFIG?.product || {
          id: null,
          title: document.title,
          url: window.location.href
        }
      };
    }
    if (window.VIP_CONFIG && window.VIP_CONFIG.klaviyoApiKey && window.VIP_CONFIG.klaviyoListId) {
      return window.VIP_CONFIG;
    }
    return null;
  }

  /**
   * Initialize the VIP Button
   */
  init() {
    // Load configuration if available, but do not block modal interactions
    // Opening the modal should work even if Klaviyo config is missing; we'll validate on submit
    this.config = this.getConfig();
    const button = document.querySelector('.vip-button');
    if (button) {
      this.bindEvents();
      this.setupAccessibility();
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const mainButton = document.querySelector('.vip-button');
    if (mainButton) {
      mainButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Modal events
    document.addEventListener('click', (e) => {
      if (e.target.matches('.vip-modal-overlay') || e.target.matches('.vip-modal-close')) {
        this.closeModal();
      }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Form submission
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.vip-form')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });

    // Email validation on blur (when user leaves the field)
    document.addEventListener('blur', (e) => {
      if (e.target.matches('.vip-form-input[type="email"]')) {
        this.validateEmailInput(e.target);
      }
    }, true);
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA labels and roles
    const mainButton = document.querySelector('.vip-button');
    if (mainButton) {
      mainButton.setAttribute('aria-describedby', 'vip-button-description');
    }
  }

  /**
   * Open the modal
   */
  openModal() {
    const wrapper = document.querySelector('.vip-button-wrapper');
    this.modal = (wrapper ? wrapper.querySelector('.vip-modal') : document.querySelector('.vip-modal'));
    if (!this.modal) return;

    this.form = this.modal.querySelector('.vip-form');
    this.emailInput = this.modal.querySelector('.vip-form-input[type="email"]');
    this.submitButton = this.modal.querySelector('.vip-form-submit');

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (this.emailInput) {
        this.emailInput.focus();
      }
    }, 300);
  }

  /**
   * Close the modal
   */
  closeModal() {
    if (!this.modal) return;

    this.modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset form
    if (this.form) {
      this.form.reset();
      this.clearErrors();
      this.resetSubmitButton();
    }
  }

  /**
   * Validate email input in real-time
   */
  validateEmailInput(input) {
    const email = input.value.trim();
    const errorElement = input.parentNode.querySelector('.vip-form-error');

    if (!email) {
      this.clearFieldError(input, errorElement);
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showFieldError(input, errorElement, 'Por favor, insira um e-mail válido');
    } else {
      this.clearFieldError(input, errorElement);
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show field error
   */
  showFieldError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  /**
   * Clear field error
   */
  clearFieldError(input, errorElement) {
    input.classList.remove('error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  /**
   * Clear all form errors
   */
  clearErrors() {
    const inputs = this.form.querySelectorAll('.vip-form-input');
    const errors = this.form.querySelectorAll('.vip-form-error');

    inputs.forEach(input => input.classList.remove('error'));
    errors.forEach(error => {
      error.textContent = '';
      error.classList.remove('show');
    });
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(form) {
    if (this.isSubmitting) return;

    const email = this.emailInput.value.trim();

    // Validate email
    if (!email) {
      this.showFieldError(
        this.emailInput,
        this.emailInput.parentNode.querySelector('.vip-form-error'),
        'Por favor, insira seu e-mail'
      );
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showFieldError(
        this.emailInput,
        this.emailInput.parentNode.querySelector('.vip-form-error'),
        'Por favor, insira um e-mail válido'
      );
      return;
    }

    // Clear errors and start submission
    this.clearErrors();
    this.setSubmitButtonLoading(true);
    this.isSubmitting = true;

    try {
      // Ensure we have configuration before attempting submission
      if (!this.config) {
        this.config = this.getConfig();
      }
      if (!this.config || !this.config.klaviyoApiKey || !this.config.klaviyoListId) {
        throw new Error('Configurações do Klaviyo não encontradas ou incompletas.');
      }
      // Process submission
      await this.processSubmission(email);

      // Show success and redirect only if submission was successful
      this.showSuccess();

      // Redirect to WhatsApp after delay
      setTimeout(() => {
        this.redirectToWhatsApp(email);
      }, 2000);

    } catch (error) {
      
      // Extract meaningful error message
      let errorMessage = 'Erro ao salvar email. Tente novamente.';
      
      if (error.message) {
        if (error.message.includes('Klaviyo API error:')) {
          const statusMatch = error.message.match(/Klaviyo API error: (\d+)/);
          if (statusMatch) {
            const status = statusMatch[1];
            switch (status) {
              case '400':
                errorMessage = 'Erro de requisição. Verifique os dados e tente novamente.';
                break;
              case '401':
              case '403':
                errorMessage = 'Erro de autenticação. Verifique as configurações.';
                break;
              case '429':
                errorMessage = 'Muitas tentativas. Aguarde um momento e tente novamente.';
                break;
              case '500':
                errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
                break;
              default:
                errorMessage = `Erro do servidor (${status}). Tente novamente.`;
            }
          }
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
          errorMessage = `Erro: ${error.message.substring(0, 100)}`;
        }
      }
      
      this.showError(errorMessage);
    } finally {
      this.setSubmitButtonLoading(false);
      this.isSubmitting = false;
    }
  }

  /**
   * Process the submission using Klaviyo
   */
  async processSubmission(email) {
    const result = await this.submitToKlaviyo(email);
    return result;
  }

  /**
   * Submit email to Klaviyo
   */
  async submitToKlaviyo(email) {
    if (!this.config) {
      this.config = this.getConfig();
    }
    if (!this.config) {
      throw new Error('Configurações do Klaviyo não encontradas.');
    }

    const { klaviyoApiKey, klaviyoListId, product } = this.config;
    if (!klaviyoApiKey || !klaviyoListId) {
      throw new Error('Configurações do Klaviyo incompletas.');
    }

    const url = `https://a.klaviyo.com/client/subscriptions/?company_id=${klaviyoApiKey}`;
    const data = {
      data: {
        type: 'subscription',
        attributes: {
          list_id: klaviyoListId,
          email: email,
          custom_source: 'VIP Button',
          properties: {
            product_id: product?.id,
            product_title: product?.title,
            product_url: product?.url,
            source: 'website_vip_button'
          }
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'revision': '2023-12-15'
      },
      body: JSON.stringify(data)
    });

    if (response.ok || response.status === 202) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(`Erro na API do Klaviyo: ${response.status}`);
    }
  }

  /**
   * Set submit button loading state
   */
  setSubmitButtonLoading(loading) {
    if (!this.submitButton) return;

    if (loading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
    }
  }

  /**
   * Reset submit button
   */
  resetSubmitButton() {
    if (!this.submitButton) return;

    this.submitButton.classList.remove('loading');
    this.submitButton.disabled = false;
  }

  /**
   * Show success message
   */
  showSuccess() {
    const successMessage = this.modal.querySelector('.vip-success-message');
    const formContainer = this.modal.querySelector('.vip-form');

    if (successMessage && formContainer) {
      formContainer.style.display = 'none';
      successMessage.classList.add('show');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    alert(message);
  }

  /**
   * Redirect to WhatsApp with personalized message
   */
  redirectToWhatsApp(email = '') {
    const vipGroupUrl = 'https://chat.whatsapp.com/C8oUYnWED2GFiJpr4Qfwig';
    window.open(vipGroupUrl, '_blank');
  }
}

// Initialize VIP Button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const vipWrapper = document.querySelector('.vip-button-wrapper');
  
  if (vipWrapper) {
    const vipButton = new VIPButton();
    vipButton.init();
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VIPButton;
}
