/**
 * cloud.js - Cross-Device Gmail Cloud Sync Engine
 * Supports:
 *   1. Personal Gmail Google Drive + Google Sheets Sync (via Google Apps Script - 100% Free Forever)
 *   2. Optional Firebase + Google Sign-In Real-Time Sync (Firestore Spark Plan - Free)
 */

class CloudSyncEngine {
  constructor() {
    this.config = {
      provider: 'none', // 'none' | 'apps_script' | 'firebase'
      gmail: '',
      scriptUrl: '',
      syncKey: '',
      firebaseConfig: null,
      autoSync: true,
      lastSyncAt: null,
      pendingPush: false
    };

    this.state = 'off'; // 'off' | 'syncing' | 'synced' | 'pending' | 'error'
    this.lastError = '';
    this.isSyncing = false;
    this.pushTimer = null;
    this.pollTimer = null;
    this.onUpdateCallback = null;

    // Firebase runtime refs
    this._fbInitialized = false;
    this._fbApp = null;
    this._fbAuth = null;
    this._fbDb = null;
    this._fbUser = null;
    this._fbUnsubMeta = null;
    this._fbUnsubTx = null;
  }

  utf8ToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  base64UrlToUtf8(b64u) {
    let b64 = String(b64u || '').replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  async init(onUpdateCallback) {
    this.onUpdateCallback = onUpdateCallback;

    // 1. Load saved config from IndexedDB / localStorage mirror
    let saved = await window.dbEngine.getSetting('cloudSyncConfig', null);
    if (!saved) {
      try {
        const rawLs = localStorage.getItem('office_finance_cloud_cfg');
        if (rawLs) saved = JSON.parse(rawLs);
      } catch (_) {}
    }

    if (saved && typeof saved === 'object') {
      this.config = { ...this.config, ...saved };
    }

    // 2. Check optional repo-level cloud config or cross-app shared Firebase config
    if (this.config.provider === 'none' && window.OFFICE_FINANCE_CLOUD_CONFIG) {
      this.config = { ...this.config, ...window.OFFICE_FINANCE_CLOUD_CONFIG };
      await this.saveConfig();
    } else if (this.config.provider === 'none') {
      try {
        const sharedFb = localStorage.getItem('shared_firebase_config_v1');
        if (sharedFb) {
          const parsedFb = JSON.parse(sharedFb);
          if (parsedFb && parsedFb.apiKey && parsedFb.projectId) {
            this.config.firebaseConfig = parsedFb;
          }
        }
      } catch (_) {}
    }

    // 3. Check Magic Device Connect Link (?cloudSync=...)
    let linkedFromUrl = false;
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('cloudSync');
      if (token) {
        const decoded = JSON.parse(this.base64UrlToUtf8(token));
        if (decoded && (decoded.provider === 'apps_script' || decoded.provider === 'firebase')) {
          this.config = {
            ...this.config,
            ...decoded,
            autoSync: true,
            pendingPush: false
          };
          await this.saveConfig();
          linkedFromUrl = true;

          // Clean URL bar so credentials do not linger in browser history UI
          params.delete('cloudSync');
          const cleanQs = params.toString();
          const newUrl = window.location.pathname + (cleanQs ? '?' + cleanQs : '') + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    } catch (err) {
      console.warn('Invalid cloudSync magic link:', err);
    }

    // 4. Setup lifecycle listeners
    window.addEventListener('online', () => {
      if (this.isConfigured()) {
        this.syncNow(true);
      }
    });

    window.addEventListener('offline', () => {
      if (this.isConfigured()) {
        this.setState(this.config.pendingPush ? 'pending' : 'error', 'Offline');
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConfigured() && navigator.onLine) {
        this.syncNow(false);
      }
    });

    window.addEventListener('focus', () => {
      if (this.isConfigured() && navigator.onLine) {
        this.syncNow(false);
      }
    });

    // 5. Start active provider
    await this.activateProvider(linkedFromUrl);
    return { linkedFromUrl };
  }

  isConfigured() {
    if (this.config.provider === 'apps_script') {
      return Boolean(this.config.scriptUrl && this.config.gmail);
    }
    if (this.config.provider === 'firebase') {
      return Boolean(this.config.firebaseConfig && this.config.firebaseConfig.apiKey && this.config.firebaseConfig.projectId);
    }
    return false;
  }

  async saveConfig() {
    await window.dbEngine._setSettingRaw('cloudSyncConfig', this.config);
    try {
      localStorage.setItem('office_finance_cloud_cfg', JSON.stringify(this.config));
      if (this.config.firebaseConfig && this.config.firebaseConfig.apiKey && this.config.firebaseConfig.projectId) {
        localStorage.setItem('shared_firebase_config_v1', JSON.stringify(this.config.firebaseConfig));
      }
    } catch (_) {}
  }

  parseFlexibleFirebaseConfig(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch (_) {}
    // Support JS snippet copied from Firebase Console (e.g. `const firebaseConfig = { apiKey: "...", ... };`)
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start >= 0 && end > start) {
      let body = s.slice(start, end + 1);
      // Remove line comments
      body = body.replace(/\/\/.*$/gm, '');
      // Quote unquoted keys safely (outside strings)
      body = body.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      // Convert single-quoted values to double-quoted
      body = body.replace(/:\s*'([^']*)'/g, ': "$1"');
      // Remove trailing commas before }
      body = body.replace(/,\s*}/g, '}');
      try {
        return JSON.parse(body);
      } catch (_) {}
    }
    throw new Error('Could not parse Firebase config. Please paste the firebaseConfig { apiKey, authDomain, projectId, ... } block.');
  }

  setState(state, errMsg = '') {
    this.state = state;
    this.lastError = errMsg || '';
    if (this.onUpdateCallback) {
      this.onUpdateCallback({ state: this.state, error: this.lastError, changed: false });
    }
  }

  async activateProvider(forceNotify = false) {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.config.provider === 'apps_script' && this.isConfigured()) {
      this.setState(this.config.pendingPush ? 'pending' : 'synced');
      if (navigator.onLine) {
        await this.syncNow(forceNotify);
      }
      // Background auto-sync every 20 seconds while tab is visible
      this.pollTimer = setInterval(() => {
        if (document.visibilityState === 'visible' && navigator.onLine && this.config.autoSync !== false) {
          this.syncNow(false);
        }
      }, 20000);
    } else if (this.config.provider === 'firebase' && this.isConfigured()) {
      await this.initFirebaseRuntime();
    } else {
      this.setState('off');
    }
  }

  markLocalChange() {
    if (!this.isConfigured()) return;
    this.config.pendingPush = true;
    this.saveConfig();
    this.setState('pending');

    if (this.config.autoSync === false) return;

    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      if (navigator.onLine) {
        this.syncNow(false);
      }
    }, 900);
  }

  async syncNow(showToastOnComplete = false) {
    if (!this.isConfigured()) {
      this.setState('off');
      return { ok: false, error: 'Not configured' };
    }
    if (!navigator.onLine) {
      this.setState(this.config.pendingPush ? 'pending' : 'error', 'Offline');
      return { ok: false, error: 'Offline' };
    }
    if (this.isSyncing) {
      return { ok: true, skipped: true };
    }

    if (this.config.provider === 'apps_script') {
      return await this.syncAppsScript(showToastOnComplete);
    }
    if (this.config.provider === 'firebase') {
      return await this.syncFirebaseNow(showToastOnComplete);
    }
    return { ok: false };
  }

  // ================= PROVIDER 1: GMAIL GOOGLE DRIVE (APPS SCRIPT) =================

  async syncAppsScript(showToast = false) {
    this.isSyncing = true;
    this.setState('syncing');

    try {
      const url = this.config.scriptUrl.trim();
      const gmail = this.config.gmail.trim().toLowerCase();
      const key = (this.config.syncKey || '').trim();

      let changed = false;

      if (this.config.pendingPush) {
        // Export local vault & send POST merge to Google Drive
        const localVault = await window.dbEngine.exportCloudVault();
        const res = await fetch(url, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ gmail, key, data: localVault })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.ok) {
          throw new Error((json && json.error) || 'Sync rejected');
        }
        if (json.data) {
          const mergeRes = await window.dbEngine.mergeCloudVault(json.data);
          changed = mergeRes.changed;
        }
        this.config.pendingPush = false;
      } else {
        // Pull latest vault from Google Drive
        const pullUrl = `${url}${url.includes('?') ? '&' : '?'}action=pull&gmail=${encodeURIComponent(gmail)}&key=${encodeURIComponent(key)}&t=${Date.now()}`;
        const res = await fetch(pullUrl, {
          method: 'GET',
          redirect: 'follow'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.ok) {
          throw new Error((json && json.error) || 'Pull failed');
        }

        const remoteVault = json.data || {};
        const localVault = await window.dbEngine.exportCloudVault();
        const mergeRes = await window.dbEngine.mergeCloudVault(remoteVault);
        changed = mergeRes.changed;

        // Check if local had items not yet on server (first connect or unpushed local edits)
        const remoteSidSet = new Set([
          ...(remoteVault.transactions || []).map(t => t.syncId || String(t.id)),
          ...(remoteVault.contacts || []).map(c => c.syncId || String(c.id))
        ]);
        const hasLocalOnlyData =
          (localVault.transactions || []).some(t => !remoteSidSet.has(t.syncId)) ||
          (localVault.contacts || []).some(c => !remoteSidSet.has(c.syncId)) ||
          (!remoteVault.updatedAt || remoteVault.updatedAt.startsWith('1970'));

        if (hasLocalOnlyData) {
          const updatedLocal = await window.dbEngine.exportCloudVault();
          const pushRes = await fetch(url, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ gmail, key, data: updatedLocal })
          });
          if (pushRes.ok) {
            const pJson = await pushRes.json();
            if (pJson && pJson.ok && pJson.data) {
              const m2 = await window.dbEngine.mergeCloudVault(pJson.data);
              changed = changed || m2.changed;
            }
          }
        }
      }

      this.config.lastSyncAt = new Date().toISOString();
      await this.saveConfig();
      this.state = 'synced';
      this.lastError = '';

      if (this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed, showToast });
      }
      return { ok: true, changed };
    } catch (err) {
      console.warn('Gmail Drive Sync error:', err);
      this.setState('error', err.message || 'Sync error');
      return { ok: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async testAndConnectAppsScript(gmail, scriptUrl, syncKey) {
    const cleanGmail = String(gmail || '').trim().toLowerCase();
    const cleanUrl = String(scriptUrl || '').trim();
    const cleanKey = String(syncKey || '').trim();

    if (!cleanGmail || !cleanGmail.includes('@')) {
      throw new Error(window.i18n?.currentLang === 'ml' ? 'ദയവായി സാധുവായ ഒരു Gmail നൽകുക.' : 'Please enter a valid Gmail address.');
    }
    if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/')) {
      throw new Error(window.i18n?.currentLang === 'ml'
        ? 'സാധുവായ Google Apps Script Web App URL നൽകുക (https://script.google.com/.../exec).'
        : 'Please enter a valid Google Apps Script Web App URL (https://script.google.com/.../exec).');
    }

    const pingUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping&gmail=${encodeURIComponent(cleanGmail)}&key=${encodeURIComponent(cleanKey)}&t=${Date.now()}`;
    const res = await fetch(pingUrl, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
    const json = await res.json();
    if (!json || !json.ok) {
      throw new Error((json && json.error) || 'Authorization mismatch (check Gmail & Sync PIN)');
    }

    this.config = {
      ...this.config,
      provider: 'apps_script',
      gmail: cleanGmail,
      scriptUrl: cleanUrl,
      syncKey: cleanKey,
      autoSync: true,
      pendingPush: true
    };
    await this.saveConfig();
    await this.activateProvider(true);
    return true;
  }

  buildMagicSyncLink() {
    if (!this.isConfigured()) return '';
    let payload = null;
    if (this.config.provider === 'apps_script') {
      payload = {
        provider: 'apps_script',
        gmail: this.config.gmail,
        scriptUrl: this.config.scriptUrl,
        syncKey: this.config.syncKey
      };
    } else if (this.config.provider === 'firebase') {
      payload = {
        provider: 'firebase',
        gmail: this.config.gmail || '',
        firebaseConfig: this.config.firebaseConfig
      };
    }
    if (!payload) return '';
    const token = this.utf8ToBase64Url(JSON.stringify(payload));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?cloudSync=${token}`;
  }

  generateAppsScriptCode(gmail = '', syncKey = '123456') {
    const safeGmail = JSON.stringify(String(gmail || '').trim().toLowerCase());
    const safeKey = JSON.stringify(String(syncKey || '123456').trim());

    return `/**
 * OFFICE FINANCE TRACKER - Free Forever Gmail Cloud Sync
 * Stores your data safely inside your own Google Drive & Google Sheets
 */
const OWNER_GMAIL = ${safeGmail};
const SYNC_KEY = ${safeKey};
const FILE_NAME = 'OfficeFinance_CloudSync_Vault.json';
const SHEET_NAME = 'Office Finance Tracker Backup';

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function verifyRequest(gmail, key) {
  var reqGmail = String(gmail || '').trim().toLowerCase();
  var reqKey = String(key || '').trim();
  if (OWNER_GMAIL && reqGmail && OWNER_GMAIL !== reqGmail) return false;
  if (SYNC_KEY && SYNC_KEY !== reqKey) return false;
  return true;
}

function getOrCreateSyncFile() {
  var files = DriveApp.getFilesByName(FILE_NAME);
  if (files.hasNext()) return files.next();
  var initial = {
    appName: 'OfficeFinanceCloud',
    updatedAt: new Date(0).toISOString(),
    transactions: [],
    categories: [],
    contacts: [],
    divisions: [],
    authorizedUsers: [],
    deletedLog: [],
    settings: {}
  };
  return DriveApp.createFile(FILE_NAME, JSON.stringify(initial), MimeType.PLAIN_TEXT);
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action || 'pull';
    if (!verifyRequest(params.gmail, params.key)) {
      return jsonResponse({ ok: false, error: 'Gmail or Sync PIN mismatch' });
    }
    if (action === 'ping') {
      return jsonResponse({ ok: true, message: 'Gmail Cloud Sync Connected!' });
    }
    var file = getOrCreateSyncFile();
    var data = JSON.parse(file.getBlob().getDataAsString() || '{}');
    return jsonResponse({ ok: true, data: data });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    if (!verifyRequest(payload.gmail, payload.key)) {
      return jsonResponse({ ok: false, error: 'Gmail or Sync PIN mismatch' });
    }
    var incoming = payload.data;
    if (!incoming || incoming.appName !== 'OfficeFinanceCloud') {
      return jsonResponse({ ok: false, error: 'Invalid sync payload' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var file = getOrCreateSyncFile();
      var existing = {};
      try { existing = JSON.parse(file.getBlob().getDataAsString() || '{}'); } catch (_) { existing = {}; }
      var merged = mergeVaults(existing, incoming);
      file.setContent(JSON.stringify(merged));
      try { updateGoogleSheetBackup(merged); } catch (_) {}
      return jsonResponse({ ok: true, data: merged });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function mergeArrayBySyncId(listA, listB, delMap) {
  var map = {};
  var ingest = function(arr) {
    if (!Array.isArray(arr)) return;
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (!item) continue;
      var sid = item.syncId || String(item.id || '');
      if (!sid) continue;
      var ts = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (delMap[sid] && delMap[sid] >= ts) continue;
      if (!map[sid] || new Date(map[sid].updatedAt || map[sid].createdAt || 0).getTime() <= ts) {
        map[sid] = item;
      }
    }
  };
  ingest(listA);
  ingest(listB);
  return Object.keys(map).map(function(k) { return map[k]; });
}

function mergeVaults(a, b) {
  var delMap = {};
  var ingestDel = function(arr) {
    if (!Array.isArray(arr)) return;
    for (var i = 0; i < arr.length; i++) {
      var d = arr[i];
      if (!d || !d.syncId) continue;
      var ts = new Date(d.deletedAt || 0).getTime();
      if (!delMap[d.syncId] || delMap[d.syncId] < ts) delMap[d.syncId] = ts;
    }
  };
  ingestDel(a.deletedLog);
  ingestDel(b.deletedLog);

  var cutoff = Date.now() - (180 * 24 * 60 * 60 * 1000);
  var deletedLog = Object.keys(delMap)
    .filter(function(sid) { return delMap[sid] > cutoff; })
    .map(function(sid) { return { syncId: sid, deletedAt: new Date(delMap[sid]).toISOString() }; });

  var aSetTs = new Date(a.settingsUpdatedAt || 0).getTime();
  var bSetTs = new Date(b.settingsUpdatedAt || 0).getTime();
  var useBSettings = bSetTs >= aSetTs;

  return {
    appName: 'OfficeFinanceCloud',
    updatedAt: new Date().toISOString(),
    transactions: mergeArrayBySyncId(a.transactions, b.transactions, delMap),
    categories: mergeArrayBySyncId(a.categories, b.categories, delMap),
    contacts: mergeArrayBySyncId(a.contacts, b.contacts, delMap),
    divisions: mergeArrayBySyncId(a.divisions, b.divisions, delMap),
    authorizedUsers: mergeArrayBySyncId(a.authorizedUsers, b.authorizedUsers, delMap),
    deletedLog: deletedLog,
    settings: useBSettings ? (b.settings || a.settings || {}) : (a.settings || b.settings || {}),
    settingsUpdatedAt: useBSettings ? b.settingsUpdatedAt : a.settingsUpdatedAt
  };
}

function updateGoogleSheetBackup(vault) {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(SHEET_NAME);
  var sheet = ss.getSheets()[0];
  sheet.setName('Transactions');
  var rows = [['Date', 'Type', 'Division', 'Category', 'Party', 'Phone', 'Bill No', 'Amount', 'Notes', 'Sync ID']];
  var txs = (vault.transactions || []).slice().sort(function(x, y) {
    return new Date(y.date || 0) - new Date(x.date || 0);
  });
  for (var i = 0; i < txs.length; i++) {
    var t = txs[i];
    rows.push([
      t.date || '',
      t.type || '',
      t.division || 'office',
      t.category || '',
      t.party || '',
      t.phone || '',
      t.billNo || '',
      Number(t.amount || 0),
      t.notes || '',
      t.syncId || ''
    ]);
  }
  sheet.clearContents();
  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  }
}`;
  }

  // ================= PROVIDER 2: FIREBASE + GOOGLE SIGN-IN (OPTIONAL) =================

  loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  async ensureFirebaseSdk() {
    if (window.firebase && window.firebase.auth && window.firebase.firestore) return;
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
    await this.loadScriptOnce('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
  }

  async initFirebaseRuntime() {
    try {
      await this.ensureFirebaseSdk();
      const targetProjectId = this.config.firebaseConfig && this.config.firebaseConfig.projectId;
      const currentProjectId = this._fbApp && this._fbApp.options ? this._fbApp.options.projectId : null;

      if (this._fbInitialized && currentProjectId && targetProjectId && currentProjectId !== targetProjectId) {
        this.unsubscribeFirestore();
        try { await this._fbApp.delete(); } catch (_) {}
        this._fbInitialized = false;
        this._fbApp = null;
      }

      if (!this._fbInitialized) {
        if (!firebase.apps.length) {
          this._fbApp = firebase.initializeApp(this.config.firebaseConfig);
        } else {
          this._fbApp = firebase.apps[0];
        }
        this._fbAuth = firebase.auth();
        this._fbDb = firebase.firestore();
        try {
          await this._fbDb.enablePersistence({ synchronizeTabs: true });
        } catch (_) {}
        this._fbInitialized = true;

        this._fbAuth.getRedirectResult().catch((err) => {
          if (err && err.code) {
            console.warn('Google Redirect Sign-In notice:', err);
            this.setState('error', this.formatFirebaseAuthError(err));
          }
        });

        this._fbAuth.onAuthStateChanged(async (user) => {
          this._fbUser = user;
          if (user) {
            this.config.gmail = user.email || this.config.gmail;
            await this.saveConfig();
            this.subscribeFirestoreUser(user.uid);
            await this.syncFirebaseNow(false);
          } else {
            this.unsubscribeFirestore();
            this.setState('pending', 'Sign in with Google');
          }
        });
      } else if (this._fbUser) {
        await this.syncFirebaseNow(false);
      }
    } catch (err) {
      console.warn('Firebase runtime error:', err);
      this.setState('error', err.message);
    }
  }

  formatFirebaseAuthError(err) {
    const code = (err && err.code) || '';
    if (code === 'auth/unauthorized-domain') {
      return 'Unauthorized domain: Add mhdjzlomr-a11y.github.io in Firebase Console -> Authentication -> Settings -> Authorized domains.';
    }
    if (code === 'permission-denied' || (err && String(err.message).includes('permissions'))) {
      return 'Firestore Permission Denied: Publish security rules allowing match /users/{userId}/{document=**}.';
    }
    return (err && err.message) || 'Authentication error';
  }

  async signInWithFirebaseGoogle(firebaseConfigInput = null) {
    if (firebaseConfigInput) {
      this.config.provider = 'firebase';
      this.config.firebaseConfig = firebaseConfigInput;
      await this.saveConfig();
    }
    await this.initFirebaseRuntime();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await this._fbAuth.signInWithPopup(provider);
    } catch (err) {
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment' || err.code === 'auth/popup-closed-by-user')) {
        if (err.code === 'auth/popup-closed-by-user') throw err;
        await this._fbAuth.signInWithRedirect(provider);
      } else {
        throw new Error(this.formatFirebaseAuthError(err));
      }
    }
  }

  unsubscribeFirestore() {
    if (this._fbUnsubMeta) { this._fbUnsubMeta(); this._fbUnsubMeta = null; }
    if (this._fbUnsubTx) { this._fbUnsubTx(); this._fbUnsubTx = null; }
  }

  subscribeFirestoreUser(uid) {
    this.unsubscribeFirestore();
    if (!this._fbDb || !uid) return;

    const metaRef = this._fbDb.collection('users').doc(uid).collection('vault').doc('meta');
    const txCol = this._fbDb.collection('users').doc(uid).collection('transactions');

    this._fbUnsubMeta = metaRef.onSnapshot(async (snap) => {
      if (!snap.exists || this.isSyncing) return;
      const remoteMeta = snap.data();
      const res = await window.dbEngine.mergeCloudVault({
        ...remoteMeta,
        appName: 'OfficeFinanceCloud',
        transactions: []
      });
      if (res.changed && this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed: true });
      }
    }, (err) => {
      this.setState('error', this.formatFirebaseAuthError(err));
    });

    this._fbUnsubTx = txCol.onSnapshot(async (qs) => {
      if (this.isSyncing) return;
      const txs = [];
      qs.forEach(doc => txs.push(doc.data()));
      const res = await window.dbEngine.mergeCloudVault({
        appName: 'OfficeFinanceCloud',
        transactions: txs
      });
      if (res.changed && this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed: true });
      }
    }, (err) => {
      this.setState('error', this.formatFirebaseAuthError(err));
    });
  }

  async syncFirebaseNow(showToast = false) {
    if (!this._fbAuth || !this._fbDb || !this._fbUser) {
      this.setState('pending', 'Sign in with Google required');
      return { ok: false, error: 'Please sign in with Google first' };
    }
    this.isSyncing = true;
    this.setState('syncing');

    try {
      const uid = this._fbUser.uid;
      const metaRef = this._fbDb.collection('users').doc(uid).collection('vault').doc('meta');
      const txCol = this._fbDb.collection('users').doc(uid).collection('transactions');

      const [metaSnap, txSnap] = await Promise.all([metaRef.get(), txCol.get()]);
      const remoteMeta = metaSnap.exists ? metaSnap.data() : {};
      const remoteTxs = [];
      txSnap.forEach(d => remoteTxs.push(d.data()));

      const remoteVault = {
        ...remoteMeta,
        appName: 'OfficeFinanceCloud',
        transactions: remoteTxs
      };

      const mergeRes = await window.dbEngine.mergeCloudVault(remoteVault);
      const localVault = await window.dbEngine.exportCloudVault();

      // Push merged vault back so remote catches any local additions/deletions (chunked at 400 ops)
      const ops = [
        {
          type: 'set',
          ref: metaRef,
          data: {
            appName: 'OfficeFinanceCloud',
            updatedAt: new Date().toISOString(),
            settingsUpdatedAt: localVault.settingsUpdatedAt,
            categories: localVault.categories,
            contacts: localVault.contacts,
            divisions: localVault.divisions,
            authorizedUsers: localVault.authorizedUsers,
            deletedLog: localVault.deletedLog,
            settings: localVault.settings
          }
        }
      ];

      const remoteTxMap = new Map(remoteTxs.map(t => [t.syncId, t]));
      for (const tx of localVault.transactions) {
        const sid = tx.syncId;
        const r = remoteTxMap.get(sid);
        const lts = new Date(tx.updatedAt || tx.createdAt || 0).getTime();
        const rts = r ? new Date(r.updatedAt || r.createdAt || 0).getTime() : 0;
        if (!r || lts > rts) {
          const { id: _dropId, ...txPayload } = tx;
          ops.push({ type: 'set', ref: txCol.doc(sid), data: txPayload });
        }
      }

      // Delete tombstoned remote transactions
      const delSet = new Set((localVault.deletedLog || []).map(d => d.syncId));
      for (const r of remoteTxs) {
        if (r.syncId && delSet.has(r.syncId)) {
          ops.push({ type: 'delete', ref: txCol.doc(r.syncId) });
        }
      }

      for (let i = 0; i < ops.length; i += 400) {
        const batch = this._fbDb.batch();
        const slice = ops.slice(i, i + 400);
        for (const op of slice) {
          if (op.type === 'set') batch.set(op.ref, op.data);
          else if (op.type === 'delete') batch.delete(op.ref);
        }
        await batch.commit();
      }

      this.config.pendingPush = false;
      this.config.lastSyncAt = new Date().toISOString();
      await this.saveConfig();
      this.state = 'synced';
      this.lastError = '';

      if (this.onUpdateCallback) {
        this.onUpdateCallback({ state: 'synced', error: '', changed: mergeRes.changed, showToast });
      }
      return { ok: true, changed: mergeRes.changed };
    } catch (err) {
      console.warn('Firebase sync error:', err);
      this.setState('error', err.message);
      return { ok: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async disconnect() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.unsubscribeFirestore();
    if (this._fbAuth && this._fbUser) {
      try { await this._fbAuth.signOut(); } catch (_) {}
    }
    this.config = {
      provider: 'none',
      gmail: '',
      scriptUrl: '',
      syncKey: '',
      firebaseConfig: null,
      autoSync: true,
      lastSyncAt: null,
      pendingPush: false
    };
    await this.saveConfig();
    this.setState('off');
  }
}

window.cloudSync = new CloudSyncEngine();
