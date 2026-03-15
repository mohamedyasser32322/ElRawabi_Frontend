// Configuration
const API_BASE = 'https://localhost:7203/api';
let token = localStorage.getItem('token') || 'demo-token';

// Data Storage
let allProjects = [];
let allBuildings = [];
let allApartments = [];
let allUsers = [];

// Load Layout
fetch('layout.html')
    .then(res => res.text())
    .then(html => {
        const layoutRoot = document.getElementById('layout-root');
        if (layoutRoot) layoutRoot.innerHTML = html;

        // Set active menu
        const menuDash = document.getElementById('menu-Dashboard.html');
        if (menuDash) menuDash.classList.add('active');

        // Set header title
        const headerBar = document.querySelector('.header-bar');
        if (headerBar) {
            headerBar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #1a252f;">لوحة التحكم الرئيسية</h2>
                </div>
            `;
        }

        // Set logout button
        const logoutBtn = document.getElementById('layout-logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.clear();
                window.location.href = '../Login.html';
            };
        }

        // Render dashboard content
        const renderBody = document.getElementById('render-body');
        if (renderBody) {
            renderBody.innerHTML = `
                <style>
                    .dashboard-content {
                        flex: 1;
                        overflow-y: auto;
                        padding: 30px;
                    }

                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }

                    .stat-card {
                        background: #fff;
                        border-radius: 16px;
                        padding: 25px;
                        border: 1px solid #eef0f2;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                    }

                    .stat-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                        border-color: #b38e44;
                    }

                    .stat-icon {
                        width: 60px;
                        height: 60px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        flex-shrink: 0;
                    }

                    .stat-icon.projects {
                        background: #fef3c7;
                        color: #b38e44;
                    }

                    .stat-icon.buildings {
                        background: #dbeafe;
                        color: #3b82f6;
                    }

                    .stat-icon.apartments {
                        background: #dcfce7;
                        color: #10b981;
                    }

                    .stat-icon.users {
                        background: #fecaca;
                        color: #ef4444;
                    }

                    .stat-content h3 {
                        font-size: 14px;
                        color: #64748b;
                        margin: 0 0 8px 0;
                        font-weight: 600;
                    }

                    .stat-content .number {
                        font-size: 32px;
                        font-weight: 800;
                        color: #1a252f;
                        margin: 0;
                    }

                    .charts-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }

                    .chart-container {
                        background: #fff;
                        border-radius: 16px;
                        padding: 25px;
                        border: 1px solid #eef0f2;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                    }

                    .chart-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a252f;
                        margin-bottom: 20px;
                    }

                    .quick-actions {
                        background: #fff;
                        border-radius: 16px;
                        padding: 25px;
                        border: 1px solid #eef0f2;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                    }

                    .quick-actions-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a252f;
                        margin-bottom: 20px;
                    }

                    .actions-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                    }

                    .action-btn {
                        background: linear-gradient(135deg, #b38e44, #d4a574);
                        color: #fff;
                        border: none;
                        padding: 15px 20px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        transition: all 0.3s ease;
                        text-decoration: none;
                    }

                    .action-btn:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 16px rgba(179, 142, 68, 0.3);
                        color: #fff;
                    }

                    .action-btn i {
                        font-size: 20px;
                    }

                    .recent-section {
                        background: #fff;
                        border-radius: 16px;
                        padding: 25px;
                        border: 1px solid #eef0f2;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                        margin-top: 20px;
                    }

                    .recent-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a252f;
                        margin-bottom: 20px;
                    }

                    .table-wrapper {
                        overflow-x: auto;
                    }

                    .table {
                        margin: 0;
                        width: 100%;
                    }

                    .table thead {
                        background: #f4f7f6;
                        border-bottom: 2px solid #eef0f2;
                    }

                    .table th {
                        color: #1a252f;
                        font-weight: 700;
                        padding: 16px;
                        border: none;
                    }

                    .table td {
                        padding: 16px;
                        border-color: #eef0f2;
                        vertical-align: middle;
                    }

                    .table tbody tr:hover {
                        background-color: #f9f9f9;
                    }

                    .badge {
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .badge-sold {
                        background: #dcfce7;
                        color: #10b981;
                    }

                    .badge-available {
                        background: #fef3c7;
                        color: #b38e44;
                    }

                    .loading {
                        text-align: center;
                        padding: 40px;
                        color: #64748b;
                    }

                    .loading-spinner {
                        display: inline-block;
                        width: 40px;
                        height: 40px;
                        border: 4px solid #eef0f2;
                        border-top-color: #b38e44;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .empty-state {
                        text-align: center;
                        padding: 40px;
                        color: #94a3b8;
                    }

                    .empty-state i {
                        font-size: 48px;
                        margin-bottom: 15px;
                        opacity: 0.3;
                    }
                </style>

                <div class="dashboard-content">
                    <!-- Stats Grid -->
                    <div class="stats-grid" id="statsGrid">
                        <div class="stat-card">
                            <div class="stat-icon projects">
                                <i class="fas fa-folder-open"></i>
                            </div>
                            <div class="stat-content">
                                <h3>إجمالي المشاريع</h3>
                                <p class="number" id="projectsCount">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon buildings">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-content">
                                <h3>إجمالي المباني</h3>
                                <p class="number" id="buildingsCount">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon apartments">
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="stat-content">
                                <h3>إجمالي الشقق</h3>
                                <p class="number" id="apartmentsCount">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon users">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <h3>إجمالي المستخدمين</h3>
                                <p class="number" id="usersCount">0</p>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3 class="chart-title">نسبة الشقق المباعة</h3>
                            <canvas id="apartmentChart" style="max-height: 300px;"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3 class="chart-title">توزيع المشاريع</h3>
                            <canvas id="projectChart" style="max-height: 300px;"></canvas>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <h3 class="quick-actions-title"><i class="fas fa-lightning-bolt" style="margin-left: 10px; color: #b38e44;"></i> إجراءات سريعة</h3>
                        <div class="actions-grid">
                            <a href="Projects.html" class="action-btn">
                                <i class="fas fa-plus"></i> إضافة مشروع
                            </a>
                            <a href="Projects.html" class="action-btn">
                                <i class="fas fa-building"></i> عرض المشاريع
                            </a>
                            <a href="Users.html" class="action-btn">
                                <i class="fas fa-users"></i> إدارة المستخدمين
                            </a>
                            <a href="#" class="action-btn" onclick="alert('قريباً: إضافة مبنى جديد'); return false;">
                                <i class="fas fa-home"></i> إضافة مبنى
                            </a>
                        </div>
                    </div>

                    <!-- Recent Projects -->
                    <div class="recent-section">
                        <h3 class="recent-title"><i class="fas fa-history" style="margin-left: 10px; color: #b38e44;"></i> آخر المشاريع</h3>
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>اسم المشروع</th>
                                        <th>الموقع</th>
                                        <th>عدد المباني</th>
                                        <th>تاريخ الإنشاء</th>
                                    </tr>
                                </thead>
                                <tbody id="recentProjectsBody">
                                    <tr>
                                        <td colspan="4" class="loading">
                                            <div class="loading-spinner"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Recent Apartments -->
                    <div class="recent-section">
                        <h3 class="recent-title"><i class="fas fa-history" style="margin-left: 10px; color: #b38e44;"></i> آخر الشقق المضافة</h3>
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>رقم الشقة</th>
                                        <th>الدور</th>
                                        <th>المساحة (م²)</th>
                                        <th>الحالة</th>
                                        <th>السعر الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody id="recentApartmentsBody">
                                    <tr>
                                        <td colspan="5" class="loading">
                                            <div class="loading-spinner"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Load data
        loadAllData();
    });

