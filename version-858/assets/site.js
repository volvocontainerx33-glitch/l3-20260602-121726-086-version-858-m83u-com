(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  if (slides.length > 1) {
    var index = 0;
    setInterval(function () {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 4800);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  if (searchInputs.length > 0) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');
    if (keyword) {
      searchInputs[0].value = keyword;
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.getAttribute('data-filter-group') || 'main';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-group="' + group + '"]')).forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterCards();
    });
  });

  function filterCards() {
    var query = '';
    var activeFilter = 'all';
    var input = document.querySelector('[data-search-input]');
    var active = document.querySelector('[data-filter].active');

    if (input) {
      query = input.value.trim().toLowerCase();
    }

    if (active) {
      activeFilter = active.getAttribute('data-filter') || 'all';
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]')).forEach(function (card) {
      var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
      var region = card.getAttribute('data-region') || '';
      var genre = card.getAttribute('data-genre') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'all' || region.indexOf(activeFilter) !== -1 || genre.indexOf(activeFilter) !== -1;
      card.style.display = matchQuery && matchFilter ? '' : 'none';
    });
  }

  filterCards();

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-button');

    if (!video) {
      return;
    }

    function loadSource() {
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
      } else if (!video.src) {
        video.src = source;
      }
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }
      loadSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          player.classList.add('playing');
        }).catch(function () {
          player.classList.remove('playing');
        });
      } else {
        player.classList.add('playing');
      }
    }

    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player || event.target.classList.contains('play-layer')) {
        playVideo(event);
      }
    });

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      player.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('playing');
    });
  });
})();
