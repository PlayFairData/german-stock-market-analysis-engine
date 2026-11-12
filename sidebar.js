/*!
 * PlayDataFair Reports — shared collapsible sidebar (sidebar.js).
 *
 * Self-contained navigation component. Include before </body>:
 *   <script src="sidebar.js"></script>       (pages in report/)
 *   <script src="../sidebar.js"></script>    (pages in report/news/, report/event/, report/stageReport/)
 *
 * Injects sidebar.css (resolved relative to this script), renders the report
 * navigation with active-page highlighting, and provides an AI-chatbot style
 * collapse/expand toggle persisted in localStorage. No fetch() — works on file://.
 */
(function () {
  'use strict';

  if (document.getElementById('pdf-sidebar')) { return; }

  /* ---------- resolve the folder this script was loaded from ---------- */
  var scriptEl = document.currentScript;
  if (!scriptEl) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (/(^|\/)sidebar\.js$/i.test(scripts[i].getAttribute('src') || '')) { scriptEl = scripts[i]; break; }
    }
  }
  var base = (scriptEl && scriptEl.src) ? scriptEl.src.replace(/sidebar\.js$/i, '') : './';

  /* ---------- navigation config (hrefs relative to report/) ----------
     To add a future page: one entry here + one <script src> tag on that page. */
  var NAV = [
    { icon: '📊', label: 'Market State',          href: 'stage_report.html',        match: ['stage_report.html'] },
    { icon: '📈', label: 'Sector Rotation',       href: 'sector_rotation.html',     match: ['sector_rotation.html'] },
    { icon: '💼', label: 'Fundamental & Sentiment', href: 'fund_sentiment_main.html', match: ['fund_sentiment_main.html'] },
    { icon: '📑', label: 'EPS Trend & Revision',  href: 'eps_report.html',          match: ['eps_report.html'] },
    { icon: '📰', label: 'News Sentiment',        href: 'news/index.html',          match: ['news/index.html'] },
    { icon: '📅', label: 'Market Events',         href: 'event/index.html',         match: ['event/index.html'] },
    { icon: '📂', label: 'Archive & History',     href: 'stageReport/index.html',   match: ['stageReport/index.html', 'stageReport/archive.html'] },
    { icon: '📖', label: 'System Guide',          href: 'index.html',               match: ['index.html'] }
  ];

  /* ---------- state ---------- */
  var LS_KEY = 'pdfSidebarState';
  var html = document.documentElement;
  var mqDesktop = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: true };

  function setOpen(open) {
    html.classList.toggle('pdf-sb-open', open);
    try { localStorage.setItem(LS_KEY, open ? 'open' : 'closed'); } catch (e) { /* private mode */ }
  }

  /* path comparison tolerant of file:// URLs, %XX escapes and Windows case */
  function normPath(p) {
    try { p = decodeURIComponent(p || ''); } catch (e) {}
    p = p.replace(/\\/g, '/').toLowerCase();
    if (/\/index\.html$/.test(p)) { p = p.slice(0, -'index.html'.length); }
    return p;
  }

  /* ---------- DOM construction (after sidebar.css is ready to avoid FOUC) ---------- */
  var built = false;
  function build() {
    if (built) { return; }
    built = true;

    var backdrop = document.createElement('div');
    backdrop.id = 'pdf-sb-backdrop';
    backdrop.addEventListener('click', function () { setOpen(false); });

    var aside = document.createElement('aside');
    aside.id = 'pdf-sidebar';
    aside.setAttribute('aria-label', 'Report navigation');

    var navHtml = '';
    for (var i = 0; i < NAV.length; i++) {
      /* hrefs are relative to report/ (where sidebar.js lives) — resolve them
         against this script's folder, NOT the page's folder, or subfolder pages
         would look for e.g. report/news/news/index.html */
      var absHref = NAV[i].href;
      try { absHref = new URL(NAV[i].href, base).href; } catch (e) {}
      navHtml += '<a class="pdf-sb-item" href="' + absHref + '">' +
                 '<span class="pdf-sb-ico" aria-hidden="true">' + NAV[i].icon + '</span>' +
                 '<span class="pdf-sb-label">' + NAV[i].label + '</span></a>';
    }
    aside.innerHTML =
      '<div class="pdf-sb-header">' +
        '<div class="pdf-sb-logo" aria-hidden="true">PF</div>' +
        '<div class="pdf-sb-title">PlayDataFair<small>Reports</small></div>' +
        '<button type="button" class="pdf-sb-iconbtn" id="pdf-sb-collapse" title="Collapse sidebar" aria-label="Collapse sidebar">◨</button>' +
      '</div>' +
      '<nav class="pdf-sb-nav">' + navHtml + '</nav>';

    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.id = 'pdf-sb-expand';
    expandBtn.title = 'Expand sidebar';
    expandBtn.setAttribute('aria-label', 'Expand sidebar');
    expandBtn.innerHTML = '☰';

    document.body.appendChild(backdrop);
    document.body.appendChild(aside);
    document.body.appendChild(expandBtn);

    /* active page highlighting */
    try {
      var cur = normPath(location.pathname);
      var links = aside.querySelectorAll('.pdf-sb-item');
      for (var k = 0; k < NAV.length && k < links.length; k++) {
        var candidates = NAV[k].match || [NAV[k].href];
        for (var m = 0; m < candidates.length; m++) {
          if (normPath(new URL(candidates[m], base).pathname) === cur) {
            links[k].classList.add('pdf-sb-active');
            links[k].setAttribute('aria-current', 'page');
            break;
          }
        }
      }
    } catch (e) { /* URL parsing unavailable — skip highlighting */ }

    /* toggle wiring */
    aside.querySelector('#pdf-sb-collapse').addEventListener('click', function () { setOpen(false); });
    expandBtn.addEventListener('click', function () { setOpen(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && html.classList.contains('pdf-sb-open')) { setOpen(false); }
    });

    /* initial state: localStorage wins, else expanded on desktop / collapsed on mobile */
    var stored = null;
    try { stored = localStorage.getItem(LS_KEY); } catch (e) {}
    setOpen(stored === null ? mqDesktop.matches : stored === 'open');
  }

  /* ---------- bootstrap: inject stylesheet, build once it is ready ---------- */
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base + 'sidebar.css';
  link.onload = build;
  link.onerror = build;
  document.head.appendChild(link);
  window.setTimeout(build, 400); /* fallback if load events never fire */
})();
