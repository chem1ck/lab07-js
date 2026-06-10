// main.js - Основной файл скриптов для mini-сайта

document.addEventListener('DOMContentLoaded', init);

function init() {
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initAccordion();
  initFilters();
  initModal();
  initContactForm();
}

// ==========================================
// 2. Підсвічування активної сторінки в навігації
// ==========================================
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link'); // Селектор твоих ссылок в меню
  if (!navLinks.length) return;

  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    // Получаем чистый путь из атрибута href
    const linkPath = link.getAttribute('href');
    
    // Проверяем, совпадает ли текущий путь с ссылкой
    if (currentPath.endsWith(linkPath) || (linkPath === 'index.html' && currentPath.endsWith('/'))) {
      link.classList.add('is-active'); // Добавляем класс активного состояния
    } else {
      link.classList.remove('is-active');
    }
  });
}

// ==========================================
// 3. Кнопка відкриття/закриття мобільного меню
// ==========================================
function initMenuToggle() {
  const burgerBtn = document.querySelector('.burger-menu'); // Кнопка-гамбургер
  const navMenu = document.querySelector('.nav-menu'); // Контейнер навигации

  if (!burgerBtn || !navMenu) return;

  // Переключение меню по клику на бургер
  burgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open'); // Используем CSS-класс состояния
    burgerBtn.setAttribute('aria-expanded', isOpen); // Обновляем доступность
  });

  // Автоматическое закрытие при клике на пункт меню
  navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      navMenu.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ==========================================
// 4. Перемикач світлої/темної теми
// ==========================================
function initThemeToggle() {
  const themeBtn = document.querySelector('.theme-toggle'); // Кнопка переключения темы
  const body = document.body;
  const themeKey = 'siteTheme'; // Осмисленный ключ localStorage

  // Восстановление темы при загрузке страницы
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'dark') {
    body.classList.add('theme-dark');
  }

  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    body.classList.toggle('theme-dark'); // Переключаем класс на body
    
    // Сохраняем состояние в localStorage
    if (body.classList.contains('theme-dark')) {
      localStorage.setItem(themeKey, 'dark');
    } else {
      localStorage.setItem(themeKey, 'light');
    }
  });
}

// ==========================================
// 5. Кнопка «Вгору» та динамічний рік у footer
// ==========================================
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top'); // Кнопка "Вверх"
  const yearSpan = document.querySelector('.current-year'); // Элемент года в футере

  // Динамический год в footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (!backToTopBtn) return;

  // Показываем/скрываем кнопку при скролле страницы
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.removeAttribute('hidden'); // Используем атрибут hidden
    } else {
      backToTopBtn.setAttribute('hidden', ''); // Скрываем кнопку
    }
  });

  // Плавный скролл наверх по клику
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Плавная прокрутка
    });
  });
}

// ==========================================
// 6. Акордеон або вкладки для структурованого контенту
// ==========================================
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  if (!accordionItems.length) return;

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    if (header) {
      header.addEventListener('click', () => {
        // Закрываем другие элементы
        accordionItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-active');
          }
        });
        
        // Переключаем текущий элемент
        item.classList.toggle('is-active');
      });
    }
  });
}

// ==========================================
// 7. Фільтрація або пошук контенту
// ==========================================
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn'); // Кнопки категорий
  const cards = document.querySelectorAll('.service-card'); // Карточки контента

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category; // Получаем выбранную категорию
      
      cards.forEach(card => {
        // Проверяем соответствие дата-атрибуту
        const match = category === 'all' || card.dataset.category === category;
        
        // Используем атрибут hidden для скрытия без зазоров в макете
        card.hidden = !match;
      });

      // Подсветка активной кнопки фильтра
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

// ==========================================
// 8. Модальне вікно або lightbox
// ==========================================
function initModal() {
  const modal = document.querySelector('.modal'); // Контейнер модалки
  const openBtns = document.querySelectorAll('.open-modal-btn'); // Кнопки открытия
  const closeBtn = document.querySelector('.close-modal-btn'); // Кнопка закрытия

  if (!modal || !openBtns.length || !closeBtn) return;

  // Открытие модального окна
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.removeAttribute('hidden'); // Показываем модалку
      document.body.style.overflow = 'hidden'; // Отключаем скролл body
    });
  });

  // Закрытие по кнопке
  closeBtn.addEventListener('click', () => {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  });

  // Закрытие по клику на оверлей
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  });
}

// ==========================================
// 9 & 10. Покращення форми, Валідація, Чернетка та FormData
// ==========================================
function initContactForm() {
  const form = document.querySelector('#contact-form'); // Наша форма
  if (!form) return;

  const nameInput = form.querySelector('[name="username"]');
  const emailInput = form.querySelector('[name="email"]');
  const messageInput = form.querySelector('[name="message"]'); // Textarea
  const charCounter = form.querySelector('.char-counter'); // Счетчик символов
  const successBlock = document.querySelector('.form-success-block'); // Блок подтверждения
  
  const draftKey = 'contactDraft'; // Ключ для localStorage

  // --- Счетчик символов для textarea ---
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const currentLength = messageInput.value.length;
      charCounter.textContent = `Введено символів: ${currentLength}`;
    });
  }

  // --- Работа с Чернеткой (localStorage) ---
  function saveToLocalStorage() {
    const draftData = {
      username: nameInput?.value || '',
      email: emailInput?.value || '',
      message: messageInput?.value || ''
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData)); 
  }

  // Слушаем ввод во все поля для автосохранения
  form.addEventListener('input', saveToLocalStorage);

  // Восстановление данных при перезагрузке страницы
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

  // --- Валидация и отправка формы ---
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Отменяем стандартное поведение
    
    let isValid = true;

    // Сброс старых ошибок в интерфейсе перед проверкой
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    // Валидация Имени
    if (nameInput && nameInput.value.trim().length < 2) {
      showError(nameInput, 'Ім’я повинно бути не коротшим за 2 символи!');
      isValid = false;
    }

    // Валидация Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, 'Введіть коректний Email!');
      isValid = false;
    }

    // Валидация Сообщения
    if (messageInput && messageInput.value.trim() === '') {
      showError(messageInput, 'Повідомлення не може бути порожнім!');
      isValid = false;
    }

    // Если всё валидно
    if (isValid) {
      const formData = new FormData(form); 
      const data = Object.fromEntries(formData.entries());

      // Показываем блок подтверждения с введенными данными
      if (successBlock) {
        successBlock.innerHTML = `
          <h3>Дякуємо! Форму успішно відправлено.</h3>
          <p><strong>Ім'я:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Повідомлення:</strong> ${data.message}</p>
        `;
        successBlock.removeAttribute('hidden'); 
      }

      form.reset(); // Очищаем форму
      localStorage.removeItem(draftKey); // Удаляем чернетку
      if (charCounter) charCounter.textContent = 'Введено символів: 0'; 
    }
  });

  // Вспомогательная функция вывода ошибки под полем
  function showError(inputElement, message) {
    const errorTarget = inputElement.closest('.form-group')?.querySelector('.error-message') 
                        || inputElement.parentElement.querySelector('.error-message');
    if (errorTarget) {
      errorTarget.textContent = message; 
    }
  }
}