/*
  Quick JS by Jason @ freakdesign.
  Questions? Ping me on twitter: @freakdesign
  Relates to blog post:
  https://freakdesign.com.au/blogs/news/get-shipping-estimates-on-a-product-page
  Example:
  https://jasons-experiments.myshopify.com/products/alex-twill-pant-mariner
*/
(function () {

    "use strict";

    /* In case you want to output a bunch of things to the debug console */
    var debug = false;
    var cartCookie;

    function log(text) {
        console.log(text);
    }

    /* The ID of the element that you want to add the shipping fields into */
    var productSection = document.getElementsByClassName('frete-produto');
    if (!productSection.length) { log('Could not find the element'); return }

    /* the main product select element */
    var productSelect = document.getElementById('ProductSelect-product-template');
    if (!productSelect) { productSelect = document.getElementsByName('id')[0]; }
    if (!productSelect) { log('Could not find the main select element'); return }

    /* create a message box */
    var shippingMessage = document.createElement('p');
    var shippingCountry = document.createElement('select');
    var shippingProvince = document.createElement('select');
    var shippingZip = document.createElement('input');
    var freteLista = document.createElement('div');

    /* Erro Frete */
    shippingMessage.classList.add('erros-fretes');
    shippingMessage.setAttribute("style", "display:none");

    /* Ajustes da lista de fretes */
    freteLista.classList.add('listas-de-fretes');
    freteLista.setAttribute("style", "display:none");

    /* We are just adding some dummy fields for example only. There's better ways to handle this */
    var initFields = function () {

        /* create the country picker */
        shippingCountry.id = "pais-simulator";

        var countries = ['Brazil'];
        for (var i = 0; i < countries.length; i++) {
            shippingCountry.add(new Option(countries[i], countries[i], i === 0));
        };
        shippingCountry.name = 'shipping_address[country]';

        /* create the province state picker */
        shippingProvince.id = "estados-simulator";

        var provinces = ['Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo', 'Goias', 'Maranhao', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba', 'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins'];
        for (var i = 0; i < provinces.length; i++) {
            shippingProvince.add(new Option(provinces[i], provinces[i], i === 0));
        };
        shippingProvince.name = 'shipping_address[province]';

        /* create the zip / postcode field */
        shippingZip.type = 'text';
        shippingZip.name = 'shipping_address[zip]';
        shippingZip.className = 'Form__Input cep-calculo-frete form-control';
        shippingZip.placeholder = 'DIGITE SEU CEP';
        $(shippingZip).mask("00.000-000")

        /* create a wrapper for the fields */
        var shippingCalcWrapper = document.createElement('div');
        shippingCalcWrapper.className = 'shipping-calc-wrapper';

        /* create a wrapper for the fields */
        var formularioFrete = document.createElement('div');
        formularioFrete.className = 'formulario-frete';

        /* create a title */
        var shippingCalcTitle = document.createElement('p');
        shippingCalcTitle.innerText = 'Simule seu frete';

        /* create a get rates button */
        var shippingCalcButton = document.createElement('a');
        shippingCalcButton.innerText = 'Calcular';
        shippingCalcButton.className = 'btn btn-underline button--primary button';
        shippingCalcButton.onclick = function () {

            var cepLimpo = shippingZip.value.replace(/\D/g, '');

            shippingMessage.innerHTML = '';
            shippingMessage.setAttribute("style", "display:none");
            $.getJSON("https://viacep.com.br/ws/" + cepLimpo + "/json/?callback=?", function (dados) {

                if (!("erro" in dados)) {

                    switch (dados.uf) {
                        case 'AC': dados.uf = 'Acre'; break;
                        case 'AL': dados.uf = 'Alagoas'; break;
                        case 'AP': dados.uf = 'Amapa'; break;
                        case 'AM': dados.uf = 'Amazonas'; break;
                        case 'BA': dados.uf = 'Bahia'; break;
                        case 'CE': dados.uf = 'Ceara'; break;
                        case 'DF': dados.uf = 'Distrito Federal'; break;
                        case 'ES': dados.uf = 'Espirito Santo'; break;
                        case 'GO': dados.uf = 'Goias'; break;
                        case 'MA': dados.uf = 'Maranhao'; break;
                        case 'MT': dados.uf = 'Mato Grosso'; break;
                        case 'MS': dados.uf = 'Mato Grosso do Sul'; break;
                        case 'MG': dados.uf = 'Minas Gerais'; break;
                        case 'PA': dados.uf = 'Para'; break;
                        case 'PB': dados.uf = 'Paraiba'; break;
                        case 'PR': dados.uf = 'Parana'; break;
                        case 'PE': dados.uf = 'Pernambuco'; break;
                        case 'PI': dados.uf = 'Piaui'; break;
                        case 'RJ': dados.uf = 'Rio de Janeiro'; break;
                        case 'RN': dados.uf = 'Rio Grande do Norte'; break;
                        case 'RS': dados.uf = 'Rio Grande do Sul'; break;
                        case 'RO': dados.uf = 'Rondonia'; break;
                        case 'RR': dados.uf = 'Roraima'; break;
                        case 'SC': dados.uf = 'Santa Catarina'; break;
                        case 'SP': dados.uf = 'Sao Paulo'; break;
                        case 'SE': dados.uf = 'Sergipe'; break;
                        case 'TO': dados.uf = 'Tocantins'; break;
                    };

                    shippingProvince.value = dados.uf;

                    if (!productSelect.value.length) { console.log("Nenhuma variação selecionada");/* return false*/ }
                    cartCookie = getCookie('cart');
                    var tempCookieValue = tempCookieValue || "temp-cart-cookie___" + Date.now();
                    var fakeCookieValue = fakeCookieValue || "fake-cart-cookie___" + Date.now();

                    /* if not found, make a new temp cookie */
                    if (!cartCookie) {
                        log('no cookie found');
                        updateCartCookie(tempCookieValue);
                        cartCookie = getCookie('cart');
                    } else {
                        log('cookie found');
                    }

                    /* if found but has a weird length, bail */
                    if (cartCookie.length < 32) { log('cart ID not valid'); return }

                    /* Change the cookie value to a new 32 character value */
                    updateCartCookie(fakeCookieValue);
                    log(getCookie('cart'));

                    if (!productSelect.value.length) {
                        getRates(parseInt($(productSelect).find('option').get(1).value));
                    } else {
                        getRates(parseInt(productSelect.value));
                    }
                    return false;
                }
            }).fail(function () {
                $('.listas-de-fretes').html("");
                shippingMessage.innerHTML = 'Cep não encontrado, tente novamente.';
                shippingMessage.setAttribute("style", "display:flex");
            });

        };

        /* create some labels for the fields */
        var labelNames = ['País', 'Estado', 'CEP'];
        var labels = [];
        for (var i = 0; i < labelNames.length; i++) {
            var label = document.createElement('label');
            label.innerText = labelNames[i];
            labels.push(label);
        };

        shippingCalcWrapper.appendChild(formularioFrete);

        /*shippingCalcWrapper.appendChild(shippingCalcTitle);
            shippingCalcWrapper.appendChild(labels[0]);*/
        formularioFrete.appendChild(shippingCountry);
        /*shippingCalcWrapper.appendChild(labels[1]);*/
        formularioFrete.appendChild(shippingProvince);
        /*shippingCalcWrapper.appendChild(labels[2]);*/
        formularioFrete.appendChild(shippingZip);
        formularioFrete.appendChild(shippingCalcButton);
        shippingCalcWrapper.appendChild(shippingMessage);
        shippingCalcWrapper.appendChild(freteLista);

        /* add to the page */
        productSection[0].appendChild(shippingCalcWrapper);

    };

    /* A console logging function */
    var log = function (a) {
        if (!debug) { return }
        console.log(a);
    };

    /* get cookie by name */
    var getCookie = function (name) {
        var value = "; " + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(";").shift();
    };

    /* update the cart cookie value */
    var updateCartCookie = function (a) {
        log('changing cart cookie value to: ' + a);
        var date = new Date();
        date.setTime(date.getTime() + (14 * 86400000));
        var expires = '; expires=' + date.toGMTString();
        document.cookie = 'cart=' + a + expires + '; path=/';
    };

    /* reset the cart cookie value */
    var resetCartCookie = function () {
        updateCartCookie(cartCookie);
        log(getCookie('cart'));
    };

    /* get the rates */
    var getRates = function (variantId) {

        $('.listas-de-fretes').html("");
        $('.listas-de-fretes').show();

        /* add whatever sanity checks you need in addition to the one below */
        if (typeof variantId === 'undefined') { return }

        /* the main quantity element */
        var productQuantity = document.getElementById('Quantity');

        var quantity = productQuantity ? parseInt(productQuantity.value) : 1;
        var addData = {
            'id': variantId,
            'quantity': quantity
        };

        function isDateBeforeToday(date) {
            return new Date(date.toDateString()) < new Date(new Date().toDateString());
        }

        function excludeDate(name) {
            var response = (name != 'Entrega Expressa - pedidos feitos até 11h chegam em até 24hrs úteis' && name != 'Entrega Rápida - pedidos chegam em até 48hrs úteis');
            return response;
        }

        fetch('/cart/add.js?_easygift_internal=true', {
            body: JSON.stringify(addData),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'xmlhttprequest' /* XMLHttpRequest is ok too, it's case insensitive */
            },
            method: 'POST'
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            /* we have JSON */
            console.log(json);
            /* Change the cookie value back to what it was */

            $.ajax({
                type: "GET",
                url: '/cart/shipping_rates.json?_easygift_internal=true',
                data: {
                    'shipping_address[country]': shippingCountry.value,
                    'shipping_address[province]': shippingProvince.value,
                    'shipping_address[zip]': shippingZip.value
                },
                beforeSend: function () {
                    //Aqui adicionas o loader
                    $('.listas-de-fretes').html("<img id='loading-icon-frete' src='https://cdn.shopify.com/s/files/1/2184/2809/files/loading-buffering.gif?v=1621716543' width='30px' style='width:30px; height: 30px; margin:0 auto'>");
                },
                success: function (d) {
                    if (d.shipping_rates && d.shipping_rates.length) {
                        for (var i = 0; i < d.shipping_rates.length; i++) {

                            var deliveryDate = d.shipping_rates[i].delivery_date;

                            var entrega = new Date(d.shipping_rates[i].delivery_date);
                            var checkBeforeday = isDateBeforeToday(entrega);
                            var excludeDateCheck = excludeDate(d.shipping_rates[i].name);
                            let dataFormatada = ((entrega.getDate())) + "/" + ((entrega.getMonth() + 1)) + "/" + entrega.getFullYear();

                            var valorFrete = d.shipping_rates[i].price;

                            if (valorFrete == "0.00" || valorFrete == null) { valorFrete = "Grátis" } else { valorFrete = Shopify.formatMoney(valorFrete, 'R$ {{amount_no_decimals_with_comma_separator}}') };

                            if (deliveryDate == null && excludeDateCheck || checkBeforeday && excludeDateCheck) {
                                entrega = "Estimativa de entrega indisponível"
                            } else if (!excludeDateCheck) {
                                if (d.shipping_rates[i].name == "Entrega Expressa - pedidos feitos até 11h chegam em até 24hrs úteis") {
                                    entrega = ""
                                } else {
                                    entrega = ""
                                }
                            } else {
                                entrega = "(Estimativa de entrega: " + dataFormatada + ")";
                            }

                            $('<div class="frete-item"> <div> <p class="m-0 nome-frete"><b>' + d.shipping_rates[i].name + '</b> <span class="estimativa-de-entrega">' + entrega + '</span></p> </div><div class="frete-valor">Valor: <b> ' + valorFrete + '</b></div> </div>').appendTo('.listas-de-fretes');
                        };

                        $('#loading-icon-frete').remove();
                        console.log("Removido");
                    }
                    resetCartCookie();
                },
                error: function () {
                    resetCartCookie();
                    $('.listas-de-fretes').html("");
                    shippingMessage.innerHTML = 'Cep não encontrado, tente novamente.';
                    shippingMessage.setAttribute("style", "display:flex");
                },
                dataType: 'json'
            }).fail(function () {
                alert("fail");
            })


        }).catch(function (err) {
            /* uh oh, we have error. */
            console.error(err);
            resetCartCookie()
        });

    };

    initFields();
})();