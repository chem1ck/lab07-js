document.addEventListener('DOMContentLoaded', init);

// Глобальний стан додатку (Каталог)
let allServices = [];
let filteredServices = [];
let visibleCount = 4;
const ITEMS_PER_PAGE = 4;
const FAVORITES_KEY = 'catalogFavorites';

async function init() {
  // Ініціалізація загального UI
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initAccordion();
  initFilters();
  initContactForm();
  
  // Ініціалізація каталогу та модальних вікон
  initStaticUI();
  await initCatalogPage();
}

// ==========================================
// 1. Загальний UI
// ==========================================

function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath) || (linkPath === 'index.html' && currentPath.endsWith('/'))) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

function initMenuToggle() {
  const burgerBtn = document.querySelector('.burger-menu');
  const navMenu = document.querySelector('.nav-menu');
  if (!burgerBtn || !navMenu) return;
  
  burgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });
  
  navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      navMenu.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initThemeToggle() {
  const themeBtn = document.querySelector('.theme-toggle');
  const body = document.body;
  const themeKey = 'siteTheme';
  
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'dark') {
    body.classList.add('theme-dark');
  }
  
  if (!themeBtn) return;
  
  themeBtn.addEventListener('click', () => {
    body.classList.toggle('theme-dark');
    if (body.classList.contains('theme-dark')) {
      localStorage.setItem(themeKey, 'dark');
    } else {
      localStorage.setItem(themeKey, 'light');
    }
  });
}

function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  const yearSpan = document.querySelector('.current-year');
  
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  
  if (!backToTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.removeAttribute('hidden');
    } else {
      backToTopBtn.setAttribute('hidden', '');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  if (!accordionItems.length) return;
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        accordionItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('is-active');
        });
        item.classList.toggle('is-active');
      });
    }
  });
}

function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card-static'); // Уникнення конфлікту з динамічними картками
  if (!filterButtons.length || !cards.length) return;
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      cards.forEach(card => {
        const match = category === 'all' || card.dataset.category === category;
        card.hidden = !match;
      });
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  
  const nameInput = form.querySelector('[name="username"]');
  const emailInput = form.querySelector('[name="email"]');
  const messageInput = form.querySelector('[name="message"]');
  const charCounter = form.querySelector('.char-counter');
  const successBlock = document.querySelector('.form-success-block');
  const draftKey = 'contactDraft';

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = `Введено символів: ${messageInput.value.length}`;
    });
  }

  function saveToLocalStorage() {
    const draftData = {
      username: nameInput?.value || '',
      email: emailInput?.value || '',
      message: messageInput?.value || ''
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }

  form.addEventListener('input', saveToLocalStorage);

  const savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) {
    try {
      const data = JSON.parse(savedDraft);
      if (nameInput && data.username) nameInput.value = data.username;
      if (emailInput && data.email) emailInput.value = data.email;
      if (messageInput && data.message) {
        messageInput.value = data.message;
        if (charCounter) charCounter.textContent = `Введено символів: ${data.message.length}`;
      }
    } catch (e) {
      console.error("Помилка читання чернетки", e);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (nameInput && nameInput.value.trim().length < 2) {
      showError(nameInput, 'Ім’я повинно бути не коротшим за 2 символи!');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'Введіть коректний Email!');
      isValid = false;
    }

    if (messageInput && messageInput.value.trim() === '') {
      showError(messageInput, 'Повідомлення не може бути порожнім!');
      isValid = false;
    }

    if (isValid) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      if (successBlock) {
        successBlock.innerHTML = `
          <h3>Дякуємо! Форму успішно відправлено.</h3>
          <p><strong>Ім'я:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Повідомлення:</strong> ${data.message}</p>
        `;
        successBlock.removeAttribute('hidden');
      }
      form.reset();
      localStorage.removeItem(draftKey);
      if (charCounter) charCounter.textContent = 'Введено символів: 0';
    }
  });

  function showError(inputElement, message) {
    const errorTarget = inputElement.closest('.form-group')?.querySelector('.error-message') || inputElement.parentElement.querySelector('.error-message');
    if (errorTarget) errorTarget.textContent = message;
  }
}

