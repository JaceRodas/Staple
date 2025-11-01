document.addEventListener("DOMContentLoaded", () => {
  const shopByLink = document.getElementById("shopmodal");
  const modalContainer = document.getElementById("modalContainer");

  // prevent images from starting a native drag (covers hovered .m images)
  document.querySelectorAll('.gallery img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', e => e.preventDefault());
  });

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
      const atTop = window.scrollY <= 5; // threshold to consider "very top"
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
    // initialize state on load
    onScroll();
  }

  // Logo click: navigate to index when on other pages; if already on index, scroll to top without changing location
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      const onIndex = path === 'index.html' || path === '' || path === '/';
      if (onIndex) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // otherwise let the link navigate normally
    });
  }

  // --- NEW: clicking a navbar link to the same page should refresh the page ---
  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const target = new URL(href, window.location.href);
        if (target.origin === window.location.origin && target.pathname === window.location.pathname) {
          e.preventDefault();
          // force a full reload so the page refreshes
          window.location.reload();
        }
      } catch (err) {
        // ignore invalid URLs
      }
    });
  });

  // cart icon -> go to cart page
  const cartButton = document.getElementById("cartButton");
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      window.location.href = "cart.html";
    });
  }

  // --------- Cart rendering logic ---------
  const cartItemsContainer = document.getElementById("cartItems");
  const totalItemsSpan = document.getElementById("totalItems");
  const totalPriceSpan = document.getElementById("totalPrice");
  const cartBadge = document.querySelector(".cart-badge");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  let totalItems = 0;
  let totalPrice = 0;

  // update badge if present
  if (cartBadge) {
    const badgeCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartBadge.textContent = badgeCount;
  }

  if (!cartItemsContainer) {
    // no cart UI on this page (defensive)
    return;
  }

  cartItemsContainer.innerHTML = ""; // clear

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

    // add event listeners for qty buttons and remove buttons (delegation)
    cartItemsContainer.addEventListener('click', (e) => {
      const incBtn = e.target.closest('.increase-qty');
      const decBtn = e.target.closest('.decrease-qty');
      const removeBtn = e.target.closest('.remove-item');

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
          // optional: remove if reaches 0
          cart.splice(idx, 1);
          updated = true;
        }
      } else if (removeBtn) {
        const idx = Number(removeBtn.dataset.index);
        cart.splice(idx, 1);
        updated = true;
      }

      if (updated) {
        // save and re-render by simply reloading the page to keep code simple
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.reload();
      }
    });
  }

  // update totals
  totalItemsSpan.textContent = totalItems;
  totalPriceSpan.textContent = totalPrice.toFixed(2);
});
