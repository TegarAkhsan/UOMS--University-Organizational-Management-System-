# UOMS Deployment Guide

## Arsitektur Deployment

### Struktur Lokal (Development)
```
UOMS PROJECT/
├── backend/                    # Laravel API
│   ├── app/
│   ├── bootstrap/
│   │   ├── app.php            # Development version (dengan apiPrefix default)
│   │   └── app.production.php # Production version (apiPrefix: '')
│   ├── public/
│   │   ├── index.php          # Development entry point
│   │   ├── index.production.php # Production entry point
│   │   └── artisan-web.php    # Web-based artisan runner
│   └── ...
└── frontend/                   # React/Vite Frontend
    └── dist/                   # Build output
```

### Struktur cPanel (Production)
```
/home/himy9571/
├── laravel/                    # Backend (di luar public_html)
│   ├── app/
│   ├── bootstrap/
│   │   └── app.php            # <- dari app.production.php
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   └── artisan
└── public_html/                # Web root
    ├── api/                    # Backend entry
    │   ├── index.php          # <- dari index.production.php
    │   ├── .htaccess
    │   └── artisan-web.php    # Tool untuk migrate
    ├── assets/                 # Frontend assets
    └── index.html              # Frontend entry
```

---

## Perbedaan Development vs Production

| File | Development | Production |
|------|-------------|------------|
| `bootstrap/app.php` | apiPrefix default (`api`) | `apiPrefix: ''` (kosong) |
| `public/index.php` | Path relatif `__DIR__/../` | Path ke `/home/himy9571/laravel/` |
| `.env` | DB lokal | DB cPanel |

---

## Langkah Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Commit & Push
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 3. Deploy di cPanel
1. Buka **cPanel > Git Version Control**
2. Klik **Update from Remote**
3. Klik **Deploy HEAD Commit**

### 4. Setup Database (Sekali saja)
Buka di browser:
```
https://himaforticunesa.my.id/api/artisan-web.php
```

Jalankan:
1. `migrate:fresh` - Buat tables
2. `db:seed` - Isi data awal

### 5. Clear Cache (Setiap deploy)
```
https://himaforticunesa.my.id/api/artisan-web.php?cmd=config:clear
https://himaforticunesa.my.id/api/artisan-web.php?cmd=route:clear
https://himaforticunesa.my.id/api/artisan-web.php?cmd=cache:clear
```

---

## File Konfigurasi Penting

### `.cpanel.yml`
Mengatur deployment otomatis. Key points:
- Frontend → `/home/himy9571/public_html/`
- Backend → `/home/himy9571/laravel/`
- `app.production.php` → `bootstrap/app.php`
- `index.production.php` → `api/index.php`

### `.env` Production
Buat manual di `/home/himy9571/laravel/.env`:
```env
APP_NAME=UOMS
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://himaforticunesa.my.id

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=himy9571_himaforticunesa
DB_USERNAME=himy9571
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=himaforticunesa.my.id
SESSION_DOMAIN=.himaforticunesa.my.id
```

---

## Troubleshooting

### 500 Server Error
1. Cek `.env` ada dan benar
2. Jalankan `config:clear`
3. Cek permissions storage/

### 404 Not Found
1. Cek `.htaccess` di `public_html/api/`
2. Jalankan `route:clear`

### 401 Unauthorized
1. Cek `SANCTUM_STATEFUL_DOMAINS`
2. Cek token di request

### Routes Tidak Ditemukan
1. Pastikan `apiPrefix: ''` di `app.php`
2. Jalankan `route:clear`

---

## Keamanan

⚠️ **PENTING**: Setelah production stabil, hapus file berikut:
- `/home/himy9571/public_html/api/artisan-web.php`

File ini memberikan akses untuk menjalankan artisan commands dan berbahaya jika dibiarkan di production.
