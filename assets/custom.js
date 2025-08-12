$(document).ready(function () {
  function copyToClipboard(element) {
    var $temp = $("<input>");
    var oldValue = $(element).html();

    $("body").append($temp);
    $temp.val($(element).children("span").html()).select();
    document.execCommand("copy");
    $(element).html("COPIADO");
    setTimeout(function () {
      $(element).html(oldValue);
    }, 300);
    $temp.remove();
  }

  $("cupom").click(function () {
    copyToClipboard(this);
  });

  AOS.init();
  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load(
    "particles-js",
    $(".footer.footer-1").data("config"),
    function () {
      return;
    }
  );

  // detect when a link to #discover-flavors and toggle .active class to .flavor-selector-fixed .productView-flavors-selector
  $('a[href="#discover-flavors"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(
      "clicked: ",
      $(".flavor-selector-fixed .productView-flavors-selector")
    );
    $(".flavor-selector-fixed .productView-flavors-selector").toggleClass(
      "active"
    );
  });

  if (window.location.pathname.includes("/assinatura"))
    particlesJS.load(
      "particles-js-assinatura",
      $(".bg-planos").data("config"),
      function () {
        return;
      }
    );

  if ($(document.body).hasClass("template-product")) {
    $("input.product-selection-input").on("change", () => {
      const value = $("input.product-selection-input:checked").val();
      if (value == window.location.pathname) return;

      window.location = value;
    });

    Fancybox.bind("[data-fancybox]", {});
  }

  // COMPRA RÁPIDA
  $(document).on("click", "[data-add-kit-to-cart]", function () {
    const btn = $(this);
    $(btn).addClass("is-loading");
    const json = $(this).data("json");
    console.log(json);
    const quantitySelectorValue = parseInt(
      $(".form-input.quantity__input").val()
    );
    Shopify.queue = [];
    json.forEach((item) => {
      Shopify.queue.push({
        variantId: item.variant_id,
        quantity: item.quantity * quantitySelectorValue,
      });
    });
    Shopify.moveAlong = function () {
      if (Shopify.queue.length) {
        var request = Shopify.queue.shift();
        let dataForm =
          "quantity=" + request.quantity + "&id=" + request.variantId;
        var params = {
          type: "POST",
          url: "/cart/add.js",
          data: dataForm,
          dataType: "json",
          beforeSend: function () {
            console.log(dataForm);
          },
          success: function (line_item) {
            Shopify.moveAlong();
          },
          error: function (XMLHttpRequest, textStatus) {
            console.log("Erro ao adicionar");
          },
        };
        $.ajax(params);
      } else {
        $(btn).removeClass("is-loading");
        $(".content-compra-rapida").removeClass("is-loading");
        $(".content-compra-rapida").find("loading-overlay--custom").remove();
        $("body").removeClass("compra-rapida-aberto");
        Shopify.getCart((cartTotal) => {
          $("body").addClass("cart-sidebar-show");
          $("body").find("[data-cart-count]").text(cartTotal.item_count);
          window.updateCart(cartTotal);
        });
      }
    };
    Shopify.moveAlong();
  });
  $(".btn-quantity").on("click", function () {
    var inputElement = $(this).siblings(".qtd-input");
    var currentValue = parseInt(inputElement.val());
    var maxInventory = parseInt(inputElement.attr("data-inventory"));
    if ($(this).hasClass("plus")) {
      if (currentValue < maxInventory) {
        inputElement.val(currentValue + 1).trigger("change");
      }
    } else if ($(this).hasClass("minus")) {
      if (currentValue > 0) {
        inputElement.val(currentValue - 1).trigger("change");
      }
    }
  });
  $(".qtd-input").on("change", function () {
    var inputValue = parseInt($(this).val());
    var maxInventory = parseInt($(this).attr("data-inventory"));
    if (inputValue < 0) {
      $(this).val(0);
    } else if (inputValue > maxInventory) {
      $(this).val(maxInventory).trigger("change");
    }
  });
});

