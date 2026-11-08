/**
 * reports.js - PDF Statement & Voucher Generation with Offline Fallback & CSV Export
 */

class ReportsEngine {
  formatCurrency(num) {
    return '₹' + Number(num || 0).toLocaleString('en-IN', {
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

  // --- 1. Official Financial Statement PDF ---
  async downloadStatementPDF(transactions, categories, profile, rangeTitle = 'All Time') {
    // If jsPDF is available
    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        const officeName = (profile && profile.name) ? profile.name : 'OFFICE FINANCE';
        const officeTagline = (profile && profile.tagline) ? profile.tagline : 'Accounts & Finance Statement';
        const officeAddress = (profile && profile.address) ? profile.address : '';
        const officeContact = (profile && profile.phone) ? `Ph: ${profile.phone}` : '';

        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach(t => {
          const amt = parseFloat(t.amount) || 0;
          if (t.type === 'income') totalIncome += amt;
          else if (t.type === 'expense') totalExpense += amt;
        });
        const netBalance = totalIncome - totalExpense;

        // Header Background
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 38, 'F');
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 38, pageWidth, 2.5, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(officeName.toUpperCase(), margin, 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        doc.text(officeTagline, margin, 22);

        const contactStr = [officeAddress, officeContact].filter(Boolean).join(' | ');
        if (contactStr) doc.text(contactStr, margin, 28);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(52, 211, 153);
        doc.text('FINANCIAL STATEMENT', pageWidth - margin, 16, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(226, 232, 240);
        doc.text(`Period: ${rangeTitle}`, pageWidth - margin, 23, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 29, { align: 'right' });

        // Metric Cards
        const cardY = 46;
        const cardH = 20;
        const cardW = (pageWidth - (margin * 2) - 8) / 3;

        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(16, 185, 129);
        doc.roundedRect(margin, cardY, cardW, cardH, 3, 3, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('TOTAL INCOME', margin + 6, cardY + 6);
        doc.setFontSize(11);
        doc.text(this.formatCurrency(totalIncome), margin + 6, cardY + 14);

        const expX = margin + cardW + 4;
        doc.setFillColor(255, 241, 242);
        doc.setDrawColor(244, 63, 94);
        doc.roundedRect(expX, cardY, cardW, cardH, 3, 3, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72);
        doc.text('TOTAL EXPENSE', expX + 6, cardY + 6);
        doc.setFontSize(11);
        doc.text(this.formatCurrency(totalExpense), expX + 6, cardY + 14);

        const balX = expX + cardW + 4;
        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(99, 102, 241);
        doc.roundedRect(balX, cardY, cardW, cardH, 3, 3, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('NET BALANCE', balX + 6, cardY + 6);
        doc.setFontSize(11);
        doc.text(this.formatCurrency(netBalance), balX + 6, cardY + 14);

        const catMap = {};
        (categories || []).forEach(c => { catMap[c.id] = c; });

        const rows = transactions.map((t, idx) => {
          const cat = catMap[t.category];
          const cName = cat ? (cat.nameEn || cat.nameMl || t.category) : (t.category || '-');
          return [
            idx + 1,
            this.formatDate(t.date),
            t.type === 'income' ? 'INCOME' : 'EXPENSE',
            cName,
            [t.party, t.billNo ? `Bill: ${t.billNo}` : '', t.notes].filter(Boolean).join('\n'),
            (t.type === 'income' ? '+ ' : '- ') + this.formatCurrency(t.amount)
          ];
        });

        if (doc.autoTable) {
          doc.autoTable({
            startY: cardY + cardH + 8,
            head: [['#', 'Date', 'Type', 'Category', 'Party & Details', 'Amount']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
            margin: { left: margin, right: margin, bottom: 20 },
            styles: { fontSize: 8, cellPadding: 2.8, overflow: 'linebreak' }
          });
        }

        const sanitizedPeriod = (rangeTitle || 'Statement').replace(/[\s\/\(\)]+/g, '_');
        doc.save(`Office_Finance_${sanitizedPeriod}_${new Date().toISOString().slice(0, 10)}.pdf`);
        return;
      } catch (e) {
        console.warn('jsPDF error, falling back to styled print window:', e);
      }
    }

    // High Quality Offline Print Statement Fallback
    this.openPrintableStatement(transactions, categories, profile, rangeTitle);
  }

  // --- 2. Offline Beautiful Printable Statement ---
  openPrintableStatement(transactions, categories, profile, rangeTitle) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') totalIncome += amt;
      else if (t.type === 'expense') totalExpense += amt;
    });
    const netBal = totalIncome - totalExpense;

    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c; });

    const rowsHTML = transactions.map((t, i) => {
      const cat = catMap[t.category];
      const catName = cat ? (cat.nameMl || cat.nameEn) : t.category;
      const isInc = t.type === 'income';
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${this.formatDate(t.date)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${isInc ? '#059669' : '#e11d48'};">
            ${isInc ? 'വരവ് (INCOME)' : 'ചിലവ് (EXPENSE)'}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${catName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
            <strong>${t.party || '-'}</strong>
            ${t.billNo ? `<br><small style="color:#64748b;">Bill: ${t.billNo}</small>` : ''}
            ${t.notes ? `<br><small style="color:#64748b;">${t.notes}</small>` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${isInc ? '#059669' : '#e11d48'};">
            ${isInc ? '+' : '-'} ${this.formatCurrency(t.amount)}
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Statement - ${profile.name || 'Office Finance'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px solid #10b981; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .cards { display: flex; gap: 14px; margin-bottom: 24px; }
          .card { flex: 1; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; }
          .c-label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .c-val { font-size: 20px; font-weight: bold; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px; }
          th { background: #0f172a; color: #ffffff; padding: 9px; text-align: left; font-size: 12px; }
          .footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; color: #64748b; }
          .sign-line { border-top: 1px solid #94a3b8; width: 180px; text-align: center; padding-top: 6px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ പ്രിന്റ് ചെയ്യുക / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="title">${(profile.name || 'OFFICE FINANCE').toUpperCase()}</div>
            <div class="sub">${profile.tagline || 'Accounts & Finance Division'}</div>
            <div class="sub">${profile.address || ''} ${profile.phone ? ' | Ph: ' + profile.phone : ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: bold; color: #059669;">FINANCIAL STATEMENT</div>
            <div class="sub">കാലയളവ്: ${rangeTitle}</div>
            <div class="sub">തീയതി: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <div class="cards">
          <div class="card" style="border-left: 4px solid #10b981;">
            <div class="c-label">ആകെ വരവ് (Total Income)</div>
            <div class="c-val" style="color: #059669;">${this.formatCurrency(totalIncome)}</div>
          </div>
          <div class="card" style="border-left: 4px solid #f43f5e;">
            <div class="c-label">ആകെ ചിലവ് (Total Expense)</div>
            <div class="c-val" style="color: #e11d48;">${this.formatCurrency(totalExpense)}</div>
          </div>
          <div class="card" style="border-left: 4px solid #6366f1;">
            <div class="c-label">മിച്ചം (Net Balance)</div>
            <div class="c-val" style="color: #4f46e5;">${this.formatCurrency(netBal)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th style="width: 80px;">തീയതി</th>
              <th style="width: 90px;">തരം</th>
              <th style="width: 130px;">വിഭാഗം</th>
              <th>വിവരണം & വ്യക്തി</th>
              <th style="width: 110px; text-align: right;">തുക</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated by Office Finance System</div>
          <div class="sign-line">Authorized Sign & Seal</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // --- 3. Single Voucher PDF / Print ---
  async downloadVoucherPDF(tx, category, profile) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isIncome = tx.type === 'income';
    const accentColor = isIncome ? '#059669' : '#e11d48';
    const voucherTitle = isIncome ? 'CASH RECEIPT VOUCHER (വരവ് രസീത്)' : 'PAYMENT VOUCHER (ചിലവ് വൗച്ചർ)';
    const catName = category ? (category.nameMl || category.nameEn) : tx.category;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher #${tx.billNo || tx.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; margin: 0; }
          .box { max-width: 600px; margin: 0 auto; border: 2px solid ${accentColor}; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
          .org { font-size: 20px; font-weight: bold; }
          .v-title { display: inline-block; background: ${accentColor}; color: white; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .label { font-weight: bold; color: #64748b; }
          .amt-box { background: #f8fafc; border: 1px dashed ${accentColor}; border-radius: 8px; padding: 14px; text-align: center; margin: 20px 0; }
          .amt { font-size: 24px; font-weight: 900; color: ${accentColor}; }
          .signs { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; color: #64748b; }
          .s-line { border-top: 1px solid #94a3b8; width: 120px; text-align: center; padding-top: 4px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="max-width: 600px; margin: 0 auto 16px auto; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: ${accentColor}; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ പ്രിന്റ് ചെയ്യുക / Save as PDF
          </button>
        </div>

        <div class="box">
          <div class="header">
            <div class="org">${profile.name || 'OFFICE FINANCE'}</div>
            <div style="font-size: 12px; color: #64748b;">${profile.address || ''} ${profile.phone ? ' | ' + profile.phone : ''}</div>
            <div class="v-title">${voucherTitle}</div>
          </div>

          <div class="row">
            <div><span class="label">വൗച്ചർ / ബിൽ നമ്പർ:</span> #${tx.billNo || tx.id}</div>
            <div><span class="label">തീയതി:</span> ${this.formatDate(tx.date)}</div>
          </div>

          <div class="row">
            <div><span class="label">${isIncome ? 'ലഭിച്ചത് (Received From):' : 'നൽകിയത് (Paid To):'}</span> <strong>${tx.party || '-'}</strong></div>
          </div>

          <div class="row">
            <div><span class="label">വിഭാഗം (Category):</span> ${catName}</div>
          </div>

          <div class="row">
            <div><span class="label">വിവരണം:</span> ${tx.notes || '-'}</div>
          </div>

          <div class="amt-box">
            <div style="font-size: 11px; color: #64748b; font-weight: bold;">തുക (TOTAL AMOUNT)</div>
            <div class="amt">${this.formatCurrency(tx.amount)}</div>
          </div>

          <div class="signs">
            <div class="s-line">തയ്യാറാക്കിയത്</div>
            <div class="s-line">പരിശോധിച്ചത്</div>
            <div class="s-line">കൈപ്പറ്റിയ ആളുടെ ഒപ്പ്</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // --- 4. Excel (CSV with UTF-8 BOM) Export ---
  exportToCSV(transactions, categories, profile, periodLabel = '') {
    const catMap = {};
    (categories || []).forEach(c => { catMap[c.id] = c; });

    const headers = ['ID', 'Date', 'Type', 'Category', 'Party / Name', 'Amount (INR)', 'Bill / Ref No', 'Description'];

    const rows = transactions.map(tx => {
      const cat = catMap[tx.category];
      const catName = cat ? (cat.nameMl || cat.nameEn) : (tx.category || '');
      return [
        tx.id,
        tx.date || '',
        tx.type === 'income' ? 'Income' : 'Expense',
        `"${(catName).replace(/"/g, '""')}"`,
        `"${(tx.party || '').replace(/"/g, '""')}"`,
        tx.amount,
        `"${(tx.billNo || '').replace(/"/g, '""')}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const sanitizedLabel = periodLabel ? `_${periodLabel.replace(/[\s\/\(\)]+/g, '_')}` : '';
    link.setAttribute('download', `Office_Finance${sanitizedLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

window.reportsEngine = new ReportsEngine();
