document.addEventListener("DOMContentLoaded", () => {
  const websiteSettingsKey = "stapleWebsiteSettings";
  let websiteSettings;
  try {
    websiteSettings = JSON.parse(localStorage.getItem(websiteSettingsKey) || "null") || {
      disableTransitions: false,
      darkMode: false,
    };
  } catch {
    websiteSettings = { disableTransitions: false, darkMode: false };
  }

  const applyWebsiteSettings = () => {
    if (!document.body) return;
    document.body.classList.toggle("transitions-off", Boolean(websiteSettings.disableTransitions));
    document.body.classList.toggle("site-dark", Boolean(websiteSettings.darkMode));
  };

  applyWebsiteSettings();

  const pageMemoryKey = "stapleLastLoadedPath";
  const currentPagePath = window.location.pathname;
  const lastLoadedPath = sessionStorage.getItem(pageMemoryKey);
  const shouldAnimateEntry = !websiteSettings.disableTransitions && lastLoadedPath !== currentPagePath;

  if (document.body) {
    if (shouldAnimateEntry) {
      requestAnimationFrame(() => document.body.classList.add("page-entered"));
    } else {
      document.body.classList.add("no-page-transition", "page-entered");
      requestAnimationFrame(() => document.body.classList.remove("no-page-transition"));
    }
    sessionStorage.setItem(pageMemoryKey, currentPagePath);
  }

  const navigateWithOverlay = (url) => {
    if (!url || !document.body) return;
    if (websiteSettings.disableTransitions) {
      window.location.href = url;
      return;
    }
    document.body.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = url;
    }, 620);
  };

  const currentUser = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
  if (!currentUser || !currentUser.email) {
    navigateWithOverlay("../index.html");
    return;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    if (link.hasAttribute("download")) return;

    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) return;

    let target;
    try {
      target = new URL(rawHref, window.location.href);
    } catch {
      return;
    }

    if (target.origin !== window.location.origin) return;
    if (
      target.pathname === window.location.pathname &&
      target.search === window.location.search &&
      target.hash === window.location.hash
    ) {
      return;
    }

    e.preventDefault();
    navigateWithOverlay(target.href);
  }, true);

  // Mobile Menu Toggle
  const setupMobileMenu = () => {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const shopModalLink = document.getElementById("shopmobilemodallink");
    
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove("active");
      }
    });

    // Handle shop by modal on mobile
    if (shopModalLink) {
      shopModalLink.addEventListener("click", (e) => {
        e.preventDefault();
        const modalContainer = document.getElementById("modalContainer");
        if (modalContainer) {
          modalContainer.classList.toggle("show");
          mobileMenu.classList.remove("active");
        }
      });
    }
  };

  setupMobileMenu();

  const shopByLink = document.getElementById("shopmodal");
  const modalContainer = document.getElementById("modalContainer");
  if (shopByLink && modalContainer) {
    shopByLink.addEventListener("click", (e) => {
      e.preventDefault();
      modalContainer.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (
        modalContainer.classList.contains("show") &&
        !modalContainer.contains(e.target) &&
        e.target.id !== "shopmodal" && e.target.id !== "shopmobilemodallink"
      ) {
        modalContainer.classList.remove("show");
      }
    });
  }

  const searchButton = document.getElementById("searchButton");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");
  if (searchButton && searchOverlay && searchModal) {
    searchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      searchOverlay.classList.add("active");
      searchModal.classList.add("active");
      if (searchInput) searchInput.focus();
    });

    searchOverlay.addEventListener("click", (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove("active");
        searchModal.classList.remove("active");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchOverlay.classList.remove("active");
        searchModal.classList.remove("active");
      }
    });
  }

  const setupFaqModal = () => {
    const questionButton = document.getElementById("questionButton");
    if (!questionButton) return;

    let overlay = document.getElementById("stapleFaqOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "stapleFaqOverlay";
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        zIndex: "2600",
        opacity: "0",
        visibility: "hidden",
        pointerEvents: "none",
        transition: "opacity 220ms ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      });

      const panel = document.createElement("div");
      Object.assign(panel.style, {
        width: "min(860px, 96vw)",
        maxHeight: "88vh",
        overflowY: "auto",
        background: "#ffffff",
        color: "#111",
        borderRadius: "14px",
        padding: "22px 24px",
        boxShadow: "0 18px 38px rgba(0,0,0,0.35)",
        position: "relative",
      });

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.textContent = "Close";
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: window.innerWidth <= 768 ? "10px" : "14px",
        right: window.innerWidth <= 768 ? "10px" : "14px",
        border: "1px solid #d0d0d0",
        background: "#f3f3f3",
        borderRadius: "8px",
        padding: window.innerWidth <= 768 ? "5px 9px" : "6px 10px",
        cursor: "pointer",
        zIndex: "2",
        fontSize: window.innerWidth <= 768 ? "13px" : "14px",
      });

      const content = document.createElement("div");
      Object.assign(content.style, {
        textAlign: "justify",
        textJustify: "inter-word",
        lineHeight: "1.45",
      });
      content.innerHTML = '<h2 style="margin:0 0 12px; font-size:clamp(22px, 5vw, 34px); line-height:1.1; padding-right:84px;">Frequently Asked Questions</h2><ol style="margin: 0; padding-left: 20px; display: grid; gap: 10px; text-align: justify; text-justify: inter-word;"><li><strong>How do I place an order?</strong><br>Browse products, choose what you like, add to cart, then click checkout and follow the steps.</li><li><strong>What payment methods do you accept?</strong><br>We accept cash on delivery, credit/debit cards, and e-wallets (like GCash).</li><li><strong>How long does delivery take?</strong><br>Delivery usually takes 3-7 days depending on your location.</li><li><strong>How can I track my order?</strong><br>You can track your order in your account dashboard under "Orders."</li><li><strong>Can I cancel my order?</strong><br>Yes, you can cancel your order before it is shipped.</li><li><strong>Can I return or exchange items?</strong><br>Yes, you can return or exchange items within 7 days after receiving them, as long as they are not used and still in good condition.</li><li><strong>What if I receive a wrong or damaged item?</strong><br>Please contact us right away with photos, and we will help you fix the issue.</li><li><strong>Do you offer refunds?</strong><br>Yes, refunds are available for approved returns. Processing may take a few days.</li><li><strong>Do I need an account to order?</strong><br>No, but creating an account makes it easier to track your orders.</li><li><strong>How can I contact you?</strong><br>You can message us through our contact page or social media accounts.</li></ol>';

      const closeFaq = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          if (overlay.style.opacity === "0") {
            overlay.style.visibility = "hidden";
            overlay.style.pointerEvents = "none";
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            const nav = document.querySelector(".navbar");
            if (nav) {
              nav.style.paddingRight = "";
            }
          }
        }, 230);
      };

      closeBtn.addEventListener("click", closeFaq);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closeFaq();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.style.visibility === "visible") {
          closeFaq();
        }
      });

      panel.appendChild(closeBtn);
      panel.appendChild(content);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
    }

    questionButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + "px";
        const nav = document.querySelector(".navbar");
        if (nav) {
          nav.style.paddingRight = scrollbarWidth + "px";
        }
      }
      document.body.style.overflow = "hidden";
      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "auto";
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
    });
  };

  setupFaqModal();

  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let ticking = false;
    const checkAtTop = () => {
      const atTop = window.scrollY <= 5;
      navbar.classList.toggle("at-top", atTop);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkAtTop);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  const cartButton = document.getElementById("cartButton");
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      navigateWithOverlay("../Clothes_Sites/Cart/cart.html");
    });
  }

  const badge = document.querySelector(".cart-badge");
  if (badge) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    badge.textContent = String(count);
  }

  const dashboardStorageKey = "stapleDashboardData_" + currentUser.email;
  const profileImageKey = "stapleProfileImage_" + currentUser.email;

  const createDefaultData = () => ({
    orders: [
      { id: "ORD-1001", item: "Regular Fit Shirt", status: "Processing", tracking: "Awaiting courier pickup", date: "2026-03-25" },
      { id: "ORD-1000", item: "Cropped Box Shirt", status: "Shipped", tracking: "Hub transfer in progress", date: "2026-03-18" },
      { id: "ORD-0994", item: "Oversized Shirt", status: "Delivered", tracking: "Delivered on March 5", date: "2026-03-05" }
    ],
    wishlist: [
      { id: "W-1", name: "Regular Fit Shirt - White", onSale: false },
      { id: "W-2", name: "Cropped Box Shirt - Black", onSale: true }
    ],
    payments: [
      { id: "P-1", label: "Visa ending 4242", type: "card" },
      { id: "P-2", label: "GCash - 09*********", type: "ewallet" }
    ],
    addresses: [
      { id: "A-1", label: "Home", line: "Blk 12 Lot 3, Sample Street, City", isDefault: true },
      { id: "A-2", label: "Work", line: "2nd Floor, Sample Building, City", isDefault: false }
    ],
    settings: {
      secureCheckout: true,
      phone: currentUser.phone || ""
    }
  });

  let data;
  try {
    data = JSON.parse(localStorage.getItem(dashboardStorageKey) || "null") || createDefaultData();
  } catch {
    data = createDefaultData();
  }

  const saveData = () => {
    localStorage.setItem(dashboardStorageKey, JSON.stringify(data));
  };

  const statusClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "processing") return "status-processing";
    if (s === "shipped") return "status-shipped";
    if (s === "delivered") return "status-delivered";
    return "";
  };

  const setNavbarAvatarFromProfile = () => {
    const navbarUserLogo = document.querySelector("#userButton .userlogo");
    if (!navbarUserLogo) return;
    const img = localStorage.getItem(profileImageKey);
    if (img) {
      navbarUserLogo.src = img;
      navbarUserLogo.style.width = "36px";
      navbarUserLogo.style.height = "36px";
      navbarUserLogo.style.objectFit = "cover";
      navbarUserLogo.style.borderRadius = "999px";
      navbarUserLogo.style.border = "2px solid rgba(0, 0, 0, 0.9)";
      navbarUserLogo.style.boxSizing = "border-box";
    }
  };

  const profileUsername = document.getElementById("profileUsername");
  const profileEmail = document.getElementById("profileEmail");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileImageInput = document.getElementById("profileImageInput");
  const changeProfileImageBtn = document.getElementById("changeProfileImageBtn");

  if (profileUsername) profileUsername.textContent = currentUser.username || "User";
  if (profileEmail) profileEmail.textContent = currentUser.email;

  const storedProfileImage = localStorage.getItem(profileImageKey);
  if (profileAvatar && storedProfileImage) {
    profileAvatar.src = storedProfileImage;
  }
  setNavbarAvatarFromProfile();

  if (changeProfileImageBtn && profileImageInput) {
    changeProfileImageBtn.addEventListener("click", () => profileImageInput.click());
    if (profileAvatar) {
      profileAvatar.addEventListener("click", () => profileImageInput.click());
    }

    profileImageInput.addEventListener("change", () => {
      const file = profileImageInput.files && profileImageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        if (!result) return;
        localStorage.setItem(profileImageKey, result);
        if (profileAvatar) profileAvatar.src = result;
        setNavbarAvatarFromProfile();
      };
      reader.readAsDataURL(file);
    });
  }

  const statTotalOrders = document.getElementById("statTotalOrders");
  const statSavedItems = document.getElementById("statSavedItems");
  const recentOrdersList = document.getElementById("recentOrdersList");
  const ordersList = document.getElementById("ordersList");
  const wishlistList = document.getElementById("wishlistList");
  const paymentsList = document.getElementById("paymentsList");
  const addressesList = document.getElementById("addressesList");

  const renderOverview = () => {
    if (statTotalOrders) statTotalOrders.textContent = String(data.orders.length);
    if (statSavedItems) statSavedItems.textContent = String(data.wishlist.length);

    if (recentOrdersList) {
      recentOrdersList.innerHTML = "";
      const recent = data.orders.slice(0, 3);
      if (!recent.length) {
        recentOrdersList.innerHTML = '<li class="row-item">No recent orders yet.</li>';
      } else {
        recent.forEach((order) => {
          const li = document.createElement("li");
          li.className = "row-item";
          li.innerHTML = '<div class="row-top"><strong>' + order.id + '</strong><span class="status-pill ' + statusClass(order.status) + '">' + order.status + '</span></div><div class="row-meta">' + order.item + ' ? ' + order.date + '</div>';
          recentOrdersList.appendChild(li);
        });
      }
    }
  };

  const renderOrders = () => {
    if (!ordersList) return;
    ordersList.innerHTML = "";

    if (!data.orders.length) {
      ordersList.innerHTML = '<div class="row-item">No orders found.</div>';
      return;
    }

    data.orders.forEach((order, index) => {
      const row = document.createElement("div");
      row.className = "row-item";
      row.innerHTML =
        '<div class="row-top"><strong>' + order.id + ' - ' + order.item + '</strong><span class="status-pill ' + statusClass(order.status) + '">' + order.status + '</span></div>' +
        '<div class="row-meta">Tracking details: ' + order.tracking + '</div>' +
        '<div class="row-actions">' +
          '<button type="button" class="subtle-btn reorder-btn" data-index="' + index + '">Reorder</button>' +
          '<button type="button" class="subtle-btn invoice-btn" data-index="' + index + '">View Invoice/Receipt</button>' +
        '</div>';
      ordersList.appendChild(row);
    });
  };

  const renderWishlist = () => {
    if (!wishlistList) return;
    wishlistList.innerHTML = "";

    if (!data.wishlist.length) {
      wishlistList.innerHTML = '<div class="row-item">No saved products yet.</div>';
      return;
    }

    data.wishlist.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "row-item";
      row.innerHTML =
        '<div class="row-top"><strong>' + item.name + '</strong>' +
          (item.onSale ? '<span class="status-pill status-delivered">On Sale</span>' : '') +
        '</div>' +
        '<div class="row-actions">' +
          '<button type="button" class="subtle-btn move-cart-btn" data-index="' + index + '">Move to Cart</button>' +
          '<button type="button" class="subtle-btn remove-wishlist-btn" data-index="' + index + '">Remove</button>' +
        '</div>';
      wishlistList.appendChild(row);
    });
  };

  const renderPayments = () => {
    if (!paymentsList) return;
    paymentsList.innerHTML = "";

    if (!data.payments.length) {
      paymentsList.innerHTML = '<div class="row-item">No saved cards / e-wallets.</div>';
      return;
    }

    data.payments.forEach((payment, index) => {
      const row = document.createElement("div");
      row.className = "row-item";
      row.innerHTML =
        '<div class="row-top"><strong>' + payment.label + '</strong></div>' +
        '<div class="row-actions">' +
          '<button type="button" class="subtle-btn remove-payment-btn" data-index="' + index + '">Remove</button>' +
        '</div>';
      paymentsList.appendChild(row);
    });
  };

  const renderAddresses = () => {
    if (!addressesList) return;
    addressesList.innerHTML = "";

    if (!data.addresses.length) {
      addressesList.innerHTML = '<div class="row-item">No saved shipping or billing addresses.</div>';
      return;
    }

    data.addresses.forEach((address, index) => {
      const row = document.createElement("div");
      row.className = "row-item";
      row.innerHTML =
        '<div class="row-top"><strong>' + address.label + (address.isDefault ? ' (Default)' : '') + '</strong></div>' +
        '<div class="row-meta">' + address.line + '</div>' +
        '<div class="row-actions">' +
          '<button type="button" class="subtle-btn default-address-btn" data-index="' + index + '">Set Default</button>' +
          '<button type="button" class="subtle-btn edit-address-btn" data-index="' + index + '">Edit</button>' +
          '<button type="button" class="subtle-btn delete-address-btn" data-index="' + index + '">Delete</button>' +
        '</div>';
      addressesList.appendChild(row);
    });
  };

  const renderAll = () => {
    renderOverview();
    renderOrders();
    renderWishlist();
    renderPayments();
    renderAddresses();
  };

  renderAll();

  document.addEventListener("click", (e) => {
    const reorderBtn = e.target.closest(".reorder-btn");
    if (reorderBtn) {
      const idx = Number(reorderBtn.dataset.index);
      const order = data.orders[idx];
      if (order) {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const catalog = {
          "Regular Fit Shirt": { image: "/Clothes/Regular_S.jfif", price: 269 },
          "Cropped Box Shirt": { image: "/Clothes/Cropped_S.jfif", price: 269 },
          "Oversized Shirt": { image: "/Clothes/Oversized_S.jfif", price: 269 },
          "Regular Fit (Black)": { image: "/Clothes/Regular_S.jfif", price: 269 },
          "Cropped Box (Black)": { image: "/Clothes/Cropped_S.jfif", price: 269 },
          "Oversized (Black)": { image: "/Clothes/Oversized_S.jfif", price: 269 }
        };
        const mapped = catalog[order.item] || { image: "/Clothes/Regular_S.jfif", price: 269 };

        const existingIndex = cart.findIndex((item) => String(item.name || "").toLowerCase() === String(order.item || "").toLowerCase());
        if (existingIndex > -1) {
          cart[existingIndex].quantity = Number(cart[existingIndex].quantity || 0) + 1;
        } else {
          cart.push({ name: order.item, price: mapped.price, quantity: 1, image: mapped.image });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Item added to cart.");
      }
    }

    const invoiceBtn = e.target.closest(".invoice-btn");
    if (invoiceBtn) {
      const idx = Number(invoiceBtn.dataset.index);
      const order = data.orders[idx];
      if (order) {
        alert("Invoice / receipt for " + order.id + " is available.");
      }
    }

    const moveCartBtn = e.target.closest(".move-cart-btn");
    if (moveCartBtn) {
      const idx = Number(moveCartBtn.dataset.index);
      const item = data.wishlist[idx];
      if (item) {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart.push({ name: item.name, price: 269, quantity: 1, image: "../Assets/Reg.jfif" });
        localStorage.setItem("cart", JSON.stringify(cart));
        data.wishlist.splice(idx, 1);
        saveData();
        renderAll();
      }
    }

    const removeWishlistBtn = e.target.closest(".remove-wishlist-btn");
    if (removeWishlistBtn) {
      const idx = Number(removeWishlistBtn.dataset.index);
      data.wishlist.splice(idx, 1);
      saveData();
      renderAll();
    }

    const removePaymentBtn = e.target.closest(".remove-payment-btn");
    if (removePaymentBtn) {
      const idx = Number(removePaymentBtn.dataset.index);
      data.payments.splice(idx, 1);
      saveData();
      renderAll();
    }

    const defaultAddressBtn = e.target.closest(".default-address-btn");
    if (defaultAddressBtn) {
      const idx = Number(defaultAddressBtn.dataset.index);
      data.addresses.forEach((a, i) => {
        a.isDefault = i === idx;
      });
      saveData();
      renderAll();
    }

    const editAddressBtn = e.target.closest(".edit-address-btn");
    if (editAddressBtn) {
      const idx = Number(editAddressBtn.dataset.index);
      const current = data.addresses[idx];
      if (!current) return;
      createInputModal("Edit Address", [
        { name: "label", label: "Address Label", placeholder: "Address Label", value: current.label },
        { name: "line", label: "Address Line", placeholder: "Street, City", value: current.line }
      ], (values) => {
        if (!values.label || !values.line) return;
        current.label = values.label;
        current.line = values.line;
        saveData();
        renderAll();
      });
    }

    const deleteAddressBtn = e.target.closest(".delete-address-btn");
    if (deleteAddressBtn) {
      const idx = Number(deleteAddressBtn.dataset.index);
      data.addresses.splice(idx, 1);
      if (!data.addresses.some((a) => a.isDefault) && data.addresses[0]) {
        data.addresses[0].isDefault = true;
      }
      saveData();
      renderAll();
    }
  });
  const addPaymentBtn = document.getElementById("addPaymentBtn");
  const createInputModal = (title, fields, onSubmit) => {
    const modal = document.createElement("div");
    modal.className = "input-modal-overlay";
    modal.innerHTML = `
      <div class="input-modal-box">
        <div class="input-modal-header"><h3>${title}</h3></div>
        <form class="input-modal-form">
          ${fields.map((f) => `
            <div class="input-modal-field">
              <label>${f.label}</label>
              <input type="text" placeholder="${f.placeholder}" class="modal-input" data-field="${f.name}" value="${f.value || ""}" />
            </div>
          `).join("")}
          <div class="input-modal-buttons">
            <button type="button" class="modal-cancel-btn">Cancel</button>
            <button type="submit" class="modal-submit-btn">Submit</button>
          </div>
        </form>
      </div>
    `;
    
    const overlay = modal;
    const form = modal.querySelector(".input-modal-form");
    const cancelBtn = modal.querySelector(".modal-cancel-btn");
    
    const closeModal = () => {
      overlay.classList.remove("is-open");
      window.setTimeout(() => {
        overlay.remove();
      }, 220);
    };
    
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const values = {};
      fields.forEach((f) => {
        const input = form.querySelector(`[data-field="${f.name}"]`);
        values[f.name] = input ? input.value.trim() : "";
      });
      closeModal();
      onSubmit(values);
    });
    
    document.body.appendChild(overlay);
    window.requestAnimationFrame(() => {
      overlay.classList.add("is-open");
    });
  };

  if (addPaymentBtn) {
    addPaymentBtn.addEventListener("click", () => {
      createInputModal("Add Payment Method", [
        { name: "method", label: "Card / E-wallet Label", placeholder: "Visa ending 1111", value: "" }
      ], (values) => {
        if (!values.method) return;
        data.payments.unshift({ id: "P-" + Date.now(), label: values.method, type: "custom" });
        saveData();
        renderAll();
      });
    });
  }

  const addAddressBtn = document.getElementById("addAddressBtn");
  if (addAddressBtn) {
    addAddressBtn.addEventListener("click", () => {
      createInputModal("Add Address", [
        { name: "label", label: "Address Label", placeholder: "New Address", value: "" },
        { name: "line", label: "Address Line", placeholder: "Street, City", value: "" }
      ], (values) => {
        if (!values.label || !values.line) return;
        data.addresses.push({
          id: "A-" + Date.now(),
          label: values.label,
          line: values.line,
          isDefault: data.addresses.length === 0
        });
        saveData();
        renderAll();
      });
    });
  }

  const secureCheckoutToggle = document.getElementById("secureCheckoutToggle");
  if (secureCheckoutToggle) {
    secureCheckoutToggle.checked = Boolean(data.settings.secureCheckout);
    secureCheckoutToggle.addEventListener("change", () => {
      data.settings.secureCheckout = secureCheckoutToggle.checked;
      saveData();
    });
  }

  const disableTransitionToggle = document.getElementById("disableTransitionToggle");
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (disableTransitionToggle) {
    disableTransitionToggle.checked = Boolean(websiteSettings.disableTransitions);
    disableTransitionToggle.addEventListener("change", () => {
      websiteSettings.disableTransitions = disableTransitionToggle.checked;
      localStorage.setItem(websiteSettingsKey, JSON.stringify(websiteSettings));
      applyWebsiteSettings();
    });
  }

  if (darkModeToggle) {
    darkModeToggle.checked = Boolean(websiteSettings.darkMode);
    darkModeToggle.addEventListener("change", () => {
      websiteSettings.darkMode = darkModeToggle.checked;
      localStorage.setItem(websiteSettingsKey, JSON.stringify(websiteSettings));
      applyWebsiteSettings();
    });
  }

  const settingsEmail = document.getElementById("settingsEmail");
  const settingsPhone = document.getElementById("settingsPhone");
  const settingsPassword = document.getElementById("settingsPassword");
  const accountSettingsForm = document.getElementById("accountSettingsForm");
  const settingsMessage = document.getElementById("settingsMessage");

  if (settingsEmail) settingsEmail.value = currentUser.email || "";
  if (settingsPhone) settingsPhone.value = data.settings.phone || "";

  if (accountSettingsForm) {
    accountSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newEmail = (settingsEmail && settingsEmail.value ? settingsEmail.value : "").trim().toLowerCase();
      const newPhone = (settingsPhone && settingsPhone.value ? settingsPhone.value : "").trim();
      const newPassword = (settingsPassword && settingsPassword.value ? settingsPassword.value : "").trim();

      if (!newEmail) {
        if (settingsMessage) {
          settingsMessage.textContent = "Email is required.";
          settingsMessage.style.color = "#cc1f1f";
        }
        return;
      }

      const users = JSON.parse(localStorage.getItem("stapleUsers") || "[]");
      const currentEmail = String(currentUser.email || "").toLowerCase();
      const duplicate = users.some((u) => String(u.email || "").toLowerCase() === newEmail && String(u.email || "").toLowerCase() !== currentEmail);

      if (duplicate) {
        if (settingsMessage) {
          settingsMessage.textContent = "Email is already used by another account.";
          settingsMessage.style.color = "#cc1f1f";
        }
        return;
      }

      const userIndex = users.findIndex((u) => String(u.email || "").toLowerCase() === currentEmail);
      if (userIndex >= 0) {
        users[userIndex].email = newEmail;
        users[userIndex].phone = newPhone;
        if (newPassword) {
          users[userIndex].password = newPassword;
        }
      }
      localStorage.setItem("stapleUsers", JSON.stringify(users));

      currentUser.email = newEmail;
      currentUser.phone = newPhone;
      localStorage.setItem("stapleCurrentUser", JSON.stringify(currentUser));

      data.settings.phone = newPhone;
      saveData();

      if (profileEmail) {
        profileEmail.textContent = newEmail;
      }

      if (settingsPassword) settingsPassword.value = "";
      if (settingsMessage) {
        settingsMessage.textContent = "Account settings updated.";
        settingsMessage.style.color = "#137333";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("stapleCurrentUser");
      navigateWithOverlay("../index.html");
    });
  }
});










