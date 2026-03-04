// ===== CRYPTOCARD APP =====

// ===== ANALYTICS HELPERS =====
function trackEvent(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

// Track CTA / affiliate link clicks via event delegation
document.addEventListener('click', function(e) {
  var ctaBtn = e.target.closest('.detail-cta-btn');
  if (!ctaBtn) return;

  var href = ctaBtn.getAttribute('href') || '';
  var label = ctaBtn.textContent.trim().replace(/↗/g, '').trim();

  trackEvent('cta_click', {
    link_url: href,
    link_text: label,
    page_location: window.location.href
  });
});

// ===== RENDER CARDS =====
function renderCards(filter = 'all', sort = 'cashback') {
  const grid = document.getElementById('cardGrid');
  let filtered = [...cards];

  if (filter === 'debit') filtered = filtered.filter(c => c.type === 'debit' || c.type === 'dual');
  else if (filter === 'credit') filtered = filtered.filter(c => c.type === 'credit' || c.type === 'dual');
  
  else if (filter === 'free') filtered = filtered.filter(c => c.feeNum === 0);
  else if (filter === 'defi') filtered = filtered.filter(c => c.tags.includes('defi') || c.tags.includes('self-custody'));
  else if (filter === 'nokyc') filtered = filtered.filter(c => c.tags.includes('nokyc'));
  else if (filter === 'visa') filtered = filtered.filter(c => c.network === 'visa');
  else if (filter === 'mastercard') filtered = filtered.filter(c => c.network === 'mastercard');

  if (sort === 'cashback') filtered.sort((a, b) => b.cashbackNum - a.cashbackNum);
  else if (sort === 'fee') filtered.sort((a, b) => a.feeNum - b.feeNum);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Cap featured view to 12 best cards
  if (filter === 'all') filtered = filtered.slice(0, 12);

  grid.innerHTML = '';

  filtered.forEach((card, i) => {
      const typeClass = card.type === 'debit' ? 'badge-debit' : card.type === 'dual' ? 'badge-dual' : 'badge-credit';
      grid.innerHTML += `
        <div class="crypto-card fade-up" onclick="openModal(${cards.indexOf(card)})">
          <div class="card-color-bar">
            <span class="card-visual">${card.img ? `<img src="${card.img}" alt="${card.name}" onerror="this.parentElement.innerHTML='${card.emoji}'">` : card.emoji}</span>
            <span class="network-badge">${card.network}</span>
            <span class="card-type-badge ${typeClass}">${card.type}</span>
            <span class="card-cashback-pill">${card.cashback} cashback</span>
          </div>
          <div class="card-info">
            <div class="card-name">${card.name}</div>
            <div class="card-issuer">${card.issuer}</div>
            <div class="card-tags">
              ${card.highlights.filter(t => !t.toLowerCase().includes('global')).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
              ${card.tiers ? '<span class="tag" style="background:rgba(255,217,61,0.15);color:#bfa600;">' + card.tiers.length + ' tiers</span>' : ''}
            </div>
            <div class="card-meta">
              <div>
                <span class="card-fee ${card.feeNum === 0 ? 'free' : ''}">${card.fee}</span>
                <span class="card-regions"> · ${card.regions}</span>
              </div>
            </div>
          </div>
        </div>
      `;
  });
}

// ===== DETAIL PAGE =====

function openCardPage(index) {
  const card = cards[index];
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>

    <div class="detail-header">
      <div class="detail-emoji-box">${card.img ? `<img src="${card.img}" alt="${card.name}" onerror="this.parentElement.innerHTML='${card.emoji}'">` : card.emoji}</div>
      <div class="detail-title-area">
        <h1>${card.name}</h1>
        <div class="detail-issuer">${card.issuer}</div>
      </div>
    </div>

    ${(() => {
      const link = cardLinks[card.name];
      if (!link) return '';
      let html = '<div class="detail-cta-row">';
      html += '<a href="' + link.url + '" target="_blank" class="detail-cta-btn">' + link.label + (link.bonus ? ' — ' + link.bonus : '') + '<span class="ext-arrow">↗</span></a>';
      if (link.extra) {
        html += '<a href="' + link.extra.url + '" target="_blank" class="detail-cta-btn detail-cta-secondary">' + link.extra.label + '<span class="ext-arrow">↗</span></a>';
      }
      html += '</div>';
      return html;
    })()}

    <div class="detail-stats-row">
      <div class="detail-stat-chip">
        <div class="val">${card.cashback}</div>
        <div class="label">Cashback</div>
      </div>
      <div class="detail-stat-chip">
        <div class="val">${card.fee}</div>
        <div class="label">Annual Fee</div>
      </div>
      <div class="detail-stat-chip">
        <div class="val">${card.network}</div>
        <div class="label">Network</div>
      </div>
      <div class="detail-stat-chip">
        <div class="val">${card.type}</div>
        <div class="label">Card Type</div>
      </div>
    </div>

    <div class="detail-card">
      <h2>About</h2>
      <p>${card.description}</p>
      <div class="detail-tags">
        <span class="detail-tag">🏛️ ${card.custody}</span>
        <span class="detail-tag">💰 ${card.stablecoins}</span>
        <span class="detail-tag">🌍 ${card.regions}</span>
        ${card.highlights.map(h => `<span class="detail-tag">${h}</span>`).join('')}
      </div>
    </div>

    ${card.tiers ? `
    <div class="detail-card">
      <h2>Tiers</h2>
      <div class="tiers-table-wrap">
        <table class="tiers-table">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Cashback</th>
              <th>Fee</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${card.tiers.map((t, i) => `
              <tr ${i === 0 ? 'class="tier-highlight"' : ''}>
                <td><strong>${t.name}</strong></td>
                <td>${t.cashback}</td>
                <td>${t.fee}</td>
                <td>${t.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ` : ''}

    <div class="detail-card">
      <h2>Pros & Cons</h2>
      <div class="detail-pros-cons">
        <div>
          ${card.pros.map(p => `<div class="detail-pro">✓ ${p}</div>`).join('')}
        </div>
        <div>
          ${card.cons.map(c => `<div class="detail-con">✗ ${c}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="detail-card">
      <h2>Related Articles</h2>
      <div class="detail-articles">
        <div class="detail-article-placeholder">
          📝 Articles and reviews coming soon. Have one to share? <strong>Submit it.</strong>
        </div>
      </div>
    </div>
  `;

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}


function openStablePage(index) {
  const s = stablecoinsData[index];
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome('stablecoins')">← Back to stablecoins</button>

    <div class="detail-header">
      <div class="detail-emoji-box">${s.emoji}</div>
      <div class="detail-title-area">
        <h1>${s.ticker}</h1>
        <div class="detail-issuer">${s.issuer} · Pegged to ${s.peg}</div>
      </div>
    </div>

    <div class="detail-card">
      <h2>About</h2>
      <p>${s.desc}</p>
      <div class="detail-tags">
        <span class="detail-tag">💱 ${s.peg} pegged</span>
        ${s.usedBy.map(u => `<span class="detail-tag">💳 ${u}</span>`).join('')}
      </div>
    </div>

    <div class="detail-card">
      <h2>Related Articles</h2>
      <div class="detail-articles">
        <div class="detail-article-placeholder">
          📝 Articles and explainers coming soon. Have one to share? <strong>Submit it.</strong>
        </div>
      </div>
    </div>
  `;

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

function goHome(section) {
  // On card subpages there's no homeContent, so redirect to root
  if (window.location.pathname.indexOf('/card/') === 0) {
    window.location.href = '/';
    return;
  }

  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  detail.classList.remove('active');
  detail.innerHTML = '';
  home.style.display = '';

  history.pushState(null, '', '/');
  document.title = 'cryptocard.gg — every crypto card, compared \u2726';

  // Reset sidebar active state
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (section === 'stablecoins' && a.textContent.trim().includes('Stablecoins')) a.classList.add('active');
    else if (!section && a.textContent.trim().includes('Cards')) a.classList.add('active');
  });

  if (section === 'stablecoins') {
    setTimeout(() => {
      document.getElementById('stablecoinsSection').scrollIntoView({ behavior: 'smooth' });
    }, 50);
  } else {
    window.scrollTo({ top: 0 });
  }
}

// Keep old openModal as alias
function openModal(index) { openCardPage(index); }
function closeModal() { goHome(); }


let compareSelected = []; // Will be set in openComparePage

function getCompareCard(idx) {
  return allCompareCards[idx];
}

function openComparePage() {
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.textContent.trim().includes('Compare')) a.classList.add('active');
  });

  // Pre-select Chase Freedom (last in allCompareCards) + KAST Pengu (index 0)
  compareSelected = [allCompareCards.length - 1, 0];
  renderComparePage();

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

