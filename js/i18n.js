/**
 * i18n.js - Complete Bilingual Internationalization Engine (Malayalam & English)
 */

const translations = {
  ml: {
    // Top Bar & App Info
    appTitle: 'OFFICE FINANCE TRACKER',
    appSubtitle: 'സ്മാർട്ട് ഓഫീസ് ഫിനാൻസ് മാനേജ്‌മെന്റ്',
    langToggle: 'English',
    themeToggle: 'തീം മാറ്റുക',
    dark: 'ഡാർക്ക്',
    light: 'ലൈറ്റ്',
    installApp: 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',

    // Navigation
    navOverview: 'Overview',
    navFinances: 'Finances',
    navReports: 'Reports',
    navSettings: 'Settings',

    // Page Title & Period Tabs
    pageTitle: 'ഇടപാടുകളും ഫിനാൻസും',
    pageSub: 'ഓഫീസ് വരവ് ചിലവ് കണക്കുകൾ കൃത്യമായി രേഖപ്പെടുത്താം.',
    periodDaily: 'Daily (ഇന്ന്)',
    periodWeekly: 'Weekly (ഈ ആഴ്ച)',
    periodMonthly: 'Monthly (ഈ മാസം)',
    periodYearly: 'Yearly (ഈ വർഷം)',
    periodAll: 'All Time (മുഴുവൻ)',
    btnCreateTx: '+ പുതിയ ഇടപാട്',

    // The 4 Stat Cards
    netBalance: 'ആകെ മിച്ചം (Net Balance)',
    totalIncome: 'ആകെ വരവ് (Total Income)',
    totalExpense: 'ആകെ ചിലവ് (Total Expense)',
    inStorage: 'സ്റ്റോറേജിലെ കണക്കുകൾ',
    incomeCountLabel: 'വരവ് ഇടപാടുകൾ:',
    expenseCountLabel: 'ചിലവ് ഇടപാടുകൾ:',
    activePeriodLabelDaily: 'ഇന്നത്തെ കണക്ക്',
    activePeriodLabelWeekly: 'ഈ ആഴ്ചയിലെ കണക്ക്',
    activePeriodLabelMonthly: 'ഈ മാസത്തെ കണക്ക്',
    activePeriodLabelYearly: 'ഈ വർഷത്തെ കണക്ക്',
    activePeriodLabelAll: 'ആകെ കണക്ക്',

    // Active Filter & Exports Banner
    filterLabel: 'ഫിൽട്ടർ:',
    filterAll: 'എല്ലാം (All)',
    filterExpense: 'ചിലവ് (Expense)',
    filterIncome: 'വരവ് (Income)',
    searchEntryPlaceholder: 'തിരയുക...',
    btnPrint: 'പ്രിന്റ്',

    // Finnova Navy Split Board
    recentTransactions: 'സമീപകാല ഇടപാടുകൾ (Transactions)',
    invoiceDetails: 'ഇൻവോയ്സ് / വൗച്ചർ വിവരങ്ങൾ',
    verified: 'പരിശോധിച്ചത്',
    amountCol: 'തുക (AMOUNT)',
    categoryCol: 'വിഭാഗം (CATEGORY)',
    dateCol: 'തീയതി (DATE)',
    partyDetailsLabel: 'ആർക്ക് നൽകി / ലഭിച്ചത്:',
    noNotes: 'കുറിപ്പുകൾ ലഭ്യമല്ല',
    totalBalanceLabel: 'മൊത്തം തുക (Total Balance)',
    btnPrintVoucher: 'വൗച്ചർ PDF',
    noTxSelected: 'ഈ കാറ്റഗറിയിൽ ഇടപാടുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല',

    // Charts
    financialFlow: 'Financial Flow (ഒഴുക്ക്)',
    trendOverview: 'Trend Overview',
    categoryBreakdown: 'Category Breakdown',

    // Transactions Full View
    searchLedgerPlaceholder: 'വ്യക്തി, കാറ്റഗറി, ബിൽ, വിവരണം തിരയുക...',
    filterAllTypes: 'All Types (എല്ലാം)',
    filterIncomeOnly: 'Income Only (വരവ്)',
    filterExpenseOnly: 'Expense Only (ചിലവ്)',
    filterAllCategories: 'All Categories',
    foundEntries: 'കണ്ടെത്തിയവ:',
    entriesUnit: 'ഇടപാടുകൾ',

    // Reports View - 1-Click Cards
    reportsTitle: 'റിപ്പോർട്ടുകളും ഡൗൺലോഡുകളും (Reports & Downloads)',
    reportsSubtitle: 'Daily, Weekly, Monthly, Yearly സ്റ്റേറ്റ്‌മെന്റുകൾ PDF ആയോ Excel ആയോ ഒരൊറ്റ ക്ലിക്കിൽ ഡൗൺലോഡ് ചെയ്യാം',
    dailyReportTitle: 'ഇന്നത്തെ കണക്ക്',
    dailyReportSub: 'Daily Report (Today)',
    dailyReportDesc: 'ഇന്നത്തെ എല്ലാ വരവ് ചിലവ് വിവരങ്ങളും അടങ്ങിയ റിപ്പോർട്ട്',
    weeklyReportTitle: 'ഈ ആഴ്ചയിലെ കണക്ക്',
    weeklyReportSub: 'Weekly Statement',
    weeklyReportDesc: 'കഴിഞ്ഞ 7 ദിവസങ്ങളിലെ ഔദ്യോഗിക ഫിനാൻഷ്യൽ സ്റ്റേറ്റ്‌മെന്റ്',
    monthlyReportTitle: 'ഈ മാസത്തെ കണക്ക്',
    monthlyReportSub: 'Monthly Statement',
    monthlyReportDesc: 'നടപ്പു മാസത്തെ കാറ്റഗറി തിരിച്ചുള്ള സമഗ്ര കണക്കുകൾ',
    yearlyReportTitle: 'ഈ വർഷത്തെ കണക്ക്',
    yearlyReportSub: 'Annual Financial Report',
    yearlyReportDesc: 'മുഴുവൻ സാമ്പത്തിക വർഷത്തെ വരുമാന, ചിലവ് ഓഡിറ്റ് റിപ്പോർട്ട്',

    customRangeTitle: 'കസ്റ്റം ഡേറ്റ് റേഞ്ച് റിപ്പോർട്ട് (Custom Period)',
    btnDownloadPDF: '📄 PDF സ്റ്റേറ്റ്‌മെന്റ് ഡൗൺലോഡ്',
    btnDownloadExcel: '📊 എക്സൽ (Excel / CSV) ഡൗൺലോഡ്',
    btnPrintStatement: '🖨️ പ്രിന്റ് ചെയ്യുക',

    // Settings View
    categoryManagement: 'കാറ്റഗറി മാനേജ്‌മെന്റ്',
    categorySub: 'വരവ്, ചിലവ് വിഭാഗങ്ങൾ പരിശോധിക്കുകയോ പുതിയവ ചേർക്കുകയോ ചെയ്യാം',
    btnAddCategory: '+ പുതിയ കാറ്റഗറി',
    expenseCategories: 'ചിലവ് വിഭാഗങ്ങൾ (Expense Categories)',
    incomeCategories: 'വരവ് വിഭാഗങ്ങൾ (Income Categories)',
    officeProfile: 'ഓഫീസ് പ്രൊഫൈൽ',
    officeProfileSub: 'PDF വൗച്ചറുകളിലും സ്റ്റേറ്റ്‌മെന്റുകളിലും വരുന്ന വിവരങ്ങൾ',
    profileName: 'സ്ഥാപനത്തിന്റെ പേര്',
    profileTagline: 'ഉപശീർഷകം',
    profileAddress: 'വിലാസം',
    profilePhone: 'ഫോൺ നമ്പർ',
    profileCurrency: 'കറൻസി',
    btnSaveProfile: 'സേവ് ചെയ്യുക',
    dataBackup: 'ഡാറ്റാ ബാക്കപ്പ്',
    dataBackupSub: 'കണക്കുകൾ ബാക്കപ്പ് എടുക്കാനും തിരിച്ചെടുക്കാനും',
    btnDownloadBackupJSON: '📥 ഡൗൺലോഡ് ബാക്കപ്പ് (JSON)',
    btnRestoreJSON: '📤 ബാക്കപ്പ് റീസ്റ്റോർ ചെയ്യുക',
    appSecurity: 'ആപ്പ് സെക്യൂരിറ്റി',
    appSecuritySub: '4-അക്ക സുരക്ഷാ PIN ലോക്ക്',
    pinStatusActive: 'PIN സുരക്ഷ സജീവമാണ്',
    pinStatusInactive: 'PIN സുരക്ഷ ഓഫാണ്',
    btnChangePin: 'PIN മാറ്റുക',
    btnClearAll: '⚠️ എല്ലാ ഇടപാടുകളും മായ്ക്കുക',

    // Modals
    modalAddTitle: 'പുതിയ ഇടപാട് രേഖപ്പെടുത്തുക',
    modalEditTitle: 'ഇടപാട് തിരുത്തുക',
    typeExpense: 'ചിലവ് (Expense)',
    typeIncome: 'വരവ് (Income)',
    amountLabel: 'തുക (₹ Amount)',
    categoryLabel: 'വിഭാഗം / കാറ്റഗറി (Type or Select Category)',
    categoryPlaceholder: 'കാറ്റഗറി ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കുക...',
    dateLabel: 'തീയതി (Date)',
    partyLabelExpense: 'ആർക്ക് നൽകി (Paid To)',
    partyLabelIncome: 'ആരിൽ നിന്ന് ലഭിച്ചു (Received From)',
    partyPlaceholder: 'വ്യക്തി അല്ലെങ്കിൽ സ്ഥാപനത്തിന്റെ പേര്',
    billNoLabel: 'ബിൽ / ഇൻവോയ്സ് നമ്പർ (Bill / Invoice #)',
    notesLabel: 'കുറിപ്പുകൾ / വിവരണം (Notes)',
    attachmentLabel: 'ബിൽ / രസീത് ഫോട്ടോ (Attachment)',
    btnTakePhoto: 'ഫോട്ടോ എടുക്കുക / അപ്‌ലോഡ് ചെയ്യുക',
    photoAttached: 'ഫോട്ടോ അറ്റാച്ച് ചെയ്തു',
    btnCancel: 'റദ്ദാക്കുക',
    btnSave: 'സേവ് ചെയ്യുക',

    // Toasts
    savedSuccess: 'ഇടപാട് വിജയകരമായി സേവ് ചെയ്തു!',
    updatedSuccess: 'ഇടപാട് അപ്ഡേറ്റ് ചെയ്തു!',
    deletedSuccess: 'ഇടപാട് മായ്ച്ചു!',
    categoryAdded: 'പുതിയ കാറ്റഗറി ചേർത്തു!',
    profileSaved: 'ഓഫീസ് പ്രൊഫൈൽ സേവ് ചെയ്തു!',
    backupDownloaded: 'ബാക്കപ്പ് ഡൗൺലോഡ് പൂർത്തിയായി!',
    confirmDelete: 'ഈ ഇടപാട് ഡിലീറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?',
    confirmClearAll: 'ശ്രദ്ധിക്കുക: എല്ലാ വരവ് ചിലവ് ഇടപാടുകളും പൂർണ്ണമായും മായ്ക്കപ്പെടും. തുടരണമോ?'
  },

  en: {
    // Top Bar & App Info
    appTitle: 'OFFICE FINANCE TRACKER',
    appSubtitle: 'Smart Finances, Better Business',
    langToggle: 'മലയാളം',
    themeToggle: 'Toggle Theme',
    dark: 'Dark',
    light: 'Light',
    installApp: 'Install App',

    // Navigation
    navOverview: 'Overview',
    navFinances: 'Finances',
    navReports: 'Reports',
    navSettings: 'Settings',

    // Page Title & Period Tabs
    pageTitle: 'Invoices & Finances',
    pageSub: 'Manage and track all your office income and expenses in one place.',
    periodDaily: 'Daily (Today)',
    periodWeekly: 'Weekly (This Week)',
    periodMonthly: 'Monthly (This Month)',
    periodYearly: 'Yearly (This Year)',
    periodAll: 'All Time',
    btnCreateTx: '+ Create Transaction',

    // The 4 Stat Cards
    netBalance: 'Net Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    inStorage: 'Available In Storage',
    incomeCountLabel: 'Income Entries:',
    expenseCountLabel: 'Expense Entries:',
    activePeriodLabelDaily: "Today's Ledger",
    activePeriodLabelWeekly: 'This Week',
    activePeriodLabelMonthly: 'This Month',
    activePeriodLabelYearly: 'This Year',
    activePeriodLabelAll: 'All Time Total',

    // Active Filter & Exports Banner
    filterLabel: 'Filter:',
    filterAll: 'All',
    filterExpense: 'Expense',
    filterIncome: 'Income',
    searchEntryPlaceholder: 'Search entry...',
    btnPrint: 'Print',

    // Finnova Navy Split Board
    recentTransactions: 'Recent Transactions',
    invoiceDetails: 'Invoice / Voucher Details',
    verified: 'Verified',
    amountCol: 'AMOUNT',
    categoryCol: 'CATEGORY',
    dateCol: 'DATE',
    partyDetailsLabel: 'Paid To / Received From:',
    noNotes: 'No remarks provided',
    totalBalanceLabel: 'Total Balance',
    btnPrintVoucher: 'Voucher PDF',
    noTxSelected: 'No transactions found in this category',

    // Charts
    financialFlow: 'Financial Flow',
    trendOverview: 'Trend Overview',
    categoryBreakdown: 'Category Breakdown',

    // Transactions Full View
    searchLedgerPlaceholder: 'Search party, category, bill, notes...',
    filterAllTypes: 'All Types',
    filterIncomeOnly: 'Income Only',
    filterExpenseOnly: 'Expense Only',
    filterAllCategories: 'All Categories',
    foundEntries: 'Found:',
    entriesUnit: 'entries',

    // Reports View - 1-Click Cards
    reportsTitle: 'Reports & Downloads',
    reportsSubtitle: 'Download official Daily, Weekly, Monthly, and Yearly statements in PDF or Excel with 1-click',
    dailyReportTitle: "Today's Accounts",
    dailyReportSub: 'Daily Report (Today)',
    dailyReportDesc: "Complete itemized statement of today's income & expenses",
    weeklyReportTitle: "This Week's Accounts",
    weeklyReportSub: 'Weekly Statement',
    weeklyReportDesc: 'Official financial statement of transactions over the last 7 days',
    monthlyReportTitle: "This Month's Accounts",
    monthlyReportSub: 'Monthly Statement',
    monthlyReportDesc: 'Comprehensive monthly category breakdown of all operations',
    yearlyReportTitle: "This Year's Accounts",
    yearlyReportSub: 'Annual Financial Report',
    yearlyReportDesc: 'Complete financial statement and audit summary for the current year',

    customRangeTitle: 'Custom Date Range Report',
    btnDownloadPDF: '📄 Download PDF Statement',
    btnDownloadExcel: '📊 Download Excel (CSV)',
    btnPrintStatement: '🖨️ Print Statement',

    // Settings View
    categoryManagement: 'Category Management',
    categorySub: 'Review or add custom income and expense categories',
    btnAddCategory: '+ New Category',
    expenseCategories: 'Expense Categories',
    incomeCategories: 'Income Categories',
    officeProfile: 'Office Profile',
    officeProfileSub: 'Information displayed on PDF vouchers and financial statements',
    profileName: 'Office / Business Name',
    profileTagline: 'Tagline / Subtitle',
    profileAddress: 'Address',
    profilePhone: 'Phone Number',
    profileCurrency: 'Currency',
    btnSaveProfile: 'Save Profile',
    dataBackup: 'Data Backup',
    dataBackupSub: 'Backup and restore financial records',
    btnDownloadBackupJSON: '📥 Download Backup (JSON)',
    btnRestoreJSON: '📤 Restore Backup File',
    appSecurity: 'App Security',
    appSecuritySub: '4-digit security PIN lock',
    pinStatusActive: 'PIN Security is Active',
    pinStatusInactive: 'PIN Security is Disabled',
    btnChangePin: 'Change PIN',
    btnClearAll: '⚠️ Clear All Transactions',

    // Modals
    modalAddTitle: 'Record New Transaction',
    modalEditTitle: 'Edit Transaction',
    typeExpense: 'Expense',
    typeIncome: 'Income',
    amountLabel: 'Amount (₹)',
    categoryLabel: 'Category (Type or Select)',
    categoryPlaceholder: 'Type category or pick from list...',
    dateLabel: 'Date',
    partyLabelExpense: 'Paid To',
    partyLabelIncome: 'Received From',
    partyPlaceholder: 'Person or Company Name',
    billNoLabel: 'Bill / Invoice # (Optional)',
    notesLabel: 'Notes / Description (Optional)',
    attachmentLabel: 'Bill / Receipt Photo (Optional)',
    btnTakePhoto: 'Take / Upload Photo',
    photoAttached: 'Photo Attached',
    btnCancel: 'Cancel',
    btnSave: 'Save Entry',

    // Toasts
    savedSuccess: 'Transaction saved successfully!',
    updatedSuccess: 'Transaction updated successfully!',
    deletedSuccess: 'Transaction deleted successfully!',
    categoryAdded: 'New category added successfully!',
    profileSaved: 'Office profile saved successfully!',
    backupDownloaded: 'Backup download completed!',
    confirmDelete: 'Are you sure you want to delete this transaction?',
    confirmClearAll: 'Warning: All transactions will be permanently deleted. Continue?'
  }
};

