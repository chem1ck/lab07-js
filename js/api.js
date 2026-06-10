const API_URL = 'http://localhost:3000/items';

export const api = {
  async getItems(queryParams = '') {
    const response = await fetch(`${API_URL}?${queryParams}`);
    if (!response.ok) throw new Error('Не вдалося завантажити дані');
    return await response.json();
  },

  async createItem(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Помилка створення');
    return await response.json();
  },

  async updateItem(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Помилка оновлення');
    return await response.json();
  },

  async deleteItem(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Помилка видалення');
  }
};