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

const shopByLink = document.getElementById("shopmodal");
  const modalContainer = document.getElementById("modalContainer");
  const decreaseBtn = document.getElementById("decrease");
  const increaseBtn = document.getElementById("increase");
  const quantityDisplay = document.getElementById("quantity");
  const addToCartBtn = document.querySelector(".add-to-cart");
  const cartBadge = document.querySelector(".cart-badge");
  const cartButton = document.getElementById("cartButton");
  
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      navigateWithOverlay("../Cart/cart.html");
    });
  }
  
  let quantity = 1;

  // quantity controls
  increaseBtn.addEventListener("click", () => {
    quantity++;
    quantityDisplay.textContent = quantity;
  });

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      quantityDisplay.textContent = quantity;
    }
  });

  // navbar modal setup
  if (shopByLink && modalContainer) {
    shopByLink.addEventListener("click", (e) => {
      e.preventDefault();
      modalContainer.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (
        modalContainer.classList.contains("show") &&
        !modalContainer.contains(e.target) &&
        e.target.id !== "shopmodal"
      ) {
        modalContainer.classList.remove("show");
      }
    });
  }

  // --- navbar expand/compact on scroll ---
  const navbar = document.querySelector('.navbar');
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

  // --------- SEARCH MODAL SETUP ---------
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

  // prevent image dragging
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
  });

  // --- Add to Cart functionality ---
  addToCartBtn.addEventListener("click", () => {
    const product = {
      name: "Regular Fit (Black)",
      price: 269,
      quantity: quantity,
      image: "/Clothes/Regular_S.jfif",
    };

    // Retrieve existing cart or create new
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if this product already exists
    const existingIndex = cart.findIndex(item => item.name === product.name);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += product.quantity;
    } else {
      cart.push(product);
    }

    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update badge immediately
    if (cartBadge) {
      const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartBadge.textContent = totalCount;
    }

    // Optional visual feedback (small animation)
    addToCartBtn.textContent = "Added!";
    addToCartBtn.style.backgroundColor = "#333";
    setTimeout(() => {
      addToCartBtn.textContent = "Add to cart";
      addToCartBtn.style.backgroundColor = "black";
    }, 1000);
  });

  // --- Initialize cart badge on page load ---
  if (cartBadge) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
  }

  const showPagePopup = (message, isError = false) => {
    let popup = document.getElementById("pageNoticePopup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "pageNoticePopup";
      popup.style.position = "fixed";
      popup.style.left = "50%";
      popup.style.bottom = "24px";
      popup.style.transform = "translateX(-50%)";
      popup.style.padding = "11px 16px";
      popup.style.borderRadius = "10px";
      popup.style.fontSize = "14px";
      popup.style.fontWeight = "600";
      popup.style.zIndex = "4000";
      popup.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
      document.body.appendChild(popup);
    }

    popup.textContent = message;
    popup.style.background = isError ? "#b42323" : "#111";
    popup.style.color = "#fff";
    popup.style.opacity = "1";

    if (showPagePopup.timer) {
      clearTimeout(showPagePopup.timer);
    }
    showPagePopup.timer = setTimeout(() => {
      popup.style.opacity = "0";
    }, 1800);
  };

  const addItemToWishlist = (item) => {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
    } catch {
      currentUser = null;
    }

    if (!currentUser || !currentUser.email) {
      showPagePopup("Please log in first to use wishlist.", true);
      return;
    }

    const key = "stapleDashboardData_" + currentUser.email;
    let dashboardData;
    try {
      dashboardData = JSON.parse(localStorage.getItem(key) || "null") || { wishlist: [] };
    } catch {
      dashboardData = { wishlist: [] };
    }

    if (!Array.isArray(dashboardData.wishlist)) {
      dashboardData.wishlist = [];
    }

    const exists = dashboardData.wishlist.some((w) => String(w.name || "").toLowerCase() === String(item.name || "").toLowerCase());
    if (exists) {
      showPagePopup("This item is already in your wishlist.", true);
      return;
    }

    dashboardData.wishlist.unshift({
      id: "W-" + Date.now(),
      name: item.name,
      image: item.image,
      onSale: false
    });

    localStorage.setItem(key, JSON.stringify(dashboardData));
    showPagePopup("Added to wishlist.");
  };

  const wishlistBtn = document.querySelector(".add-to-wishlist");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      const name = wishlistBtn.getAttribute("data-product-name") || document.title || "Shirt";
      const image = wishlistBtn.getAttribute("data-product-image") || "/Clothes/Regular_S.jfif";
      addItemToWishlist({ name, image });
    });
  }

  const reviewForm = document.getElementById("reviewForm");
  const reviewList = document.getElementById("reviewList");
  const reviewText = document.getElementById("reviewText");
  const reviewStorageKey = "stapleReviews_" + window.location.pathname;

  const renderReviews = () => {
    if (!reviewList) return;
    const reviews = JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");
    reviewList.innerHTML = "";
    if (!reviews.length) {
      reviewList.innerHTML = '<p>No reviews yet.</p>';
      return;
    }

    reviews.forEach((r) => {
      const row = document.createElement("div");
      row.className = "review-item";
      row.innerHTML = '<strong>' + r.name + '</strong><span>' + r.text + '</span>';
      reviewList.appendChild(row);
    });
  };

  if (reviewForm && reviewText) {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
    } catch {
      currentUser = null;
    }

    const submitBtn = reviewForm.querySelector(".submit-review-btn");
    if (!currentUser || !currentUser.email) {
      reviewText.placeholder = "Log in first to write a review.";
      reviewText.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
    }

    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let reviewer = null;
      try {
        reviewer = JSON.parse(localStorage.getItem("stapleCurrentUser") || "null");
      } catch {
        reviewer = null;
      }

      if (!reviewer || !reviewer.email) {
        showPagePopup("Please log in first to write a review.", true);
        return;
      }

      const text = reviewText.value.trim();
      if (!text) return;
      const name = String(reviewer.username || reviewer.email || "User").trim();
      const reviews = JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");
      reviews.unshift({ name, text, createdAt: new Date().toISOString() });
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
      reviewText.value = "";
      renderReviews();
    });
    renderReviews();
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
  const userLandingPath = "../../UserSites/dashboard.html";

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