class I18nEngine {
  constructor() {
    this.currentLang = 'en'; // default or restored
  }

  async init() {
    let savedLang = 'en';
    if (window.dbEngine) {
      savedLang = await window.dbEngine.getSetting('appLanguage', 'en');
    }
    this.currentLang = savedLang;
    this.applyTranslations();
    this.updateLanguageUI();
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.en;
    return dict[key] || (translations.en && translations.en[key]) || key;
  }

  async setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      if (window.dbEngine) {
        await window.dbEngine.setSetting('appLanguage', lang);
      }
      this.applyTranslations();
      this.updateLanguageUI();

      if (window.appEngine) {
        window.appEngine.onLanguageChanged();
      }
    }
  }

  updateLanguageUI() {
    const btnMl = document.getElementById('btnSetLangMl');
    const btnEn = document.getElementById('btnSetLangEn');

    if (btnMl && btnEn) {
      if (this.currentLang === 'ml') {
        btnMl.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnMl.classList.remove('active');
      }
    }
  }

  getCategoryName(cat) {
    if (!cat) return '';
    return this.currentLang === 'ml' ? (cat.nameMl || cat.nameEn) : (cat.nameEn || cat.nameMl);
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((elem) => {
      const key = elem.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        elem.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((elem) => {
      const key = elem.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) {
        elem.setAttribute('placeholder', text);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((elem) => {
      const key = elem.getAttribute('data-i18n-title');
      const text = this.t(key);
      if (text) {
        elem.setAttribute('title', text);
      }
    });

    document.title = `${this.t('appTitle')} | ${this.t('appSubtitle')}`;
  }
}

window.i18n = new I18nEngine();
