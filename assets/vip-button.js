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
   * Normalize and validate configuration object
   */
  normalizeConfig(raw) {
    if (!raw) return null;
    const cfg = {
      klaviyoApiKey: (raw.klaviyoApiKey || raw.apiKey || '').trim(),
      klaviyoListId: (raw.klaviyoListId || raw.listId || '').trim(),
      product: raw.product || {
        id: null,
        title: document.title,
        url: window.location.href
      }
    };
    // Basic validation: require non-empty keys
    if (!cfg.klaviyoApiKey || !cfg.klaviyoListId) {
      return cfg; // Return even if incomplete so caller can decide
    }
    return cfg;
  }

  /**
   * Mask sensitive values before logging to console
   */
  maskKey(str) {
    if (typeof str !== 'string') return str;
    const s = str.trim();
    if (!s) return '';
    if (s.length <= 4) return '****';
    return `${s.slice(0, 3)}***${s.slice(-2)}`;
  }

  sanitizeConfigForLog(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    try {
      const copy = JSON.parse(JSON.stringify(obj));
      if (copy.apiKey) copy.apiKey = this.maskKey(copy.apiKey);
      if (copy.klaviyoApiKey) copy.klaviyoApiKey = this.maskKey(copy.klaviyoApiKey);
      if (copy.listId) copy.listId = this.maskKey(copy.listId);
      if (copy.klaviyoListId) copy.klaviyoListId = this.maskKey(copy.klaviyoListId);
      return copy;
    } catch (e) {
      return obj;
    }
  }

  /**
   * Get configuration from the page
   */
  getConfig() {
    // Não usar chaves hardcoded como fallback; ler apenas das fontes disponíveis

    // Unifica fontes: JSON inline (#vip-config-data), KLAVIYO_CONFIG, VIP_CONFIG e atributos de dados no wrapper
    const wrapper = document.querySelector('.vip-button-wrapper');
    const ds = (wrapper && wrapper.dataset) ? wrapper.dataset : {};

    // Tenta ler o JSON inline gerado pelo Liquid para maior robustez
    let jsonCfg = {};
    try {
      const jsonEl = document.getElementById('vip-config-data');
      if (jsonEl && jsonEl.textContent) {
        jsonCfg = JSON.parse(jsonEl.textContent);
      }
    } catch (e) {
      // silenciosamente ignora erros de parse
    }

    const sources = [
      jsonCfg || {},
      window.KLAVIYO_CONFIG || {},
      window.VIP_CONFIG || {},
      {
        apiKey: ds.klaviyoApiKey,
        klaviyoApiKey: ds.klaviyoApiKey,
        listId: ds.klaviyoListId,
        klaviyoListId: ds.klaviyoListId
      }
    ];

    const merged = {
      klaviyoApiKey: '',
      klaviyoListId: '',
      product: null
    };

    // Seleciona o primeiro valor válido de cada chave, entre as fontes disponíveis
    for (const s of sources) {
      if (!merged.klaviyoApiKey && typeof s.klaviyoApiKey === 'string' && s.klaviyoApiKey.trim()) {
        merged.klaviyoApiKey = s.klaviyoApiKey.trim();
      }
      if (!merged.klaviyoApiKey && typeof s.apiKey === 'string' && s.apiKey.trim()) {
        merged.klaviyoApiKey = s.apiKey.trim();
      }
      if (!merged.klaviyoListId && typeof s.klaviyoListId === 'string' && s.klaviyoListId.trim()) {
        merged.klaviyoListId = s.klaviyoListId.trim();
      }
      if (!merged.klaviyoListId && typeof s.listId === 'string' && s.listId.trim()) {
        merged.klaviyoListId = s.listId.trim();
      }
      if (!merged.product && s.product) {
        merged.product = s.product;
      }
    }

    // Se ainda faltar produto, cria um básico
    if (!merged.product) {
      merged.product = {
        id: null,
        title: document.title,
        url: window.location.href
      };
    }

    // Sem fallback de credenciais aqui para evitar uso incorreto de chaves; validar no submit

    const cfg = this.normalizeConfig(merged);
    return cfg;
  }

  /**
   * Initialize the VIP Button
   */
  init() {
    // Load configuration if available, but do not block modal interactions
    // Opening the modal should work even if Klaviyo config is missing; we'll validate on submit
    this.config = this.getConfig();
    // Debug info to help diagnose configuration issues in console
    try {
      const cfg = this.config || {};
      console.info('[VIP Button] Configuração Klaviyo detectada:', {
        apiKey_present: !!cfg.klaviyoApiKey,
        listId_present: !!cfg.klaviyoListId,
        apiKey_value_preview: (cfg.klaviyoApiKey || '').slice(0, 6),
        listId_value_preview: (cfg.klaviyoListId || '').slice(0, 6)
      });
    } catch (e) {}
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
    // Corrige acessibilidade: modal visível não deve estar aria-hidden
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.setAttribute('aria-modal', 'true');
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
    // Restaura atributos ARIA ao fechar
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.removeAttribute('aria-modal');
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
      const cfg = this.normalizeConfig(this.config);
      if (!cfg || !cfg.klaviyoApiKey || !cfg.klaviyoListId) {
        // Última tentativa de recuperar de atributos do DOM antes de falhar
        const wrapper = document.querySelector('.vip-button-wrapper');
        if (wrapper) {
          const ds = wrapper.dataset || {};
          const apiKey = (ds.klaviyoApiKey || '').trim();
          const listId = (ds.klaviyoListId || '').trim();
          if (apiKey && listId) {
            cfg.klaviyoApiKey = apiKey;
            cfg.klaviyoListId = listId;
          }
        }
        if (!cfg.klaviyoApiKey || !cfg.klaviyoListId) {
          console.error('[VIP Button] Configuração de Klaviyo ausente/incompleta', { cfg: this.sanitizeConfigForLog(cfg), KLAVIYO_CONFIG: this.sanitizeConfigForLog(window.KLAVIYO_CONFIG), VIP_CONFIG: this.sanitizeConfigForLog(window.VIP_CONFIG) });
          throw new Error('Configurações do Klaviyo não encontradas ou incompletas.');
        }
      }
      this.config = cfg;
      // Process submission
      await this.processSubmission(email);

      // Show success and redirect only if submission was successful
      this.showSuccess();

      // Redirect to WhatsApp after delay
      setTimeout(() => {
        this.redirectToWhatsApp(email);
      }, 2000);

    } catch (error) {
      // Log detalhado de erro no console
      try {
        console.error('[VIP Button] Falha no envio', { error_message: error && error.message, error });
      } catch (e) {}
      
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

    const { klaviyoApiKey, klaviyoListId, product } = this.normalizeConfig(this.config);
    if (!klaviyoApiKey || !klaviyoListId) {
      throw new Error('Configurações do Klaviyo incompletas.');
    }

    const url = `https://a.klaviyo.com/client/subscriptions/?company_id=${klaviyoApiKey}`;
    const data = {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: 'VIP Button',
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: email,
                // Armazena propriedades no perfil
                properties: {
                  product_id: product?.id,
                  product_title: product?.title,
                  product_url: product?.url,
                  source: 'website_vip_button'
                }
              }
            }
          }
        },
        relationships: {
          list: {
            data: { type: 'list', id: klaviyoListId }
          }
        }
      }
    };

    // Log de requisição para depuração
    try {
      console.info('[VIP Button] Enviando assinatura para Klaviyo', {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/vnd.api+json', revision: '2024-10-15' },
        payload: data
      });
    } catch (e) {}

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(data)
    });

    if (response.ok || response.status === 202) {
      try {
        console.info('[VIP Button] Klaviyo: sucesso na assinatura', { status: response.status, ok: response.ok });
      } catch (e) {}
      return true;
    } else {
      const errorText = await response.text();
      let errorJson = null;
      try { errorJson = JSON.parse(errorText); } catch (e) {}
      try {
        console.error('[VIP Button] Klaviyo API error', {
          status: response.status,
          statusText: response.statusText,
          url,
          requestPayload: data,
          responseBody: errorJson || errorText
        });
      } catch (e) {}
      const detail = (errorJson && errorJson.errors && errorJson.errors[0] && errorJson.errors[0].detail) ? ` - ${errorJson.errors[0].detail}` : '';
      throw new Error(`Klaviyo API error: ${response.status}${detail}`);
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
    // expõe para debug no console
    try { window.vipButton = vipButton; } catch (e) {}
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VIPButton;
}
