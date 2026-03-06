document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const errorDiv = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. تجهيز حالة الـ Loading وإخفاء الأخطاء السابقة
        errorDiv.classList.add('d-none');
        btnSubmit.disabled = true;
        btnText.innerText = "جاري التحقق...";
        btnLoader.classList.remove('d-none');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://localhost:7203/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                // حفظ بيانات الجلسة
                localStorage.setItem('token', result.token);
                localStorage.setItem('userEmail', result.email);
                localStorage.setItem('userRole', result.role);

                // التوجيه بناءً على الصلاحيات
                if (result.role === 'Admin') {
                    window.location.href = 'Admin/Dashboard.html';
                } else {
                    window.location.href = 'Client/Index.html';
                }
            } else {
                // 2. تعريب رسالة الخطأ ومعالجة الـ Invalid
                let msg = result.message || '';
                if (msg.toLowerCase().includes('invalid')) {
                    showError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى');
                } else {
                    showError(msg || 'تأكد من صحة البريد الإلكتروني وكلمة المرور');
                }
            }
        } catch (error) {
            console.error('Connection Error:', error);
            showError('مشكلة في السيرفر');
        } finally {
            // 3. إعادة الزر لحالته الطبيعية في حال الفشل
            btnSubmit.disabled = false;
            btnText.innerText = "تسجيل الدخول";
            btnLoader.classList.add('d-none');
        }
    });

    // وظيفة إظهار الخطأ
    function showError(msg) {
        errorDiv.innerText = msg;
        errorDiv.classList.remove('d-none');
    }
});