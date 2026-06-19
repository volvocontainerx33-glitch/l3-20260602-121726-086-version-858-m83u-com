(function () {
    const video = document.querySelector('.movie-player');
    const trigger = document.querySelector('[data-play-trigger]');

    if (!video) {
        return;
    }

    const source = video.getAttribute('data-src');
    let ready = false;

    function loadVideo() {
        if (ready || !source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        ready = true;
    }

    function startVideo() {
        loadVideo();
        if (trigger) {
            trigger.classList.add('hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (trigger) {
        trigger.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
        if (!ready) {
            startVideo();
        }
    });

    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('hidden');
        }
    });

    video.addEventListener('loadedmetadata', function () {
        video.controls = true;
    });
})();
