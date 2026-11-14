import {
  CONTRAST_SCENARIOS,
  HAPPINESS_PILLARS,
  SCIENTIFIC_STUDIES,
  MOVEMENT_FORMATS,
  MEETUP_IDEAS,
  CONVERSATION_CARDS,
  FOUNDING_SIGNATURES,
} from './data.js';
import { Manifesto3DScene } from './three-scene.js';

const STORAGE_KEY = 'manifesto_novo_mundo_signatures_v1';

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Scroll Engine
  const canvas = document.getElementById('world-canvas');
  const scene3D = canvas ? new Manifesto3DScene(canvas) : null;

  // 2. Render "Pare para pensar" Contrast Scenarios
  const contrastList = document.getElementById('contrast-list');
  if (contrastList) {
    contrastList.innerHTML = CONTRAST_SCENARIOS.map(
      (item, idx) => `
      <article class="contrast-card reveal ${idx === 0 ? 'expanded' : ''}" data-index="${idx}" tabindex="0" role="button" aria-expanded="${idx === 0}">
        <div class="contrast-head">
          <h3 class="contrast-prompt">${escapeHTML(item.prompt)}</h3>
          <button type="button" class="contrast-toggle">${idx === 0 ? 'Recolher' : 'Contrastes'}</button>
        </div>
        <div class="contrast-body">
          <div class="contrast-col script">
            <span>O Roteiro Automático</span>
            <p>${escapeHTML(item.script)}</p>
          </div>
          <div class="contrast-col truth">
            <span>O Que Realmente Queremos</span>
            <p>${escapeHTML(item.truth)}</p>
          </div>
        </div>
      </article>
    `
    ).join('');

    contrastList.addEventListener('click', (e) => {
      const card = e.target.closest('.contrast-card');
      if (!card) return;
      const expanded = card.classList.toggle('expanded');
      card.setAttribute('aria-expanded', String(expanded));
      const btn = card.querySelector('.contrast-toggle');
      if (btn) btn.textContent = expanded ? 'Recolher' : 'Contrastes';
    });

    contrastList.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.contrast-card');
        if (card) {
          e.preventDefault();
          card.click();
        }
      }
    });
  }

  // 3. Render & Wire "Núcleo da Felicidade" Pillars
  const pillarDetail = document.getElementById('pillar-detail-card');
  const pillarTabs = document.querySelectorAll('.pillar-tab');

  function renderPillar(idx) {
    const p = HAPPINESS_PILLARS[idx];
    if (!p || !pillarDetail) return;
    pillarDetail.innerHTML = `
      <h3>${escapeHTML(p.name)}</h3>
      <p class="pillar-essence">${escapeHTML(p.essence)}</p>
      <div class="pillar-split">
        <div class="pillar-box">
          <h4>Como a rotina drena</h4>
          <p>${escapeHTML(p.drain)}</p>
        </div>
        <div class="pillar-box">
          <h4>Como resgatar hoje</h4>
          <p>${escapeHTML(p.practice)}</p>
        </div>
      </div>
    `;
    if (scene3D) scene3D.setActivePillar(idx);
  }

  pillarTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.pillar);
      pillarTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderPillar(idx);
    });
  });
  renderPillar(0);

  // 4. Render & Filter "Base Científica"
  const scienceGrid = document.getElementById('science-grid');
  const filterChips = document.querySelectorAll('.filter-chip');

  function renderScience(filter = 'all') {
    if (!scienceGrid) return;
    const filtered =
      filter === 'all'
        ? SCIENTIFIC_STUDIES
        : SCIENTIFIC_STUDIES.filter((s) => s.category === filter);

    scienceGrid.innerHTML = filtered
      .map(
        (s) => `
      <article class="science-card">
        <div>
          <div class="science-meta">${escapeHTML(s.journal)} · ${escapeHTML(s.year)}</div>
          <h3>${escapeHTML(s.title)}</h3>
          <p class="science-authors">${escapeHTML(s.authors)}</p>
          <p class="science-finding">${escapeHTML(s.finding)}</p>
        </div>
        <div class="science-takeaway">${escapeHTML(s.takeaway)}</div>
      </article>
    `
      )
      .join('');
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      renderScience(chip.dataset.filter);
    });
  });
  renderScience('all');

  // 5. Render Movement Formats
  const movementGrid = document.getElementById('movement-grid');
  if (movementGrid) {
    movementGrid.innerHTML = MOVEMENT_FORMATS.map(
      (m) => `
      <article class="movement-card reveal">
        <span class="movement-tag">${escapeHTML(m.tag)}</span>
        <h3>${escapeHTML(m.title)}</h3>
        <p>${escapeHTML(m.description)}</p>
        <div class="movement-tip">${escapeHTML(m.tip)}</div>
      </article>
    `
    ).join('');
  }

  // 6. Spontaneous Meetup Generator
  let currentMeetupIdx = 0;
  const genBadge = document.getElementById('gen-badge');
  const genTitle = document.getElementById('gen-title');
  const genDesc = document.getElementById('gen-desc');
  const genTemplate = document.getElementById('gen-template');
  const btnGen = document.getElementById('btn-generate-meetup');
  const btnCopyInvite = document.getElementById('btn-copy-invite');

  if (btnGen) {
    btnGen.addEventListener('click', () => {
      currentMeetupIdx = (currentMeetupIdx + 1) % MEETUP_IDEAS.length;
      const item = MEETUP_IDEAS[currentMeetupIdx];
      genBadge.textContent = item.badge;
      genTitle.textContent = item.title;
      genDesc.textContent = item.desc;
      genTemplate.textContent = item.template;
    });
  }

  if (btnCopyInvite) {
    btnCopyInvite.addEventListener('click', async () => {
      const text = genTemplate ? genTemplate.textContent.replace(/^"|"$/g, '') : '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('Convite copiado! Agora envie para alguém especial.');
      } catch {
        showToast('Selecione o texto acima e copie para enviar.');
      }
    });
  }

  // 7. 3D Tilt Conversation Card Deck
  let cardIdx = 0;
  const convCard = document.getElementById('conversation-card');
  const cardCategory = document.getElementById('card-category');
  const cardNumber = document.getElementById('card-number');
  const cardQuestion = document.getElementById('card-question');

  function nextCard() {
    cardIdx = (cardIdx + 1) % CONVERSATION_CARDS.length;
    const c = CONVERSATION_CARDS[cardIdx];
    cardCategory.textContent = c.category;
    cardNumber.textContent = `${String(cardIdx + 1).padStart(2, '0')} / ${String(CONVERSATION_CARDS.length).padStart(2, '0')}`;
    cardQuestion.textContent = c.question;
  }

  if (convCard) {
    convCard.addEventListener('click', nextCard);
    convCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nextCard();
      }
    });

    // Subtle 3D tilt on pointer devices (desktop/tablet mouse)
    convCard.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = convCard.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      convCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    convCard.addEventListener('pointerleave', () => {
      convCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  // 8. Public Signature Wall (LocalStorage + Founding Signatures)
  const signForm = document.getElementById('sign-form');
  const signaturesWall = document.getElementById('signatures-wall');
  const signatureCount = document.getElementById('signature-count');
  const signedBadge = document.getElementById('signed-badge-card');
  const badgeNumber = document.getElementById('badge-number');
  const badgeName = document.getElementById('badge-name');
  const badgePledge = document.getElementById('badge-pledge');
  const btnCopyLink = document.getElementById('btn-copy-manifesto-link');
  const btnDownloadCard = document.getElementById('btn-download-card');

  function loadSignatures() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        return saved;
      }
    } catch {
      // Fallback to founding signatures
    }
    return [...FOUNDING_SIGNATURES];
  }

  let signatures = loadSignatures();
  let lastUserSignature = null;

  function renderSignatures() {
    if (signatureCount) {
      signatureCount.textContent = String(signatures.length);
    }
    if (!signaturesWall) return;
    signaturesWall.innerHTML = signatures
      .map(
        (s) => `
      <article class="signature-item">
        <div class="sig-top">
          <span class="sig-name">${escapeHTML(s.name)}</span>
          <span class="sig-city">${escapeHTML(s.city)}</span>
        </div>
        <p class="sig-pledge">Compromisso: ${escapeHTML(s.pledge)}</p>
        ${s.note ? `<p class="sig-note">"${escapeHTML(s.note)}"</p>` : ''}
      </article>
    `
      )
      .join('');
  }

  renderSignatures();

  if (signForm) {
    signForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signer-name').value.trim();
      const city = document.getElementById('signer-city').value.trim();
      const pledge = document.getElementById('signer-pledge').value;
      const note = document.getElementById('signer-note').value.trim();

      if (!name || !city) return;

      const entry = { name, city, pledge, note };
      signatures = [entry, ...signatures];
      lastUserSignature = { ...entry, number: signatures.length };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures));
      } catch {
        // Ignore storage quota issues
      }

      renderSignatures();
      signForm.reset();

      if (scene3D) scene3D.pulseNewSignature();
      showToast('Assinatura registrada no Pacto do Novo Mundo!');

      if (signedBadge) {
        signedBadge.hidden = false;
        badgeNumber.textContent = `#${String(lastUserSignature.number).padStart(3, '0')}`;
        badgeName.textContent = `${lastUserSignature.name} — ${lastUserSignature.city}`;
        badgePledge.textContent = `Compromisso: ${lastUserSignature.pledge}`;
      }
    });
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link do Manifesto copiado para compartilhar!');
      } catch {
        showToast('Copie o endereço da barra do navegador para compartilhar.');
      }
    });
  }

  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', () => {
      if (!lastUserSignature) return;
      const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="440" viewBox="0 0 800 440">
  <rect width="800" height="440" rx="24" fill="#14110f"/>
  <rect x="24" y="24" width="752" height="392" rx="18" fill="none" stroke="#e0a444" stroke-opacity="0.45" stroke-width="1.5"/>
  <text x="56" y="76" fill="#e0a444" font-family="Georgia, serif" font-size="18" letter-spacing="3">MANIFESTO NOVO MUNDO · PACTO #${lastUserSignature.number}</text>
  <text x="56" y="150" fill="#f3ede2" font-family="Georgia, serif" font-size="40" font-weight="bold">${escapeHTML(lastUserSignature.name)}</text>
  <text x="56" y="188" fill="#d4653b" font-family="sans-serif" font-size="20">${escapeHTML(lastUserSignature.city)}</text>
  <text x="56" y="255" fill="#f3ede2" font-family="sans-serif" font-size="18" opacity="0.85">Meu próximo gesto concreto:</text>
  <text x="56" y="292" fill="#e0a444" font-family="Georgia, serif" font-size="24">${escapeHTML(lastUserSignature.pledge)}</text>
  <text x="56" y="378" fill="#f3ede2" font-family="sans-serif" font-size="15" opacity="0.6">"Felicidade não se compra — se compartilha."</text>
