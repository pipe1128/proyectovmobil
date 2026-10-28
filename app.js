const WHATSAPP_NUMBER = "573015379982"; // Reemplaza por el número real de la tienda, con indicativo y solo dígitos.

const products = [
  {
    id: "iphone-15",
    brand: "Apple",
    name: "iPhone 15",
    price: 3299000,
    ram: "6 GB",
    storage: "128 GB",
    camera: "48 MP",
    battery: "3.349 mAh",
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&q=80",
    imageAlt: "Teléfono inteligente Apple en color oscuro",
  },
  {
    id: "galaxy-a55",
    brand: "Samsung",
    name: "Galaxy A55 5G",
    price: 1799000,
    ram: "8 GB",
    storage: "256 GB",
    camera: "50 MP",
    battery: "5.000 mAh",
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=80",
    imageAlt: "Teléfono inteligente Samsung Galaxy",
  },
  {
    id: "redmi-note-13",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro",
    price: 1349000,
    ram: "8 GB",
    storage: "256 GB",
    camera: "200 MP",
    battery: "5.100 mAh",
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80",
    imageAlt: "Teléfono inteligente moderno con cámara de alta resolución",
  },
  {
    id: "moto-edge-50",
    brand: "Motorola",
    name: "Edge 50 Fusion",
    price: 1699000,
    ram: "8 GB",
    storage: "256 GB",
    camera: "50 MP",
    battery: "5.000 mAh",
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=700&q=80",
    imageAlt: "Teléfono inteligente moderno visto de frente",
  },
];

