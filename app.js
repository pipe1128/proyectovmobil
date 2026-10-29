const WHATSAPP_NUMBER = "573015379982"; // Reemplaza por el número real de la tienda, con indicativo y solo dígitos.

const brandNames = {
  APPLE: "Apple",
  IPHONE: "Apple",
  SAMSUNG: "Samsung",
  XIAOMI: "Xiaomi",
  XIOAMI: "Xiaomi",
  POCO: "POCO",
  MOTOROLA: "Motorola",
  HONOR: "Honor",
  INFINIX: "Infinix",
  TECNO: "Tecno",
  ZTE: "ZTE",
  NOKIA: "Nokia",
  NUBIA: "Nubia",
  OPPO: "OPPO",
  VIVO: "vivo",
  REALME: "realme",
  ONEPLUS: "OnePlus",
  HUAWEI: "Huawei",
  ITEL: "itel",
  FLY: "Fly",
  CORN: "Corn",
  KRONO: "Krono",
  SONY: "Sony",
};

function getProductBrand(name, sourceBrand) {
  const normalizedName = name.toUpperCase();
  const brandRules = [
    [/^(IPHONE|APPLE)\b/, "Apple"],
    [/^(SAMSUNG|SM [AS]\d+|GALAXY)\b/, "Samsung"],
    [/^(REDMI|XIAOMI|XIOAMI|NOTE \d)/, "Xiaomi"],
    [/^POCO\b/, "POCO"],
    [/^(MOTOROLA|MOTO)\b/, "Motorola"],
    [/^(HONOR|MAGIC )/, "Honor"],
    [/^(INFINIX|INIFINIX|SMART 20)/, "Infinix"],
    [/^(TECNO|SPARK|CAMON|PHANTOM|POP )/, "Tecno"],
    [/^(ZTE|BLADE )/, "ZTE"],
    [/^NOKIA\b/, "Nokia"],
    [/^NUBIA\b/, "Nubia"],
    [/^OPPO\b/, "OPPO"],
    [/^VIVO\b/, "vivo"],
    [/^REALME\b/, "realme"],
    [/^ONEPLUS\b/, "OnePlus"],
    [/^HUAWEI\b/, "Huawei"],
    [/^ITEL\b/, "itel"],
    [/^(GOOGLE PIXEL|PIXEL)\b/, "Google"],
    [/^(FLY-|FLY |FY-)/, "Fly"],
    [/^CORN\b/, "Corn"],
    [/^FLECHA TIGER\b/, "Flecha Tiger"],
    [/^KRONO NET\b/, "Krono"],
    [/^SONY XPERIA\b/, "Sony"],
  ];
  const match = brandRules.find(([pattern]) => pattern.test(normalizedName));
  if (match) return match[1];

  const normalizedSourceBrand = sourceBrand.trim().toUpperCase();
  const brand = brandNames[normalizedSourceBrand];
  if (brand) return brand;
  if (normalizedSourceBrand) return sourceBrand.trim();
  throw new Error(`No se pudo identificar la marca del celular "${name}".`);
}

function formatProductName(value) {
  return value
    .toLocaleLowerCase("es-CO")
    .replace(/(^|[\s-])([a-záéíóúñ])/g, (_, separator, letter) =>
      separator + letter.toLocaleUpperCase("es-CO"),
    )
    .replace(/\bInifinix\b/gi, "Infinix")
    .replace(/\bIphone\b/gi, "iPhone")
    .replace(/\bPromax\b/gi, "Pro Max")
    .replace(/\bUsadio\b/gi, "Usado")
    .replace(/\b(\d+)gb\b/gi, "$1 GB")
    .replace(/\b(\d+)ram\b/gi, "$1 GB RAM")
    .replace(/\b(\d+)r\b/gi, "$1 GB RAM")
    .replace(/\b5g\b/gi, "5G")
    .replace(/\b4g\b/gi, "4G")
    .replace(/\bSm\b/gi, "SM")
    .replace(/\bZte\b/gi, "ZTE")
    .replace(/\bPoco\b/gi, "POCO");
}

function getProductCondition(description) {
  let condition = description.trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
  const conditionPattern =
    /\b(?:USADO|NUEVO|ACTIVO|BATER[IÍ]A|RAYA|RAYAS|RAYONES|RAYADO|VISOR|CARCAZA|CARCASA|PELADO|PELON|TALLONES)\b/i;
  if (!conditionPattern.test(condition)) return "";

  condition = condition
    .replace(/\uFFFD/g, "Ñ")
    .replace(/\bVISRO\b/gi, "VISOR")
    .replace(/\bSI N RAYAS\b/gi, "SIN RAYAS")
    .replace(/\bCARCAZA\b/gi, "CARCASA")
    .replace(/\bPELON\b/gi, "PELADO")
    .replace(/\bBATERIA\b/gi, "BATERÍA")
    .toLocaleLowerCase("es-CO");
  return condition.charAt(0).toLocaleUpperCase("es-CO") + condition.slice(1);
}

function getProductImage(brand, displayName) {
  return {
    image: "assets/celular-placeholder.svg",
    imageAlt: `Imagen ilustrativa de un celular ${brand} ${displayName}`,
  };
}

