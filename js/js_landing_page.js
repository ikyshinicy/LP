document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic sinkronisasi dengan localStorage (dari Admin)
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

    // 2. Logic Bunga Jatuh
    const flowerContainer = document.getElementById('flower-container');
    const flowers = ['🌸', '🌺', '🌼', '✨', '🍂'];
    function createFlower() {
        if(!flowerContainer) return;
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

    // 3. Logic Animasi Scroll
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    // 4. Interactive Logo
    const logo = document.querySelector('.brand-logo');
    if(logo){
        logo.addEventListener('mouseover', () => logo.textContent = "✨ Nami Craft ✨");
        logo.addEventListener('mouseout', () => logo.textContent = "Nami Craft");
    }
});