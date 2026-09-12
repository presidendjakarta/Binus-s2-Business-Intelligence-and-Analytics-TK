/**
 * Prompt Template Generator untuk Gemma 3
 */
export function buildSentimentPrompt(text, score) {
  return `Anda adalah sistem AI Business Intelligence & NLP pakar analisis ulasan pengguna aplikasi Mobile JKN (BPJS Kesehatan).
Tugas Anda: Analisis teks ulasan pengguna berikut dengan sangat teliti, perhatikan bahasa gaul Indonesia, singkatan, typo, konteks tersirat, dan sarkasme/taktik rating bintang.

Data Ulasan:
- Rating Bintang: ${score} dari 5
- Isi Ulasan: "${text}"

Instruksi Output:
Kembalikan HANYA objek JSON murni tanpa markdown, dengan struktur:
{
  "sentiment": "Positif" atau "Negatif",
  "category": "Masalah Teknis & Bug" | "Layanan Faskes & Antrean" | "Fitur & UI/UX" | "Administrasi & Iuran" | "Apresiasi & Kepuasan",
  "reason": "Penjelasan ringkas 1-2 kalimat mengapa sentimen dan kategori ini dipilih",
  "confidence": 0.85
}`;
}

export default { buildSentimentPrompt };
