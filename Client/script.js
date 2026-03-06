document.addEventListener('DOMContentLoaded', () => {
    const progressLine = document.getElementById('mainProgress');
    const steps = document.querySelectorAll('.step-box');
    
    let targetIndex = 0;
    steps.forEach((step, index) => {
        const status = step.getAttribute('data-status');
        if (status === 'active' || status === 'current') {
            targetIndex = index;
        }
    });

    animateTimeline(targetIndex);

    function animateTimeline(target) {
        let current = 0;
        
        const interval = setInterval(() => {
            if (current > target) {
                clearInterval(interval);
                return;
            }

            const percentage = (current / (steps.length - 1)) * 100;
            progressLine.style.width = percentage + '%';

            const stepBox = steps[current];
            const status = stepBox.getAttribute('data-status');
            const stepText = stepBox.querySelector('.step-text');
            
            // تفعيل النص
            if (stepText) stepText.style.opacity = "1";

            if (status === 'current') {
                stepBox.classList.add('current');
            } else if (status === 'active') {
                stepBox.classList.add('active');
            }

            const icon = stepBox.querySelector('.icon-circle');
            icon.classList.add('icon-pulse');
            setTimeout(() => icon.classList.remove('icon-pulse'), 500);

            current++;
        }, 400); 
    }
});

function logout() {
    localStorage.clear();
    window.location.href = '../Login.html';
}