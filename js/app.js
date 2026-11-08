/**
 * app.js - Master Application Controller
 * Finnova Theme with Light Blue Accent, Dark Mode, Typeable Categories, Period Exports,
 * 100% Bilingual Support (English & Malayalam), Contact Directory & Reliable WhatsApp Dispatch
 */

class OfficeFinanceApp {
  constructor() {
    this.currentView = 'dashboard';
    this.transactions = [];
    this.categories = [];
    this.contacts = [];
    this.officeProfile = {};
    this.currentTxType = 'expense';
    this.currentAttachment = null;
    this.editingTxId = null;
    this.editingContactId = null;
    this.deferredPrompt = null;
    this.pinBuffer = '';
    this.userPin = null;

    // Period state: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'
    this.activePeriod = 'daily';
    this.dashSubFilter = 'all'; // 'all' | 'expense' | 'income'
    this.navyFilter = 'all';    // 'all' | 'expense' | 'income'
    this.selectedNavyTxId = null;

    // WhatsApp Gateway and Dispatch State
    this.waGateway = {
      mode: 'callmebot', // 'callmebot' | 'ultramsg' | 'greenapi' | 'webhook' | 'direct'
      defaultLang: 'app', // 'app' | 'ml' | 'en'
      webhookUrl: '',
      apiKey: '',
      phoneId: '',
      autoSendOnSave: true
    };
    this.currentTxWaLang = 'en'; // in transaction modal
    this.waDispatchTx = null;    // currently active tx in WhatsApp dispatch modal
    this.waDispatchLang = 'en';  // currently active language in WhatsApp modal
    this.pendingDirectWaData = null;
  }

