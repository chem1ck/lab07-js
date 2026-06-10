// 1. ІМПОРТИ (ЗАВЖДИ НА САМОМУ ПОЧАТКУ ФАЙЛУ)
import { api } from './api.js';
import { ui } from './ui.js';

// 2. ГЛОБАЛЬНИЙ СТАН
let currentItems = [];

// 3. ІНІЦІАЛІЗАЦІЯ
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Ініціалізація загального UI (з минулих лабораторних)
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initAccordion();
  initFilters(); // Для сторінки "Про мене"
  initContactForm();

  // Ініціалізація логіки каталогу (CRUD)
  const grid = document.getElementById('services-grid');
  if (grid) {
    loadData();
    setupCRUDEventListeners();
  }
}

// ==========================================
// ЧАСТИНА 1: СТАРИЙ ЗАГАЛЬНИЙ UI
// ==========================================

function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath) || (linkPath.includes('index.html') && currentPath.endsWith('/'))) {
      link.classList.add('is-active', 'active');
    } else {
      link.classList.remove('is-active', 'active');
    }
  });
}

function initMenuToggle() {
  const burgerBtn = document.querySelector('.burger-menu') || document.querySelector('.burger-btn');
  const navMenu = document.querySelector('.nav-menu') || document.querySelector('.nav-list');
  if (!burgerBtn || !navMenu) return;
  
  burgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });
  
  navMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
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
  const backToTopBtn = document.querySelector('.back-to-top') || document.querySelector('.scroll-btn');
  const yearSpans = document.querySelectorAll('.current-year');
  
  yearSpans.forEach(span => span.textContent = new Date().getFullYear());
  
  if (!backToTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.removeAttribute('hidden');
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.setAttribute('hidden', '');
      backToTopBtn.classList.remove('is-visible');
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
  const cards = document.querySelectorAll('.service-card-static, .filter-item'); 
  if (!filterButtons.length || !cards.length) return;
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category || button.dataset.filter;
      cards.forEach(card => {
        const cardCat = card.dataset.category;
        const match = category === 'all' || cardCat === category;
        card.hidden = !match;
        if (!match) card.style.display = 'none'; else card.style.display = '';
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
  const successBlock = document.querySelector('.form-success-block') || document.querySelector('#form-success');
  const draftKey = 'contactDraft';

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = `Введено символів: ${messageInput.value.length}/500`;
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
        if (charCounter) charCounter.textContent = `Введено символів: ${data.message.length}/500`;
      }
    } catch (e) {
      console.error("Помилка читання чернетки", e);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    form.querySelectorAll('.error-message, .error-msg').forEach(el => el.textContent = '');

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
        successBlock.style.display = 'block';
      }
      form.reset();
      localStorage.removeItem(draftKey);
      if (charCounter) charCounter.textContent = 'Введено символів: 0/500';
    }
  });

  function showError(inputElement, message) {
    const errorTarget = inputElement.closest('.form-group')?.querySelector('.error-message') || 
                        inputElement.parentElement.querySelector('.error-message') ||
                        inputElement.parentElement.querySelector('.error-msg');
    if (errorTarget) {
      errorTarget.textContent = message;
      errorTarget.style.display = 'block';
    }
  }
}

// ==========================================
// ЧАСТИНА 2: НОВИЙ КАТАЛОГ ПОСЛУГ (REST API CRUD)
// ==========================================

async function loadData() {
  ui.showState('loading');
  try {
    // Збираємо параметри для фільтрації/сортування через API json-server
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    
    let queryParams = new URLSearchParams();
    
    if (searchInput && searchInput.value) queryParams.append('q', searchInput.value);
    if (categoryFilter && categoryFilter.value !== 'all') queryParams.append('category', categoryFilter.value);
    
    if (sortSelect) {
      if (sortSelect.value === 'price-asc') { 
        queryParams.append('_sort', 'price'); 
        queryParams.append('_order', 'asc'); 
      }
      if (sortSelect.value === 'price-desc') { 
        queryParams.append('_sort', 'price'); 
        queryParams.append('_order', 'desc'); 
      }
    }

    currentItems = await api.getItems(queryParams.toString());
    
    if (currentItems.length === 0) {
      ui.showState('empty');
    } else {
      renderGrid(currentItems);
      ui.showState('success');
    }
  } catch (error) {
    ui.showState('error');
    ui.showToast(error.message, true);
  }
}

function renderGrid(items) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'service-card';
    // Додаємо fallback картинку, якщо її немає у базі
    const imageUrl = item.image || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80";
    
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${imageUrl}" alt="${item.title}" class="card-img">
      </div>
      <div class="card-content">
        <span class="card-badge">${item.category.toUpperCase()}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <span class="card-price">$${item.price}</span>
          <div class="action-btns">
            <button class="btn btn-secondary edit-btn" data-id="${item.id}">Редаг.</button>
            <button class="btn btn-danger delete-btn" data-id="${item.id}">Видал.</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function setupCRUDEventListeners() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');
  const addNewBtn = document.getElementById('add-new-btn');
  const closeFormBtn = document.getElementById('close-form-btn');
  const crudForm = document.getElementById('crud-form');
  const servicesGrid = document.getElementById('services-grid');

  if (searchInput) searchInput.addEventListener('input', debounce(loadData, 500));
  if (categoryFilter) categoryFilter.addEventListener('change', loadData);
  if (sortSelect) sortSelect.addEventListener('change', loadData);

  if (addNewBtn) {
    addNewBtn.addEventListener('click', () => {
      document.getElementById('form-title').textContent = 'Додати послугу';
      ui.toggleModal(true);
    });
  }
  
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', () => ui.toggleModal(false));
  }

  if (crudForm) {
    crudForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Збереження...';

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      data.price = Number(data.price);
      const id = data.id;
      delete data.id; 

      try {
        if (id) {
          await api.updateItem(id, data);
          ui.showToast('Запис успішно оновлено!');
        } else {
          await api.createItem(data);
          ui.showToast('Запис успішно створено!');
        }
        ui.toggleModal(false);
        loadData();
      } catch (error) {
        ui.showToast(error.message, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зберегти';
      }
    });
  }

  if (servicesGrid) {
    servicesGrid.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      
      if (e.target.classList.contains('delete-btn')) {
        if (confirm('Ви впевнені, що хочете видалити цей запис?')) {
          try {
            await api.deleteItem(id);
            ui.showToast('Запис видалено!');
            loadData();
          } catch (error) {
            ui.showToast(error.message, true);
          }
        }
      }

      if (e.target.classList.contains('edit-btn')) {
        const item = currentItems.find(i => i.id == id);
        if (item) {
          document.getElementById('item-id').value = item.id;
          document.getElementById('item-title').value = item.title;
          document.getElementById('item-category').value = item.category;
          document.getElementById('item-price').value = item.price;
          document.getElementById('item-desc').value = item.description;
          
          document.getElementById('form-title').textContent = 'Редагувати послугу';
          ui.toggleModal(true);
        }
      }
    });
  }
}

// Допоміжна функція
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}