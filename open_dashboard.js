import { exec } from 'child_process';
import path from 'path';

const fileUrl = path.resolve('dashboard.html');
console.log(`🌐 Membuka Dashboard Grafik di browser: ${fileUrl}`);

// Buka file di browser default pada Windows
exec(`start "" "${fileUrl}"`, (err) => {
  if (err) {
    console.error('Gagal membuka browser otomatis. Anda dapat membuka file secara manual:', fileUrl);
  } else {
    console.log('✅ Dashboard berhasil dibuka di browser!');
  }
});
