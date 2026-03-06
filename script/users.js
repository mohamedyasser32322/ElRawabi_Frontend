let allUsers = []; let filteredUsers = []; let currentPage = 1; const rowsPerPage = 10;
        let userIdToDelete = null;

        fetch('layout.html').then(res => res.text()).then(html => {
            document.getElementById('layout-root').innerHTML = html;
            if(document.getElementById('menu-Users.html')) document.getElementById('menu-Users.html').classList.add('active');
            if(document.getElementById('layout-title')) document.getElementById('layout-title').innerText = "إدارة المستخدمين";
            
            // السطر ده هو اللي ناقصك عشان الزرار يشتغل في صفحة اليوزرز
            document.getElementById('layout-logout-btn').onclick = () => { 
                localStorage.clear(); 
                window.location.href = '../Login.html'; // تأكد من مسار الصفحة عندك
            };

            initContent();
            fetchUsers();
        });
        function initContent() {
            document.getElementById('render-body').innerHTML = `
                <div class="page-header-container">
                    <div class="control-bar">
                        <div class="search-box">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="userInputSearch" class="form-control" placeholder="ابحث باسم المستخدم أو البريد الإلكتروني..." oninput="handleSearch(this.value)">
                        </div>
                        <button class="add-btn shadow-sm" data-bs-toggle="modal" data-bs-target="#addUserModal">
                            <i class="fa-solid fa-circle-plus me-2"></i> إضافة مستخدم
                        </button>
                    </div>
                </div>
                <div class="table-card">
                    <div class="table-responsive"><div id="table-container"></div></div>
                    <div class="table-footer" id="pagination-wrapper"></div>
                </div>`;
        }

        async function fetchUsers() {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('https://localhost:7203/api/Users/Get-All-Users', { headers: { 'Authorization': `Bearer ${token}` } });
                allUsers = await res.json();
                filteredUsers = [...allUsers];
                renderUI();
            } catch { document.getElementById('table-container').innerHTML = `<div class="p-5 text-center text-danger fw-bold">خطأ في الاتصال بالسيرفر</div>`; }
        }

        function renderUI() {
            const start = (currentPage - 1) * rowsPerPage;
            const paginatedItems = filteredUsers.slice(start, start + rowsPerPage);
            const getRoleLabel = (roleId) => {
                const roles = { 1: {text:'Admin', class:'role-admin'}, 2: {text:'Employee', class:'role-employee'}, 3: {text:'Client', class:'role-client'}};
                return roles[roleId] || {text: roleId, class: 'role-client'};
            };

            document.getElementById('table-container').innerHTML = `
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th style="width:60px;" class="text-center">#</th>
                            <th style="width:30%;">اسم المستخدم</th>
                            <th style="width:35%;">البريد الإلكتروني</th>
                            <th style="width:15%;">الصلاحية</th>
                            <th class="text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedItems.map((u, i) => {
                            const roleInfo = getRoleLabel(u.role);
                            return `
                            <tr>
                                <td class="text-center text-muted fw-bold">${start + i + 1}</td>
                                <td class="fw-bold">${u.fullName}</td>
                                <td class="text-muted small">${u.email}</td>
                                <td><span class="role-badge ${roleInfo.class}">${roleInfo.text}</span></td>
                                <td class="text-center">
                                    <button class="action-btn btn-view" title="عرض" onclick="viewUserDetails(${u.id})"><i class="fa-regular fa-eye"></i></button>
                                    <button class="action-btn btn-edit" title="تعديل" onclick="openEditModal(${u.id})"><i class="fa-regular fa-pen-to-square"></i></button>
                                    <button class="action-btn btn-delete" title="حذف" onclick="prepareDelete(${u.id})"><i class="fa-regular fa-trash-can"></i></button>
                                </td>
                            </tr>`}).join('')}
                    </tbody>
                </table>`;
            renderPagination();
        }

        // دالة العرض مع فحص التواريخ
        async function viewUserDetails(id) {
            const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            const body = document.getElementById('viewUserBody');
            body.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';
            modal.show();

            try {
                const res = await fetch(`https://localhost:7203/api/Users/User-Profile/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const u = await res.json();

                const formatDate = (dateStr) => {
                    if (!dateStr || dateStr.startsWith('0001')) return "غير متوفر";
                    const d = new Date(dateStr);
                    return isNaN(d.getTime()) ? "غير متوفر" : d.toLocaleDateString('ar-EG');
                };

                const lastUpdate = (!u.lastUpdatedAt || u.lastUpdatedAt.startsWith('0001')) 
                                   ? "لا يوجد تحديثات" 
                                   : new Date(u.lastUpdatedAt).toLocaleString('ar-EG');

                body.innerHTML = `
                    <div class="profile-header">
                        <div class="profile-img-circle"><i class="fa-solid fa-user"></i></div>
                        <h5 class="fw-bold mb-1">${u.fullName}</h5>
                        <span class="badge ${u.isActive ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${u.isActive ? 'text-success' : 'text-danger'} px-3 py-2">
                            ${u.isActive ? 'نشط' : 'معطل'}
                        </span>
                    </div>
                    <div class="row g-3">
                        <div class="col-12"><div class="info-card"><div class="info-icon bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-envelope"></i></div><div><span class="info-label">البريد الإلكتروني</span><span class="info-value">${u.email}</span></div></div></div>
                        <div class="col-6"><div class="info-card"><div class="info-icon bg-success bg-opacity-10 text-success"><i class="fa-solid fa-phone"></i></div><div><span class="info-label">الهاتف</span><span class="info-value" dir="ltr">${u.phoneNumber}</span></div></div></div>
                        <div class="col-6"><div class="info-card"><div class="info-icon bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-shield-halved"></i></div><div><span class="info-label">الصلاحية</span><span class="info-value">${u.role}</span></div></div></div>
                        <div class="col-6"><div class="info-card"><div class="info-icon bg-info bg-opacity-10 text-info"><i class="fa-solid fa-calendar-day"></i></div><div><span class="info-label">الإنضمام</span><span class="info-value">${formatDate(u.createdAt)}</span></div></div></div>
                        <div class="col-6"><div class="info-card"><div class="info-icon bg-dark bg-opacity-10 text-dark"><i class="fa-solid fa-clock-rotate-left"></i></div><div><span class="info-label">آخر تحديث</span><span class="info-value small">${lastUpdate}</span></div></div></div>
                    </div>`;
            } catch { body.innerHTML = '<div class="alert alert-danger">خطأ في جلب البيانات</div>'; }
        }

        // دالة التعديل (فتح المودال)
        async function openEditModal(id) {
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            try {
                const res = await fetch(`https://localhost:7203/api/Users/User-Profile/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const u = await res.json();
                document.getElementById('editUserId').value = u.id;
                document.getElementById('editFullName').value = u.fullName;
                document.getElementById('editPhone').value = u.phoneNumber;
                const roleMap = { "Admin": 1, "Employee": 2, "Client": 3 };
                document.getElementById('editRole').value = roleMap[u.role] || 3;
                document.getElementById('editStatus').value = u.isActive.toString();
                modal.show();
            } catch { alert("فشل في جلب البيانات"); }
        }

        // تنفيذ التعديل
        document.getElementById('editUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('updateUserBtn');
            btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            const data = {
                id: parseInt(document.getElementById('editUserId').value),
                fullName: document.getElementById('editFullName').value || null,
                phoneNumber: document.getElementById('editPhone').value || null,
                role: parseInt(document.getElementById('editRole').value),
                isActive: document.getElementById('editStatus').value === "true"
            };
            try {
                const res = await fetch('https://localhost:7203/api/Users/Update-User-Info', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(data)
                });
                if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide(); fetchUsers(); }
                else { alert("فشل التحديث"); }
            } catch { alert("خطأ سيرفر"); }
            finally { btn.disabled = false; btn.innerText = "تحديث البيانات"; }
        });

        // دوال الحذف
        function prepareDelete(id) { userIdToDelete = id; new bootstrap.Modal(document.getElementById('deleteUserModal')).show(); }
        document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
            const btn = this; btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            try {
                const res = await fetch(`https://localhost:7203/api/Users/Remove-User/${userIdToDelete}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('deleteUserModal')).hide(); fetchUsers(); }
            } catch { alert("خطأ"); }
            finally { btn.disabled = false; btn.innerText = "تأكيد الحذف"; userIdToDelete = null; }
        });

        // دالة البحث والترقيم
        function handleSearch(term) {
            filteredUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(term.toLowerCase()) || u.email.toLowerCase().includes(term.toLowerCase()));
            currentPage = 1; renderUI();
        }

        function renderPagination() {
            const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);
            let nav = `<div class="text-muted fw-bold small">العدد: ${filteredUsers.length}</div><nav><ul class="pagination mb-0">`;
            for (let i = 1; i <= pageCount; i++) {
                nav += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link shadow-sm" href="javascript:void(0)" onclick="currentPage=${i};renderUI();">${i}</a></li>`;
            }
            document.getElementById('pagination-wrapper').innerHTML = filteredUsers.length > 0 ? (nav + `</ul></nav>`) : '';
        }

        // إضافة مستخدم جديد
        document.getElementById('addUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const form = e.target;
            if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
            const btn = document.getElementById('saveUserBtn');
            btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> جاري الحفظ...';
            const userData = {
                fullName: document.getElementById('regFullName').value,
                email: document.getElementById('regEmail').value,
                phoneNumber: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value,
                role: parseInt(document.getElementById('regRole').value)
            };
            try {
                const res = await fetch('https://localhost:7203/api/Auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(userData)
                });
                if (res.ok) { bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide(); form.reset(); form.classList.remove('was-validated'); fetchUsers(); }
                else { const d = await res.json(); alert(d.message || "خطأ"); }
            } catch { alert("خطأ اتصال"); }
            finally { btn.disabled = false; btn.innerText = "حفظ البيانات"; }
        });
        