const cart = new Map();
const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const productGrid = document.querySelector("#productGrid");
const brandFilters = document.querySelector("#brandFilters");
const catalogTotal = document.querySelector("#catalogTotal");
const cartDrawer = document.querySelector("#cartDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartFooter = document.querySelector("#cartFooter");
const checkoutDialog = document.querySelector("#checkoutDialog");
const checkoutForm = document.querySelector("#checkoutForm");
const paymentMethod = document.querySelector("#paymentMethod");
const selectedBrands = new Set();

function formatPrice(amount) {
  return currency.format(amount);
}

function getSubtotal() {
  return [...cart.entries()].reduce((subtotal, [productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return subtotal + product.price * quantity;
  }, 0);
}

function renderProducts() {
  const visibleProducts =
    selectedBrands.size === 0
      ? products
      : products.filter((product) => selectedBrands.has(product.brand));
  catalogTotal.textContent = `${String(visibleProducts.length).padStart(2, "0")} ${
    visibleProducts.length === 1 ? "MODELO" : "MODELOS"
  }`;

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = '<p class="catalog-empty">No encontramos equipos de estas marcas por ahora.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />
            <span class="stock-label" data-stock-label="${product.id}">${product.stock} disponibles</span>
          </div>
          <div class="product-content">
            <span class="product-brand">${product.brand}</span>
            <h3>${product.name}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <div class="product-specs">
              <span class="spec"><strong>RAM</strong>${product.ram}</span>
              <span class="spec"><strong>Almacenamiento</strong>${product.storage}</span>
              <span class="spec"><strong>Cámara</strong>${product.camera}</span>
              <span class="spec"><strong>Batería</strong>${product.battery}</span>
            </div>
            <button class="add-to-cart" type="button" data-add-product="${product.id}" ${
              product.stock === 0 ? "disabled" : ""
            }>
              ${product.stock === 0 ? "Agotado" : "Agregar al carrito"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCart() {
  const itemCount = [...cart.values()].reduce((total, quantity) => total + quantity, 0);
  document.querySelector("#cartCount").textContent = itemCount;
  document.querySelector("#drawerCartCount").textContent = `(${itemCount})`;
  cartEmpty.hidden = itemCount > 0;
  cartFooter.hidden = itemCount === 0;
  cartItems.hidden = itemCount === 0;
  document.querySelector("#cartSubtotal").textContent = formatPrice(getSubtotal());

  cartItems.innerHTML = [...cart.entries()]
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="" />
          <div>
            <h3>${product.name}</h3>
            <p>${formatPrice(product.price * quantity)}</p>
            <div class="quantity-controls" aria-label="Cantidad de ${product.name}">
              <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Quitar una unidad">−</button>
              <span>${quantity}</span>
              <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Agregar una unidad">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Quitar ${product.name} del carrito">×</button>
        </article>
      `;
    })
    .join("");

  products.forEach((product) => {
    const stockLabel = document.querySelector(`[data-stock-label="${product.id}"]`);
    const addButton = document.querySelector(`[data-add-product="${product.id}"]`);
    if (!stockLabel || !addButton) return;
    stockLabel.textContent = `${product.stock} ${product.stock === 1 ? "disponible" : "disponibles"}`;
    addButton.disabled = product.stock === 0;
    addButton.textContent = product.stock === 0 ? "Agotado" : "Agregar al carrito";
  });
}

function addProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock < 1) return;
  product.stock -= 1;
  cart.set(productId, (cart.get(productId) ?? 0) + 1);
  renderCart();
}

function changeQuantity(productId, change) {
  const product = products.find((item) => item.id === productId);
  const quantity = cart.get(productId);
  if (!product || quantity === undefined) return;

  if (change > 0) {
    if (product.stock < 1) return;
    product.stock -= 1;
    cart.set(productId, quantity + 1);
  } else if (quantity === 1) {
    cart.delete(productId);
    product.stock += 1;
  } else {
    cart.set(productId, quantity - 1);
    product.stock += 1;
  }
  renderCart();
  updateOrderSummary();
}

function removeProduct(productId) {
  const product = products.find((item) => item.id === productId);
  const quantity = cart.get(productId);
  if (!product || quantity === undefined) return;
  product.stock += quantity;
  cart.delete(productId);
  renderCart();
  updateOrderSummary();
}

function getCreditSurcharge(subtotal, method) {
  return method === "Tarjeta de crédito" && subtotal > 100000
    ? Math.round(subtotal * 0.05)
    : 0;
}

function updateOrderSummary() {
  const subtotal = getSubtotal();
  const surcharge = getCreditSurcharge(subtotal, paymentMethod.value);
  document.querySelector("#summarySubtotal").textContent = formatPrice(subtotal);
  document.querySelector("#creditFee").textContent = formatPrice(surcharge);
  document.querySelector("#creditFeeRow").hidden = surcharge === 0;
  document.querySelector("#creditFeeNotice").hidden = surcharge === 0;
  document.querySelector("#orderTotal").textContent = formatPrice(subtotal + surcharge);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.inert = false;
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => drawerBackdrop.classList.add("is-visible"));
  document.querySelector("#closeCartButton").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.inert = true;
  drawerBackdrop.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) drawerBackdrop.hidden = true;
  }, 220);
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-product]");
  if (!button || button.disabled) return;
  addProduct(button.dataset.addProduct);
});

brandFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-brand-filter]");
  if (!button) return;

  const brand = button.dataset.brandFilter;
  if (brand === "all") {
    selectedBrands.clear();
  } else if (selectedBrands.has(brand)) {
    selectedBrands.delete(brand);
  } else {
    selectedBrands.add(brand);
  }

  brandFilters.querySelectorAll("[data-brand-filter]").forEach((filterButton) => {
    const isActive =
      filterButton.dataset.brandFilter === "all"
        ? selectedBrands.size === 0
        : selectedBrands.has(filterButton.dataset.brandFilter);
    filterButton.classList.toggle("is-active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const { cartAction, productId } = button.dataset;
  if (cartAction === "increase") changeQuantity(productId, 1);
  if (cartAction === "decrease") changeQuantity(productId, -1);
  if (cartAction === "remove") removeProduct(productId);
});

document.querySelector("#openCartButton").addEventListener("click", openCart);
document.querySelector("#closeCartButton").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.querySelector("#continueShoppingButton").addEventListener("click", () => {
  closeCart();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  if (cart.size === 0) return;
  closeCart();
  updateOrderSummary();
  checkoutDialog.showModal();
});

document.querySelector("#closeCheckoutButton").addEventListener("click", () => {
  checkoutDialog.close();
});

paymentMethod.addEventListener("change", updateOrderSummary);

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity() || cart.size === 0) return;

  const formData = new FormData(checkoutForm);
  const customerName = formData.get("customerName").trim();
  const address = formData.get("address").trim();
  const phone = formData.get("phone").trim();
  const selectedMethod = formData.get("paymentMethod");
  const subtotal = getSubtotal();
  const surcharge = getCreditSurcharge(subtotal, selectedMethod);
  const total = subtotal + surcharge;
  const orderLines = [...cart.entries()].map(([productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return `• ${product.name} x${quantity}: ${formatPrice(product.price * quantity)}`;
  });
  const message = [
    "¡Hola, V'Mobil! Quiero confirmar este pedido:",
    "",
    `Cliente: ${customerName}`,
    `Dirección: ${address}`,
    `Teléfono: ${phone}`,
    "",
    "Productos:",
    ...orderLines,
    "",
    `Método de pago: ${selectedMethod}`,
    `Subtotal: ${formatPrice(subtotal)}`,
    ...(surcharge > 0 ? [`Recargo tarjeta de crédito (5%): ${formatPrice(surcharge)}`] : []),
    `TOTAL A PAGAR: ${formatPrice(total)}`,
  ].join("\n");
  const whatsappNumber = WHATSAPP_NUMBER.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

document.querySelector("#currentYear").textContent = new Date().getFullYear();
renderProducts();
renderCart();