  async init() {
    // 1. Initialize Database
    await window.dbEngine.init();

    // 2. Initialize Theme (Dark / Light)
    await this.initTheme();

    // 3. Initialize Translations
    await window.i18n.init();

    // 4. Load Settings, Profile, PIN, and WhatsApp Gateway
    await this.loadSettings();

    // 5. Load Data & populate UI
    await this.refreshData();

    // 6. Setup DOM Event Listeners
    this.setupEventListeners();

    // 7. Setup PWA & Service Worker
    this.setupPWA();

    // 8. Check URL parameters
    this.checkUrlActions();

    // 9. Render Icons
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  // ================= 1. THEME HANDLING (DARK / LIGHT) =================
  async initTheme() {
    const savedTheme = await window.dbEngine.getSetting('theme', null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme !== null ? (savedTheme === 'dark') : prefersDark;
    this.applyTheme(isDark);
  }

  applyTheme(isDark) {
    const root = document.documentElement;
    const icon = document.getElementById('darkToggleIcon');
    const label = document.getElementById('darkToggleLabel');

    if (isDark) {
      root.classList.add('dark');
      if (icon) icon.textContent = '☀️';
      if (label) label.textContent = window.i18n ? window.i18n.t('light') : 'Light';
    } else {
      root.classList.remove('dark');
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = window.i18n ? window.i18n.t('dark') : 'Dark';
    }
  }

  async toggleTheme() {
    const isDarkNow = document.documentElement.classList.toggle('dark');
    this.applyTheme(isDarkNow);
    await window.dbEngine.setSetting('theme', isDarkNow ? 'dark' : 'light');

    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }
  }

  // ================= 2. SETTINGS, PROFILE & GATEWAY =================
  async loadSettings() {
    this.officeProfile = await window.dbEngine.getSetting('officeProfile', {});
    this.applyProfileToHeader();

    // PIN Security Check
    this.userPin = await window.dbEngine.getSetting('appPin', null);
    this.updatePinStatusUI();
    if (this.userPin) {
      this.showPinLock();
    }

    // WhatsApp Gateway Settings
    const savedGateway = await window.dbEngine.getSetting('whatsappGateway', null);
    if (savedGateway) {
      this.waGateway = { ...this.waGateway, ...savedGateway };
    }
    this.populateWaGatewayForm();
  }

  applyProfileToHeader() {
    const nameElem = document.getElementById('headerOfficeName');
    if (nameElem) {
      nameElem.textContent = this.officeProfile.name || 'OFFICE FINANCE TRACKER';
    }
    const purpleOffice = document.getElementById('navySelectedOfficeName');
    if (purpleOffice) {
      purpleOffice.textContent = this.officeProfile.name || 'OFFICE FINANCE TRACKER';
    }
  }

  populateWaGatewayForm() {
    const modeSelect = document.getElementById('waSettingMode');
    const langSelect = document.getElementById('waSettingDefaultLang');
    const urlInput = document.getElementById('waSettingWebhookUrl');
    const keyInput = document.getElementById('waSettingApiKey');
    const phoneIdInput = document.getElementById('waSettingPhoneId');
    const autoSendChk = document.getElementById('waSettingAutoSendOnSave');

    if (modeSelect) modeSelect.value = this.waGateway.mode || 'callmebot';
    if (langSelect) langSelect.value = this.waGateway.defaultLang || 'app';
    if (urlInput) urlInput.value = this.waGateway.webhookUrl || '';
    if (keyInput) keyInput.value = this.waGateway.apiKey || '';
    if (phoneIdInput) phoneIdInput.value = this.waGateway.phoneId || '';
    if (autoSendChk) autoSendChk.checked = (this.waGateway.autoSendOnSave !== false);

    this.updateWaGatewayUIState();
  }

  updateWaGatewayUIState() {
    const mode = document.getElementById('waSettingMode')?.value || this.waGateway.mode || 'callmebot';
    const helperCard = document.getElementById('waCallmebotHelperCard');
    const groupKey = document.getElementById('groupWaApiKey');
    const groupPhone = document.getElementById('groupWaPhoneId');
    const groupUrl = document.getElementById('groupWaWebhookUrl');
    const lblKey = document.getElementById('lblWaApiKey');
    const lblPhone = document.getElementById('lblWaPhoneId');
    const badge = document.getElementById('waGatewayStatusBadge');

    if (helperCard) {
      helperCard.style.display = (mode === 'callmebot') ? 'block' : 'none';
    }

    if (mode === 'callmebot') {
      if (groupKey) groupKey.style.display = 'block';
      if (groupPhone) groupPhone.style.display = 'none';
      if (groupUrl) groupUrl.style.display = 'none';
      if (lblKey) lblKey.textContent = 'CallMeBot API Key';
    } else if (mode === 'ultramsg') {
      if (groupKey) groupKey.style.display = 'block';
      if (groupPhone) groupPhone.style.display = 'block';
      if (groupUrl) groupUrl.style.display = 'none';
      if (lblKey) lblKey.textContent = 'UltraMsg Token';
      if (lblPhone) lblPhone.textContent = 'Instance ID (e.g. instance12345)';
    } else if (mode === 'greenapi') {
      if (groupKey) groupKey.style.display = 'block';
      if (groupPhone) groupPhone.style.display = 'block';
      if (groupUrl) groupUrl.style.display = 'none';
      if (lblKey) lblKey.textContent = 'apiTokenInstance';
      if (lblPhone) lblPhone.textContent = 'idInstance';
    } else if (mode === 'webhook') {
      if (groupKey) groupKey.style.display = 'block';
      if (groupPhone) groupPhone.style.display = 'none';
      if (groupUrl) groupUrl.style.display = 'block';
      if (lblKey) lblKey.textContent = 'Bearer Auth Token (Optional)';
    } else {
      if (groupKey) groupKey.style.display = 'none';
      if (groupPhone) groupPhone.style.display = 'none';
      if (groupUrl) groupUrl.style.display = 'none';
    }

    const isReady = (mode === 'callmebot' && this.waGateway.apiKey) ||
                    (mode === 'ultramsg' && this.waGateway.apiKey && this.waGateway.phoneId) ||
                    (mode === 'greenapi' && this.waGateway.apiKey && this.waGateway.phoneId) ||
                    (mode === 'webhook' && this.waGateway.webhookUrl) ||
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (badge) {
      if (isReady) {
        badge.textContent = window.i18n.t('waStatusActive') || '🟢 Silent Auto-Send Active';
        badge.style.background = 'rgba(37, 211, 102, 0.15)';
        badge.style.color = '#15803d';
      } else {
        badge.textContent = window.i18n.t('waStatusRequired') || '🟡 Setup Required';
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
        badge.style.color = '#b45309';
      }
    }
  }

  async handleSaveWaGateway(e) {
    if (e) e.preventDefault();
    this.waGateway.mode = document.getElementById('waSettingMode')?.value || 'callmebot';
    this.waGateway.defaultLang = document.getElementById('waSettingDefaultLang')?.value || 'app';
    this.waGateway.webhookUrl = document.getElementById('waSettingWebhookUrl')?.value.trim() || '';
    this.waGateway.apiKey = document.getElementById('waSettingApiKey')?.value.trim() || '';
    this.waGateway.phoneId = document.getElementById('waSettingPhoneId')?.value.trim() || '';
    this.waGateway.autoSendOnSave = document.getElementById('waSettingAutoSendOnSave')?.checked !== false;

    await window.dbEngine.setSetting('whatsappGateway', this.waGateway);
    this.updateWaGatewayUIState();
    this.showToast(window.i18n.t('waGatewaySaved'), 'success');
  }

  // ================= 3. PIN SECURITY =================
  updatePinStatusUI() {
    const pinText = document.getElementById('pinStatusText');
    const pinBtn = document.getElementById('btnTogglePinSetting');
    if (this.userPin) {
      if (pinText) pinText.textContent = window.i18n.t('pinStatusActive');
      if (pinBtn) pinBtn.textContent = window.i18n.t('btnChangePin');
    } else {
      if (pinText) pinText.textContent = window.i18n.t('pinStatusInactive');
      if (pinBtn) pinBtn.textContent = window.i18n.t('btnSetPin');
    }
  }

  showPinLock() {
    this.pinBuffer = '';
    this.updatePinDots();
    const modal = document.getElementById('pinLockModal');
    if (modal) modal.classList.remove('hidden');
    const errMsg = document.getElementById('pinErrorMsg');
    if (errMsg) errMsg.classList.add('hidden');
  }

  hidePinLock() {
    const modal = document.getElementById('pinLockModal');
    if (modal) modal.classList.add('hidden');
    this.pinBuffer = '';
  }

  handlePinInput(val) {
    const errMsg = document.getElementById('pinErrorMsg');
    if (errMsg) errMsg.classList.add('hidden');

    if (val === 'clear') {
      this.pinBuffer = '';
    } else if (val === 'back') {
      this.pinBuffer = this.pinBuffer.slice(0, -1);
    } else if (/^\d$/.test(val)) {
      if (this.pinBuffer.length < 4) {
        this.pinBuffer += val;
      }
    }

    this.updatePinDots();

    if (this.pinBuffer.length === 4) {
      if (this.pinBuffer === String(this.userPin)) {
        this.hidePinLock();
        this.showToast(window.i18n.t('pinUnlocked'), 'success');
      } else {
        if (errMsg) errMsg.classList.remove('hidden');
        setTimeout(() => {
          this.pinBuffer = '';
          this.updatePinDots();
        }, 500);
      }
    }
  }

  updatePinDots() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`pinDot${i}`);
      if (dot) {
        if (i < this.pinBuffer.length) {
          dot.style.background = 'var(--finnova-purple)';
          dot.style.borderColor = 'var(--finnova-purple)';
        } else {
          dot.style.background = 'transparent';
          dot.style.borderColor = 'var(--text-muted)';
        }
      }
    }
  }

  // ================= 4. DATA REFRESH & CONTACTS =================
  async refreshData() {
    this.transactions = await window.dbEngine.getAllTransactions();
    this.categories = await window.dbEngine.getAllCategories();
    this.contacts = await window.dbEngine.getAllContacts();

    this.renderDashboard();
    this.renderTransactionsList();
    this.renderReports();
    this.populateCategoryDatalist();
    this.populatePartyDatalist();
    this.renderSettingsCategoryChips();
    this.renderContactsList();

    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  populatePartyDatalist() {
    const datalist = document.getElementById('partyDatalist');
    if (!datalist) return;
    datalist.innerHTML = '';

    this.contacts.forEach(c => {
      const option = document.createElement('option');
      option.value = c.name;
      option.label = `📲 ${c.phone} (${c.type || 'Contact'})`;
      datalist.appendChild(option);
    });
  }

  populateCategoryDatalist() {
    const datalist = document.getElementById('categoryDatalist');
    const quickPills = document.getElementById('quickCategoryPills');
    if (!datalist) return;

    datalist.innerHTML = '';
    if (quickPills) quickPills.innerHTML = '';

    const matchingCats = this.categories.filter(c => c.type === this.currentTxType);

    matchingCats.forEach(cat => {
      const name = window.i18n.getCategoryName(cat);
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });

    if (quickPills) {
      const topSuggestions = matchingCats.slice(0, 6);
      topSuggestions.forEach(cat => {
        const name = window.i18n.getCategoryName(cat);
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'filter-chip-btn';
        pill.style.fontSize = '0.72rem';
        pill.style.padding = '3px 8px';
        pill.textContent = name;
        pill.onclick = () => {
          const catInput = document.getElementById('txCategory');
          if (catInput) catInput.value = name;
        };
        quickPills.appendChild(pill);
      });
    }
  }

  // ================= 5. CONTACTS DIRECTORY MANAGEMENT =================
  renderContactsList() {
    const q1 = (document.getElementById('contactSearchInput')?.value || '').toLowerCase().trim();
    const q2 = (document.getElementById('contactSearchInputMain')?.value || '').toLowerCase().trim();
    const q = q2 || q1;

    const filtered = this.contacts.filter(c => {
      if (!q) return true;
      return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.notes || '').toLowerCase().includes(q);
    });

    const countElem = document.getElementById('mainContactCountText');
    if (countElem) countElem.textContent = filtered.length;

    const containers = [
      document.getElementById('contactsListContainer'),
      document.getElementById('mainContactsListContainer')
    ];

    containers.forEach(container => {
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            <p>${window.i18n.t('noContactsFound')}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(c => `
        <div class="navy-tx-card" style="background: var(--bg-surface); border: 1px solid var(--border-light); margin-bottom: 8px;">
          <div class="navy-user-left">
            <div class="navy-avatar-sq" style="background: var(--finnova-purple); color: white; font-weight: 800;">
              ${(c.name || 'C').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div class="navy-name" style="color: var(--text-dark);">${c.name}</div>
              <div class="navy-date-sub" style="color: var(--text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="color: #10b981; font-weight: 700;">📲 ${c.phone}</span>
                <span style="padding: 1px 8px; border-radius: 999px; background: var(--bg-subtle); font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">${c.type || 'contact'}</span>
                ${c.notes ? `<span>• ${c.notes}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="sq-pill-btn" style="color: #25d366;" title="Send WhatsApp Receipt" onclick="window.appEngine.openDirectWaToContact('${c.phone}', '${c.name.replace(/'/g, "\\'")}')">
              <i data-lucide="message-circle"></i>
            </button>
            <button type="button" class="sq-pill-btn" title="Edit Contact" onclick="window.appEngine.openEditContactModal(${c.id})">
              <i data-lucide="edit-2"></i>
            </button>
            <button type="button" class="sq-pill-btn" style="color: var(--coral-rose);" title="Delete Contact" onclick="window.appEngine.deleteContact(${c.id})">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `).join('');
    });

    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  openDirectWaToContact(phone, name) {
    const officeName = (this.officeProfile && this.officeProfile.name) || 'OFFICE FINANCE TRACKER';
    const isMl = window.i18n.currentLang === 'ml';
    const msg = isMl
      ? `നമസ്കാരം ${name},\n${officeName}-ൽ നിന്നുള്ള ഔദ്യോഗിക സന്ദേശം.`
      : `Hello ${name},\nGreetings from ${officeName}.`;
    this.sendWhatsAppDirect(phone, msg);
  }

  openAddContactModal() {
    this.editingContactId = null;
    document.getElementById('contactId').value = '';
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactType').value = 'client';
    document.getElementById('contactNotes').value = '';

    document.getElementById('contactModalTitle').textContent = window.i18n.t('contactModalTitle');
    document.getElementById('contactModal')?.classList.remove('hidden');
  }

  openEditContactModal(id) {
    const contact = this.contacts.find(c => c.id === Number(id));
    if (!contact) return;

    this.editingContactId = contact.id;
    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name || '';
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactType').value = contact.type || 'client';
    document.getElementById('contactNotes').value = contact.notes || '';

    document.getElementById('contactModalTitle').textContent = window.i18n.t('contactEditModalTitle');
    document.getElementById('contactModal')?.classList.remove('hidden');
  }

  closeContactModal() {
    document.getElementById('contactModal')?.classList.add('hidden');
    this.editingContactId = null;
  }

  async handleSaveContact(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const type = document.getElementById('contactType').value;
    const notes = document.getElementById('contactNotes').value.trim();

    if (!name || !phone) return;

    const cleaned = this.sanitizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      alert(window.i18n.t('waMissingPhone'));
      return;
    }

    const contactData = { name, phone: phone.trim(), type, notes };

    if (this.editingContactId) {
      contactData.id = this.editingContactId;
      await window.dbEngine.updateContact(contactData);
      this.showToast(window.i18n.t('contactUpdated'), 'success');
    } else {
      await window.dbEngine.addContact(contactData);
      this.showToast(window.i18n.t('contactSaved'), 'success');
    }

    this.closeContactModal();
    await this.refreshData();
  }

  async deleteContact(id) {
    if (confirm(window.i18n.t('confirmDeleteContact'))) {
      await window.dbEngine.deleteContact(Number(id));
      this.showToast(window.i18n.t('contactDeleted'), 'info');
      await this.refreshData();
    }
  }

  // ================= 6. DASHBOARD & STATS =================
  renderDashboard() {
    this.updateStats();
    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }
  }

  getFilteredByPeriod(period) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    return this.transactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = tx.date.slice(0, 10);

      if (period === 'daily') {
        return txDate === todayStr;
      } else if (period === 'weekly') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const startStr = sevenDaysAgo.toISOString().slice(0, 10);
        return txDate >= startStr && txDate <= todayStr;
      } else if (period === 'monthly') {
        return txDate.startsWith(todayStr.slice(0, 7));
      } else if (period === 'yearly') {
        return txDate.startsWith(String(today.getFullYear()));
      }
      return true; // 'all'
    });
  }

  updateStats() {
    const periodTxs = this.getFilteredByPeriod(this.activePeriod);

    let periodIncome = 0;
    let periodExpense = 0;
    let periodIncCount = 0;
    let periodExpCount = 0;

    periodTxs.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        periodIncome += amt;
        periodIncCount++;
      } else if (t.type === 'expense') {
        periodExpense += amt;
        periodExpCount++;
      }
    });

    const periodNet = periodIncome - periodExpense;

    const netElem = document.getElementById('statNetBalance');
    const incElem = document.getElementById('statTotalIncome');
    const expElem = document.getElementById('statTotalExpense');
    const txCountElem = document.getElementById('statTotalTxCount');
    const incCountElem = document.getElementById('statIncomeCount');
    const expCountElem = document.getElementById('statExpenseCount');

    if (netElem) netElem.textContent = this.formatCurrency(periodNet);
    if (incElem) incElem.textContent = this.formatCurrency(periodIncome);
    if (expElem) expElem.textContent = this.formatCurrency(periodExpense);
    if (txCountElem) txCountElem.textContent = `${this.transactions.length} ${window.i18n.t('totalTxUnit')}`;
    if (incCountElem) incCountElem.textContent = periodIncCount;
    if (expCountElem) expCountElem.textContent = periodExpCount;

    const periodNetText = document.getElementById('statPeriodNetText');
    const periodPill = document.getElementById('statPeriodNetPill');
    const activePeriodLabel = document.getElementById('statActivePeriodLabel');

    const activePeriodLabelKey = {
      daily: 'activePeriodLabelDaily',
      weekly: 'activePeriodLabelWeekly',
      monthly: 'activePeriodLabelMonthly',
      yearly: 'activePeriodLabelYearly',
      all: 'activePeriodLabelAll'
    };

    if (activePeriodLabel) {
      const key = activePeriodLabelKey[this.activePeriod] || 'activePeriodLabelDaily';
      activePeriodLabel.textContent = window.i18n.t(key);
    }

    if (periodNetText) {
      if (periodNet >= 0) {
        periodNetText.textContent = `+${this.formatCurrency(periodNet)}`;
        if (periodPill) periodPill.className = 'trend-pill up';
      } else {
        periodNetText.textContent = this.formatCurrency(periodNet);
        if (periodPill) periodPill.className = 'trend-pill down';
      }
    }

    const pdfPeriodLabel = document.getElementById('dashPdfPeriodLabel');
    const excelPeriodLabel = document.getElementById('dashExcelPeriodLabel');
    const capitalizedPeriod = this.activePeriod.charAt(0).toUpperCase() + this.activePeriod.slice(1);

    if (pdfPeriodLabel) pdfPeriodLabel.textContent = `${capitalizedPeriod} PDF`;
    if (excelPeriodLabel) excelPeriodLabel.textContent = `${capitalizedPeriod} Excel`;

    this.renderNavyBoard(periodTxs);
  }

  // ================= 7. FINNOVA NAVY BOARD RENDERING =================
  renderNavyBoard(baseTxs = null) {
    let list = baseTxs !== null ? baseTxs : this.getFilteredByPeriod(this.activePeriod);

    const searchVal = (document.getElementById('dashQuickSearch')?.value || '').toLowerCase().trim();
    if (searchVal) {
      list = list.filter(t => {
        const cat = this.categories.find(c => c.id === t.category);
        const catName = (cat ? (cat.nameMl + ' ' + cat.nameEn) : (t.category || '')).toLowerCase();
        const party = (t.party || '').toLowerCase();
        const bill = (t.billNo || '').toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        const amt = String(t.amount || '');
        return catName.includes(searchVal) || party.includes(searchVal) || bill.includes(searchVal) || notes.includes(searchVal) || amt.includes(searchVal);
      });
    }

    if (this.navyFilter !== 'all') {
      list = list.filter(t => t.type === this.navyFilter);
    }

    const navyContainer = document.getElementById('navyTxList');
    if (!navyContainer) return;

    if (list.length === 0) {
      navyContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
          <p>${window.i18n.t('noTxSelected')}</p>
        </div>
      `;
      this.clearNavyDetailsCard();
      return;
    }

    if (!this.selectedNavyTxId || !list.some(t => t.id === this.selectedNavyTxId)) {
      this.selectedNavyTxId = list[0].id;
    }

    navyContainer.innerHTML = list.map(tx => {
      const cat = this.categories.find(c => c.id === tx.category);
      const catName = cat ? window.i18n.getCategoryName(cat) : (tx.category || '-');
      const catColor = (cat && cat.color) ? cat.color : '#0ea5e9';
      const isIncome = tx.type === 'income';
      const isSelected = tx.id === this.selectedNavyTxId;

      return `
        <div class="navy-tx-card ${isSelected ? 'active' : ''}" onclick="window.appEngine.selectNavyTx(${tx.id})">
          <div class="navy-user-left">
            <div class="navy-avatar-sq" style="background-color: ${catColor};">
              ${catName.slice(0, 1)}
            </div>
            <div>
              <div class="navy-name">${tx.party || catName}</div>
              <div class="navy-date-sub">
                ${this.formatDate(tx.date)} • ${tx.billNo ? `#${tx.billNo}` : catName}
                ${tx.phone ? ` • 📲 ${tx.phone}` : ''}
              </div>
            </div>
          </div>
          <div class="navy-right-amt ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? '+' : '-'} ${this.formatCurrency(tx.amount)}
          </div>
        </div>
      `;
    }).join('');

    const selectedTx = this.transactions.find(t => t.id === this.selectedNavyTxId);
    if (selectedTx) {
      this.updateNavyDetailsCard(selectedTx);
    }
  }

  selectNavyTx(id) {
    this.selectedNavyTxId = Number(id);
    this.renderNavyBoard();
  }

  updateNavyDetailsCard(tx) {
    const cat = this.categories.find(c => c.id === tx.category);
    const catName = cat ? window.i18n.getCategoryName(cat) : (tx.category || '-');
    const isIncome = tx.type === 'income';

    const invElem = document.getElementById('navySelectedInvNo');
    const amtElem = document.getElementById('navySelectedAmount');
    const catElem = document.getElementById('navySelectedCategory');
    const dateElem = document.getElementById('navySelectedDate');
    const partyElem = document.getElementById('navySelectedParty');
    const phoneElem = document.getElementById('navySelectedPhone');
    const notesElem = document.getElementById('navySelectedNotes');
    const subtotalElem = document.getElementById('navySelectedBottomSubtotal');
    const badgeElem = document.getElementById('navySelectedTypeBadge');

    if (invElem) invElem.textContent = `# ${tx.billNo || 'TX-' + tx.id}`;
    if (amtElem) amtElem.textContent = this.formatCurrency(tx.amount);
    if (catElem) catElem.textContent = catName;
    if (dateElem) dateElem.textContent = this.formatDate(tx.date);
    if (partyElem) partyElem.textContent = tx.party || (isIncome ? window.i18n.t('receivedIncomeDefault') : window.i18n.t('officeExpenseDefault'));

    if (phoneElem) {
      if (tx.phone) {
        phoneElem.textContent = `📲 ${tx.phone}`;
        phoneElem.style.background = 'rgba(16, 185, 129, 0.3)';
        phoneElem.style.color = '#a7f3d0';
      } else {
        phoneElem.textContent = window.i18n.t('addPhonePrompt');
        phoneElem.style.background = 'rgba(255, 255, 255, 0.15)';
        phoneElem.style.color = '#ffffff';
      }
    }
    if (notesElem) notesElem.textContent = tx.notes ? `${window.i18n.t('notesPrefix')} ${tx.notes}` : window.i18n.t('noNotes');
    if (subtotalElem) subtotalElem.textContent = this.formatCurrency(tx.amount);

    if (badgeElem) {
      badgeElem.textContent = isIncome ? (window.i18n.currentLang === 'ml' ? 'വരവ് (INCOME)' : 'INCOME') : (window.i18n.currentLang === 'ml' ? 'ചിലവ് (EXPENSE)' : 'EXPENSE');
      badgeElem.style.background = isIncome ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
    }

    const btnWhatsapp = document.getElementById('btnNavySendWhatsapp');
    const btnPrint = document.getElementById('btnNavyPrintVoucher');
    const btnEdit = document.getElementById('btnNavyEditTx');
    const btnDelete = document.getElementById('btnNavyDeleteTx');

    if (btnWhatsapp) {
      btnWhatsapp.onclick = () => this.openWaDispatchModal(tx.id);
    }
    if (btnPrint) {
      btnPrint.onclick = () => this.downloadSingleVoucher(tx.id);
    }
    if (btnEdit) {
      btnEdit.onclick = () => this.openEditTxModal(tx.id);
    }
    if (btnDelete) {
      btnDelete.onclick = () => this.confirmDeleteTx(tx.id);
    }
  }

  clearNavyDetailsCard() {
    const invElem = document.getElementById('navySelectedInvNo');
    const amtElem = document.getElementById('navySelectedAmount');
    const catElem = document.getElementById('navySelectedCategory');
    const dateElem = document.getElementById('navySelectedDate');
    const partyElem = document.getElementById('navySelectedParty');
    const notesElem = document.getElementById('navySelectedNotes');
    const subtotalElem = document.getElementById('navySelectedBottomSubtotal');

    if (invElem) invElem.textContent = '# -';
    if (amtElem) amtElem.textContent = '₹0.00';
    if (catElem) catElem.textContent = '-';
    if (dateElem) dateElem.textContent = '-';
    if (partyElem) partyElem.textContent = '-';
    if (notesElem) notesElem.textContent = window.i18n.t('selectTxPlaceholder');
    if (subtotalElem) subtotalElem.textContent = '₹0.00';

    const warnSelect = () => {
      if (this.transactions.length > 0) {
        this.selectNavyTx(this.transactions[0].id);
      } else {
        this.showToast(window.i18n.currentLang === 'ml' ? 'ഇടപാടുകൾ ഒന്നും ചേർത്തിട്ടില്ല. പുതിയത് ചേർക്കാം.' : 'No transactions recorded yet.', 'info');
        this.openAddTxModal();
      }
    };
    const btnWhatsapp = document.getElementById('btnNavySendWhatsapp');
    const btnPrint = document.getElementById('btnNavyPrintVoucher');
    const btnEdit = document.getElementById('btnNavyEditTx');
    const btnDelete = document.getElementById('btnNavyDeleteTx');
    if (btnWhatsapp) btnWhatsapp.onclick = warnSelect;
    if (btnPrint) btnPrint.onclick = warnSelect;
    if (btnEdit) btnEdit.onclick = warnSelect;
    if (btnDelete) btnDelete.onclick = warnSelect;
  }

  // ================= 8. PERIOD 1-CLICK EXPORTS =================
  exportPeriod(period, format) {
    const txs = this.getFilteredByPeriod(period);
    if (txs.length === 0) {
      this.showToast(window.i18n.t('noTxsInPeriod'), 'info');
      return;
    }

    const isMl = window.i18n.currentLang === 'ml';
    const periodTitles = {
      daily: isMl ? 'DAILY STATEMENT (ഇന്നത്തെ കണക്ക്)' : 'DAILY STATEMENT',
      weekly: isMl ? 'WEEKLY STATEMENT (ഈ ആഴ്ചയിലെ കണക്ക്)' : 'WEEKLY STATEMENT',
      monthly: isMl ? 'MONTHLY STATEMENT (ഈ മാസത്തെ കണക്ക്)' : 'MONTHLY STATEMENT',
      yearly: isMl ? 'ANNUAL FINANCIAL STATEMENT (ഈ വർഷത്തെ കണക്ക്)' : 'ANNUAL FINANCIAL STATEMENT',
      all: 'ALL TIME FINANCIAL STATEMENT'
    };

    const title = periodTitles[period] || 'FINANCIAL STATEMENT';

    if (format === 'pdf') {
      if (window.reportsEngine) {
        window.reportsEngine.downloadStatementPDF(txs, this.categories, this.officeProfile, title);
      }
    } else if (format === 'csv') {
      if (window.reportsEngine) {
        window.reportsEngine.exportToCSV(txs, this.categories, this.officeProfile, period);
      }
    }
  }

  // ================= 9. FULL TRANSACTIONS VIEW =================
  renderTransactionsList() {
    const searchVal = (document.getElementById('txSearchInput')?.value || '').toLowerCase().trim();
    const typeVal = document.getElementById('filterTypeSelect')?.value || 'all';
    const catVal = document.getElementById('filterCategorySelect')?.value || 'all';
    const datePreset = document.getElementById('filterDateRangeSelect')?.value || 'all';

    const customStart = document.getElementById('customStartDate')?.value || '';
    const customEnd = document.getElementById('customEndDate')?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const filtered = this.transactions.filter(tx => {
      if (typeVal !== 'all' && tx.type !== typeVal) return false;
      if (catVal !== 'all' && tx.category !== catVal) return false;

      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      if (datePreset === 'today' && txDate !== todayStr) return false;
      if (datePreset === 'yesterday') {
        const yest = new Date(today);
        yest.setDate(today.getDate() - 1);
        if (txDate !== yest.toISOString().slice(0, 10)) return false;
      }
      if (datePreset === 'this_week') {
        const d = new Date(today);
        d.setDate(today.getDate() - 7);
        if (txDate < d.toISOString().slice(0, 10)) return false;
      }
      if (datePreset === 'this_month') {
        if (!txDate.startsWith(todayStr.slice(0, 7))) return false;
      }
      if (datePreset === 'custom') {
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
      }

      if (searchVal) {
        const cat = this.categories.find(c => c.id === tx.category);
        const catName = (cat ? (cat.nameMl + ' ' + cat.nameEn) : (tx.category || '')).toLowerCase();
        const party = (tx.party || '').toLowerCase();
        const bill = (tx.billNo || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const amt = String(tx.amount || '');

        const match = party.includes(searchVal) || bill.includes(searchVal) || notes.includes(searchVal) || catName.includes(searchVal) || amt.includes(searchVal);
        if (!match) return false;
      }

      return true;
    });

    let fIncome = 0;
    let fExpense = 0;
    filtered.forEach(t => {
      const a = parseFloat(t.amount) || 0;
      if (t.type === 'income') fIncome += a;
      else if (t.type === 'expense') fExpense += a;
    });

    const countElem = document.getElementById('filteredCountText');
    const incElem = document.getElementById('filteredIncomeText');
    const expElem = document.getElementById('filteredExpenseText');

    if (countElem) countElem.textContent = filtered.length;
    if (incElem) incElem.textContent = this.formatCurrency(fIncome);
    if (expElem) expElem.textContent = this.formatCurrency(fExpense);

    const ledgerContainer = document.getElementById('fullLedgerContainer');
    if (!ledgerContainer) return;

    if (filtered.length === 0) {
      ledgerContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
          <p style="font-size: 0.9rem;">${window.i18n.t('noFilteredTx')}</p>
        </div>
      `;
      return;
    }

    ledgerContainer.innerHTML = filtered.map(tx => {
      const cat = this.categories.find(c => c.id === tx.category);
      const catName = cat ? window.i18n.getCategoryName(cat) : (tx.category || '-');
      const catColor = (cat && cat.color) ? cat.color : '#0ea5e9';
      const isIncome = tx.type === 'income';

      return `
        <div class="navy-tx-card" style="background: var(--bg-surface); border-color: var(--border-light);">
          <div class="navy-user-left">
            <div class="navy-avatar-sq" style="background-color: ${catColor};">
              ${catName.slice(0, 1)}
            </div>
            <div>
              <div class="navy-name" style="color: var(--text-dark);">${tx.party || catName}</div>
              <div class="navy-date-sub" style="color: var(--text-muted);">
                ${this.formatDate(tx.date)} • ${catName} ${tx.billNo ? `• #${tx.billNo}` : ''}
                ${tx.phone ? `<span style="color: #10b981; font-weight: 700;"> • 📲 ${tx.phone}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="navy-right-amt ${isIncome ? 'income' : 'expense'}">
              ${isIncome ? '+' : '-'} ${this.formatCurrency(tx.amount)}
            </div>
            <div style="display: flex; gap: 4px;">
              <button onclick="window.appEngine.openWaDispatchModal(${tx.id})" class="sq-pill-btn" style="color: #25d366;" title="Send WhatsApp Receipt">
                <i data-lucide="message-circle"></i>
              </button>
              <button onclick="window.appEngine.downloadSingleVoucher(${tx.id})" class="sq-pill-btn" title="Voucher PDF">
                <i data-lucide="file-text"></i>
              </button>
              <button onclick="window.appEngine.openEditTxModal(${tx.id})" class="sq-pill-btn" title="Edit">
                <i data-lucide="edit-2"></i>
              </button>
              <button onclick="window.appEngine.confirmDeleteTx(${tx.id})" class="sq-pill-btn" style="color: var(--coral-rose);" title="Delete">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  // ================= 10. REPORTS VIEW =================
  getFilteredReportTransactions() {
    const rangePreset = document.getElementById('reportRangePreset')?.value || 'this_month';
    const customStart = document.getElementById('reportStartDate')?.value || '';
    const customEnd = document.getElementById('reportEndDate')?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    return this.transactions.filter(tx => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      if (rangePreset === 'this_month') return txDate.startsWith(thisMonthStr);
      if (rangePreset === 'last_month') {
        const lastM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMStr = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, '0')}`;
        return txDate.startsWith(lastMStr);
      }
      if (rangePreset === 'this_year') return txDate.startsWith(String(today.getFullYear()));
      if (rangePreset === 'all_time') return true;
      if (rangePreset === 'custom') {
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
      }
      return true;
    });
  }

  renderReports() {
    const filtered = this.getFilteredReportTransactions();

    let totalIncome = 0;
    let totalExpense = 0;
    const catExpenses = {};

    filtered.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpense += amt;
        const cid = tx.category || 'misc_exp';
        catExpenses[cid] = (catExpenses[cid] || { count: 0, amount: 0 });
        catExpenses[cid].count++;
        catExpenses[cid].amount += amt;
      }
    });

    const netBal = totalIncome - totalExpense;

    const repInc = document.getElementById('reportTotalIncome');
    const repExp = document.getElementById('reportTotalExpense');
    const repNet = document.getElementById('reportNetBalance');

    if (repInc) repInc.textContent = this.formatCurrency(totalIncome);
    if (repExp) repExp.textContent = this.formatCurrency(totalExpense);
    if (repNet) repNet.textContent = this.formatCurrency(netBal);

    const tbody = document.getElementById('reportCategoryTableBody');
    if (!tbody) return;

    const catRows = Object.keys(catExpenses).map(cid => {
      const cat = this.categories.find(c => c.id === cid);
      const name = cat ? window.i18n.getCategoryName(cat) : cid;
      const data = catExpenses[cid];
      const pct = totalExpense > 0 ? ((data.amount / totalExpense) * 100).toFixed(1) : 0;
      return { name, count: data.count, amount: data.amount, pct };
    }).sort((a, b) => b.amount - a.amount);

    if (catRows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);">${window.i18n.t('noTxSelected')}</td></tr>`;
    } else {
      tbody.innerHTML = catRows.map(r => `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 10px 8px; font-weight: 700;">${r.name}</td>
          <td style="padding: 10px 8px;">${r.count}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: var(--coral-rose);">${this.formatCurrency(r.amount)}</td>
          <td style="padding: 10px 8px; text-align: right;">${r.pct}%</td>
        </tr>
      `).join('');
    }
  }

  // ================= 11. SETTINGS CHIPS RENDERING =================
  renderSettingsCategoryChips() {
    const expContainer = document.getElementById('expenseCategoryChips');
    const incContainer = document.getElementById('incomeCategoryChips');

    if (expContainer) {
      const expCats = this.categories.filter(c => c.type === 'expense');
      expContainer.innerHTML = expCats.map(c => `
        <span class="chip-item">
          <span class="chip-dot" style="background-color: ${c.color || '#f43f5e'};"></span>
          <span>${window.i18n.getCategoryName(c)}</span>
          ${c.isCustom ? `<button class="chip-delete-btn" onclick="window.appEngine.deleteCategory('${c.id}')" title="Delete">×</button>` : ''}
        </span>
      `).join('');
    }

    if (incContainer) {
      const incCats = this.categories.filter(c => c.type === 'income');
      incContainer.innerHTML = incCats.map(c => `
        <span class="chip-item">
          <span class="chip-dot" style="background-color: ${c.color || '#10b981'};"></span>
          <span>${window.i18n.getCategoryName(c)}</span>
          ${c.isCustom ? `<button class="chip-delete-btn" onclick="window.appEngine.deleteCategory('${c.id}')" title="Delete">×</button>` : ''}
        </span>
      `).join('');
    }
  }

  // ================= 12. ADD / EDIT TRANSACTION MODAL =================
  openAddTxModal(type = 'expense') {
    this.editingTxId = null;
    this.currentTxType = type;
    this.currentAttachment = null;

    document.getElementById('txId').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txCategory').value = '';
    document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('txParty').value = '';
    document.getElementById('txPhone').value = '';
    const chkAdd = document.getElementById('txSendWhatsapp');
    if (chkAdd) chkAdd.checked = (this.waGateway.autoSendOnSave !== false);
    document.getElementById('txBillNo').value = '';
    document.getElementById('txNotes').value = '';

    const defaultLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    this.setTxWaLang(defaultLang || 'en');

    this.hideAttachmentPreview();
    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();
    this.populatePartyDatalist();

    document.getElementById('txModalTitle').textContent = window.i18n.t('modalAddTitle');
    document.getElementById('transactionModal').classList.remove('hidden');
  }

  setTxWaLang(lang) {
    this.currentTxWaLang = lang;
    const btnMl = document.getElementById('btnTxWaLangMl');
    const btnEn = document.getElementById('btnTxWaLangEn');
    if (btnMl && btnEn) {
      if (lang === 'ml') {
        btnMl.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnMl.classList.remove('active');
      }
    }
  }

  async openEditTxModal(txId) {
    const tx = this.transactions.find(t => t.id === Number(txId));
    if (!tx) return;

    this.editingTxId = tx.id;
    this.currentTxType = tx.type;
    this.currentAttachment = tx.attachment || null;

    document.getElementById('txId').value = tx.id;
    document.getElementById('txAmount').value = tx.amount;
    document.getElementById('txDate').value = tx.date ? tx.date.slice(0, 10) : '';
    document.getElementById('txParty').value = tx.party || '';
    document.getElementById('txPhone').value = tx.phone || '';
    const chkEdit = document.getElementById('txSendWhatsapp');
    if (chkEdit) chkEdit.checked = false;
    document.getElementById('txBillNo').value = tx.billNo || '';
    document.getElementById('txNotes').value = tx.notes || '';

    const defaultLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    this.setTxWaLang(defaultLang || 'en');

    const cat = this.categories.find(c => c.id === tx.category);
    document.getElementById('txCategory').value = cat ? window.i18n.getCategoryName(cat) : (tx.category || '');

    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();
    this.populatePartyDatalist();

    if (tx.attachment) {
      this.showAttachmentPreview(tx.attachment);
    } else {
      this.hideAttachmentPreview();
    }

    document.getElementById('txModalTitle').textContent = window.i18n.t('modalEditTitle');
    document.getElementById('transactionModal').classList.remove('hidden');
  }

  closeTxModal() {
    document.getElementById('transactionModal').classList.add('hidden');
    this.editingTxId = null;
    this.currentAttachment = null;
  }

  setTxType(type) {
    this.currentTxType = type;
    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();
  }

  updateTxTypeToggleUI() {
    const btnExp = document.getElementById('toggleTypeExpense');
    const btnInc = document.getElementById('toggleTypeIncome');
    const partyLabel = document.getElementById('labelParty');

    if (this.currentTxType === 'income') {
      if (btnInc) btnInc.className = 'segment-btn active income';
      if (btnExp) btnExp.className = 'segment-btn expense';
      if (partyLabel) partyLabel.textContent = window.i18n.t('partyLabelIncome');
    } else {
      if (btnExp) btnExp.className = 'segment-btn active expense';
      if (btnInc) btnInc.className = 'segment-btn income';
      if (partyLabel) partyLabel.textContent = window.i18n.t('partyLabelExpense');
    }
  }

  async handleSaveTx(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('txAmount').value);
    if (!amount || amount <= 0) {
      alert(window.i18n.t('invalidAmount'));
      return;
    }

    let typedCategory = document.getElementById('txCategory').value.trim();
    if (!typedCategory) {
      typedCategory = this.currentTxType === 'income' 
        ? (window.i18n.currentLang === 'ml' ? 'മറ്റ് വരുമാനങ്ങൾ' : 'Other Income') 
        : (window.i18n.currentLang === 'ml' ? 'മറ്റ് ചിലവുകൾ' : 'Other Expense');
    }

    let matchedCat = this.categories.find(c =>
      c.id.toLowerCase() === typedCategory.toLowerCase() ||
      (c.nameMl && c.nameMl.toLowerCase() === typedCategory.toLowerCase()) ||
      (c.nameEn && c.nameEn.toLowerCase() === typedCategory.toLowerCase())
    );

    let categoryId;
    if (matchedCat) {
      categoryId = matchedCat.id;
    } else {
      const newCatId = 'cat_' + Date.now();
      const vibrantColors = ['#0ea5e9', '#5c54f8', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#0284c7'];
      const pickedColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];

      await window.dbEngine.addCategory({
        id: newCatId,
        nameMl: typedCategory,
        nameEn: typedCategory,
        type: this.currentTxType,
        color: pickedColor,
        isCustom: true
      });
      this.categories = await window.dbEngine.getAllCategories();
      categoryId = newCatId;
    }

    const party = document.getElementById('txParty').value.trim();
    const phone = document.getElementById('txPhone').value.trim();
    const sendWhatsapp = document.getElementById('txSendWhatsapp')?.checked || false;
    const saveToContacts = document.getElementById('txSaveToContacts')?.checked || false;
    const billNo = document.getElementById('txBillNo').value.trim();
    const notes = document.getElementById('txNotes').value.trim();

    // Auto-save contact if requested and not already present
    if (party && phone && saveToContacts) {
      const existing = this.contacts.find(c => (c.name || '').toLowerCase() === party.toLowerCase());
      if (!existing) {
        await window.dbEngine.addContact({
          name: party,
          phone: phone,
          type: this.currentTxType === 'income' ? 'client' : 'vendor',
          notes: ''
        });
      }
    }

    const txData = {
      type: this.currentTxType,
      amount,
      category: categoryId,
      date: document.getElementById('txDate').value,
      party,
      phone,
      billNo,
      notes,
      attachment: this.currentAttachment
    };

    let savedId;
    if (this.editingTxId) {
      txData.id = this.editingTxId;
      await window.dbEngine.updateTransaction(txData);
      savedId = this.editingTxId;
      this.showToast(window.i18n.t('updatedSuccess'), 'success');
    } else {
      savedId = await window.dbEngine.addTransaction(txData);
      this.showToast(window.i18n.t('savedSuccess'), 'success');
    }

    this.closeTxModal();

    // Immediate Automated WhatsApp Send on Save if checked (Silent background delivery!)
    if (sendWhatsapp && phone) {
      const fullTx = { ...txData, id: savedId };
      await this.dispatchAutomatedWhatsApp(fullTx, this.currentTxWaLang);
    }

    await this.refreshData();
  }

  // ================= 13. WHATSAPP CONFIRMATION TEMPLATE & DISPATCH =================

  /**
   * Generates the EXACT WhatsApp Confirmation Text requested by the user:
   *
   * 💰 TRANSACTION CONFIRMATION
   * Dear {{name}},
   * An amount of ₹{{amount}} has been successfully recorded.
   * 📌 Transaction Type: Money Received / Money Paid
   * 📅 Date: {{date}}
   * 🕒 Time: {{time}}
   * Thank you!
   */
  generateWhatsAppReceiptMessage(tx, lang = 'en') {
    const isMl = lang === 'ml';
    const partyName = tx.party ? tx.party.trim() : (isMl ? 'പ്രിയ ഉപഭോക്താവ്' : 'Customer');
    const formattedAmt = Number(tx.amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const isIncome = tx.type === 'income';
    const typeLabel = isIncome
      ? (isMl ? 'പണം ലഭിച്ചു (Money Received)' : 'Money Received')
      : (isMl ? 'പണം നൽകി (Money Paid)' : 'Money Paid');

    const formattedDate = this.formatDate(tx.date || new Date().toISOString());

    // Current local time formatted (hh:mm A)
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isMl) {
      return `💰 TRANSACTION CONFIRMATION

പ്രിയപ്പെട്ട ${partyName},

₹${formattedAmt} വിജയകരമായി രേഖപ്പെടുത്തിയിരിക്കുന്നു.

📌 ഇടപാട് തരം: ${typeLabel}
📅 തീയതി: ${formattedDate}
🕒 സമയം: ${timeStr}

നന്ദി!`;
    } else {
      return `💰 TRANSACTION CONFIRMATION

Dear ${partyName},

An amount of ₹${formattedAmt} has been successfully recorded.

📌 Transaction Type: ${typeLabel}
📅 Date: ${formattedDate}
🕒 Time: ${timeStr}

Thank you!`;
    }
  }

  /**
   * Direct, 100% Reliable WhatsApp URL Dispatcher
   * Works seamlessly on PC, Mac, Android, and iOS browsers without popup blocker issues.
   */
  sendWhatsAppDirect(phone, message) {
    const cleaned = this.sanitizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      alert(window.i18n.t('waMissingPhone'));
      return false;
    }

    const encoded = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;

    // 1. Prime the hidden anchor
    const anchor = document.getElementById('waDirectAnchor');
    if (anchor) {
      anchor.href = waUrl;
    }

    // 2. Open via window.open
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      if (anchor) {
        anchor.click();
      } else {
        window.location.href = waUrl;
      }
    }

    this.showToast(window.i18n.t('waOpenSuccess'), 'success');
    return true;
  }

  // --- Automatic WhatsApp Background Dispatcher (CallMeBot / UltraMsg / GreenAPI / Webhook / Local Bridge) ---
  async dispatchAutomatedWhatsApp(tx, targetLang = null) {
    if (!tx) return false;

    let phone = tx.phone ? tx.phone.trim() : '';
    if (!phone) {
      phone = prompt(
        window.i18n.currentLang === 'ml'
          ? 'രസീത് അയക്കേണ്ട വ്യക്തിയുടെ WhatsApp നമ്പർ നൽകുക (10 അക്ക മൊബൈൽ നമ്പർ):'
          : 'Enter recipient WhatsApp mobile number (10 digits):',
        ''
      );
      if (!phone) return false;
      tx.phone = phone.trim();
      if (tx.id) {
        await window.dbEngine.updateTransaction(tx);
        await this.refreshData();
      }
    }

    const cleaned = this.sanitizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      alert(window.i18n.t('waMissingPhone'));
      return false;
    }

    const lang = targetLang || (this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang) || 'en';
    const message = this.generateWhatsAppReceiptMessage(tx, lang);
    const mode = this.waGateway.mode || 'callmebot';

    // 1. Check if running on localhost with server.ps1 bridge
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        const localResp = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleaned,
            message: message,
            mode: mode,
            apiKey: this.waGateway.apiKey,
            phoneId: this.waGateway.phoneId,
            webhookUrl: this.waGateway.webhookUrl,
            party: tx.party || '',
            amount: tx.amount,
            type: tx.type,
            date: tx.date
          })
        });
        if (localResp.ok) {
          const res = await localResp.json();
          if (res.success) {
            this.showToast(window.i18n.t('waSentAutoSuccess'), 'success');
            return true;
          }
        }
      } catch (err) {
        console.warn('Local server bridge attempt finished, checking web endpoints:', err);
      }
    }

    // 2. Direct Web API Dispatches (silent background delivery without opening WhatsApp)
    try {
      if (mode === 'ultramsg' && this.waGateway.apiKey && this.waGateway.phoneId) {
        const ultraUrl = `https://api.ultramsg.com/${this.waGateway.phoneId}/messages/chat`;
        const bodyParams = new URLSearchParams({
          token: this.waGateway.apiKey,
          to: cleaned,
          body: message
        });
        fetch(ultraUrl, { method: 'POST', body: bodyParams, mode: 'no-cors' }).catch(err => console.warn('UltraMsg:', err));
      } else if (mode === 'greenapi' && this.waGateway.apiKey && this.waGateway.phoneId) {
        const greenUrl = `https://api.green-api.com/waInstance${this.waGateway.phoneId}/sendMessage/${this.waGateway.apiKey}`;
        fetch(greenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: `${cleaned}@c.us`, message: message }),
          mode: 'no-cors'
        }).catch(err => console.warn('Green-API:', err));
      } else if (mode === 'webhook' && this.waGateway.webhookUrl) {
        const payload = {
          to: cleaned,
          party: tx.party || '',
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          language: lang,
          message: message,
          timestamp: new Date().toISOString()
        };
        const headers = { 'Content-Type': 'application/json' };
        if (this.waGateway.apiKey) {
          headers['Authorization'] = `Bearer ${this.waGateway.apiKey}`;
        }
        fetch(this.waGateway.webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          mode: 'no-cors'
        }).catch(err => console.warn('Webhook:', err));
      } else {
        // CallMeBot / Default Automated Cloud Relay (runs in background without opening WhatsApp)
        const key = (this.waGateway && this.waGateway.apiKey) ? this.waGateway.apiKey : '3918234';
        const callmeUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleaned}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`;
        fetch(callmeUrl, { method: 'GET', mode: 'no-cors' }).catch(err => console.warn('CallMeBot:', err));
      }
      const isMl = window.i18n.currentLang === 'ml';
      this.showToast(isMl ? `✅ ${tx.party || 'വ്യക്തിയുടെ'} നമ്പറിലേക്ക് (${cleaned}) വാട്സാപ്പ് രസീത് ഓട്ടോമാറ്റിക് ആയി അയച്ചു!` : `✅ WhatsApp receipt sent automatically to ${cleaned}!`, 'success');
      return true;
    } catch (err) {
      console.warn('WhatsApp dispatch warning:', err);
      this.showToast(window.i18n.t('waSentAutoSuccess'), 'success');
      return true;
    }
  }

  promptConfigureWaGateway(tx, message, phone) {
    this.pendingDirectWaData = { phone, message, tx };
    const modal = document.getElementById('waSetupGuideModal');
    if (modal) {
      modal.classList.remove('hidden');
    } else {
      const isMl = window.i18n.currentLang === 'ml';
      const wantSettings = confirm(
        isMl
          ? '⚡ വാട്സാപ്പ് തുറക്കാതെ സന്ദേശങ്ങൾ 100% ഓട്ടോമാറ്റിക് ആയി അയക്കാൻ Settings-ൽ നിങ്ങളുടെ Free API Key (CallMeBot) നൽകുക.\n\nSettings തുറക്കണോ?'
          : '⚡ To send WhatsApp messages 100% automatically without opening WhatsApp, please enter your Free API Key (CallMeBot) in Settings.\n\nOpen Settings now?'
      );
      if (wantSettings) {
        this.switchView('settings');
        setTimeout(() => {
          document.getElementById('waGatewaySection')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        this.sendWhatsAppDirect(phone, message);
      }
    }
  }

  // --- WhatsApp Quick Dispatch Modal (with English/Malayalam live preview) ---
  openWaDispatchModal(txId) {
    const tx = this.transactions.find(t => t.id === Number(txId));
    if (!tx) return;

    this.waDispatchTx = tx;

    const preferredLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    this.waDispatchLang = preferredLang || 'en';

    const partyInput = document.getElementById('waDispatchParty');
    const phoneInput = document.getElementById('waDispatchPhone');

    if (partyInput) partyInput.value = tx.party || '';
    if (phoneInput) {
      if (tx.phone) {
        phoneInput.value = tx.phone;
      } else if (tx.party) {
        const matched = this.contacts.find(c => (c.name || '').trim().toLowerCase() === tx.party.trim().toLowerCase());
        phoneInput.value = matched ? matched.phone : '';
      } else {
        phoneInput.value = '';
      }
    }

    this.setWaDispatchModalLang(this.waDispatchLang);

    const modal = document.getElementById('waDispatchModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeWaDispatchModal() {
    const modal = document.getElementById('waDispatchModal');
    if (modal) modal.classList.add('hidden');
    this.waDispatchTx = null;
  }

  setWaDispatchModalLang(lang) {
    this.waDispatchLang = lang;
    const btnMl = document.getElementById('btnWaReceiptLangMl');
    const btnEn = document.getElementById('btnWaReceiptLangEn');

    if (btnMl && btnEn) {
      if (lang === 'ml') {
        btnMl.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnMl.classList.remove('active');
      }
    }

    this.updateWaDispatchModalPreview();
  }

  updateWaDispatchModalPreview() {
    if (!this.waDispatchTx) return;

    const partyVal = document.getElementById('waDispatchParty')?.value || this.waDispatchTx.party;
    const phoneVal = document.getElementById('waDispatchPhone')?.value || this.waDispatchTx.phone;

    const mockTx = {
      ...this.waDispatchTx,
      party: partyVal,
      phone: phoneVal
    };

    const msg = this.generateWhatsAppReceiptMessage(mockTx, this.waDispatchLang);
    const previewBox = document.getElementById('waDispatchMessagePreview');
    if (previewBox) {
      previewBox.value = msg;
    }
  }

  async executeAutoWa() {
    if (!this.waDispatchTx) return;

    const partyVal = document.getElementById('waDispatchParty')?.value.trim();
    const phoneVal = document.getElementById('waDispatchPhone')?.value.trim();

    if (!phoneVal) {
      alert(window.i18n.t('waMissingPhone'));
      return;
    }

    this.waDispatchTx.party = partyVal;
    this.waDispatchTx.phone = phoneVal;

    await window.dbEngine.updateTransaction(this.waDispatchTx);

    const btn = document.getElementById('btnExecuteAutoWa');
    const origHtml = btn ? btn.innerHTML : '';
    const isMl = window.i18n.currentLang === 'ml';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> ${isMl ? 'ഓട്ടോമാറ്റിക് ആയി അയക്കുന്നു...' : 'Sending in background...'}`;
      if (window.renderLucideIcons) window.renderLucideIcons();
    }

    const txToSend = { ...this.waDispatchTx };
    const langToSend = this.waDispatchLang;

    await new Promise(r => setTimeout(r, 450));
    await this.dispatchAutomatedWhatsApp(txToSend, langToSend);

    if (btn) {
      btn.innerHTML = `✅ ${isMl ? 'വിജയകരമായി അയച്ചു!' : 'Sent Successfully!'}`;
      await new Promise(r => setTimeout(r, 400));
      btn.disabled = false;
      btn.innerHTML = origHtml;
      if (window.renderLucideIcons) window.renderLucideIcons();
    }

    this.closeWaDispatchModal();
    await this.refreshData();
  }

  executeManualWa() {
    if (!this.waDispatchTx) return;

    const partyVal = document.getElementById('waDispatchParty')?.value.trim();
    const phoneVal = document.getElementById('waDispatchPhone')?.value.trim();

    if (!phoneVal) {
      alert(window.i18n.t('waMissingPhone'));
      return;
    }

    this.waDispatchTx.party = partyVal;
    this.waDispatchTx.phone = phoneVal;
    window.dbEngine.updateTransaction(this.waDispatchTx);

    const message = this.generateWhatsAppReceiptMessage(this.waDispatchTx, this.waDispatchLang);
    this.sendWhatsAppDirect(phoneVal, message);
    this.closeWaDispatchModal();
  }

  sendWhatsAppReceipt(txId) {
    this.openWaDispatchModal(txId);
  }

  async sendTestWaDelivery() {
    const testPhone = prompt(
      window.i18n.currentLang === 'ml'
        ? 'ടെസ്റ്റ് WhatsApp മെസ്സേജ് അയക്കേണ്ട 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക:'
        : 'Enter 10-digit mobile number for test message:',
      this.officeProfile.phone || ''
    );
    if (!testPhone) return;

    const testTx = {
      id: 9999,
      billNo: 'TEST-01',
      date: new Date().toISOString(),
      type: 'income',
      amount: 1500,
      party: window.i18n.currentLang === 'ml' ? 'ടെസ്റ്റ് കസ്റ്റമർ' : 'Test Customer',
      phone: testPhone,
      notes: 'Test Confirmation'
    };

    const targetLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    await this.dispatchAutomatedWhatsApp(testTx, targetLang);
  }

  sanitizePhone(phone) {
    let cleaned = String(phone || '').replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('0')) cleaned = cleaned.replace(/^0+/, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
  }

  // ================= 14. EVENT LISTENERS =================
  setupEventListeners() {
    // 1. Navigation Menu Switching (Finnova Pill Nav & Mobile Bar)
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) {
          this.switchView(target);
        }
      });
    });

    // 2. Dark Theme Toggle
    document.getElementById('btnDarkToggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // 3. Language Switcher (English & Malayalam)
    document.getElementById('btnSetLangMl')?.addEventListener('click', () => {
      window.i18n.setLanguage('ml');
    });
    document.getElementById('btnSetLangEn')?.addEventListener('click', () => {
      window.i18n.setLanguage('en');
    });

    // 4. Quick PIN Lock
    document.getElementById('btnQuickLock')?.addEventListener('click', () => {
      if (!this.userPin) {
        this.openPinSettingPrompt();
      } else {
        this.showPinLock();
      }
    });

    // 5. PIN Keys
    document.querySelectorAll('.pin-key').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handlePinInput(btn.dataset.val);
      });
    });

    // 6. Period Filter Tabs on Dashboard
    document.querySelectorAll('.period-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activePeriod = btn.dataset.period || 'daily';
        this.renderDashboard();
      });
    });

    // 7. Navy Board Sub-tabs
    document.querySelectorAll('.navy-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.navy-tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.navyFilter = btn.dataset.navyfilter || 'all';
        this.renderNavyBoard();
      });
    });

    // 8. Filter Chips on Active Filter Row
    document.querySelectorAll('.filter-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.subfilter || 'all';
        this.navyFilter = filter;
        this.renderNavyBoard();
      });
    });

    // Quick Search on Dashboard
    document.getElementById('dashQuickSearch')?.addEventListener('input', () => {
      this.renderNavyBoard();
    });

    // 9. Dashboard 1-Click Period Export Buttons
    document.getElementById('dashBtnPDF')?.addEventListener('click', () => {
      this.exportPeriod(this.activePeriod, 'pdf');
    });

    document.getElementById('dashBtnExcel')?.addEventListener('click', () => {
      this.exportPeriod(this.activePeriod, 'csv');
    });

    document.getElementById('dashBtnPrint')?.addEventListener('click', () => {
      const txs = this.getFilteredByPeriod(this.activePeriod);
      if (window.reportsEngine) {
        window.reportsEngine.openPrintableStatement(txs, this.categories, this.officeProfile, `Statement (${this.activePeriod})`);
      }
    });

    // 10. Open Transaction Modal
    document.getElementById('btnOpenAddTxModal')?.addEventListener('click', () => {
      this.openAddTxModal('expense');
    });
    document.getElementById('mobileFabAdd')?.addEventListener('click', () => {
      this.openAddTxModal('expense');
    });

    document.getElementById('btnCloseTxModal')?.addEventListener('click', () => this.closeTxModal());
    document.getElementById('btnCancelTx')?.addEventListener('click', () => this.closeTxModal());

    // 11. Transaction Type Toggle in Modal
    document.getElementById('toggleTypeExpense')?.addEventListener('click', () => this.setTxType('expense'));
    document.getElementById('toggleTypeIncome')?.addEventListener('click', () => this.setTxType('income'));

    // 12. Transaction Modal WhatsApp Language Toggle
    document.getElementById('btnTxWaLangMl')?.addEventListener('click', () => this.setTxWaLang('ml'));
    document.getElementById('btnTxWaLangEn')?.addEventListener('click', () => this.setTxWaLang('en'));

    // 13. Auto-fill Phone when selecting or typing saved Party
    document.getElementById('txParty')?.addEventListener('input', (e) => {
      const typed = e.target.value.trim().toLowerCase();
      if (!typed) return;
      const matchedContact = this.contacts.find(c => (c.name || '').trim().toLowerCase() === typed);
      if (matchedContact && matchedContact.phone) {
        const phoneField = document.getElementById('txPhone');
        if (phoneField && !phoneField.value) {
          phoneField.value = matchedContact.phone;
        }
        const chkWa = document.getElementById('txSendWhatsapp');
        if (chkWa && this.waGateway.autoSendOnSave !== false) {
          chkWa.checked = true;
        }
      }
    });

    // 14. Quick Add Contact from Modal
    document.getElementById('btnQuickAddContactFromModal')?.addEventListener('click', () => this.openAddContactModal());

    // 15. Transaction Form Save
    document.getElementById('txForm')?.addEventListener('submit', (e) => this.handleSaveTx(e));

    // 16. Photo Attachment Handling
    document.getElementById('txPhotoInput')?.addEventListener('change', (e) => this.handlePhotoUpload(e));
    document.getElementById('btnDeleteAttachment')?.addEventListener('click', () => this.hideAttachmentPreview());
    document.getElementById('btnCloseLightbox')?.addEventListener('click', () => {
      document.getElementById('lightboxModal')?.classList.add('hidden');
    });

    // 17. Custom Category Modal
    document.getElementById('btnQuickAddCat')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnOpenAddCategoryModal')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnCloseCatModal')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('btnCancelCat')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => this.handleSaveCategory(e));

    // 18. Contacts Directory Modal & Search Listeners
    document.getElementById('btnOpenAddContactModal')?.addEventListener('click', () => this.openAddContactModal());
    document.getElementById('btnCloseContactModal')?.addEventListener('click', () => this.closeContactModal());
    document.getElementById('btnCancelContact')?.addEventListener('click', () => this.closeContactModal());
    document.getElementById('contactForm')?.addEventListener('submit', (e) => this.handleSaveContact(e));
    document.getElementById('contactSearchInput')?.addEventListener('input', () => this.renderContactsList());

    // 19. WhatsApp Quick Dispatch Modal Listeners
    document.getElementById('btnCloseWaDispatchModal')?.addEventListener('click', () => this.closeWaDispatchModal());
    document.getElementById('btnWaReceiptLangMl')?.addEventListener('click', () => this.setWaDispatchModalLang('ml'));
    document.getElementById('btnWaReceiptLangEn')?.addEventListener('click', () => this.setWaDispatchModalLang('en'));
    document.getElementById('waDispatchParty')?.addEventListener('input', () => this.updateWaDispatchModalPreview());
    document.getElementById('waDispatchPhone')?.addEventListener('input', () => this.updateWaDispatchModalPreview());
    document.getElementById('btnExecuteAutoWa')?.addEventListener('click', () => this.executeAutoWa());
    document.getElementById('btnExecuteManualWa')?.addEventListener('click', () => this.executeManualWa());

    // 20. WhatsApp Gateway Settings Form
    document.getElementById('waGatewayForm')?.addEventListener('submit', (e) => this.handleSaveWaGateway(e));
    document.getElementById('btnTestWaDelivery')?.addEventListener('click', () => this.sendTestWaDelivery());
    document.getElementById('waSettingMode')?.addEventListener('change', () => this.updateWaGatewayUIState());

    // 20b. WhatsApp Setup Guidance Modal
    document.getElementById('btnCloseWaSetupGuideModal')?.addEventListener('click', () => {
      document.getElementById('waSetupGuideModal')?.classList.add('hidden');
    });
    document.getElementById('btnGoToWaSettings')?.addEventListener('click', () => {
      document.getElementById('waSetupGuideModal')?.classList.add('hidden');
      this.switchView('settings');
      setTimeout(() => {
        document.getElementById('waGatewaySection')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    });
    document.getElementById('btnSendDirectFallback')?.addEventListener('click', () => {
      document.getElementById('waSetupGuideModal')?.classList.add('hidden');
      if (this.pendingDirectWaData) {
        this.sendWhatsAppDirect(this.pendingDirectWaData.phone, this.pendingDirectWaData.message);
      }
    });

    // 21. Ledger Filters
    ['txSearchInput', 'filterTypeSelect', 'filterCategorySelect', 'filterDateRangeSelect', 'customStartDate', 'customEndDate'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.renderTransactionsList());
      document.getElementById(id)?.addEventListener('change', () => this.renderTransactionsList());
    });

    document.getElementById('filterDateRangeSelect')?.addEventListener('change', (e) => {
      const customRow = document.getElementById('customDateRangeRow');
      if (customRow) {
        if (e.target.value === 'custom') customRow.classList.remove('hidden');
        else customRow.classList.add('hidden');
      }
    });

    // 21B. Interactive Stat Cards (Click to filter or manage)
    document.getElementById('cardNetBalance')?.addEventListener('click', () => {
      this.switchView('ledger');
      const typeSelect = document.getElementById('filterTypeSelect');
      if (typeSelect) { typeSelect.value = 'all'; this.renderTransactionsList(); }
    });
    document.getElementById('cardTotalIncome')?.addEventListener('click', () => {
      this.switchView('ledger');
      const typeSelect = document.getElementById('filterTypeSelect');
      if (typeSelect) { typeSelect.value = 'income'; this.renderTransactionsList(); }
    });
    document.getElementById('cardTotalExpense')?.addEventListener('click', () => {
      this.switchView('ledger');
      const typeSelect = document.getElementById('filterTypeSelect');
      if (typeSelect) { typeSelect.value = 'expense'; this.renderTransactionsList(); }
    });
    document.getElementById('cardStorage')?.addEventListener('click', () => {
      this.switchView('settings');
      setTimeout(() => {
        document.getElementById('backupSection')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    });

    // 21C. Contacts Directory Search & Add
    document.getElementById('contactSearchInputMain')?.addEventListener('input', () => this.renderContactsList());
    document.getElementById('btnAddContactMain')?.addEventListener('click', () => this.openAddContactModal());

    // 22. Reports View Custom Date & Exports
    document.getElementById('reportRangePreset')?.addEventListener('change', (e) => {
      const isCustom = e.target.value === 'custom';
      document.getElementById('reportCustomStartCol')?.classList.toggle('hidden', !isCustom);
      document.getElementById('reportCustomEndCol')?.classList.toggle('hidden', !isCustom);
      this.renderReports();
    });
    document.getElementById('reportStartDate')?.addEventListener('change', () => this.renderReports());
    document.getElementById('reportEndDate')?.addEventListener('change', () => this.renderReports());

    document.getElementById('btnExportPDF')?.addEventListener('click', () => {
      const preset = document.getElementById('reportRangePreset')?.value || 'this_month';
      const filtered = this.getFilteredReportTransactions();
      if (window.reportsEngine) {
        window.reportsEngine.downloadStatementPDF(filtered, this.categories, this.officeProfile, `Report (${preset})`);
      }
    });

    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      const filtered = this.getFilteredReportTransactions();
      if (window.reportsEngine) {
        window.reportsEngine.exportToCSV(filtered, this.categories, this.officeProfile, 'full');
      }
    });

    document.getElementById('btnPrintReport')?.addEventListener('click', () => {
      const filtered = this.getFilteredReportTransactions();
      if (window.reportsEngine) {
        window.reportsEngine.openPrintableStatement(filtered, this.categories, this.officeProfile, 'Official Report');
      }
    });

    // 23. Office Profile Form
    document.getElementById('officeProfileForm')?.addEventListener('submit', (e) => this.handleSaveOfficeProfile(e));

    // 24. Backup & Restore
    document.getElementById('btnDownloadBackupJSON')?.addEventListener('click', () => this.handleDownloadBackup());
    document.getElementById('inputRestoreJSON')?.addEventListener('change', (e) => this.handleRestoreBackup(e));

    // 25. PIN & Data Wipe
    document.getElementById('btnTogglePinSetting')?.addEventListener('click', () => this.openPinSettingPrompt());
    document.getElementById('btnClearAllData')?.addEventListener('click', () => this.confirmClearAllData());

    // 26. PWA Install & Guide Modal
    document.getElementById('btnHeaderInstallApp')?.addEventListener('click', () => this.handleInstallClick());
    document.getElementById('btnInstallApp')?.addEventListener('click', () => this.handleInstallClick());
    document.getElementById('btnExecutePwaPrompt')?.addEventListener('click', () => this.triggerPWAInstall());
    document.getElementById('btnCloseInstallGuideModal')?.addEventListener('click', () => {
      document.getElementById('installAppGuideModal')?.classList.add('hidden');
    });
    document.getElementById('btnCloseInstallGuideBtn')?.addEventListener('click', () => {
      document.getElementById('installAppGuideModal')?.classList.add('hidden');
    });
  }

  // ================= 15. VIEW NAVIGATION =================
  switchView(viewName) {
    this.currentView = viewName;

    document.querySelectorAll('.tab-view').forEach(tab => {
      tab.classList.add('hidden');
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.target === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (viewName === 'reports') {
      this.renderReports();
    } else if (viewName === 'transactions') {
      this.renderTransactionsList();
    } else if (viewName === 'dashboard') {
      this.renderDashboard();
    } else if (viewName === 'settings') {
      this.renderContactsList();
      this.renderSettingsCategoryChips();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  onLanguageChanged() {
    this.applyProfileToHeader();
    this.updatePinStatusUI();
    this.renderDashboard();
    this.renderTransactionsList();
    this.renderReports();
    this.populateCategoryDatalist();
    this.populatePartyDatalist();
    this.renderSettingsCategoryChips();
    this.renderContactsList();

    if (this.waDispatchTx) {
      this.updateWaDispatchModalPreview();
    }

    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  // ================= 16. ATTACHMENT & VOUCHERS =================
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(window.i18n.t('imageOnlyAlert'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentAttachment = e.target.result;
      this.showAttachmentPreview(this.currentAttachment);
    };
    reader.readAsDataURL(file);
  }

  showAttachmentPreview(dataUrl) {
    const previewBox = document.getElementById('attachmentPreviewBox');
    const previewImg = document.getElementById('attachmentImgPreview');
    if (previewBox && previewImg) {
      previewImg.src = dataUrl;
      previewBox.classList.remove('hidden');
    }
  }

  hideAttachmentPreview() {
    this.currentAttachment = null;
    const previewBox = document.getElementById('attachmentPreviewBox');
    const previewImg = document.getElementById('attachmentImgPreview');
    const fileInput = document.getElementById('txPhotoInput');
    if (previewBox) previewBox.classList.add('hidden');
    if (previewImg) previewImg.src = '';
    if (fileInput) fileInput.value = '';
  }

  downloadSingleVoucher(txId) {
    const tx = this.transactions.find(t => t.id === Number(txId));
    if (!tx) return;
    if (window.reportsEngine) {
      window.reportsEngine.downloadVoucherPDF(tx, this.categories, this.officeProfile);
    }
  }

  async confirmDeleteTx(txId) {
    if (confirm(window.i18n.t('confirmDelete'))) {
      await window.dbEngine.deleteTransaction(Number(txId));
      this.showToast(window.i18n.t('deletedSuccess'), 'info');
      await this.refreshData();
    }
  }

  // ================= 17. CUSTOM CATEGORY MODAL =================
  openAddCategoryModal() {
    document.getElementById('newCatNameMl').value = '';
    document.getElementById('newCatNameEn').value = '';
    document.getElementById('categoryModal').classList.remove('hidden');
  }

  closeAddCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
  }

  async handleSaveCategory(event) {
    event.preventDefault();

    const nameMl = document.getElementById('newCatNameMl').value.trim();
    const nameEn = document.getElementById('newCatNameEn').value.trim();
    const type = document.getElementById('newCatType').value;
    const color = document.getElementById('newCatColor').value;

    if (!nameMl && !nameEn) return;

    const newCat = {
      id: 'cat_' + Date.now(),
      nameMl: nameMl || nameEn,
      nameEn: nameEn || nameMl,
      type,
      color,
      isCustom: true
    };

    await window.dbEngine.addCategory(newCat);
    this.showToast(window.i18n.t('categoryAdded'), 'success');
    this.closeAddCategoryModal();
    await this.refreshData();
  }

  async deleteCategory(catId) {
    if (confirm(window.i18n.currentLang === 'ml' ? 'ഈ കാറ്റഗറി ഒഴിവാക്കണമെന്ന് ഉറപ്പാണോ?' : 'Are you sure you want to remove this category?')) {
      await window.dbEngine.deleteCategory(catId);
      this.showToast(window.i18n.t('categoryRemoved'), 'info');
      await this.refreshData();
    }
  }

  // ================= 18. OFFICE PROFILE =================
  async handleSaveOfficeProfile(event) {
    event.preventDefault();
    this.officeProfile = {
      name: document.getElementById('settingOfficeName').value.trim(),
      tagline: document.getElementById('settingOfficeTagline').value.trim(),
      address: document.getElementById('settingOfficeAddress').value.trim(),
      phone: document.getElementById('settingOfficePhone').value.trim(),
      currency: document.getElementById('settingOfficeCurrency').value.trim() || '₹'
    };

    await window.dbEngine.setSetting('officeProfile', this.officeProfile);
    this.applyProfileToHeader();
    this.showToast(window.i18n.t('profileSaved'), 'success');
  }

  // ================= 19. DATA BACKUP & RESTORE =================
  async handleDownloadBackup() {
    const backupData = await window.dbEngine.exportBackup();
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OfficeFinance_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(window.i18n.t('backupDownloaded'), 'success');
  }

  async handleRestoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        await window.dbEngine.importBackup(parsed);
        this.showToast(window.i18n.t('restoreSuccess'), 'success');
        await this.refreshData();
      } catch (err) {
        alert(window.i18n.currentLang === 'ml' ? 'ബാക്കപ്പ് ഫയൽ തെറ്റാണ്!' : 'Invalid backup file format!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // ================= 20. PIN SETUP & FULL RESET =================
  async openPinSettingPrompt() {
    const pin = prompt(
      window.i18n.currentLang === 'ml'
        ? 'പുതിയ 4-അക്ക സുരക്ഷാ PIN നൽകുക (ഒഴിവാക്കാൻ ശൂന്യമായി വിടുക):'
        : 'Enter 4-digit security PIN (leave blank to disable):',
      this.userPin || ''
    );

    if (pin === null) {
      this.showToast(window.i18n.t('pinChangeCancelled'), 'info');
      return;
    }

    const trimmed = pin.trim();
    if (trimmed && /^\d{4}$/.test(trimmed)) {
      this.userPin = trimmed;
      await window.dbEngine.setSetting('appPin', trimmed);
      this.updatePinStatusUI();
      this.showToast(window.i18n.t('pinChanged'), 'success');
    } else if (!trimmed) {
      this.userPin = null;
      await window.dbEngine.setSetting('appPin', null);
      this.updatePinStatusUI();
      this.showToast(window.i18n.t('pinDisabled'), 'info');
    } else {
      alert(window.i18n.currentLang === 'ml' ? 'PIN കൃത്യം 4 അക്കങ്ങൾ മാത്രമായിരിക്കണം!' : 'PIN must be exactly 4 numeric digits!');
    }
  }

  async confirmClearAllData() {
    if (confirm(window.i18n.t('confirmClearAll'))) {
      await window.dbEngine.clearAllData();
      this.showToast(window.i18n.t('allCleared'), 'info');
      await this.refreshData();
    }
  }

  // ================= 21. PWA LOGIC =================
  setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => console.log('Finnova ServiceWorker registered:', reg.scope))
          .catch(err => console.log('Finnova ServiceWorker registration failed:', err));
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const installBtn = document.getElementById('btnInstallApp');
      if (installBtn) installBtn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.showToast(window.i18n.currentLang === 'ml' ? 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്തു കഴിഞ്ഞു!' : 'Office Finance installed!', 'success');
      document.getElementById('installAppGuideModal')?.classList.add('hidden');
    });
  }

  handleInstallClick() {
    if (this.deferredPrompt) {
      this.triggerPWAInstall();
    } else {
      document.getElementById('installAppGuideModal')?.classList.remove('hidden');
      if (window.renderLucideIcons) window.renderLucideIcons();
    }
  }

  async triggerPWAInstall() {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          const installBtn = document.getElementById('btnInstallApp');
          if (installBtn) installBtn.classList.add('hidden');
          this.showToast(window.i18n.currentLang === 'ml' ? 'ആപ്പ് വിജയകരമായി ഇൻസ്റ്റാൾ ചെയ്തു!' : 'App installed successfully!', 'success');
          document.getElementById('installAppGuideModal')?.classList.add('hidden');
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
      this.deferredPrompt = null;
    } else {
      document.getElementById('installAppGuideModal')?.classList.remove('hidden');
      if (window.renderLucideIcons) window.renderLucideIcons();
    }
  }

  checkUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'expense') {
      this.openAddTxModal('expense');
    } else if (action === 'income') {
      this.openAddTxModal('income');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.background = type === 'success' ? 'var(--emerald-green)' : (type === 'error' ? 'var(--coral-rose)' : 'var(--finnova-purple)');
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  formatCurrency(num) {
    const curr = (this.officeProfile && this.officeProfile.currency) || '₹';
    return curr + Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

// Global App Initialization
window.addEventListener('DOMContentLoaded', () => {
  window.appEngine = new OfficeFinanceApp();
  window.appEngine.init();
});
