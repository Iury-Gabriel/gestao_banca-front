import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function loadBanners() {
    const bannerWrapper = document.getElementById('banner-wrapper');
    const isDemo = localStorage.getItem('demo_mode') === 'true';

    if (isDemo) {
        showMockBanners(bannerWrapper);
        return;
    }

    const bannersRef = collection(db, "banners");
    const q = query(bannersRef, where("isActive", "==", true), orderBy("createdAt", "desc"));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            bannerWrapper.innerHTML = `
                <div class="swiper-slide" style="background: var(--card-bg); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                    Nenhuma promoção ativa no momento.
                </div>`;
            return;
        }

        bannerWrapper.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const banner = doc.data();
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';

            const content = banner.link
                ? `<a href="${banner.link}" target="_blank"><img src="${banner.imageUrl}" alt="${banner.title}"></a>`
                : `<a href="https://chat.whatsapp.com/DVYUzb6HY6bJ4XdttDhow9" target="_blank"><img src="${banner.imageUrl}" alt="${banner.title}"></a>`;

            slide.innerHTML = content;
            bannerWrapper.appendChild(slide);
        });

        initSwiper();

    } catch (error) {
        console.error("Error loading banners:", error);
        bannerWrapper.innerHTML = `<div class="swiper-slide">Erro ao carregar banners.</div>`;
    }
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
