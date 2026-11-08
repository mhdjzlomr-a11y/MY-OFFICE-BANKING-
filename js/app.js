/**
 * app.js - Master Application Controller (Finnova Theme with Light Blue, Dark Mode & Period Downloads)
 * Handles UI state, routing, modals, transactions, typeable categories, exports, and PWA logic
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
  }

  async init() {
    // 1. Initialize Database
    await window.dbEngine.init();

    // 2. Initialize Theme (Dark / Light)
    await this.initTheme();

    // 3. Initialize Translations
    await window.i18n.init();

    // 4. Load Settings, Profile, and PIN
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
      if (label) label.textContent = 'Light';
    } else {
      root.classList.remove('dark');
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = 'Dark';
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

  // ================= 2. SETTINGS & PROFILE =================
  async loadSettings() {
    this.officeProfile = await window.dbEngine.getSetting('officeProfile', {});
    this.applyProfileToHeader();

    // PIN Security Check
    this.userPin = await window.dbEngine.getSetting('appPin', null);
    this.updatePinStatusUI();
    if (this.userPin) {
      this.showPinLock();
    }
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

  // ================= 3. PIN SECURITY =================
  updatePinStatusUI() {
    const pinText = document.getElementById('pinStatusText');
    const pinBtn = document.getElementById('btnTogglePinSetting');
    if (this.userPin) {
      if (pinText) pinText.textContent = 'PIN സുരക്ഷ സജീവമാണ് (Active)';
      if (pinBtn) pinBtn.textContent = 'PIN മാറ്റുക';
    } else {
      if (pinText) pinText.textContent = 'PIN സുരക്ഷ ഓഫാണ് (Disabled)';
      if (pinBtn) pinBtn.textContent = 'PIN സെറ്റ് ചെയ്യുക';
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
    } else if (this.pinBuffer.length < 4) {
      this.pinBuffer += val;
    }

    this.updatePinDots();

    if (this.pinBuffer.length === 4) {
      setTimeout(() => {
        if (this.pinBuffer === this.userPin) {
          this.hidePinLock();
          this.showToast('അൺലോക്ക് ചെയ്തു!', 'success');
        } else {
          if (errMsg) errMsg.classList.remove('hidden');
          this.pinBuffer = '';
          this.updatePinDots();
        }
      }, 150);
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

  // ================= 4. DATA REFRESH & STATE =================
  async refreshData() {
    this.transactions = await window.dbEngine.getAllTransactions();
    this.categories = await window.dbEngine.getAllCategories();

    this.renderDashboard();
    this.renderTransactionsList();
    this.renderReports();
    this.renderSettingsCategoryChips();
    this.populateCategoryDatalist();

    // Visual Charts
    if (window.chartsEngine) {
      window.chartsEngine.updateCharts(this.transactions, this.categories);
    }

    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  // Helper: Filter transactions by period
  getFilteredByPeriod(period, list = this.transactions) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);
    const thisYearStr = String(today.getFullYear());

    // 7 days ago
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().slice(0, 10);

    return list.filter(tx => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      if (period === 'daily') {
        return txDate === todayStr;
      } else if (period === 'weekly') {
        return txDate >= sevenDaysAgoStr && txDate <= todayStr;
      } else if (period === 'monthly') {
        return txDate.startsWith(thisMonthStr);
      } else if (period === 'yearly') {
        return txDate.startsWith(thisYearStr);
      }
      return true; // 'all'
    });
  }

  // ================= 5. DASHBOARD RENDERING =================
  renderDashboard() {
    // 1. Period Filtered Transactions
    const periodTxs = this.getFilteredByPeriod(this.activePeriod);

    // 2. Calculate Period Stats
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

    // 3. Update Stat Cards
    const netElem = document.getElementById('statNetBalance');
    const incElem = document.getElementById('statTotalIncome');
    const expElem = document.getElementById('statTotalExpense');
    const txCountElem = document.getElementById('statTotalTxCount');
    const incCountElem = document.getElementById('statIncomeCount');
    const expCountElem = document.getElementById('statExpenseCount');

    if (netElem) netElem.textContent = this.formatCurrency(periodNet);
    if (incElem) incElem.textContent = this.formatCurrency(periodIncome);
    if (expElem) expElem.textContent = this.formatCurrency(periodExpense);
    if (txCountElem) txCountElem.textContent = `${this.transactions.length} Total`;
    if (incCountElem) incCountElem.textContent = periodIncCount;
    if (expCountElem) expCountElem.textContent = periodExpCount;

    // Period Net Trend Pill
    const periodNetText = document.getElementById('statPeriodNetText');
    const periodPill = document.getElementById('statPeriodNetPill');
    const activePeriodLabel = document.getElementById('statActivePeriodLabel');

    const periodNamesMl = {
      daily: 'ഇന്നത്തെ കണക്ക്',
      weekly: 'ഈ ആഴ്ചയിലെ കണക്ക്',
      monthly: 'ഈ മാസത്തെ കണക്ക്',
      yearly: 'ഈ വർഷത്തെ കണക്ക്',
      all: 'ആകെ കണക്ക്'
    };

    if (activePeriodLabel) {
      activePeriodLabel.textContent = periodNamesMl[this.activePeriod] || 'കണക്ക്';
    }

    if (periodNetText) {
      if (periodNet >= 0) {
        periodNetText.textContent = `+${this.formatCurrency(periodNet)}`;
        if (periodPill) {
          periodPill.className = 'trend-pill up';
        }
      } else {
        periodNetText.textContent = this.formatCurrency(periodNet);
        if (periodPill) {
          periodPill.className = 'trend-pill down';
        }
      }
    }

    // 4. Update 1-Click Export Button Labels for the selected period
    const pdfPeriodLabel = document.getElementById('dashPdfPeriodLabel');
    const excelPeriodLabel = document.getElementById('dashExcelPeriodLabel');
    const capitalizedPeriod = this.activePeriod.charAt(0).toUpperCase() + this.activePeriod.slice(1);

    if (pdfPeriodLabel) pdfPeriodLabel.textContent = `${capitalizedPeriod} PDF`;
    if (excelPeriodLabel) excelPeriodLabel.textContent = `${capitalizedPeriod} Excel`;

    // 5. Render Finnova Navy Split Board
    this.renderNavyBoard(periodTxs);
  }

  // ================= 6. FINNOVA NAVY BOARD RENDERING =================
  renderNavyBoard(baseTxs = null) {
    let list = baseTxs !== null ? baseTxs : this.getFilteredByPeriod(this.activePeriod);

    // Apply quick search if present
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

    // Apply navy subfilter
    if (this.navyFilter !== 'all') {
      list = list.filter(t => t.type === this.navyFilter);
    }

    const navyContainer = document.getElementById('navyTxList');
    if (!navyContainer) return;

    if (list.length === 0) {
      navyContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #94a3b8; font-size: 0.85rem;">
          <p>ഈ കാറ്റഗറിയിൽ ഇടപാടുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല</p>
        </div>
      `;
      this.clearNavyDetailsCard();
      return;
    }

    // If no transaction is selected or current selection is not in list, select the first item
    if (!this.selectedNavyTxId || !list.some(t => t.id === this.selectedNavyTxId)) {
      this.selectedNavyTxId = list[0].id;
    }

    // Render left list
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
              </div>
            </div>
          </div>
          <div class="navy-right-amt ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? '+' : '-'} ${this.formatCurrency(tx.amount)}
          </div>
        </div>
      `;
    }).join('');

    // Render right purple details card
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
    const notesElem = document.getElementById('navySelectedNotes');
    const subtotalElem = document.getElementById('navySelectedBottomSubtotal');
    const badgeElem = document.getElementById('navySelectedTypeBadge');

    if (invElem) invElem.textContent = `# ${tx.billNo || 'TX-' + tx.id}`;
    if (amtElem) amtElem.textContent = this.formatCurrency(tx.amount);
    if (catElem) catElem.textContent = catName;
    if (dateElem) dateElem.textContent = this.formatDate(tx.date);
    if (partyElem) partyElem.textContent = tx.party || (isIncome ? 'ലഭിച്ച വരുമാനം' : 'ഓഫീസ് ചിലവ്');
    if (notesElem) notesElem.textContent = tx.notes ? `വിവരണം: ${tx.notes}` : 'കുറിപ്പുകൾ ലഭ്യമല്ല';
    if (subtotalElem) subtotalElem.textContent = this.formatCurrency(tx.amount);

    if (badgeElem) {
      badgeElem.textContent = isIncome ? 'വരവ് (INCOME)' : 'ചിലവ് (EXPENSE)';
      badgeElem.style.background = isIncome ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
    }

    // Connect right card action buttons
    const btnPrint = document.getElementById('btnNavyPrintVoucher');
    const btnEdit = document.getElementById('btnNavyEditTx');
    const btnDelete = document.getElementById('btnNavyDeleteTx');

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
    if (notesElem) notesElem.textContent = 'ഇടപാടുകൾ തിരഞ്ഞെടുക്കുക';
    if (subtotalElem) subtotalElem.textContent = '₹0.00';
  }

  // ================= 7. PERIOD 1-CLICK EXPORTS (DAILY, WEEKLY, MONTHLY, YEARLY) =================
  exportPeriod(period, format) {
    const txs = this.getFilteredByPeriod(period);
    if (txs.length === 0) {
      this.showToast('ഈ പീരിയഡിൽ ഇടപാടുകൾ ലഭ്യമല്ല!', 'info');
      return;
    }

    const periodTitles = {
      daily: 'DAILY STATEMENT (ഇന്നത്തെ കണക്ക്)',
      weekly: 'WEEKLY STATEMENT (ഈ ആഴ്ചയിലെ കണക്ക്)',
      monthly: 'MONTHLY STATEMENT (ഈ മാസത്തെ കണക്ക്)',
      yearly: 'ANNUAL FINANCIAL STATEMENT (ഈ വർഷത്തെ കണക്ക്)',
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
          <p style="font-size: 0.9rem;">തിരഞ്ഞെടുത്ത ഫിൽട്ടറിൽ ഇടപാടുകൾ ഒന്നും കണ്ടെത്തിയില്ല</p>
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
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="navy-right-amt ${isIncome ? 'income' : 'expense'}">
              ${isIncome ? '+' : '-'} ${this.formatCurrency(tx.amount)}
            </div>
            <div style="display: flex; gap: 4px;">
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
        if (!catExpenses[cid]) catExpenses[cid] = { total: 0, count: 0 };
        catExpenses[cid].total += amt;
        catExpenses[cid].count += 1;
      }
    });

    const netBal = totalIncome - totalExpense;

    const rInc = document.getElementById('reportTotalIncome');
    const rExp = document.getElementById('reportTotalExpense');
    const rNet = document.getElementById('reportNetBalance');

    if (rInc) rInc.textContent = this.formatCurrency(totalIncome);
    if (rExp) rExp.textContent = this.formatCurrency(totalExpense);
    if (rNet) rNet.textContent = this.formatCurrency(netBal);

    // Breakdown table
    const tableBody = document.getElementById('reportCategoryTableBody');
    if (tableBody) {
      const entries = Object.entries(catExpenses).sort((a, b) => b[1].total - a[1].total);
      if (entries.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 24px; color: var(--text-muted);">
              ഈ പീരിയഡിൽ ചിലവുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = entries.map(([cid, data]) => {
          const cat = this.categories.find(c => c.id === cid);
          const cName = cat ? window.i18n.getCategoryName(cat) : cid;
          const cColor = cat && cat.color ? cat.color : '#64748b';
          const pct = totalExpense > 0 ? ((data.total / totalExpense) * 100).toFixed(1) : 0;

          return `
            <tr style="border-bottom: 1px solid var(--border-light);">
              <td style="padding: 10px 8px; font-weight: 700;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${cColor}; margin-right: 8px;"></span>
                ${cName}
              </td>
              <td style="padding: 10px 8px; color: var(--text-muted);">${data.count} ഇടപാടുകൾ</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 800;">${this.formatCurrency(data.total)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: var(--light-blue-600);">${pct}%</td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // ================= 10. TYPEABLE CATEGORY HANDLING =================
  populateCategoryDatalist() {
    const datalist = document.getElementById('categoryDatalist');
    const pillsWrap = document.getElementById('quickCategoryPills');
    const filterCatSelect = document.getElementById('filterCategorySelect');

    const filtered = this.categories.filter(c => c.type === this.currentTxType);

    if (datalist) {
      datalist.innerHTML = filtered.map(c => `
        <option value="${c.nameMl}">${c.nameEn || ''}</option>
        ${c.nameEn ? `<option value="${c.nameEn}">${c.nameMl}</option>` : ''}
      `).join('');
    }

    if (pillsWrap) {
      pillsWrap.innerHTML = filtered.slice(0, 8).map(c => `
        <button type="button" class="quick-cat-pill" onclick="window.appEngine.pickCategoryPill('${c.nameMl}')">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.color || '#0ea5e9'};margin-right:4px;"></span>
          ${c.nameMl}
        </button>
      `).join('');
    }

    if (filterCatSelect) {
      filterCatSelect.innerHTML = `
        <option value="all">All Categories</option>
        ${this.categories.map(c => `
          <option value="${c.id}">${window.i18n.getCategoryName(c)} (${c.type === 'income' ? 'വരവ്' : 'ചിലവ്'})</option>
        `).join('')}
      `;
    }
  }

  pickCategoryPill(name) {
    const input = document.getElementById('txCategory');
    if (input) {
      input.value = name;
      input.focus();
    }
  }

  renderSettingsCategoryChips() {
    const expContainer = document.getElementById('expenseCategoryChips');
    const incContainer = document.getElementById('incomeCategoryChips');

    const expCats = this.categories.filter(c => c.type === 'expense');
    const incCats = this.categories.filter(c => c.type === 'income');

    const renderChip = (c) => `
      <div class="category-chip">
        <span class="color-dot" style="background-color: ${c.color || '#94a3b8'};"></span>
        <span>${window.i18n.getCategoryName(c)}</span>
        ${c.isCustom ? `
          <button type="button" class="chip-del" onclick="window.appEngine.deleteCustomCategory('${c.id}')" title="Delete">
            &times;
          </button>
        ` : ''}
      </div>
    `;

    if (expContainer) expContainer.innerHTML = expCats.map(renderChip).join('');
    if (incContainer) incContainer.innerHTML = incCats.map(renderChip).join('');
  }

  // ================= 11. MODAL & TRANSACTION SAVE =================
  openAddTxModal(type = 'expense') {
    this.editingTxId = null;
    this.currentTxType = type;
    this.currentAttachment = null;

    document.getElementById('txId').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txCategory').value = '';
    document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('txParty').value = '';
    document.getElementById('txBillNo').value = '';
    document.getElementById('txNotes').value = '';

    this.hideAttachmentPreview();
    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();

    document.getElementById('txModalTitle').textContent = 'പുതിയ ഇടപാട് രേഖപ്പെടുത്തുക';
    document.getElementById('transactionModal').classList.remove('hidden');

    setTimeout(() => {
      document.getElementById('txAmount')?.focus();
    }, 100);
  }

  openEditTxModal(id) {
    const tx = this.transactions.find(t => t.id === Number(id));
    if (!tx) return;

    this.editingTxId = tx.id;
    this.currentTxType = tx.type;
    this.currentAttachment = tx.attachment || null;

    document.getElementById('txId').value = tx.id;
    document.getElementById('txAmount').value = tx.amount;
    document.getElementById('txDate').value = tx.date ? tx.date.slice(0, 10) : '';
    document.getElementById('txParty').value = tx.party || '';
    document.getElementById('txBillNo').value = tx.billNo || '';
    document.getElementById('txNotes').value = tx.notes || '';

    // Find category display name
    const cat = this.categories.find(c => c.id === tx.category);
    document.getElementById('txCategory').value = cat ? cat.nameMl : (tx.category || '');

    this.updateTxTypeToggleUI();
    this.populateCategoryDatalist();

    if (tx.attachment) {
      this.showAttachmentPreview(tx.attachment);
    } else {
      this.hideAttachmentPreview();
    }

    document.getElementById('txModalTitle').textContent = 'ഇടപാട് തിരുത്തുക';
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
      if (partyLabel) partyLabel.textContent = 'ആരിൽ നിന്ന് ലഭിച്ചു (Received From)';
    } else {
      if (btnExp) btnExp.className = 'segment-btn active expense';
      if (btnInc) btnInc.className = 'segment-btn income';
      if (partyLabel) partyLabel.textContent = 'ആർക്ക് നൽകി (Paid To)';
    }
  }

  async handleSaveTx(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('txAmount').value);
    if (!amount || amount <= 0) {
      alert('സാധുവായ ഒരു തുക നൽകുക.');
      return;
    }

    let typedCategory = document.getElementById('txCategory').value.trim();
    if (!typedCategory) {
      typedCategory = this.currentTxType === 'income' ? 'മറ്റ് വരുമാനങ്ങൾ' : 'മറ്റ് ചിലവുകൾ';
    }

    // Match or Auto-Create Category on the fly
    let matchedCat = this.categories.find(c =>
      c.id.toLowerCase() === typedCategory.toLowerCase() ||
      (c.nameMl && c.nameMl.toLowerCase() === typedCategory.toLowerCase()) ||
      (c.nameEn && c.nameEn.toLowerCase() === typedCategory.toLowerCase())
    );

    let categoryId;
    if (matchedCat) {
      categoryId = matchedCat.id;
    } else {
      // Auto-register newly typed category!
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

    const date = document.getElementById('txDate').value;
    const party = document.getElementById('txParty').value.trim();
    const billNo = document.getElementById('txBillNo').value.trim();
    const notes = document.getElementById('txNotes').value.trim();

    const txData = {
      type: this.currentTxType,
      amount,
      category: categoryId,
      date,
      party,
      billNo,
      notes,
      attachment: this.currentAttachment
    };

    if (this.editingTxId) {
      txData.id = this.editingTxId;
      await window.dbEngine.updateTransaction(txData);
      this.showToast('ഇടപാട് അപ്ഡേറ്റ് ചെയ്തു!', 'success');
    } else {
      await window.dbEngine.addTransaction(txData);
      this.showToast('ഇടപാട് വിജയകരമായി സേവ് ചെയ്തു!', 'success');
    }

    this.closeTxModal();
    await this.refreshData();
  }

  // ================= 12. EVENT LISTENERS =================
  setupEventListeners() {
    // 1. Navigation Menu Switching (Finnova Pill Nav & Mobile Bar)
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
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

    // 3. Language Toggle
    document.getElementById('btnLangToggle')?.addEventListener('click', () => {
      window.i18n.toggleLanguage();
      this.refreshData();
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

    // 12. Transaction Form Save
    document.getElementById('txForm')?.addEventListener('submit', (e) => this.handleSaveTx(e));

    // 13. Photo Attachment Handling
    document.getElementById('txPhotoInput')?.addEventListener('change', (e) => this.handlePhotoUpload(e));
    document.getElementById('btnDeleteAttachment')?.addEventListener('click', () => this.hideAttachmentPreview());
    document.getElementById('btnCloseLightbox')?.addEventListener('click', () => {
      document.getElementById('lightboxModal')?.classList.add('hidden');
    });

    // 14. Custom Category Modal
    document.getElementById('btnQuickAddCat')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnOpenAddCategoryModal')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnCloseCatModal')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('btnCancelCat')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => this.handleSaveCategory(e));

    // 15. Ledger Filters
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

    // 16. Reports View Custom Date & Exports
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

    // 17. Office Profile Form
    document.getElementById('officeProfileForm')?.addEventListener('submit', (e) => this.handleSaveOfficeProfile(e));

    // 18. Backup & Restore
    document.getElementById('btnDownloadBackupJSON')?.addEventListener('click', () => this.handleDownloadBackup());
    document.getElementById('inputRestoreJSON')?.addEventListener('change', (e) => this.handleRestoreBackup(e));

    // 19. PIN & Data Wipe
    document.getElementById('btnTogglePinSetting')?.addEventListener('click', () => this.openPinSettingPrompt());
    document.getElementById('btnClearAllData')?.addEventListener('click', () => this.confirmClearAllData());

    // 20. PWA Install Button
    document.getElementById('btnInstallApp')?.addEventListener('click', () => this.triggerPWAInstall());
  }

  // ================= 13. VIEW NAVIGATION =================
  switchView(viewName) {
    this.currentView = viewName;

    // Toggle tab views
    document.querySelectorAll('.tab-view').forEach(tab => {
      tab.classList.add('hidden');
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Update active nav button classes
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

  // ================= 14. ATTACHMENT & VOUCHERS =================
  handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('ഇമേജ് ഫയലുകൾ മാത്രം അപ്‌ലോഡ് ചെയ്യുക.');
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
    if (confirm('ഈ ഇടപാട് ഡിലീറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?')) {
      await window.dbEngine.deleteTransaction(Number(txId));
      this.showToast('ഇടപാട് മായ്ച്ചു!', 'info');
      await this.refreshData();
    }
  }

  // ================= 15. CUSTOM CATEGORY MODAL =================
  openAddCategoryModal() {
    document.getElementById('newCatNameMl').value = '';
    document.getElementById('newCatNameEn').value = '';
    document.getElementById('categoryModal')?.classList.remove('hidden');
  }

  closeAddCategoryModal() {
    document.getElementById('categoryModal')?.classList.add('hidden');
  }

  async handleSaveCategory(e) {
    e.preventDefault();
    const type = document.getElementById('newCatType').value;
    const nameMl = document.getElementById('newCatNameMl').value.trim();
    const nameEn = document.getElementById('newCatNameEn').value.trim();
    const color = document.getElementById('newCatColor').value;

    if (!nameMl) return;

    const newId = 'cat_' + Date.now();
    await window.dbEngine.addCategory({
      id: newId,
      nameMl,
      nameEn,
      type,
      color,
      isCustom: true
    });

    this.showToast('പുതിയ കാറ്റഗറി ചേർത്തു!', 'success');
    this.closeAddCategoryModal();
    await this.refreshData();
  }

  async deleteCustomCategory(id) {
    if (confirm('ഈ കാറ്റഗറി ഒഴിവാക്കണോ?')) {
      await window.dbEngine.deleteCategory(id);
      this.showToast('കാറ്റഗറി ഒഴിവാക്കി', 'info');
      await this.refreshData();
    }
  }

  // ================= 16. OFFICE PROFILE & BACKUP =================
  async handleSaveOfficeProfile(e) {
    e.preventDefault();
    const profile = {
      name: document.getElementById('settingOfficeName').value.trim(),
      tagline: document.getElementById('settingOfficeTagline').value.trim(),
      address: document.getElementById('settingOfficeAddress').value.trim(),
      phone: document.getElementById('settingOfficePhone').value.trim(),
      currency: document.getElementById('settingOfficeCurrency').value.trim() || '₹'
    };

    await window.dbEngine.setSetting('officeProfile', profile);
    this.officeProfile = profile;
    this.applyProfileToHeader();
    this.showToast('ഓഫീസ് പ്രൊഫൈൽ സേവ് ചെയ്തു!', 'success');
  }

  async handleDownloadBackup() {
    const jsonStr = await window.dbEngine.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Office_Finance_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast('ബാക്കപ്പ് ഡൗൺലോഡ് പൂർത്തിയായി!', 'success');
  }

  handleRestoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const count = await window.dbEngine.restoreBackupJSON(e.target.result);
        this.showToast(`${count} ഇടപാടുകൾ റീസ്റ്റോർ ചെയ്തു!`, 'success');
        await this.refreshData();
      } catch (err) {
        alert('ബാക്കപ്പ് ഫയൽ തെറ്റാണ്!');
      }
    };
    reader.readAsText(file);
  }

  openPinSettingPrompt() {
    const current = this.userPin;
    const promptMsg = current ? 'പുതിയ 4-അക്ക PIN നൽകുക (ഒഴിവാക്കാൻ ഒന്നും നൽകരുത്):' : '4-അക്ക സുരക്ഷാ PIN നൽകുക:';
    const newPin = prompt(promptMsg);

    if (newPin === null) return;
    if (newPin === '') {
      this.userPin = null;
      window.dbEngine.setSetting('appPin', null);
      this.updatePinStatusUI();
      this.showToast('PIN സുരക്ഷ ഒഴിവാക്കി', 'info');
      return;
    }

    if (/^\d{4}$/.test(newPin)) {
      this.userPin = newPin;
      window.dbEngine.setSetting('appPin', newPin);
      this.updatePinStatusUI();
      this.showToast('PIN വിജയകരമായി സേവ് ചെയ്തു!', 'success');
    } else {
      alert('ദയവായി 4 അക്കങ്ങൾ മാത്രം നൽകുക (e.g. 1234)');
    }
  }

  async confirmClearAllData() {
    if (confirm('ശ്രദ്ധിക്കുക: എല്ലാ വരവ് ചിലവ് ഇടപാടുകളും പൂർണ്ണമായും മായ്ക്കപ്പെടും. തുടരണോ?')) {
      if (confirm('ഡാറ്റ തിരിച്ചെടുക്കാൻ സാധിക്കില്ല. നിങ്ങൾ ഉറപ്പാണോ?')) {
        await window.dbEngine.clearAllData();
        this.showToast('എല്ലാ ഇടപാടുകളും മായ്ച്ചു.', 'info');
        await this.refreshData();
      }
    }
  }

  // ================= 17. PWA & TOAST =================
  setupPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
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
