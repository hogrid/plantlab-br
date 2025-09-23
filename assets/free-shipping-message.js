class FreeShippingMeter extends HTMLElement {
    constructor() {
        super();
    }

    static freeShippingText = window.free_shipping_text.free_shipping_message;
    static freeShippingText1 = window.free_shipping_text.free_shipping_message_1;
    static freeShippingText2 = window.free_shipping_text.free_shipping_message_2;
    static freeShippingText2Singular = window.free_shipping_text.free_shipping_message_2_singular;
    static freeShippingText3 = window.free_shipping_text.free_shipping_message_3;
    static freeShippingText3Singular = window.free_shipping_text.free_shipping_message_3_singular;
    static freeShippingText4 = window.free_shipping_text.free_shipping_message_4;
    static classLabel1 = 'progress-30';
    static classLabel2 = 'progress-60';
    static classLabel3 = 'progress-100';
    static freeshipPrice = parseInt(window.free_shipping_price);

    connectedCallback() {
        this.freeShippingEligible = 0;
        this.progressBar = this.querySelector('[data-shipping-progress]');
        this.messageElement = this.querySelector('[data-shipping-message]');
        this.textEnabled = this.progressBar?.dataset.textEnabled === 'true';
        this.shipVal = window.free_shipping_text.free_shipping_1;
        this.progressMeter = this.querySelector('[ data-free-shipping-progress-meter]');

        this.addEventListener('change', this.onCartChange.bind(this));

        this.initialize();
    }

    initialize() {
        Shopify.getCart((cart) => {
            this.cart = cart;
            this.calculateProgress(cart);
        })
    }

    onCartChange(e) {
        this.initialize();
    }

    calculateProgress(cart) {
        // Count 500g protein products in cart
        let protein500gCount = 0;

        cart.items.forEach(item => {
            const productTitle = item.product_title.toLowerCase();
            const variantTitle = item.variant_title ? item.variant_title.toLowerCase() : '';
            const fullTitle = (productTitle + ' ' + variantTitle).toLowerCase();

            // Check if product is 500g protein (same logic as product-payment-promo.liquid)
            if (fullTitle.includes('500g') || fullTitle.includes('proteina vegetal cremosa')) {
                protein500gCount += item.quantity;
            }
        });

        // Calculate progress based on quantity (3 units = 100%)
        const requiredQuantity = 3;
        let freeShipBar = Math.min((protein500gCount * 100) / requiredQuantity, 100);

        const text = this.getText(protein500gCount, freeShipBar, requiredQuantity);
        const classLabel = this.getClassLabel(freeShipBar);

        this.setProgressWidthAndText(freeShipBar, text, classLabel);
    }

    getText(protein500gCount, freeShipBar, requiredQuantity) {
        let text;

        if (protein500gCount == 0) {
            this.progressBar.classList.add('progress-hidden');
            text = '<span>' + FreeShippingMeter.freeShippingText + ' ' + requiredQuantity + ' unidades de proteína 500g!</span>';
        } else if (protein500gCount >= requiredQuantity) {
            this.progressBar.classList.remove('progress-hidden');
            this.freeShippingEligible = 1;
            text = FreeShippingMeter.freeShippingText1;
        } else {
            this.progressBar.classList.remove('progress-hidden');
            const remainingQuantity = requiredQuantity - protein500gCount;
            
            // Use singular or plural based on remaining quantity
            const faltaText = remainingQuantity === 1 ? FreeShippingMeter.freeShippingText2Singular : FreeShippingMeter.freeShippingText2;
            const proteinaText = remainingQuantity === 1 ? FreeShippingMeter.freeShippingText3Singular : FreeShippingMeter.freeShippingText3;
            
            text = '<span>' + faltaText + ' </span>' + remainingQuantity + '<span> ' + proteinaText + ' </span><span class="text">' + FreeShippingMeter.freeShippingText4 + '</span>';
            this.shipVal = window.free_shipping_text.free_shipping_2;
        }

        return text;
    }

    getClassLabel(freeShipBar) {
        let classLabel;

        if (freeShipBar === 0) {
            classLabel = 'none';
        } else if (freeShipBar <= 30) {
            classLabel = FreeShippingMeter.classLabel1;
        } else  if (freeShipBar <= 60) {
            classLabel = FreeShippingMeter.classLabel2;
        } else if (freeShipBar < 100) {
            classLabel = FreeShippingMeter.classLabel3;
        } else {
            classLabel = 'progress-free'
        }

        return classLabel;
    }

    resetProgressClass(classLabel) {
        this.progressBar.classList.remove('progress-30');
        this.progressBar.classList.remove('progress-60');
        this.progressBar.classList.remove('progress-100');
        this.progressBar.classList.remove('progress-free');

        this.progressBar.classList.add(classLabel);
    }

    setProgressWidthAndText(freeShipBar, text, classLabel) {
        setTimeout(() => {
            this.resetProgressClass(classLabel);

            this.progressMeter.style.width = `${freeShipBar}%`;
            if (this.textEnabled) {
                const textWrapper = this.progressMeter.querySelector('.text').innerHTML = `${freeShipBar.toFixed(2)}%`;
            }

            this.messageElement.innerHTML = text;

            if ((window.show_multiple_currencies && typeof Currency != 'undefined' && Currency.currentCurrency != shopCurrency) || window.show_auto_currency) {
                Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
            }
        }, 400)
    }
}

window.addEventListener('load', () => {
    customElements.define('free-shipping-component', FreeShippingMeter);
})
