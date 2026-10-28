// 宸欣互聯：頁面動態效果
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);

    const toTop = document.createElement("button");
    toTop.className = "to-top";
    toTop.setAttribute("aria-label", "回到頂端");
    toTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(toTop);

    // 捲動時：導覽列縮小、頂部燙金進度條、回到頂端按鈕
    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle("scrolled", y > 40);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        toTop.classList.toggle("show", y > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 捲動進場：同一組裡的元素依序浮現
    const groups = [
        ".section-title",
        ".about p",
        ".service-card",
        ".brand-marquee",
        ".works-intro, .works-tabs",
        ".org-chart .node",
        ".contact-slogan-block",
        ".contact-info, .contact-form",
    ];
    groups.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add("reveal");
            el.style.transitionDelay = `${Math.min(i, 12) * 0.08}s`;
        });
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("in-view");
                revealObserver.unobserve(el);
                // 進場結束後拿掉動畫用的 class，還原元素本身的 hover 效果
                if (el.classList.contains("reveal")) {
                    const delay = parseFloat(el.style.transitionDelay) || 0;
                    setTimeout(() => {
                        el.classList.remove("reveal", "in-view");
                        el.style.transitionDelay = "";
                    }, delay * 1000 + 900);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal, .process-steps, .works-panels").forEach((el) => revealObserver.observe(el));

    // 核心服務：展開 / 收合完整說明
    document.querySelectorAll(".service-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const open = btn.closest(".service-card").classList.toggle("open");
            btn.setAttribute("aria-expanded", open);
            btn.firstChild.textContent = open ? "收合" : "了解更多";
        });
    });

    // 設計作品：分類頁籤切換
    const tabs = document.querySelectorAll(".works-tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => {
                const selected = t === tab;
                t.classList.toggle("active", selected);
                t.setAttribute("aria-selected", selected);
                document.getElementById(t.getAttribute("aria-controls")).classList.toggle("active", selected);
            });
        });
    });

    // 設計作品：點擊放大圖片，影音作品播放影片
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="關閉"><i class="fa-solid fa-xmark"></i></button><div class="lightbox-body"></div>';
    document.body.appendChild(lightbox);
    const lightboxBody = lightbox.querySelector(".lightbox-body");

    const closeLightbox = () => {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
        setTimeout(() => (lightboxBody.innerHTML = ""), 400); // 清掉 iframe，影片才會停止
    };
    lightbox.addEventListener("click", (e) => {
        if (!e.target.closest(".lightbox-body img, .lightbox-body iframe")) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });

    document.querySelectorAll(".work-item").forEach((item) => {
        const img = item.querySelector(".work-thumb img");
        const video = item.dataset.video;
        if (!img && !video) return; // 還是佔位框的作品不開燈箱
        item.classList.add("clickable");
        item.tabIndex = 0;
        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter") item.click();
        });
        item.addEventListener("click", () => {
            if (video) {
                const src = video + (video.includes("?") ? "&" : "?") + "autoplay=1";
                lightboxBody.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
            } else {
                lightboxBody.innerHTML = `<img src="${img.src}" alt="${img.alt}" />`;
            }
            lightbox.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    });

    // 導覽列：標示目前所在的區塊
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
            });
        },
        { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

    // 核心服務卡片：滑鼠移動時微微傾斜，並帶一道跟著游標的光
    if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
        document.querySelectorAll(".service-card").forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                card.style.setProperty("--mx", `${x * 100}%`);
                card.style.setProperty("--my", `${y * 100}%`);
                card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-6px)`;
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }
});
