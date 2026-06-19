(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
    }
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !type || card.getAttribute("data-type") === type;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matched = matchKeyword && matchType && matchYear;
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    input.addEventListener("input", apply);
    if (typeFilter) {
      typeFilter.addEventListener("change", apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", apply);
    }
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();
