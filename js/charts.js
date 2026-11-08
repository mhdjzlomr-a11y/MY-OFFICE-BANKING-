/**
 * charts.js - Standalone Native Canvas Chart Engine
 * Completely self-contained: works 100% offline without external libraries
 */

class FinanceCharts {
  constructor() {
    this.cachedTransactions = [];
    this.cachedCategories = [];
  }

  isDarkTheme() {
    return document.documentElement.classList.contains('dark');
  }

  updateCharts(transactions, categories) {
    this.cachedTransactions = transactions || [];
    this.cachedCategories = categories || [];
    this.renderMonthlyTrend(this.cachedTransactions);
    this.renderCategoryBreakdown(this.cachedTransactions, this.cachedCategories);
  }

  // --- 1. Monthly Trend Bar Chart ---
  renderMonthlyTrend(transactions) {
    const canvas = document.getElementById('monthlyTrendCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 600;
    const height = canvas.parentElement.clientHeight || 240;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const isDark = this.isDarkTheme();
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.08)';

    // Group last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key: mKey,
        label: `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`,
        income: 0,
        expense: 0
      });
    }

    transactions.forEach(tx => {
      if (!tx.date) return;
      const mKey = tx.date.slice(0, 7);
      const m = months.find(item => item.key === mKey);
      if (m) {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.type === 'income') m.income += amt;
        else if (tx.type === 'expense') m.expense += amt;
      }
    });

    let maxVal = 5000;
    months.forEach(m => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });
    maxVal = Math.ceil(maxVal * 1.15); // Add headroom

    // Clear
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 15;
    const padTop = 30;
    const padBottom = 30;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw Grid & Y-Axis labels
    const steps = 4;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';

    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxVal / steps) * i);
      const y = padTop + chartH - (chartH * (i / steps));

      // Grid line
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Label
      const labelText = val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val;
      ctx.fillText('₹' + labelText, padLeft - 6, y + 3);
    }

    // Legend on top
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px sans-serif';

    // Income legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(padLeft, 10, 10, 10);
    ctx.fillStyle = textColor;
    ctx.fillText('വരവ് (Income)', padLeft + 14, 18);

    // Expense legend
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(padLeft + 120, 10, 10, 10);
    ctx.fillStyle = textColor;
    ctx.fillText('ചിലവ് (Expense)', padLeft + 134, 18);

    // Draw Bars
    const colWidth = chartW / months.length;
    const barWidth = Math.min(22, (colWidth - 16) / 2);

    months.forEach((m, idx) => {
      const colX = padLeft + (idx * colWidth);
      const centerX = colX + (colWidth / 2);

      // X-Axis Month Label
      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, centerX, height - 10);

      // Income Bar (Green)
      const incH = (m.income / maxVal) * chartH;
      const incY = padTop + chartH - incH;
      const incX = centerX - barWidth - 2;

      ctx.fillStyle = '#10b981';
      this.drawRoundedRect(ctx, incX, incY, barWidth, incH, 4);

      // Expense Bar (Rose)
      const expH = (m.expense / maxVal) * chartH;
      const expY = padTop + chartH - expH;
      const expX = centerX + 2;

      ctx.fillStyle = '#f43f5e';
      this.drawRoundedRect(ctx, expX, expY, barWidth, expH, 4);
    });
  }

  // --- 2. Category Breakdown Donut Chart ---
  renderCategoryBreakdown(transactions, categories) {
    const canvas = document.getElementById('categoryDonutCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 300;
    const height = canvas.parentElement.clientHeight || 240;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const isDark = this.isDarkTheme();
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';

    // Group only expenses
    const catTotals = {};
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const catId = tx.category || 'misc_exp';
        const amt = parseFloat(tx.amount) || 0;
        catTotals[catId] = (catTotals[catId] || 0) + amt;
        totalExpense += amt;
      }
    });

    const emptyMsg = document.getElementById('donutEmptyMessage');
    if (totalExpense === 0) {
      ctx.clearRect(0, 0, width, height);
      if (emptyMsg) emptyMsg.style.display = 'flex';
      return;
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
    }

    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c; });

    const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);
    const topCats = sortedCats.slice(0, 5);

    const palette = ['#f43f5e', '#ef4444', '#f97316', '#eab308', '#8b5cf6', '#64748b'];
    const slices = [];

    topCats.forEach((cid, i) => {
      const cat = catMap[cid];
      slices.push({
        label: cat ? (window.i18n ? window.i18n.getCategoryName(cat) : cat.nameMl) : cid,
        amount: catTotals[cid],
        color: cat && cat.color ? cat.color : palette[i % palette.length]
      });
    });

    if (sortedCats.length > 5) {
      const otherTotal = sortedCats.slice(5).reduce((s, cid) => s + catTotals[cid], 0);
      slices.push({
        label: 'Others (മറ്റുള്ളവ)',
        amount: otherTotal,
        color: '#94a3b8'
      });
    }

    ctx.clearRect(0, 0, width, height);

    // Draw Donut
    const centerX = width / 2;
    const centerY = (height / 2) - 10;
    const radius = Math.min(centerX, centerY) - 15;
    const innerRadius = radius * 0.65;

    let currentAngle = -0.5 * Math.PI;

    slices.forEach(slice => {
      const sliceAngle = (slice.amount / totalExpense) * (2 * Math.PI);
      const nextAngle = currentAngle + sliceAngle;

      ctx.fillStyle = slice.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, nextAngle);
      ctx.arc(centerX, centerY, innerRadius, nextAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = isDark ? '#151f32' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle = nextAngle;
    });

    // Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('₹' + Number(totalExpense).toLocaleString('en-IN'), centerX, centerY - 4);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('ആകെ ചിലവ്', centerX, centerY + 12);
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height <= 0) return;
    const r = Math.min(radius, height / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}

window.financeCharts = new FinanceCharts();
