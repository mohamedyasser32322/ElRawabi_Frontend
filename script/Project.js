// ============================================
// نظام إدارة المشاريع والمباني والشقق - نسخة نهائية مصححة (v2)
// ============================================

// --- إعدادات API والمتغيرات العامة ---
const API_BASE = 'https://localhost:7203/api';
let token = localStorage.getItem('token') || 'demo-token';

// --- متغيرات تخزين البيانات ---
let allProjects = [];
let allBuildings = [];
let allApartments = [];
let allUsers = [];
let buildingCounts = {}; // لتخزين عدد المباني ومنع الرمشة

// --- متغيرات حالة التطبيق ---
let currentProjectId = null;
let currentBuildingId = null;
let currentView = 'projects'; // 'projects' | 'buildings' | 'apartments'
let currentProjectName = '';
let currentBuildingNumber = '';

// --- متغيرات الترقيم (Pagination) ---
let currentPage = 1;
let itemsPerPage = 8;
let filteredData = [];

// --- متغيرات حالة المودالات ---
let editingId = null;
let editingType = null; // 'project', 'building', 'apartment'
let selectedApartmentId = null;
let deleteItemId = null;
let deleteItemType = null;

// ============================================
// تحميل الواجهة الأساسية (Layout)
// ============================================
fetch('layout.html')
    .then(res => res.text())
    .then(html => {
        const layoutRoot = document.getElementById('layout-root');
        if (layoutRoot) layoutRoot.innerHTML = html;

        const menuProj = document.getElementById('menu-Projects.html');
        if (menuProj) menuProj.classList.add('active');

        const headerBar = document.querySelector('.header-bar');
        if (headerBar) {
            headerBar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #1a252f;">إدارة المشاريع</h2>
                </div>
            `;
        }

        const renderBody = document.getElementById('render-body');
        if (renderBody) {
            renderBody.innerHTML = getMainHTML();
        }

        loadAllData();

        const logoutBtn = document.getElementById('layout-logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.clear();
                window.location.href = '../Login.html';
            };
        }
    });

// ============================================
// دالة إرجاع HTML الصفحة الرئيسية
// ============================================
function getMainHTML() {
    return `
        <style>
            .projects-content { 
                display: flex; 
                flex-direction: column; 
                height: 100%; 
                overflow: hidden;
            }

            .page-top-bar {
                background: #fff;
                padding: 15px 30px;
                border-bottom: 1px solid #e2e8f0;
                flex-shrink: 0;
            }

            .control-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
            }

            .search-box {
                position: relative;
                width: 400px;
            }

            .search-box i {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #94a3b8;
            }

            .search-box input {
                padding: 10px 45px 10px 15px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                width: 100%;
                outline: none;
                background: #f8fafc;
            }

            .search-box input:focus {
                border-color: #b38e44;
                background: #fff;
            }

            .add-btn {
                background: #1a252f;
                color: white;
                border-radius: 10px;
                height: 42px;
                padding: 0 20px;
                border: none;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: 0.3s;
            }

            .add-btn:hover {
                background: #b38e44;
            }

            .main-wrapper {
                flex: 1;
                padding: 25px 30px;
                overflow-y: auto;
                overflow-x: hidden;
            }

            .breadcrumb-nav {
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
            }

            .breadcrumb-item {
                color: #64748b;
                cursor: pointer;
                transition: 0.3s;
            }

            .breadcrumb-item:hover {
                color: #b38e44;
            }

            .breadcrumb-item.active {
                color: #1a252f;
                cursor: default;
            }

            .breadcrumb-separator {
                color: #cbd5e1;
            }

            .projects-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
            }

            .project-card {
                background: #fff;
                border-radius: 16px;
                padding: 20px;
                border: 1px solid #e2e8f0;
                transition: 0.3s;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                height: 170px;
            }

            .project-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                border-color: #b38e44;
            }

            .project-icon {
                width: 45px;
                height: 45px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8fafc;
                color: #b38e44;
                border: 1px solid #e2e8f0;
            }

            .project-card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
            }

            .project-card-title {
                font-size: 1rem;
                font-weight: 700;
                color: #1a252f;
                margin: 0;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .loc-badge {
                font-size: 11px;
                font-weight: 800;
                padding: 4px 12px;
                border-radius: 20px;
                background: #f8f1e5;
                color: #b38e44;
            }

            .card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 10px;
                border-top: 1px solid #e2e8f0;
                margin-top: auto;
            }

            .action-buttons {
                display: flex;
                gap: 8px;
            }

            .btn-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                background: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.3s;
                color: #64748b;
                font-size: 14px;
            }

            .btn-icon:hover {
                background: #f8fafc;
                color: #1a252f;
            }

            .btn-icon.view:hover {
                border-color: #b38e44;
                color: #b38e44;
            }

            .btn-icon.edit:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }

            .btn-icon.delete:hover {
                border-color: #ef4444;
                color: #ef4444;
            }

            .btn-icon.assign:hover {
                border-color: #10b981;
                color: #10b981;
            }

            .page-footer-nav {
                background: #fff;
                padding: 10px 30px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 60px;
                flex-shrink: 0;
            }

            .pagination {
                display: flex;
                gap: 5px;
                align-items: center;
            }

            .pagination .page-link {
                color: #b38e44;
                border: 1px solid #e2e8f0;
                padding: 6px 12px;
                border-radius: 8px;
                transition: 0.3s;
                font-weight: bold;
                cursor: pointer;
                background: #fff;
            }

            .pagination .page-item.active .page-link {
                background-color: #b38e44 !important;
                border-color: #b38e44 !important;
                color: white !important;
            }

            .pagination .page-link:hover {
                background-color: #f8f1e5;
                color: #b38e44;
            }

            .modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }

            .modal-overlay.active {
                display: flex;
            }

            .modal-content {
                background: #fff;
                border-radius: 16px;
                padding: 30px;
                width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
            }

            .modal-header {
                font-size: 18px;
                font-weight: 700;
                color: #1a252f;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .close-modal {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #64748b;
            }

            .modal-body {
                margin-bottom: 20px;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .detail-label {
                font-weight: 600;
                color: #64748b;
            }

            .detail-value {
                color: #1a252f;
                font-weight: 500;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-label {
                display: block;
                font-weight: 600;
                color: #1a252f;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .form-input,
            .form-textarea,
            .form-select {
                width: 100%;
                padding: 12px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-family: 'Cairo', sans-serif;
                font-size: 14px;
                outline: none;
                transition: 0.3s;
                box-sizing: border-box;
            }

            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                border-color: #b38e44;
                box-shadow: 0 0 0 3px rgba(179, 142, 68, 0.1);
            }

            .form-textarea {
                resize: vertical;
                min-height: 100px;
            }

            .modal-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            .btn-primary,
            .btn-secondary {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: 0.3s;
            }

            .btn-primary {
                background: #b38e44;
                color: white;
            }

            .btn-primary:hover {
                background: #9a7438;
            }

            .btn-secondary {
                background: #e2e8f0;
                color: #1a252f;
            }

            .btn-secondary:hover {
                background: #cbd5e1;
            }

            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #94a3b8;
            }

            .empty-state i {
                font-size: 48px;
                margin-bottom: 15px;
                display: block;
            }

            .loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 60px;
            }

            .loading-spinner {
                border: 4px solid #e2e8f0;
                border-top: 4px solid #b38e44;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>

        <div class="projects-content">
            <div class="page-top-bar">
                <div class="control-bar">
                    <div class="search-box">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="searchInput" placeholder="بحث..." onkeyup="handleSearch()">
                    </div>
                    <button class="add-btn" id="addBtn" onclick="openCreateModal()">
                        <i class="fa-solid fa-plus"></i> <span id="addBtnText">إضافة مشروع</span>
                    </button>
                </div>
            </div>

            <div style="padding: 0 30px; padding-top: 20px;">
                <div class="breadcrumb-nav" id="breadcrumb">
                    <span class="breadcrumb-item active">المشاريع</span>
                </div>
            </div>

            <div class="main-wrapper">
                <div id="projectsGrid" class="projects-grid"></div>
            </div>

            <div class="page-footer-nav">
                <div style="font-size: 13px; color: #64748b; font-weight: 700;">
                    الإجمالي: <span id="totalCount">0</span>
                </div>
                <nav>
                    <ul class="pagination" id="paginationWrapper"></ul>
                </nav>
            </div>
        </div>

        <!-- مودال عرض التفاصيل -->
        <div id="viewModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">التفاصيل</h5>
                    <button class="close-modal" onclick="closeViewModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body" id="viewModalBody"></div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="closeViewModal()">إغلاق</button>
                </div>
            </div>
        </div>

        <!-- مودال إنشاء مشروع جديد -->
        <div id="createProjectModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">إضافة مشروع جديد</div>
                <form id="createProjectForm" onsubmit="createProject(event)">
                    <div class="form-group">
                        <label class="form-label">اسم المشروع</label>
                        <input type="text" class="form-input" id="newProjectName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الموقع</label>
                        <input type="text" class="form-input" id="newProjectLocation" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الوصف</label>
                        <textarea class="form-textarea" id="newProjectDescription" required></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ</button>
                        <button type="button" class="btn-secondary" onclick="closeCreateProjectModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال تعديل مشروع -->
        <div id="editProjectModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">تعديل مشروع</div>
                <form id="editProjectForm" onsubmit="updateProject(event)">
                    <input type="hidden" id="editProjectId">
                    <div class="form-group">
                        <label class="form-label">اسم المشروع</label>
                        <input type="text" class="form-input" id="editProjectName" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الموقع</label>
                        <input type="text" class="form-input" id="editProjectLocation" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الوصف</label>
                        <textarea class="form-textarea" id="editProjectDescription" required></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ التغييرات</button>
                        <button type="button" class="btn-secondary" onclick="closeEditProjectModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال إنشاء مبنى جديد -->
        <div id="createBuildingModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">إضافة مبنى جديد</div>
                <form id="createBuildingForm" onsubmit="createBuilding(event)">
                    <div class="form-group">
                        <label class="form-label">رقم المبنى</label>
                        <input type="text" class="form-input" id="newBuildingNumber" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">عدد الطوابق</label>
                        <input type="number" class="form-input" id="newBuildingFloors" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تاريخ التسليم</label>
                        <input type="date" class="form-input" id="newBuildingDate" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ</button>
                        <button type="button" class="btn-secondary" onclick="closeCreateBuildingModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال تعديل مبنى -->
        <div id="editBuildingModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">تعديل مبنى</div>
                <form id="editBuildingForm" onsubmit="updateBuilding(event)">
                    <input type="hidden" id="editBuildingId">
                    <div class="form-group">
                        <label class="form-label">رقم المبنى</label>
                        <input type="text" class="form-input" id="editBuildingNumber" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">عدد الطوابق</label>
                        <input type="number" class="form-input" id="editBuildingFloors" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تاريخ التسليم</label>
                        <input type="date" class="form-input" id="editBuildingDate" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ التغييرات</button>
                        <button type="button" class="btn-secondary" onclick="closeEditBuildingModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال إنشاء شقة جديدة -->
        <div id="createApartmentModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">إضافة شقة جديدة</div>
                <form id="createApartmentForm" onsubmit="createApartment(event)">
                    <div class="form-group">
                        <label class="form-label">رقم الشقة</label>
                        <input type="text" class="form-input" id="newApartmentNumber" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الدور</label>
                        <input type="number" class="form-input" id="newApartmentFloor" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">المساحة (م²)</label>
                        <input type="number" class="form-input" id="newApartmentArea" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">سعر المتر (ر.س)</label>
                        <input type="number" class="form-input" id="newApartmentPrice" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">نوع الشقة</label>
                        <select class="form-select" id="newApartmentType" required>
                            <option value="">اختر النوع...</option>
                            <option value="1">الدور الأرضي</option>
                            <option value="2">دور عادي</option>
                            <option value="3">السطح</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ</button>
                        <button type="button" class="btn-secondary" onclick="closeCreateApartmentModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال تعديل شقة -->
        <div id="editApartmentModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">تعديل شقة</div>
                <form id="editApartmentForm" onsubmit="updateApartment(event)">
                    <input type="hidden" id="editApartmentId">
                    <div class="form-group">
                        <label class="form-label">رقم الشقة</label>
                        <input type="text" class="form-input" id="editApartmentNumber" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الدور</label>
                        <input type="number" class="form-input" id="editApartmentFloor" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">المساحة (م²)</label>
                        <input type="number" class="form-input" id="editApartmentArea" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">سعر المتر (ر.س)</label>
                        <input type="number" class="form-input" id="editApartmentPrice" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">نوع الشقة</label>
                        <select class="form-select" id="editApartmentType" required>
                            <option value="">اختر النوع...</option>
                            <option value="1">الدور الأرضي</option>
                            <option value="2">دور عادي</option>
                            <option value="3">السطح</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">حفظ التغييرات</button>
                        <button type="button" class="btn-secondary" onclick="closeEditApartmentModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- مودال تأكيد الحذف -->
        <div id="deleteModal" class="modal-overlay">
            <div class="modal-content" style="width: 400px;">
                <div class="modal-header">تأكيد الحذف</div>
                <p style="color: #64748b; margin-bottom: 25px;">هل أنت متأكد من حذف هذا العنصر؟</p>
                <div class="modal-footer">
                    <button class="btn-primary" style="background: #ef4444;" onclick="confirmDelete()">حذف</button>
                    <button class="btn-secondary" onclick="closeDeleteModal()">إلغاء</button>  
                </div>
            </div>
        </div>

        <!-- مودال تخصيص الشقة للعميل -->
        <div id="assignModal" class="modal-overlay">
            <div class="modal-content" style="width: 400px;">
                <div class="modal-header">تخصيص الشقة للعميل</div>
                <form id="assignForm" onsubmit="saveAssignment(event)">
                    <div class="form-group">
                        <label class="form-label">اختر العميل</label>
                        <select class="form-select" id="clientSelect" required>
                            <option value="">جاري التحميل...</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeAssignModal()">إلغاء</button>
                        <button type="submit" class="btn-primary">تخصيص</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ============================================
// دوال تحميل البيانات من الـ API
// ============================================

async function loadAllData() {
    try {
        await Promise.all([
            loadProjects(),
            loadBuildings(),
            loadApartments(),
            loadUsers()
        ]);
    } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
    }
}

