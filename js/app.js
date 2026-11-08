/**
 * app.js - Master Application Controller
 * Handles UI state, routing, modals, transactions, categories, exports, and PWA logic
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
  }

  async init() {
    // 1. Initialize Database
    await window.dbEngine.init();

    // 2. Initialize Translations
    await window.i18n.init();

    // 3. Load Settings, Theme, and PIN
    await this.loadSettingsAndTheme();

    // 4. Load Data & populate UI
    await this.refreshData();

    // 5. Setup DOM Event Listeners
    this.setupEventListeners();

    // 6. Setup PWA & Service Worker
    this.setupPWA();

    // 7. Check URL parameters (e.g. ?action=expense)
    this.checkUrlActions();

    // 8. Render Icons
    if (window.renderLucideIcons) {
      window.renderLucideIcons();
    }
  }

  async loadSettingsAndTheme() {
    // Theme
    const savedTheme = await window.dbEngine.getSetting('theme', 'light');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      this.updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.updateThemeIcon(false);
    }

    // Office Profile
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
    const tagElem = document.getElementById('headerOfficeTagline');
    if (nameElem && this.officeProfile.name) {
      nameElem.textContent = this.officeProfile.name;
    }
    if (tagElem && this.officeProfile.tagline) {
      tagElem.textContent = this.officeProfile.tagline;
    }
  }

  updateThemeIcon(isDark) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.renderLucideIcons) window.renderLucideIcons();
    }
  }

  async toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    await window.dbEngine.setSetting('theme', isDark ? 'dark' : 'light');
    this.updateThemeIcon(isDark);
    if (window.financeCharts) {
      window.financeCharts.updateCharts(this.transactions, this.categories);
    }
  }

  // --- PIN Security Logic ---
  updatePinStatusUI() {
    const pinText = document.getElementById('pinStatusText');
    const pinBtn = document.getElementById('btnTogglePinSetting');
    if (this.userPin) {
      if (pinText) pinText.textContent = window.i18n.t('pinStatusActive');
      if (pinBtn) pinBtn.textContent = window.i18n.t('btnRemovePin');
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
      this.updatePinDots();
      return;
    }

    if (val === 'back') {
      this.pinBuffer = this.pinBuffer.slice(0, -1);
      this.updatePinDots();
      return;
    }

    if (this.pinBuffer.length < 4) {
      this.pinBuffer += val;
      this.updatePinDots();
    }

    if (this.pinBuffer.length === 4) {
      setTimeout(() => {
        if (this.pinBuffer === this.userPin) {
          this.hidePinLock();
          this.showToast(window.i18n.t('appTitle') + ' Unlocked!', 'success');
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
          dot.style.background = 'var(--emerald-500)';
          dot.style.borderColor = 'var(--emerald-500)';
        } else {
          dot.style.background = 'transparent';
          dot.style.borderColor = 'var(--text-muted)';
        }
      }
    }
  }

  async togglePinSetting() {
    if (this.userPin) {
      // Remove PIN
      const entered = prompt(window.i18n.t('enterPinPrompt'));
      if (entered === this.userPin) {
        this.userPin = null;
        await window.dbEngine.setSetting('appPin', null);
        this.updatePinStatusUI();
        this.showToast(window.i18n.t('pinStatusInactive'), 'info');
      } else if (entered !== null) {
        alert(window.i18n.t('wrongPin'));
      }
    } else {
      // Set new PIN
      const pin1 = prompt('പുതിയ 4-അക്ക PIN നൽകുക (Enter new 4-digit PIN):');
      if (!pin1 || pin1.length !== 4 || isNaN(pin1)) {
        if (pin1 !== null) alert('ദയവായി 4 അക്കങ്ങൾ മാത്രമുള്ള PIN നൽകുക (4 digits only).');
        return;
      }
      const pin2 = prompt('PIN ഒന്നുകൂടി നൽകുക (Confirm PIN):');
      if (pin1 === pin2) {
        this.userPin = pin1;
        await window.dbEngine.setSetting('appPin', pin1);
        this.updatePinStatusUI();
        this.showToast(window.i18n.t('pinSetSuccess'), 'success');
      } else {
        alert('PIN പൊരുത്തപ്പെടുന്നില്ല (PIN does not match).');
      }
    }
  }

  // --- Data Loading & Refresh ---
  async refreshData() {
    this.categories = await window.dbEngine.getAllCategories();
    this.transactions = await window.dbEngine.getAllTransactions();
    this.populateCategoryDropdowns();
    this.renderCurrentView();
  }

  renderCurrentView() {
    if (this.currentView === 'dashboard') {
      this.renderDashboard();
    } else if (this.currentView === 'transactions') {
      this.renderTransactionsLedger();
    } else if (this.currentView === 'reports') {
      this.renderReports();
    } else if (this.currentView === 'settings') {
      this.renderSettings();
    }
    if (window.renderLucideIcons) window.renderLucideIcons();
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Hide all view sections
    document.querySelectorAll('.tab-view').forEach(sec => sec.classList.add('hidden'));

    // Show target section
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) targetSection.classList.remove('hidden');

    // Update active nav items (desktop + mobile)
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-target') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  // --- View 1: Dashboard Rendering ---
  renderDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    this.transactions.forEach(tx => {
      const amt = parseFloat(tx.amount) || 0;
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      const txMonth = txDate.slice(0, 7);

      if (tx.type === 'income') {
        totalIncome += amt;
        if (txDate === todayStr) todayIncome += amt;
        if (txMonth === thisMonthStr) monthIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpense += amt;
        if (txDate === todayStr) todayExpense += amt;
        if (txMonth === thisMonthStr) monthExpense += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const monthNet = monthIncome - monthExpense;

    // Stat card texts
    const statNet = document.getElementById('statNetBalance');
    const statInc = document.getElementById('statTotalIncome');
    const statExp = document.getElementById('statTotalExpense');
    const statMNet = document.getElementById('statMonthNet');
    const statTInc = document.getElementById('statTodayIncome');
    const statTExp = document.getElementById('statTodayExpense');

    if (statNet) statNet.textContent = this.formatCurrency(netBalance);
    if (statInc) statInc.textContent = this.formatCurrency(totalIncome);
    if (statExp) statExp.textContent = this.formatCurrency(totalExpense);
    if (statMNet) statMNet.textContent = this.formatCurrency(monthNet);
    if (statTInc) statTInc.textContent = this.formatCurrency(todayIncome);
    if (statTExp) statTExp.textContent = this.formatCurrency(todayExpense);

    // Update Charts
    if (window.financeCharts) {
      window.financeCharts.updateCharts(this.transactions, this.categories);
    }

    // Render Recent 5 Transactions
    const recentContainer = document.getElementById('recentTxList');
    const countBadge = document.getElementById('recentTxCountBadge');
    if (countBadge) countBadge.textContent = this.transactions.length;

    if (!recentContainer) return;

    if (this.transactions.length === 0) {
      recentContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; color: var(--text-muted);">
          <p style="font-size: 0.9rem;">${window.i18n.t('noTransactionsYet')}</p>
        </div>
      `;
      return;
    }

    const recentList = this.transactions.slice(0, 5);
    recentContainer.innerHTML = recentList.map(tx => this.renderTransactionItemHTML(tx)).join('');
  }

  // --- View 2: Transactions Ledger Rendering ---
  renderTransactionsLedger() {
    const searchVal = (document.getElementById('txSearchInput')?.value || '').toLowerCase().trim();
    const typeFilter = document.getElementById('filterTypeSelect')?.value || 'all';
    const catFilter = document.getElementById('filterCategorySelect')?.value || 'all';
    const dateRangeFilter = document.getElementById('filterDateRangeSelect')?.value || 'all';

    const customStart = document.getElementById('customStartDate')?.value || '';
    const customEnd = document.getElementById('customEndDate')?.value || '';

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const filtered = this.transactions.filter(tx => {
      // 1. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // 2. Category Filter
      if (catFilter !== 'all' && tx.category !== catFilter) return false;

      // 3. Date Filter
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      if (dateRangeFilter === 'today' && txDate !== todayStr) return false;
      if (dateRangeFilter === 'yesterday' && txDate !== yesterdayStr) return false;
      if (dateRangeFilter === 'this_week' && txDate < oneWeekAgo) return false;
      if (dateRangeFilter === 'this_month' && !txDate.startsWith(thisMonthStr)) return false;
      if (dateRangeFilter === 'custom') {
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
      }

      // 4. Search Filter
      if (searchVal) {
        const cat = this.categories.find(c => c.id === tx.category);
        const catName = cat ? `${cat.nameMl} ${cat.nameEn}`.toLowerCase() : '';
        const party = (tx.party || '').toLowerCase();
        const bill = (tx.billNo || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const amount = String(tx.amount);

        const match = party.includes(searchVal) ||
          bill.includes(searchVal) ||
          notes.includes(searchVal) ||
          catName.includes(searchVal) ||
          amount.includes(searchVal);

        if (!match) return false;
      }

      return true;
    });

    // Update Filtered Totals
    let fIncome = 0;
    let fExpense = 0;
    filtered.forEach(t => {
      if (t.type === 'income') fIncome += parseFloat(t.amount) || 0;
      else if (t.type === 'expense') fExpense += parseFloat(t.amount) || 0;
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

    ledgerContainer.innerHTML = filtered.map(tx => this.renderTransactionItemHTML(tx)).join('');
  }

  renderTransactionItemHTML(tx) {
    const cat = this.categories.find(c => c.id === tx.category);
    const catName = cat ? window.i18n.getCategoryName(cat) : (tx.category || '-');
    const catColor = cat && cat.color ? cat.color : '#64748b';
    const isIncome = tx.type === 'income';

    const formattedDate = this.formatDate(tx.date);
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const tagClass = isIncome ? 'income' : 'expense';

    const hasAttachment = Boolean(tx.attachment);

    return `
      <div class="tx-item">
        <!-- Left: Icon & Info -->
        <div class="tx-left">
          <div class="cat-avatar" style="background-color: ${catColor};">
            ${catName.slice(0, 1)}
          </div>

          <div class="tx-details">
            <div class="tx-title-row">
              <span class="tx-party">
                ${tx.party || catName}
              </span>
              <span class="cat-tag ${tagClass}">
                ${catName}
              </span>
              ${tx.billNo ? `<span class="bill-tag">#${tx.billNo}</span>` : ''}
              ${hasAttachment ? `
                <button onclick="window.appEngine.openAttachmentLightbox(${tx.id})" class="action-icon-btn" style="color: var(--emerald-600); padding: 2px;" title="View Bill Photo">
                  <i data-lucide="paperclip"></i>
                </button>
              ` : ''}
            </div>

            <div class="tx-meta">
              <span>${formattedDate}</span>
              ${tx.notes ? `<span>• ${tx.notes}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Amount & Actions -->
        <div class="tx-right">
          <div>
            <div class="tx-amount ${amountClass}">
              ${sign} ${this.formatCurrency(tx.amount)}
            </div>
          </div>

          <div class="tx-btn-group">
            <button onclick="window.appEngine.downloadSingleVoucher(${tx.id})" class="action-icon-btn" title="Voucher PDF">
              <i data-lucide="file-text"></i>
            </button>
            <button onclick="window.appEngine.openEditTxModal(${tx.id})" class="action-icon-btn" title="Edit">
              <i data-lucide="edit-2"></i>
            </button>
            <button onclick="window.appEngine.confirmDeleteTx(${tx.id})" class="action-icon-btn danger" title="Delete">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // --- View 3: Reports & Analytics Rendering ---
  renderReports() {
    const rangePreset = document.getElementById('reportRangePreset')?.value || 'this_month';
    const customStart = document.getElementById('reportStartDate')?.value || '';
    const customEnd = document.getElementById('reportEndDate')?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const filtered = this.transactions.filter(tx => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';

      if (rangePreset === 'this_month') {
        return txDate.startsWith(thisMonthStr);
      } else if (rangePreset === 'last_month') {
        const lastM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMStr = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, '0')}`;
        return txDate.startsWith(lastMStr);
      } else if (rangePreset === 'this_year') {
        return txDate.startsWith(String(today.getFullYear()));
      } else if (rangePreset === 'custom') {
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
        return true;
      }
      return true; // all_time
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

    document.getElementById('reportTotalIncome').textContent = this.formatCurrency(totalIncome);
    document.getElementById('reportTotalExpense').textContent = this.formatCurrency(totalExpense);
    document.getElementById('reportNetBalance').textContent = this.formatCurrency(netBal);

    // Render Category Breakdown Table
    const tableBody = document.getElementById('reportCategoryTableBody');
    if (!tableBody) return;

    const sortedCatIds = Object.keys(catExpenses).sort((a, b) => catExpenses[b].total - catExpenses[a].total);

    if (sortedCatIds.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="padding: 24px; text-align: center; color: var(--text-muted);">ചിലവുകൾ ഒന്നും കണ്ടെത്തിയില്ല</td></tr>`;
      return;
    }

    tableBody.innerHTML = sortedCatIds.map(cid => {
      const cat = this.categories.find(c => c.id === cid);
      const catName = cat ? window.i18n.getCategoryName(cat) : cid;
      const data = catExpenses[cid];
      const pct = totalExpense > 0 ? ((data.total / totalExpense) * 100).toFixed(1) : '0';

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px 8px; font-weight: 600;">${catName}</td>
          <td style="padding: 10px 8px; color: var(--text-muted);">${data.count}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: var(--rose-600);">${this.formatCurrency(data.total)}</td>
          <td style="padding: 10px 8px; text-align: right; color: var(--text-muted);">${pct}%</td>
        </tr>
      `;
    }).join('');
  }

  // --- View 4: Settings & Category Chips Rendering ---
  renderSettings() {
    if (this.officeProfile) {
      const nameInp = document.getElementById('settingOfficeName');
      const tagInp = document.getElementById('settingOfficeTagline');
      const addrInp = document.getElementById('settingOfficeAddress');
      const phoneInp = document.getElementById('settingOfficePhone');
      const currInp = document.getElementById('settingOfficeCurrency');

      if (nameInp) nameInp.value = this.officeProfile.name || '';
      if (tagInp) tagInp.value = this.officeProfile.tagline || '';
      if (addrInp) addrInp.value = this.officeProfile.address || '';
      if (phoneInp) phoneInp.value = this.officeProfile.phone || '';
      if (currInp) currInp.value = this.officeProfile.currency || '₹';
    }

    const expContainer = document.getElementById('expenseCategoryChips');
    const incContainer = document.getElementById('incomeCategoryChips');

    const expCats = this.categories.filter(c => c.type === 'expense');
    const incCats = this.categories.filter(c => c.type === 'income');

    const renderChip = (cat) => `
      <div class="category-chip">
        <span class="color-dot" style="background-color: ${cat.color || '#64748b'};"></span>
        <span>${window.i18n.getCategoryName(cat)}</span>
        ${cat.isCustom ? `
          <button onclick="window.appEngine.deleteCustomCategory('${cat.id}')" class="chip-del" title="Delete">
            &times;
          </button>
        ` : ''}
      </div>
    `;

    if (expContainer) expContainer.innerHTML = expCats.map(renderChip).join('');
    if (incContainer) incContainer.innerHTML = incCats.map(renderChip).join('');
  }

  populateCategoryDropdowns() {
    const txSelect = document.getElementById('txCategory');
    const filterCatSelect = document.getElementById('filterCategorySelect');

    if (txSelect) {
      const filtered = this.categories.filter(c => c.type === this.currentTxType);
      txSelect.innerHTML = filtered.map(c => `
        <option value="${c.id}">${window.i18n.getCategoryName(c)}</option>
      `).join('');
    }

    if (filterCatSelect) {
      filterCatSelect.innerHTML = `
        <option value="all">${window.i18n.t('filterAllCategories')}</option>
        ${this.categories.map(c => `
          <option value="${c.id}">${window.i18n.getCategoryName(c)} (${c.type === 'income' ? 'വരവ്' : 'ചിലവ്'})</option>
        `).join('')}
      `;
    }
  }

  // --- Transaction Modal & Form Handling ---
  openAddTxModal(type = 'expense') {
    this.editingTxId = null;
    this.currentTxType = type;
    this.currentAttachment = null;

    document.getElementById('txId').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('txParty').value = '';
    document.getElementById('txBillNo').value = '';
    document.getElementById('txNotes').value = '';

    this.hideAttachmentPreview();
    this.updateTxTypeToggleUI();
    this.populateCategoryDropdowns();

    document.getElementById('txModalTitle').textContent = window.i18n.t('modalAddTitle');
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

    this.updateTxTypeToggleUI();
    this.populateCategoryDropdowns();

    const catSelect = document.getElementById('txCategory');
    if (catSelect) catSelect.value = tx.category;

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
    this.populateCategoryDropdowns();
  }

  updateTxTypeToggleUI() {
    const btnExp = document.getElementById('toggleTypeExpense');
    const btnInc = document.getElementById('toggleTypeIncome');
    const partyLabel = document.getElementById('labelParty');

    if (this.currentTxType === 'income') {
      btnInc.className = 'segment-btn active income';
      btnExp.className = 'segment-btn expense';
      if (partyLabel) partyLabel.textContent = window.i18n.t('labelPartyIncome');
    } else {
      btnExp.className = 'segment-btn active expense';
      btnInc.className = 'segment-btn income';
      if (partyLabel) partyLabel.textContent = window.i18n.t('labelPartyExpense');
    }
  }

  async handleSaveTx(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('txAmount').value);
    if (!amount || amount <= 0) {
      alert('സാധുവായ ഒരു തുക നൽകുക (Please enter a valid amount).');
      return;
    }

    const category = document.getElementById('txCategory').value;
    const date = document.getElementById('txDate').value;
    const party = document.getElementById('txParty').value.trim();
    const billNo = document.getElementById('txBillNo').value.trim();
    const notes = document.getElementById('txNotes').value.trim();

    const txData = {
      type: this.currentTxType,
      amount,
      category,
      date,
      party,
      billNo,
      notes,
      attachment: this.currentAttachment
    };

    if (this.editingTxId) {
      txData.id = this.editingTxId;
      await window.dbEngine.updateTransaction(txData);
      this.showToast(window.i18n.t('updatedSuccess'), 'success');
    } else {
      await window.dbEngine.addTransaction(txData);
      this.showToast(window.i18n.t('savedSuccess'), 'success');
    }

    this.closeTxModal();
    await this.refreshData();
  }

  async confirmDeleteTx(id) {
    if (confirm(window.i18n.t('confirmDelete'))) {
      await window.dbEngine.deleteTransaction(id);
      this.showToast(window.i18n.t('deletedSuccess'), 'info');
      await this.refreshData();
    }
  }

  // --- Photo Attachment Compression & Preview ---
  handlePhotoUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        this.currentAttachment = compressedDataUrl;
        this.showAttachmentPreview(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  showAttachmentPreview(src) {
    const box = document.getElementById('attachmentPreviewBox');
    const img = document.getElementById('attachmentImgPreview');
    if (box && img) {
      img.src = src;
      box.classList.remove('hidden');
    }
  }

  hideAttachmentPreview() {
    const box = document.getElementById('attachmentPreviewBox');
    const img = document.getElementById('attachmentImgPreview');
    const input = document.getElementById('txPhotoInput');
    if (box) box.classList.add('hidden');
    if (img) img.src = '';
    if (input) input.value = '';
    this.currentAttachment = null;
  }

  openAttachmentLightbox(id) {
    const tx = this.transactions.find(t => t.id === Number(id));
    if (!tx || !tx.attachment) return;

    const lightbox = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (lightbox && img) {
      img.src = tx.attachment;
      lightbox.classList.remove('hidden');
    }
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightboxModal');
    if (lightbox) lightbox.classList.add('hidden');
  }

  // --- Custom Category Management ---
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

    const type = document.getElementById('newCatType').value;
    const nameMl = document.getElementById('newCatNameMl').value.trim();
    const nameEn = document.getElementById('newCatNameEn').value.trim() || nameMl;
    const color = document.getElementById('newCatColor').value;

    if (!nameMl) return;

    const cat = {
      nameMl,
      nameEn,
      type,
      color,
      icon: 'tag'
    };

    await window.dbEngine.addCategory(cat);
    this.showToast(window.i18n.t('categoryAdded'), 'success');
    this.closeAddCategoryModal();
    await this.refreshData();
  }

  async deleteCustomCategory(id) {
    if (confirm('ഈ കാറ്റഗറി നീക്കം ചെയ്യണമോ?')) {
      await window.dbEngine.deleteCategory(id);
      this.showToast('കാറ്റഗറി ഒഴിവാക്കി', 'info');
      await this.refreshData();
    }
  }

  // --- Reports & Exports ---
  downloadPDFStatement() {
    const rangePreset = document.getElementById('reportRangePreset')?.value || 'this_month';
    const customStart = document.getElementById('reportStartDate')?.value || '';
    const customEnd = document.getElementById('reportEndDate')?.value || '';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    let rangeTitle = 'All Time';
    const filtered = this.transactions.filter(tx => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';

      if (rangePreset === 'this_month') {
        rangeTitle = `Month: ${thisMonthStr}`;
        return txDate.startsWith(thisMonthStr);
      } else if (rangePreset === 'last_month') {
        const lastM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMStr = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, '0')}`;
        rangeTitle = `Month: ${lastMStr}`;
        return txDate.startsWith(lastMStr);
      } else if (rangePreset === 'this_year') {
        rangeTitle = `Year: ${today.getFullYear()}`;
        return txDate.startsWith(String(today.getFullYear()));
      } else if (rangePreset === 'custom') {
        rangeTitle = `${customStart} to ${customEnd}`;
        if (customStart && txDate < customStart) return false;
        if (customEnd && txDate > customEnd) return false;
        return true;
      }
      return true;
    });

    window.reportsEngine.downloadStatementPDF(filtered, this.categories, this.officeProfile, rangeTitle);
  }

  downloadSingleVoucher(id) {
    const tx = this.transactions.find(t => t.id === Number(id));
    if (!tx) return;
    const cat = this.categories.find(c => c.id === tx.category);
    window.reportsEngine.downloadVoucherPDF(tx, cat, this.officeProfile);
  }

  downloadExcel() {
    window.reportsEngine.exportToCSV(this.transactions, this.categories, this.officeProfile);
    this.showToast('എക്സൽ (CSV) ഡൗൺലോഡ് ചെയ്യുന്നു...', 'success');
  }

  // --- Backup & Restore Engine ---
  async downloadBackupJSON() {
    const data = await window.dbEngine.exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

  async handleRestoreJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await window.dbEngine.importBackup(json);
        this.showToast(window.i18n.t('backupSuccess'), 'success');
        await this.loadSettingsAndTheme();
        await this.refreshData();
      } catch (err) {
        alert(window.i18n.t('backupError') + ': ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  async clearAllData() {
    if (confirm(window.i18n.t('confirmClearAll'))) {
      await window.dbEngine.clearAllData();
      this.showToast('എല്ലാ ഇടപാടുകളും നീക്കം ചെയ്തു!', 'info');
      await this.refreshData();
    }
  }

  // --- Office Profile Save ---
  async handleSaveProfile(event) {
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

  // --- PWA Installation Setup ---
  setupPWA() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch((err) => {
          console.log('[PWA] Service Worker notice:', err);
        });
      });
    }

    const installBtn = document.getElementById('btnInstallApp');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installBtn) {
        installBtn.classList.remove('hidden');
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          this.deferredPrompt = null;
          installBtn.classList.add('hidden');
        }
      });
    }

    window.addEventListener('appinstalled', () => {
      if (installBtn) installBtn.classList.add('hidden');
      this.showToast('ആപ്പ് വിജയകരമായി ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്തു!', 'success');
    });
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

  // --- Event Listeners Setup ---
  setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) this.switchView(target);
      });
    });

    document.getElementById('btnThemeToggle')?.addEventListener('click', () => this.toggleTheme());

    document.getElementById('btnLangToggle')?.addEventListener('click', () => {
      const nextLang = window.i18n.currentLang === 'ml' ? 'en' : 'ml';
      window.i18n.setLanguage(nextLang);
      document.getElementById('langLabelText').textContent = nextLang === 'ml' ? 'English' : 'മലയാളം';
    });

    document.getElementById('btnSecurityLock')?.addEventListener('click', () => {
      if (this.userPin) {
        this.showPinLock();
      } else {
        this.togglePinSetting();
      }
    });

    document.querySelectorAll('.pin-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        this.handlePinInput(val);
      });
    });

    document.getElementById('mobileFabAdd')?.addEventListener('click', () => this.openAddTxModal('expense'));
    document.getElementById('sidebarBtnExpense')?.addEventListener('click', () => this.openAddTxModal('expense'));
    document.getElementById('sidebarBtnIncome')?.addEventListener('click', () => this.openAddTxModal('income'));
    document.getElementById('dashBtnExpense')?.addEventListener('click', () => this.openAddTxModal('expense'));
    document.getElementById('dashBtnIncome')?.addEventListener('click', () => this.openAddTxModal('income'));

    document.getElementById('dashBtnPDF')?.addEventListener('click', () => this.downloadPDFStatement());
    document.getElementById('dashBtnExcel')?.addEventListener('click', () => this.downloadExcel());
    document.getElementById('btnViewAllFromDash')?.addEventListener('click', () => this.switchView('transactions'));

    document.getElementById('btnCloseTxModal')?.addEventListener('click', () => this.closeTxModal());
    document.getElementById('btnCancelTx')?.addEventListener('click', () => this.closeTxModal());

    document.getElementById('toggleTypeExpense')?.addEventListener('click', () => this.setTxType('expense'));
    document.getElementById('toggleTypeIncome')?.addEventListener('click', () => this.setTxType('income'));

    document.getElementById('btnQuickAddCat')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnOpenAddCategoryModal')?.addEventListener('click', () => this.openAddCategoryModal());
    document.getElementById('btnCloseCatModal')?.addEventListener('click', () => this.closeAddCategoryModal());
    document.getElementById('btnCancelCat')?.addEventListener('click', () => this.closeAddCategoryModal());

    document.getElementById('txForm')?.addEventListener('submit', (e) => this.handleSaveTx(e));
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => this.handleSaveCategory(e));
    document.getElementById('officeProfileForm')?.addEventListener('submit', (e) => this.handleSaveProfile(e));

    document.getElementById('txPhotoInput')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handlePhotoUpload(e.target.files[0]);
      }
    });
    document.getElementById('btnDeleteAttachment')?.addEventListener('click', () => this.hideAttachmentPreview());

    document.getElementById('btnCloseLightbox')?.addEventListener('click', () => this.closeLightbox());

    // Ledger Filters
    document.getElementById('txSearchInput')?.addEventListener('input', () => this.renderTransactionsLedger());
    document.getElementById('filterTypeSelect')?.addEventListener('change', () => this.renderTransactionsLedger());
    document.getElementById('filterCategorySelect')?.addEventListener('change', () => this.renderTransactionsLedger());
    document.getElementById('filterDateRangeSelect')?.addEventListener('change', (e) => {
      const customRow = document.getElementById('customDateRangeRow');
      if (e.target.value === 'custom') {
        customRow?.classList.remove('hidden');
      } else {
        customRow?.classList.add('hidden');
      }
      this.renderTransactionsLedger();
    });
    document.getElementById('customStartDate')?.addEventListener('change', () => this.renderTransactionsLedger());
    document.getElementById('customEndDate')?.addEventListener('change', () => this.renderTransactionsLedger());

    // Report Controls
    document.getElementById('reportRangePreset')?.addEventListener('change', (e) => {
      const startCol = document.getElementById('reportCustomStartCol');
      const endCol = document.getElementById('reportCustomEndCol');
      if (e.target.value === 'custom') {
        startCol?.classList.remove('hidden');
        endCol?.classList.remove('hidden');
      } else {
        startCol?.classList.add('hidden');
        endCol?.classList.add('hidden');
      }
      this.renderReports();
    });
    document.getElementById('reportStartDate')?.addEventListener('change', () => this.renderReports());
    document.getElementById('reportEndDate')?.addEventListener('change', () => this.renderReports());

    document.getElementById('btnExportPDF')?.addEventListener('click', () => this.downloadPDFStatement());
    document.getElementById('btnExportCSV')?.addEventListener('click', () => this.downloadExcel());
    document.getElementById('btnPrintReport')?.addEventListener('click', () => window.print());

    document.getElementById('btnDownloadBackupJSON')?.addEventListener('click', () => this.downloadBackupJSON());
    document.getElementById('inputRestoreJSON')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleRestoreJSON(e.target.files[0]);
      }
    });
    document.getElementById('btnTogglePinSetting')?.addEventListener('click', () => this.togglePinSetting());
    document.getElementById('btnClearAllData')?.addEventListener('click', () => this.clearAllData());
  }

  // --- Utility Functions ---
  formatCurrency(num) {
    const sym = (this.officeProfile && this.officeProfile.currency) ? this.officeProfile.currency : '₹';
    return sym + Number(num || 0).toLocaleString('en-IN', {
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

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = type === 'success' ? '#10b981' : type === 'error' ? '#f43f5e' : '#1e293b';

    toast.className = 'toast-msg';
    toast.style.backgroundColor = bg;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.appEngine = new OfficeFinanceApp();
  window.appEngine.init();
});
