/**
 * charts.js - Pixel-Perfect Eduka-Themed Canvas Charts
 * Renders smooth curved area charts and donut charts with side legend matching reference image
 */

class FinanceCharts {
  constructor() {
    this.cachedTransactions = [];
    this.cachedCategories = [];
  }

  updateCharts(transactions, categories) {
    this.cachedTransactions = transactions || [];
    this.cachedCategories = categories || [];
    this.renderWaveFlowChart(this.cachedTransactions);
    this.renderDonutWithSideLegend(this.cachedTransactions, this.cachedCategories);
  }

  // --- 1. Wave Flow Area Chart (Matches top chart from reference image) ---
  renderWaveFlowChart(transactions) {
    const canvas = document.getElementById('monthlyTrendCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 360;
    const height = canvas.parentElement.clientHeight || 180;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Group last 6 points / months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const points = [];

    for (let i = 4; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      points.push({
        label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        mKey,
        val: 0
      });
    }

    transactions.forEach(tx => {
      if (!tx.date) return;
      const mKey = tx.date.slice(0, 7);
      const p = points.find(item => item.mKey === mKey);
      if (p) {
        p.val += parseFloat(tx.amount) || 0;
      }
    });

    let maxVal = 10000;
    points.forEach(p => { if (p.val > maxVal) maxVal = p.val; });
    maxVal = Math.ceil(maxVal * 1.2);

    ctx.clearRect(0, 0, width, height);

    const padLeft = 32;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 26;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Dashed horizontal grid lines (e.g. 50, 100, 150, 200)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const steps = 3;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= steps; i++) {
      const yVal = Math.round((maxVal / steps) * i);
      const y = padTop + chartH - (chartH * (i / steps));

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const label = yVal >= 1000 ? (yVal / 1000).toFixed(0) + 'k' : yVal;
      ctx.fillText(label, padLeft - 6, y + 3);
    }
    ctx.setLineDash([]); // Reset dash

    // Calculate curve coordinates
    const coords = points.map((p, i) => {
      const x = padLeft + (i * (chartW / (points.length - 1)));
      const ratio = Math.min(1, Math.max(0.1, p.val / maxVal));
      const y = padTop + chartH - (chartH * ratio);
      return { x, y, val: p.val, label: p.label };
    });

    // Draw Smooth Wave Area
    if (coords.length > 1) {
      // Area gradient matching image (Pink/Magenta Wave)
      const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
      grad.addColorStop(0, 'rgba(225, 29, 72, 0.25)');
      grad.addColorStop(1, 'rgba(225, 29, 72, 0.01)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(coords[0].x, padTop + chartH);
      ctx.lineTo(coords[0].x, coords[0].y);

      for (let i = 0; i < coords.length - 1; i++) {
        const cpX = (coords[i].x + coords[i + 1].x) / 2;
        ctx.bezierCurveTo(cpX, coords[i].y, cpX, coords[i + 1].y, coords[i + 1].x, coords[i + 1].y);
      }

      ctx.lineTo(coords[coords.length - 1].x, padTop + chartH);
      ctx.closePath();
      ctx.fill();

      // Stroke Line (Vibrant Rose/Magenta)
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);

      for (let i = 0; i < coords.length - 1; i++) {
        const cpX = (coords[i].x + coords[i + 1].x) / 2;
        ctx.bezierCurveTo(cpX, coords[i].y, cpX, coords[i + 1].y, coords[i + 1].x, coords[i + 1].y);
      }
      ctx.stroke();

      // Highlight active point
      const highlightIdx = Math.min(3, coords.length - 1);
      const hl = coords[highlightIdx];

      // Vertical guide line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hl.x, hl.y);
      ctx.lineTo(hl.x, padTop + chartH);
      ctx.stroke();

      // Outer halo dot
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(hl.x, hl.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hl.x, hl.y, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      // Dark pill tooltip
      const tooltipText = '₹' + (hl.val >= 1000 ? (hl.val / 1000).toFixed(1) + 'k' : hl.val);
      ctx.fillStyle = '#1e293b';
      this.drawPill(ctx, hl.x + 8, hl.y - 12, 46, 20, 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tooltipText, hl.x + 31, hl.y + 2);
    }

    // X Axis Labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8a94a6';
    ctx.font = '10px sans-serif';
    coords.forEach(c => {
      ctx.fillText(c.label, c.x, height - 6);
    });
  }

  // --- 2. Donut Chart with Right-Side Legend ---
  renderDonutWithSideLegend(transactions, categories) {
    const canvas = document.getElementById('categoryDonutCanvas');
    const legendContainer = document.getElementById('edukaLegendContainer');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 120;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    // Group expenses
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
      ctx.clearRect(0, 0, size, size);
      if (emptyMsg) emptyMsg.style.display = 'flex';
      if (legendContainer) legendContainer.innerHTML = '';
      return;
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
    }

    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c; });

    const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);
    const topCats = sortedCats.slice(0, 5);

    // Vibrant palette matching reference image:
    const palette = ['#e11d48', '#6366f1', '#0ea5e9', '#f59e0b', '#10b981'];
    const slices = [];

    topCats.forEach((cid, i) => {
      const cat = catMap[cid];
      slices.push({
        label: cat ? (window.i18n ? window.i18n.getCategoryName(cat) : cat.nameMl) : cid,
        amount: catTotals[cid],
        color: palette[i % palette.length],
        pct: totalExpense > 0 ? Math.round((catTotals[cid] / totalExpense) * 100) : 0
      });
    });

    if (sortedCats.length > 5) {
      const otherTotal = sortedCats.slice(5).reduce((s, cid) => s + catTotals[cid], 0);
      slices.push({
        label: (window.i18n ? window.i18n.t('othersLabel') : 'Others'),
        amount: otherTotal,
        color: '#94a3b8',
        pct: totalExpense > 0 ? Math.round((otherTotal / totalExpense) * 100) : 0
      });
    }

    ctx.clearRect(0, 0, size, size);

    // Draw Crisp Donut
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 4;
    const innerRadius = radius * 0.62;

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

      // Thin separation
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      currentAngle = nextAngle;
    });

    // Render Side Legend List
    if (legendContainer) {
      legendContainer.innerHTML = slices.map(s => `
        <div class="legend-item-row">
          <div class="legend-left">
            <span class="legend-dot" style="background: ${s.color};"></span>
            <span style="max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.label}</span>
          </div>
          <span class="legend-pct">${s.pct}%</span>
        </div>
      `).join('');
    }
  }

  drawPill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
}

window.financeCharts = new FinanceCharts();
window.chartsEngine = window.financeCharts;
