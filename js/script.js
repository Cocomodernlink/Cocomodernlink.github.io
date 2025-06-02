document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        document.addEventListener('click', (event) => {
            if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    const dropdownToggles = document.querySelectorAll('.nav-item > a');
    
    dropdownToggles.forEach(toggle => {
        if (toggle.querySelector('.dropdown-icon')) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = this.nextElementSibling;
                    const isActive = dropdown.classList.contains('active');
                    
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== dropdown) {
                            menu.classList.remove('active');
                        }
                    });
                    
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    const carousel = document.getElementById('carousel');
    const indicators = document.querySelectorAll('.indicator');
    
    if (carousel && indicators.length > 0) {
        let currentSlide = 0;
        const slideCount = 2;
        
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            carousel.style.transform = `translateX(-${currentSlide * 50}%)`;
            updateIndicators();
        }
        
        setInterval(nextSlide, 5000);
        
        updateIndicators();
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                currentSlide = parseInt(indicator.getAttribute('data-index'));
                carousel.style.transform = `translateX(-${currentSlide * 50}%)`;
                updateIndicators();
            });
        });
    }
});