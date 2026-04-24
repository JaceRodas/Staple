document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".choice-btn"));
  const shirtPreview = document.getElementById("shirtPreview");
  const previewStage = document.getElementById("previewStage");
  const previewRibbon = document.getElementById("previewRibbon");
  const shirtName = document.getElementById("shirtName");
  const shirtSummary = document.getElementById("shirtSummary");
  const priceChip = document.getElementById("priceChip");
  const designChip = document.getElementById("designChip");
  const typeChip = document.getElementById("typeChip");
  const resetButton = document.getElementById("resetButton");
  const saveButton = document.getElementById("saveButton");
  const addToCartButton = document.getElementById("addToCartButton");

  const defaultState = {
    color: "Black",
    size: "M",
    design: "Plain",
    type: "Fitted",
  };

  const priceMap = {
    size: { S: 0, M: 0, L: 10, XL: 20 },
    design: { Plain: 0, Minimalist: 25, Logo: 35, Embroidery: 45 },
    type: { Fitted: 0, Loose: 12, "Cropped Box": 18 },
  };

  const filterMap = {
    Black: "none",
    Charcoal: "brightness(0.82) contrast(1.1)",
    Ivory: "brightness(1.7) saturate(0.35) contrast(0.9) invert(0.05)",
    Navy: "brightness(0.88) saturate(1.18) hue-rotate(185deg)",
  };

  const state = { ...defaultState };

  const slugify = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const formatTitle = () => {
    const prefix = state.type === "Cropped Box" ? "Cropped Box" : state.type;
    return `${state.color} ${prefix} Shirt`;
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
    const filter = filterMap[state.color] || "none";

    shirtName.textContent = title;
    previewRibbon.textContent = title;
    shirtSummary.textContent = `${state.type}, ${state.color}, ${state.design}, Size ${state.size}`;
    priceChip.innerHTML = `Base price: &#8369;${price.toFixed(2)}`;
    designChip.textContent = `${state.design} design`;
    typeChip.textContent = `${state.type} silhouette`;

    if (shirtPreview) {
      shirtPreview.style.filter = `drop-shadow(0 30px 40px rgba(0, 0, 0, 0.18)) ${filter}`;
      shirtPreview.alt = title;
    }

    if (previewStage) {
      const accent = document.querySelector('.button-row[data-control="color"] .choice-btn.active')?.dataset.accent || "#d8b979";
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

  resetButton?.addEventListener("click", () => {
    Object.assign(state, defaultState);
    updateActiveButtons("color", state.color);
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
    const productId = `custom-${slugify(productName)}-${slugify(state.design)}-${slugify(state.type)}`;
    const productPrice = calculatePrice();

    const customItem = {
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      image: "/Clothes/Oversized_S.jfif",
      customization: { ...state },
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => (item.id || item.name) === customItem.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
      cart[existingIndex].customization = { ...state };
    } else {
      cart.push(customItem);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    addToCartButton.textContent = "Added to cart";
    window.setTimeout(() => {
      addToCartButton.textContent = "Add Custom Shirt";
    }, 900);
  });

  updateActiveButtons("color", state.color);
  updateActiveButtons("size", state.size);
  updateActiveButtons("design", state.design);
  updateActiveButtons("type", state.type);
  updatePreview();
});
