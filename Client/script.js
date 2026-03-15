const API_BASE = 'https://localhost:7203/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchHeaderData();
});

async function fetchHeaderData() {
    const token = localStorage.getItem('token');
    if (!token) { logout(); return; }

    try {
        const response = await fetch(`${API_BASE}/ClientDashboard/header`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // 1. تحديث بيانات الهيدر (الكروت اللي فوق)
            document.getElementById('clientName').innerText = data.clientName || 'غير متوفر';
            document.getElementById('projectName').innerText = data.projectName || '--';
            document.getElementById('unitInfo').innerText = `${data.unitNumber} - الدور ${data.floorNumber}`;
            document.getElementById('deliveryDate').innerText = data.deliveryDate || '--';

            // 2. تحديث حالة الحساب
            const statusText = document.getElementById('accountStatusText');
            const statusDot = document.getElementById('statusDot');
            if (data.accountStatus) {
                statusText.innerText = 'حساب نشط';
                statusDot.style.backgroundColor = '#10b981';
            } else {
                statusText.innerText = 'غير نشط';
                statusDot.style.backgroundColor = '#ef4444';
            }

            // 3. تحديث التايم لاين مع الحفاظ على الأيقونات
            updateTimelineUI(data.buildingTimeLineReadDtos);

        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('حدث خطأ:', error);
    }
}

function updateTimelineUI(stages) {
    const steps = document.querySelectorAll('.step-box');
    const progressLine = document.getElementById('mainProgress');
    
    let targetIndex = 0;

    stages.forEach((stage, index) => {

        if (steps[index]) {
            const stepBox = steps[index];
            
            stepBox.setAttribute('data-status', stage.status);
            
            const titleElement = stepBox.querySelector('.step-text b');
            const dateElement = stepBox.querySelector('.step-text span');

            stepBox.onclick = () => openGallery(stage.stageNumber, stage.stageDisplayName);
            
            if (titleElement) titleElement.innerText = stage.stageDisplayName;
            if (dateElement) dateElement.innerText = stage.dateText;


            if (stage.status === 'active' || stage.status === 'current') {
                targetIndex = index;
            }
        }
    });

    animateTimeline(targetIndex, steps, progressLine);
}

function animateTimeline(target, steps, progressLine) {
    let current = 0;
    const interval = setInterval(() => {
        if (current > target) {
            clearInterval(interval);
            return;
        }

        const percentage = (current / (steps.length - 1)) * 100;
        if (progressLine) progressLine.style.width = percentage + '%';

        const stepBox = steps[current];
        const status = stepBox.getAttribute('data-status');
        const stepText = stepBox.querySelector('.step-text');
        
        if (stepText) stepText.style.opacity = "1";

        if (status === 'current') {
            stepBox.classList.add('current');
        } else if (status === 'active') {
            stepBox.classList.add('active');
        }

        current++;
    }, 400); 
}

let galleryModal;
document.addEventListener('DOMContentLoaded', () => {
    galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
});

function openGallery(stageId, stageTitle) {
    const container = document.getElementById('imagesContainer');
    document.getElementById('modalStageTitle').innerText = `صور | ${stageTitle}`;
    
    // تنظيف الحاوية
    container.innerHTML = '';
    
    const placeholderImages = [
        "https://placehold.co/600x400?text=Image+1",
        "https://placehold.co/600x400?text=Image+2",
        "https://placehold.co/600x400?text=Image+3"
    ];

    placeholderImages.forEach(imgUrl => {
        const div = document.createElement('div');
        div.className = 'col-6 col-md-4';
        div.innerHTML = `
            <div class="img-wrapper" onclick="window.open('${imgUrl}', '_blank')">
                <img src="${imgUrl}" alt="Stage Image">
            </div>
        `;
        container.appendChild(div);
    });

    galleryModal.show();
}

function logout() {
    localStorage.clear();
    window.location.href = '../Login.html';
}