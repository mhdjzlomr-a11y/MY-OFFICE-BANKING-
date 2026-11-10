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
    this.syncChannel = (typeof BroadcastChannel !== 'undefined')
      ? new BroadcastChannel('office_finance_sync_v1')
      : null;
    this._suppressSyncNotify = false;
  }

  generateSyncId(prefix = 'id') {
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${Date.now()}_${rand}`;
  }

  makeLegacySyncId(prefix, str) {
    let hash = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return `${prefix}_legacy_${Math.abs(hash).toString(36)}_${s.length}`;
  }

  notifyMutation(source = 'local', triggerCloud = true) {
    if (this._suppressSyncNotify) return;
    try {
      if (this.syncChannel) {
        this.syncChannel.postMessage({ type: 'db-updated', source, ts: Date.now() });
      }
      localStorage.setItem('office_finance_tab_ping', String(Date.now()));
    } catch (_) {}

    if (triggerCloud && window.cloudSync && typeof window.cloudSync.markLocalChange === 'function') {
      window.cloudSync.markLocalChange();
    }
  }

  async getDeletedLog() {
    const raw = await this.getSetting('deletedSyncLog', []);
    return Array.isArray(raw) ? raw : [];
  }

  async recordDeletedSyncId(syncId) {
    if (!syncId) return;
    const log = await this.getDeletedLog();
    const now = new Date().toISOString();
    const idx = log.findIndex(entry => entry && entry.syncId === syncId);
    if (idx >= 0) {
      log[idx].deletedAt = now;
    } else {
      log.push({ syncId, deletedAt: now });
    }
    const cutoff = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const pruned = log.filter(entry => entry && entry.syncId && new Date(entry.deletedAt || 0).getTime() > cutoff);
    await this._setSettingRaw('deletedSyncLog', pruned);
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
    const prevSuppress = this._suppressSyncNotify;
    this._suppressSyncNotify = true;
    try {
      const categories = await this.getAllCategories();
      const deletedLog = await this.getDeletedLog();
      const deletedSet = new Set(deletedLog.map(d => d.syncId));
      const existingIds = new Set(categories.map(c => c.id));
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');

      // Add any default category that doesn't exist yet (unless explicitly deleted)
      for (const cat of DEFAULT_CATEGORIES) {
        const sid = cat.syncId || cat.id;
        if (!existingIds.has(cat.id) && !deletedSet.has(sid)) {
          store.put({
            ...cat,
            syncId: sid,
            updatedAt: '2026-01-01T00:00:00.000Z'
          });
        }
      }

      // Ensure all existing categories have division & syncId
      for (const cat of categories) {
        let changed = false;
        if (!cat.division) {
          cat.division = 'office';
          changed = true;
        }
        if (!cat.syncId) {
          cat.syncId = cat.id;
          changed = true;
        }
        if (!cat.updatedAt) {
          cat.updatedAt = '2026-01-01T00:00:00.000Z';
          changed = true;
        }
        if (changed) store.put(cat);
      }

      // Seed default divisions
      const savedDivisions = await this.getSetting('divisions');
      if (!savedDivisions || !Array.isArray(savedDivisions) || savedDivisions.length === 0) {
        await this._setSettingRaw('divisions', DEFAULT_DIVISIONS.map(d => ({
          ...d,
          syncId: d.id,
          updatedAt: '2026-01-01T00:00:00.000Z'
        })));
      }

      // Ensure PIN system is cleared / disabled
      await this._setSettingRaw('appPin', null);

      // Seed default office profile
      const profile = await this.getSetting('officeProfile');
      if (!profile) {
        await this._setSettingRaw('officeProfile', DEFAULT_OFFICE_PROFILE);
      } else if (!profile.name || profile.name.includes('My Office') || profile.name.includes('എന്റെ ഓഫീസ്')) {
        profile.name = 'OFFICE FINANCE TRACKER';
        await this._setSettingRaw('officeProfile', profile);
      }

      const lang = await this.getSetting('language');
      if (!lang) {
        await this._setSettingRaw('language', 'ml');
      }

      const theme = await this.getSetting('theme');
      if (!theme) {
        await this._setSettingRaw('theme', 'light');
      }
    } finally {
      this._suppressSyncNotify = prevSuppress;
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
    const now = new Date().toISOString();
    const syncId = div.syncId || div.id;
    const idx = list.findIndex(d => d.id === div.id || (d.syncId && d.syncId === syncId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...div, syncId, updatedAt: now };
    } else {
      list.push({ ...div, syncId, updatedAt: now });
    }
    await this.setSetting('divisions', list);
    return list;
  }

  async deleteDivision(divId) {
    const list = await this.getDivisions();
    const target = list.find(d => d.id === divId);
    const filtered = list.filter(d => d.id !== divId);
    if (target) {
      await this.recordDeletedSyncId(target.syncId || target.id);
    }
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
    const now = new Date().toISOString();
    const syncId = user.syncId || user.id;
    const idx = list.findIndex(u => u.id === user.id || (u.syncId && u.syncId === syncId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user, syncId, updatedAt: now };
    } else {
      list.push({ ...user, syncId, updatedAt: now });
    }
    await this.setSetting('authorizedUsers', list);
    return list;
  }

  async deleteAuthorizedUser(userId) {
    const list = await this.getAuthorizedUsers();
    const target = list.find(u => u.id === userId && !u.isMaster);
    const filtered = list.filter(u => u.id !== userId || u.isMaster);
    if (target) {
      await this.recordDeletedSyncId(target.syncId || target.id);
    }
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
    const now = new Date().toISOString();
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const data = {
        ...item,
        syncId: item.syncId || this.generateSyncId('tx'),
        amount: parseFloat(item.amount) || 0,
        createdAt: item.createdAt || now,
        updatedAt: now
      };
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('transaction:add');
    return result;
  }

  async updateTransaction(item) {
    await this.init();
    const existing = item.id ? await this.getTransactionById(item.id) : null;
    const now = new Date().toISOString();
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const data = {
        ...existing,
        ...item,
        id: Number(item.id),
        syncId: item.syncId || (existing && existing.syncId) || this.generateSyncId('tx'),
        amount: parseFloat(item.amount) || 0,
        createdAt: item.createdAt || (existing && existing.createdAt) || now,
        updatedAt: now
      };
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('transaction:update');
    return result;
  }

  async deleteTransaction(id) {
    await this.init();
    const existing = await this.getTransactionById(id);
    if (existing) {
      const sid = existing.syncId || this.makeLegacySyncId('tx', `${existing.createdAt}|${existing.date}|${existing.type}|${existing.amount}|${existing.party || ''}`);
      await this.recordDeletedSyncId(sid);
    }
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('transaction:delete');
    return result;
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
    const now = new Date().toISOString();
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const id = cat.id || 'cat_' + Date.now();
      const item = {
        ...cat,
        id,
        syncId: cat.syncId || id,
        updatedAt: now,
        isCustom: true
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('category:add');
    return result;
  }

  async updateCategory(cat) {
    await this.init();
    const now = new Date().toISOString();
    const item = {
      ...cat,
      syncId: cat.syncId || cat.id,
      updatedAt: now
    };
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('category:update');
    return result;
  }

  async deleteCategory(id) {
    await this.init();
    await this.recordDeletedSyncId(id);
    const result = await new Promise((resolve, reject) => {
      const tx = this.db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
    this.notifyMutation('category:delete');
    return result;
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
    const now = new Date().toISOString();
    const entry = {
      ...contact,
      syncId: contact.syncId || this.generateSyncId('ct'),
      createdAt: contact.createdAt || now,
      updatedAt: now
    };
    let resId;
    if (this.db.objectStoreNames.contains('contacts')) {
      resId = await new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.add(entry);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      const list = (await this.getSetting('savedContactsList', [])) || [];
      entry.id = Date.now();
      list.push(entry);
      await this._setSettingRaw('savedContactsList', list);
      resId = entry.id;
    }
    this.notifyMutation('contact:add');
    return resId;
  }

  async updateContact(contact) {
    await this.init();
    const now = new Date().toISOString();
    const all = await this.getAllContacts();
    const existing = all.find(c => Number(c.id) === Number(contact.id));
    const entry = {
      ...existing,
      ...contact,
      id: Number(contact.id),
      syncId: contact.syncId || (existing && existing.syncId) || this.generateSyncId('ct'),
      createdAt: contact.createdAt || (existing && existing.createdAt) || now,
      updatedAt: now
    };
    let resId;
    if (this.db.objectStoreNames.contains('contacts')) {
      resId = await new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.put(entry);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } else {
      let list = (await this.getSetting('savedContactsList', [])) || [];
      list = list.map(c => c.id === entry.id ? entry : c);
      await this._setSettingRaw('savedContactsList', list);
      resId = entry.id;
    }
    this.notifyMutation('contact:update');
    return resId;
  }

  async deleteContact(id) {
    await this.init();
    const numId = Number(id);
    const all = await this.getAllContacts();
    const existing = all.find(c => Number(c.id) === numId);
    if (existing) {
      const sid = existing.syncId || this.makeLegacySyncId('ct', `${existing.name || ''}|${existing.phone || ''}`);
      await this.recordDeletedSyncId(sid);
    }
    if (this.db.objectStoreNames.contains('contacts')) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.delete(numId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      let list = (await this.getSetting('savedContactsList', [])) || [];
      list = list.filter(c => c.id !== numId);
      await this._setSettingRaw('savedContactsList', list);
    }
    this.notifyMutation('contact:delete');
    return true;
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

  async _setSettingRaw(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve(value);
      req.onerror = () => reject(req.error);
    });
  }

  async setSetting(key, value) {
    await this._setSettingRaw(key, value);
    const syncedKeys = new Set([
      'officeProfile',
      'whatsappGateway',
      'divisions',
      'authorizedUsers',
      'activeDivision',
      'appLanguage',
      'language',
      'theme'
    ]);
    if (syncedKeys.has(key) && !this._suppressSyncNotify) {
      await this._setSettingRaw('settingsUpdatedAt', new Date().toISOString());
      this.notifyMutation(`setting:${key}`);
    }
    return value;
  }

  // --- Cloud Sync Normalization & Conflict-Free Merge ---

  async ensureAllSyncIds() {
    await this.init();
    const prevSuppress = this._suppressSyncNotify;
    this._suppressSyncNotify = true;
    try {
      // Backfill transactions
      const txs = await this.getAllTransactions();
      const txWrites = txs.filter(t => !t.syncId || !t.updatedAt);
      if (txWrites.length > 0) {
        await new Promise((resolve, reject) => {
          const idbTx = this.db.transaction('transactions', 'readwrite');
          const store = idbTx.objectStore('transactions');
          for (const t of txWrites) {
            if (!t.syncId) {
              t.syncId = this.makeLegacySyncId('tx', `${t.createdAt || ''}|${t.date || ''}|${t.type || ''}|${t.amount || 0}|${t.party || ''}|${t.billNo || ''}`);
            }
            if (!t.updatedAt) {
              t.updatedAt = t.createdAt || new Date().toISOString();
            }
            store.put(t);
          }
          idbTx.oncomplete = () => resolve(true);
          idbTx.onerror = () => reject(idbTx.error);
        });
      }

      // Backfill contacts
      if (this.db.objectStoreNames.contains('contacts')) {
        const contacts = await this.getAllContacts();
        const ctWrites = contacts.filter(c => !c.syncId || !c.updatedAt);
        if (ctWrites.length > 0) {
          await new Promise((resolve, reject) => {
            const idbTx = this.db.transaction('contacts', 'readwrite');
            const store = idbTx.objectStore('contacts');
            for (const c of ctWrites) {
              if (!c.syncId) {
                c.syncId = this.makeLegacySyncId('ct', `${c.name || ''}|${c.phone || ''}|${c.type || ''}`);
              }
              if (!c.updatedAt) {
                c.updatedAt = c.createdAt || new Date().toISOString();
              }
              store.put(c);
            }
            idbTx.oncomplete = () => resolve(true);
            idbTx.onerror = () => reject(idbTx.error);
          });
        }
      }
    } finally {
      this._suppressSyncNotify = prevSuppress;
    }
  }

  async exportCloudVault() {
    await this.ensureAllSyncIds();
    const transactions = await this.getAllTransactions();
    const categories = await this.getAllCategories();
    const contacts = await this.getAllContacts();
    const divisions = await this.getDivisions();
    const authorizedUsers = await this.getAuthorizedUsers();
    const deletedLog = await this.getDeletedLog();
    const officeProfile = await this.getSetting('officeProfile');
    const appLanguage = await this.getSetting('appLanguage');
    const language = await this.getSetting('language');
    const theme = await this.getSetting('theme');
    const whatsappGateway = await this.getSetting('whatsappGateway');
    const settingsUpdatedAt = await this.getSetting('settingsUpdatedAt', '2026-01-01T00:00:00.000Z');

    return {
      appName: 'OfficeFinanceCloud',
      version: 4,
      exportedAt: new Date().toISOString(),
      settingsUpdatedAt,
      transactions,
      categories: categories.map(c => ({ ...c, syncId: c.syncId || c.id, updatedAt: c.updatedAt || '2026-01-01T00:00:00.000Z' })),
      contacts,
      divisions: divisions.map(d => ({ ...d, syncId: d.syncId || d.id, updatedAt: d.updatedAt || '2026-01-01T00:00:00.000Z' })),
      authorizedUsers: authorizedUsers.map(u => ({ ...u, syncId: u.syncId || u.id, updatedAt: u.updatedAt || '2026-01-01T00:00:00.000Z' })),
      deletedLog,
      settings: {
        officeProfile,
        appLanguage,
        language,
        theme,
        whatsappGateway
      }
    };
  }

  async mergeCloudVault(remoteVault) {
    if (!remoteVault || (remoteVault.appName !== 'OfficeFinanceCloud' && remoteVault.appName !== 'OfficeFinance')) {
      return { changed: false };
    }

    await this.init();
    await this.ensureAllSyncIds();

    const prevSuppress = this._suppressSyncNotify;
    this._suppressSyncNotify = true;
    let changed = false;

    try {
      // 1. Merge deletedLog
      const localDelLog = await this.getDeletedLog();
      const delMap = {};
      const ingestDel = (arr) => {
        if (!Array.isArray(arr)) return;
        for (const d of arr) {
          if (!d || !d.syncId) continue;
          const ts = new Date(d.deletedAt || 0).getTime();
          if (!delMap[d.syncId] || delMap[d.syncId] < ts) {
            delMap[d.syncId] = ts;
          }
        }
      };
      ingestDel(localDelLog);
      ingestDel(remoteVault.deletedLog);

      const cutoff = Date.now() - (180 * 24 * 60 * 60 * 1000);
      const mergedDelLog = Object.keys(delMap)
        .filter(sid => delMap[sid] > cutoff)
        .map(sid => ({ syncId: sid, deletedAt: new Date(delMap[sid]).toISOString() }));
      await this._setSettingRaw('deletedSyncLog', mergedDelLog);

      // 2. Merge Transactions by syncId (never collide local autoIncrement IDs)
      const localTxs = await this.getAllTransactions();
      const localTxBySid = new Map();
      for (const lt of localTxs) {
        if (lt.syncId) localTxBySid.set(lt.syncId, lt);
      }

      const txToPut = [];
      const txToDeleteIds = [];

      // Delete any local tx superseded by tombstone
      for (const lt of localTxs) {
        const sid = lt.syncId;
        const lts = new Date(lt.updatedAt || lt.createdAt || 0).getTime();
        if (sid && delMap[sid] && delMap[sid] >= lts) {
          txToDeleteIds.push(Number(lt.id));
          localTxBySid.delete(sid);
          changed = true;
        }
      }

      if (Array.isArray(remoteVault.transactions)) {
        for (const rt of remoteVault.transactions) {
          if (!rt) continue;
          const sid = rt.syncId || this.makeLegacySyncId('tx', `${rt.createdAt || ''}|${rt.date || ''}|${rt.type || ''}|${rt.amount || 0}|${rt.party || ''}|${rt.billNo || ''}`);
          const rts = new Date(rt.updatedAt || rt.createdAt || 0).getTime();
          if (delMap[sid] && delMap[sid] >= rts) continue;

          const existingLocal = localTxBySid.get(sid);
          if (!existingLocal) {
            const { id: _ignoreId, ...cleanRemote } = rt;
            cleanRemote.syncId = sid;
            cleanRemote.amount = parseFloat(cleanRemote.amount) || 0;
            cleanRemote.updatedAt = cleanRemote.updatedAt || cleanRemote.createdAt || new Date().toISOString();
            txToPut.push(cleanRemote);
            localTxBySid.set(sid, cleanRemote);
            changed = true;
          } else {
            const lts = new Date(existingLocal.updatedAt || existingLocal.createdAt || 0).getTime();
            if (rts > lts) {
              const mergedItem = {
                ...rt,
                id: Number(existingLocal.id),
                syncId: sid,
                amount: parseFloat(rt.amount) || 0
              };
              txToPut.push(mergedItem);
              localTxBySid.set(sid, mergedItem);
              changed = true;
            }
          }
        }
      }

      if (txToPut.length > 0 || txToDeleteIds.length > 0) {
        await new Promise((resolve, reject) => {
          const idbTx = this.db.transaction('transactions', 'readwrite');
          const store = idbTx.objectStore('transactions');
          for (const did of txToDeleteIds) store.delete(did);
          for (const item of txToPut) store.put(item);
          idbTx.oncomplete = () => resolve(true);
          idbTx.onerror = () => reject(idbTx.error);
        });
      }

      // 3. Merge Contacts by syncId
      if (this.db.objectStoreNames.contains('contacts')) {
        const localContacts = await this.getAllContacts();
        const localCtBySid = new Map();
        for (const lc of localContacts) {
          if (lc.syncId) localCtBySid.set(lc.syncId, lc);
        }

        const ctToPut = [];
        const ctToDeleteIds = [];

        for (const lc of localContacts) {
          const sid = lc.syncId;
          const lts = new Date(lc.updatedAt || lc.createdAt || 0).getTime();
          if (sid && delMap[sid] && delMap[sid] >= lts) {
            ctToDeleteIds.push(Number(lc.id));
            localCtBySid.delete(sid);
            changed = true;
          }
        }

        if (Array.isArray(remoteVault.contacts)) {
          for (const rc of remoteVault.contacts) {
            if (!rc || !rc.name) continue;
            const sid = rc.syncId || this.makeLegacySyncId('ct', `${rc.name || ''}|${rc.phone || ''}|${rc.type || ''}`);
            const rts = new Date(rc.updatedAt || rc.createdAt || 0).getTime();
            if (delMap[sid] && delMap[sid] >= rts) continue;

            const existingLocal = localCtBySid.get(sid);
            if (!existingLocal) {
              const { id: _ignoreId, ...cleanRemote } = rc;
              cleanRemote.syncId = sid;
              cleanRemote.updatedAt = cleanRemote.updatedAt || cleanRemote.createdAt || new Date().toISOString();
              ctToPut.push(cleanRemote);
              localCtBySid.set(sid, cleanRemote);
              changed = true;
            } else {
              const lts = new Date(existingLocal.updatedAt || existingLocal.createdAt || 0).getTime();
              if (rts > lts) {
                const mergedCt = { ...rc, id: Number(existingLocal.id), syncId: sid };
                ctToPut.push(mergedCt);
                localCtBySid.set(sid, mergedCt);
                changed = true;
              }
            }
          }
        }

        if (ctToPut.length > 0 || ctToDeleteIds.length > 0) {
          await new Promise((resolve, reject) => {
            const idbTx = this.db.transaction('contacts', 'readwrite');
            const store = idbTx.objectStore('contacts');
            for (const did of ctToDeleteIds) store.delete(did);
            for (const item of ctToPut) store.put(item);
            idbTx.oncomplete = () => resolve(true);
            idbTx.onerror = () => reject(idbTx.error);
          });
        }
      }

      // 4. Merge Categories
      const localCats = await this.getAllCategories();
      const localCatMap = new Map(localCats.map(c => [c.id, c]));
      const catToPut = [];
      const catToDeleteIds = [];

      for (const lc of localCats) {
        const sid = lc.syncId || lc.id;
        const lts = new Date(lc.updatedAt || '2026-01-01T00:00:00.000Z').getTime();
        if (delMap[sid] && delMap[sid] >= lts) {
          catToDeleteIds.push(lc.id);
          changed = true;
        }
      }

      if (Array.isArray(remoteVault.categories)) {
        for (const rc of remoteVault.categories) {
          if (!rc || !rc.id) continue;
          const sid = rc.syncId || rc.id;
          const rts = new Date(rc.updatedAt || '2026-01-01T00:00:00.000Z').getTime();
          if (delMap[sid] && delMap[sid] >= rts) continue;

          const existingLocal = localCatMap.get(rc.id);
          if (!existingLocal) {
            catToPut.push({ ...rc, syncId: sid });
            changed = true;
          } else {
            const lts = new Date(existingLocal.updatedAt || '2026-01-01T00:00:00.000Z').getTime();
            if (rts > lts) {
              catToPut.push({ ...rc, syncId: sid });
              changed = true;
            }
          }
        }
      }

      if (catToPut.length > 0 || catToDeleteIds.length > 0) {
        await new Promise((resolve, reject) => {
          const idbTx = this.db.transaction('categories', 'readwrite');
          const store = idbTx.objectStore('categories');
          for (const did of catToDeleteIds) store.delete(did);
          for (const item of catToPut) store.put(item);
          idbTx.oncomplete = () => resolve(true);
          idbTx.onerror = () => reject(idbTx.error);
        });
      }

      // 5. Merge Divisions & Authorized Users
      const mergeSettingArray = (localArr, remoteArr) => {
        const map = new Map();
        let arrChanged = false;
        const ingest = (arr, isRemote) => {
          if (!Array.isArray(arr)) return;
          for (const item of arr) {
            if (!item || !item.id) continue;
            const sid = item.syncId || item.id;
            const ts = new Date(item.updatedAt || '2026-01-01T00:00:00.000Z').getTime();
            if (delMap[sid] && delMap[sid] >= ts) {
              if (!isRemote && map.has(sid)) arrChanged = true;
              continue;
            }
            const cur = map.get(sid);
            if (!cur) {
              map.set(sid, { ...item, syncId: sid });
              if (isRemote) arrChanged = true;
            } else {
              const curTs = new Date(cur.updatedAt || '2026-01-01T00:00:00.000Z').getTime();
              if (ts > curTs) {
                map.set(sid, { ...item, syncId: sid });
                arrChanged = true;
              }
            }
          }
        };
        ingest(localArr, false);
        ingest(remoteArr, true);
        return { list: Array.from(map.values()), arrChanged };
      };

      if (Array.isArray(remoteVault.divisions)) {
        const localDivs = await this.getDivisions();
        const resDivs = mergeSettingArray(localDivs, remoteVault.divisions);
        if (resDivs.list.length > 0 && (resDivs.arrChanged || resDivs.list.length !== localDivs.length)) {
          await this._setSettingRaw('divisions', resDivs.list);
          changed = true;
        }
      }

      if (Array.isArray(remoteVault.authorizedUsers)) {
        const localUsers = await this.getAuthorizedUsers();
        const resUsers = mergeSettingArray(localUsers, remoteVault.authorizedUsers);
        if (resUsers.list.length > 0 && (resUsers.arrChanged || resUsers.list.length !== localUsers.length)) {
          await this._setSettingRaw('authorizedUsers', resUsers.list);
          changed = true;
        }
      }

      // 6. Merge Settings
      if (remoteVault.settings) {
        const localSettingsTs = new Date(await this.getSetting('settingsUpdatedAt', '2026-01-01T00:00:00.000Z')).getTime();
        const remoteSettingsTs = new Date(remoteVault.settingsUpdatedAt || 0).getTime();
        if (remoteSettingsTs > localSettingsTs) {
          const s = remoteVault.settings;
          if (s.officeProfile) await this._setSettingRaw('officeProfile', s.officeProfile);
          if (s.whatsappGateway) await this._setSettingRaw('whatsappGateway', s.whatsappGateway);
          if (s.appLanguage) await this._setSettingRaw('appLanguage', s.appLanguage);
          if (s.language) await this._setSettingRaw('language', s.language);
          if (s.theme) await this._setSettingRaw('theme', s.theme);
          await this._setSettingRaw('settingsUpdatedAt', remoteVault.settingsUpdatedAt);
          changed = true;
        }
      }

      if (changed) {
        await this.saveLocalSnapshot();
      }
    } finally {
      this._suppressSyncNotify = prevSuppress;
    }

    if (changed) {
      this.notifyMutation('cloud-merge', false);
    }

    return { changed };
  }

  // --- Backup & Restore & Lifetime Snapshots ---

  async exportBackup() {
    await this.ensureAllSyncIds();
    const transactions = await this.getAllTransactions();
    const categories = await this.getAllCategories();
    const contacts = await this.getAllContacts();
    const divisions = await this.getDivisions();
    const authorizedUsers = await this.getAuthorizedUsers();
    const officeProfile = await this.getSetting('officeProfile');
    const language = await this.getSetting('language');
    const appLanguage = await this.getSetting('appLanguage');
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
        appLanguage,
        theme,
        whatsappGateway
      }
    };
  }

  async importBackup(data) {
    if (!data || !data.appName || (data.appName !== 'OfficeFinance' && data.appName !== 'OfficeFinanceCloud')) {
      throw new Error('Invalid backup file. Please select a valid Office Finance backup JSON.');
    }

    await this.init();
    const prevSuppress = this._suppressSyncNotify;
    this._suppressSyncNotify = true;

    try {
      // Import Categories
      if (Array.isArray(data.categories)) {
        const txCat = this.db.transaction('categories', 'readwrite');
        const storeCat = txCat.objectStore('categories');
        for (const cat of data.categories) {
          storeCat.put({ ...cat, syncId: cat.syncId || cat.id, updatedAt: cat.updatedAt || new Date().toISOString() });
        }
      }

      // Import Transactions (deduplicated by syncId or signature)
      if (Array.isArray(data.transactions)) {
        const existingTxs = await this.getAllTransactions();
        const existingBySid = new Map();
        for (const et of existingTxs) {
          const sid = et.syncId || this.makeLegacySyncId('tx', `${et.createdAt || ''}|${et.date || ''}|${et.type || ''}|${et.amount || 0}|${et.party || ''}|${et.billNo || ''}`);
          existingBySid.set(sid, et);
        }
        const txT = this.db.transaction('transactions', 'readwrite');
        const storeT = txT.objectStore('transactions');
        for (const item of data.transactions) {
          const sid = item.syncId || this.makeLegacySyncId('tx', `${item.createdAt || ''}|${item.date || ''}|${item.type || ''}|${item.amount || 0}|${item.party || ''}|${item.billNo || ''}`);
          const match = existingBySid.get(sid);
          if (match) {
            storeT.put({ ...item, id: Number(match.id), syncId: sid });
          } else {
            const { id: _dropId, ...clean } = item;
            storeT.add({ ...clean, syncId: sid, updatedAt: clean.updatedAt || new Date().toISOString() });
          }
        }
      }

      // Import Contacts (deduplicated by syncId/name+phone)
      if (Array.isArray(data.contacts)) {
        const existingCts = await this.getAllContacts();
        const existingBySid = new Map();
        for (const ec of existingCts) {
          const sid = ec.syncId || this.makeLegacySyncId('ct', `${ec.name || ''}|${ec.phone || ''}|${ec.type || ''}`);
          existingBySid.set(sid, ec);
        }
        for (const contact of data.contacts) {
          if (contact && contact.name) {
            const sid = contact.syncId || this.makeLegacySyncId('ct', `${contact.name || ''}|${contact.phone || ''}|${contact.type || ''}`);
            const match = existingBySid.get(sid);
            if (match) {
              await this.updateContact({ ...contact, id: match.id, syncId: sid });
            } else {
              const { id: _dropId, ...clean } = contact;
              await this.addContact({ ...clean, syncId: sid });
            }
          }
        }
      }

      // Import Divisions
      if (Array.isArray(data.divisions)) {
        await this._setSettingRaw('divisions', data.divisions);
      }

      // Import Authorized Users
      if (Array.isArray(data.authorizedUsers) && data.authorizedUsers.length > 0) {
        await this._setSettingRaw('authorizedUsers', data.authorizedUsers);
      }

      // Import Settings
      if (data.settings) {
        if (data.settings.officeProfile) {
          await this._setSettingRaw('officeProfile', data.settings.officeProfile);
        }
        if (data.settings.language) {
          await this._setSettingRaw('language', data.settings.language);
        }
        if (data.settings.appLanguage) {
          await this._setSettingRaw('appLanguage', data.settings.appLanguage);
        }
        if (data.settings.theme) {
          await this._setSettingRaw('theme', data.settings.theme);
        }
        if (data.settings.whatsappGateway) {
          await this._setSettingRaw('whatsappGateway', data.settings.whatsappGateway);
        }
      }

      // Save auto-snapshot right after import
      await this.saveLocalSnapshot();
    } finally {
      this._suppressSyncNotify = prevSuppress;
    }

    this.notifyMutation('backup:import');
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
    const existing = await this.getAllTransactions();
    for (const item of existing) {
      const sid = item.syncId || this.makeLegacySyncId('tx', `${item.createdAt || ''}|${item.date || ''}|${item.type || ''}|${item.amount || 0}|${item.party || ''}`);
      await this.recordDeletedSyncId(sid);
    }
    await new Promise((resolve, reject) => {
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
    this.notifyMutation('transactions:clearAll');
    return true;
  }
}

// Global database instance
window.dbEngine = new FinanceDB();
