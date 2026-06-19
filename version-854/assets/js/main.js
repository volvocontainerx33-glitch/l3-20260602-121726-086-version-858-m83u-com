(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const menuPanel = document.querySelector('[data-menu-panel]');

    if (menuToggle && menuPanel) {
        menuToggle.addEventListener('click', function () {
            menuPanel.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dotsBox = hero.querySelector('[data-hero-dots]');
        let activeIndex = 0;

        function setActive(index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            if (dotsBox) {
                Array.from(dotsBox.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === activeIndex);
                });
            }
        }

        if (dotsBox) {
            slides.forEach(function (_, index) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张推荐');
                dot.addEventListener('click', function () {
                    setActive(index);
                });
                dotsBox.appendChild(dot);
            });
        }

        setActive(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                setActive((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    const form = document.querySelector('[data-search-form]');
    const results = document.querySelector('[data-search-results]');

    if (form && results) {
        let searchIndex = [];
        const basePath = location.pathname.includes('/movies/') || location.pathname.includes('/categories/') ? '../' : '';

        fetch(basePath + 'assets/data/search-index.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (items) {
                searchIndex = items;
            })
            .catch(function () {
                searchIndex = [];
            });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const keyword = input ? input.value.trim().toLowerCase() : '';
            results.innerHTML = '';

            if (!keyword) {
                return;
            }

            const matched = searchIndex.filter(function (item) {
                const text = [item.title, item.year, item.region, item.type, item.genre, item.summary, item.tags.join(' ')].join(' ').toLowerCase();
                return text.includes(keyword);
            }).slice(0, 12);

            if (matched.length === 0) {
                results.innerHTML = '<div class="search-result-item"><strong>未找到匹配影片</strong><span>可以尝试输入年份、地区、类型或更短的关键词。</span></div>';
                return;
            }

            matched.forEach(function (item) {
                const link = document.createElement('a');
                link.className = 'search-result-item';
                link.href = basePath + item.url;
                link.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</span>';
                results.appendChild(link);
            });
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();
