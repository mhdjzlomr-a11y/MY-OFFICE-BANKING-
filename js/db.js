/**
 * db.js - IndexedDB Database Storage Engine for Office Finance PWA
 * Handles transactions, categories, office settings, and backup/restore
 */

const DB_NAME = 'OfficeFinanceDB';
const DB_VERSION = 2;

const DEFAULT_DIVISIONS = [
  { id: 'office', nameMl: 'ഓഫീസ് ഫിനാൻസ്', nameEn: 'Office Finance', icon: 'building', color: '#5c54f8' },
  { id: 'school', nameMl: 'സ്കൂൾ ഫിനാൻസ്', nameEn: 'School Finance', icon: 'graduation-cap', color: '#10b981' },
  { id: 'home', nameMl: 'വീട് / വ്യക്തിഗതം', nameEn: 'Home & Personal', icon: 'home', color: '#f43f5e' }
];

const DEFAULT_USERS = [
  {
    id: 'user_master',
    name: 'Owner (അഡ്മിൻ)',
    role: 'admin',      // 'admin' | 'staff' | 'viewer'
    pin: '1234',
    isMaster: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_CATEGORIES = [
  // ================= 1. OFFICE EXPENSES =================
  { id: 'rent', nameMl: 'ഓഫീസ് വാടക', nameEn: 'Office Rent', type: 'expense', color: '#f43f5e', icon: 'building', division: 'office', isCustom: false },
  { id: 'salary', nameMl: 'ശമ്പളം & വേതനം', nameEn: 'Staff Salary & Wages', type: 'expense', color: '#ef4444', icon: 'users', division: 'office', isCustom: false },
  { id: 'electricity', nameMl: 'കറന്റ് ബിൽ', nameEn: 'Electricity Bill', type: 'expense', color: '#eab308', icon: 'zap', division: 'office', isCustom: false },
  { id: 'water', nameMl: 'വാട്ടർ ബിൽ', nameEn: 'Water Bill', type: 'expense', color: '#06b6d4', icon: 'droplet', division: 'office', isCustom: false },
  { id: 'internet', nameMl: 'ഇന്റർനെറ്റ് & ഫോൺ', nameEn: 'Internet & Phone', type: 'expense', color: '#3b82f6', icon: 'wifi', division: 'office', isCustom: false },
  { id: 'refreshments', nameMl: 'ചായ & ലഘുഭക്ഷണം', nameEn: 'Tea & Snacks', type: 'expense', color: '#f97316', icon: 'coffee', division: 'office', isCustom: false },
  { id: 'stationery', nameMl: 'സ്റ്റേഷനറി & പേപ്പർ', nameEn: 'Stationery & Printing', type: 'expense', color: '#8b5cf6', icon: 'file-text', division: 'office', isCustom: false },
  { id: 'cleaning', nameMl: 'ക്ലീനിംഗ് & ശുചിത്വം', nameEn: 'Cleaning & Sanitation', type: 'expense', color: '#14b8a6', icon: 'sparkles', division: 'office', isCustom: false },
  { id: 'maintenance', nameMl: 'റിപ്പയറിങ് & സർവീസ്', nameEn: 'Repairs & Maintenance', type: 'expense', color: '#64748b', icon: 'wrench', division: 'office', isCustom: false },
  { id: 'travel', nameMl: 'യാത്രാപ്പടി & പെട്രോൾ', nameEn: 'Travel & Conveyance', type: 'expense', color: '#d97706', icon: 'car', division: 'office', isCustom: false },
  { id: 'courier', nameMl: 'കൊറിയർ & തപാൽ', nameEn: 'Courier & Postage', type: 'expense', color: '#0284c7', icon: 'send', division: 'office', isCustom: false },
  { id: 'marketing', nameMl: 'മാർക്കറ്റിംഗ് & പരസ്യം', nameEn: 'Marketing & Ads', type: 'expense', color: '#ec4899', icon: 'megaphone', division: 'office', isCustom: false },
  { id: 'software', nameMl: 'സോഫ്റ്റ്‌വെയർ ടൂളുകൾ', nameEn: 'Software & Tools', type: 'expense', color: '#6366f1', icon: 'cpu', division: 'office', isCustom: false },
  { id: 'taxes', nameMl: 'ടാക്സ് & ലൈസൻസ് ഫീസ്', nameEn: 'Taxes & License Fees', type: 'expense', color: '#dc2626', icon: 'shield', division: 'office', isCustom: false },
  { id: 'advance', nameMl: 'സ്റ്റാഫ് അഡ്വാൻസ്', nameEn: 'Staff Cash Advance', type: 'expense', color: '#a855f7', icon: 'wallet', division: 'office', isCustom: false },
  { id: 'assets', nameMl: 'ഓഫീസ് ഫർണിച്ചർ & ഉപകരണങ്ങൾ', nameEn: 'Office Assets & Equipment', type: 'expense', color: '#059669', icon: 'box', division: 'office', isCustom: false },
  { id: 'misc_exp', nameMl: 'മറ്റ് ഓഫീസ് ചിലവുകൾ', nameEn: 'Other Office Expenses', type: 'expense', color: '#94a3b8', icon: 'more-horizontal', division: 'office', isCustom: false },

  // ================= 1. OFFICE INCOMES =================
  { id: 'client_pay', nameMl: 'ക്ലയന്റ് പേയ്‌മെന്റ്', nameEn: 'Client Payments', type: 'income', color: '#10b981', icon: 'check-circle', division: 'office', isCustom: false },
  { id: 'service_rev', nameMl: 'സർവീസ് ചാർജ് / ഫീസ്', nameEn: 'Service Revenue', type: 'income', color: '#059669', icon: 'briefcase', division: 'office', isCustom: false },
  { id: 'project_adv', nameMl: 'പ്രൊജക്റ്റ് അഡ്വാൻസ്', nameEn: 'Project Advance', type: 'income', color: '#14b8a6', icon: 'layers', division: 'office', isCustom: false },
  { id: 'consulting', nameMl: 'കൺസൾട്ടിംഗ് വരുമാനം', nameEn: 'Consulting Fee', type: 'income', color: '#0d9488', icon: 'user-check', division: 'office', isCustom: false },
  { id: 'sales', nameMl: 'സെയിൽസ് / വിൽപ്പന', nameEn: 'Sales Income', type: 'income', color: '#16a34a', icon: 'shopping-bag', division: 'office', isCustom: false },
  { id: 'refund', nameMl: 'റീഫണ്ട് & റിട്ടേൺ', nameEn: 'Refunds & Returns', type: 'income', color: '#3b82f6', icon: 'rotate-ccw', division: 'office', isCustom: false },
  { id: 'capital', nameMl: 'ക്യാപിറ്റൽ / നിക്ഷേപം', nameEn: 'Capital / Owner Deposit', type: 'income', color: '#8b5cf6', icon: 'piggy-bank', division: 'office', isCustom: false },
  { id: 'misc_inc', nameMl: 'മറ്റ് ഓഫീസ് വരുമാനങ്ങൾ', nameEn: 'Other Office Income', type: 'income', color: '#64748b', icon: 'plus-circle', division: 'office', isCustom: false },

  // ================= 2. SCHOOL EXPENSES =================
  { id: 'school_fees', nameMl: 'സ്കൂൾ / ട്യൂഷൻ ഫീസ്', nameEn: 'School / Tuition Fees', type: 'expense', color: '#ef4444', icon: 'graduation-cap', division: 'school', isCustom: false },
  { id: 'school_books', nameMl: 'പുസ്തകങ്ങൾ & നോട്ട്ബുക്കുകൾ', nameEn: 'Books & Notebooks', type: 'expense', color: '#8b5cf6', icon: 'book-open', division: 'school', isCustom: false },
  { id: 'school_uniform', nameMl: 'യൂണിഫോം & വസ്ത്രങ്ങൾ', nameEn: 'Uniform & Dress', type: 'expense', color: '#f59e0b', icon: 'shirt', division: 'school', isCustom: false },
  { id: 'school_van', nameMl: 'സ്കൂൾ വാൻ / യാത്രാക്കൂലി', nameEn: 'School Bus & Conveyance', type: 'expense', color: '#f97316', icon: 'bus', division: 'school', isCustom: false },
  { id: 'school_coaching', nameMl: 'ട്യൂഷൻ & കോച്ചിംഗ് ഫീസ്', nameEn: 'Tuition & Coaching Fees', type: 'expense', color: '#ec4899', icon: 'edit-3', division: 'school', isCustom: false },
  { id: 'school_exam', nameMl: 'പരീക്ഷാ ഫീസ് & രജിസ്ട്രേഷൻ', nameEn: 'Exam & Registration Fees', type: 'expense', color: '#3b82f6', icon: 'clipboard-list', division: 'school', isCustom: false },
  { id: 'school_project', nameMl: 'പ്രൊജക്റ്റ് & ലാബ് സാധനങ്ങൾ', nameEn: 'Project & Lab Materials', type: 'expense', color: '#06b6d4', icon: 'layers', division: 'school', isCustom: false },
  { id: 'school_sports', nameMl: 'കായിക & വിനോദ ചെലവുകൾ', nameEn: 'Sports & Extra-Curricular', type: 'expense', color: '#10b981', icon: 'award', division: 'school', isCustom: false },
  { id: 'school_canteen', nameMl: 'കാന്റീൻ & ലഘുഭക്ഷണം', nameEn: 'Canteen & Snacks', type: 'expense', color: '#d97706', icon: 'coffee', division: 'school', isCustom: false },
  { id: 'school_misc_exp', nameMl: 'മറ്റ് സ്കൂൾ ചിലവുകൾ', nameEn: 'Other School Expenses', type: 'expense', color: '#94a3b8', icon: 'more-horizontal', division: 'school', isCustom: false },

  // ================= 2. SCHOOL INCOMES =================
  { id: 'school_scholarship', nameMl: 'സ്കോളർഷിപ്പ് & ഗ്രാന്റുകൾ', nameEn: 'Scholarship & Grants', type: 'income', color: '#10b981', icon: 'award', division: 'school', isCustom: false },
  { id: 'school_allowance', nameMl: 'വിദ്യാഭ്യാസ അലവൻസ്', nameEn: 'Education Allowance', type: 'income', color: '#059669', icon: 'wallet', division: 'school', isCustom: false },
  { id: 'school_prize', nameMl: 'മത്സര ക്യാഷ് പ്രൈസ്', nameEn: 'Competition Cash Prize', type: 'income', color: '#14b8a6', icon: 'trophy', division: 'school', isCustom: false },
  { id: 'school_refund', nameMl: 'ഫീസ് റീഫണ്ട് & റിട്ടേൺ', nameEn: 'Fee Refunds & Returns', type: 'income', color: '#3b82f6', icon: 'rotate-ccw', division: 'school', isCustom: false },
  { id: 'school_misc_inc', nameMl: 'മറ്റ് സ്കൂൾ വരുമാനങ്ങൾ', nameEn: 'Other School Income', type: 'income', color: '#64748b', icon: 'plus-circle', division: 'school', isCustom: false },

  // ================= 3. HOME & PERSONAL EXPENSES =================
  { id: 'home_groceries', nameMl: 'പലചരക്ക് & പലവ്യഞ്ജനം', nameEn: 'Groceries & Provisions', type: 'expense', color: '#f43f5e', icon: 'shopping-cart', division: 'home', isCustom: false },
  { id: 'home_vegetables', nameMl: 'പച്ചക്കറി, മീൻ & ഇറച്ചി', nameEn: 'Vegetables, Fish & Meat', type: 'expense', color: '#10b981', icon: 'apple', division: 'home', isCustom: false },
  { id: 'home_rent', nameMl: 'വീട്ടുവാടക & ലോൺ തിരിച്ചടവ്', nameEn: 'House Rent & Loan EMI', type: 'expense', color: '#ef4444', icon: 'home', division: 'home', isCustom: false },
  { id: 'home_utilities', nameMl: 'വീട്ടു കറന്റ് & പാചകവാതകം', nameEn: 'Electricity & Gas Cylinder', type: 'expense', color: '#eab308', icon: 'zap', division: 'home', isCustom: false },
  { id: 'home_milk', nameMl: 'പാലും പത്രവും', nameEn: 'Milk & Newspaper', type: 'expense', color: '#06b6d4', icon: 'droplet', division: 'home', isCustom: false },
  { id: 'home_medical', nameMl: 'മരുന്നുകളും ഡോക്ടർ ചെലവും', nameEn: 'Medicines & Doctor Fees', type: 'expense', color: '#dc2626', icon: 'activity', division: 'home', isCustom: false },
  { id: 'home_clothing', nameMl: 'വസ്ത്രങ്ങളും ഷോപ്പിംഗും', nameEn: 'Clothing & Personal Shopping', type: 'expense', color: '#8b5cf6', icon: 'tag', division: 'home', isCustom: false },
  { id: 'home_repairs', nameMl: 'വീട്ടുപകരണങ്ങൾ & പണി ചെലവ്', nameEn: 'Home Appliances & Repairs', type: 'expense', color: '#64748b', icon: 'tool', division: 'home', isCustom: false },
  { id: 'home_recharge', nameMl: 'മൊബൈൽ & ഡിഷ് ടിവി റീച്ചാർജ്', nameEn: 'Mobile & DTH Recharge', type: 'expense', color: '#3b82f6', icon: 'smartphone', division: 'home', isCustom: false },
  { id: 'home_family', nameMl: 'കുടുംബ ചടങ്ങുകളും യാത്രകളും', nameEn: 'Family Events & Travel', type: 'expense', color: '#ec4899', icon: 'heart', division: 'home', isCustom: false },
  { id: 'home_pocket', nameMl: 'പോക്കറ്റ് മണി & കൈച്ചിലവ്', nameEn: 'Pocket Money & Personal Cash', type: 'expense', color: '#f97316', icon: 'smile', division: 'home', isCustom: false },
  { id: 'home_misc_exp', nameMl: 'മറ്റ് സ്വകാര്യ ചിലവുകൾ', nameEn: 'Other Personal Expenses', type: 'expense', color: '#94a3b8', icon: 'more-horizontal', division: 'home', isCustom: false },

  // ================= 3. HOME & PERSONAL INCOMES =================
  { id: 'home_salary', nameMl: 'മാസശമ്പളം & വേതനം', nameEn: 'Monthly Salary & Wages', type: 'income', color: '#10b981', icon: 'dollar-sign', division: 'home', isCustom: false },
  { id: 'home_business', nameMl: 'ബിസിനസ് & വ്യാപാര വരുമാനം', nameEn: 'Business & Trade Income', type: 'income', color: '#059669', icon: 'briefcase', division: 'home', isCustom: false },
  { id: 'home_rent_rev', nameMl: 'വീട്ടുവാടക ലഭിച്ചത്', nameEn: 'House Rent Received', type: 'income', color: '#14b8a6', icon: 'home', division: 'home', isCustom: false },
  { id: 'home_interest', nameMl: 'ബാങ്ക് പലിശ & നിക്ഷേപ ലാഭം', nameEn: 'Bank Interest & Investment Returns', type: 'income', color: '#8b5cf6', icon: 'trending-up', division: 'home', isCustom: false },
  { id: 'home_gifts', nameMl: 'ബന്ധുക്കൾ / സുഹൃത്തുക്കൾ തന്നത്', nameEn: 'Gifts & Family Financial Support', type: 'income', color: '#ec4899', icon: 'gift', division: 'home', isCustom: false },
  { id: 'home_misc_inc', nameMl: 'മറ്റ് കുടുംബ വരവുകൾ', nameEn: 'Other Family Income', type: 'income', color: '#64748b', icon: 'plus-circle', division: 'home', isCustom: false }
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
    // Seed default categories and ensure new division categories exist
    const categories = await this.getAllCategories();
    const existingIds = new Set(categories.map(c => c.id));
    const tx = this.db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');

    // Add any default category that doesn't exist yet
    for (const cat of DEFAULT_CATEGORIES) {
      if (!existingIds.has(cat.id)) {
        store.put(cat);
      }
    }

    // Ensure all existing categories have division set (default to office)
    for (const cat of categories) {
      if (!cat.division) {
        cat.division = 'office';
        store.put(cat);
      }
    }

    // Seed default divisions
    const savedDivisions = await this.getSetting('divisions');
    if (!savedDivisions || !Array.isArray(savedDivisions) || savedDivisions.length === 0) {
      await this.setSetting('divisions', DEFAULT_DIVISIONS);
    }

    // Ensure PIN system is cleared / disabled
    await this.setSetting('appPin', null);

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

  // --- Divisions ---

  async getDivisions() {
    await this.init();
    const divs = await this.getSetting('divisions');
    if (divs && Array.isArray(divs) && divs.length > 0) return divs;
    return DEFAULT_DIVISIONS;
  }

  async saveDivision(div) {
    const list = await this.getDivisions();
    const idx = list.findIndex(d => d.id === div.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...div };
    } else {
      list.push(div);
    }
    await this.setSetting('divisions', list);
    return list;
  }

  async deleteDivision(divId) {
    const list = await this.getDivisions();
    const filtered = list.filter(d => d.id !== divId);
    await this.setSetting('divisions', filtered);
    return filtered;
  }

  // --- Authorized Users & RBAC Permissions ---

  async getAuthorizedUsers() {
    await this.init();
    const users = await this.getSetting('authorizedUsers');
    if (users && Array.isArray(users) && users.length > 0) return users;
    return DEFAULT_USERS;
  }

  async saveAuthorizedUser(user) {
    const list = await this.getAuthorizedUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    await this.setSetting('authorizedUsers', list);
    return list;
  }

  async deleteAuthorizedUser(userId) {
    const list = await this.getAuthorizedUsers();
    const filtered = list.filter(u => u.id !== userId && !u.isMaster);
    await this.setSetting('authorizedUsers', filtered);
    return filtered;
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

  // --- Backup & Restore & Lifetime Snapshots ---

  async exportBackup() {
    const transactions = await this.getAllTransactions();
    const categories = await this.getAllCategories();
    const contacts = await this.getAllContacts();
    const divisions = await this.getDivisions();
    const authorizedUsers = await this.getAuthorizedUsers();
    const officeProfile = await this.getSetting('officeProfile');
    const language = await this.getSetting('language');
    const theme = await this.getSetting('theme');
    const whatsappGateway = await this.getSetting('whatsappGateway');

    return {
      version: 3,
      appName: 'OfficeFinance',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      contacts,
      divisions,
      authorizedUsers,
      settings: {
        officeProfile,
        language,
        theme,
        whatsappGateway
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

    // Import Divisions
    if (Array.isArray(data.divisions)) {
      await this.setSetting('divisions', data.divisions);
    }

    // Import Authorized Users
    if (Array.isArray(data.authorizedUsers) && data.authorizedUsers.length > 0) {
      await this.setSetting('authorizedUsers', data.authorizedUsers);
    }

    // Import Settings
    if (data.settings) {
      if (data.settings.officeProfile) {
        await this.setSetting('officeProfile', data.settings.officeProfile);
      }
      if (data.settings.language) {
        await this.setSetting('language', data.settings.language);
      }
      if (data.settings.theme) {
        await this.setSetting('theme', data.settings.theme);
      }
      if (data.settings.whatsappGateway) {
        await this.setSetting('whatsappGateway', data.settings.whatsappGateway);
      }
    }

    // Save auto-snapshot right after import
    await this.saveLocalSnapshot();

    return true;
  }

  // Multi-year safety snapshot (saves duplicate copy in localStorage to survive browser cache flushes)
  async saveLocalSnapshot() {
    try {
      const backup = await this.exportBackup();
      const payload = JSON.stringify(backup);
      localStorage.setItem('office_finance_auto_snapshot_v3', payload);
      localStorage.setItem('office_finance_snapshot_time', new Date().toISOString());
    } catch (e) {
      console.warn('Auto snapshot write skipped:', e);
    }
  }

  async restoreLocalSnapshotIfEmpty() {
    try {
      const txs = await this.getAllTransactions();
      if (!txs || txs.length === 0) {
        const raw = localStorage.getItem('office_finance_auto_snapshot_v3') || localStorage.getItem('office_finance_auto_snapshot_v2');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.transactions) && parsed.transactions.length > 0) {
            console.log('Restoring from safe local snapshot...', parsed.transactions.length, 'transactions');
            await this.importBackup(parsed);
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Auto snapshot recovery check error:', e);
    }
    return false;
  }

  async clearAllData() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readwrite');
      tx.objectStore('transactions').clear();
      tx.oncomplete = () => {
        try {
          localStorage.removeItem('office_finance_auto_snapshot_v3');
        } catch (_) {}
        resolve(true);
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

// Global database instance
window.dbEngine = new FinanceDB();
