fetch('layout.html').then(res => res.text()).then(html => {
    const layoutRoot = document.getElementById('layout-root');
    if (layoutRoot) layoutRoot.innerHTML = html;

    const menuDash = document.getElementById('menu-Dashboard.html');
    if (menuDash) menuDash.classList.add('active');

    const layoutTitle = document.getElementById('layout-title');
    if (layoutTitle) layoutTitle.innerText = "لوحة التحكم الرئيسية";

    const logoutBtn = document.getElementById('layout-logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.clear();
            window.location.href = '../Login.html';
        };
    }

    const renderBody = document.getElementById('render-body');
if (renderBody) {
    renderBody.innerHTML = `
        <div class="p-4" style="min-height:80vh;">
            <div class="row g-4 mb-4">
            </div>  
        </div>`;
}

    if (typeof initContent === "function") initContent();
    if (typeof fetchProjects === "function") fetchProjects();
});