async function loadProjects() {
    try {
        const res = await fetch(`${API_BASE}/Projects/Get-All-Projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allProjects = await res.json();
            filteredData = [...allProjects];
            renderProjects();
        }
    } catch (err) {
        console.error('خطأ في تحميل المشاريع:', err);
    }
}

async function loadBuildings() {
    try {
        const res = await fetch(`${API_BASE}/Buildings/Get-All-Buildings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allBuildings = await res.json();
        }
    } catch (err) {
        console.error('خطأ في تحميل المباني:', err);
    }
}

async function loadApartments() {
    try {
        const res = await fetch(`${API_BASE}/Apartments/Get-All-Apartments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allApartments = await res.json();
        }
    } catch (err) {
        console.error('خطأ في تحميل الشقق:', err);
    }
}

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/Users/Get-All-Users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            allUsers = await res.json();
            const select = document.getElementById('clientSelect');
            if (select) {
                select.innerHTML = '<option value="">اختر عميل...</option>' + 
                    allUsers.map(u => `<option value="${u.id}">${u.fullName}</option>`).join('');
            }
        }
    } catch (err) {
        console.error('خطأ في تحميل المستخدمين:', err);
    }
}

// ============================================
// دوال العرض والتصيير (Rendering)
// ============================================

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredData.slice(start, end);

    if (pageItems.length === 0 && currentPage > 1) {
        currentPage = Math.max(1, currentPage - 1);
        renderProjects();
        return;
    }

    if (pageItems.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-folder-open"></i><p>لا توجد مشاريع</p></div>';
        document.getElementById('totalCount').innerText = '0';
        document.getElementById('paginationWrapper').innerHTML = '';
        return;
    }

    grid.innerHTML = pageItems.map(p => {
        // استخدام القيمة المخزنة مسبقاً لمنع الرمشة
        const count = buildingCounts[p.id] !== undefined ? buildingCounts[p.id] : '...';
        return `
            <div class="project-card" onclick="showBuildingsView(${p.id}, '${p.name}')">
                <div class="project-card-header">
                    <div class="project-icon"><i class="fa-solid fa-building-circle-check"></i></div>
                    <h5 class="project-card-title">${p.name}</h5>
                </div>
                <div style="margin-bottom: 10px;">
                    <span class="loc-badge"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
                </div>
                <div class="card-footer">
                    <div style="font-size: 12px; color: #64748b;"><strong id="proj-count-${p.id}">${count}</strong> مبنى</div>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="event.stopPropagation(); viewItem(${p.id}, 'project')" title="عرض">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-icon edit" onclick="event.stopPropagation(); openEditProjectModal(${p.id})" title="تعديل">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="event.stopPropagation(); prepareDelete(${p.id}, 'project')" title="حذف">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // تحديث العدادات في الخلفية بدون مسح المحتوى الحالي
    pageItems.forEach(p => {
        updateBuildingCount(p.id);
    });

    renderPagination();
    document.getElementById('totalCount').innerText = filteredData.length;
}

async function updateBuildingCount(projectId) {
    try {
        const res = await fetch(`${API_BASE}/Buildings/Get-Project-Buildings/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            buildingCounts[projectId] = data.length; // تخزين القيمة
            const element = document.getElementById(`proj-count-${projectId}`);
            if (element) {
                element.innerText = data.length;
            }
        }
    } catch (err) {
        console.error("خطأ في تحديث العداد:", err);
    }
}

function renderPagination() {
    const wrapper = document.getElementById('paginationWrapper');
    const pageCount = Math.ceil(filteredData.length / itemsPerPage);

    if (pageCount <= 1) {
        wrapper.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= pageCount; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" onclick="goToPage(${i})">${i}</a>
            </li>
        `;
    }
    wrapper.innerHTML = html;
}

// ============================================
// دوال التنقل بين الصفحات
// ============================================

async function showBuildingsView(projectId, projectName) {
    currentProjectId = projectId;
    currentProjectName = projectName;
    currentView = 'buildings';
    currentPage = 1;

    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '<div class="loading" style="grid-column: 1/-1;"><div class="loading-spinner"></div></div>';

    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-item" onclick="backToProjects()">المشاريع</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">${projectName}</span>
    `;

    document.getElementById('addBtnText').innerText = 'إضافة مبنى';

    try {
        const res = await fetch(`${API_BASE}/Buildings/Get-Project-Buildings/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const buildings = await res.json();
            if (buildings.length === 0) {
                grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-building"></i><p>لا توجد مباني مضافة لهذا المشروع</p></div>';
                return;
            }
            grid.innerHTML = buildings.map(b => `
                <div class="project-card" onclick="showApartmentsView(${b.id}, '${b.buildingNumber}')">
                    <div class="project-card-header">
                        <div class="project-icon"><i class="fa-solid fa-building"></i></div>
                        <h5 class="project-card-title">مبنى رقم ${b.buildingNumber}</h5>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span class="loc-badge">طوابق: ${b.totalFloors}</span>
                    </div>
                    <div class="card-footer">
                        <div style="font-size: 12px; color: #64748b;">
                            ${allApartments.filter(a => a.buildingId === b.id).length} شقة
                        </div>
                        <div class="action-buttons">
                            <button class="btn-icon view" onclick="event.stopPropagation(); viewItem(${b.id}, 'building')" title="عرض">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button class="btn-icon edit" onclick="event.stopPropagation(); openEditBuildingModal(${b.id})" title="تعديل">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-icon delete" onclick="event.stopPropagation(); prepareDelete(${b.id}, 'building')" title="حذف">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('خطأ في جلب المباني:', err);
    }
}

async function showApartmentsView(buildingId, buildingNumber) {
    currentBuildingId = buildingId;
    currentBuildingNumber = buildingNumber;
    currentView = 'apartments';
    currentPage = 1;

    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '<div class="loading" style="grid-column: 1/-1;"><div class="loading-spinner"></div></div>';

    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-item" onclick="backToProjects()">المشاريع</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item" onclick="showBuildingsView(${currentProjectId}, '${currentProjectName}')">${currentProjectName}</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">مبنى ${buildingNumber}</span>
    `;

    document.getElementById('addBtnText').innerText = 'إضافة شقة';

    const apartments = allApartments.filter(a => a.buildingId === buildingId);

    if (apartments.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-home"></i><p>لا توجد شقق في هذا المبنى</p></div>';
        return;
    }

    grid.innerHTML = apartments.map(a => {
        const totalPrice = (a.area * a.pricePerMeter).toLocaleString();
        const clientName = a.clientId ? (allUsers.find(u => u.id === a.clientId)?.name || 'عميل') : 'غير مخصص';
        return `
            <div class="project-card">
                <div class="project-card-header">
                    <div class="project-icon"><i class="fa-solid fa-door-open"></i></div>
                    <h5 class="project-card-title">شقة رقم ${a.apartmentNumber}</h5>
                </div>
                <div style="margin-bottom: 10px; font-size: 13px; color: #64748b;">
                    <div>الدور: <strong>${a.floorNumber}</strong></div>
                    <div>المساحة: <strong>${a.area} م²</strong></div>
                    <div>السعر: <strong style="color: #b38e44;">${totalPrice} ر.س</strong></div>
                </div>
                <div class="card-footer">
                    <span class="loc-badge" style="background: ${a.isSold ? '#fee2e2' : '#dcfce7'}; color: ${a.isSold ? '#ef4444' : '#10b981'};">
                        ${a.isSold ? 'مباعة' : 'متاحة'}
                    </span>
                    <div class="action-buttons">
                        <button class="btn-icon view" onclick="event.stopPropagation(); viewItem(${a.id}, 'apartment')" title="عرض">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        ${a.isSold ? `<span style="font-size: 11px; color: #64748b;">${clientName}</span>` : `<button class="btn-icon assign" onclick="event.stopPropagation(); openAssignModal(${a.id})" title="تخصيص"><i class="fa-solid fa-user-plus"></i></button>`}
                        <button class="btn-icon edit" onclick="event.stopPropagation(); openEditApartmentModal(${a.id})" title="تعديل">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="event.stopPropagation(); prepareDelete(${a.id}, 'apartment')" title="حذف">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function backToProjects() {
    currentPage = 1;
    currentView = 'projects';
    currentProjectId = null;
    currentBuildingId = null;
    document.getElementById('breadcrumb').innerHTML = '<span class="breadcrumb-item active">المشاريع</span>';
    document.getElementById('addBtnText').innerText = 'إضافة مشروع';
    renderProjects();
}

// ============================================
// دوال المودالات - الإنشاء والتعديل منفصلة
// ============================================

function openCreateModal() {
    if (currentView === 'projects') {
        document.getElementById('createProjectForm').reset();
        document.getElementById('createProjectModal').classList.add('active');
    } else if (currentView === 'buildings') {
        document.getElementById('createBuildingForm').reset();
        document.getElementById('createBuildingModal').classList.add('active');
    } else if (currentView === 'apartments') {
        document.getElementById('createApartmentForm').reset();
        document.getElementById('createApartmentModal').classList.add('active');
    }
}

function closeCreateProjectModal() {
    document.getElementById('createProjectModal').classList.remove('active');
}

function closeCreateBuildingModal() {
    document.getElementById('createBuildingModal').classList.remove('active');
}

function closeCreateApartmentModal() {
    document.getElementById('createApartmentModal').classList.remove('active');
}

function openEditProjectModal(id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('editProjectId').value = id;
    document.getElementById('editProjectName').value = project.name;
    document.getElementById('editProjectLocation').value = project.location;
    // التأكد من تعبئة الوصف بشكل صحيح
    document.getElementById('editProjectDescription').value = project.description || project.Description || '';
    document.getElementById('editProjectModal').classList.add('active');
    console.log("Keys available:", Object.keys(project));
}

function closeEditProjectModal() {
    document.getElementById('editProjectModal').classList.remove('active');
}

function openEditBuildingModal(id) {
    const building = allBuildings.find(b => b.id === id);
    if (!building) return;

    document.getElementById('editBuildingId').value = id;
    document.getElementById('editBuildingNumber').value = building.buildingNumber;
    document.getElementById('editBuildingFloors').value = building.totalFloors;
    const rawDate = building.deliveryDate || building.DeliveryDate;
    if (rawDate) {
        document.getElementById('editBuildingDate').value = rawDate.split('T')[0];
    } else {
        document.getElementById('editBuildingDate').value = '';
    }
    document.getElementById('editBuildingModal').classList.add('active');
}

function closeEditBuildingModal() {
    document.getElementById('editBuildingModal').classList.remove('active');
}

function openEditApartmentModal(id) {
    const apartment = allApartments.find(a => a.id === id);
    if (!apartment) return;

    document.getElementById('editApartmentId').value = id;
    document.getElementById('editApartmentNumber').value = apartment.apartmentNumber;
    document.getElementById('editApartmentFloor').value = apartment.floorNumber;
    document.getElementById('editApartmentArea').value = apartment.area;
    document.getElementById('editApartmentPrice').value = apartment.pricePerMeter;
    document.getElementById('editApartmentType').value = apartment.type;
    document.getElementById('editApartmentModal').classList.add('active');
}

function closeEditApartmentModal() {
    document.getElementById('editApartmentModal').classList.remove('active');
}

// ============================================
// دوال عرض التفاصيل
// ============================================

async function viewItem(id, type) {
    let item;
    let html = '';
    
    if (type === 'project') {
        const res = await fetch(`${API_BASE}/Projects/Project-Profile/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            item = await res.json();
            html = `
                <div class="detail-row"><span class="detail-label">اسم المشروع:</span><span class="detail-value">${item.name}</span></div>
                <div class="detail-row"><span class="detail-label">الموقع:</span><span class="detail-value">${item.location}</span></div>
                <div class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">${item.description || 'لا يوجد'}</span></div>
                <div class="detail-row"><span class="detail-label">تاريخ الإنشاء:</span><span class="detail-value">${new Date(item.createdAt).toLocaleString('ar-SA')}</span></div>
                <div class="detail-row"><span class="detail-label">تاريخ اخر تعديل:</span><span class="detail-value">${new Date(item.lastUpdatedAt).toLocaleString('ar-SA')}</span></div>
            `;
        }
    } 
    else if (type === 'building') {
        const res = await fetch(`${API_BASE}/Buildings/Building-Profile/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            item = await res.json();
            html = `
                <div class="detail-row"><span class="detail-label">رقم المبنى:</span><span class="detail-value">${item.buildingNumber}</span></div>
                <div class="detail-row"><span class="detail-label">عدد الطوابق:</span><span class="detail-value">${item.totalFloors}</span></div>
                <div class="detail-row"><span class="detail-label">تاريخ التسليم:</span><span class="detail-value">${new Date(item.deliveryDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            `;
        }
    } 
    else if (type === 'apartment') {
        const res = await fetch(`${API_BASE}/Apartments/Apartment-Details/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            item = await res.json();
            const totalPrice = (item.area * item.pricePerMeter).toLocaleString();
            const apartmentTypeNames = { 1: 'الدور الأرضي', 2: 'دور عادي', 3: 'السطح' };
            html = `
                <div class="detail-row"><span class="detail-label">رقم الشقة:</span><span class="detail-value">${item.apartmentNumber}</span></div>
                <div class="detail-row"><span class="detail-label">الدور:</span><span class="detail-value">${item.floorNumber}</span></div>
                <div class="detail-row"><span class="detail-label">المساحة:</span><span class="detail-value">${item.area} م²</span></div>
                <div class="detail-row"><span class="detail-label">سعر المتر:</span><span class="detail-value">${item.pricePerMeter} ر.س</span></div>
                <div class="detail-row"><span class="detail-label">الإجمالي:</span><span class="detail-value">${totalPrice} ر.س</span></div>
                <div class="detail-row"><span class="detail-label">النوع:</span><span class="detail-value">${apartmentTypeNames[item.type] || 'غير محدد'}</span></div>
                <div class="detail-row"><span class="detail-label">الحالة:</span><span class="detail-value">${item.isSold ? 'مباعة' : 'متاحة'}</span></div>
            `;
        }
    }

    document.getElementById('viewModalBody').innerHTML = html;
    document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// ============================================
// دوال الإنشاء (Create)
// ============================================

async function createProject(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('newProjectName').value,
        location: document.getElementById('newProjectLocation').value,
        description: document.getElementById('newProjectDescription').value
    };

    try {
        const res = await fetch(`${API_BASE}/Projects/Create-Project`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeCreateProjectModal();
            await loadProjects();
        } else {
            alert('خطأ في إنشاء المشروع');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

async function createBuilding(event) {
    event.preventDefault();
    
    const data = {
        buildingNumber: document.getElementById('newBuildingNumber').value,
        totalFloors: parseInt(document.getElementById('newBuildingFloors').value),
        deliveryDate: document.getElementById('newBuildingDate').value,
        projectId: currentProjectId
    };

    try {
        const res = await fetch(`${API_BASE}/Buildings/Create-Building`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeCreateBuildingModal();
            await loadBuildings();
            await showBuildingsView(currentProjectId, currentProjectName);
        } else {
            alert('خطأ في إنشاء المبنى');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

async function createApartment(event) {
    event.preventDefault();
    
    const data = {
        apartmentNumber: document.getElementById('newApartmentNumber').value,
        floorNumber: parseInt(document.getElementById('newApartmentFloor').value),
        area: parseFloat(document.getElementById('newApartmentArea').value),
        pricePerMeter: parseFloat(document.getElementById('newApartmentPrice').value),
        type: parseInt(document.getElementById('newApartmentType').value),
        buildingId: currentBuildingId,
        isSold: false
    };

    try {
        const res = await fetch(`${API_BASE}/Apartments/Add-New-Apartment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeCreateApartmentModal();
            await loadApartments();
            await showApartmentsView(currentBuildingId, currentBuildingNumber);
        } else {
            alert('خطأ في إنشاء الشقة');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

// ============================================
// دوال التعديل (Update)
// ============================================

async function updateProject(event) {
    event.preventDefault();
    
    const data = {
        id: parseInt(document.getElementById('editProjectId').value),
        name: document.getElementById('editProjectName').value,
        location: document.getElementById('editProjectLocation').value,
        description: document.getElementById('editProjectDescription').value
    };

    try {
        const res = await fetch(`${API_BASE}/Projects/Update-Project-Info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeEditProjectModal();
            await loadProjects();
        } else {
            alert('خطأ في تحديث المشروع');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

async function updateBuilding(event) {
    event.preventDefault();
    
    const data = {
        id: parseInt(document.getElementById('editBuildingId').value),
        buildingNumber: document.getElementById('editBuildingNumber').value,
        totalFloors: parseInt(document.getElementById('editBuildingFloors').value),
        deliveryDate: document.getElementById('editBuildingDate').value,
        projectId: currentProjectId
    };

    try {
        const res = await fetch(`${API_BASE}/Buildings/Update-Building-Info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeEditBuildingModal();
            await loadBuildings();
            await showBuildingsView(currentProjectId, currentProjectName);
        } else {
            alert('خطأ في تحديث المبنى');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

async function updateApartment(event) {
    event.preventDefault();
    
    const data = {
        id: parseInt(document.getElementById('editApartmentId').value),
        apartmentNumber: document.getElementById('editApartmentNumber').value,
        floorNumber: parseInt(document.getElementById('editApartmentFloor').value),
        area: parseFloat(document.getElementById('editApartmentArea').value),
        pricePerMeter: parseFloat(document.getElementById('editApartmentPrice').value),
        type: parseInt(document.getElementById('editApartmentType').value),
        buildingId: currentBuildingId,
        isSold: false,
        clientId: null
    };

    try {
        const res = await fetch(`${API_BASE}/Apartments/Update-Apartment-Info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeEditApartmentModal();
            await loadApartments();
            await showApartmentsView(currentBuildingId, currentBuildingNumber);
        } else {
            alert('خطأ في تحديث الشقة');
        }
    } catch (err) {
        console.error('خطأ:', err);
    }
}

// ============================================
// دوال الحذف
// ============================================

function prepareDelete(id, type) {
    deleteItemId = id;
    deleteItemType = type;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

async function confirmDelete() {
    let url = '';
    if (deleteItemType === 'project') url = `${API_BASE}/Projects/Remove-Project/${deleteItemId}`;
    else if (deleteItemType === 'building') url = `${API_BASE}/Buildings/Remove-Building/${deleteItemId}`;
    else if (deleteItemType === 'apartment') url = `${API_BASE}/Apartments/Remove-Apartment/${deleteItemId}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            closeDeleteModal();
            if (deleteItemType === 'project') await loadProjects();
            else if (deleteItemType === 'building') await showBuildingsView(currentProjectId, currentProjectName);
            else if (deleteItemType === 'apartment') {
                await loadApartments();
                await showApartmentsView(currentBuildingId, currentBuildingNumber);
            }
        }
    } catch (err) {
        console.error('خطأ في الحذف:', err);
    }
}

// ============================================
// دوال تخصيص الشقة للعميل
// ============================================

function openAssignModal(aptId) {
    selectedApartmentId = aptId;
    document.getElementById('assignModal').classList.add('active');
}

function closeAssignModal() {
    document.getElementById('assignModal').classList.remove('active');
}

async function saveAssignment(e) {
    e.preventDefault();
    const userId = document.getElementById('clientSelect').value;
    if (!userId) return;

    const apt = allApartments.find(a => a.id === selectedApartmentId);
    if (!apt) return;

    const updateData = {
        id: apt.id,
        apartmentNumber: apt.apartmentNumber,
        floorNumber: apt.floorNumber,
        area: apt.area,
        pricePerMeter: apt.pricePerMeter,
        type: apt.type,
        buildingId: apt.buildingId,
        clientId: parseInt(userId),
        isSold: true
    };

    try {
        const res = await fetch(`${API_BASE}/Apartments/Update-Apartment-Info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            closeAssignModal();
            await loadApartments();
            await showApartmentsView(currentBuildingId, currentBuildingNumber);
        }
    } catch (err) {
        console.error('خطأ في التخصيص:', err);
    }
}

// ============================================
// دوال البحث والترقيم
// ============================================

function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    if (currentView === 'projects') {
        filteredData = allProjects.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.location.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
    }
    currentPage = 1;
    renderProjects();
}

function goToPage(page) {
    currentPage = page;
    renderProjects();
}
