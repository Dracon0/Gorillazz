/* ==========================================================================
   TopBoyzGorillaz - Streetwear E-Commerce Logic
   ========================================================================== */

// Product Dataset using strictly the user's authentic brand graphics
// Prices strictly between 300 TTD and 400 TTD
const PRODUCTS = [
  {
    id: 'tb-01',
    name: "Flame Pro Athletic Jersey (#28)",
    category: "jersey",
    price: 380,
    badge: "Bestseller",
    image: "assets/logo_fire.jpg",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: "Premium moisture-wicking performance mesh jersey featuring signature fire skull graphics and bold #28 details. Engineered with double-stitched seams and vibrant fade-resistant print."
  },
  {
    id: 'tb-02',
    name: "Gorillaz '28 Skull Heavyweight Tee",
    category: "tee",
    price: 320,
    badge: "New Drop",
    image: "assets/skull_28.png",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: "240 GSM organic combed cotton tee with signature cracked white skull centerpiece and high-density red Gorillaz typography."
  },
  {
    id: 'tb-03',
    name: "Street Graffiti Wall Mesh Jersey",
    category: "jersey",
    price: 390,
    badge: "Limited Edition",
    image: "assets/graffiti_wall.png",
    sizes: ['M', 'L', 'XL', 'XXL'],
    description: "Urban spray-paint aesthetic soccer style jersey. Features vibrant wall mural graphics, breathable athletic weave, and heat-sealed TopBoyz emblem."
  },
  {
    id: 'tb-04',
    name: "Red G-Logo Flame Heavyweight Tee",
    category: "tee",
    price: 300,
    badge: "Essential",
    image: "assets/logo_fire.jpg",
    sizes: ['S', 'M', 'L', 'XL'],
    description: "Signature TopBoyz ember graphic printed on premium obsidian dark cotton. Features iconic red fire glow detailing."
  },
  {
    id: 'tb-05',
    name: "Gorillaz 28 Vintage Skull Cut Tee",
    category: "tee",
    price: 340,
    badge: "Hot Drop",
    image: "assets/skull_28.png",
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: "Monochrome contrast graphic with distressed bone texture and fiery red numbers. Heavyweight collar structure and relaxed street fit."
  },
  {
    id: 'tb-06',
    name: "Gorillaz Graffiti Urban Jersey",
    category: "jersey",
    price: 360,
    badge: "Drop 01",
    image: "assets/graffiti_wall.png",
    sizes: ['S', 'M', 'L', 'XL'],
    description: "High-grade performance stretch mesh jersey featuring custom urban tag art and durable fade-proof fabric for maximum durability."
  }
];

