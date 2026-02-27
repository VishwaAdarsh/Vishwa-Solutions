/**
 * VISHWA SOLUTIONS — Refactored Main Script
 * All DOM queries wrapped in existence checks.
 * Theme toggle inside DOMContentLoaded.
 * Counter animation with single-run guard.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── MOBILE MENU TOGGLE ──
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking a nav link (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    }

    // ── STICKY HEADER ──
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ── BACK TO TOP ──
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── SMOOTH SCROLL FOR ANCHOR LINKS ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── SCROLL REVEAL (IntersectionObserver, trigger once) ──
    let counterStarted = false;

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);

                // Trigger counter animation once when stats section is visible
                if (entry.target.classList.contains('stats-section') && !counterStarted) {
                    counterStarted = true;
                    startCounters();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // ── COUNTER ANIMATION ──
    function startCounters() {
        const stats = document.querySelectorAll('.stat-item h3');
        if (!stats.length) return;

        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            if (isNaN(target)) return;

            const suffix = stat.innerText.replace(/[0-9]/g, '');
            let count = 0;
            const duration = 2000;
            const increment = target / (duration / 16);

            const updateCount = () => {
                count += increment;
                if (count < target) {
                    stat.innerText = Math.ceil(count) + suffix;
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target + suffix;
                }
            };
            updateCount();
        });
    }

    // ── TESTIMONIAL SLIDER ──
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    if (testimonialCards.length > 0) {
        let currentIdx = 0;
        let slideInterval;

        function updateSlider(index) {
            testimonialCards.forEach(card => card.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            testimonialCards[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentIdx = index;
        }

        function nextSlide() {
            updateSlider((currentIdx + 1) % testimonialCards.length);
        }

        function prevSlide() {
            updateSlider((currentIdx - 1 + testimonialCards.length) % testimonialCards.length);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                updateSlider(idx);
                resetInterval();
            });
        });

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 6000);
        }

        resetInterval();
    }

    // ── THEME TOGGLE ──
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        // Apply saved theme on load
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
            toggleBtn.textContent = '☀️';
        }

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            if (document.body.classList.contains('dark')) {
                toggleBtn.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                toggleBtn.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // ── PREMIUM HERO SLIDER ──
    const heroSlider = document.getElementById('hero-slider');
    if (heroSlider) {
        const slides = heroSlider.querySelectorAll('.hero-slide');
        const dots = heroSlider.querySelectorAll('.hero-dot');
        const progressBar = heroSlider.querySelector('.hero-progress-bar');

        let currentSlide = 0;
        const slideDuration = 5000; // 5 seconds
        let isHovered = false;
        let progressStartTime;
        let remainingTime = slideDuration;
        let animationFrameId;

        // Ensure initial state
        slides.forEach((slide, index) => {
            if (index !== 0) {
                slide.classList.remove('active');
            }
        });

        function updateProgress() {
            if (isHovered) return;

            const now = Date.now();
            const elapsed = now - progressStartTime;

            if (elapsed < remainingTime) {
                const percent = ((slideDuration - remainingTime + elapsed) / slideDuration) * 100;
                if (progressBar) {
                    progressBar.style.width = `${percent}%`;
                }
                animationFrameId = requestAnimationFrame(updateProgress);
            } else {
                nextHeroSlide();
            }
        }

        function startProgress() {
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                // Force reflow
                void progressBar.offsetWidth;
            }

            progressStartTime = Date.now();
            remainingTime = slideDuration;

            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        function pauseProgress() {
            isHovered = true;
            cancelAnimationFrame(animationFrameId);
            if (progressStartTime) {
                remainingTime -= (Date.now() - progressStartTime);
            }
        }

        function resumeProgress() {
            isHovered = false;
            progressStartTime = Date.now();
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        function goToSlide(index) {
            if (index === currentSlide) return;

            const prevIndex = currentSlide;

            // Current slide fades out
            slides[prevIndex].classList.remove('active');
            slides[prevIndex].classList.add('fade-out');
            dots[prevIndex].classList.remove('active');

            // New slide activates
            currentSlide = index;
            slides[currentSlide].classList.remove('fade-out');
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            // Cleanup fade-out class after transition (800ms)
            setTimeout(() => {
                slides[prevIndex].classList.remove('fade-out');
            }, 800);

            startProgress();
        }

        function nextHeroSlide() {
            goToSlide((currentSlide + 1) % slides.length);
        }

        // Initialize Dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        // Hover Pause (Desktop only)
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            heroSlider.addEventListener('mouseenter', pauseProgress);
            heroSlider.addEventListener('mouseleave', resumeProgress);
        }

        // Start Initial Timer
        startProgress();
    }

    // ── CONTACT FORM SUBMISSION (only on contact page) ──
    const form = document.getElementById('contactForm');
    if (form) {
        const scriptURL = "https://script.google.com/macros/s/AKfycbzLrbcE1nOCpPruNvNsdm06EU0KSehLvErMP3Anq6ZypbssmNxUo8Wi4HAIMSWq0ZoU/exec";

        form.addEventListener('submit', e => {
            e.preventDefault();

            fetch(scriptURL, {
                method: 'POST',
                body: new FormData(form)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const modal = document.getElementById('successModal');
                        if (modal) {
                            modal.style.display = 'flex';
                            form.reset();
                            setTimeout(() => {
                                modal.style.display = 'none';
                            }, 3000);
                        }
                    } else {
                        alert('Submission failed');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Error! Please try again');
                });
        });
    }

    // ── GALLERY LIGHTBOX (only on gallery page) ──
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        document.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', () => {
                const img = card.querySelector('img');
                if (img && lightboxImg) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt;
                    lightbox.classList.add('active');
                }
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // ── GALLERY FILTER (only on gallery page) ──
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card[data-category]');

    if (filterBtns.length > 0 && galleryCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                galleryCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

});
