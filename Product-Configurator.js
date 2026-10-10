"use strict";


const COLOR_TRIPLES = {  
  sunset:   ["#93a9f0", "#b6a9d2", "#f5a766"],
  ocean:    ["#7fd8f5", "#3b8fe0", "#1b4fb0"],
  mint:     ["#b8f2d0", "#5fd09a", "#1e9a66"],
  berry:    ["#ffb3c7", "#d96aa7", "#7a3b9e"],
  graphite: ["#9aa3b2", "#5b6475", "#262b36"],
  gold:     ["#fff0a8", "#f2c94c", "#b8860b"],
  rose:     ["#ffd9e2", "#f48fb1", "#c2185b"],
  aurora:   ["#7af7d4", "#6f8bff", "#9b3df0"]
};
const BASE_PRICE = 24.99;
const SIZE_EXTRA = { "": 0, "1L": 0, "1.5L": 5, "2L": 9 };
const DEFAULT_ENGRAVING = "Your Name";
const PRODUCT_NAME = "AQUA Smart Water Bottle";

const LOTTIE_SUCCESS_URL = "";

const BACKEND_URL = "http://localhost:3000";
const PUBLIC_PRODUCT_URL = BACKEND_URL + "/api/product";

const $configForm = $("#configForm");
const $previewArea = $("#previewArea");
const $previewLabel = $("#previewLabel");
const $product = $("#product");
const $engravingInput = $("#engravingInput");
const $engravingPreview = $("#engravingPreview");
const $engravingError = $("#engravingError");
const $charCount = $("#charCount");
const $sizeSelect = $("#sizeSelect");
const $sizeError = $("#sizeError");
const $lidSelect = $("#lidSelect");
const $fontSelect = $("#fontSelect");
const $glowToggle = $("#glowToggle");
const $metalToggle = $("#metalToggle");
const $price = $("#price");
const $message = $("#message");
const $focusStatus = $("#focusStatus");
const $protectedDescription = $("#protectedDescription");
const $allColorButtons = $(".color-option");
const $premiumItems = $(".premium-item");
const $premiumCard = $("#premiumCard");
const $lockNote = $("#lockNote");
const $userStatus = $("#userStatus");
const $premiumBadge = $("#premiumBadge");

const $cartZone = $("#cartZone");
const $cartTitle = $("#cartTitle");
const $cartDetails = $("#cartDetails");
const $miniCart = $("#miniCart");
const $miniCartCount = $("#miniCartCount");
let cartCount = 0;

const $paymentOverlay = $("#paymentOverlay");
const $paymentForm = $("#paymentForm");
const $paymentView = $("#paymentView");
const $processingView = $("#processingView");
const $successView = $("#successView");
const $lottieBox = $("#lottieBox");
const $lockToast = $("#lockToast");


let selectedColor = "sunset";
let isPremiumUser = false;
let lottieInstance = null;
let toastTimer = null;

function restartAnimation($el, className) {
  $el.removeClass(className);
  void $el[0].offsetWidth;
  $el.addClass(className);
}

function escapeHtml(text) {
  return $("<div>").text(text).html();
}


function showMessage(text, type = "success") {
  $message.text(text).attr("class", "message show " + type);
}
const showWarning = (text) => showMessage(text, "warning");
const showError = (text) => showMessage(text, "error");

function setFieldError($input, $errorEl, text) {
  $errorEl.text(text);
  $input.toggleClass("invalid", Boolean(text));
}


function updatePrice() {
  const total = BASE_PRICE + SIZE_EXTRA[$sizeSelect.val()];
  $price.text("$" + total.toFixed(2));
  restartAnimation($price, "bump");
}

function applyColor(colorName) {
  selectedColor = colorName;
  $.each(COLOR_TRIPLES[colorName], (i, stop) => $product.css("--c" + (i + 1), stop));
  $allColorButtons.each(function () {
    $(this).toggleClass("selected", $(this).data("color") === colorName);
  });
}

function applyEngravingFont() {
  $engravingPreview.removeClass("font-script font-serif");
  if ($fontSelect.val() !== "default") $engravingPreview.addClass("font-" + $fontSelect.val());
}


