async function test() {
  const start = Date.now();
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma3:latest',
      prompt: `Analisis ulasan Mobile JKN:
Rating: 3
Ulasan: "susah buat daftar seperti tidak ada perbaikan"
Kembalikan format JSON:
{
  "sentiment": "Positif" atau "Negatif",
  "category": "Fitur & UI/UX" | "Masalah Teknis & Bug" | "Layanan Faskes & Antrean" | "Apresiasi & Kepuasan" | "Administrasi & Iuran",
  "reason": "Alasan singkat",
  "confidence": 0.95
}`,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1
      }
    })
  });
  const data = await res.json();
  console.log('Waktu Inferensi:', Date.now() - start, 'ms');
  console.log('Output JSON Gemma 3:', data.response);
}

test();
