/* Theme toggle, email chips and the project detail dialog. No dependencies. */

(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* ─── Theme toggle ─────────────────────────────────── */
  var toggle = document.getElementById('theme-toggle');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
  }

  function updateToggleLabel() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  if (toggle) {
    updateToggleLabel();
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateToggleLabel();
    });
    darkQuery.addEventListener('change', updateToggleLabel);
  }

  /* ─── Email chips ──────────────────────────────────── */
  // Built from data attributes so the address is not plain text in the HTML.
  (function () {
    var source = document.getElementById('email');
    if (!source || !source.dataset.user || !source.dataset.domain) return;
    var address = source.dataset.user + '@' + source.dataset.domain;

    function fillChip(chip) {
      var icon = chip.querySelector('svg');
      var link = document.createElement('a');
      link.href = 'mailto:' + address;
      link.textContent = address;

      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'chip__copy';
      copy.setAttribute('aria-label', 'Copy email address');
      copy.innerHTML = '<svg width="16" height="16" aria-hidden="true" focusable="false"><use href="#i-copy" /></svg>';
      copy.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(address).then(function () {
          copy.setAttribute('aria-label', 'Copied');
          copy.title = 'Copied';
          setTimeout(function () {
            copy.setAttribute('aria-label', 'Copy email address');
            copy.title = '';
          }, 1500);
        });
      });

      chip.replaceChildren(icon, link, copy);
    }

    fillChip(source);
    document.querySelectorAll('[data-email-mirror]').forEach(fillChip);
  })();

  /* ─── Project detail dialog with image gallery ─────── */
  (function () {
    var dialog = document.getElementById('work-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var gallery = dialog.querySelector('.gallery');
    var stage = dialog.querySelector('.gallery__stage');
    var prev = dialog.querySelector('.gallery__nav--prev');
    var next = dialog.querySelector('.gallery__nav--next');
    var count = dialog.querySelector('.gallery__count');
    var content = dialog.querySelector('.work-dialog__content');
    var slides = [];
    var index = 0;
    var opener = null;

    function show(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach(function (fig, n) {
        var active = n === index;
        fig.classList.toggle('is-active', active);
        var video = fig.querySelector('video');
        if (video) {
          if (active) { video.play().catch(function () {}); } else { video.pause(); }
        }
      });
      count.textContent = (index + 1) + ' / ' + slides.length;
    }

    function open(card) {
      var tpl = card.querySelector('template.work-detail');
      if (!tpl) return;
      var frag = tpl.content.cloneNode(true);
      var figs = frag.querySelector('[data-gallery]');
      var body = frag.querySelector('[data-content]');

      stage.replaceChildren();
      slides = figs ? Array.prototype.slice.call(figs.querySelectorAll('figure')) : [];
      slides.forEach(function (fig) { stage.appendChild(fig); });
      gallery.hidden = slides.length === 0;
      prev.hidden = next.hidden = count.hidden = slides.length < 2;

      content.replaceChildren();
      if (body) content.appendChild(body);
      var title = content.querySelector('h3');
      if (title) title.id = 'work-dialog-title';

      opener = card.querySelector('.work-card__open');
      root.classList.add('modal-open');
      dialog.showModal();
      dialog.scrollTop = 0;
      show(0);
    }

    document.querySelectorAll('.work-card').forEach(function (card) {
      var button = card.querySelector('.work-card__open');
      if (button) button.addEventListener('click', function () { open(card); });
    });

    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });

    dialog.querySelector('.work-dialog__close').addEventListener('click', function () { dialog.close(); });

    // Click on the dimmed backdrop closes the dialog.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('keydown', function (e) {
      if (slides.length < 2) return;
      if (e.key === 'ArrowLeft') { show(index - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { show(index + 1); e.preventDefault(); }
    });

    // Swipe left/right on touch screens.
    var touchX = null;
    stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    dialog.addEventListener('close', function () {
      stage.querySelectorAll('video').forEach(function (v) { v.pause(); });
      root.classList.remove('modal-open');
      if (opener) opener.focus();
    });
  })();
})();