function updateEngravingPreview() {
  const value = $engravingInput.val();
  if (!isPremiumUser) $engravingPreview.text("");                  
  else $engravingPreview.text(value.trim() === "" ? DEFAULT_ENGRAVING : value);
  $charCount.text(value.length + " / 20").toggleClass("near-limit", value.length >= 18);
  $("#engravingHint").text(!isPremiumUser ? "🔒 Engraving is a Premium feature"
    : value.length === 20 ? "Character limit reached" : "Maximum 20 characters");
}

$engravingInput.on("input", function () { if (isPremiumUser) updateEngravingPreview(); });

$engravingInput.on("mousedown keydown", function (event) {
  if (isPremiumUser || event.key === "Tab") return;
  event.preventDefault();
  $engravingInput.trigger("blur");
  showLockPrompt("Custom engraving");
});

/* Free colours */
$("#freeColors .color-option").on("click", function () {
  const color = $(this).data("color");
  applyColor(color);
  showMessage("✓ Colour changed to " + String(color).toUpperCase());
  $focusStatus.text("✓ Colour changed to " + String(color).toUpperCase());
});

$sizeSelect.on("change", function () {
  if ($sizeSelect.val() === "2L" && !isPremiumUser) {   
    $sizeSelect.val("");
    showLockPrompt("2 Liter size");
  }
  const size = $sizeSelect.val();
  $product.removeClass("size-1L size-1p5L size-2L");
  if (size) $product.addClass("size-" + size.replace(".", "p"));
  setFieldError($sizeSelect, $sizeError, "");
  updatePrice();
  showMessage(size ? "✓ Size set to " + size : "Please choose a size.", size ? "success" : "warning");
  if (size) $focusStatus.text("✓ Size selected: " + size);
});

$lidSelect.on("change", function () {
  if ($lidSelect.val() === "sport" && !isPremiumUser) {  
    showLockPrompt("Straw cap");
  }
  $product.toggleClass("sport-lid", $lidSelect.val() === "sport");
  showMessage("✓ Lid style: " + $lidSelect.find("option:selected").text());
  $focusStatus.text("✓ Lid style selected: " + $lidSelect.val());
});


