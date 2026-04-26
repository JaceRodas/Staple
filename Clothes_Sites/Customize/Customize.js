document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".choice-btn"));
  const shirtPreviewCanvas = document.getElementById("shirtPreviewCanvas");
  const previewStage = document.getElementById("previewStage");
  const previewRibbon = document.getElementById("previewRibbon");
  const shirtName = document.getElementById("shirtName");
  const shirtSummary = document.getElementById("shirtSummary");
  const priceChip = document.getElementById("priceChip");
  const designChip = document.getElementById("designChip");
  const typeChip = document.getElementById("typeChip");
  const customColorPicker = document.getElementById("customColorPicker");
  const customColorCode = document.getElementById("customColorCode");
  const cartBadge = document.querySelector(".cart-badge");
  const resetButton = document.getElementById("resetButton");
  const saveButton = document.getElementById("saveButton");
  const addToCartButton = document.getElementById("addToCartButton");

  const defaultState = {
    customColor: "#1a1a1a",
    size: "M",
    design: "Plain",
    type: "Regular Fit",
  };

  const shirtTemplateMap = {
    "Regular Fit": {
      src: "/Clothes/Regular Template.jpg",
    },
    "Oversized": {
      src: "/Clothes/Oversized Template.jpg",
    },
    "Cropped Box": {
      src: "/Clothes/Cropped Template.jpg",
    },
  };

  const priceMap = {
    size: { S: 0, M: 0, L: 10, XL: 20 },
    design: { Plain: 0, Minimalist: 25, Logo: 35, Embroidery: 45 },
    type: { "Regular Fit": 0, "Oversized": 12, "Cropped Box": 18 },
  };

  const state = { ...defaultState };
  const templateImageCache = new Map();
  let renderToken = 0;

  const updateCartBadge = () => {
    if (!cartBadge) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    cartBadge.textContent = String(count);
  };

  const slugify = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const normalizeHex = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const match = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!match) return null;
    if (match[1].length === 3) {
      const [r, g, b] = match[1].split("");
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return `#${match[1].toLowerCase()}`;
  };

  const parseColorString = (value) => {
    const hex = normalizeHex(value);
    if (hex) {
      return {
        hex,
        rgb: {
          r: parseInt(hex.slice(1, 3), 16),
          g: parseInt(hex.slice(3, 5), 16),
          b: parseInt(hex.slice(5, 7), 16),
        },
      };
    }

    const rgbMatch = String(value || "").trim().match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (!rgbMatch) return null;
    const r = Math.max(0, Math.min(255, Number(rgbMatch[1])));
    const g = Math.max(0, Math.min(255, Number(rgbMatch[2])));
    const b = Math.max(0, Math.min(255, Number(rgbMatch[3])));
    const hexFromRgb = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
    return { hex: hexFromRgb, rgb: { r, g, b } };
  };

  const getSelectedColor = () => {
    const value = state.customColor || defaultState.customColor;
    return parseColorString(value) || parseColorString(defaultState.customColor);
  };

  const loadTemplateImage = (src) => {
    if (templateImageCache.has(src)) return templateImageCache.get(src);
    const pending = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    templateImageCache.set(src, pending);
    return pending;
  };

  const renderTintedTemplate = async () => {
    if (!shirtPreviewCanvas) return;
    const template = shirtTemplateMap[state.type] || shirtTemplateMap[defaultState.type];
    if (!template) return;

    const currentToken = ++renderToken;
    let image;
    try {
      image = await loadTemplateImage(template.src);
    } catch {
      return;
    }
    if (currentToken !== renderToken) return;

    const color = getSelectedColor();
    const tintStrength = 0.9;
    const canvas = shirtPreviewCanvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sw = image.width;
    const sh = image.height;

    const maxW = canvas.width * 0.82;
    const maxH = canvas.height * 0.8;
    const scale = Math.min(maxW / sw, maxH / sh);
    const dw = Math.max(1, Math.round(sw * scale));
    const dh = Math.max(1, Math.round(sh * scale));
    const dx = Math.round((canvas.width - dw) / 2);
    const dy = Math.round((canvas.height - dh) / 2) + 10;

    ctx.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);

    if (tintStrength > 0) {
      const imageData = ctx.getImageData(dx, dy, dw, dh);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha === 0) continue;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // Ignore almost-white background and watermark zones while tinting shirt body.
        if (luma > 238) continue;

        const mask = Math.max(0, Math.min(1, (230 - luma) / 220));
        const blend = mask * tintStrength;

        pixels[i] = Math.round(r * (1 - blend) + color.rgb.r * blend);
        pixels[i + 1] = Math.round(g * (1 - blend) + color.rgb.g * blend);
        pixels[i + 2] = Math.round(b * (1 - blend) + color.rgb.b * blend);
      }

      ctx.putImageData(imageData, dx, dy);
    }

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();
  };

  const setCustomColorValue = (rawValue) => {
    const parsed = parseColorString(rawValue);
    if (!parsed) {
      customColorCode?.classList.add("invalid");
      return false;
    }
    customColorCode?.classList.remove("invalid");
    state.customColor = parsed.hex;
    if (customColorPicker) customColorPicker.value = parsed.hex;
    if (customColorCode) customColorCode.value = parsed.hex;
    return true;
  };

  const formatTitle = () => {
    return `Custom ${state.type} Shirt`;
  };

  const calculatePrice = () =>
    299 + (priceMap.size[state.size] || 0) + (priceMap.design[state.design] || 0) + (priceMap.type[state.type] || 0);

  const updateActiveButtons = (controlName, value) => {
    document.querySelectorAll(`.button-row[data-control="${controlName}"] .choice-btn`).forEach((button) => {
      button.classList.toggle("active", button.dataset.value === value);
    });
  };

  const updatePreview = () => {
    const title = formatTitle();
    const price = calculatePrice();
    const selectedColor = getSelectedColor();

    shirtName.textContent = title;
    previewRibbon.textContent = title;
    shirtSummary.textContent = `${state.type}, ${selectedColor.hex}, ${state.design}, Size ${state.size}`;
    priceChip.innerHTML = `Base price: &#8369;${price.toFixed(2)}`;
    designChip.textContent = `${state.design} design`;
    typeChip.textContent = `${state.type} template`;

    renderTintedTemplate();

    if (previewStage) {
      const accent = selectedColor.hex || "#d8b979";
      previewStage.style.setProperty("--preview-accent", accent);
      previewStage.style.boxShadow = `inset 0 0 0 1px rgba(255,255,255,0.32), 0 0 0 1px rgba(0,0,0,0.04), 0 24px 64px color-mix(in srgb, ${accent} 18%, transparent)`;
    }
  };

  const loadSavedDesign = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("stapleCustomizerDraft") || "null");
      if (saved && typeof saved === "object") {
        Object.assign(state, defaultState, saved);
      }
      // Backward compatibility for older saved draft values.
      if (state.type === "Fitted") {
        state.type = "Regular Fit";
      } else if (state.type === "Loose") {
        state.type = "Oversized";
      }
      if (!shirtTemplateMap[state.type]) {
        state.type = defaultState.type;
      }
      if (!parseColorString(state.customColor)) {
        state.customColor = defaultState.customColor;
      }
    } catch {
      Object.assign(state, defaultState);
    }
  };

  const persistDraft = () => {
    localStorage.setItem("stapleCustomizerDraft", JSON.stringify(state));
  };

  loadSavedDesign();

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const control = button.closest(".button-row")?.dataset.control;
      const value = button.dataset.value;
      if (!control || !value) return;
      state[control] = value;
      updateActiveButtons(control, value);
      updatePreview();
      persistDraft();
    });
  });

  customColorPicker?.addEventListener("input", () => {
    if (setCustomColorValue(customColorPicker.value)) {
      updatePreview();
      persistDraft();
    }
  });

  customColorCode?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (setCustomColorValue(customColorCode.value)) {
      updatePreview();
      persistDraft();
    }
  });

  customColorCode?.addEventListener("blur", () => {
    if (setCustomColorValue(customColorCode.value)) {
      updatePreview();
      persistDraft();
    }
  });

  resetButton?.addEventListener("click", () => {
    Object.assign(state, defaultState);
    customColorCode?.classList.remove("invalid");
    if (customColorPicker) customColorPicker.value = defaultState.customColor;
    if (customColorCode) customColorCode.value = defaultState.customColor;
    updateActiveButtons("size", state.size);
    updateActiveButtons("design", state.design);
    updateActiveButtons("type", state.type);
    updatePreview();
    persistDraft();
  });

  saveButton?.addEventListener("click", () => {
    persistDraft();
    saveButton.textContent = "Saved";
    window.setTimeout(() => {
      saveButton.textContent = "Save Design";
    }, 900);
  });

  addToCartButton?.addEventListener("click", () => {
    const productName = formatTitle();
    const productPrice = calculatePrice();
    const selectedColor = getSelectedColor();
    const colorKey = (selectedColor?.hex || "").replace("#", "");
    const productId = `custom-${slugify(productName)}-${slugify(state.design)}-${slugify(state.type)}-${colorKey}`;

    let previewImage = "";
    try {
      previewImage = shirtPreviewCanvas ? shirtPreviewCanvas.toDataURL("image/png") : "";
    } catch {
      previewImage = "";
    }
    if (!previewImage) {
      const selectedTemplate = shirtTemplateMap[state.type] || shirtTemplateMap[defaultState.type];
      previewImage = selectedTemplate.src;
    }

    const customItem = {
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      image: previewImage,
      customization: { ...state, customColor: selectedColor.hex },
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => (item.id || item.name) === customItem.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
      cart[existingIndex].image = previewImage;
      cart[existingIndex].customization = { ...state, customColor: selectedColor.hex };
    } else {
      cart.push(customItem);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    addToCartButton.textContent = "Added to cart";
    window.setTimeout(() => {
      addToCartButton.textContent = "Add Custom Shirt";
    }, 900);
  });

  updateActiveButtons("size", state.size);
  updateActiveButtons("design", state.design);
  updateActiveButtons("type", state.type);
  if (customColorPicker) customColorPicker.value = state.customColor;
  if (customColorCode) customColorCode.value = state.customColor;
  updateCartBadge();
  updatePreview();
});
