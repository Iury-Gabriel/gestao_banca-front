async function loadBanners() {
    const bannerWrapper = document.getElementById('banner-wrapper');
    
    // Mostra o banner fixo da pasta local conforme solicitado
    bannerWrapper.innerHTML = `
        <div class="swiper-slide">
            <a href="https://chat.whatsapp.com/DVYUzb6HY6bJ4XdttDhow9" target="_blank">
                <img src="banner/banner.PNG" alt="Banner BACBO">
            </a>
        </div>`;

    initSwiper();
}

function showMockBanners(bannerWrapper) {
    bannerWrapper.innerHTML = `
        <div class="swiper-slide">
            <a href="https://chat.whatsapp.com/DVYUzb6HY6bJ4XdttDhow9" target="_blank">
                <img src="banner/banner.PNG" alt="Banner BACBO">
            </a>
        </div>
        <div class="swiper-slide">
            <a href="https://chat.whatsapp.com/DVYUzb6HY6bJ4XdttDhow9" target="_blank">
                <img src="banner/banner.PNG" alt="Banner BACBO 2">
            </a>
        </div>`;

    initSwiper();
}

function initSwiper() {
    new Swiper('.banner-carousel', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        grabCursor: true,
    });
}

// Start loading banners
loadBanners();