$previewArea.on("mousemove", function (event) {
  const rect = this.getBoundingClientRect();
  const rotateY = (event.clientX - rect.left - rect.width / 2) / 20;
  const rotateX = (rect.height / 2 - (event.clientY - rect.top)) / 20;
  $product.css("transform", `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
});
$previewArea.on("mouseenter", function () {
  $previewArea.addClass("hovered");
  $previewLabel.text("Drag the bottle to the cart to add it");
});
$previewArea.on("mouseleave", function () {
  $previewArea.removeClass("hovered");
  $previewLabel.text("Move your pointer over the bottle");
  $product.css("transform", "rotateX(0deg) rotateY(0deg)");
});

$product.find(".logo").on("mouseenter", () => $previewLabel.text("Hourly goals keep you on track"));
$engravingPreview.on("mouseenter", () => $previewLabel.text("Your engraving appears here"));
$product.find(".b-cap, .b-handle, .b-spout").on("mouseenter", () => $previewLabel.text("Carry handle and flip spout"));


$engravingInput.on("focus", function () { if (isPremiumUser) $focusStatus.text("✓ Engraving field is active"); });
$engravingInput.on("blur", function () {
  $focusStatus.text(!isPremiumUser ? "🔒 Engraving is a Premium feature."
    : $engravingInput.val().trim() === "" ? "Engraving left blank." : "✓ Engraving saved.");
});
$sizeSelect.on("focus", () => $focusStatus.text("✓ Size selector is active"));


function validateConfiguration() {
  let valid = true;
  if ($sizeSelect.val() === "") {
    setFieldError($sizeSelect, $sizeError, "Please select a product size.");
    valid = false;
  }
  if (!valid) {
    restartAnimation($configForm, "shake");
    showError("Please complete the highlighted fields.");
  }
  return valid;
}

function getPremiumExtras() {
  const extras = [];
  if ($fontSelect.val() !== "default") extras.push($fontSelect.val() + " font");
  if ($glowToggle.is(":checked")) extras.push("glow");
  if ($metalToggle.is(":checked")) extras.push("metallic");
  return extras;
}

function addToCart() {
  const premiumExtras = getPremiumExtras();
  const engraving = $engravingInput.val().trim();
  $cartTitle.text("✓ Product Added to Cart");
  $cartDetails.html(
    "<strong>AQUA Water Bottle</strong><br>" +
    (isPremiumUser && engraving ? "Engraving: " + escapeHtml(engraving) + "<br>" : "") +
    "Colour: " + selectedColor.toUpperCase() + " · Size: " + $sizeSelect.val() + " · Lid: " + $lidSelect.val() +
    (premiumExtras.length ? "<br>Premium: " + premiumExtras.join(", ") : "") +
    "<br><strong>Total: " + $price.text() + "</strong>"
  );
  restartAnimation($cartZone, "added");
  cartCount += 1;
  updateMiniCart(true);
  showMessage("✓ Product successfully added to the cart!");
}

function updateMiniCart(animate) {
  $miniCartCount.text(cartCount);
  if (animate) restartAnimation($miniCart, "added");
}

$configForm.on("submit", function (event) {
  event.preventDefault();
  if (validateConfiguration()) addToCart();
});

const $dropZones = $cartZone.add($miniCart);

function setDragState(isDragging) {
  $("body").toggleClass("is-dragging", isDragging);
  $product.css("opacity", isDragging ? "0.6" : "1");
  if (!isDragging) {
    $dropZones.removeClass("drag-active");
    $cartTitle.text(cartCount > 0 ? "✓ Product Added to Cart" : "Drop Product Here");
  }
}

function finishDrop() {
  if (validateConfiguration()) addToCart();
  else $cartTitle.text("Complete the configuration first");
}

$dropZones.each(function () {
  const $zone = $(this);
  const isCartZone = $zone.is($cartZone);
  $zone.on("dragover", function (event) {
    event.preventDefault();
    $zone.addClass("drag-active");
    if (isCartZone) $cartTitle.text("Release to Add Product");
  });
  $zone.on("dragleave", function () {
    $zone.removeClass("drag-active");
    if (isCartZone) $cartTitle.text("Drop Product Here");
  });
  $zone.on("drop", function (event) {
    event.preventDefault();
    $zone.removeClass("drag-active");

    if (event.originalEvent.dataTransfer.getData("text/plain") !== "configured-product") return;
    finishDrop();
  });
});
$miniCart.on("click", () => $("#cart")[0].scrollIntoView({ behavior: "smooth" }));


$product.on("dragstart", function (event) {
  if (touchDragging) { event.preventDefault(); return; }
  event.originalEvent.dataTransfer.setData("text/plain", "configured-product");
  setDragState(true);
  showMessage("Drag the bottle onto the floating cart (bottom right) or the cart section.", "warning");
});
$product.on("dragend", () => setDragState(false));

$(document).on("dragover", function (event) {
  const edge = 90;
  if (event.clientY < edge) window.scrollBy(0, -18);
  else if (window.innerHeight - event.clientY < edge) window.scrollBy(0, 18);
});

let touchTimer = null, touchDragging = false, $touchGhost = null, touchStartX = 0, touchStartY = 0;

function moveGhost(touch) {
  $touchGhost.css({
    left: touch.clientX - $touchGhost.outerWidth() / 2 + "px",
    top: touch.clientY - $touchGhost.outerHeight() / 2 + "px"
  });
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const $hovered = $(target).closest("#cartZone, #miniCart");
  $dropZones.each(function () { $(this).toggleClass("drag-active", $hovered.is(this)); });
  return $hovered.length ? $hovered : null;
}

$product.on("touchstart", function (event) {
  const touch = event.originalEvent.touches[0];
  touchStartX = touch.clientX; touchStartY = touch.clientY;
  touchTimer = setTimeout(() => {
    touchDragging = true;
    $touchGhost = $product.clone().removeAttr("id").addClass("touch-ghost");
    $touchGhost.find("[id]").removeAttr("id");
    $("body").append($touchGhost);
    setDragState(true);
    moveGhost({ clientX: touchStartX, clientY: touchStartY });
    if (navigator.vibrate) navigator.vibrate(30);
    showMessage("Move the bottle onto the floating cart and release.", "warning");
  }, 350);
});

$product.on("touchmove", function (event) {
  const touch = event.originalEvent.touches[0];
  if (!touchDragging) {  
    if (Math.abs(touch.clientX - touchStartX) > 8 || Math.abs(touch.clientY - touchStartY) > 8) clearTimeout(touchTimer);
    return;
  }
  event.preventDefault();
  moveGhost(touch);
});

function endTouchDrag(event) {
  clearTimeout(touchTimer);
  if (!touchDragging) return;
  const touch = event.originalEvent.changedTouches[0];
  const $hovered = $touchGhost ? moveGhost(touch) : null;
  if ($touchGhost) $touchGhost.remove();
  $touchGhost = null; touchDragging = false;
  setDragState(false);
  if ($hovered && event.type === "touchend") finishDrop();
}
$product.on("touchend touchcancel", endTouchDrag);


$protectedDescription.on("copy", function (event) {
  event.preventDefault();
  showWarning("Copying the product description is disabled.");
});
$protectedDescription.on("cut", function (event) {
  event.preventDefault();
  showWarning("Cutting the product description is disabled.");
});

$configForm.on("reset", function () {
  setTimeout(() => {
    applyColor("sunset");
    $product.removeClass("size-1L size-1p5L size-2L glow metal sport-lid");
    updateEngravingPreview();
    applyEngravingFont();
    $charCount.text("0 / 20").removeClass("near-limit");
    $("#engravingHint").text("Maximum 20 characters");
    setFieldError($engravingInput, $engravingError, "");
    setFieldError($sizeSelect, $sizeError, "");
    $product.css("transform", "rotateX(0deg) rotateY(0deg)");
    $cartDetails.html("");
    $cartTitle.text("Drop Product Here");
    $cartZone.removeClass("added");
    cartCount = 0;
    updateMiniCart(false);
    $price.text("$" + BASE_PRICE.toFixed(2));
    $focusStatus.text("Configuration reset.");
    showMessage("✓ Configurator has been reset.");
  }, 0);
});


function showLockPrompt(featureName) {
  $("#lockToastText").text("🔒 " + featureName + " is a Premium feature.");
  $lockToast.prop("hidden", false);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $lockToast.prop("hidden", true), 5000);
  showWarning("Upgrade to Premium to use " + featureName.toLowerCase() + ".");
}

/* Premium colours */
$("#premiumColors .color-option").on("click", function () {
  const color = $(this).data("color");
  if (!isPremiumUser) { showLockPrompt(color + " colour"); return; }
  applyColor(color);
  showMessage("✓ Premium colour applied: " + String(color).toUpperCase());
});

$fontSelect.add($glowToggle).add($metalToggle).on("mousedown keydown", function (event) {
  if (isPremiumUser || event.key === "Tab") return;
  event.preventDefault();
  $(this).trigger("blur");
  showLockPrompt($(this).data("feature"));
});

$fontSelect.on("change", function () { if (isPremiumUser) applyEngravingFont(); });
$glowToggle.on("change", function () { if (isPremiumUser) $product.toggleClass("glow", $(this).is(":checked")); });
$metalToggle.on("change", function () { if (isPremiumUser) $product.toggleClass("metal", $(this).is(":checked")); });

function setPremiumStatus(active) {
  isPremiumUser = active;
  $premiumCard.toggleClass("unlocked", active);
  $premiumItems.attr("aria-disabled", String(!active));
  $lockNote.text(active ? "✅ Premium unlocked – enjoy all features" : "🔒 Locked – upgrade to use these features");
  $userStatus.text(active ? "Premium User ★" : "Free User")
    .attr("class", "status-pill " + (active ? "premium" : "free"));
  $premiumBadge.toggleClass("active", active);
  // Premium-only options in the main form
  $engravingInput.prop("readOnly", !active)
    .attr("placeholder", active ? "Enter your name" : "🔒 Premium feature")
    .toggleClass("locked-input", !active);
  $lidSelect.find("option").eq(1).text(active ? "Straw cap" : "Straw cap 🔒 Premium");
  $sizeSelect.find("option").eq(3).text(active ? "2 Liter (+$9)" : "2 Liter 🔒 Premium");
  updateEngravingPreview();
}

/* Reset premium back to free (demo helper) */
$("#resetPremiumBtn").on("click", function () {
  setPremiumStatus(false);
  $glowToggle.prop("checked", false);
  $metalToggle.prop("checked", false);
  $fontSelect.val("default");
  $product.removeClass("glow metal sport-lid");
  applyEngravingFont();
  $engravingInput.val("");
  $lidSelect.val("standard");
  if ($sizeSelect.val() === "2L") { $sizeSelect.val(""); $product.removeClass("size-2L"); updatePrice(); }
  updateEngravingPreview();
  if ($.inArray(selectedColor, ["berry", "graphite", "gold", "rose", "aurora"]) !== -1) applyColor("sunset");
  showMessage("Premium has been reset to Free User (demo).", "warning");
});

/* Interactive premium badge */
$premiumBadge.on("click", function () {
  if (isPremiumUser) showMessage("★ You are a Premium user!");
  else openPayment();
});

/* =========================================================
   PAYMENT MODAL
   ========================================================= */
function openPayment() {
  $lockToast.prop("hidden", true);
  $paymentOverlay.prop("hidden", false);
  $paymentView.prop("hidden", false);
  $processingView.prop("hidden", true);
  $successView.prop("hidden", true);
  $("#cardName").trigger("focus");
}
function closePayment() {
  $paymentOverlay.prop("hidden", true);
}
$("#openUpgradeBtn").on("click", openPayment);
$("#navUpgrade").on("click", function (event) { event.preventDefault(); openPayment(); });
$("#lockToastUpgrade").on("click", openPayment);
$("#closePaymentBtn").on("click", closePayment);
$("#successCloseBtn").on("click", function () {
  closePayment();
  $("#premium")[0].scrollIntoView({ behavior: "smooth" });
});
$paymentOverlay.on("click", function (event) { if (event.target === this) closePayment(); });
$(document).on("keydown", function (event) {
  if (event.key === "Escape" && !$paymentOverlay.prop("hidden")) closePayment();
});

/* ----- Payment method + live card preview ----- */
const $paymentMethod = $("#paymentMethod");
const METHOD_LABELS = { card: "Credit / Debit Card", paypal: "PayPal", cash: "Cash" };
const PAY_FIELD_IDS = ["cardName", "cardNumber", "cardExpiry", "cardCvv", "paypalEmail", "cashName"];

function showMethodFields() {
  const method = $paymentMethod.val();
  $("#cardFields").prop("hidden", method !== "card");
  $("#paypalFields").prop("hidden", method !== "paypal");
  $("#cashFields").prop("hidden", method !== "cash");
  $("#cardPreview").prop("hidden", method !== "card");
  $("#payLayout").toggleClass("no-preview", method !== "card");
  $.each(PAY_FIELD_IDS, (i, id) => setFieldError($("#" + id), $("#" + id + "Error"), ""));
}
$paymentMethod.on("change", showMethodFields);

/* Letters only for names; the card preview updates while typing */
$.each([["cardName", true], ["cashName", false]], function (i, [id, updatesPreview]) {
  $("#" + id).on("input", function () {
    const $input = $(this);
    $input.val($input.val().replace(/[^a-zA-Z .'-]/g, ""));
    if (updatesPreview) $("#previewName").text($input.val().toUpperCase() || "CARD HOLDER");
  });
});
$("#cardNumber").on("input", function () {
  const digits = $(this).val().replace(/\D/g, "").slice(0, 16);
  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
  $(this).val(formatted);
  $("#previewNumber").text(formatted || "**** **** **** ****");
});
$("#cardExpiry").on("input", function () {
  let digits = $(this).val().replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) digits = digits.slice(0, 2) + "/" + digits.slice(2);
  $(this).val(digits);
  $("#previewExpiry").text(digits || "MM/YY");
});
$("#cardCvv").on("input", function () {
  $(this).val($(this).val().replace(/\D/g, "").slice(0, 3));
});

/* Validation depends on the chosen payment method */
function validatePayment() {
  const method = $paymentMethod.val();
  let valid = true;
  const check = (id, msg) => {
    setFieldError($("#" + id), $("#" + id + "Error"), msg);
    if (msg) valid = false;
  };
  const nameMessage = (value) => !value.trim() ? "Name is required."
    : !/^[A-Za-z][A-Za-z .'-]+$/.test(value.trim()) ? "Use letters only (min. 2 characters)." : "";

  if (method === "card") {
    check("cardName", nameMessage($("#cardName").val()).replace("Name", "Cardholder name"));

    const digits = $("#cardNumber").val().replace(/\s/g, "");
    check("cardNumber", !digits ? "Card number is required." : !/^\d{16}$/.test(digits) ? "Card number must be 16 digits." : "");

    let expiryMessage = "";
    const expiry = $("#cardExpiry").val();
    const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiry) expiryMessage = "Expiry date is required.";
    else if (!match) expiryMessage = "Use the format MM/YY.";
    else {
      const month = Number(match[1]), year = 2000 + Number(match[2]), now = new Date();
      if (month < 1 || month > 12) expiryMessage = "Month must be 01–12.";
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) expiryMessage = "This card has expired.";
    }
    check("cardExpiry", expiryMessage);

    const cvv = $("#cardCvv").val();
    check("cardCvv", !cvv ? "CVV is required." : !/^\d{3}$/.test(cvv) ? "CVV must be 3 digits." : "");
  } else if (method === "paypal") {
    const email = $("#paypalEmail").val().trim();
    check("paypalEmail", !email ? "PayPal email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : "");
  } else {
    check("cashName", nameMessage($("#cashName").val()));
  }
  return valid;
}

$paymentForm.on("submit", function (event) {
  event.preventDefault();
  if (!validatePayment()) return;
  runSimulatedPayment($paymentMethod.val());
});

$paymentForm.on("reset", function () {
  setTimeout(() => {          // wait until the browser has cleared the fields
    showMethodFields();
    $("#previewName").text("CARD HOLDER");
    $("#previewNumber").text("**** **** **** ****");
    $("#previewExpiry").text("MM/YY");
  }, 0);
});

/* Simulated payment – nothing is sent or stored */
function runSimulatedPayment(method) {
  $paymentView.prop("hidden", true);
  $processingView.prop("hidden", false);

  setTimeout(() => {
    $paymentForm[0].reset(); // clear payment data immediately
    $("#successMethod").text("Paid with " + METHOD_LABELS[method] + " (demo)");
    $processingView.prop("hidden", true);
    $successView.prop("hidden", false);
    playSuccessAnimation();
    setPremiumStatus(true);
    showMessage("★ Premium activated via " + METHOD_LABELS[method] + "! Premium customization is unlocked.");
  }, 2000);
}

function playSuccessAnimation() {
  const tick = '<div style="font-size:90px;color:#16834a">✓</div>';
  if (lottieInstance) { lottieInstance.destroy(); lottieInstance = null; }
  $lottieBox.empty();
  if (!window.lottie) { $lottieBox.html(tick); return; }   // player script could not load (offline)

  const baseConfig = { container: $lottieBox[0], renderer: "canvas", loop: false, autoplay: true };
  if (!LOTTIE_SUCCESS_URL) {
    if (typeof SUCCESS_LOTTIE !== "undefined") lottieInstance = lottie.loadAnimation({ ...baseConfig, animationData: SUCCESS_LOTTIE });
    else $lottieBox.html(tick);
    return;
  }
  lottieInstance = lottie.loadAnimation({ ...baseConfig, path: LOTTIE_SUCCESS_URL });
  lottieInstance.addEventListener("data_failed", () => {
    lottieInstance.destroy();
    $lottieBox.empty();
    if (typeof SUCCESS_LOTTIE !== "undefined") lottieInstance = lottie.loadAnimation({ ...baseConfig, animationData: SUCCESS_LOTTIE });
    else $lottieBox.html(tick);
  });
}

/* =========================================================
   Q2 + Q3: AJAX  (jQuery $.ajax)
   ========================================================= */
function setApiStatus(text, type) {
  $("#apiStatus").text(text).removeClass("idle loading success error").addClass(type);
}

/* Show the request that was sent and the response that came back (also visible in DevTools → Network) */
function showExchange(method, url, statusLine, bodyObj) {
  $("#apiResponseBox").text(
    method + " " + url + "\n" + statusLine + "\n\n" +
    (bodyObj === undefined ? "" : JSON.stringify(bodyObj, null, 2))
  );
}

/* Render product JSON into the API panel (name, price, category, image, description) */
function renderProduct(data) {
  $("#apiProductName").text(data.title || "Unnamed product");

  $("#apiProductDescription").text(
    data.description || "No description available."
  );

  $("#apiProductCategory").text(
    "Category: " + (data.category || "—")
  );

  $("#apiProductPrice").text(
    "Price: $" + (data.price ?? "—")
  );

  // Use a local illustration instead of an external image URL.
  const bottleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" rx="24" fill="#edf5ff"/>
      <ellipse cx="150" cy="252" rx="58" ry="10" fill="#cbd5e1"/>
      <rect x="126" y="43" width="48" height="24" rx="6" fill="#253c73"/>
      <rect x="119" y="63" width="62" height="19" rx="7" fill="#647fe5"/>
      <rect x="94" y="78" width="112" height="158" rx="29"
            fill="#7194f2" stroke="#4567c5" stroke-width="3"/>
      <path d="M113 94 Q103 150 116 211"
            fill="none" stroke="#ffffff" stroke-opacity=".65"
            stroke-width="9" stroke-linecap="round"/>
      <rect x="111" y="135" width="78" height="52" rx="10"
            fill="#ffffff" fill-opacity=".92"/>
      <text x="150" y="157" font-family="Arial" font-size="19"
            font-weight="bold" fill="#344e9b" text-anchor="middle">AQUA</text>
      <text x="150" y="174" font-family="Arial" font-size="9"
            fill="#344e9b" text-anchor="middle">STAY HYDRATED</text>
    </svg>
  `;

  const localImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(bottleSvg);

  $("#apiProductImage")
    .attr("src", localImage)
    .attr("alt", data.title || "AQUA water bottle")
    .prop("hidden", false)
    .show();
}

/* Q2: jQuery AJAX GET -> public API -> JSON -> webpage */
$("#loadApiProductBtn").on("click", function () {
  setApiStatus("Loading...", "loading");
  $("#apiResponseBox").text("GET " + PUBLIC_PRODUCT_URL + "\n\nWaiting for JSON...");
  console.log("[AJAX] GET", PUBLIC_PRODUCT_URL);

  $.ajax({ url: PUBLIC_PRODUCT_URL, method: "GET", dataType: "json", timeout: 10000 })
    .done(function (data, textStatus, xhr) {
      console.log("[AJAX] response", xhr.status, data);
      renderProduct(data);
      showExchange("GET", PUBLIC_PRODUCT_URL, "Status: " + xhr.status + " " + xhr.statusText, data);
      setApiStatus("Public API ✓", "success");
      $("#backendMessage").text("Public API GET completed successfully. Inspect Network → Fetch/XHR for the request and JSON response.");
      showMessage("✓ Product information loaded from the public API.");
    })
    .fail(function (xhr, status, error) {
      console.error("[AJAX] failed", status, error);
      const reason = status === "timeout" ? "The request timed out."
        : xhr.status ? "Server responded with " + xhr.status + " " + error
        : "No response (offline, blocked or CORS error).";
      setApiStatus("API Error", "error");
      showExchange("GET", PUBLIC_PRODUCT_URL, "Request failed – " + reason);
      $("#backendMessage").text("Public API request failed. " + reason + " Check your connection and the Network tab.");
      showError("Could not load product information from the public API.");
    });
});

/* Q3: Frontend -> AJAX GET -> Express -> JSON -> Frontend */
$("#loadBackendProductBtn").on("click", function () {
  const url = BACKEND_URL + "/api/product";
  setApiStatus("Loading local...", "loading");
  console.log("[AJAX] GET", url);

  $.ajax({ url: url, method: "GET", dataType: "json", timeout: 8000 })
    .done(function (data, textStatus, xhr) {
      console.log("[AJAX] response", xhr.status, data);
      renderProduct(data);
      showExchange("GET", url, "Status: " + xhr.status + " " + xhr.statusText, data);
      setApiStatus("Express GET ✓", "success");
      $("#backendMessage").text("Express GET succeeded. The response came from server.js predefined JSON data.");
      showMessage("✓ Product loaded from the local Express backend.");
    })
    .fail(function (xhr) {
      const detail = (xhr.responseJSON && xhr.responseJSON.message) || "Make sure Node/Express is running on port 3000.";
      setApiStatus("Backend Error", "error");
      showExchange("GET", url, "Request failed – " + detail);
      $("#backendMessage").text(detail);
      showError("Local backend is unavailable. Start it with: npm install && npm start");
    });
});

/* Build a plain JavaScript object from the current configurator state. */
function getConfigurationObject() {
  return {
    productName: PRODUCT_NAME,
    selectedColor: selectedColor,
    variant: $lidSelect.val(),
    size: $sizeSelect.val(),
    engraving: isPremiumUser ? $engravingInput.val().trim() : "",
    premium: isPremiumUser,
    premiumExtras: getPremiumExtras(),
    price: $price.text(),
    submittedAt: new Date().toISOString()
  };
}

/* Q3: JavaScript object -> JSON.stringify -> POST -> Express req.body -> JSON response */
$("#sendConfigurationBtn").on("click", function () {
  if (!validateConfiguration()) return;

  const url = BACKEND_URL + "/api/configurations";
  const configuration = getConfigurationObject();          // JavaScript object
  const json = JSON.stringify(configuration);              // converted to JSON text
  setApiStatus("Sending...", "loading");
  $("#apiResponseBox").text("POST " + url + "\n\nRequest body (JSON):\n" + JSON.stringify(configuration, null, 2));
  console.log("[AJAX] POST", url, json);

  $.ajax({ url: url, method: "POST", contentType: "application/json", dataType: "json", data: json, timeout: 8000 })
    .done(function (response, textStatus, xhr) {
      console.log("[AJAX] response", xhr.status, response);
      showExchange("POST", url, "Status: " + xhr.status + " " + xhr.statusText, response);
      setApiStatus("POST ✓", "success");
      $("#backendMessage").text("Express received the JSON body and returned a JSON confirmation (order " + response.orderId + "). Check the Node terminal for the middleware log.");
      showMessage("✓ Configuration sent successfully to the Express backend.");
    })
    .fail(function (xhr) {
      const detail = (xhr.responseJSON && xhr.responseJSON.message) || "Could not submit configuration. Is the Express server running on port 3000?";
      setApiStatus("POST Error", "error");
      showExchange("POST", url, "Request failed – " + detail);
      $("#backendMessage").text(detail);
      showError("Configuration could not be submitted to the backend.");
    });
});

/* Navigation link to the API section */
$("a[href='#apiData']").on("click", function (event) {
  event.preventDefault();
  $("#apiData")[0].scrollIntoView({ behavior: "smooth" });
});

/* =========================================================
   PAGE SCROLL EFFECT
   ========================================================= */
$(window).on("scroll", function () {
  $("body").toggleClass("scrolled", window.scrollY > 40);
});

/* =========================================================
   INIT
   ========================================================= */
$(function () {
  applyColor("sunset");
  setPremiumStatus(false);
});
