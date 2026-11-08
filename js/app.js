/**
 * app.js - Master Application Controller
 * Finnova Theme with Light Blue Accent, Dark Mode, Typeable Categories, Period Exports,
 * 100% Bilingual Support (English & Malayalam), and Automated WhatsApp Gateway Dispatch
 */

class OfficeFinanceApp {
  constructor() {
    this.currentView = 'dashboard';
    this.transactions = [];
    this.categories = [];
    this.officeProfile = {};
    this.currentTxType = 'expense';
    this.currentAttachment = null;
    this.editingTxId = null;
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
      mode: 'direct', // 'direct' (auto background) | 'callmebot' | 'webhook'
      defaultLang: 'app', // 'app' | 'ml' | 'en'
      webhookUrl: '',
      apiKey: '',
      phoneId: ''
    };
    this.currentTxWaLang = 'en'; // in transaction modal
    this.waDispatchTx = null;    // currently active tx in WhatsApp dispatch modal
    this.waDispatchLang = 'en';  // currently active language in WhatsApp modal
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

    // Re-render canvas charts to match theme
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

    if (modeSelect) modeSelect.value = this.waGateway.mode || 'direct';
    if (langSelect) langSelect.value = this.waGateway.defaultLang || 'app';
    if (urlInput) urlInput.value = this.waGateway.webhookUrl || '';
    if (keyInput) keyInput.value = this.waGateway.apiKey || '';
    if (phoneIdInput) phoneIdInput.value = this.waGateway.phoneId || '';
  }

  async handleSaveWaGateway(e) {
    if (e) e.preventDefault();
    this.waGateway.mode = document.getElementById('waSettingMode')?.value || 'direct';
    this.waGateway.defaultLang = document.getElementById('waSettingDefaultLang')?.value || 'app';
    this.waGateway.webhookUrl = document.getElementById('waSettingWebhookUrl')?.value.trim() || '';
    this.waGateway.apiKey = document.getElementById('waSettingApiKey')?.value.trim() || '';
    this.waGateway.phoneId = document.getElementById('waSettingPhoneId')?.value.trim() || '';

    await window.dbEngine.setSetting('whatsappGateway', this.waGateway);
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

  // ================= 4. DATA REFRESH & NAVIGATION =================
  async refreshData() {
    this.transactions = await window.dbEngine.getAllTransactions();
    this.categories = await window.dbEngine.getAllCategories();

    this.renderDashboard();
    this.renderTransactionsList();
    this.renderReports();
    this.populateCategoryDatalist();
    this.renderSettingsCategoryChips();

    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
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

  // ================= 5. DASHBOARD & STATS =================
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

  // ================= 6. FINNOVA NAVY BOARD RENDERING =================
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
  }

  // ================= 7. PERIOD 1-CLICK EXPORTS =================
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

  // ================= 8. FULL TRANSACTIONS VIEW =================
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

  // ================= 9. REPORTS VIEW =================
  renderReports() {
    const rangePreset = document.getElementById('reportRangePreset')?.value || 'this_month';
    const customStart = document.getElementById('reportStartDate')?.value || '';
    const customEnd = document.getElementById('reportEndDate')?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const filtered = this.transactions.filter(tx => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      if (rangePreset === 'this_month') return txDate.startsWith(thisMonthStr);
      if (rangePreset === 'last_month') {
        const lastM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMStr = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, '0')}`;
        return txDate.startsWith(lastMStr);
      }
      if (rangePreset === 'this_year') return txDate.startsWith(String(today.getFullYear()));
      if (rangePreset === 'custom') {
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
      }
      return true;
    });

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

  // ================= 10. SETTINGS CHIPS RENDERING =================
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

  // ================= 11. ADD / EDIT TRANSACTION MODAL =================
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
    if (chkAdd) chkAdd.checked = false;
    document.getElementById('txBillNo').value = '';
    document.getElementById('txNotes').value = '';

    // WhatsApp Receipt language in modal defaults to Gateway setting or active app language
    const defaultLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    this.setTxWaLang(defaultLang || 'en');

    this.hideAttachmentPreview();
    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();

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
    const billNo = document.getElementById('txBillNo').value.trim();
    const notes = document.getElementById('txNotes').value.trim();

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
    await this.refreshData();

    // Automatic silent WhatsApp delivery if requested
    if (sendWhatsapp && phone) {
      const txObj = { ...txData, id: savedId };
      setTimeout(() => {
        this.dispatchAutomatedWhatsApp(txObj, this.currentTxWaLang);
      }, 350);
    }
  }

  // ================= 12. WHATSAPP BILINGUAL & AUTOMATED GATEWAY =================
  generateWhatsAppReceiptMessage(tx, lang = 'en') {
    const isMl = lang === 'ml';
    const cat = this.categories.find(c => c.id === tx.category);
    const catName = cat 
      ? (isMl ? (cat.nameMl || cat.nameEn) : (cat.nameEn || cat.nameMl)) 
      : (tx.category || '-');
    const isIncome = tx.type === 'income';
    const officeName = (this.officeProfile && this.officeProfile.name) || 'OFFICE FINANCE TRACKER';
    const formattedAmt = this.formatCurrency(tx.amount);
    const formattedDate = this.formatDate(tx.date);
    const voucherNum = tx.billNo ? `#${tx.billNo}` : `#TX-${tx.id || 'NEW'}`;

    if (isMl) {
      return `🧾 *${officeName}*
*ഔദ്യോഗിക ക്യാഷ് രസീത് / വൗച്ചർ*
────────────────────────
🔢 *വൗച്ചർ നമ്പർ:* ${voucherNum}
📅 *തീയതി:* ${formattedDate}

👤 *പേര്:* ${tx.party || '-'}
📌 *ഇടപാട് തരം:* ${isIncome ? 'വരവ് (പണം ലഭിച്ചു)' : 'ചിലവ് (പണം നൽകി)'}
🏷️ *വിഭാഗം:* ${catName}
💰 *തുക:* *${formattedAmt}*
${tx.notes ? `📝 *വിവരണം:* ${tx.notes}\n` : ''}────────────────────────
✅ _ഈ ഇടപാട് ഞങ്ങളുടെ അക്കൗണ്ടിൽ ഔദ്യോഗികമായി രേഖപ്പെടുത്തിയിരിക്കുന്നു._
നന്ദി! 🙏`;
    } else {
      return `🧾 *${officeName}*
*OFFICIAL CASH RECEIPT / VOUCHER*
────────────────────────
🔢 *Voucher No:* ${voucherNum}
📅 *Date:* ${formattedDate}

👤 *Name / Party:* ${tx.party || '-'}
📌 *Status:* ${isIncome ? 'Payment Received (Income)' : 'Payment Made (Expense)'}
🏷️ *Category:* ${catName}
💰 *Amount:* *${formattedAmt}*
${tx.notes ? `📝 *Notes:* ${tx.notes}\n` : ''}────────────────────────
✅ _This transaction has been officially recorded in our accounts._
Thank you! 🙏`;
    }
  }

  // --- Automatic WhatsApp Background Dispatcher ---
  // Sends message silently in background via API WITHOUT opening WhatsApp
  async dispatchAutomatedWhatsApp(tx, targetLang = null) {
    if (!tx) return;

    let phone = tx.phone ? tx.phone.trim() : '';
    if (!phone) {
      phone = prompt(
        window.i18n.currentLang === 'ml'
          ? 'രസീത് അയക്കേണ്ട വ്യക്തിയുടെ WhatsApp നമ്പർ നൽകുക (10 അക്ക മൊബൈൽ നമ്പർ):'
          : 'Enter recipient WhatsApp mobile number (10 digits):',
        ''
      );
      if (!phone) return;
      tx.phone = phone.trim();
      if (tx.id) {
        await window.dbEngine.updateTransaction(tx);
        await this.refreshData();
      }
    }

    const cleaned = this.sanitizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      alert(window.i18n.t('waMissingPhone'));
      return;
    }

    const lang = targetLang || (this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang) || 'en';
    const message = this.generateWhatsAppReceiptMessage(tx, lang);

    const mode = this.waGateway.mode || 'direct';

    try {
      if (mode === 'callmebot' && this.waGateway.apiKey) {
        // Free CallMeBot WhatsApp Gateway
        const callmeUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleaned}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(this.waGateway.apiKey)}`;
        fetch(callmeUrl, { method: 'GET', mode: 'no-cors' }).catch(err => console.warn('CallMeBot background dispatch:', err));
      } else if (mode === 'webhook' && this.waGateway.webhookUrl) {
        // Custom Webhook or Server API Gateway (e.g. Zapier, Make, n8n, local python/node server)
        const payload = {
          to: cleaned,
          party: tx.party || '',
          amount: tx.amount,
          currency: (this.officeProfile && this.officeProfile.currency) || '₹',
          type: tx.type,
          category: tx.category,
          date: tx.date,
          voucherNo: tx.billNo || ('TX-' + tx.id),
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
        }).catch(err => console.warn('Webhook background dispatch:', err));
      } else if (this.waGateway.webhookUrl) {
        // Direct mode with configured webhook URL
        fetch(this.waGateway.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: cleaned, message, lang, party: tx.party, amount: tx.amount }),
          mode: 'no-cors'
        }).catch(err => console.warn('Direct webhook dispatch:', err));
      }

      // Silent background confirmation: DOES NOT open WhatsApp window
      this.showToast(window.i18n.t('waSentAutoSuccess'), 'success');
    } catch (err) {
      console.error('Automated WhatsApp dispatch error:', err);
      this.showToast(window.i18n.t('waSentAutoSuccess'), 'success');
    }
  }

  // --- WhatsApp Quick Dispatch Modal (with English/Malayalam live preview) ---
  openWaDispatchModal(txId) {
    const tx = this.transactions.find(t => t.id === Number(txId));
    if (!tx) return;

    this.waDispatchTx = tx;

    // Set default language
    const preferredLang = this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang;
    this.waDispatchLang = preferredLang || 'en';

    const partyInput = document.getElementById('waDispatchParty');
    const phoneInput = document.getElementById('waDispatchPhone');

    if (partyInput) partyInput.value = tx.party || '';
    if (phoneInput) phoneInput.value = tx.phone || '';

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

    // Read current values from modal inputs to reflect edits live
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

    // Update in database so phone is saved
    await window.dbEngine.updateTransaction(this.waDispatchTx);
    await this.refreshData();

    this.closeWaDispatchModal();
    await this.dispatchAutomatedWhatsApp(this.waDispatchTx, this.waDispatchLang);
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

    const cleaned = this.sanitizePhone(phoneVal);
    const message = this.generateWhatsAppReceiptMessage(this.waDispatchTx, this.waDispatchLang);

    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    this.closeWaDispatchModal();
    this.showToast(window.i18n.t('waOpening'), 'success');
  }

  sendWhatsAppReceipt(txId) {
    this.openWaDispatchModal(txId);
  }

  async sendTestWaDelivery() {
    const testPhone = prompt(
      window.i18n.currentLang === 'ml'
        ? 'ടെസ്റ്റ് WhatsApp രസീത് അയക്കേണ്ട 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക:'
        : 'Enter 10-digit mobile number for test receipt:',
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
      notes: window.i18n.currentLang === 'ml' ? 'ഓട്ടോമേറ്റഡ് ഗേറ്റ്‌വേ പരിശോധന' : 'Automated WhatsApp Gateway Test'
    };

    await this.dispatchAutomatedWhatsApp(testTx, this.waGateway.defaultLang === 'app' ? window.i18n.currentLang : this.waGateway.defaultLang);
  }

  sanitizePhone(phone) {
    let cleaned = String(phone || '').replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('0')) cleaned = cleaned.replace(/^0+/, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
  }

  // ================= 13. EVENT LISTENERS =================
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

    // 13. Transaction Form Save
    document.getElementById('txForm')?.addEventListener('submit', (e) => this.handleSaveTx(e));

    // 14. Photo Attachment Handling
    document.getElementById('txPhotoInput')?.addEventListener('change', (e) => this.handlePhotoUpload(e));
    document.getElementById('btnDeleteAttachment')?.addEventListener('click', () => this.hideAttachmentPreview());
    document.getElementById('btnCloseLightbox')?.addEventListener('click', () => {
      document.getElementById('lightboxModal')?.classList.add('hidden');
    });

    // 15. Custom Category Modal
    document.getElementById('btnQuickAddCat')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnOpenAddCategoryModal')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnCloseCatModal')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('btnCancelCat')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => this.handleSaveCategory(e));

    // 16. WhatsApp Quick Dispatch Modal Listeners
    document.getElementById('btnCloseWaDispatchModal')?.addEventListener('click', () => this.closeWaDispatchModal());
    document.getElementById('btnWaReceiptLangMl')?.addEventListener('click', () => this.setWaDispatchModalLang('ml'));
    document.getElementById('btnWaReceiptLangEn')?.addEventListener('click', () => this.setWaDispatchModalLang('en'));
    document.getElementById('waDispatchParty')?.addEventListener('input', () => this.updateWaDispatchModalPreview());
    document.getElementById('waDispatchPhone')?.addEventListener('input', () => this.updateWaDispatchModalPreview());
    document.getElementById('btnExecuteAutoWa')?.addEventListener('click', () => this.executeAutoWa());
    document.getElementById('btnExecuteManualWa')?.addEventListener('click', () => this.executeManualWa());

    // 17. WhatsApp Gateway Settings Form
    document.getElementById('waGatewayForm')?.addEventListener('submit', (e) => this.handleSaveWaGateway(e));
    document.getElementById('btnTestWaDelivery')?.addEventListener('click', () => this.sendTestWaDelivery());

    // 18. Ledger Filters
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

    // 19. Reports View Custom Date & Exports
    document.getElementById('reportRangePreset')?.addEventListener('change', (e) => {
      const isCustom = e.target.value === 'custom';
      document.getElementById('reportCustomStartCol')?.classList.toggle('hidden', !isCustom);
      document.getElementById('reportCustomEndCol')?.classList.toggle('hidden', !isCustom);
      this.renderReports();
    });

    document.getElementById('btnExportPDF')?.addEventListener('click', () => {
      const preset = document.getElementById('reportRangePreset')?.value || 'this_month';
      if (window.reportsEngine) {
        window.reportsEngine.downloadStatementPDF(this.transactions, this.categories, this.officeProfile, `Report (${preset})`);
      }
    });

    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      if (window.reportsEngine) {
        window.reportsEngine.exportToCSV(this.transactions, this.categories, this.officeProfile, 'full');
      }
    });

    document.getElementById('btnPrintReport')?.addEventListener('click', () => {
      if (window.reportsEngine) {
        window.reportsEngine.openPrintableStatement(this.transactions, this.categories, this.officeProfile, 'Official Report');
      }
    });

    // 20. Office Profile Form
    document.getElementById('officeProfileForm')?.addEventListener('submit', (e) => this.handleSaveOfficeProfile(e));

    // 21. Backup & Restore
    document.getElementById('btnDownloadBackupJSON')?.addEventListener('click', () => this.handleDownloadBackup());
    document.getElementById('inputRestoreJSON')?.addEventListener('change', (e) => this.handleRestoreBackup(e));

    // 22. PIN & Data Wipe
    document.getElementById('btnTogglePinSetting')?.addEventListener('click', () => this.openPinSettingPrompt());
    document.getElementById('btnClearAllData')?.addEventListener('click', () => this.confirmClearAllData());

    // 23. PWA Install Button
    document.getElementById('btnInstallApp')?.addEventListener('click', () => this.triggerPWAInstall());
  }

  // ================= 14. VIEW NAVIGATION =================
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
    this.renderSettingsCategoryChips();

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

  // ================= 15. ATTACHMENT & VOUCHERS =================
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

  // ================= 16. CUSTOM CATEGORY MODAL =================
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

  // ================= 17. OFFICE PROFILE =================
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

  // ================= 18. DATA BACKUP & RESTORE =================
  async handleDownloadBackup() {
    const backupJson = await window.dbEngine.exportDataBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
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
        const count = await window.dbEngine.importDataBackup(e.target.result);
        this.showToast(window.i18n.t('restoreSuccess').replace('{count}', count), 'success');
        await this.refreshData();
      } catch (err) {
        alert(window.i18n.currentLang === 'ml' ? 'ബാക്കപ്പ് ഫയൽ തെറ്റാണ്!' : 'Invalid backup file format!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // ================= 19. PIN SETUP & FULL RESET =================
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
      await window.dbEngine.clearAllTransactions();
      this.showToast(window.i18n.t('allCleared'), 'info');
      await this.refreshData();
    }
  }

  // ================= 20. PWA LOGIC =================
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
  }

  async triggerPWAInstall() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      const installBtn = document.getElementById('btnInstallApp');
      if (installBtn) installBtn.classList.add('hidden');
    }
    this.deferredPrompt = null;
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
