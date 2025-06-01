// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 汉堡菜单交互逻辑
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', (event) => {
            if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    // 移动端下拉菜单处理
    const dropdownToggles = document.querySelectorAll('.nav-item > a');
    
    dropdownToggles.forEach(toggle => {
        if (toggle.querySelector('.dropdown-icon')) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const dropdown = this.nextElementSibling;
                    const isActive = dropdown.classList.contains('active');
                    
                    // 关闭所有其他下拉菜单
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== dropdown) {
                            menu.classList.remove('active');
                        }
                    });
                    
                    // 切换当前下拉菜单
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // 图片轮播功能
    const carousel = document.getElementById('carousel');
    const indicators = document.querySelectorAll('.indicator');
    
    if (carousel && indicators.length > 0) {
        let currentSlide = 0;
        const slideCount = 2; // 两张图片
        
        // 更新指示器状态
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
        
        // 切换到下一张图片
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            carousel.style.transform = `translateX(-${currentSlide * 50}%)`;
            updateIndicators();
        }
        
        // 设置自动轮播
        setInterval(nextSlide, 5000);
        
        // 初始更新指示器
        updateIndicators();
        
        // 点击指示器切换图片
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                currentSlide = parseInt(indicator.getAttribute('data-index'));
                carousel.style.transform = `translateX(-${currentSlide * 50}%)`;
                updateIndicators();
            });
        });
    }
});