function renderComparePage() {
  const detail = document.getElementById('detailPage');

  // Web2 card first, then crypto cards
  const web2HTML = web2Cards.map((c, i) => {
    const idx = cards.length + i;
    return `
      <div class="compare-carousel-item ${compareSelected.includes(idx) ? 'selected' : ''}" onclick="toggleCompare(${idx})" style="border-right:2px dashed var(--card-border);padding-right:14px;margin-right:4px">
        <div class="carousel-emoji">${c.img ? `<img src="${c.img}" onerror="this.parentElement.innerHTML='${c.emoji}'">` : c.emoji}</div>
        <div class="carousel-name">${c.name}</div>
      </div>
    `;
  }).join('');

  // Crypto cards carousel
  const carouselHTML = web2HTML + cards.map((c, i) => `
    <div class="compare-carousel-item ${compareSelected.includes(i) ? 'selected' : ''}" onclick="toggleCompare(${i})">
      <div class="carousel-emoji">${c.img ? `<img src="${c.img}"  onerror="this.parentElement.innerHTML='${c.emoji}'">` : c.emoji}</div>
      <div class="carousel-name">${c.name}</div>
    </div>
  `).join('');

  // 4 slots
  const slotsHTML = [0, 1, 2].map(slotIdx => {
    if (compareSelected[slotIdx] !== undefined) {
      const c = getCompareCard(compareSelected[slotIdx]);
      const isWeb2 = c.web2;
      return `
        <div class="compare-slot filled" ${isWeb2 ? 'style="border-style:dashed"' : ''}>
          <button class="slot-remove" onclick="removeCompare(${slotIdx})">✕</button>
          <div class="slot-emoji">${c.img ? `<img src="${c.img}" style="width:100px;height:auto;border-radius:8px" onerror="this.parentElement.innerHTML='${c.emoji}'">` : c.emoji}</div>
          <div class="slot-name">${c.name}</div>
          <div class="slot-issuer">${c.issuer}${isWeb2 ? ' <span style="font-size:0.65rem;opacity:0.6">(traditional)</span>' : ''}</div>
        </div>
      `;
    }
    return `
      <div class="compare-slot">
        <div class="compare-slot-empty">
          <span>+</span>
          Select a card above
        </div>
      </div>
    `;
  }).join('');

  // Comparison table (show when 2+ selected)
  let tableHTML = '';
  if (compareSelected.length >= 2) {
    const sel = compareSelected.map(i => getCompareCard(i));
    const rows = [
      ['Cashback', sel.map(c => `<strong>${c.cashback}</strong>`)],
      ['Annual Fee', sel.map(c => c.fee)],
      ['Network', sel.map(c => c.network)],
      ['Type', sel.map(c => c.type)],
      ['Custody', sel.map(c => c.custody)],
      ['Stablecoins', sel.map(c => c.stablecoins)],
      ['Regions', sel.map(c => c.regions)],
    ];

    tableHTML = `
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th></th>
              ${sel.map(c => `<th>${c.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(([label, vals]) => `
              <tr>
                <td>${label}</td>
                ${vals.map(v => `<td>${v}</td>`).join('')}
              </tr>
            `).join('')}
            <tr>
              <td>Pros</td>
              ${sel.map(c => `<td>${c.pros.map(p => '✓ ' + p).join('<br>')}</td>`).join('')}
            </tr>
            <tr>
              <td>Cons</td>
              ${sel.map(c => `<td>${c.cons.map(p => '✗ ' + p).join('<br>')}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (compareSelected.length === 1) {
    tableHTML = `<div class="compare-empty"><span>☝️</span>Pick at least one more card to compare side-by-side.</div>`;
  }

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>

    <div class="compare-selector" style="text-align:center;">
      <h2>select cards to compare ⚖️</h2>
      <p style="margin-left:auto;margin-right:auto;">pick up to 3 cards — crypto or traditional — to see them side-by-side.</p>
    </div>

    <div class="compare-carousel-wrap">
      <button class="carousel-arrow left" onclick="document.getElementById('compareCarousel').scrollBy({left:-240,behavior:'smooth'})">‹</button>
      <div class="compare-carousel" id="compareCarousel">${carouselHTML}</div>
      <button class="carousel-arrow right" onclick="document.getElementById('compareCarousel').scrollBy({left:240,behavior:'smooth'})">›</button>
    </div>

    <div class="compare-slots">${slotsHTML}</div>

    ${tableHTML}
  `;
}

function toggleCompare(index) {
  var adding = !compareSelected.includes(index);
  if (adding) {
    if (compareSelected.length < 3) {
      compareSelected.push(index);
      var card = getCompareCard(index);
      trackEvent('compare_card_select', {
        card_name: card.name,
        card_issuer: card.issuer,
        cards_compared: compareSelected.length
      });
    }
  } else {
    compareSelected = compareSelected.filter(i => i !== index);
  }
  renderComparePage();
}

function removeCompare(slotIdx) {
  compareSelected.splice(slotIdx, 1);
  renderComparePage();
}

// ===== MATCH ME QUIZ =====

function openMatchPage() {
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.textContent.trim().includes('Match Me')) a.classList.add('active');
  });

  quizStep = 0;
  quizAnswers = {};
  quizSelections = {};
  renderQuiz();

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

function openBlogPage() {
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.textContent.trim().includes('Blog')) a.classList.add('active');
  });

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>

    <div style="margin-bottom:8px;text-align:center;">
      <h1 style="font-family:'Nunito',sans-serif;font-weight:900;font-size:2.2rem;letter-spacing:-0.5px;">Blog</h1>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-top:4px;">Stay ahead with our curated insights, news, and product breakdowns.</p>
    </div>

    <!-- Featured article -->
    <div class="detail-card" style="display:flex;gap:20px;align-items:center;cursor:pointer;padding:24px;" onclick="">
      <div style="width:200px;height:130px;background:var(--card-box-bg);border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">📝</div>
      <div style="flex:1;">
        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:6px;">Feb 28, 2026 · 5 min read</div>
        <h2 style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.3rem;margin-bottom:6px;">The Best Crypto Cards of 2026: A Complete Comparison</h2>
        <p style="color:var(--text-muted);font-size:0.85rem;line-height:1.5;">We break down every major crypto card on the market — cashback rates, fees, custody models, and which one actually makes sense for your spending habits.</p>
      </div>
    </div>

    <h3 style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.1rem;margin:28px 0 12px;">More articles</h3>

    <!-- Search -->
    <div style="margin-bottom:16px;">
      <input type="text" placeholder="Search articles..." style="width:100%;padding:10px 16px;border-radius:99px;border:1px solid var(--border);background:var(--card-bg);color:var(--text);font-family:'Nunito Sans',sans-serif;font-size:0.85rem;outline:none;">
    </div>

    <!-- Filters -->
    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="filter-pill active" style="padding:8px 16px;border-radius:99px;border:1px solid var(--border);background:var(--text);color:var(--bg);font-family:'Nunito',sans-serif;font-weight:700;font-size:0.8rem;cursor:pointer;">All</button>
      <button class="filter-pill" style="padding:8px 16px;border-radius:99px;border:1px solid var(--border);background:transparent;color:var(--text);font-family:'Nunito',sans-serif;font-weight:700;font-size:0.8rem;cursor:pointer;">Product Breakdowns</button>
      <button class="filter-pill" style="padding:8px 16px;border-radius:99px;border:1px solid var(--border);background:transparent;color:var(--text);font-family:'Nunito',sans-serif;font-weight:700;font-size:0.8rem;cursor:pointer;">News</button>
    </div>

    <!-- Article grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div class="detail-card" style="cursor:pointer;padding:0;overflow:hidden;">
        <div style="height:120px;background:var(--card-box-bg);display:flex;align-items:center;justify-content:center;font-size:2rem;">🏗️</div>
        <div style="padding:16px;">
          <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:4px;">Coming soon · 3 min read</div>
          <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:0.9rem;">More articles coming soon</div>
          <p style="color:var(--text-muted);font-size:0.75rem;margin-top:4px;line-height:1.4;">We're working on in-depth reviews, comparisons, and guides. Stay tuned.</p>
        </div>
      </div>
    </div>
  `;

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

function renderQuiz() {
  const detail = document.getElementById('detailPage');
  const total = quizQuestions.length;
  const q = quizQuestions[quizStep];

  const progressHTML = quizQuestions.map((_, i) =>
    `<div class="quiz-progress-dot ${i < quizStep ? 'done' : i === quizStep ? 'current' : ''}"></div>`
  ).join('');

  const currentAnswer = quizSelections[q.key] || null;

  const optsHTML = q.opts.map((o, oi) => `
    <button class="quiz-option ${currentAnswer === q.key + '_' + oi ? 'selected' : ''}" onclick="selectQuizOption('${q.key}', '${q.key + '_' + oi}', '${o.val}')">
      <span class="opt-emoji">${o.emoji}</span>
      <span>${o.text}</span>
    </button>
  `).join('');

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>

    <div class="quiz-container">
      <div class="quiz-progress">${progressHTML}</div>

      <div class="quiz-question-num">Question ${quizStep + 1} of ${total}</div>
      <div class="quiz-question">${q.q}</div>

      <div class="quiz-options">${optsHTML}</div>

      <div class="quiz-nav">
        ${quizStep > 0
          ? '<button class="quiz-btn quiz-btn-back" onclick="quizBack()">← Back</button>'
          : '<div></div>'
        }
        <button class="quiz-btn quiz-btn-next" ${!currentAnswer ? 'disabled' : ''} onclick="quizNext()">
          ${quizStep === total - 1 ? 'See my match 💘' : 'Next →'}
        </button>
      </div>
    </div>
  `;
}

