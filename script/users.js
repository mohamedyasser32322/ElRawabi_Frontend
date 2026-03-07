const API_BASE = 'https://localhost:7203/api';
        let allUsers = [], filteredUsers = [], currentPage = 1, itemsPerPage = 8, userIdToDelete = null;
        const token = localStorage.getItem('token');

        fetch('layout.html').then(res => res.text()).then(html => {
            document.getElementById('layout-root').innerHTML = html;
            if(document.getElementById('menu-Users.html')) document.getElementById('menu-Users.html').classList.add('active');
            if(document.getElementById('layout-title')) document.getElementById('layout-title').innerText = "إدارة المستخدمين";
            
            document.getElementById('layout-logout-btn').onclick = () => { 
                localStorage.clear(); 
                window.location.href = '../Login.html';
            };

            initContent();
            fetchUsers();
        });
        function initContent() {
            const layoutHeader = document.querySelector('.header-bar');
            if (layoutHeader) {
                layoutHeader.innerHTML = `<div class="d-flex align-items-center w-100"><h4 class="m-0" style="font-weight: 800; color: #1e293b; font-size: 1.3rem;">إدارة المستخدمين</h4></div>`;
            }
            const renderBody = document.getElementById('render-body');
            if(!renderBody) return;
            renderBody.innerHTML = `
                <div class="page-top-bar"><div class="control-bar"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="بحث باسم المستخدم أو البريد..." oninput="handleSearch(this.value)"></div><button class="add-btn" data-bs-toggle="modal" data-bs-target="#addUserModal"><i class="fa-solid fa-plus"></i> إضافة مستخدم جديد</button></div></div>
                <div class="main-wrapper"><div id="usersGrid" class="users-grid"></div></div>
                <div class="page-footer-nav" id="pagination-wrapper"></div>`;
        }

        

        async function fetchUsers() {
            try {
                const res = await fetch(`${API_BASE}/Users/Get-All-Users`, { headers: { 'Authorization': `Bearer ${token}` } });
                allUsers = await res.json();
                filteredUsers = [...allUsers];
                renderUI();
            } catch { document.getElementById('usersGrid').innerHTML = `<div class="p-5 text-center text-danger fw-bold">فشل الاتصال بالسيرفر</div>`; }
        }

        function getRoleInfo(role) {
            const r = String(role).toLowerCase();
            if (r === '1' || r === 'admin') return { name: 'Admin', class: 'role-1' };
            if (r === '2' || r === 'employee') return { name: 'Employee', class: 'role-2' };
            return { name: 'Client', class: 'role-3' };
        }

        
        function formatDate(dateStr) {
            if (!dateStr || dateStr.startsWith('0001')) return null;
            const date = new Date(dateStr);
            if (isNaN(date.getTime()) || date.getFullYear() <= 1) return null;
            return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
        }

        function renderUI() {
            const grid = document.getElementById('usersGrid');
            if(!grid) return;
            const start = (currentPage - 1) * itemsPerPage;
            const items = filteredUsers.slice(start, start + itemsPerPage);
            if (items.length === 0) { grid.innerHTML = `<div class="col-12 text-center p-5 text-muted">لا يوجد نتائج</div>`; renderPagination(); return; }
            grid.innerHTML = items.map(u => {
                const roleInfo = getRoleInfo(u.role);
                return `
                <div class="user-card" onclick="viewUserDetails(${u.id})">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="user-avatar"><i class="fa-solid fa-user-tie"></i></div>
                        <div style="overflow:hidden"><h5 class="m-0 text-truncate" style="font-size:1rem; font-weight:700;">${u.fullName}</h5><p class="m-0 text-muted small text-truncate">${u.email}</p></div>
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <span class="role-badge ${roleInfo.class}">${roleInfo.name}</span>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm" onclick="event.stopPropagation(); openEditModal(${u.id})"><i class="fa-solid fa-pen-to-square text-success"></i></button>
                            <button class="btn btn-sm" onclick="event.stopPropagation(); prepareDelete(${u.id})"><i class="fa-solid fa-trash-can text-danger"></i></button>
                        </div>
                    </div>
                </div>`;
            }).join('');
            renderPagination();
        }

        async function viewUserDetails(id) {
            const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            const body = document.getElementById('viewUserBody');
            modal.show();
            body.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';
            try {
                const res = await fetch(`${API_BASE}/Users/User-Profile/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const u = await res.json();
                const role = getRoleInfo(u.role);
                
                // التحقق من التاريخ
                const lastUpdate = formatDate(u.lastUpdatedAt);
                const createdDate = formatDate(u.createdAt) || '---';

                body.innerHTML = `
                    <div class="text-center mb-4">
                        <div class="user-avatar mx-auto mb-2" style="width:70px; height:70px; font-size:2.2rem; background:#b38e44; color:#fff;">${u.fullName.charAt(0)}</div>
                        <h5 class="fw-bold m-0">${u.fullName}</h5>
                        <span class="badge ${u.isActive ? 'bg-success' : 'bg-danger'} mt-2">${u.isActive ? 'حساب نشط' : 'حساب معطل'}</span>
                    </div>
                    <div class="info-row"><i class="fa-solid fa-envelope"></i><div><div class="info-label">البريد الإلكتروني</div><div class="info-value">${u.email}</div></div></div>
                    <div class="info-row"><i class="fa-solid fa-phone"></i><div><div class="info-label">رقم الهاتف</div><div class="info-value">${u.phoneNumber || 'غير مسجل'}</div></div></div>
                    <div class="info-row"><i class="fa-solid fa-shield-halved"></i><div><div class="info-label">الصلاحية</div><div class="info-value"><span class="role-badge ${role.class}">${role.name}</span></div></div></div>
                    
                    <div class="info-row"><i class="fa-solid fa-calendar-plus"></i><div><div class="info-label">تاريخ الإنشاء</div><div class="info-value">${createdDate}</div></div></div>
                    <div class="info-row"><i class="fa-solid fa-calendar-check"></i><div><div class="info-label">آخر تحديث</div><div class="info-value">${lastUpdate ? lastUpdate : 'لم يتم التحديث بعد'}</div></div></div>
                `;
            } catch { body.innerHTML = '<div class="alert alert-danger text-center">خطأ في تحميل بيانات المستخدم</div>'; }
        }

        function renderPagination() {
            const wrapper = document.getElementById('pagination-wrapper');
            if (!wrapper) return;
            const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
            let nav = `<div class="small text-muted fw-bold">إجمالي المستخدمين: ${filteredUsers.length}</div><nav><ul class="pagination mb-0">`;
            for (let i = 1; i <= pageCount; i++) nav += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link shadow-sm" href="javascript:void(0)" onclick="currentPage=${i};renderUI();">${i}</a></li>`;
            wrapper.innerHTML = filteredUsers.length > 0 ? (nav + `</ul></nav>`) : '';
        }

        function handleSearch(t) { filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(t.toLowerCase()) || u.email.toLowerCase().includes(t.toLowerCase())); currentPage = 1; renderUI(); }

        document.getElementById('addUserForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = { fullName: document.getElementById('regFullName').value, email: document.getElementById('regEmail').value, phoneNumber: document.getElementById('regPhone').value, password: document.getElementById('regPassword').value, role: parseInt(document.getElementById('regRole').value) };
            const res = await fetch(`${API_BASE}/Auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide(); fetchUsers(); e.target.reset(); }
        };

        async function openEditModal(id) {
            const res = await fetch(`${API_BASE}/Users/User-Profile/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const u = await res.json();
            document.getElementById('editUserId').value = u.id; document.getElementById('editFullName').value = u.fullName; document.getElementById('editPhone').value = u.phoneNumber; document.getElementById('editRole').value = u.role; document.getElementById('editStatus').value = u.isActive.toString();
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        }

        document.getElementById('editUserForm').onsubmit = async (e) => {
            e.preventDefault();
            const data = { id: parseInt(document.getElementById('editUserId').value), fullName: document.getElementById('editFullName').value, phoneNumber: document.getElementById('editPhone').value, role: parseInt(document.getElementById('editRole').value), isActive: document.getElementById('editStatus').value === "true" };
            const res = await fetch(`${API_BASE}/Users/Update-User-Info`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide(); fetchUsers(); }
        };

        function prepareDelete(id) { userIdToDelete = id; new bootstrap.Modal(document.getElementById('deleteUserModal')).show(); }
        document.getElementById('confirmDeleteBtn').onclick = async () => {
            const res = await fetch(`${API_BASE}/Users/Remove-User/${userIdToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('deleteUserModal')).hide(); fetchUsers(); }
        };