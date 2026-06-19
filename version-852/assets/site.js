(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('img');
    images.forEach(function (img) {
      img.addEventListener('error', function () {
        var frame = img.closest('.poster-frame, .hero-tile, .rank-poster');
        if (frame) {
          frame.classList.add('fallback');
          frame.setAttribute('data-fallback-title', img.getAttribute('alt') || '精选电影');
        }
        img.remove();
      }, { once: true });
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (!cards.length || (!input && !yearSelect && !typeSelect)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');
    if (queryFromUrl && input) {
      input.value = queryFromUrl;
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardTitle = normalize(card.getAttribute('data-title'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1 || cardTitle.indexOf(keyword) !== -1;
        var yearMatched = !year || cardYear === year;
        var typeMatched = !type || cardType === type;
        var matched = keywordMatched && yearMatched && typeMatched;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (shell) {
      var video = shell.querySelector('video[data-source]');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      var source = video.getAttribute('data-source');
      var hlsInstance = null;

      function attachSource() {
        if (!source) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        if (!video.src) {
          attachSource();
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('error', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        button.classList.remove('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupImageFallbacks();
    setupFilters();
    setupPlayers();
  });
})();
