document.addEventListener("DOMContentLoaded", () => {  // Page transition overlay: load goes up, navigation goes down
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

  const syncNavbarUserAvatar = () => {
    const userLogo = document.querySelector("#userButton .userlogo");
    if (!userLogo) return;
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
    } catch {
      currentUser = null;
    }
    if (!currentUser || !currentUser.email) return;

    const profileImage = localStorage.getItem("stapleProfileImage_" + currentUser.email);
    if (!profileImage) return;

    userLogo.src = profileImage;
    userLogo.style.width = "36px";
    userLogo.style.height = "36px";
    userLogo.style.objectFit = "cover";
    userLogo.style.borderRadius = "999px";
    userLogo.style.border = "2px solid rgba(0, 0, 0, 0.9)";
    userLogo.style.boxSizing = "border-box";
  };

  syncNavbarUserAvatar();

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
        const shopmodal = document.getElementById("shopmodal");
        if (shopmodal) shopmodal.click();
      });
    }
  };

  setupMobileMenu();

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
      content.innerHTML = "<h2 style=\"margin:0 0 12px; font-size:clamp(22px, 5vw, 34px); line-height:1.1; padding-right:84px;\">Frequently Asked Questions</h2><ol style=\"margin: 0; padding-left: 20px; display: grid; gap: 10px; text-align: justify; text-justify: inter-word;\"><li><strong>How do I place an order?</strong><br>Browse products, choose what you like, add to cart, then click checkout and follow the steps.</li><li><strong>What payment methods do you accept?</strong><br>We accept cash on delivery, credit/debit cards, and e-wallets (like GCash).</li><li><strong>How long does delivery take?</strong><br>Delivery usually takes 3-7 days depending on your location.</li><li><strong>How can I track my order?</strong><br>You can track your order in your account dashboard under \"Orders.\"</li><li><strong>Can I cancel my order?</strong><br>Yes, you can cancel your order before it is shipped.</li><li><strong>Can I return or exchange items?</strong><br>Yes, you can return or exchange items within 7 days after receiving them, as long as they are not used and still in good condition.</li><li><strong>What if I receive a wrong or damaged item?</strong><br>Please contact us right away with photos, and we will help you fix the issue.</li><li><strong>Do you offer refunds?</strong><br>Yes, refunds are available for approved returns. Processing may take a few days.</li><li><strong>Do I need an account to order?</strong><br>No, but creating an account makes it easier to track your orders.</li><li><strong>How can I contact you?</strong><br>You can message us through our contact page or social media accounts.</li></ol>";

      const closeFaq = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          if (overlay.style.opacity === "0") {
            overlay.style.visibility = "hidden";
            overlay.style.pointerEvents = "none";
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
      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "auto";
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
    });
  };

  setupFaqModal();


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

  // Inline email validation helper for login/signup modals
  const attachEmailValidation = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    let error = input.nextElementSibling;
    if (!error || !error.classList || !error.classList.contains("email-error")) {
      error = document.createElement("small");
      error.className = "email-error";
      error.textContent = "";
      input.insertAdjacentElement("afterend", error);
    }

    const validate = () => {
      const value = input.value.trim();
      if (!value) {
        error.textContent = "";
        return;
      }
      error.textContent = input.validity.valid ? "" : "Please enter a valid email address.";
    };

    input.addEventListener("input", validate);
    input.addEventListener("blur", validate);
  };
  attachEmailValidation("signupEmail");

