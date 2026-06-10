export const ui = {
  showState(state) {
    ['ui-loading', 'ui-error', 'ui-empty', 'services-grid'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    if (state === 'loading') document.getElementById('ui-loading').classList.remove('hidden');
    if (state === 'error') document.getElementById('ui-error').classList.remove('hidden');
    if (state === 'empty') document.getElementById('ui-empty').classList.remove('hidden');
    if (state === 'success') document.getElementById('services-grid').classList.remove('hidden');
  },

  showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#e63946' : '#2a9d8f';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  },

  toggleModal(isOpen) {
    const modal = document.getElementById('form-modal');
    if (isOpen) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
      document.getElementById('crud-form').reset();
      document.getElementById('item-id').value = '';
    }
  }
};