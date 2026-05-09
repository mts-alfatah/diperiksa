document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForms = document.querySelectorAll('.login-form');
    const togglePasswords = document.querySelectorAll('.toggle-password');
    const nisnInput = document.getElementById('nisn');

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            
            // Handle form transitions
            loginForms.forEach(form => {
                if (form.id === targetId) {
                    form.classList.remove('inactive-left');
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                    // Add inactive-left class if it's switching from Siswa to Guru
                    // We can just use a simple translation
                    form.style.transform = targetId === 'guru-form' ? 'translateX(-20px)' : 'translateX(20px)';
                    setTimeout(() => {
                        if (!form.classList.contains('active')) {
                            form.style.transform = '';
                        }
                    }, 400);
                }
            });
        });
    });

    // Password Visibility Toggle
    togglePasswords.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

});

// Toast Notification Function
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    // Reset classes
    toast.className = 'toast';
    toastIcon.className = 'fa-solid toast-icon';

    // Set message and type
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.classList.add('error');
        toastIcon.classList.add('fa-circle-exclamation');
    } else {
        toast.classList.add('success');
        toastIcon.classList.add('fa-circle-check');
    }

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Konfigurasi Google Sheet
// 1. Buat Google Sheet, isi NISN di Kolom A (mulai dari baris 2 atau baris 1 terserah)
// 2. Klik Share -> "Anyone with the link can view"
// 3. Salin ID Spreadsheet dari URL (karakter panjang di antara /d/ dan /edit)
const SPREADSHEET_ID = '1jFFuABePc7tGcc0rG7K8G0aV4lRIQJuVuV-FzDIAzf4'; 

// Form Submission Logic
async function handleLogin(event, role) {
    event.preventDefault();

    const btn = event.target.querySelector('.submit-btn');
    const originalBtnContent = btn.innerHTML;

    if (role === 'siswa') {
        const nisn = document.getElementById('nisn').value;

        if (nisn.trim() === '' || nisn.length < 5) {
            showToast('Format NISN tidak valid. Masukkan NISN yang benar.', 'error');
            return;
        }

        // Tampilkan status loading
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memeriksa Data...';
        btn.disabled = true;

        try {
            if (SPREADSHEET_ID === 'MASUKKAN_ID_SPREADSHEET_ANDA_DISINI') {
                // --- MODE SIMULASI JIKA SPREADSHEET ID BELUM DIGANTI ---
                console.warn('Spreadsheet ID belum diisi! Menggunakan simulasi login.');
                await new Promise(r => setTimeout(r, 1200));
                
                // Anggap login berhasil untuk simulasi
                showToast('Login berhasil! (Mode Simulasi)', 'success');
                simulateRedirect('dashboard-siswa.html');
                return;
            }

            // --- MODE ASLI: Cek ke Google Sheet Menggunakan JSONP ---
            // JSONP menghindari masalah blokir CORS (Cross-Origin) saat dijalankan di file lokal
            const jsonData = await new Promise((resolve, reject) => {
                const callbackName = 'gvizCallback_' + Math.round(100000 * Math.random());
                
                // Fungsi yang akan dipanggil oleh Google ketika data siap
                window[callbackName] = function(data) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    resolve(data);
                };

                const script = document.createElement('script');
                // Menggunakan responseHandler agar formatnya JSONP (menjalankan fungsi di atas)
                script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&tq=SELECT%20A`;
                
                script.onerror = function() {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('Koneksi diblokir atau file tidak publik.'));
                };
                
                document.body.appendChild(script);
            });
            
            // Ambil semua data baris dari kolom A
            const rows = jsonData.table.rows;
            let nisnFound = false;

            for (let i = 0; i < rows.length; i++) {
                if (rows[i].c[0] && rows[i].c[0].v != null) {
                    let sheetNisn = rows[i].c[0].f ? String(rows[i].c[0].f) : String(rows[i].c[0].v);
                    sheetNisn = sheetNisn.replace(/[,.]/g, '').trim();
                    if (sheetNisn.length === 9) sheetNisn = "0" + sheetNisn;
                    
                    if (sheetNisn === nisn.trim()) {
                        nisnFound = true;
                        break;
                    }
                }
            }

            if (nisnFound) {
                sessionStorage.setItem('siswaNISN', nisn.trim());
                showToast('Login berhasil! NISN ditemukan.', 'success');
                simulateRedirect('dashboard-siswa.html');
            } else {
                showToast('NISN tidak terdaftar di database kami.', 'error');
                btn.innerHTML = originalBtnContent;
                btn.disabled = false;
            }

        } catch (error) {
            console.error('Error fetching Google Sheet:', error);
            showToast('Koneksi ke database gagal. Pastikan link Google Sheet diset publik.', 'error');
            btn.innerHTML = originalBtnContent;
            btn.disabled = false;
        }

    } else if (role === 'guru') {
        const password = document.getElementById('password-guru').value;

        if (password.trim() === '') {
            showToast('Password tidak boleh kosong!', 'error');
            return;
        }

        const btn = document.querySelector('.login-form.active .submit-btn');
        const originalBtnContent = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memeriksa Data...';
        btn.disabled = true;

        try {
            const SHEET_GURU = 'Guru';
            const jsonGuru = await new Promise((resolve, reject) => {
                const callbackName = 'gvizCallbackGuru_' + Math.round(100000 * Math.random());
                window[callbackName] = function(data) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    resolve(data);
                };

                const script = document.createElement('script');
                // Mengambil Kolom A (NISN/Password) dan Kolom B (Nama Lengkap)
                script.src = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_GURU)}&tqx=out:json;responseHandler:${callbackName}&tq=SELECT%20A,B`;
                script.onerror = () => {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('Koneksi diblokir atau file tidak publik.'));
                };
                document.body.appendChild(script);
            });

            const rows = jsonGuru.table.rows;
            let guruFound = false;
            let namaGuru = "Guru BK";

            for (let i = 0; i < rows.length; i++) {
                if (rows[i].c[0] && rows[i].c[0].v != null) {
                    const sheetPassword = String(rows[i].c[0].v).trim();
                    if (sheetPassword === password.trim()) {
                        guruFound = true;
                        if (rows[i].c[1] && rows[i].c[1].v != null) {
                            namaGuru = String(rows[i].c[1].v).trim();
                        }
                        break;
                    }
                }
            }

            if (guruFound) {
                sessionStorage.setItem('guruNama', namaGuru);
                showToast('Login berhasil! Selamat datang, ' + namaGuru, 'success');
                simulateRedirect('dashboard-guru.html');
            } else {
                showToast('Password (NISN) salah atau tidak terdaftar.', 'error');
                btn.innerHTML = originalBtnContent;
                btn.disabled = false;
            }

        } catch (error) {
            console.error(error);
            showToast('Koneksi database Guru gagal. Pastikan Sheet "Guru" dibuat.', 'error');
            btn.innerHTML = originalBtnContent;
            btn.disabled = false;
        }
    }
}

function simulateRedirect(url) {
    const btn = document.querySelector('.login-form.active .submit-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...';
    btn.style.opacity = '0.8';
    btn.style.cursor = 'not-allowed';
    
    setTimeout(() => {
        window.location.href = url;
    }, 1500);
}

// Mendaftarkan Service Worker untuk fitur PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