window.buttonCart = function () {
  const $container = document.querySelector(".slide-button__container");
  const $control = document.querySelector(".slide-button__control");
  const $text = document.querySelector(".slide-button__text");
  const $completedOverlay = document.querySelector(
    ".slide-button__completed-overlay"
  );
  const $completedArrow = document.querySelector(".arrow.arrow__completed");

  if (
    !$container ||
    !$control ||
    !$text ||
    !$completedOverlay ||
    !$completedArrow
  ) {
    console.error(
      "Some elements are missing, cannot initialize the draggable button."
    );
    return;
  }

  const slidingWidth = $container.getBoundingClientRect().width - 8;

  // Cleanup previous Draggable instance if exists
  if (window.dragInstance) {
    window.dragInstance[0].kill();
  }

  // Cleanup previous event listeners if they were set
  $control.removeEventListener("click", handleControlClick);

  window.dragInstance = Draggable.create($control, {
    bounds: {
      left: 4,
      width: slidingWidth,
    },
    type: "x",
    onDrag() {
      updateDragProgress(this.x);
    },
    onDragEnd() {
      completeAction(this.x);
    },
  });

  $control.addEventListener("click", handleControlClick);

  function handleControlClick() {
    if (
      window.dragInstance &&
      window.dragInstance[0] &&
      !window.dragInstance[0].isDragging
    ) {
      completeAction(window.dragInstance[0].maxX);
    }
  }

  function updateDragProgress(currentX) {
    const percent = currentX / window.dragInstance[0].maxX;
    const completedOpacity = Math.pow(percent, 4);

    $text.style.opacity = 1 - percent * 1.5;
    $completedOverlay.style.opacity = completedOpacity;
    $completedArrow.style.opacity = completedOpacity;
    stopContinuousAnimation();
  }

  function completeAction(currentX) {
    const isSlideCompleted = currentX > window.dragInstance[0].maxX * 0.4;
    const destinationX = isSlideCompleted
      ? window.dragInstance[0].maxX
      : window.dragInstance[0].minX;
    const duration = isSlideCompleted ? 0.2 : 0.5;
    const toCompleteOpacity = isSlideCompleted ? 0 : 1;
    const completedOpacity = isSlideCompleted ? 1 : 0;

    TweenMax.to($control, duration, {
      x: destinationX,
      opacity: toCompleteOpacity,
      ease: isSlideCompleted ? "" : "back.out(1.05)",
    });
    TweenMax.to($text, 0.2, { opacity: toCompleteOpacity });
    TweenMax.to($completedOverlay, 0.2, { opacity: completedOpacity });
    TweenMax.to($completedArrow, 0.2, { opacity: completedOpacity });

    if (!isSlideCompleted) {
      setContinuousAnimation();
    } else {
      window.location.href = "/checkout";
    }
  }

  function setContinuousAnimation() {
    if (window.animInterval) {
      clearInterval(window.animInterval);
    }
    window.animInterval = setInterval(animateShake, 4000);
  }

  function stopContinuousAnimation() {
    clearInterval(window.animInterval);
  }

  function animateShake() {
    TweenMax.to($control, 0.2, {
      x: 20,
      ease: "power1.in",
      onComplete() {
        TweenMax.to($control, 0.5, {
          x: 0,
          ease: "bounce.out",
        });
      },
    });
  }

  // UPSELL Carrinho
  window.upsellSliderInit = function () {
    // $(".recommend-slider .swiper-wrapper").slick({
    //   slidesToShow: 2.5,
    //   slidesToScroll: 2,
    //   variableWidth: false,
    //   dots: true,
    //   infinite: false,
    //   arrows: true,
    //   prevArrow: ".swiper-button-prev",
    //   nextArrow: ".swiper-button-next",
    //   responsive: [
    //     {
    //       breakpoint: 768,
    //       settings: {
    //         slidesToShow: 2.3,
    //         slidesToScroll: 2,
    //         variableWidth: false,
    //         centerMode: false,
    //       },
    //     },
    //   ],
    // });

    $(".recommend-container").addClass("loaded");
  };

  function beforeSend(element) {
    $("#dropdown-cart").addClass("updating-cart");
    $(element).find(".recommend-btn-add").addClass("is-loading");
  }

  function afterSend(element) {
    $("#dropdown-cart").removeClass("updating-cart");
    $(element).find(".recommend-btn-add").removeClass("is-loading");
  }

  $(document).on("submit", ".upsell-form", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const serializedData = {};
    formData.forEach((value, key) => {
      serializedData[key] = value;
    });
    const jsonData = JSON.stringify(serializedData);

    // URL da API da Shopify para adicionar um item ao carrinho
    const addToCartUrl = window.Shopify.routes.root + "cart/add.js";

    // Opções da requisição
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    };

    beforeSend(e.target); // Ação "before send" antes da requisição

    // Faz a requisição usando fetch com ação "before send" e "after send"
    fetch(addToCartUrl, requestOptions)
      .then((response) => {
        afterSend(); // Ação "after send" após a conclusão da requisição

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // A requisição foi bem-sucedida, você pode atualizar o carrinho ou fazer outras ações necessárias aqui
        Shopify.getCart(window.updateCart);
        $("body").addClass("cart-sidebar-show");
      })
      .catch((error) => {
        // Houve um erro na requisição, você pode tratar o erro aqui
        console.error("Error:", error);
      });
  });

  $(document).on("change", ".variants-product-selects select", function () {
    var $currentSelect = $(this);
    var $nextSelect = $currentSelect
      .closest(".variants-product-selects")
      .find("select")
      .eq($currentSelect.index() + 1);

    if ($nextSelect.length && $nextSelect.is(":hidden")) {
      $nextSelect.show();
    } else if (!$nextSelect.length) {
      var selectedOptions = $currentSelect
        .closest(".variants-product-selects")
        .find("select")
        .map(function () {
          return $(this).val();
        })
        .get();
      var productData = JSON.parse(
        $currentSelect
          .closest(".infoProduct")
          .find("[data-json-product]")
          .text()
      );

      var matchingVariant = productData.find(function (variant) {
        return selectedOptions.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      if (matchingVariant && matchingVariant.available) {
        $currentSelect
          .closest(".infoProduct")
          .find(".variantIdAddCart")
          .val(matchingVariant.id);
        $currentSelect
          .closest(".infoProduct")
          .find(".recommend-btn-add")
          .prop("disabled", false);
        $currentSelect
          .closest(".infoProduct")
          .find(".recommend-btn-add")
          .val("ADICIONAR");
      } else {
        $currentSelect
          .closest(".infoProduct")
          .find(".recommend-btn-add")
          .prop("disabled", true);
        $currentSelect
          .closest(".infoProduct")
          .find(".recommend-btn-add")
          .val("ESGOTADO");
        console.log("Produto esgotado");
      }
    }

    var container = $(".halo-cart-sidebar").find(".previewCart");
    var scrollTo = $(".halo-cart-sidebar").find(".recommend-container");

    // A posição de rolagem final é a posição do topo do .recommend-container mais sua altura
    var scrollPosition =
      scrollTo.offset().top +
      scrollTo.outerHeight() +
      container.scrollTop() -
      container.position().top;

    // Realiza a rolagem
    container.animate(
      {
        scrollTop: scrollPosition,
      },
      1000
    ); // 1000 milissegundos para a animação de rolagem
  });
};

$(window).on("load", function () {
  $("[data-play-video]").get(0).play();
});
