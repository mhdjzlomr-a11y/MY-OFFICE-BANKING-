/**
 * db.js - IndexedDB Database Storage Engine for Office Finance PWA
 * Handles transactions, categories, office settings, and backup/restore
 */

const DB_NAME = 'OfficeFinanceDB';
const DB_VERSION = 2;

const DEFAULT_CATEGORIES = [
  // --- Expense Categories ---
  { id: 'rent', nameMl: 'ഓഫീസ് വാടക', nameEn: 'Office Rent', type: 'expense', color: '#f43f5e', icon: 'building', isCustom: false },
  { id: 'salary', nameMl: 'ശമ്പളം & വേതനം', nameEn: 'Staff Salary & Wages', type: 'expense', color: '#ef4444', icon: 'users', isCustom: false },
  { id: 'electricity', nameMl: 'കറന്റ് ബിൽ', nameEn: 'Electricity Bill', type: 'expense', color: '#eab308', icon: 'zap', isCustom: false },
  { id: 'water', nameMl: 'വാട്ടർ ബിൽ', nameEn: 'Water Bill', type: 'expense', color: '#06b6d4', icon: 'droplet', isCustom: false },
  { id: 'internet', nameMl: 'ഇന്റർനെറ്റ് & ഫോൺ', nameEn: 'Internet & Phone', type: 'expense', color: '#3b82f6', icon: 'wifi', isCustom: false },
  { id: 'refreshments', nameMl: 'ചായ & ലഘുഭക്ഷണം', nameEn: 'Tea & Snacks', type: 'expense', color: '#f97316', icon: 'coffee', isCustom: false },
  { id: 'stationery', nameMl: 'സ്റ്റേഷനറി & പേപ്പർ', nameEn: 'Stationery & Printing', type: 'expense', color: '#8b5cf6', icon: 'file-text', isCustom: false },
  { id: 'cleaning', nameMl: 'ക്ലീനിംഗ് & ശുചിത്വം', nameEn: 'Cleaning & Sanitation', type: 'expense', color: '#14b8a6', icon: 'sparkles', isCustom: false },
  { id: 'maintenance', nameMl: 'റിപ്പയറിങ് & സർവീസ്', nameEn: 'Repairs & Maintenance', type: 'expense', color: '#64748b', icon: 'wrench', isCustom: false },
  { id: 'travel', nameMl: 'യാത്രാപ്പടി & പെട്രോൾ', nameEn: 'Travel & Conveyance', type: 'expense', color: '#d97706', icon: 'car', isCustom: false },
  { id: 'courier', nameMl: 'കൊറിയർ & തപാൽ', nameEn: 'Courier & Postage', type: 'expense', color: '#0284c7', icon: 'send', isCustom: false },
  { id: 'marketing', nameMl: 'മാർക്കറ്റിംഗ് & പരസ്യം', nameEn: 'Marketing & Ads', type: 'expense', color: '#ec4899', icon: 'megaphone', isCustom: false },
  { id: 'software', nameMl: 'സോഫ്റ്റ്‌വെയർ ടൂളുകൾ', nameEn: 'Software & Tools', type: 'expense', color: '#6366f1', icon: 'cpu', isCustom: false },
  { id: 'taxes', nameMl: 'ടാക്സ് & ലൈസൻസ് ഫീസ്', nameEn: 'Taxes & License Fees', type: 'expense', color: '#dc2626', icon: 'shield', isCustom: false },
  { id: 'advance', nameMl: 'സ്റ്റാഫ് അഡ്വാൻസ്', nameEn: 'Staff Cash Advance', type: 'expense', color: '#a855f7', icon: 'wallet', isCustom: false },
  { id: 'assets', nameMl: 'ഓഫീസ് ഫർണിച്ചർ & ഉപകരണങ്ങൾ', nameEn: 'Office Assets & Equipment', type: 'expense', color: '#059669', icon: 'box', isCustom: false },
  { id: 'misc_exp', nameMl: 'മറ്റ് ചിലവുകൾ', nameEn: 'Other Miscellaneous Expenses', type: 'expense', color: '#94a3b8', icon: 'more-horizontal', isCustom: false },

  // --- Income Categories ---
  { id: 'client_pay', nameMl: 'ക്ലയന്റ് പേയ്‌മെന്റ്', nameEn: 'Client Payments', type: 'income', color: '#10b981', icon: 'check-circle', isCustom: false },
  { id: 'service_rev', nameMl: 'സർവീസ് ചാർജ് / ഫീസ്', nameEn: 'Service Revenue', type: 'income', color: '#059669', icon: 'briefcase', isCustom: false },
  { id: 'project_adv', nameMl: 'പ്രൊജക്റ്റ് അഡ്വാൻസ്', nameEn: 'Project Advance', type: 'income', color: '#14b8a6', icon: 'layers', isCustom: false },
  { id: 'consulting', nameMl: 'കൺസൾട്ടിംഗ് വരുമാനം', nameEn: 'Consulting Fee', type: 'income', color: '#0d9488', icon: 'user-check', isCustom: false },
  { id: 'sales', nameMl: 'സെയിൽസ് / വിൽപ്പന', nameEn: 'Sales Income', type: 'income', color: '#16a34a', icon: 'shopping-bag', isCustom: false },
  { id: 'refund', nameMl: 'റീഫണ്ട് & റിട്ടേൺ', nameEn: 'Refunds & Returns', type: 'income', color: '#3b82f6', icon: 'rotate-ccw', isCustom: false },
  { id: 'capital', nameMl: 'ക്യാപിറ്റൽ / നിക്ഷേപം', nameEn: 'Capital / Owner Deposit', type: 'income', color: '#8b5cf6', icon: 'piggy-bank', isCustom: false },
  { id: 'misc_inc', nameMl: 'മറ്റ് വരുമാനങ്ങൾ', nameEn: 'Other Miscellaneous Income', type: 'income', color: '#64748b', icon: 'plus-circle', isCustom: false }
];

