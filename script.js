document.addEventListener('DOMContentLoaded', () => {
    // Typewriter (Daktilo) ve Giriş Ekranı Efekti
    const introScreen = document.getElementById('intro-screen');
    const typewriterElement = document.getElementById('typewriter-text');
    const textToType = "Efe Meriç Tunalı";
    let typeIndex = 0;

    function typeWriter() {
        if (typeIndex < textToType.length) {
            typewriterElement.textContent += textToType.charAt(typeIndex);
            typeIndex++;
            // Harf başına bekleme süresi (doğal klavye hissi için rastgelelik eklendi)
            const typingSpeed = Math.random() * 60 + 40; 
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Yazı tamamlandıktan sonra biraz bekleyip ekranı gizle
            setTimeout(() => {
                introScreen.classList.add('hidden');
                
                // Animasyon 1.5 saniye sürüyor. Tamamen bittiğinde sitenin içeriğini göster
                setTimeout(() => {
                    document.body.classList.add('show-content');
                    // Tüm site içeriği görünür olduktan sonra diğer animasyonların başlaması için bir olay tetikle
                    document.dispatchEvent(new Event('introFinished'));
                }, 1500);
            }, 1000);
        }
    }

    // Animasyonu sayfaya girer girmez yarım saniye bekleyerek başlat
    setTimeout(typeWriter, 500);

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Yalnızca bir kere animasyon oynasın
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Antigravity Stili Grid Animasyonu (Fare Takibi)
    const canvas = document.createElement('canvas');
    canvas.id = 'trailCanvas';
    document.querySelector('.container').before(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const particles = [];
    const spacing = 25; // Noktalar arası boşluk

    function initGrid() {
        particles.length = 0;
        for (let x = 0; x < width + spacing; x += spacing) {
            for (let y = 0; y < height + spacing; y += spacing) {
                particles.push({
                    originX: x,
                    originY: y,
                    x: x,
                    y: y
                });
            }
        }
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initGrid();
    });

    initGrid();

    // Antigravity sitesindeki etkinin %75'i büyüklüğünde bir etki alanı (yaklaşık 120px)
    const effectRadius = 120; 

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            const dx = mouse.x - p.originX;
            const dy = mouse.y - p.originY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetX = p.originX;
            let targetY = p.originY;
            let lightness = 15; // Zemin rengine uygun çok koyu gri
            let currentSize = 1;

            if (dist < effectRadius) {
                // Mouse'a olan uzaklığa göre etki gücü
                const force = Math.pow((effectRadius - dist) / effectRadius, 1.2);
                
                // Noktaların mouse'a doğru çekilmesi (Gravity / Takip efekti)
                const pullStrength = 0.4;
                targetX = p.originX + (dx * force * pullStrength);
                targetY = p.originY + (dy * force * pullStrength);

                // Mouse etrafındaki noktaların parlaması (Grinin daha açık tonları)
                lightness = 15 + (force * 65); 
                currentSize = 1 + (force * 1.5);
            }

            // Noktaların yumuşak bir şekilde hedefe ilerlemesi
            p.x += (targetX - p.x) * 0.15;
            p.y += (targetY - p.y) * 0.15;

            ctx.beginPath();
            ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    
    animate();

    // Dinamik Kaydırma Çubuğu (Scroll Indicator)
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator-fixed';
    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        // Maksimum kaydırma miktarını buluyoruz
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        if (maxScroll <= 0) return;

        const ratio = scrollPos / maxScroll; // 0 ile 1 arası
        const highlightPos = ratio * 100;

        // Yukarıdayken alt kısım soluk (0), aşağı indikçe alt kısım netleşir (1).
        const maskGradient = `linear-gradient(to bottom, 
            rgba(0,0,0, ${1 - ratio}) 0%, 
            rgba(0,0,0, 1) ${highlightPos}%, 
            rgba(0,0,0, ${ratio}) 100%
        )`;

        scrollIndicator.style.webkitMaskImage = maskGradient;
        scrollIndicator.style.maskImage = maskGradient;
    });

    // İlk yüklendiğinde pozisyonu ayarlamak için tetikle
    window.dispatchEvent(new Event('scroll'));
});

