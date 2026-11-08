/**
 * i18n.js - Bilingual Internationalization (Malayalam & English)
 */

const translations = {
  ml: {
    // Top Bar & App Info
    appTitle: 'ഓഫീസ് ഫിനാൻസ്',
    appSubtitle: 'വരവ്-ചിലവ് മാനേജ്‌മെന്റ് സിസ്റ്റം',
    langToggle: 'English',
    themeToggle: 'തീം മാറ്റുക',
    installApp: 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',

    // Navigation
    navDashboard: 'ഡാഷ്‌ബോർഡ്',
    navTransactions: 'കണക്കുകൾ',
    navAdd: 'പുതിയത്',
    navReports: 'റിപ്പോർട്ടുകൾ',
    navSettings: 'സെറ്റിംഗ്സ്',

    // Dashboard Cards
    netBalance: 'ആകെ മിച്ചം (ബാലൻസ്)',
    totalIncome: 'ആകെ വരവ്',
    totalExpense: 'ആകെ ചിലവ്',
    thisMonthNet: 'ഈ മാസത്തെ മിച്ചം',
    todayIncome: 'ഇന്നത്തെ വരവ്',
    todayExpense: 'ഇന്നത്തെ ചിലവ്',
    quickActions: 'ദ്രുത എൻട്രികൾ',
    btnNewIncome: '+ വരവ് ചേർക്കുക',
    btnNewExpense: '+ ചിലവ് ചേർക്കുക',
    monthlyTrend: 'പ്രതിമാസ വരവ്-ചിലവ് അവലോകനം',
    expenseBreakdown: 'ചിലവുകളുടെ കാറ്റഗറി വിഹിതം',
    recentTransactions: 'സമീപകാല ഇടപാടുകൾ',
    viewAll: 'മുഴുവൻ കാണുക',
    noTransactionsYet: 'ഇടപാടുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല. "+ വരവ്" അല്ലെങ്കിൽ "+ ചിലവ്" ക്ലിക്ക് ചെയ്ത് തുടങ്ങുക!',

    // Transactions Ledger
    ledgerTitle: 'ഇടപാടുകളുടെ ലെഡ്ജർ',
    searchPlaceholder: 'വ്യക്തി, ബിൽ നമ്പർ, വിവരണം തിരയുക...',
    filterAll: 'എല്ലാം',
    filterIncome: 'വരവ് മാത്രം',
    filterExpense: 'ചിലവ് മാത്രം',
    filterCategory: 'കാറ്റഗറി',
    filterAllCategories: 'എല്ലാ കാറ്റഗറികളും',
    filterDateRange: 'തീയതി ക്രമം',
    rangeAllTime: 'എല്ലാ സമയത്തെയും',
    rangeToday: 'ഇന്ന്',
    rangeYesterday: 'ഇന്നലെ',
    rangeThisWeek: 'ഈ ആഴ്ച',
    rangeThisMonth: 'ഈ മാസം',
    rangeCustom: 'നിശ്ചിത തീയതി',
    fromDate: 'തീയതി മുതൽ',
    toDate: 'തീയതി വരെ',
    colDate: 'തീയതി',
    colCategory: 'വിഭാഗം',
    colParty: 'വ്യക്തി / സ്ഥാപനം',
    colNotes: 'വിവരണം / ബിൽ',
    colAmount: 'തുക',
    colActions: 'നടപടികൾ',

    // Transaction Modal
    modalAddTitle: 'പുതിയ ഇടപാട് രേഖപ്പെടുത്തുക',
    modalEditTitle: 'ഇടപാട് തിരുത്തുക',
    typeIncome: 'വരവ് (Income)',
    typeExpense: 'ചിലവ് (Expense)',
    labelAmount: 'തുക (₹)',
    labelCategory: 'കാറ്റഗറി തിരഞ്ഞെടുക്കുക',
    btnAddCategory: '+ പുതിയ കാറ്റഗറി',
    labelDate: 'തീയതി & സമയം',
    labelPartyExpense: 'ആർക്ക് നൽകി (Paid To)',
    labelPartyIncome: 'ആരിൽ നിന്ന് ലഭിച്ചു (Received From)',
    labelBillNo: 'ബിൽ / ഇൻവോയ്സ് / വൗച്ചർ നമ്പർ (ഓപ്ഷണൽ)',
    labelNotes: 'കുറിപ്പുകൾ / വിവരണം (ഓപ്ഷണൽ)',
    labelAttachment: 'ബിൽ / രസീത് ഫോട്ടോ (ഓപ്ഷണൽ)',
    btnTakePhoto: 'ക്യാമറ / ഫോട്ടോ തിരഞ്ഞെടുക്കുക',
    btnRemovePhoto: 'ഫോട്ടോ മാറ്റുക',
    btnSave: 'സേവ് ചെയ്യുക',
    btnCancel: 'റദ്ദാക്കുക',
    btnDelete: 'ഡിലീറ്റ് ചെയ്യുക',

    // Custom Category Modal
    catModalTitle: 'പുതിയ കാറ്റഗറി ചേർക്കുക',
    catTypeLabel: 'കാറ്റഗറിയുടെ തരം',
    catNameMl: 'മലയാളം പേര്',
    catNameEn: 'English പേര്',
    catColorLabel: 'നിറം തിരഞ്ഞെടുക്കുക',
    btnSaveCat: 'കാറ്റഗറി ചേർക്കുക',

    // Reports & Exports
    reportsTitle: 'റിപ്പോർട്ടുകളും സ്റ്റേറ്റ്‌മെന്റുകളും',
    reportsSubtitle: 'ഓഫീസ് കണക്കുകളുടെ ഔദ്യോഗിക PDF വൗച്ചറുകളും എക്സൽ ഫയലുകളും ഡൗൺലോഡ് ചെയ്യുക',
    btnDownloadPDF: '📄 PDF സ്റ്റേറ്റ്‌മെന്റ് ഡൗൺലോഡ്',
    btnDownloadExcel: '📊 എക്സൽ (Excel / CSV) ഡൗൺലോഡ്',
    btnPrintStatement: '🖨️ പ്രിന്റ് ചെയ്യുക',
    reportSummary: 'തിരഞ്ഞെടുത്ത കാലയളവിലെ സംഗ്രഹം',
    reportTotalTx: 'ആകെ ഇടപാടുകൾ',
    topExpenseCat: 'കൂടുതൽ ചിലവായ വിഭാഗം',
    voucherTitle: 'ക്യാഷ് പേയ്‌മെന്റ് / റെസീറ്റ് വൗച്ചർ',
    btnPrintVoucher: 'പ്രിന്റ് വൗച്ചർ',

    // Settings
    settingsTitle: 'ഓഫീസ് ക്രമീകരണങ്ങൾ',
    profileSection: 'ഓഫീസ് പ്രൊഫൈൽ',
    profileName: 'സ്ഥാപനത്തിന്റെ പേര്',
    profileTagline: 'ഉപശീർഷകം / വിവരണം',
    profileAddress: 'വിലാസം',
    profilePhone: 'ഫോൺ നമ്പർ',
    profileEmail: 'ഇമെയിൽ',
    profileCurrency: 'കറൻസി ചിഹ്നം',
    btnSaveProfile: 'പ്രൊഫൈൽ സേവ് ചെയ്യുക',
    categorySection: 'കാറ്റഗറി മാനേജ്‌മെന്റ്',
    backupSection: 'ഡാറ്റാ ബാക്കപ്പും സുരക്ഷയും',
    btnBackupJSON: '📥 ബാക്കപ്പ് ഫയൽ ഡൗൺലോഡ് ചെയ്യുക (JSON)',
    btnRestoreJSON: '📤 ബാക്കപ്പ് ഫയൽ റീസ്റ്റോർ ചെയ്യുക',
    securitySection: 'ആപ്പ് സെക്യൂരിറ്റി PIN',
    pinStatusActive: 'PIN സുരക്ഷ സജീവമാണ്',
    pinStatusInactive: 'PIN സുരക്ഷ ഓഫാണ്',
    btnSetPin: '4-അക്ക PIN സെറ്റ് ചെയ്യുക',
    btnRemovePin: 'PIN മാറ്റുക',
    dangerZone: 'ഡാറ്റാ റീസെറ്റ്',
    btnClearAll: '⚠️ എല്ലാ ഇടപാടുകളും മായ്ക്കുക',

    // Notifications & Prompts
    savedSuccess: 'ഇടപാട് വിജയകരമായി സേവ് ചെയ്തു!',
    updatedSuccess: 'ഇടപാട് അപ്ഡേറ്റ് ചെയ്തു!',
    deletedSuccess: 'ഇടപാട് നീക്കം ചെയ്തു!',
    categoryAdded: 'പുതിയ കാറ്റഗറി വിജയകരമായി ചേർത്തു!',
    profileSaved: 'ഓഫീസ് പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്തു!',
    backupDownloaded: 'ബാക്കപ്പ് ഫയൽ ഡൗൺലോഡ് ചെയ്തു!',
    backupSuccess: 'ബാക്കപ്പ് വിജയകരമായി റീസ്റ്റോർ ചെയ്തു!',
    backupError: 'ബാക്കപ്പ് ഫയൽ തെറ്റാണ്!',
    confirmDelete: 'ഈ ഇടപാട് തീർച്ചയായും ഒഴിവാക്കണമോ?',
    confirmClearAll: 'ശ്രദ്ധിക്കുക: എല്ലാ കണക്കുകളും സ്ഥിരമായി മായ്ക്കപ്പെടും! തുടരണമോ?',
    enterPinPrompt: 'തുടരാൻ നിങ്ങളുടെ 4-അക്ക PIN നൽകുക:',
    wrongPin: 'നൽകിയ PIN തെറ്റാണ്!',
    pinSetSuccess: 'സുരക്ഷാ PIN വിജയകരമായി സെറ്റ് ചെയ്തു!'
  },

  en: {
    // Top Bar & App Info
    appTitle: 'Office Finance',
    appSubtitle: 'Income & Expense Management System',
    langToggle: 'മലയാളം',
    themeToggle: 'Toggle Theme',
    installApp: 'Install App',

    // Navigation
    navDashboard: 'Dashboard',
    navTransactions: 'Transactions',
    navAdd: 'Add Entry',
    navReports: 'Reports',
    navSettings: 'Settings',

    // Dashboard Cards
    netBalance: 'Net Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    thisMonthNet: 'This Month Net',
    todayIncome: "Today's Income",
    todayExpense: "Today's Expense",
    quickActions: 'Quick Actions',
    btnNewIncome: '+ Add Income',
    btnNewExpense: '+ Add Expense',
    monthlyTrend: 'Monthly Income vs Expense Trend',
    expenseBreakdown: 'Expense Breakdown by Category',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    noTransactionsYet: 'No transactions recorded yet. Click "+ Add Income" or "+ Add Expense" to start!',

    // Transactions Ledger
    ledgerTitle: 'Transactions Ledger',
    searchPlaceholder: 'Search party, bill no, description...',
    filterAll: 'All',
    filterIncome: 'Income Only',
    filterExpense: 'Expense Only',
    filterCategory: 'Category',
    filterAllCategories: 'All Categories',
    filterDateRange: 'Date Range',
    rangeAllTime: 'All Time',
    rangeToday: 'Today',
    rangeYesterday: 'Yesterday',
    rangeThisWeek: 'This Week',
    rangeThisMonth: 'This Month',
    rangeCustom: 'Custom Range',
    fromDate: 'From Date',
    toDate: 'To Date',
    colDate: 'Date',
    colCategory: 'Category',
    colParty: 'Paid To / Received From',
    colNotes: 'Notes / Bill No',
    colAmount: 'Amount',
    colActions: 'Actions',

    // Transaction Modal
    modalAddTitle: 'Record New Transaction',
    modalEditTitle: 'Edit Transaction',
    typeIncome: 'Income',
    typeExpense: 'Expense',
    labelAmount: 'Amount (₹)',
    labelCategory: 'Select Category',
    btnAddCategory: '+ New Category',
    labelDate: 'Date & Time',
    labelPartyExpense: 'Paid To',
    labelPartyIncome: 'Received From',
    labelBillNo: 'Bill / Invoice / Voucher No (Optional)',
    labelNotes: 'Notes / Remarks (Optional)',
    labelAttachment: 'Bill / Receipt Photo (Optional)',
    btnTakePhoto: 'Take / Upload Photo',
    btnRemovePhoto: 'Remove Photo',
    btnSave: 'Save Entry',
    btnCancel: 'Cancel',
    btnDelete: 'Delete',

    // Custom Category Modal
    catModalTitle: 'Add New Category',
    catTypeLabel: 'Category Type',
    catNameMl: 'Malayalam Name',
    catNameEn: 'English Name',
    catColorLabel: 'Select Color',
    btnSaveCat: 'Save Category',

    // Reports & Exports
    reportsTitle: 'Reports & Statements',
    reportsSubtitle: 'Download official PDF statements, vouchers, and Excel spreadsheets',
    btnDownloadPDF: '📄 Download PDF Statement',
    btnDownloadExcel: '📊 Download Excel (CSV)',
    btnPrintStatement: '🖨️ Print Statement',
    reportSummary: 'Summary of Selected Period',
    reportTotalTx: 'Total Transactions',
    topExpenseCat: 'Top Expense Category',
    voucherTitle: 'Payment / Receipt Voucher',
    btnPrintVoucher: 'Print Voucher',

    // Settings
    settingsTitle: 'Office Settings',
    profileSection: 'Office Profile',
    profileName: 'Office / Business Name',
    profileTagline: 'Subtitle / Tagline',
    profileAddress: 'Address',
    profilePhone: 'Phone Number',
    profileEmail: 'Email',
    profileCurrency: 'Currency Symbol',
    btnSaveProfile: 'Save Profile',
    categorySection: 'Category Management',
    backupSection: 'Data Backup & Security',
    btnBackupJSON: '📥 Download Backup (JSON)',
    btnRestoreJSON: '📤 Restore Backup File',
    securitySection: 'App Security PIN',
    pinStatusActive: 'PIN Security is Active',
    pinStatusInactive: 'PIN Security is Disabled',
    btnSetPin: 'Set 4-Digit PIN',
    btnRemovePin: 'Remove PIN',
    dangerZone: 'Data Reset',
    btnClearAll: '⚠️ Clear All Transactions',

    // Notifications & Prompts
    savedSuccess: 'Transaction saved successfully!',
    updatedSuccess: 'Transaction updated successfully!',
    deletedSuccess: 'Transaction deleted successfully!',
    categoryAdded: 'New category added successfully!',
    profileSaved: 'Office profile updated!',
    backupDownloaded: 'Backup file downloaded!',
    backupSuccess: 'Backup restored successfully!',
    backupError: 'Invalid backup file!',
    confirmDelete: 'Are you sure you want to delete this transaction?',
    confirmClearAll: 'Warning: All records will be permanently erased! Continue?',
    enterPinPrompt: 'Enter your 4-digit PIN to continue:',
    wrongPin: 'Incorrect PIN entered!',
    pinSetSuccess: 'Security PIN set successfully!'
  }
};

class I18nEngine {
  constructor() {
    this.currentLang = 'ml'; // Default to Malayalam
  }

  async init() {
    if (window.dbEngine) {
      const savedLang = await window.dbEngine.getSetting('language', 'ml');
      this.currentLang = savedLang;
    }
    this.applyTranslations();
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.ml;
    return dict[key] || translations.en[key] || key;
  }

  async setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      if (window.dbEngine) {
        await window.dbEngine.setSetting('language', lang);
      }
      this.applyTranslations();
      if (window.appEngine) {
        window.appEngine.renderCurrentView();
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

    // Update document title
    document.title = `${this.t('appTitle')} | ${this.t('appSubtitle')}`;
  }
}

window.i18n = new I18nEngine();
