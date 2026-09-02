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

    function closeMobileMenu() {
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (mobileBtn) {
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    }

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open', isOpen);
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (isOpen) {
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
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
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
        const primaryApiURL = "/api/enquiry";
        const fallbackScriptURL = "https://script.google.com/macros/s/AKfycbzLrbcE1nOCpPruNvNsdm06EU0KSehLvErMP3Anq6ZypbssmNxUo8Wi4HAIMSWq0ZoU/exec";

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';

            // 1. Client-side input validation
            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            const emailInput = form.querySelector('input[name="email"]');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';

            if (nameVal.length < 2) {
                alert('Please enter your full name.');
                if (nameInput) nameInput.focus();
                return;
            }

            const phoneDigits = phoneVal.replace(/[^0-9+]/g, '');
            if (phoneDigits.length < 7) {
                alert('Please enter a valid contact phone number.');
                if (phoneInput) phoneInput.focus();
                return;
            }

            if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                alert('Please enter a valid email address, or leave it blank.');
                if (emailInput) emailInput.focus();
                return;
            }

            // 2. Set Loading State (prevent duplicate submissions)
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
                submitBtn.style.opacity = '0.8';
                submitBtn.style.cursor = 'not-allowed';
            }

            function restoreButton() {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.style.opacity = '';
                    submitBtn.style.cursor = '';
                }
            }

            function showSuccessModal() {
                const modal = document.getElementById('successModal');
                if (modal) {
                    modal.style.display = 'flex';
                    form.reset();
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 4000);
                }
            }

            // 3. Construct form payload
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            try {
                // Try primary serverless backend (/api/enquiry)
                const response = await fetch(primaryApiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                // If the primary endpoint exists (2xx or 4xx/5xx returned by handler)
                if (response.status !== 404 && response.status !== 405) {
                    const result = await response.json();
                    if (response.ok && result.status === 'success') {
                        showSuccessModal();
                    } else if (result.status === 'partial') {
                        showSuccessModal();
                    } else {
                        alert(result.message || 'Unable to submit enquiry right now. Please try again or call us at +91 9819215853 / +91 9773725281.');
                    }
                    restoreButton();
                    return;
                }

                // If 404 (static preview without serverless runtime), fallback directly to Google Apps Script
                console.info('[Enquiry] Serverless endpoint not available on this host. Using direct Google Sheets fallback.');
                const fallbackResponse = await fetch(fallbackScriptURL, {
                    method: 'POST',
                    body: formData
                });
                const fallbackData = await fallbackResponse.json();

                if (fallbackData.status === 'success') {
                    showSuccessModal();
                } else {
                    alert('Submission failed. Please call us directly at +91 9819215853 / +91 9773725281.');
                }
            } catch (err) {
                console.warn('[Enquiry] Primary API request failed, attempting direct Google Apps Script fallback...', err);

                // Fallback attempt in case of network issue reaching /api/enquiry
                try {
                    const fallbackResponse = await fetch(fallbackScriptURL, {
                        method: 'POST',
                        body: formData
                    });
                    const fallbackData = await fallbackResponse.json();

                    if (fallbackData.status === 'success') {
                        showSuccessModal();
                    } else {
                        alert('Unable to submit enquiry right now. Please try again or contact us directly at +91 9819215853 / +91 9773725281.');
                    }
                } catch (fallbackErr) {
                    console.error('[Enquiry Fatal Error]', fallbackErr);
                    alert('Unable to submit your enquiry right now. Please try again or contact us directly at +91 9819215853 / +91 9773725281.');
                }
            } finally {
                restoreButton();
            }
        });
    }

    // ── GALLERY LIGHTBOX (only on gallery page) ──
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        function openLightbox(img) {
            if (img && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || 'Gallery Preview';
                lightbox.classList.add('active');
                document.body.classList.add('lightbox-open');
            }
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
        }

        document.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', () => {
                const img = card.querySelector('img');
                openLightbox(img);
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                closeLightbox();
            });
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
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
