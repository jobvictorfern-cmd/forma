// Número da loja com país e DDD, somente dígitos. Vazio ativa a demonstração.
const WHATSAPP_NUMBER = '';
const STORE_NAME = 'FORMA';
const STORAGE_KEY = 'forma-cart-v1';
const MAX_QUANTITY = 99;
const CURRENCY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = cents => CURRENCY.format(cents / 100);

const products = [
  { id: 'legging-flow', name: 'Legging Flow', category: 'Leggings', color: 'Verde oliva', swatch: '#4c5540', price: 15990, image: 'legging-flow', sizes: ['P', 'M', 'G', 'GG'],
    description: 'Legging de cintura alta com cós largo e acabamento fosco.' },
  { id: 'top-core', name: 'Top Core', category: 'Tops', color: 'Preto', swatch: '#252528', price: 8990, image: 'top-core', sizes: ['P', 'M', 'G'],
    description: 'Top de decote quadrado, alças largas e faixa ajustada abaixo do busto.' },
  { id: 'conjunto-motion', name: 'Conjunto Motion', category: 'Conjuntos', color: 'Chocolate', swatch: '#604536', price: 22990, image: 'conjunto-motion', sizes: ['P', 'M', 'G', 'GG'],
    description: 'Conjunto de top alongado e short ciclista de cintura alta, no mesmo tom.' },
  { id: 'camiseta-air', name: 'Camiseta Air', category: 'Camisetas', color: 'Off-white', swatch: '#dfd9c8', price: 9990, image: 'camiseta-air', sizes: ['P', 'M', 'G', 'GG'],
    description: 'Camiseta de manga curta e gola redonda, com modelagem ajustada ao corpo.' },
  { id: 'short-tempo', name: 'Short Tempo', category: 'Shorts', color: 'Taupe', swatch: '#a09280', price: 11990, image: 'short-tempo', sizes: ['P', 'M', 'G'],
    description: 'Short ciclista de cintura alta, com cós largo e comprimento até a metade da coxa.' },
  { id: 'top-alma', name: 'Top Alma', category: 'Tops', color: 'Verde musgo', swatch: '#697355', price: 10990, image: 'top-alma', sizes: ['P', 'M', 'G'],
    description: 'Top alongado com costas em Y e acabamento fosco.' }
];

// Medidas ilustrativas. Substitua pelos dados da loja antes de vender.
const demoMeasurements = {
  P: ['82–88', '64–70', '90–96'],
  M: ['89–95', '71–77', '97–103'],
  G: ['96–102', '78–84', '104–110'],
  GG: ['103–109', '85–91', '111–117']
};

const productById = new Map(products.map(product => [product.id, product]));
const keyFor = (id, size) => id + ':' + size;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const productImage = product => `assets/${product.image}.webp`;
const whatsappNumber = WHATSAPP_NUMBER.replace(/\D/g, '');

const grid = document.querySelector('#products');
const productDialog = document.querySelector('#product-dialog');
const cartDialog = document.querySelector('#cart-dialog');
const productForm = document.querySelector('#product-form');
const cartItems = document.querySelector('#cart-items');
const cartSummary = document.querySelector('#cart-summary');
const checkout = document.querySelector('#checkout');
const whatsappContact = document.querySelector('#whatsapp-contact');
const bagTrigger = document.querySelector('.bag-trigger');
const purchaseBrowse = document.querySelector('#purchase-browse');
const purchaseButton = document.querySelector('#buy-bag');
const announcement = document.querySelector('#announcement');
const notice = document.querySelector('#bag-notice');
const sizeOptions = document.querySelector('#sizes');
const sizeError = document.querySelector('#size-error');
let selectedProduct;
let cartOpenedFromPurchase = false;
const cart = loadCart();

function loadCart() {
  const items = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return items;
    for (const item of saved) {
      const product = productById.get(item?.id);
      if (product?.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0) {
        const quantity = Math.min(MAX_QUANTITY, item.quantity);
        items.set(keyFor(product.id, item.size), { id: product.id, size: item.size, quantity });
      }
    }
  } catch {
    // Se o navegador bloquear o armazenamento, a sacola funciona nesta sessão.
  }
  return items;
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart.values()]));
  } catch {
    // A sacola continua disponível em memória.
  }
  updateBagCount();
}