const DEFAULT_OFFICE_PROFILE = {
  name: 'OFFICE FINANCE TRACKER',
  tagline: 'ഫിനാൻസ് & അക്കൗണ്ട്സ് ഡിവിഷൻ',
  address: 'ഓഫീസ് വിലാസം, കേരളം',
  phone: '+91 9876543210',
  email: 'office@example.com',
  gst: '',
  currency: '₹'
};

class FinanceDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Transactions Store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
          txStore.createIndex('type', 'type', { unique: false });
          txStore.createIndex('category', 'category', { unique: false });
          txStore.createIndex('date', 'date', { unique: false });
          txStore.createIndex('amount', 'amount', { unique: false });
          txStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('type', 'type', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Contacts Store (People Name & WhatsApp Number Directory)
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
          contactStore.createIndex('name', 'name', { unique: false });
          contactStore.createIndex('phone', 'phone', { unique: false });
          contactStore.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this.seedDefaults();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async seedDefaults() {
    // Seed default categories if none exist
    const categories = await this.getAllCategories();
    if (categories.length === 0) {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      for (const cat of DEFAULT_CATEGORIES) {
        store.put(cat);
      }
    }

    // Seed default office profile
    const profile = await this.getSetting('officeProfile');
    if (!profile) {
      await this.setSetting('officeProfile', DEFAULT_OFFICE_PROFILE);
    } else if (!profile.name || profile.name.includes('My Office') || profile.name.includes('എന്റെ ഓഫീസ്')) {
      profile.name = 'OFFICE FINANCE TRACKER';
      await this.setSetting('officeProfile', profile);
    }

    const lang = await this.getSetting('language');
    if (!lang) {
      await this.setSetting('language', 'ml');
    }

    const theme = await this.getSetting('theme');
    if (!theme) {
      await this.setSetting('theme', 'light');
    }
  }

  // --- Transactions ---

  async getAllTransactions() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.getAll();
      req.onsuccess = () => {
        // Return sorted by date descending (newest first)
        const sorted = (req.result || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getTransactionById(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const req = store.get(Number(id));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async addTransaction(item) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const data = {
        ...item,
        amount: parseFloat(item.amount) || 0,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async updateTransaction(item) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const data = {
        ...item,
        id: Number(item.id),
        amount: parseFloat(item.amount) || 0,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteTransaction(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Categories ---

  async getAllCategories() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readonly');
      const store = tx.objectStore('categories');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async addCategory(cat) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const id = cat.id || 'cat_' + Date.now();
      const item = {
        ...cat,
        id,
        isCustom: true
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async updateCategory(cat) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const req = store.put(cat);
      req.onsuccess = () => resolve(cat);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteCategory(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Contacts & WhatsApp Directory ---

  async getAllContacts() {
    await this.init();
    if (this.db.objectStoreNames.contains('contacts')) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readonly');
        const store = tx.objectStore('contacts');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } else {
      const list = (await this.getSetting('savedContactsList', [])) || [];
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  }

  async addContact(contact) {
    await this.init();
    if (!contact.createdAt) contact.createdAt = new Date().toISOString();
    if (this.db.objectStoreNames.contains('contacts')) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.add(contact);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      const list = (await this.getSetting('savedContactsList', [])) || [];
      contact.id = Date.now();
      list.push(contact);
      await this.setSetting('savedContactsList', list);
      return contact.id;
    }
  }

  async updateContact(contact) {
    await this.init();
    if (this.db.objectStoreNames.contains('contacts')) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.put(contact);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      let list = (await this.getSetting('savedContactsList', [])) || [];
      list = list.map(c => c.id === contact.id ? contact : c);
      await this.setSetting('savedContactsList', list);
      return contact.id;
    }
  }

  async deleteContact(id) {
    await this.init();
    const numId = Number(id);
    if (this.db.objectStoreNames.contains('contacts')) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.delete(numId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      let list = (await this.getSetting('savedContactsList', [])) || [];
      list = list.filter(c => c.id !== numId);
      await this.setSetting('savedContactsList', list);
      return true;
    }
  }

  async findContactByName(name) {
    if (!name) return null;
    const contacts = await this.getAllContacts();
    const q = name.trim().toLowerCase();
    return contacts.find(c => (c.name || '').trim().toLowerCase() === q) || null;
  }

  // --- Settings ---

  async getSetting(key, defaultVal = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : defaultVal);
      req.onerror = () => reject(req.error);
    });
  }

  async setSetting(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve(value);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Backup & Restore ---

  async exportBackup() {
    const transactions = await this.getAllTransactions();
    const categories = await this.getAllCategories();
    const contacts = await this.getAllContacts();
    const officeProfile = await this.getSetting('officeProfile');
    const language = await this.getSetting('language');
    const theme = await this.getSetting('theme');

    return {
      version: 2,
      appName: 'OfficeFinance',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      contacts,
      settings: {
        officeProfile,
        language,
        theme
      }
    };
  }

  async importBackup(data) {
    if (!data || !data.appName || data.appName !== 'OfficeFinance') {
      throw new Error('Invalid backup file. Please select a valid Office Finance backup JSON.');
    }

    await this.init();

    // Import Categories
    if (Array.isArray(data.categories)) {
      const txCat = this.db.transaction('categories', 'readwrite');
      const storeCat = txCat.objectStore('categories');
      for (const cat of data.categories) {
        storeCat.put(cat);
      }
    }

    // Import Transactions
    if (Array.isArray(data.transactions)) {
      const txT = this.db.transaction('transactions', 'readwrite');
      const storeT = txT.objectStore('transactions');
      for (const item of data.transactions) {
        storeT.put(item);
      }
    }

    // Import Contacts
    if (Array.isArray(data.contacts)) {
      for (const contact of data.contacts) {
        if (contact && contact.name) {
          await this.addContact(contact);
        }
      }
    }

    // Import Settings
    if (data.settings) {
      if (data.settings.officeProfile) {
        await this.setSetting('officeProfile', data.settings.officeProfile);
      }
      if (data.settings.language) {
        await this.setSetting('language', data.settings.language);
      }
    }

    return true;
  }

  async clearAllData() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readwrite');
      tx.objectStore('transactions').clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Global database instance
window.dbEngine = new FinanceDB();
