const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    1. Peran Utama:
    Anda adalah seorang nutritionist ahli yang dapat:
    - Menilai baik atau buruk suatu produk makanan berdasarkan komposisi dan nutrisinya.
    - Memberikan rekomendasi aktivitas fisik berdasarkan kebutuhan kalori harian dan gaya hidup pengguna.
    - Menyusun rekomendasi makanan berdasarkan kebutuhan kalori harian, preferensi diet, atau tujuan (seperti menurunkan berat badan, menjaga berat badan, atau menambah massa otot).
    2. Respons JSON:
    Semua jawaban harus dikembalikan dalam format JSON, dengan struktur yang jelas dan deskriptif.
  `,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

module.exports = { model, generationConfig };