// SVG Kenarlık Animasyonu Mantığı
window.addEventListener('load', () => {
    const fieldsets = document.querySelectorAll('fieldset.glass-panel');
    const wrappersToObserve = [];
    
    // Observer ile ekrana girenleri anime et
    const borderObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const path = entry.target.querySelector('.border-path');
                if (path && !path.dataset.animating) {
                    path.dataset.animating = 'true';
                    
                    const length = path.getTotalLength() + 50;

                    function playAnimation() {
                        // Animasyonu gizli (başlangıç) konumuna çek
                        path.style.transition = 'none';
                        path.style.strokeDashoffset = length;

                        // Kısa bir süre sonra geçişi açarak çizimi başlat
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                path.style.transition = ''; // CSS'te tanımlanan transition kurallarına geri dön
                                path.style.strokeDashoffset = '0';
                            });
                        });
                    }

                    // İlk animasyonu başlat (sadece 1 kez)
                    playAnimation();
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fieldsets.forEach(fieldset => {
        const legend = fieldset.querySelector('legend');
        if (!legend) return;

        // Kutunun Dış Ölçüleri
        const w = fieldset.offsetWidth;
        const h = fieldset.offsetHeight;
        const r = 24; // CSS border-radius

        // Başlığın tam ortasından çizgi geçmesi için Y ekseni hesabı (gerçek fieldset çizgisi konumu)
        const top_y = legend.offsetHeight / 2;
        
        // Dış köşelerin koordinatları (çizgi tam merkeze oturacak şekilde 0.5px içeride)
        const y_top = top_y;
        const y_bot = h - 0.5;
        const x_l = 0.5;
        const x_r = w - 0.5;

        // Başlık boşluğu için X koordinatları
        const l_left = legend.offsetLeft;
        const l_right = legend.offsetLeft + legend.offsetWidth;

        // SVG Oluşturma
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'border-svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'border-path');

        // Çizim Yolu (Metnin sağından başlayıp saat yönünde sola doğru tam bir tur)
        const d = `
            M ${l_right} ${y_top} 
            L ${x_r - r} ${y_top} 
            A ${r} ${r} 0 0 1 ${x_r} ${y_top + r} 
            L ${x_r} ${y_bot - r} 
            A ${r} ${r} 0 0 1 ${x_r - r} ${y_bot} 
            L ${x_l + r} ${y_bot} 
            A ${r} ${r} 0 0 1 ${x_l} ${y_bot - r} 
            L ${x_l} ${y_top + r} 
            A ${r} ${r} 0 0 1 ${x_l + r} ${y_top} 
            L ${l_left} ${y_top}
        `;
        path.setAttribute('d', d.trim().replace(/\s+/g, ' '));
        
        svg.appendChild(path);

        // Fieldset içerisindeki padding etkilerinden kaçınmak için fieldset'i dışarıdan div ile sarıyoruz
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        fieldset.parentNode.insertBefore(wrapper, fieldset);
        wrapper.appendChild(fieldset);
        wrapper.appendChild(svg); // SVG artık kutunun tam üstünde, dışarıdan sarıyor

        // Çizim uzunluğunu alıp kalemi başlangıca (gizli duruma) çek (buffer ekliyoruz boşluk kalmasın diye)
        const length = path.getTotalLength();
        path.style.strokeDasharray = length + 50;
        path.style.strokeDashoffset = length + 50;

        // Her SVG wrapper'ını kaydet
        wrappersToObserve.push(wrapper);
    });

    // İlk ekrandaki kutuların animasyonlarının siyah intro ekranının arkasında boş yere oynatılmasını 
    // engellemek için intro animasyonunun tamamen bitmesini (veya sitenin zaten açık olmasını) bekliyoruz.
    function startBorderAnimations() {
        wrappersToObserve.forEach(wrapper => borderObserver.observe(wrapper));
    }

    if (document.body.classList.contains('show-content')) {
        startBorderAnimations();
    } else {
        document.addEventListener('introFinished', startBorderAnimations);
    }
});
