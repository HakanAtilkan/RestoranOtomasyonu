// Basit bellek ici veri deposu (mock DB)
const { v4: uuid } = require('uuid');

function createCollection(initial = []) {
  const data = [...initial];

  return {
    findAll() {
      return data;
    },
    findById(id) {
      return data.find(item => item.id === id);
    },
    create(payload) {
      const record = { id: uuid(), ...payload };
      data.push(record);
      return record;
    },
    update(id, payload) {
      const index = data.findIndex(item => item.id === id);
      if (index === -1) return null;
      data[index] = { ...data[index], ...payload };
      return data[index];
    },
    remove(id) {
      const index = data.findIndex(item => item.id === id);
      if (index === -1) return false;
      data.splice(index, 1);
      return true;
    }
  };
}

module.exports = { createCollection };