</svg>`.trim();

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacto-novo-mundo-${lastUserSignature.number}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Cartão SVG baixado!');
    });
  }

  // 9. Mobile Drawer Navigation
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function setDrawer(open) {
    if (!mobileBtn || !mobileDrawer) return;
    mobileDrawer.classList.toggle('open', open);
    mobileDrawer.setAttribute('aria-hidden', String(!open));
    mobileBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      setDrawer(!isOpen);
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => setDrawer(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false);
  });

  // 10. Scroll Progress -> 3D Scene Morphing + Header State + Chapter Rail
  const sections = Array.from(document.querySelectorAll('.section[data-chapter]'));
  const siteHeader = document.getElementById('site-header');
  const railFill = document.getElementById('rail-fill');
  const railLabel = document.getElementById('rail-label');
  const paperSection = document.getElementById('movimento');

  function updateScrollState() {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const totalPct = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    if (railFill) {
      railFill.style.height = `${(totalPct * 100).toFixed(1)}%`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', scrollY > 40);
      if (paperSection) {
        const rect = paperSection.getBoundingClientRect();
        siteHeader.classList.toggle('on-paper', rect.top <= 70 && rect.bottom >= 70);
      }
    }

    // Compute continuous chapter float (0.0 -> 6.0) for smooth 3D morphing
    let currentChapterFloat = 0;
    const viewportMid = window.innerHeight * 0.45;
    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= viewportMid) {
        const progressInSection = Math.min(Math.max((viewportMid - rect.top) / Math.max(rect.height, 1), 0), 1);
        currentChapterFloat = i + progressInSection * 0.85;
        if (railLabel && sections[i].dataset.label) {
          railLabel.textContent = sections[i].dataset.label;
        }
      }
    }

    if (scene3D) {
      scene3D.setScrollProgress(currentChapterFloat);
    }
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // 11. Scroll Reveal Observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
});
