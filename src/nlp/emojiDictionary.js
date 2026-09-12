/**
 * Kamus Pemetaan Emoji & Emotikon ke Token Sentimen Bahasa Indonesia
 * Memungkinkan Naive Bayes dan NLP mengklasifikasikan ulasan yang memuat emoji / simbol
 */
export const EMOJI_DICTIONARY = {
  // Emoji Positif (Pujian, Terima Kasih, Doa, Kepuasan)
  '👍': 'emoji_jempol_bagus',
  '👍🏻': 'emoji_jempol_bagus',
  '👍🏼': 'emoji_jempol_bagus',
  '👍🏽': 'emoji_jempol_bagus',
  '👍🏾': 'emoji_jempol_bagus',
  '👍🏿': 'emoji_jempol_bagus',
  '🙏': 'emoji_terima_kasih',
  '🙏🏻': 'emoji_terima_kasih',
  '🙏🏼': 'emoji_terima_kasih',
  '🙏🏽': 'emoji_terima_kasih',
  '🙏🏾': 'emoji_terima_kasih',
  '🙏🏿': 'emoji_terima_kasih',
  '🤲': 'emoji_doa_bersyukur',
  '❤️': 'emoji_cinta_suka',
  '❤': 'emoji_cinta_suka',
  '💖': 'emoji_cinta_suka',
  '💗': 'emoji_cinta_suka',
  '💓': 'emoji_cinta_suka',
  '💞': 'emoji_cinta_suka',
  '💕': 'emoji_cinta_suka',
  '🥰': 'emoji_sangat_puas',
  '😍': 'emoji_sangat_suka',
  '😊': 'emoji_senang_puas',
  '😁': 'emoji_senang_puas',
  '😃': 'emoji_senang_puas',
  '😄': 'emoji_senang_puas',
  '😆': 'emoji_senang_puas',
  '☺': 'emoji_senang_puas',
  '😇': 'emoji_sangat_baik',
  '😎': 'emoji_mantap_keren',
  '🥳': 'emoji_hebat_selamat',
  '👏': 'emoji_tepuk_tangan',
  '🙌': 'emoji_hebat_mantap',
  '🎉': 'emoji_hebat_selamat',
  '🔥': 'emoji_mantap_keren',
  '⭐': 'emoji_bintang_bagus',
  '🌟': 'emoji_bintang_bagus',
  '💯': 'emoji_sempurna_mantap',
  '💪': 'emoji_semangat_hebat',
  '👌': 'emoji_mantap_oke',
  '🫡': 'emoji_siap_mantap',
  '😘': 'emoji_cinta_suka',
  '🤩': 'emoji_luar_biasa',
  '🤗': 'emoji_ramah_senang',

  // Emoji Negatif (Marah, Kecewa, Muak, Menangis, Rusak, Keluhan)
  '👎': 'emoji_buruk_kecewa',
  '👎🏻': 'emoji_buruk_kecewa',
  '👎🏼': 'emoji_buruk_kecewa',
  '👎🏽': 'emoji_buruk_kecewa',
  '👎🏾': 'emoji_buruk_kecewa',
  '👎🏿': 'emoji_buruk_kecewa',
  '😡': 'emoji_marah_kesal',
  '😠': 'emoji_marah_kesal',
  '🤬': 'emoji_sangat_marah',
  '🤮': 'emoji_muak_buruk',
  '🤢': 'emoji_muak_buruk',
  '😭': 'emoji_menangis_sedih',
  '😢': 'emoji_menangis_sedih',
  '😔': 'emoji_kecewa_sedih',
  '😞': 'emoji_kecewa_sedih',
  '😣': 'emoji_sulit_menderita',
  '😩': 'emoji_lelah_frustrasi',
  '😫': 'emoji_lelah_frustrasi',
  '😓': 'emoji_kecewa_lelah',
  '🥲': 'emoji_kecewa_sedih',
  '😤': 'emoji_kesal_jengkel',
  '🥵': 'emoji_kesal_emosi',
  '💔': 'emoji_patah_hati_kecewa',
  '💩': 'emoji_sampah_buruk',
  '🔪': 'emoji_bahaya_ancaman',
  '💥': 'emoji_rusak_hancur',
  '⚠️': 'emoji_peringatan_masalah',
  '❌': 'emoji_salah_gagal',
  '🚫': 'emoji_tidak_bisa',
  '⛔': 'emoji_tidak_bisa',
  '🤦': 'emoji_pusing_kecewa',
  '🤦‍♂️': 'emoji_pusing_kecewa',
  '🤦‍♀️': 'emoji_pusing_kecewa',
  '🙄': 'emoji_kesal_bosan',
  '😒': 'emoji_tidak_suka',
  '🥱': 'emoji_bosan_kecewa',

  // Emotikon / Icon Netral / Tertawa
  '😂': 'emoji_lucu_tawa',
  '🤣': 'emoji_lucu_tawa',
  '🤔': 'emoji_bingung_tanya'
};

/**
 * Menerjemahkan emoji dalam teks ke kata deskriptif sentimen
 * @param {string} text - Teks mentah berisi emoji
 * @returns {string} - Teks dengan emoji yang telah diterjemahkan
 */
export function translateEmojis(text) {
  if (!text) return '';
  let result = text;
  for (const [emoji, replacement] of Object.entries(EMOJI_DICTIONARY)) {
    if (result.includes(emoji)) {
      result = result.replaceAll(emoji, ` ${replacement} `);
    }
  }
  return result;
}

export default { EMOJI_DICTIONARY, translateEmojis };