// App State
let cart = JSON.parse(localStorage.getItem('tb_cart')) || [];
let activeCategory = 'all';
let searchQuery = '';
let selectedSizes = {}; // productId -> size

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartBadge();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Category Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      renderProducts();
    });
  });

  // Search Input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Cart Drawer Toggles
  const cartBtn = document.getElementById('cart-btn');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartBtn && cartOverlay) {
    cartBtn.addEventListener('click', () => openCart());
  }
  if (closeCartBtn && cartOverlay) {
    closeCartBtn.addEventListener('click', () => closeCart());
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) closeCart();
    });
  }

  // Quick View Modal Close
  const qvOverlay = document.getElementById('quickview-overlay');
  const closeQvBtn = document.getElementById('close-qv-btn');
  if (closeQvBtn && qvOverlay) {
    closeQvBtn.addEventListener('click', () => closeQuickView());
  }
  if (qvOverlay) {
    qvOverlay.addEventListener('click', (e) => {
      if (e.target === qvOverlay) closeQuickView();
    });
  }

  // Checkout Modal
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutOverlay = document.getElementById('checkout-overlay');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  if (checkoutBtn && checkoutOverlay) {
    checkoutBtn.addEventListener('click', () => openCheckout());
  }
  if (closeCheckoutBtn && checkoutOverlay) {
    closeCheckoutBtn.addEventListener('click', () => closeCheckout());
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

// Exposed filter category function for navbar links
window.filterCategory = function(cat) {
  activeCategory = cat;
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });
  renderProducts();
};

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = PRODUCTS.filter(prod => {
    const matchesCat = activeCategory === 'all' || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || 
                          prod.description.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-ghost" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-red);"></i>
        <h3>No gear found matching "${searchQuery}"</h3>
        <p>Try searching for jerseys or skull tees!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prod => {
    const currentSize = selectedSizes[prod.id] || prod.sizes[1] || prod.sizes[0];
    
    return `
      <div class="product-card" data-id="${prod.id}">
        <span class="product-badge">${prod.badge}</span>
        <span class="product-type-pill">${prod.category}</span>
        
        <div class="product-img-wrap" onclick="openQuickView('${prod.id}')">
          <img src="${prod.image}" alt="${prod.name}" loading="lazy">
          <div class="quick-view-overlay">
            <button class="btn-quickview">Quick View</button>
          </div>
        </div>

        <div class="product-info">
          <h3 class="product-title">${prod.name}</h3>
          <p class="product-description">${prod.description}</p>

          <div class="product-size-selector">
            ${prod.sizes.map(size => `
              <div class="size-chip ${size === currentSize ? 'selected' : ''}" 
                   onclick="selectSize('${prod.id}', '${size}')">
                ${size}
              </div>
            `).join('')}
          </div>

          <div class="product-bottom-row">
            <div class="product-price">$${prod.price} <span class="currency">TTD</span></div>
            <button class="btn-add-cart" onclick="addToCart('${prod.id}')">
              <i class="fa-solid fa-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Select Size for Product
function selectSize(prodId, size) {
  selectedSizes[prodId] = size;
  renderProducts();
}

// Cart Drawer Functions
function openCart() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    renderCartBody();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function addToCart(prodId, chosenSize = null) {
  const prod = PRODUCTS.find(p => p.id === prodId);
  if (!prod) return;

  const size = chosenSize || selectedSizes[prodId] || prod.sizes[1] || prod.sizes[0];
  const cartIndex = cart.findIndex(item => item.id === prodId && item.size === size);

  if (cartIndex > -1) {
    cart[cartIndex].qty += 1;
  } else {
    cart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      size: size,
      qty: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Added ${prod.name} (${size}) to cart! 🔥`);
}

function updateQty(prodId, size, delta) {
  const itemIndex = cart.findIndex(item => item.id === prodId && item.size === size);
  if (itemIndex > -1) {
    cart[itemIndex].qty += delta;
    if (cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    renderCartBody();
    updateCartBadge();
  }
}

function removeItem(prodId, size) {
  cart = cart.filter(item => !(item.id === prodId && item.size === size));
  saveCart();
  renderCartBody();
  updateCartBadge();
}

function renderCartBody() {
  const container = document.getElementById('cart-items-body');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-basket-shopping"></i>
        <h4>Your cart is empty</h4>
        <p>Grab your TopBoyz jersey or graphic tee before Drop 01 sells out!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0 TTD';
    if (totalEl) totalEl.textContent = '$0 TTD';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Size: <strong>${item.size}</strong></div>
          <div class="cart-item-price">$${item.price} TTD</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', '${item.size}', -1)">-</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', '${item.size}', 1)">+</button>
          <button class="btn-remove-item" onclick="removeItem('${item.id}', '${item.size}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal} TTD`;
  if (totalEl) totalEl.textContent = `$${subtotal} TTD`;
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalQty;
  }
}

function saveCart() {
  localStorage.setItem('tb_cart', JSON.stringify(cart));
}

