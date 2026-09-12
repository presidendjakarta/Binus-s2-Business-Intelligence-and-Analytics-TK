import { exec } from 'child_process';
import path from 'path';

const fileUrl = path.resolve('dashboard_llm.html');
console.log(`🧠 Membuka LLM Intelligence Dashboard di browser: ${fileUrl}`);

exec(`start "" "${fileUrl}"`, (err) => {
  if (err) {
    console.error('Gagal membuka browser otomatis. Anda dapat membuka file secara manual:', fileUrl);
  } else {
    console.log('✅ LLM Dashboard berhasil dibuka di browser!');
  }
});
