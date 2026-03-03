    const loginForm = document.querySelector('form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('https://localhost:7203/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('userEmail', result.email);
                localStorage.setItem('userRole', result.role);

                if (result.role === 'Admin') {
                    window.location.href = 'Admin/Dashboard.html';
                } else {
                    window.location.href = 'Client/Index.html';
                }
            } else {
                alert('فشل تسجيل الدخول: ' + (result.message || 'تأكد من البيانات'));
            }
        } catch (error) {
            console.error('Connection Error:', error);
            alert('تأكد من تشغيل مشروع الباك إند على بورت 7203');
        }
    });