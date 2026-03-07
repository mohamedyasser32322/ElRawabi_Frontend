let allProjects = [],
            filteredProjects = [],
            currentPage = 1,
            itemsPerPage = 8,
            projectIdToDelete = null;
        const token = localStorage.getItem('token');

        fetch('layout.html').then(res => res.text()).then(html => {
            document.getElementById('layout-root').innerHTML = html;

    
            if (document.getElementById('layout-title')) {
                document.getElementById('layout-title').innerText = "إدارة المشاريع";
            }

            const menuIcon = document.getElementById('menu-Projects.html');
            if (menuIcon) menuIcon.classList.add('active');

            // 3. برمجة زر تسجيل الخروج
            const logoutBtn = document.getElementById('layout-logout-btn');
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    localStorage.clear();
                    window.location.href = '../Login.html';
                };
            }

            initContent();
            fetchProjects();
        });

        function initContent() {
            const layoutHeader = document.querySelector('.header-bar');
            if (layoutHeader) {
                layoutHeader.innerHTML = `
                    <div class="d-flex align-items-center w-100">
                        <h4 class="m-0" style="font-weight: 800; color: #1e293b; font-size: 1.3rem;">إدارة المشاريع</h4>
                    </div>
                `;
            }

            const renderBody = document.getElementById('render-body');
            if (!renderBody) return;
            renderBody.innerHTML = `
                <div class="page-top-bar">
                    <div class="control-bar">
                        <div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="بحث باسم المشروع..." oninput="handleSearch(this.value)"></div>
                        <button class="add-btn" onclick="openModal()"><i class="fa-solid fa-plus"></i> إضافة مشروع</button>
                    </div>
                </div>
                <div class="main-wrapper"><div id="projectsGrid" class="projects-grid"></div></div>
                <div class="page-footer-nav" id="pagination-wrapper"></div>`;
        }

        async function fetchProjects() {
            try {
                const res = await fetch('https://localhost:7203/api/Projects/Get-All-Projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                allProjects = await res.json();
                filteredProjects = [...allProjects];
                renderUI();
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        }

        function renderUI() {
            const grid = document.getElementById('projectsGrid');
            if (!grid) return;
            const start = (currentPage - 1) * itemsPerPage;
            const items = filteredProjects.slice(start, start + itemsPerPage);

            grid.innerHTML = items.map(p => `
                <div class="project-card" onclick="window.location.href='ProjectDetails.html?id=${p.id}'">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="project-icon"><i class="fa-solid fa-building-circle-check"></i></div>
                        <div style="overflow:hidden">
                            <h5 class="m-0 text-truncate" style="font-size:1rem; font-weight:700;">${p.name}</h5>
                        </div>
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                        <span class="loc-badge"><i class="fa-solid fa-location-dot me-1"></i>${p.location}</span>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm" onclick="event.stopPropagation(); openModal(${p.id})"><i class="fa-solid fa-pen-to-square text-success"></i></button>
                            <button class="btn btn-sm" onclick="event.stopPropagation(); prepareDelete(${p.id})"><i class="fa-solid fa-trash-can text-danger"></i></button>
                        </div>
                    </div>
                </div>`).join('');
            renderPagination();
        }

        function renderPagination() {
            const wrapper = document.getElementById('pagination-wrapper');
            if (!wrapper) return;
            const pageCount = Math.ceil(filteredProjects.length / itemsPerPage);
            let nav = `<div class="small text-muted fw-bold">الإجمالي: ${filteredProjects.length}</div><nav><ul class="pagination mb-0">`;
            for (let i = 1; i <= pageCount; i++) {
                nav += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link shadow-sm" href="javascript:void(0)" onclick="currentPage=${i};renderUI();">${i}</a></li>`;
            }
            wrapper.innerHTML = filteredProjects.length > 0 ? (nav + `</ul></nav>`) : '';
        }

        function handleSearch(t) {
            filteredProjects = allProjects.filter(p => p.name.toLowerCase().includes(t.toLowerCase()));
            currentPage = 1;
            renderUI();
        }

        function openModal(id = null) {
            const modal = new bootstrap.Modal(document.getElementById('projectModal'));
            document.getElementById('projectForm').reset();
            document.getElementById('projectId').value = id || "";
            if (id) {
                const p = allProjects.find(x => x.id === id);
                document.getElementById('pName').value = p.name;
                document.getElementById('pLocation').value = p.location;
                document.getElementById('pDescription').value = p.description;
            }
            modal.show();
        }

        document.getElementById('projectForm').onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('projectId').value;
            const data = {
                name: document.getElementById('pName').value,
                location: document.getElementById('pLocation').value,
                description: document.getElementById('pDescription').value
            };
            if (id) data.id = parseInt(id);

            const url = id ? 'https://localhost:7203/api/Projects/Update-Project-Info' : 'https://localhost:7203/api/Projects/Create-Project';
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
                fetchProjects();
            }
        };

        function prepareDelete(id) {
            projectIdToDelete = id;
            new bootstrap.Modal(document.getElementById('deleteProjectModal')).show();
        }

        document.getElementById('confirmDeleteBtn').onclick = async () => {
            const res = await fetch(`https://localhost:7203/api/Projects/Remove-Project/${projectIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById('deleteProjectModal')).hide();
                fetchProjects();
            }
        };