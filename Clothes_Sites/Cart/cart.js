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

  // ----------------- SECRET IMAGE ON 10 CLICKS -----------------
  const checkoutButton = document.getElementById("checkoutButton");
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
    // Create overlay container
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

    // Create secret image
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

    // Animate in
    setTimeout(() => {
      overlay.style.opacity = '1';
      secretImg.style.transform = 'scale(1)';
    }, 10);

    // Close on click
    overlay.addEventListener('click', () => {
      overlay.style.opacity = '0';
      secretImg.style.transform = 'scale(0.8)';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 400);
    });
  }

  // ----------------- CART FUNCTIONALITY (placeholder) -----------------
  const totalItemsEl = document.getElementById('totalItems');
  const totalPriceEl = document.getElementById('totalPrice');
  
  // Update cart display (add your cart logic here)
  function updateCart() {
    // Placeholder - replace with actual cart logic
    totalItemsEl.textContent = '0';
    totalPriceEl.textContent = '0.00';
  }

  updateCart();
});