// Quick View Modal
function openQuickView(prodId) {
  const prod = PRODUCTS.find(p => p.id === prodId);
  if (!prod) return;

  const qvOverlay = document.getElementById('quickview-overlay');
  const qvContent = document.getElementById('quickview-content');

  if (qvOverlay && qvContent) {
    const defaultSize = selectedSizes[prodId] || prod.sizes[0];

    qvContent.innerHTML = `
      <div class="quickview-grid">
        <div class="quickview-img-col">
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="quickview-info-col">
          <span class="product-badge" style="position:static; display:inline-block; width:fit-content; margin-bottom:0.75rem;">${prod.badge}</span>
          <h2 class="modal-title">${prod.name}</h2>
          <div class="modal-price">$${prod.price} TTD</div>
          <p class="modal-desc">${prod.description}</p>
          
          <div class="modal-section-label">Select Size</div>
          <div class="product-size-selector" style="margin-bottom:2rem;">
            ${prod.sizes.map(size => `
              <div class="size-chip ${size === defaultSize ? 'selected' : ''}" id="qv-size-${size}" 
                   onclick="selectQvSize('${prod.id}', '${size}')">
                ${size}
              </div>
            `).join('')}
          </div>

          <button class="btn-primary" style="width:100%; justify-content:center;" onclick="addToCartFromQv('${prod.id}')">
            <i class="fa-solid fa-fire"></i> Add To Bag - $${prod.price} TTD
          </button>
        </div>
      </div>
    `;

    qvOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

let qvSelectedSize = null;
function selectQvSize(prodId, size) {
  qvSelectedSize = size;
  selectedSizes[prodId] = size;
  const prod = PRODUCTS.find(p => p.id === prodId);
  if (prod) {
    prod.sizes.forEach(s => {
      const chip = document.getElementById(`qv-size-${s}`);
      if (chip) chip.classList.toggle('selected', s === size);
    });
  }
}

function addToCartFromQv(prodId) {
  const prod = PRODUCTS.find(p => p.id === prodId);
  const size = qvSelectedSize || selectedSizes[prodId] || prod.sizes[0];
  addToCart(prodId, size);
  closeQuickView();
  openCart();
}

function closeQuickView() {
  const qvOverlay = document.getElementById('quickview-overlay');
  if (qvOverlay) {
    qvOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Checkout Modal Logic
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty! Add items first. 🛒");
    return;
  }
  closeCart();
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) {
    renderCheckoutSummary();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkout-items-summary');
  const totalEl = document.getElementById('checkout-total');
  if (!summaryEl) return;

  let total = 0;
  summaryEl.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:0.4rem 0; border-bottom:1px solid var(--border-light);">
        <div>${item.qty}x ${item.name} (${item.size})</div>
        <div style="font-weight:bold; color:var(--accent-amber); margin-left:auto;">$${itemTotal} TTD</div>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.textContent = `$${total} TTD`;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name').value;
  const phone = document.getElementById('cust-phone').value;
  const area = document.getElementById('cust-area').value;
  const notes = document.getElementById('cust-notes').value;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemsText = cart.map(item => `- ${item.qty}x ${item.name} [Size: ${item.size}]`).join('%0A');
  
  const whatsappMsg = `🔥 *NEW TOPBOYZGORILLAZ ORDER*%0A%0A*Customer:* ${encodeURIComponent(name)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Delivery Location:* ${encodeURIComponent(area)}%0A*Notes:* ${encodeURIComponent(notes)}%0A%0A*ITEMS:*%0A${itemsText}%0A%0A*TOTAL AMOUNT:* $${total} TTD`;

  // Clear cart
  cart = [];
  saveCart();
  updateCartBadge();
  closeCheckout();

  showToast("Order submitted! Opening WhatsApp... 🚀");

  setTimeout(() => {
    window.open(`https://api.whatsapp.com/send?text=${whatsappMsg}`, '_blank');
  }, 1200);
}

// Toast Notification System
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-fire" style="color:var(--accent-red)"></i> <span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
