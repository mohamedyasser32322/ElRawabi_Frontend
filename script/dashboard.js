fetch('layout.html').then(res => res.text()).then(html => {
            document.getElementById('layout-root').innerHTML = html;
            document.getElementById('menu-Dashboard.html').classList.add('active');
            document.getElementById('layout-title').innerText = "لوحة التحكم الرئيسية";
            document.getElementById('layout-logout-btn').onclick = () => { localStorage.clear(); window.location.href = '../Login.html'; };
            
            document.getElementById('render-body').innerHTML = `
                <div class="card border-0 shadow-sm p-4" style="border-radius:12px; min-height:80vh; background:white;">
                    <h5 class="fw-bold text-muted">مرحباً بك في نظام الروابي العقاري</h5>
                    <hr>
                    <p class="text-secondary">اختر من القائمة الجانبية للبدء في إدارة النظام.</p>
                </div>`;
        });