function selectQuizOption(key, selectionId, val) {
  quizAnswers[key] = val;
  quizSelections[key] = selectionId;
  renderQuiz();
}

function quizBack() {
  if (quizStep > 0) { quizStep--; renderQuiz(); }
}

function quizNext() {
  const q = quizQuestions[quizStep];
  if (!quizAnswers[q.key]) return;

  if (quizStep < quizQuestions.length - 1) {
    quizStep++;
    renderQuiz();
  } else {
    showQuizResult();
  }
}

function scoreCards() {
  const a = quizAnswers;
  return cards.map((card, idx) => {
    let score = 0;

    // Card type match
    if (a.cardType !== 'any') {
      if (card.type === a.cardType) score += 15;
      else score -= 10;
    }

    // Goal
    if (a.goal === 'cashback') {
      score += parseFloat(card.cashback) * 8 || 0;
    }
    if (a.goal === 'custody' && card.custody.toLowerCase().includes('self')) score += 20;
    if (a.goal === 'yield') {
      if (card.highlights.some(h => h.toLowerCase().includes('yield') || h.toLowerCase().includes('earn'))) score += 20;
      if (card.custody.toLowerCase().includes('self')) score += 5;
    }
    if (a.goal === 'global') {
      if (card.regions.toLowerCase().includes('global') || card.regions.toLowerCase().includes('eu') || card.regions.toLowerCase().includes('41')) score += 15;
    }

    // Fee preference
    if (a.fee === 'free' && card.feeNum === 0) score += 15;
    if (a.fee === 'free' && card.feeNum > 0) score -= 20;
    if (a.fee === 'yes' && card.feeNum > 0) score += 5;

    // Region
    if (a.region === 'us' && card.regions.toLowerCase().includes('us')) score += 15;
    if (a.region === 'us' && !card.regions.toLowerCase().includes('us')) score -= 30;
    if (a.region === 'eu' && (card.regions.toLowerCase().includes('eu') || card.regions.toLowerCase().includes('uk'))) score += 15;
    if (a.region === 'eu' && card.regions.includes('US only')) score -= 30;
    if (a.region === 'latam' && card.regions.toLowerCase().includes('latam')) score += 15;

    // Custody
    if (a.custody === 'essential' && card.custody.toLowerCase().includes('self')) score += 20;
    if (a.custody === 'essential' && card.custody.toLowerCase().includes('custodial') && !card.custody.toLowerCase().includes('self')) score -= 15;
    if (a.custody === 'none' && !card.custody.toLowerCase().includes('self')) score += 5;

    // Stablecoin preference
    if (a.stablecoin !== 'any') {
      const stables = card.stablecoins.toLowerCase();
      if (a.stablecoin === 'usdc' && stables.includes('usdc')) score += 10;
      if (a.stablecoin === 'usdt' && stables.includes('usdt')) score += 10;
      if (a.stablecoin === 'dai' && stables.includes('dai')) score += 10;
    }

    // Wallet ecosystem
    if (a.wallet === 'metamask' && card.name.toLowerCase().includes('metamask')) score += 15;
    if (a.wallet === 'coinbase' && card.name.toLowerCase().includes('coinbase')) score += 15;

    // Vibe
    if (a.vibe === 'culture' && card.name.toLowerCase().includes('pengu')) score += 20;
    if (a.vibe === 'math') score += parseFloat(card.cashback) * 3 || 0;
    if (a.vibe === 'defi' && card.custody.toLowerCase().includes('self')) score += 10;
    if (a.vibe === 'simple') {
      if (card.issuer.toLowerCase().includes('coinbase') || card.issuer.toLowerCase().includes('crypto.com')) score += 10;
    }

    // Spend volume bonus for high-cashback cards
    if ((a.spend === 'high' || a.spend === 'whale') && parseFloat(card.cashback) >= 4) score += 10;

    return { idx, score, card };
  }).sort((a, b) => b.score - a.score);
}