// ==========================================
// 2. Каталог послуг (Fetch, JSON, DOM)
// ==========================================

function initStaticUI() {
  const modal = document.getElementById('details-modal');
  const closeBtn = document.querySelector('.close-modal-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }
}

async function initCatalogPage() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  try {
    showState('loading');
    allServices = await loadServices();
    filteredServices = [...allServices];
    applyFiltersAndRender();
    setupEventListeners();
  } catch (error) {
    console.error(error);
    showState('error');
  }
}

async function loadServices() {
  const response = await fetch('./data/services.json');
  if (!response.ok) throw new Error(`Помилка мережі: ${response.status}`);
  return await response.json();
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');
  
  if (searchInput) searchInput.addEventListener('input', handleControlsChange);
  if (categoryFilter) categoryFilter.addEventListener('change', handleControlsChange);
  if (sortSelect) sortSelect.addEventListener('change', handleControlsChange);

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += ITEMS_PER_PAGE;
      renderCards();
    });
  }
}

function handleControlsChange() {
  visibleCount = ITEMS_PER_PAGE;
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const selectedCategory = document.getElementById('category-filter').value;
  const selectedSort = document.getElementById('sort-select').value;

  filteredServices = allServices.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedSort === 'title-asc') {
    filteredServices.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
  } else if (selectedSort === 'price-asc') {
    filteredServices.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'price-desc') {
    filteredServices.sort((a, b) => b.price - a.price);
  }

  applyFiltersAndRender();
}

function applyFiltersAndRender() {
  if (filteredServices.length === 0) {
    showState('empty');
  } else {
    showState('success');
    renderCards();
  }
}

function renderCards() {
  const grid = document.getElementById('services-grid');
  grid.innerHTML = '';
  const favorites = getFavorites();
  const itemsToRender = filteredServices.slice(0, visibleCount);

  itemsToRender.forEach(item => {
    const isFavorite = favorites.includes(item.id.toString());
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('data-id', item.id);
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.image}" alt="${item.title}" class="card-img">
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" aria-label="Додати в обране">★</button>
      </div>
      <div class="card-content">
        <span class="card-badge">${item.category.toUpperCase()}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <span class="card-price">$${item.price}</span>
          <button class="btn btn-primary details-btn">Детальніше</button>
        </div>
      </div>
    `;

    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(item.id.toString(), e.target);
    });

    card.querySelector('.details-btn').addEventListener('click', () => {
      openDetailsModal(item);
    });

    grid.appendChild(card);
  });

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    if (filteredServices.length > visibleCount) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  }
}

function showState(state) {
  const loading = document.getElementById('catalog-loading');
  const error = document.getElementById('catalog-error');
  const empty = document.getElementById('catalog-empty');
  const grid = document.getElementById('services-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');

  loading?.classList.add('hidden');
  error?.classList.add('hidden');
  empty?.classList.add('hidden');
  grid?.classList.add('hidden');
  loadMoreBtn?.classList.add('hidden');

  if (state === 'loading') loading?.classList.remove('hidden');
  else if (state === 'error') error?.classList.remove('hidden');
  else if (state === 'empty') empty?.classList.remove('hidden');
  else if (state === 'success') grid?.classList.remove('hidden');
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function toggleFavorite(id, buttonElement) {
  let favorites = getFavorites();
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    buttonElement.classList.remove('active');
  } else {
    favorites.push(id);
    buttonElement.classList.add('active');
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function openDetailsModal(item) {
  const modal = document.getElementById('details-modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-grid">
      <img src="${item.image}" alt="${item.title}" class="modal-img">
      <div>
        <span class="card-badge">${item.category.toUpperCase()}</span>
        <h2>${item.title}</h2>
        <p class="modal-rating">⭐ Рейтинг: <strong>${item.rating} / 5.0</strong></p>
        <p class="modal-full-desc">${item.description}</p>
        <div class="modal-actions">
          <span class="modal-price">Орієнтовна вартість: $${item.price}</span>
          <button class="btn btn-primary" onclick="alert('Дякуємо за замовлення! Менеджер зв\\'яжеться з вами.')">Замовити послугу</button>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}