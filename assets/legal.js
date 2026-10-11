// Language switch + table of contents for legal.hobbyarmory.de.
// The language is picked before first paint by the inline script in each
// page's <head>; this file only wires the buttons and builds the contents.
(function () {
  var root = document.documentElement;

  function current() {
    return root.classList.contains('show-de') ? 'de' : 'en';
  }

  function setLang(lang) {
    root.classList.remove('show-de', 'show-en');
    root.classList.add('show-' + lang);
    root.lang = lang;
    try { localStorage.setItem('legal-lang', lang); } catch (e) {}
    try {
      var url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    } catch (e) {}
    sync();
  }

  function sync() {
    var lang = current();
    document.querySelectorAll('.langs button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    var t = document.querySelector('meta[name="title-' + lang + '"]');
    if (t) document.title = t.content;
  }

  document.querySelectorAll('.langs button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  // One contents list per language, built from that language's h2s.
  document.querySelectorAll('nav.toc[data-for]').forEach(function (toc) {
    var article = document.getElementById(toc.dataset.for);
    if (!article) return;
    var heads = article.querySelectorAll('h2');
    if (heads.length < 4) return;
    var lang = toc.dataset.for.slice(-2);
    // A <details> so the list folds away on a phone, where it would push
    // the document a full screen down; open on wider screens.
    var box = document.createElement('details');
    box.open = window.matchMedia('(min-width: 861px)').matches;
    var title = document.createElement('summary');
    title.className = 'toc-title';
    title.textContent = lang === 'de' ? 'Inhalt' : 'Contents';
    var list = document.createElement('ol');
    heads.forEach(function (h, i) {
      if (!h.id) h.id = lang + '-' + (i + 1);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, '');
      li.appendChild(a);
      list.appendChild(li);
    });
    box.appendChild(title);
    box.appendChild(list);
    toc.appendChild(box);

    if ('IntersectionObserver' in window) {
      var links = toc.querySelectorAll('a');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id);
          });
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      heads.forEach(function (h) { io.observe(h); });
    }
  });

  sync();
})();