function showQuizResult() {
  const detail = document.getElementById('detailPage');
  const ranked = scoreCards();
  const top = ranked[0].card;
  const topIdx = ranked[0].idx;
  const runnersUp = ranked.slice(1, 4);

  // Build "why" reason
  let whyParts = [];
  if (quizAnswers.goal === 'cashback') whyParts.push(`it offers ${top.cashback} cashback — one of the best rates available`);
  if (quizAnswers.goal === 'custody') whyParts.push(`it's ${top.custody.toLowerCase()}, so your crypto stays yours`);
  if (quizAnswers.goal === 'yield') whyParts.push('it lets you earn yield on your balance while you spend');
  if (quizAnswers.goal === 'global') whyParts.push(`it's available in ${top.regions}`);
  if (quizAnswers.fee === 'free' && top.feeNum === 0) whyParts.push('there\'s no annual fee');
  if (quizAnswers.custody === 'essential') whyParts.push(`it's ${top.custody.toLowerCase()}`);
  if (quizAnswers.vibe === 'culture') whyParts.push('it\'s got the community and culture angle you\'re looking for');

  const whyText = whyParts.length > 0
    ? `Based on your answers, ${top.name} is your best match because ${whyParts.join(', ')}.`
    : `Based on your spending habits, region, and preferences, ${top.name} is the strongest fit for you.`;

  const runnersHTML = runnersUp.map(r => `
    <div class="runner-up-item" onclick="openCardPage(${r.idx})">
      <span class="ru-emoji">${r.card.img ? `<img src="${r.card.img}" style="width:60px;height:auto;border-radius:8px;object-fit:contain" onerror="this.parentElement.innerHTML='${r.card.emoji}'">` : r.card.emoji}</span>
      <div>
        <div class="ru-name">${r.card.name}</div>
        <div class="ru-reason">${r.card.cashback} cashback · ${r.card.fee} · ${r.card.regions}</div>
      </div>
    </div>
  `).join('');

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>

    <div class="quiz-container">
      <div class="quiz-result">
        <div class="quiz-result-emoji">${top.img ? `<img src="${top.img}" style="width:180px;height:auto;border-radius:16px;object-fit:contain" onerror="this.parentElement.innerHTML='${top.emoji}'">` : top.emoji}</div>
        <h2>${top.name}</h2>
        <div class="result-issuer">${top.issuer}</div>

        <div class="quiz-result-stats">
          <div class="quiz-result-stat">
            <div class="val">${top.cashback}</div>
            <div class="label">Cashback</div>
          </div>
          <div class="quiz-result-stat">
            <div class="val">${top.fee}</div>
            <div class="label">Fee</div>
          </div>
          <div class="quiz-result-stat">
            <div class="val">${top.network}</div>
            <div class="label">Network</div>
          </div>
        </div>

        <div class="result-why">
          <h3>Why this card?</h3>
          <p>${whyText}</p>
        </div>

        <div class="quiz-result-actions">
          ${(() => {
            const link = cardLinks[top.name];
            if (link) {
              return '<a href="' + link.url + '" target="_blank" class="detail-cta-btn" style="text-decoration:none;font-size:0.85rem;padding:12px 22px;">' + link.label + '<span class="ext-arrow">↗</span></a>';
            }
            return '';
          })()}
          <button class="quiz-btn quiz-btn-back" onclick="openMatchPage()">Retake quiz</button>
          <button class="quiz-btn quiz-btn-next" onclick="openCardPage(${topIdx})">View card details →</button>
        </div>
      </div>

      <div class="quiz-runners-up">
        <h3>also worth a look 👀</h3>
        ${runnersHTML}
      </div>
    </div>
  `;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== NEWSLETTER MODAL =====
function openNlModal() {
  document.getElementById('nlModalOverlay').classList.add('active');
  document.getElementById('nlSuccessMsg').style.display = 'none';
}

function closeNlModal() {
  document.getElementById('nlModalOverlay').classList.remove('active');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNlModal();
});

// Listen for Beehiiv success event
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'beehiiv:success-toast') {
    document.getElementById('nlSuccessMsg').style.display = 'block';
  }
});


function openFooterPage(page) {
  const p = footerPages[page];
  if (!p) return;

  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  // Remove active from sidebar
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

  detail.innerHTML = `
    <button class="detail-back" onclick="goHome()">← Back to cards</button>
    <div style="max-width:720px;">
      <h1 style="font-family:'Nunito',sans-serif;font-weight:900;font-size:1.8rem;letter-spacing:-0.5px;margin-bottom:24px;">${p.title}</h1>
      <div style="font-size:0.92rem;line-height:1.8;color:var(--text);max-width:720px;">
        ${p.content}
      </div>
    </div>
  `;

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

// ===== FILTERS =====
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    const sort = document.getElementById('sortSelect').value;
    renderCards(filter, sort);
  });
});

document.getElementById('sortSelect').addEventListener('change', e => {
  const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
  renderCards(activeFilter, e.target.value);
});

// ===== EMAIL VALIDATION =====
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
}

// Inline newsletter email validation
document.querySelector('.newsletter-inline-form input')?.addEventListener('input', function() {
  const btn = this.closest('form').querySelector('button');
  if (isValidEmail(this.value.trim())) {
    this.classList.add('email-valid');
    btn.classList.add('email-ready');
  } else {
    this.classList.remove('email-valid');
    btn.classList.remove('email-ready');
  }
});

// ===== CATEGORIES PAGE =====
function openCategoriesPage() {
  const detail = document.getElementById('detailPage');
  const home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.textContent.trim().includes('Categories')) a.classList.add('active');
  });

  const filterCategories = [
    { name: 'Debit Cards', emoji: '💳', filter: 'debit', desc: 'Spend your own crypto — load and go.' },
    { name: 'Credit Cards', emoji: '🏦', filter: 'credit', desc: 'Crypto-backed credit lines with rewards.' },
    { name: 'Free Cards', emoji: '🆓', filter: 'free', desc: 'No annual fee — $0 to get started.' },
    { name: 'DeFi Cards', emoji: '🔗', filter: 'defi', desc: 'Self-custody and on-chain spending.' },
    { name: 'Visa Cards', emoji: '🟦', filter: 'visa', desc: 'All crypto cards on the Visa network.' },
    { name: 'Mastercard Cards', emoji: '🟠', filter: 'mastercard', desc: 'All crypto cards on the Mastercard network.' },
  ];

  const filterHTML = filterCategories.map(function(cat) {
    var filtered = cards.filter(function(c) {
      if (cat.filter === 'debit') return c.type === 'debit' || c.type === 'dual';
      if (cat.filter === 'credit') return c.type === 'credit' || c.type === 'dual';
      if (cat.filter === 'free') return c.feeNum === 0;
      if (cat.filter === 'defi') return c.tags.includes('defi') || c.tags.includes('self-custody');
      if (cat.filter === 'visa') return c.network === 'visa';
      if (cat.filter === 'mastercard') return c.network === 'mastercard';
      return true;
    });
    return '<div class="detail-card" style="cursor:pointer;padding:20px 24px;transition:transform 0.2s;" onclick="goHome(); setTimeout(function(){ var p=document.querySelector(\'.filter-pill[data-filter=' + cat.filter + ']\'); if(p) p.click(); }, 100);" onmouseenter="this.style.transform=\'translateY(-2px)\'" onmouseleave="this.style.transform=\'\'">' +
      '<div style="display:flex;align-items:center;gap:14px;">' +
        '<span style="font-size:1.8rem;">' + cat.emoji + '</span>' +
        '<div style="flex:1;">' +
          '<div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1.1rem;">' + cat.name + '</div>' +
          '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;">' + cat.desc + '</div>' +
        '</div>' +
        '<div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1.2rem;color:var(--text-muted);">' + filtered.length + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  const bestPages = [
    { id: 'best-credit', name: 'Best Credit Cards', emoji: '🏦', desc: 'Top crypto credit cards with the strongest rewards and perks.' },
    { id: 'best-rewards', name: 'Best Rewards Cards', emoji: '🏆', desc: 'Highest cashback rates and most valuable reward programs.' },
    { id: 'best-travel', name: 'Best Travel Cards', emoji: '✈️', desc: 'Low FX fees, global acceptance, and multi-currency support.' },
    { id: 'best-corporate', name: 'Best Corporate Cards', emoji: '🏢', desc: 'Cards built for teams, employee expenses, and business treasuries.' },
    { id: 'best-nofee', name: 'Best No-Fee Cards', emoji: '🆓', desc: '$0 annual fee cards that still deliver solid rewards.' },
    { id: 'best-selfcustody', name: 'Best Self-Custody Cards', emoji: '🔐', desc: 'Your keys, your crypto — spend without giving up control.' },
  ];

  var bestHTML = bestPages.map(function(bp) {
    return '<div class="detail-card" style="cursor:pointer;padding:20px 24px;transition:transform 0.2s;" onclick="openBestPage(\'' + bp.id + '\')" onmouseenter="this.style.transform=\'translateY(-2px)\'" onmouseleave="this.style.transform=\'\'">' +
      '<div style="display:flex;align-items:center;gap:14px;">' +
        '<span style="font-size:1.8rem;">' + bp.emoji + '</span>' +
        '<div style="flex:1;">' +
          '<div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1.1rem;">' + bp.name + '</div>' +
          '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;">' + bp.desc + '</div>' +
        '</div>' +
        '<div style="font-size:1rem;color:var(--text-muted);">→</div>' +
      '</div>' +
    '</div>';
  }).join('');

  detail.innerHTML =
    '<button class="detail-back" onclick="goHome()">← Back to cards</button>' +
    '<div style="margin-bottom:24px;">' +
      '<h1 style="font-family:\'Nunito\',sans-serif;font-weight:900;font-size:2rem;letter-spacing:-0.5px;">Categories</h1>' +
      '<p style="color:var(--text-muted);font-size:0.9rem;margin-top:4px;">Browse crypto cards by type, network, or feature.</p>' +
    '</div>' +
    '<div style="margin-bottom:32px;">' +
      '<div style="display:flex;flex-direction:column;gap:12px;">' + bestHTML + '</div>' +
    '</div>';

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}


function openBestPage(pageId) {
  var page = bestPagesData[pageId];
  if (!page) return;

  if (window.location.hash) {
    history.pushState(null, '', window.location.pathname + window.location.search);
  }

  var detail = document.getElementById('detailPage');
  var home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
  document.querySelectorAll('.sidebar-nav a').forEach(function(a) {
    if (a.textContent.trim().includes('Categories')) a.classList.add('active');
  });

  var cardsHTML = '';

  // Check for custom cards (e.g. corporate page)
  if (page.customCards && page.customCards.length > 0) {
    cardsHTML = '<div style="display:flex;flex-direction:column;gap:12px;">';
    page.customCards.forEach(function(card, i) {
      var comingSoonBadge = card.comingSoon ? '<span style="font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:99px;background:rgba(255,217,61,0.2);color:#bfa600;margin-left:8px;">COMING SOON</span>' : '';
      var clickAction = card.comingSoon ? '' : ' cursor:pointer;" onclick="window.location.href=\'/card/' + card.cardId + '\'';
      cardsHTML += '<div class="detail-card" style="padding:20px 24px;' + (card.comingSoon ? 'opacity:0.7;' : '') + clickAction + '">' +
        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
          '<div style="display:flex;align-items:center;gap:16px;flex:1;min-width:200px;">' +
            '<div style="font-size:0.75rem;font-weight:800;color:var(--text-muted);width:24px;text-align:center;">' + (i + 1) + '</div>' +
            '<div style="width:60px;height:38px;border-radius:8px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">' + (card.img ? '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.parentElement.innerHTML=\'' + card.emoji + '\'">' : '<span style="font-size:1.8rem;">' + card.emoji + '</span>') + '</div>' +
            '<div style="flex:1;">' +
              '<div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1rem;">' + card.name + comingSoonBadge + '</div>' +
              '<div style="font-size:0.78rem;color:var(--text-muted);">' + card.issuer + ' · ' + card.regions + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
            '<div style="text-align:center;"><div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1.1rem;">' + card.cashback + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cashback</div></div>' +
            '<div style="text-align:center;"><div style="font-size:0.85rem;font-weight:700;color:var(--text-muted);">' + card.fee + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Fee</div></div>' +
            '<div style="text-align:center;"><div style="font-size:0.72rem;padding:4px 10px;border-radius:99px;background:var(--tag-bg);color:var(--text-muted);font-weight:600;">' + card.network + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Network</div></div>' +
            (card.url && !card.comingSoon ? '<span style="font-size:0.78rem;font-weight:700;color:var(--accent-green);display:inline-flex;align-items:center;gap:4px;border:1.5px solid var(--accent-green);padding:6px 14px;border-radius:99px;cursor:pointer;" onclick="event.stopPropagation(); window.location.href=\'/card/' + card.cardId + '\'">View details →</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });
    cardsHTML += '</div>';
  } else {
    var filtered = cards.filter(page.filter);
    filtered.sort(page.sort);
    filtered = filtered.slice(0, 10);

    if (filtered.length === 0) {
      cardsHTML = '<div class="detail-card" style="text-align:center;padding:40px 24px;">' +
        '<div style="font-size:2rem;margin-bottom:12px;">🚧</div>' +
        '<div style="font-size:0.92rem;color:var(--text-muted);line-height:1.6;max-width:480px;margin:0 auto;">' + (page.emptyMsg || 'No cards in this category yet. Check back soon!') + '</div>' +
      '</div>';
    } else {
      cardsHTML = '<div style="display:flex;flex-direction:column;gap:12px;">';
      filtered.forEach(function(card, i) {
        var idx = cards.indexOf(card);
        var link = cardLinks[card.name];
        cardsHTML += '<div class="detail-card" style="padding:20px 24px;">' +
          '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
            '<div style="display:flex;align-items:center;gap:16px;flex:1;min-width:200px;cursor:pointer;" onclick="openCardPage(' + idx + ')">' +
              '<div style="font-size:0.75rem;font-weight:800;color:var(--text-muted);width:24px;text-align:center;">' + (i + 1) + '</div>' +
              '<div style="width:60px;height:38px;border-radius:8px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">' +
                (card.img ? '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.parentElement.innerHTML=\'' + card.emoji + '\'">' : card.emoji) +
              '</div>' +
              '<div style="flex:1;">' +
                '<div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1rem;">' + card.name + '</div>' +
                '<div style="font-size:0.78rem;color:var(--text-muted);">' + card.issuer + ' · ' + card.regions + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
              '<div style="text-align:center;"><div style="font-family:\'Nunito\',sans-serif;font-weight:800;font-size:1.1rem;">' + card.cashback + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cashback</div></div>' +
              '<div style="text-align:center;"><div style="font-size:0.85rem;font-weight:700;color:var(--text-muted);">' + card.fee + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Fee</div></div>' +
              '<div style="text-align:center;"><div style="font-size:0.72rem;padding:4px 10px;border-radius:99px;background:var(--tag-bg);color:var(--text-muted);font-weight:600;">' + card.network + '</div><div style="font-size:0.65rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">Network</div></div>' +
              (link ? '<span style="font-size:0.78rem;font-weight:700;color:var(--accent-green);display:inline-flex;align-items:center;gap:4px;border:1.5px solid var(--accent-green);padding:6px 14px;border-radius:99px;cursor:pointer;" onclick="event.stopPropagation(); openCardPage(' + idx + ')">View details →</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      });
      cardsHTML += '</div>';
    }
  }

  detail.innerHTML =
    '<button class="detail-back" onclick="openCategoriesPage()">← Back to categories</button>' +
    '<div style="margin-bottom:28px;">' +
      '<div style="font-size:2.5rem;margin-bottom:12px;">' + page.emoji + '</div>' +
      '<h1 style="font-family:\'Nunito\',sans-serif;font-weight:900;font-size:2rem;letter-spacing:-0.5px;">' + page.title + '</h1>' +
      '<p style="color:var(--text-muted);font-size:0.9rem;margin-top:8px;line-height:1.6;max-width:640px;">' + page.intro + '</p>' +
    '</div>' +
    cardsHTML;

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

// ===== CUSTOM CARD DETAIL PAGES =====
function getCustomCard(cardId) {
  for (var pageKey in bestPagesData) {
    var page = bestPagesData[pageKey];
    if (page.customCards) {
      for (var i = 0; i < page.customCards.length; i++) {
        if (page.customCards[i].cardId === cardId) return page.customCards[i];
      }
    }
  }
  return null;
}

function openCustomCardPage(cardId, skipPush) {
  // If not already on the card subpage, navigate to it directly
  if (!skipPush && window.location.pathname !== '/card/' + cardId && window.location.pathname !== '/card/' + cardId + '/') {
    window.location.href = '/card/' + cardId;
    return;
  }

  var card = getCustomCard(cardId);
  if (!card) return;
  document.title = card.name + ' — cryptocard.gg';

  var detail = document.getElementById('detailPage');
  var home = document.getElementById('homeContent');

  document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
  document.querySelectorAll('.sidebar-nav a').forEach(function(a) {
    if (a.textContent.trim().includes('Categories')) a.classList.add('active');
  });

  var ctaHTML = '';
  if (card.url) {
    ctaHTML = '<div class="detail-cta-row">' +
      '<a href="' + card.url + '" target="_blank" class="detail-cta-btn">' + (card.comingSoon ? 'Learn more' : 'Get your card') + '<span class="ext-arrow">↗</span></a>' +
    '</div>';
  }

  var statsHTML = '<div class="detail-stats-row">';
  statsHTML += '<div class="detail-stat-chip"><div class="val">' + card.cashback + '</div><div class="label">Cashback</div></div>';
  statsHTML += '<div class="detail-stat-chip"><div class="val">' + card.fee + '</div><div class="label">Fee</div></div>';
  statsHTML += '<div class="detail-stat-chip"><div class="val">' + card.network + '</div><div class="label">Network</div></div>';
  statsHTML += '<div class="detail-stat-chip"><div class="val">' + card.type + '</div><div class="label">Card Type</div></div>';
  statsHTML += '</div>';

  var tagsHTML = '<div class="detail-tags">';
  tagsHTML += '<span class="detail-tag">🏛️ ' + card.custody + '</span>';
  tagsHTML += '<span class="detail-tag">💰 ' + card.stablecoins + '</span>';
  tagsHTML += '<span class="detail-tag">🌍 ' + card.regions + '</span>';
  if (card.highlights) {
    card.highlights.forEach(function(h) {
      tagsHTML += '<span class="detail-tag">' + h + '</span>';
    });
  }
  tagsHTML += '</div>';

  var prosConsHTML = '<div class="detail-pros-cons"><div>';
  card.pros.forEach(function(p) {
    prosConsHTML += '<div class="detail-pro">✓ ' + p + '</div>';
  });
  prosConsHTML += '</div><div>';
  card.cons.forEach(function(c) {
    prosConsHTML += '<div class="detail-con">✗ ' + c + '</div>';
  });
  prosConsHTML += '</div></div>';

  var isCardSubpage = window.location.pathname.indexOf('/card/') === 0;
  var backHTML = isCardSubpage
    ? '<a href="/" class="detail-back" style="display:inline-block;text-decoration:none;color:inherit;">← Back to all cards</a>'
    : '<button class="detail-back" onclick="openBestPage(\'best-corporate\')">← Back to corporate cards</button>';

  detail.innerHTML =
    backHTML +
    '<div class="detail-header">' +
      '<div class="detail-emoji-box">' + (card.img ? '<img src="' + card.img + '" alt="' + card.name + '" onerror="this.parentElement.innerHTML=\'' + card.emoji + '\'">' : card.emoji) + '</div>' +
      '<div class="detail-title-area">' +
        '<h1>' + card.name + '</h1>' +
        '<div class="detail-issuer">' + card.issuer + '</div>' +
      '</div>' +
    '</div>' +
    ctaHTML +
    statsHTML +
    '<div class="detail-card">' +
      '<h2>About</h2>' +
      '<p>' + card.description + '</p>' +
      tagsHTML +
    '</div>' +
    '<div class="detail-card">' +
      '<h2>Pros & Cons</h2>' +
      prosConsHTML +
    '</div>' +
    '<div class="detail-card">' +
      '<h2>Related Articles</h2>' +
      '<div class="detail-articles">' +
        '<div class="detail-article-placeholder">📝 Articles and reviews coming soon. Have one to share? <strong>Submit it.</strong></div>' +
      '</div>' +
    '</div>';

  home.style.display = 'none';
  detail.classList.add('active');
  window.scrollTo({ top: 0 });
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
}

// Load saved theme
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;
else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.dataset.theme = 'dark';
}

// ===== INIT =====
renderCards();

// Set Cards as active on load
document.querySelectorAll('.sidebar-nav a').forEach(a => {
  if (a.textContent.trim().includes('Cards') && !a.textContent.trim().includes('Categories')) a.classList.add('active');
});

// ===== SIDEBAR NAV =====
function scrollToSection(section) {
  // Update active state
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  if (section === 'cards') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (section === 'stablecoins') {
    document.querySelector('.stablecoins-section').scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== SEARCH =====
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Cmd+K / Ctrl+K shortcut
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchModal.style.display = 'flex';
    setTimeout(() => searchInput.focus(), 50);
  }
  if (e.key === 'Escape' && searchModal.style.display === 'flex') {
    searchModal.style.display = 'none';
    searchInput.value = '';
    searchResults.innerHTML = '';
  }
});

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  searchResults.innerHTML = '';
  if (!q) return;

  const stablecoins = [
    { name: 'USDC', issuer: 'Circle', emoji: '🔵', meta: 'USD · Safe default' },
    { name: 'USDT', issuer: 'Tether', emoji: '🟢', meta: 'USD · Most liquid' },
    { name: 'mUSD', issuer: 'Stripe (Bridge)', emoji: '🦊', meta: 'USD · MetaMask rewards' },
    { name: 'aUSDC', issuer: 'Aave', emoji: '🏦', meta: 'USD · Yield-bearing' },
    { name: 'EURe', issuer: 'Monerium', emoji: '🇪🇺', meta: 'EUR · On-chain euro' },
    { name: 'DAI', issuer: 'Sky (MakerDAO)', emoji: '⚗️', meta: 'USD · Decentralized' },
  ];

  const matchedCards = cards.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.issuer.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q) ||
    c.network.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );

  var allCustomCards = [];
  var mainCardNames = cards.map(function(c) { return c.name; });
  for (var pageKey in bestPagesData) {
    if (bestPagesData[pageKey].customCards) {
      bestPagesData[pageKey].customCards.forEach(function(cc) {
        if (mainCardNames.indexOf(cc.name) === -1) allCustomCards.push(cc);
      });
    }
  }
  const matchedCustomCards = allCustomCards.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.issuer.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q) ||
    c.network.toLowerCase().includes(q) ||
    (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
  );

  const matchedStables = stablecoins.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.issuer.toLowerCase().includes(q) ||
    s.meta.toLowerCase().includes(q)
  );

  matchedCards.forEach((card, i) => {
    const idx = cards.indexOf(card);
    searchResults.innerHTML += `
      <div class="search-result-item" onclick="document.getElementById('searchModal').style.display='none';openModal(${idx})">
        <span class="sr-emoji">${card.emoji}</span>
        <div class="sr-info">
          <div class="sr-name">${card.name}</div>
          <div class="sr-meta">${card.cashback} cashback · ${card.fee} · ${card.type}</div>
        </div>
      </div>
    `;
  });

  matchedCustomCards.forEach(card => {
    searchResults.innerHTML += `
      <div class="search-result-item" onclick="document.getElementById('searchModal').style.display='none';window.location.href='/card/${card.cardId}'">
        <span class="sr-emoji">${card.emoji}</span>
        <div class="sr-info">
          <div class="sr-name">${card.name}</div>
          <div class="sr-meta">${card.cashback} cashback · ${card.fee} · ${card.type}</div>
        </div>
      </div>
    `;
  });

  matchedStables.forEach(s => {
    searchResults.innerHTML += `
      <div class="search-result-item" onclick="document.getElementById('searchModal').style.display='none';document.querySelector('.stablecoins-section').scrollIntoView({behavior:'smooth'})">
        <span class="sr-emoji">${s.emoji}</span>
        <div class="sr-info">
          <div class="sr-name">${s.name}</div>
          <div class="sr-meta">${s.meta} · ${s.issuer}</div>
        </div>
      </div>
    `;
  });

  if (!matchedCards.length && !matchedCustomCards.length && !matchedStables.length) {
    searchResults.innerHTML = '<div style="padding:16px;color:var(--text-muted);font-size:0.85rem;text-align:center;">No results found</div>';
  }
});

// ===== ROUTING =====
function handleRoute() {
  var path = window.location.pathname;

  // Legacy hash redirect: /#card/xyz -> /card/xyz
  var hash = window.location.hash;
  if (hash.indexOf('#card/') === 0) {
    var cardId = hash.replace('#card/', '');
    history.replaceState(null, '', '/card/' + cardId);
    openCustomCardPage(cardId, true);
    return;
  }

  // Path-based routing: /card/xyz
  var match = path.match(/^\/card\/([a-z0-9-]+)\/?$/);
  if (match) {
    openCustomCardPage(match[1], true);
  }
}

// Handle browser back/forward
window.addEventListener('popstate', function() {
  var path = window.location.pathname;
  var match = path.match(/^\/card\/([a-z0-9-]+)\/?$/);
  if (match) {
    openCustomCardPage(match[1], true);
  } else if (path === '/' || path === '') {
    // Going back to home — only works on index.html (has homeContent)
    var home = document.getElementById('homeContent');
    var detail = document.getElementById('detailPage');
    if (home && home.innerHTML.trim()) {
      detail.classList.remove('active');
      detail.innerHTML = '';
      home.style.display = '';
      document.title = 'cryptocard.gg \u2014 every crypto card, compared \u2726';
      window.scrollTo({ top: 0 });
    } else {
      window.location.href = '/';
    }
  }
});

// Run on load
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', handleRoute);
} else {
  handleRoute();
}

