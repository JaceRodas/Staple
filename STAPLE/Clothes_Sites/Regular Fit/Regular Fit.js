document.addEventListener("DOMContentLoaded", () => {
  const shopByLink = document.getElementById("shopmodal");
  const modalContainer = document.getElementById("modalContainer");
  const decreaseBtn = document.getElementById("decrease");
  const increaseBtn = document.getElementById("increase");
  const quantityDisplay = document.getElementById("quantity");
  const addToCartBtn = document.querySelector(".add-to-cart");
  const cartBadge = document.querySelector(".cart-badge");
  
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      window.location.href = "../Cart/cart.html";
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
});
