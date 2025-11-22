document.addEventListener("DOMContentLoaded", () => {
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

  // ----------------- CART FUNCTIONALITY -----------------
  const cartItemsContainer = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const checkoutButton = document.getElementById('checkoutButton');

  // Get cart from localStorage
  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  // Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Update cart display
  function updateCartDisplay() {
    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Your cart is empty</p>';
      subtotalEl.textContent = '₱0.00';
      totalEl.textContent = '₱0.00';
      return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>Size: ${item.size}</p>
          <p class="item-price">₱${item.price.toFixed(2)}</p>
        </div>
        <div class="item-quantity">
          <button class="qty-btn minus" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">+</button>
        </div>
        <div class="item-total">₱${itemTotal.toFixed(2)}</div>
        <button class="remove-btn" data-index="${index}">×</button>
      `;
      cartItemsContainer.appendChild(itemDiv);
    });

    subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    totalEl.textContent = `₱${subtotal.toFixed(2)}`;

    // Update cart badge
    updateCartBadge();
  }

  // Update cart badge count
  function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = totalItems;
    }
  }

  // Handle quantity changes and removals
  cartItemsContainer.addEventListener('click', (e) => {
    const cart = getCart();
    const index = parseInt(e.target.dataset.index);

    if (e.target.classList.contains('minus')) {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      saveCart(cart);
      updateCartDisplay();
    } else if (e.target.classList.contains('plus')) {
      cart[index].quantity++;
      saveCart(cart);
      updateCartDisplay();
    } else if (e.target.classList.contains('remove-btn')) {
      cart.splice(index, 1);
      saveCart(cart);
      updateCartDisplay();
    }
  });

  // ----------------- SECRET IMAGE ON 10 CLICKS -----------------
  let clickCount = 0;
  let secretImageShown = false;

  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (!secretImageShown) {
        clickCount++;
        
        if (clickCount >= 10) {
          showSecretImage();
          secretImageShown = true;
        }
      }
    });
  }

  function showSecretImage() {
    const overlay = document.createElement('div');
    overlay.id = 'secretOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.4s ease;
    `;

    const secretImg = document.createElement('img');
    secretImg.src = '/Assets/secret.png';
    secretImg.alt = 'Secret';
    secretImg.style.cssText = `
      max-width: 80%;
      max-height: 80%;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      transform: scale(0.8);
      transition: transform 0.4s ease;
    `;

    overlay.appendChild(secretImg);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '1';
      secretImg.style.transform = 'scale(1)';
    }, 10);

    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      secretImg.style.transform = 'scale(0.8)';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 400);
    });
  }

  // Initialize cart display
  updateCartDisplay();
  updateCartBadge();
});