function buildProductCatalog(rows) {
  const groupedProducts = new Map();

  rows.forEach((row) => {
    const name = row.name.trim();
    const condition =
      getProductCondition(row.description) ||
      (/\bUSADO\b/i.test(name) ? "Usado" : /\bNUEVO\b/i.test(name) ? "Nuevo" : "");
    const price = Number(row.price);
    const quantity = Number(row.quantity);
    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isFinite(quantity)) {
      throw new Error(`Registro de inventario inválido para "${name}".`);
    }

    const key = [name, price, condition].join("\u001f");
    const existing = groupedProducts.get(key);
    if (existing) {
      existing.stock += quantity;
      return;
    }

    const brand = getProductBrand(name, row.sourceBrand);
    const displayName = formatProductName(name);
    const productImage = getProductImage(brand, displayName);
    const storageMatch = name.match(/(\d+)\s*GB\b/i);
    const ramMatch = name.match(/(\d+)\s*(?:RAM|R)\b/i);
    const networkMatch = name.match(/\b(5G|4G)\b/i);
    const ram = ramMatch ? `${ramMatch[1]} GB` : null;
    const storage = storageMatch ? `${storageMatch[1]} GB` : null;
    const features = [];
    if (ram) features.push(`${ram} de RAM`);
    if (storage) features.push(`${storage} de almacenamiento`);

    let description = features.length
      ? `Con ${features.join(" y ")}`
      : `Modelo ${displayName} de ${brand}`;
    if (networkMatch) {
      description += features.length
        ? `; conectividad ${networkMatch[1].toUpperCase()}`
        : ` con conectividad ${networkMatch[1].toUpperCase()}`;
    }
    if (condition) {
      description += condition.length < 12 ? `; condición: ${condition}` : `; ${condition}`;
    } else if (!features.length) {
      description += "; especificaciones no detalladas en el inventario";
    }

    groupedProducts.set(key, {
      id: "",
      brand,
      name: displayName,
      price,
      ram,
      storage,
      description: `${description}.`,
      stock: quantity,
      ...productImage,
    });
  });

  return [...groupedProducts.values()]
    .map((product) => ({ ...product, stock: Math.max(0, product.stock) }))
    .filter((product) => product.stock > 0)
    .sort((left, right) =>
      left.brand.localeCompare(right.brand, "es") ||
      left.name.localeCompare(right.name, "es") ||
      left.price - right.price,
    )
    .map((product, index) => ({ ...product, id: `phone-${index + 1}` }));
}

const products = buildProductCatalog(inventoryRows);

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

document.addEventListener(
  "error",
  (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.imageFailed) return;
    image.dataset.imageFailed = "true";
    image.src = image.dataset.fallback || "assets/celular-placeholder.svg";
  },
  true,
);

function formatPrice(amount) {
  return currency.format(amount);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
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
    visibleProducts.length === 1 ? "PRODUCTO" : "PRODUCTOS"
  }`;

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = '<p class="catalog-empty">No encontramos equipos de estas marcas por ahora.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const specs = [
        ["RAM", product.ram],
        ["Almacenamiento", product.storage],
      ]
        .filter(([, value]) => value)
        .map(
          ([label, value]) => `
            <span class="spec"><strong>${label}</strong>${escapeHtml(value)}</span>
          `,
        )
        .join("");

      return `
        <article class="product-card">
          <div class="product-image-wrap">
            <img src="${escapeHtml(product.image)}" data-fallback="assets/celular-placeholder.svg" alt="${escapeHtml(product.imageAlt)}" loading="lazy" />
            <span class="stock-label" data-stock-label="${product.id}">${product.stock} ${
              product.stock === 1 ? "disponible" : "disponibles"
            }</span>
          </div>
          <div class="product-content">
            <span class="product-brand">${escapeHtml(product.brand)}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <p class="product-description">${escapeHtml(product.description)}</p>
            ${specs ? `<div class="product-specs">${specs}</div>` : ""}
            <button class="add-to-cart" type="button" data-add-product="${product.id}" ${
              product.stock === 0 ? "disabled" : ""
            }>
              ${product.stock === 0 ? "Agotado" : "Agregar al carrito"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBrandFilters() {
  brandFilters.replaceChildren();

  const createFilterButton = (label, brand, isActive) => {
    const button = document.createElement("button");
    button.className = `brand-filter${isActive ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.brandFilter = brand;
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = label;
    brandFilters.append(button);
  };

  createFilterButton("Todas", "all", selectedBrands.size === 0);
  [...new Set(products.map((product) => product.brand))]
    .sort((left, right) => left.localeCompare(right, "es"))
    .forEach((brand) => createFilterButton(brand, brand, selectedBrands.has(brand)));
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
          <img src="${escapeHtml(product.image)}" data-fallback="assets/celular-placeholder.svg" alt="" />
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${formatPrice(product.price * quantity)}</p>
            <div class="quantity-controls" aria-label="Cantidad de ${escapeHtml(product.name)}">
              <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Quitar una unidad">−</button>
              <span>${quantity}</span>
              <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Agregar una unidad">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Quitar ${escapeHtml(product.name)} del carrito">×</button>
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
renderBrandFilters();
renderProducts();
renderCart();
