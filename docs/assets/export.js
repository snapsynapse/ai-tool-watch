/**
 * Export — CSV and JSON download for implementations page (filtered) and compare page.
 */
(function () {
  'use strict';

  var today = new Date().toISOString().split('T')[0];

  function download(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function isComparePage() {
    return !!document.getElementById('comparisonResult');
  }

  // --- Implementations page export ---

  function getVisibleFeatures() {
    var cards = document.querySelectorAll('.feature-card');
    var features = [];
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.style.display === 'none' || card.closest('.platform-section[style*="display: none"]')) continue;
      var name = (card.querySelector('.feature-name') || {}).textContent || '';
      var platform = card.getAttribute('data-platform') || '';
      var category = card.getAttribute('data-category') || '';
      var gating = card.getAttribute('data-gating') || '';
      var status = card.getAttribute('data-status') || '';
      var launched = card.getAttribute('data-launched') || '';
      var verified = card.getAttribute('data-verified') || '';
      features.push({
        name: name.trim(),
        product: platform,
        category: category,
        gating: gating,
        status: status,
        launched: launched,
        verified: verified
      });
    }
    return features;
  }

  function featuresToCSV(features) {
    var headers = ['Name', 'Product', 'Category', 'Access', 'Status', 'Launched', 'Verified'];
    var rows = [headers.join(',')];
    features.forEach(function (f) {
      rows.push([f.name, f.product, f.category, f.gating, f.status, f.launched, f.verified]
        .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; })
        .join(','));
    });
    return rows.join('\n');
  }

  // --- Compare page export ---

  function getCompareData() {
    if (typeof window._compareData === 'function') return window._compareData();
    return null;
  }

  function compareToRows(data) {
    var rows = [];
    data.capabilities.forEach(function (cap) {
      var row = { capability: cap.name, group: cap.group || '' };
      data.selectedProducts.forEach(function (pid) {
        var impl = data.implMap[pid][cap.id];
        row[data.prodNames[pid] || pid] = impl ? impl.name + ' (' + (impl.gating || '') + ')' : '';
      });
      rows.push(row);
    });
    return rows;
  }

  function compareToCSV(data) {
    var rows = compareToRows(data);
    if (!rows.length) return '';
    var headers = Object.keys(rows[0]);
    var lines = [headers.map(function (h) { return '"' + h.replace(/"/g, '""') + '"'; }).join(',')];
    rows.forEach(function (row) {
      lines.push(headers.map(function (h) { return '"' + String(row[h] || '').replace(/"/g, '""') + '"'; }).join(','));
    });
    return lines.join('\n');
  }

  // --- Public API ---

  window.exportCSV = function () {
    if (isComparePage()) {
      var data = getCompareData();
      if (!data) return;
      download(compareToCSV(data), 'airef-compare-' + today + '.csv', 'text/csv');
    } else {
      var features = getVisibleFeatures();
      if (!features.length) return;
      download(featuresToCSV(features), 'airef-features-' + today + '.csv', 'text/csv');
    }
  };

  window.exportJSON = function () {
    if (isComparePage()) {
      var data = getCompareData();
      if (!data) return;
      var output = { exported: new Date().toISOString(), products: data.selectedProducts.map(function (pid) { return data.prodNames[pid] || pid; }), rows: compareToRows(data) };
      download(JSON.stringify(output, null, 2), 'airef-compare-' + today + '.json', 'application/json');
    } else {
      var features = getVisibleFeatures();
      if (!features.length) return;
      var output = { exported: new Date().toISOString(), features: features };
      download(JSON.stringify(output, null, 2), 'airef-features-' + today + '.json', 'application/json');
    }
  };

  // Add export buttons to implementations page if not already present
  if (!isComparePage()) {
    var filterBar = document.querySelector('.filters');
    if (filterBar && !document.getElementById('implExportBtns')) {
      var div = document.createElement('div');
      div.id = 'implExportBtns';
      div.className = 'export-actions';
      div.innerHTML = '<button onclick="exportCSV()" class="export-btn">Export CSV</button> <button onclick="exportJSON()" class="export-btn">Export JSON</button>';
      filterBar.parentNode.insertBefore(div, filterBar.nextSibling);
    }
  }
})();