function updateBagCount() {
  const count = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('.bag-count').textContent = count;
  bagTrigger.setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`);
  purchaseBrowse.hidden = count > 0;
  purchaseButton.hidden = count === 0;
}

function renderProducts(category) {
  const visible = category === 'Todos' ? products : products.filter(product => product.category === category);
  document.querySelector('#catalog-count').textContent = `${visible.length} ${visible.length === 1 ? 'peça' : 'peças'}`;
  grid.innerHTML = visible.map((product, index) => `
    <article class="product">
      <div class="product-media">
        <button type="button" class="product-image-button" data-product="${product.id}" aria-haspopup="dialog" aria-label="Ver ${product.name}">
          <img src="${productImage(product)}" alt="" width="520" height="650" loading="${index < 3 ? 'eager' : 'lazy'}">
        </button>
      </div>
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p class="product-color"><span class="swatch" style="--swatch:${product.swatch}"></span>${product.color}</p>
        <p class="price">${money(product.price)}</p>
        <button class="add-button" type="button" data-product="${product.id}" aria-haspopup="dialog" aria-label="Escolher tamanho de ${product.name}">Escolher tamanho ${icon('arrow')}</button>
      </div>
    </article>`).join('');
}

function openProduct(id) {
  const product = productById.get(id);
  if (!product) return;
  selectedProduct = product;
  document.querySelector('#product-title').textContent = product.name;
  const photo = document.querySelector('#detail-image');
  photo.src = productImage(product);
  photo.alt = `${product.name} na cor ${product.color.toLowerCase()}`;
  document.querySelector('#detail-price').textContent = money(product.price);
  document.querySelector('#detail-color').textContent = product.color;
  document.querySelector('#detail-swatch').style.setProperty('--swatch', product.swatch);
  document.querySelector('#detail-description').textContent = product.description;
  const guide = document.querySelector('.size-guide');
  const measuredSizes = product.sizes.filter(size => Object.hasOwn(demoMeasurements, size));
  guide.open = false;
  guide.hidden = measuredSizes.length === 0;
  document.querySelector('#measurements').innerHTML = measuredSizes.map(size =>
    `<tr><th scope="row">${size}</th>${demoMeasurements[size].map(measure => `<td>${measure}</td>`).join('')}</tr>`
  ).join('');
  sizeError.hidden = true;
  sizeOptions.innerHTML = product.sizes.map(size =>
    `<label><input type="radio" name="size" value="${size}" required><span>${size}</span></label>`
  ).join('');
  productDialog.showModal();
  productDialog.scrollTop = 0;
}

function showNotice(message) {
  announcement.textContent = message;
  document.querySelector('#bag-message').textContent = message;
  notice.hidden = false;
}

function whatsappLink(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function renderCart() {
  cartSummary.hidden = cart.size === 0;
  if (!cart.size) {
    cartItems.innerHTML = `<div class="empty-cart"><p>Sua sacola está vazia.</p><a href="#colecao" class="pill secondary" data-shop>Explorar coleção ${icon('arrow')}</a></div>`;
    checkout.removeAttribute('href');
    return;
  }

  let subtotal = 0;
  const lines = [];
  cartItems.innerHTML = [...cart].map(([key, item]) => {
    const product = productById.get(item.id);
    const total = product.price * item.quantity;
    subtotal += total;
    lines.push(`• ${item.quantity} × ${product.name} — ${product.color}, tamanho ${item.size} — ${money(total)}`);
    return `
      <article class="cart-row">
        <img src="${productImage(product)}" alt="">
        <div>
          <h3>${product.name}</h3><p>${product.color} · ${item.size}</p>
          <div class="quantity">
            <button class="step" type="button" data-key="${key}" data-step="-1" aria-label="${item.quantity === 1 ? 'Remover' : 'Reduzir quantidade de'} ${product.name}, ${item.size}">${icon('minus')}</button>
            <output aria-label="Quantidade">${item.quantity}</output>
            <button class="step" type="button" data-key="${key}" data-step="1" aria-label="Aumentar quantidade de ${product.name}, ${item.size}" ${item.quantity >= MAX_QUANTITY ? 'disabled' : ''}>${icon('plus')}</button>
          </div>
        </div>
        <strong class="price">${money(total)}</strong>
      </article>`;
  }).join('');

  document.querySelector('#subtotal').textContent = money(subtotal);
  document.querySelector('#checkout-note').textContent = whatsappNumber
    ? 'Confirme disponibilidade, frete e pagamento com a loja.'
    : 'Modo demonstração. O WhatsApp abre com a mensagem pronta para você escolher o destinatário.';
  const message = [`Olá, ${STORE_NAME}! Gostaria de fazer este pedido:`, '', ...lines, '', `Subtotal dos produtos: ${money(subtotal)}`, '', 'Podem confirmar a disponibilidade, o frete e a forma de pagamento?'].join('\n');
  checkout.href = whatsappLink(message);
}

function openCart(event) {
  cartOpenedFromPurchase = event.currentTarget === purchaseButton;
  if (notice.contains(document.activeElement)) bagTrigger.focus();
  notice.hidden = true;
  renderCart();
  cartDialog.showModal();
}

document.querySelector('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button || button.getAttribute('aria-pressed') === 'true') return;
  document.querySelector('.filters [aria-pressed="true"]').setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-pressed', 'true');
  renderProducts(button.dataset.category);
  announcement.textContent = `${grid.children.length} produtos exibidos.`;
});

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-product]');
  if (button) openProduct(button.dataset.product);
});

productForm.addEventListener('submit', event => {
  event.preventDefault();
  const size = new FormData(productForm).get('size');
  if (!selectedProduct?.sizes.includes(size)) {
    sizeError.hidden = false;
    sizeOptions.querySelector('input')?.focus();
    return;
  }
  const { id, name } = selectedProduct;
  const key = keyFor(id, size);
  const oldQuantity = cart.get(key)?.quantity ?? 0;
  if (oldQuantity < MAX_QUANTITY) {
    cart.set(key, { id, size, quantity: oldQuantity + 1 });
    saveCart();
  }
  productDialog.close();
  showNotice(oldQuantity >= MAX_QUANTITY ? 'Limite atingido para este tamanho.' : `${name} · ${size} na sacola.`);
});

sizeOptions.addEventListener('change', () => { sizeError.hidden = true; });
bagTrigger.addEventListener('click', openCart);
purchaseButton.addEventListener('click', openCart);
cartDialog.addEventListener('close', () => {
  if (cartOpenedFromPurchase && purchaseButton.hidden) purchaseBrowse.focus();
});
document.querySelector('#notice-bag').addEventListener('click', openCart);
document.querySelector('#notice-close').addEventListener('click', () => {
  bagTrigger.focus();
  notice.hidden = true;
});
for (const dialog of [cartDialog, productDialog]) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
}

cartItems.addEventListener('click', event => {
  if (event.target.closest('[data-shop]')) {
    cartDialog.close();
    return;
  }
  const button = event.target.closest('[data-step]');
  if (!button) return;
  const { key, step } = button.dataset;
  const item = cart.get(key);
  if (!item) return;
  item.quantity = Math.min(MAX_QUANTITY, item.quantity + Number(step));
  if (item.quantity === 0) cart.delete(key);
  saveCart();
  renderCart();
  const siblingButtons = [...cartItems.querySelectorAll('[data-key]')].filter(candidate => candidate.dataset.key === key && !candidate.disabled);
  const focusTarget = siblingButtons.find(candidate => candidate.dataset.step === step) ?? siblingButtons[0] ?? cartItems.querySelector('[data-shop]') ?? cartDialog.querySelector('[data-close]');
  focusTarget.focus();
});

renderProducts('Todos');
updateBagCount();
whatsappContact.href = whatsappLink(`Olá, ${STORE_NAME}! Gostaria de saber mais sobre a coleção.`);
whatsappContact.hidden = false;