// ----------------- MODAL SETUP -----------------
  const shopByLink = document.getElementById("shopmodal");
  const modalContainer = document.getElementById("modalContainer");

  // Prevent dragging of gallery images
  document.querySelectorAll(".gallery img").forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Shop By click → show or hide modal container
  if (shopByLink && modalContainer) {
    shopByLink.addEventListener("click", (e) => {
      e.preventDefault();
      modalContainer.classList.toggle("show");
    });

    // Close modal when clicking outside
    document.addEventListener("click", (e) => {
      if (modalContainer.classList.contains("show") &&
          !modalContainer.contains(e.target) &&
          e.target.id !== "shopmodal") {
        modalContainer.classList.remove("show");
      }
    });
  }

  // ----------------- SEARCH MODAL SETUP -----------------
  const searchButton = document.getElementById("searchButton");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");

  if (searchButton && searchOverlay && searchModal) {
    // Click search icon to open
    searchButton.addEventListener("click", (e) => {
      e.stopPropagation();
      searchOverlay.classList.add("active");
      searchModal.classList.add("active");
      searchInput.focus();
    });

    // Click outside search modal to close
    searchOverlay.addEventListener("click", (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove("active");
        searchModal.classList.remove("active");
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchOverlay.classList.remove("active");
        searchModal.classList.remove("active");
      }
    });
  }

  // --------- END SEARCH MODAL SETUP ---------

  // ----------------- NAVBAR SCROLL BEHAVIOR -----------------
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let ticking = false;
    const checkAtTop = () => {
      const atTop = window.scrollY <= 5;
      navbar.classList.toggle('at-top', atTop);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkAtTop);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  // ----------------- LOGO CLICK LOGIC -----------------
  const logoLink = document.querySelector(".logo-link");
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'index.html' || currentPage === '') {
        e.preventDefault();
        window.location.reload();
      }
    });
  }

  // ----------------- REFRESH ON SAME PAGE LINK CLICK -----------------
  document.querySelectorAll(".navbar a").forEach(link => {
    const currentPage = window.location.pathname.split('/').pop();
    const linkPage = link.getAttribute('href');
    if (linkPage && linkPage.split('/').pop() === currentPage) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
      });
    }
  });

  // ----------------- CART BUTTON LOGIC -----------------
  const cartButton = document.getElementById("cartButton");
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      navigateWithOverlay("Clothes_Sites/Cart/cart.html");
    });
  }

  // ----------------- CART RENDERING -----------------
  const cartItemsContainer = document.getElementById("cartItems");
  const totalItemsSpan = document.getElementById("totalItems");
  const totalPriceSpan = document.getElementById("totalPrice");
  const cartBadge = document.querySelector(".cart-badge");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  let totalItems = 0;
  let totalPrice = 0;

  // update badge
  if (cartBadge) {
    const badgeCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartBadge.textContent = badgeCount;
  }

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cart.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.margin = "15px 0";
        itemDiv.style.gap = "20px";

        itemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.name}" style="width:100px;height:auto;border-radius:10px;">
          <div class="cart-item-info" style="flex:1">
            <h3 style="margin:0 0 8px 0;">${item.name}</h3>
            <p style="margin:0 0 8px 0;">₱${item.price} each</p>
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
              <button class="decrease-qty" data-index="${index}">−</button>
              <span class="item-qty">${item.quantity}</span>
              <button class="increase-qty" data-index="${index}">+</button>
              <button class="remove-item" data-index="${index}" style="margin-left:12px;">Remove</button>
            </div>
          </div>
          <div style="min-width:120px;">
            <strong>₱${(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        `;

        cartItemsContainer.appendChild(itemDiv);

        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
      });

      cartItemsContainer.addEventListener("click", (e) => {
        const incBtn = e.target.closest(".increase-qty");
        const decBtn = e.target.closest(".decrease-qty");
        const removeBtn = e.target.closest(".remove-item");

        let updated = false;

        if (incBtn) {
          const idx = Number(incBtn.dataset.index);
          cart[idx].quantity = (cart[idx].quantity || 0) + 1;
          updated = true;
        } else if (decBtn) {
          const idx = Number(decBtn.dataset.index);
          if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
            updated = true;
          } else {
            cart.splice(idx, 1);
            updated = true;
          }
        } else if (removeBtn) {
          const idx = Number(removeBtn.dataset.index);
          cart.splice(idx, 1);
          updated = true;
        }

        if (updated) {
          localStorage.setItem("cart", JSON.stringify(cart));
          window.location.reload();
        }
      });
    }

    totalItemsSpan.textContent = totalItems;
    totalPriceSpan.textContent = totalPrice.toFixed(2);
  }
  // --------- USER MODAL SETUP ---------
  const userButton = document.getElementById("userButton");
  const userOverlay = document.getElementById("userOverlay");
  const userModal = document.getElementById("userModal");
  const signupModal = document.getElementById("signupModal");
  const signupOpenButton = document.querySelector(".signup-btn");
  const signupConfirmButton = document.querySelector(".signup-submit-btn");
  const signupBackToLoginButton = signupModal ? signupModal.querySelector(".login-btn") : null;
  const loginSubmitButton = userModal ? userModal.querySelector(".login-btn") : null;
  const userLandingPath = "UserSites/dashboard.html";

  const getSignupMessageEl = () => {
    if (!signupModal) return null;
    let msg = signupModal.querySelector(".signup-message");
    if (!msg) {
      msg = document.createElement("small");
      msg.className = "signup-message";
      signupModal.appendChild(msg);
    }
    return msg;
  };

  const getLoginMessageEl = () => {
    if (!userModal) return null;
    let msg = userModal.querySelector(".login-message");
    if (!msg) {
      msg = document.createElement("small");
      msg.className = "login-message";
      userModal.appendChild(msg);
    }
    return msg;
  };

  const setSignupMessage = (message, isError = true) => {
    const msg = getSignupMessageEl();
    if (!msg) return;
    msg.textContent = message;
    msg.style.color = isError ? "#cc1f1f" : "#137333";
  };

  const setLoginMessage = (message, isError = true) => {
    const msg = getLoginMessageEl();
    if (!msg) return;
    msg.textContent = message;
    msg.style.color = isError ? "#cc1f1f" : "#137333";
  };

  const closeUserLayers = () => {
    if (userOverlay) userOverlay.classList.remove("active");
    if (userModal) userModal.classList.remove("active");
    if (signupModal) signupModal.classList.remove("active");
  };

  if (userButton && userOverlay && userModal) {
    userButton.addEventListener("click", (e) => {
      e.stopPropagation();

      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
      } catch {
        currentUser = null;
      }

      if (currentUser && currentUser.email) {
        navigateWithOverlay(userLandingPath);
        return;
      }

      userOverlay.classList.add("active");
      userModal.classList.add("active");
      if (signupModal) signupModal.classList.remove("active");
      setLoginMessage("");
      const userEmail = document.getElementById("userEmail");
      if (userEmail) userEmail.focus();
    });

    if (loginSubmitButton) {
      loginSubmitButton.addEventListener("click", () => {
        const emailInput = document.getElementById("userEmail");
        const email = (emailInput?.value || "").trim().toLowerCase();
        const password = (document.getElementById("userPassword")?.value || "").trim();

        if (!email || !password) {
          setLoginMessage("Please enter your email and password.", true);
          return;
        }

        if (!emailInput || !emailInput.validity.valid) {
          setLoginMessage("Please enter a valid email address.", true);
          return;
        }

        const users = JSON.parse(localStorage.getItem("stapleUsers") || "[]");
        const match = users.find(
          (u) => String(u.email || "").toLowerCase() === email && String(u.password || "") === password
        );

        if (!match) {
          setLoginMessage("Invalid email or password.", true);
          return;
        }

        localStorage.setItem(
          "stapleCurrentUser",
          JSON.stringify({
            username: match.username || "",
            email,
            loggedInAt: new Date().toISOString(),
          })
        );

        setLoginMessage("Login successful. Redirecting...", false);
        closeUserLayers();
        navigateWithOverlay(userLandingPath);
      });
    }

    if (signupOpenButton && signupModal) {
      signupOpenButton.addEventListener("click", () => {
        userModal.classList.remove("active");
        signupModal.classList.add("active");
        setSignupMessage("");
        const signupUsername = document.getElementById("signupUsername");
        if (signupUsername) signupUsername.focus();
      });
    }

    if (signupBackToLoginButton && signupModal) {
      signupBackToLoginButton.addEventListener("click", () => {
        signupModal.classList.remove("active");
        userModal.classList.add("active");
        setLoginMessage("");
        const userEmail = document.getElementById("userEmail");
        if (userEmail) userEmail.focus();
      });
    }

    if (signupConfirmButton && signupModal) {
      signupConfirmButton.addEventListener("click", () => {
        const username = (document.getElementById("signupUsername")?.value || "").trim();
        const emailInput = document.getElementById("signupEmail");
        const email = (emailInput?.value || "").trim().toLowerCase();
        const password = (document.getElementById("signupPassword")?.value || "").trim();
        const confirmPassword = (document.getElementById("signupConfirmPassword")?.value || "").trim();

        if (!username || !email || !password || !confirmPassword) {
          setSignupMessage("Please complete all fields.", true);
          return;
        }

        if (!emailInput || !emailInput.validity.valid) {
          setSignupMessage("Please enter a valid email address.", true);
          return;
        }

        if (password !== confirmPassword) {
          setSignupMessage("Passwords do not match.", true);
          return;
        }

        const users = JSON.parse(localStorage.getItem("stapleUsers") || "[]");
        const exists = users.some((u) => String(u.email || "").toLowerCase() === email);
        if (exists) {
          setSignupMessage("Email is already registered.", true);
          return;
        }

        users.push({ username, email, password, createdAt: new Date().toISOString() });
        localStorage.setItem("stapleUsers", JSON.stringify(users));
        setSignupMessage("Account created.", false);

        const u = document.getElementById("signupUsername");
        const e = document.getElementById("signupEmail");
        const p = document.getElementById("signupPassword");
        const c = document.getElementById("signupConfirmPassword");
        if (u) u.value = "";
        if (e) e.value = "";
        if (p) p.value = "";
        if (c) c.value = "";

        signupModal.classList.remove("active");
        userModal.classList.add("active");
        setLoginMessage("Account created. Please log in.", false);
        const userEmail = document.getElementById("userEmail");
        if (userEmail) {
          userEmail.value = email;
          userEmail.focus();
        }
      });
    }

    userOverlay.addEventListener("click", (e) => {
      if (e.target === userOverlay) {
        closeUserLayers();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeUserLayers();
      }
    });
  }

});



