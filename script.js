// Honey bottle loading animation
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('main-content');
    const honeyFill = document.getElementById('honeyFill');
    
    let fillLevel = 0;
    const fillDuration = 2000; // 2 seconds
    const fillInterval = 16; // ~60fps
    const fillIncrement = 100 / (fillDuration / fillInterval);
    
    // Animate honey filling
    const fillAnimation = setInterval(() => {
        fillLevel += fillIncrement;
        if (fillLevel >= 100) {
            fillLevel = 100;
            clearInterval(fillAnimation);
            
            // Wait a moment, then fade out loader and show content
            setTimeout(() => {
                loader.classList.add('hidden');
                mainContent.classList.remove('hidden');
            }, 300);
        }
        honeyFill.style.height = fillLevel + '%';
    }, fillInterval);
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});


