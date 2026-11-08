/**
 * i18n.js - Complete Bilingual Internationalization Engine (Malayalam & English)
 * Ensures 100% of all UI strings, labels, buttons, tables, cards, charts, toasts and modals
 * switch seamlessly between Malayalam and English.
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
    pinLockTooltip: 'PIN സെക്യൂരിറ്റി ലോക്ക്',

    // Navigation
    navOverview: 'ഡാഷ്‌ബോർഡ്',
    navFinances: 'ഇടപാടുകൾ',
    navReports: 'റിപ്പോർട്ടുകൾ',
    navSettings: 'സെറ്റിംഗ്സ്',

    // Page Title & Period Tabs
    pageTitle: 'ഇടപാടുകളും ഫിനാൻസും',
    pageSub: 'ഓഫീസ് വരവ് ചിലവ് കണക്കുകൾ കൃത്യമായി രേഖപ്പെടുത്താം.',
    periodDaily: 'ഇന്ന് (Daily)',
    periodWeekly: 'ഈ ആഴ്ച (Weekly)',
    periodMonthly: 'ഈ മാസം (Monthly)',
    periodYearly: 'ഈ വർഷം (Yearly)',
    periodAll: 'മുഴുവൻ (All Time)',
    btnCreateTx: '+ പുതിയ ഇടപാട്',

    // The 4 Stat Cards
    netBalance: 'ആകെ മിച്ചം (Net Balance)',
    totalIncome: 'ആകെ വരവ് (Total Income)',
    totalExpense: 'ആകെ ചിലവ് (Total Expense)',
    inStorage: 'സ്റ്റോറേജിലെ കണക്കുകൾ',
    offlineSafe: '100% ഓഫ്ലൈൻ സുരക്ഷിതം',
    indexedDbSafe: 'മെമ്മറി സുരക്ഷിതം',
    incomeCountLabel: 'വരവ് ഇടപാടുകൾ:',
    expenseCountLabel: 'ചിലവ് ഇടപാടുകൾ:',
    totalTxUnit: 'ആകെ ഇടപാടുകൾ',
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
    recentTransactions: 'സമീപകാല ഇടപാടുകൾ',
    navyTabAll: 'എല്ലാം',
    navyTabExpense: 'ചിലവ്',
    navyTabIncome: 'വരവ്',
    invoiceDetails: 'ഇൻവോയ്സ് / വൗച്ചർ വിവരങ്ങൾ',
    verified: 'പരിശോധിച്ചത്',
    amountCol: 'തുക (AMOUNT)',
    categoryCol: 'വിഭാഗം (CATEGORY)',
    dateCol: 'തീയതി (DATE)',
    partyDetailsLabel: 'ആർക്ക് നൽകി / ലഭിച്ചത്:',
    receivedIncomeDefault: 'ലഭിച്ച വരുമാനം',
    officeExpenseDefault: 'ഓഫീസ് ചിലവ്',
    notesPrefix: 'വിവരണം:',
    noNotes: 'കുറിപ്പുകൾ ലഭ്യമല്ല',
    totalBalanceLabel: 'മൊത്തം തുക (Total Balance)',
    btnWhatsapp: 'WhatsApp',
    btnPrintVoucher: 'വൗച്ചർ PDF',
    btnEdit: 'തിരുത്തുക',
    btnDelete: 'ഡിലീറ്റ്',
    addPhonePrompt: '+ നമ്പർ നൽകുക',
    noTxSelected: 'ഈ കാറ്റഗറിയിൽ ഇടപാടുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല',
    selectTxPlaceholder: 'ഇടപാടുകൾ തിരഞ്ഞെടുക്കുക',

    // Charts
    financialFlow: 'സാമ്പത്തിക ഒഴുക്ക് (Flow)',
    trendOverview: 'ട്രെൻഡ് വിവരങ്ങൾ',
    categoryBreakdown: 'കാറ്റഗറി തിരിച്ചുള്ള ചിലവുകൾ',
    donutExpensesLabel: 'ചിലവുകൾ',
    othersLabel: 'മറ്റുള്ളവ',

    // Transactions Full View
    searchLedgerPlaceholder: 'വ്യക്തി, കാറ്റഗറി, ബിൽ, വിവരണം തിരയുക...',
    filterAllTypes: 'എല്ലാ ഇടപാടുകളും',
    filterIncomeOnly: 'വരവ് മാത്രം (Income)',
    filterExpenseOnly: 'ചിലവ് മാത്രം (Expense)',
    filterAllCategories: 'എല്ലാ വിഭാഗങ്ങളും',
    rangeAllTime: 'മുഴുവൻ സമയം',
    rangeToday: 'ഇന്ന് (Today)',
    rangeYesterday: 'ഇന്നലെ (Yesterday)',
    rangeThisWeek: 'ഈ ആഴ്ച (This Week)',
    rangeThisMonth: 'ഈ മാസം (This Month)',
    rangeLastMonth: 'കഴിഞ്ഞ മാസം (Last Month)',
    rangeThisYear: 'ഈ വർഷം (This Year)',
    rangeCustom: 'കസ്റ്റം തീയതി',
    fromDate: 'തുടങ്ങുന്ന തീയതി',
    toDate: 'അവസാന തീയതി',
    foundEntries: 'കണ്ടെത്തിയവ:',
    entriesUnit: 'ഇടപാടുകൾ',
    incomeLabel: 'വരവ്:',
    expenseLabel: 'ചിലവ്:',
    noFilteredTx: 'തിരഞ്ഞെടുത്ത ഫിൽട്ടറിൽ ഇടപാടുകൾ ഒന്നും കണ്ടെത്തിയില്ല',

    // Reports View - 1-Click Cards
    reportsTitle: 'റിപ്പോർട്ടുകളും ഡൗൺലോഡുകളും',
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
    periodSelection: 'പീരിയഡ് തിരഞ്ഞെടുക്കുക',
    btnDownloadPDF: '📄 PDF സ്റ്റേറ്റ്‌മെന്റ് ഡൗൺലോഡ്',
    btnDownloadExcel: '📊 എക്സൽ (Excel / CSV) ഡൗൺലോഡ്',
    btnPrintStatement: '🖨️ പ്രിന്റ് ചെയ്യുക',
    tableThCategory: 'വിഭാഗം (CATEGORY)',
    tableThTxCount: 'ഇടപാടുകൾ (TX COUNT)',
    tableThAmount: 'തുക (AMOUNT)',
    tableThPercentage: 'ശതമാനം (PERCENTAGE)',

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

    // WhatsApp Automated Gateway
    waGatewayTitle: 'ഓട്ടോമേറ്റഡ് WhatsApp API ഗേറ്റ്‌വേ (Automated Dispatch)',
    waGatewaySub: 'WhatsApp തുറക്കാതെ തന്നെ ഓട്ടോമാറ്റിക് ആയി ബാക്ക്ഗ്രൗണ്ടിൽ മെസ്സേജുകൾ അയക്കാൻ സാധിക്കുന്നു',
    waGatewayModeLabel: 'ഡെലിവറി മോഡ് (Gateway Mode)',
    waModeDirect: '⚡ ഓട്ടോമാറ്റിക് ബാക്ക്ഗ്രൗണ്ട് API (തുറക്കാതെ സ്വയം അയക്കുക)',
    waModeCallmebot: '🤖 CallMeBot Free API (സൗജന്യ വാട്സാപ്പ് API)',
    waModeWebhook: '🔗 Custom Webhook / Server (Zapier, Make, n8n, Local)',
    waDefaultLangLabel: 'സ്ഥിരം രസീത് ഭാഷ (Default WhatsApp Language)',
    waLangApp: 'ആപ്പിന്റെ ഭാഷ അനുസരിച്ച് (Follow App Language)',
    waLangMl: 'എപ്പോഴും മലയാളത്തിൽ (Always Malayalam)',
    waLangEn: 'എപ്പോഴും English-ൽ (Always English)',
    waApiKeyLabel: 'API Key / Token',
    waWebhookUrlLabel: 'Webhook URL / Endpoint',
    waPhoneIdLabel: 'Phone Number ID / Instance (Optional)',
    btnSaveGateway: 'ഗേറ്റ്‌വേ വിവരങ്ങൾ സേവ് ചെയ്യുക',
    btnTestWaSend: 'ടെസ്റ്റ് മെസ്സേജ് അയക്കുക',

    // Backup & Security
    dataBackup: 'ഡാറ്റാ ബാക്കപ്പ്',
    dataBackupSub: 'കണക്കുകൾ ബാക്കപ്പ് എടുക്കാനും തിരിച്ചെടുക്കാനും',
    btnDownloadBackupJSON: '📥 ഡൗൺലോഡ് ബാക്കപ്പ് (JSON)',
    btnRestoreJSON: '📤 ബാക്കപ്പ് റീസ്റ്റോർ ചെയ്യുക',
    appSecurity: 'ആപ്പ് സെക്യൂരിറ്റി',
    appSecuritySub: '4-അക്ക സുരക്ഷാ PIN ലോക്ക്',
    pinStatusActive: 'PIN സുരക്ഷ സജീവമാണ്',
    pinStatusInactive: 'PIN സുരക്ഷ ഓഫാണ്',
    btnChangePin: 'PIN മാറ്റുക',
    btnSetPin: 'PIN സെറ്റ് ചെയ്യുക',
    btnClearAll: '⚠️ എല്ലാ ഇടപാടുകളും മായ്ക്കുക',

    // Modals
    modalAddTitle: 'പുതിയ ഇടപാട് രേഖപ്പെടുത്തുക',
    modalEditTitle: 'ഇടപാട് തിരുത്തുക',
    typeExpense: 'ചിലവ് (Expense)',
    typeIncome: 'വരവ് (Income)',
    amountLabel: 'തുക (₹ Amount)',
    categoryLabel: 'വിഭാഗം / കാറ്റഗറി (Type or Select Category)',
    btnQuickAddCat: '+ പുതിയ കാറ്റഗറി',
    categoryPlaceholder: 'കാറ്റഗറി ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ ലിസ്റ്റിൽ നിന്ന് തിരഞ്ഞെടുക്കുക...',
    dateLabel: 'തീയതി (Date)',
    partyLabelExpense: 'ആർക്ക് നൽകി (Paid To)',
    partyLabelIncome: 'ആരിൽ നിന്ന് ലഭിച്ചു (Received From)',
    partyPlaceholder: 'വ്യക്തി അല്ലെങ്കിൽ സ്ഥാപനം',
    phoneLabel: 'WhatsApp നമ്പർ (Mobile No)',
    sendWhatsappCheckbox: 'സേവ് ചെയ്യുമ്പോൾ ഓട്ടോമാറ്റിക് ആയി വാട്സാപ്പിലേക്ക് അയക്കുക (Auto-send WhatsApp)',
    waMsgLangLabel: 'WhatsApp രസീത് ഭാഷ:',
    billNoLabel: 'ബിൽ / ഇൻവോയ്സ് നമ്പർ (Bill / Invoice #)',
    notesLabel: 'കുറിപ്പുകൾ / വിവരണം (Notes)',
    attachmentLabel: 'ബിൽ / രസീത് ഫോട്ടോ (Attachment)',
    btnTakePhoto: 'ഫോട്ടോ എടുക്കുക / അപ്‌ലോഡ് ചെയ്യുക',
    photoAttached: 'ഫോട്ടോ അറ്റാച്ച് ചെയ്തു',
    btnCancel: 'റദ്ദാക്കുക',
    btnSave: 'സേവ് ചെയ്യുക',

    // Custom Category Modal
    addCategoryTitle: 'പുതിയ കാറ്റഗറി ചേർക്കുക',
    categoryTypeLabel: 'കാറ്റഗറിയുടെ തരം',
    nameMlLabel: 'മലയാളം പേര്',
    nameEnLabel: 'English പേര്',
    colorLabel: 'നിറം (Color)',
    colorSub: 'തിരിച്ചറിയാനുള്ള കളർ',
    btnAdd: 'ചേർക്കുക',

    // PIN Modal
    enterPinTitle: 'സുരക്ഷാ PIN നൽകുക',
    enterPinSub: 'തുടരാൻ 4-അക്ക കോഡ് അടിക്കുക',
    wrongPin: 'നൽകിയ PIN തെറ്റാണ്!',

    // WhatsApp Receipt Dispatcher Modal
    waModalTitle: 'വാട്സാപ്പ് രസീത് അയക്കുക',
    waModalSub: 'ഔദ്യോഗിക ക്യാഷ് രസീത് വൗച്ചർ നേരിട്ട് വാട്സാപ്പിലേക്ക് അയക്കാം',
    waRecipientParty: 'സ്വീകർത്താവ് (Party Name)',
    waRecipientPhone: 'WhatsApp നമ്പർ (10-digit number)',
    waSelectLang: 'സന്ദേശത്തിന്റെ ഭാഷ (Message Language):',
    waPreviewTitle: 'മെസ്സേജ് പ്രിവ്യൂ (Message Preview):',
    btnSendAutoWa: '⚡ ബാക്ക്ഗ്രൗണ്ട് API വഴി അയക്കുക (CallMeBot / Webhook)',
    btnOpenManualWa: '🚀 വാട്സാപ്പിൽ അയക്കുക (Send WhatsApp Message)',

    // Contacts & WhatsApp Directory
    contactsTitle: 'സേവ് ചെയ്ത കോൺടാക്റ്റുകൾ & വാട്സാപ്പ് നമ്പറുകൾ',
    contactsSub: 'ഇടപാടുകാരുടെയും ജീവനക്കാരുടെയും പേരുകളും വാട്സാപ്പ് നമ്പറുകളും ഇവിടെ സൂക്ഷിക്കാം',
    btnAddContact: '+ പുതിയ കോൺടാക്റ്റ്',
    searchContactPlaceholder: 'പേര് അല്ലെങ്കിൽ ഫോൺ നമ്പർ തിരയുക...',
    noContactsFound: 'കോൺടാക്റ്റുകൾ ഒന്നും ചേർത്തിട്ടില്ല. മുകളിലെ ബട്ടൺ വഴി പുതിയത് ചേർക്കാം.',
    contactModalTitle: 'പുതിയ കോൺടാക്റ്റ് ചേർക്കുക',
    contactEditModalTitle: 'കോൺടാക്റ്റ് വിവരങ്ങൾ തിരുത്തുക',
    contactNameLabel: 'പേര് (Person / Company Name)',
    contactPhoneLabel: 'WhatsApp നമ്പർ (10 അക്ക മൊബൈൽ നമ്പർ)',
    contactTypeLabel: 'വിഭാഗം (Role / Category)',
    typeClient: 'ക്ലയന്റ് / കസ്റ്റമർ (Client)',
    typeVendor: 'വെണ്ടർ / സപ്ലയർ (Vendor)',
    typeStaff: 'സ്റ്റാഫ് / ജീവനക്കാർ (Staff)',
    typeOther: 'മറ്റുള്ളവർ (Other)',
    saveToContactsLabel: 'ഈ വ്യക്തിയെ കോൺടാക്റ്റ് ലിസ്റ്റിലേക്ക് സേവ് ചെയ്യുക',
    contactSaved: 'കോൺടാക്റ്റ് വിജയകരമായി സേവ് ചെയ്തു!',
    contactUpdated: 'കോൺടാക്റ്റ് വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു!',
    contactDeleted: 'കോൺടാക്റ്റ് ഒഴിവാക്കി!',
    confirmDeleteContact: 'ഈ കോൺടാക്റ്റ് ലിസ്റ്റിൽ നിന്ന് ഒഴിവാക്കണമെന്ന് ഉറപ്പാണോ?',
    btnSendWhatsApp: '🚀 വാട്സാപ്പിൽ അയക്കുക',
    waOpenSuccess: 'WhatsApp തുറക്കുന്നു... സന്ദേശം അയക്കാൻ തയ്യാറാണ്!',
    moneyReceived: 'Money Received',
    moneyPaid: 'Money Paid',
    moneyReceivedMl: 'പണം ലഭിച്ചു (Money Received)',
    moneyPaidMl: 'പണം നൽകി (Money Paid)',
    transactionConfirmation: 'TRANSACTION CONFIRMATION',

    // Toasts & Messages
    savedSuccess: 'ഇടപാട് വിജയകരമായി സേവ് ചെയ്തു!',
    updatedSuccess: 'ഇടപാട് അപ്ഡേറ്റ് ചെയ്തു!',
    deletedSuccess: 'ഇടപാട് മായ്ച്ചു!',
    categoryAdded: 'പുതിയ കാറ്റഗറി ചേർത്തു!',
    categoryRemoved: 'കാറ്റഗറി ഒഴിവാക്കി',
    profileSaved: 'ഓഫീസ് പ്രൊഫൈൽ സേവ് ചെയ്തു!',
    backupDownloaded: 'ബാക്കപ്പ് ഫയൽ ഡൗൺലോഡ് ആയി!',
    restoreSuccess: 'ഇടപാടുകൾ വിജയകരമായി റീസ്റ്റോർ ചെയ്തു!',
    pinUnlocked: 'അൺലോക്ക് ചെയ്തു!',
    pinChanged: 'PIN വിജയകരമായി സേവ് ചെയ്തു!',
    pinDisabled: 'PIN സുരക്ഷ ഓഫാക്കി',
    pinChangeCancelled: 'PIN മാറ്റം റദ്ദാക്കി',
    allCleared: 'എല്ലാ വിവരങ്ങളും മായ്ച്ചു.',
    confirmDelete: 'ഈ ഇടപാട് ഡിലീറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?',
    confirmClearAll: 'ശ്രദ്ധിക്കുക: എല്ലാ വരവ് ചിലവ് ഇടപാടുകളും പൂർണ്ണമായും മായ്ക്കപ്പെടും. തുടരണമോ?',
    noTxsInPeriod: 'ഈ പീരിയഡിൽ ഇടപാടുകൾ ലഭ്യമല്ല!',
    waSentAutoSuccess: '✅ വാട്സാപ്പ് രസീത് ഓട്ടോമാറ്റിക് ആയി അയച്ചു!',
    waOpening: 'WhatsApp ഓപ്പൺ ചെയ്യുന്നു...',
    waGatewaySaved: 'WhatsApp ഗേറ്റ്‌വേ വിവരങ്ങൾ സേവ് ചെയ്തു!',
    waMissingPhone: 'ദയവായി സാധുവായ ഒരു 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.',
    invalidAmount: 'സാധുവായ ഒരു തുക നൽകുക.',
    imageOnlyAlert: 'ഇമേജ് ഫയലുകൾ മാത്രം അപ്‌ലോഡ് ചെയ്യുക.'
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
    pinLockTooltip: 'PIN Security Lock',

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
    offlineSafe: '100% Offline Safe',
    indexedDbSafe: 'IndexedDB Safe',
    incomeCountLabel: 'Income Entries:',
    expenseCountLabel: 'Expense Entries:',
    totalTxUnit: 'Total Entries',
    activePeriodLabelDaily: "Today's Ledger",
    activePeriodLabelWeekly: "This Week's Ledger",
    activePeriodLabelMonthly: "This Month's Ledger",
    activePeriodLabelYearly: "This Year's Ledger",
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
    navyTabAll: 'All',
    navyTabExpense: 'Expense',
    navyTabIncome: 'Income',
    invoiceDetails: 'Invoice / Voucher Details',
    verified: 'Verified',
    amountCol: 'AMOUNT',
    categoryCol: 'CATEGORY',
    dateCol: 'DATE',
    partyDetailsLabel: 'Paid To / Received From:',
    receivedIncomeDefault: 'Received Income',
    officeExpenseDefault: 'Office Expense',
    notesPrefix: 'Notes:',
    noNotes: 'No remarks provided',
    totalBalanceLabel: 'Total Balance',
    btnWhatsapp: 'WhatsApp',
    btnPrintVoucher: 'Voucher PDF',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    addPhonePrompt: '+ Add Phone',
    noTxSelected: 'No transactions found in this category',
    selectTxPlaceholder: 'Select a transaction',

    // Charts
    financialFlow: 'Financial Flow',
    trendOverview: 'Trend Overview',
    categoryBreakdown: 'Category Breakdown',
    donutExpensesLabel: 'Expenses',
    othersLabel: 'Others',

    // Transactions Full View
    searchLedgerPlaceholder: 'Search party, category, bill, notes...',
    filterAllTypes: 'All Types',
    filterIncomeOnly: 'Income Only',
    filterExpenseOnly: 'Expense Only',
    filterAllCategories: 'All Categories',
    rangeAllTime: 'All Time',
    rangeToday: 'Today',
    rangeYesterday: 'Yesterday',
    rangeThisWeek: 'This Week',
    rangeThisMonth: 'This Month',
    rangeLastMonth: 'Last Month',
    rangeThisYear: 'This Year',
    rangeCustom: 'Custom Date',
    fromDate: 'From Date',
    toDate: 'To Date',
    foundEntries: 'Found:',
    entriesUnit: 'entries',
    incomeLabel: 'Income:',
    expenseLabel: 'Expense:',
    noFilteredTx: 'No transactions found matching filter',

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
    periodSelection: 'Period Selection',
    btnDownloadPDF: '📄 Download PDF Statement',
    btnDownloadExcel: '📊 Download Excel (CSV)',
    btnPrintStatement: '🖨️ Print Statement',
    tableThCategory: 'CATEGORY',
    tableThTxCount: 'TRANSACTIONS',
    tableThAmount: 'AMOUNT',
    tableThPercentage: 'PERCENTAGE',

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

    // WhatsApp Automated Gateway
    waGatewayTitle: 'Automated WhatsApp API Gateway',
    waGatewaySub: 'Send messages automatically in the background without opening the WhatsApp web/app',
    waGatewayModeLabel: 'Gateway Delivery Mode',
    waModeDirect: '⚡ Automated Background API (Silent delivery)',
    waModeCallmebot: '🤖 CallMeBot Free WhatsApp API',
    waModeWebhook: '🔗 Custom Webhook / Server (Zapier, Make, n8n, Local)',
    waDefaultLangLabel: 'Default WhatsApp Receipt Language',
    waLangApp: 'Same as App Language',
    waLangMl: 'Always Malayalam',
    waLangEn: 'Always English',
    waApiKeyLabel: 'API Key / Token',
    waWebhookUrlLabel: 'Webhook URL / Endpoint',
    waPhoneIdLabel: 'Phone Number ID / Instance (Optional)',
    btnSaveGateway: 'Save Gateway Settings',
    btnTestWaSend: 'Send Test WhatsApp',

    // Backup & Security
    dataBackup: 'Data Backup',
    dataBackupSub: 'Backup and restore financial records',
    btnDownloadBackupJSON: '📥 Download Backup (JSON)',
    btnRestoreJSON: '📤 Restore Backup File',
    appSecurity: 'App Security',
    appSecuritySub: '4-digit security PIN lock',
    pinStatusActive: 'PIN Security is Active',
    pinStatusInactive: 'PIN Security is Disabled',
    btnChangePin: 'Change PIN',
    btnSetPin: 'Set PIN',
    btnClearAll: '⚠️ Clear All Transactions',

    // Modals
    modalAddTitle: 'Record New Transaction',
    modalEditTitle: 'Edit Transaction',
    typeExpense: 'Expense',
    typeIncome: 'Income',
    amountLabel: 'Amount (₹)',
    categoryLabel: 'Category (Type or Select)',
    btnQuickAddCat: '+ New Category',
    categoryPlaceholder: 'Type category or pick from list...',
    dateLabel: 'Date',
    partyLabelExpense: 'Paid To',
    partyLabelIncome: 'Received From',
    partyPlaceholder: 'Person or Company Name',
    phoneLabel: 'WhatsApp Mobile Number',
    sendWhatsappCheckbox: 'Auto-send WhatsApp receipt on save',
    waMsgLangLabel: 'WhatsApp Language:',
    billNoLabel: 'Bill / Invoice # (Optional)',
    notesLabel: 'Notes / Description (Optional)',
    attachmentLabel: 'Bill / Receipt Photo (Optional)',
    btnTakePhoto: 'Take / Upload Photo',
    photoAttached: 'Photo Attached',
    btnCancel: 'Cancel',
    btnSave: 'Save Entry',

    // Custom Category Modal
    addCategoryTitle: 'Add New Category',
    categoryTypeLabel: 'Category Type',
    nameMlLabel: 'Malayalam Name',
    nameEnLabel: 'English Name',
    colorLabel: 'Color',
    colorSub: 'Identification Color',
    btnAdd: 'Add Category',

    // PIN Modal
    enterPinTitle: 'Enter Security PIN',
    enterPinSub: 'Enter 4-digit code to continue',
    wrongPin: 'Incorrect PIN entered!',

    // WhatsApp Receipt Dispatcher Modal
    waModalTitle: 'Send WhatsApp Receipt',
    waModalSub: 'Send official cash voucher directly to WhatsApp',
    waRecipientParty: 'Recipient Name',
    waRecipientPhone: 'WhatsApp Mobile Number (10 digits)',
    waSelectLang: 'Message Language:',
    waPreviewTitle: 'Message Preview:',
    btnSendAutoWa: '⚡ Background API Dispatch (CallMeBot / Webhook)',
    btnOpenManualWa: '🚀 Send via WhatsApp (Direct)',

    // Contacts & WhatsApp Directory
    contactsTitle: 'Saved Contacts & WhatsApp Directory',
    contactsSub: 'Save parties, clients, vendors, and staff WhatsApp numbers for instant auto-fill and messaging',
    btnAddContact: '+ Add Contact',
    searchContactPlaceholder: 'Search contact name or phone...',
    noContactsFound: 'No contacts saved yet. Click + Add Contact to create one.',
    contactModalTitle: 'Add New Contact',
    contactEditModalTitle: 'Edit Contact Details',
    contactNameLabel: 'Person / Company Name',
    contactPhoneLabel: 'WhatsApp Mobile Number (10 digits)',
    contactTypeLabel: 'Role / Category',
    typeClient: 'Client / Customer',
    typeVendor: 'Vendor / Supplier',
    typeStaff: 'Staff Member',
    typeOther: 'Other',
    saveToContactsLabel: 'Save this party to Contacts Directory',
    contactSaved: 'Contact saved successfully!',
    contactUpdated: 'Contact updated successfully!',
    contactDeleted: 'Contact deleted!',
    confirmDeleteContact: 'Are you sure you want to delete this contact?',
    btnSendWhatsApp: '🚀 Send via WhatsApp',
    waOpenSuccess: 'Opening WhatsApp... Message ready to send!',
    moneyReceived: 'Money Received',
    moneyPaid: 'Money Paid',
    moneyReceivedMl: 'Money Received',
    moneyPaidMl: 'Money Paid',
    transactionConfirmation: 'TRANSACTION CONFIRMATION',

    // Toasts & Messages
    savedSuccess: 'Transaction saved successfully!',
    updatedSuccess: 'Transaction updated successfully!',
    deletedSuccess: 'Transaction deleted successfully!',
    categoryAdded: 'New category added successfully!',
    categoryRemoved: 'Category removed',
    profileSaved: 'Office profile saved successfully!',
    backupDownloaded: 'Backup download completed!',
    restoreSuccess: 'Transactions restored successfully!',
    pinUnlocked: 'Unlocked successfully!',
    pinChanged: 'PIN saved successfully!',
    pinDisabled: 'PIN security disabled',
    pinChangeCancelled: 'PIN change cancelled',
    allCleared: 'All records cleared.',
    confirmDelete: 'Are you sure you want to delete this transaction?',
    confirmClearAll: 'Warning: All transactions will be permanently deleted. Continue?',
    noTxsInPeriod: 'No transactions found in this period!',
    waSentAutoSuccess: '✅ WhatsApp receipt sent automatically!',
    waOpening: 'Opening WhatsApp...',
    waGatewaySaved: 'WhatsApp gateway settings saved!',
    waMissingPhone: 'Please enter a valid 10-digit mobile number.',
    invalidAmount: 'Please enter a valid amount.',
    imageOnlyAlert: 'Please upload image files only.'
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

    // Set html lang attribute
    document.documentElement.lang = this.currentLang;
  }

  getCategoryName(cat) {
    if (!cat) return '';
    if (this.currentLang === 'ml') {
      return cat.nameMl || cat.nameEn || '';
    } else {
      return cat.nameEn || cat.nameMl || '';
    }
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