// Load All Data
async function loadAllData() {
    try {
        await Promise.all([
            loadProjects(),
            loadBuildings(),
            loadApartments(),
            loadUsers()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Load Projects
async function loadProjects() {
    try {
        const res = await fetch(`${API_BASE}/Projects/Get-All-Projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allProjects = await res.json();
            document.getElementById('projectsCount').textContent = allProjects.length;
            renderRecentProjects();
            updateCharts();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Load Buildings
async function loadBuildings() {
    try {
        const res = await fetch(`${API_BASE}/Buildings/Get-All-Buildings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allBuildings = await res.json();
            document.getElementById('buildingsCount').textContent = allBuildings.length;
            updateCharts();
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load Apartments
async function loadApartments() {
    try {
        const res = await fetch(`${API_BASE}/Apartments/Get-All-Apartments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allApartments = await res.json();
            document.getElementById('apartmentsCount').textContent = allApartments.length;
            renderRecentApartments();
            updateCharts();
        }
    } catch (error) {
        console.error('Error loading apartments:', error);
    }
}

// Load Users
async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/Users/Get-All-Users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allUsers = await res.json();
            document.getElementById('usersCount').textContent = allUsers.length;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Render Recent Projects
function renderRecentProjects() {
    const tbody = document.getElementById('recentProjectsBody');
    const recent = allProjects.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-folder-open"></i><p>لا توجد مشاريع</p></td></tr>';
        return;
    }

    tbody.innerHTML = recent.map(p => {
        const buildingCount = allBuildings.filter(b => b.projectId === p.id).length;
        const createdDate = new Date(p.createdAt).toLocaleDateString('ar-SA');
        return `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.location}</td>
                <td><span style="background: #dbeafe; color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${buildingCount}</span></td>
                <td>${createdDate}</td>
            </tr>
        `;
    }).join('');
}

// Render Recent Apartments
function renderRecentApartments() {
    const tbody = document.getElementById('recentApartmentsBody');
    const recent = allApartments.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-home"></i><p>لا توجد شقق</p></td></tr>';
        return;
    }

    tbody.innerHTML = recent.map(a => {
        const totalPrice = (a.area * a.pricePerMeter).toFixed(2);
        return `
            <tr>
                <td><strong>${a.apartmentNumber}</strong></td>
                <td>${a.floorNumber}</td>
                <td>${a.area}</td>
                <td><span class="badge ${a.isSold ? 'badge-sold' : 'badge-available'}">${a.isSold ? 'مباعة' : 'متاحة'}</span></td>
                <td>${totalPrice} ر.س</td>
            </tr>
        `;
    }).join('');
}

// Update Charts
function updateCharts() {
    // Apartment Chart
    const soldCount = allApartments.filter(a => a.isSold).length;
    const availableCount = allApartments.length - soldCount;

    const apartmentCtx = document.getElementById('apartmentChart');
    if (apartmentCtx) {
        new Chart(apartmentCtx, {
            type: 'doughnut',
            data: {
                labels: ['مباعة', 'متاحة'],
                datasets: [{
                    data: [soldCount, availableCount],
                    backgroundColor: ['#10b981', '#fef3c7'],
                    borderColor: ['#059669', '#f59e0b'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: "'Tajawal', sans-serif", size: 14 },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // Project Chart
    const projectCtx = document.getElementById('projectChart');
    if (projectCtx) {
        const projectLabels = allProjects.slice(0, 5).map(p => p.name);
        const projectData = allProjects.slice(0, 5).map(p => allBuildings.filter(b => b.projectId === p.id).length);

        new Chart(projectCtx, {
            type: 'bar',
            data: {
                labels: projectLabels,
                datasets: [{
                    label: 'عدد المباني',
                    data: projectData,
                    backgroundColor: '#b38e44',
                    borderColor: '#9a7a38',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: {
                            font: { family: "'Tajawal', sans-serif", size: 14 }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}
