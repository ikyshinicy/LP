document.addEventListener('DOMContentLoaded', () => {

    // ================= 1. Sinkronisasi Teks (Hero/About) dari Admin =================
    function applyDynamicContent() {
        const elements = ['heroTitle', 'heroDesc', 'aboutTitle', 'aboutDesc'];
        elements.forEach(id => {
            const savedText = localStorage.getItem('nami_' + id);
            if (savedText) {
                const el = document.getElementById('display_' + id);
                if (el) el.innerText = savedText;
            }
        });
    }
    applyDynamicContent();

    // ================= 2. Data Default (fallback kalau admin belum isi apa-apa) =================
    const defaultProducts = [
        { id: 'default-1', name: 'Buket Bunga (Florist)', desc: 'Rangkaian bunga segar atau artifisial dengan kertas wrapping premium bernuansa pastel.', price: 'Mulai dari Rp 150.000', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'default-2', name: 'Buket Uang (Money Bouquet)', desc: 'Hadiah praktis yang disulap menjadi elegan dan mewah. Tersedia berbagai nominal dan desain.', price: 'Mulai dari Rp 200.000', image: 'https://images.unsplash.com/photo-1628148811822-2616ecb1ebc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'default-3', name: 'Buket Snack & Custom', desc: 'Paduan jajanan favorit atau hadiah custom lainnya yang dibalut estetik untuk si dia.', price: 'Mulai dari Rp 120.000', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
    ];

    const WA_NUMBER = '6282128728726';
    function buildWaLink(productName) {
        const text = `Halo Nami Craft, saya ingin pesan ${productName}`;
        return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    }

    function getData(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
        } catch (e) {
            return fallback;
        }
    }

    // ================= 3. Render Produk =================
    function renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        const products = getData('nami_products', defaultProducts);
        grid.innerHTML = products.map((p, i) => `
            <div class="card animate-on-scroll" style="transition-delay: ${i * 0.2}s;">
                <div class="card-img-wrapper">
                    <div class="card-img" style="background-image:url('${escapeHtml(p.image)}');"></div>
                </div>
                <div class="card-content">
                    <h3>${escapeHtml(p.name)}</h3>
                    <p style="font-size: 0.95rem; color: #666;">${escapeHtml(p.desc)}</p>
                    <span class="price-tag">${escapeHtml(p.price)}</span>
                    <span class="price-note">Harga dapat berubah sewaktu-waktu, hubungi kami untuk info terbaru</span>
                    <a href="${buildWaLink(p.name)}" target="_blank" class="btn btn-wa" style="display:inline-block; margin-top:12px;">Pesan via WhatsApp</a>
                </div>
            </div>
        `).join('');
        observeScrollAnimations();
    }

    // ================= 4. Render Video (TikTok style, autoplay saat terlihat) =================
    function renderVideos() {
        const section = document.getElementById('konten');
        const grid = document.getElementById('videoGrid');
        if (!grid || !section) return;
        const videos = getData('nami_videos', []);
        if (videos.length === 0) {
            section.style.display = 'none';
            return;
        }
        section.style.display = 'block';
        grid.innerHTML = videos.map(v => `
            <div class="video-card animate-on-scroll" data-video-card>
                <video src="${escapeHtml(v.url)}" muted loop playsinline preload="metadata"></video>
                <button class="video-mute-toggle" type="button" aria-label="Suara">🔇</button>
                ${v.caption ? `<p class="video-caption">${escapeHtml(v.caption)}</p>` : ''}
            </div>
        `).join('');

        // Toggle mute/unmute per video saat card diklik
        grid.querySelectorAll('.video-card').forEach(card => {
            const video = card.querySelector('video');
            const btn = card.querySelector('.video-mute-toggle');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                btn.textContent = video.muted ? '🔇' : '🔊';
            });
        });

        // Autoplay hanya saat video masuk viewport (seperti TikTok/Reels)
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (!video) return;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.6 });

        grid.querySelectorAll('.video-card').forEach(card => videoObserver.observe(card));
        observeScrollAnimations();
    }


    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ================= 6. Animasi Scroll (re-usable, dipanggil ulang tiap render) =================
    let scrollObserver;
    function observeScrollAnimations() {
        if (!scrollObserver) {
            scrollObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { root: null, rootMargin: '0px', threshold: 0.15 });
        }
        document.querySelectorAll('.animate-on-scroll:not(.is-visible)').forEach(el => scrollObserver.observe(el));
    }

    renderProducts();
    renderVideos();
    observeScrollAnimations();

    // ================= 7. Bunga Jatuh =================
    const flowerContainer = document.getElementById('flower-container');
    const flowers = ['🌸', '🌺', '🌼', '✨', '🍂'];
    function createFlower() {
        if (!flowerContainer) return;
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.innerText = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.left = Math.random() * 100 + 'vw';
        flower.style.fontSize = (Math.random() * 20 + 10) + 'px';
        flower.style.animationDuration = (Math.random() * 10 + 5) + 's';
        flowerContainer.appendChild(flower);
        setTimeout(() => flower.remove(), 15000);
    }
    setInterval(createFlower, 500);

    // ================= 8. Interactive Logo =================
    const logo = document.querySelector('.brand-logo');
    if (logo) {
        logo.addEventListener('mouseover', () => logo.textContent = "✨ Nami Craft ✨");
        logo.addEventListener('mouseout', () => logo.textContent = "Nami Craft");
    }

    // ================= 9. Hidden Admin Access - Triple click judul footer =================
    const footerTrigger = document.getElementById('footerTrigger');
    if (footerTrigger) {
        let clickCount = 0;
        let clickTimer = null;
        footerTrigger.style.cursor = 'default';
        footerTrigger.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => { clickCount = 0; }, 800);
            }
            if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                window.location.href = 'login.html';
            }
        });
    }
});
