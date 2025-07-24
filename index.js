// File: index.js
// Ini adalah kode utama untuk server proksi kita.

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Inisialisasi aplikasi express
const app = express();

// Gunakan middleware 'cors' untuk mengizinkan permintaan
// dari aplikasi frontend Anda ke server proksi ini.
app.use(cors());

// --- HALAMAN SAMBUTAN (BARU) ---
// Tambahkan route untuk root URL (/) agar memberikan pesan sambutan.
// Ini mengatasi error "Cannot GET /" dan memberikan konfirmasi bahwa server berjalan.
app.get('/', (req, res) => {
    res.status(200).send(`
        <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
            <h1>CORS Proxy Server Aktif!</h1>
            <p>Server proksi ini berjalan dan siap meneruskan permintaan Anda.</p>
            <p>Gunakan path <code>/api</code> untuk meneruskan permintaan ke Facebook Graph API.</p>
            <p><strong>Contoh Penggunaan:</strong> <code>${req.protocol}://${req.get('host')}/api/v19.0/ads_archive?search_terms=...</code></p>
        </div>
    `);
});


// --- Konfigurasi Utama Proksi ---

// URL dasar dari Facebook Graph API (Ad Library)
const API_SERVICE_URL = "https://graph.facebook.com";

// Opsi untuk proksi. Ini adalah bagian terpenting.
const proxyOptions = {
    // Menentukan API target yang akan kita hubungi
    target: API_SERVICE_URL,
    
    // Wajib 'true'. Ini akan mengubah header 'Host' dari permintaan
    // agar cocok dengan 'target', yang diperlukan oleh banyak API.
    changeOrigin: true,
    
    // Menulis ulang path permintaan. Ini membuat URL di frontend lebih rapi.
    // Contoh: permintaan ke '/api/v19.0/ads_archive' akan diteruskan
    // menjadi 'https://graph.facebook.com/v19.0/ads_archive'
    pathRewrite: {
        '^/api': '', // Hapus '/api' dari awal path
    },
    
    // Fungsi untuk logging (opsional, tapi sangat membantu saat debugging)
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] Meneruskan permintaan dari ${req.originalUrl} ke ${API_SERVICE_URL}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy] Menerima respons dengan status: ${proxyRes.statusCode}`);
    }
};

// Buat middleware proksi dengan opsi yang sudah kita tentukan
const apiProxy = createProxyMiddleware(proxyOptions);

// --- Terapkan Proksi ke Aplikasi ---

// Semua permintaan yang masuk ke path '/api' akan ditangani oleh proksi
app.use('/api', apiProxy);

// Definisikan port. Vercel akan menyediakannya secara otomatis.
const PORT = process.env.PORT || 3001;

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server proksi CORS berjalan di port ${PORT}`);
});

// Ekspor aplikasi untuk Vercel
module.exports = app;
