const { api_response } = require("../libs/response.lib");
const { model, generationConfig } = require("../configs/gemini.config");

const calculateCalories = async (req, res) => {
  try {
    const { gender, age, height, weight } = req.body;

    // Perhitungan BMR
    let dailyCalories = 0;
    if (gender === "Male") {
      dailyCalories = 88.4 + 13.4 * weight + 4.8 * height - 5.68 * age;
    } else {
      dailyCalories = 447.6 + 9.25 * weight + 3.1 * height - 4.33 * age;
    }

    // Chat dengan model untuk mendapatkan rekomendasi
    const chatSession = model.startChat({ generationConfig });
    const prompt = `
      Saya sudah menghitung kebutuhan kalori harian saya, yaitu ${Math.round(
        dailyCalories
      )} kcal. Tolong berikan rekomendasi aktivitas fisik dan makanan dengan format JSON yang **selalu** mengikuti struktur berikut:

      {
        "user_daily_calorie_needs": ${Math.round(dailyCalories)},
        "activity_recommendations": [
          {
            "name": "Berenang",
            "duration": "60 menit",
            "calories_burned": 500,
            "notes": "Berenang merupakan olahraga kardio yang efektif dan rendah dampak bagi persendian."
          }
        ],
        "meal_recommendations": [
          {
            "name": "Oatmeal",
            "calories": 350,
            "nutrients": {
              "carbohydrates": "50g",
              "protein": "10g",
              "fat": "15g",
              "fiber": "10g"
            }
          }
        ],
        "total_calories": 1800,
        "notes": "Kebutuhan kalori harian Anda diperkirakan sebesar ${Math.round(
          dailyCalories
        )} kalori per hari. Angka ini dihitung berdasarkan profil Anda, termasuk berat badan, tinggi badan, usia, dan tingkat aktivitas. Dengan mengonsumsi jumlah kalori ini, Anda dapat mempertahankan energi yang cukup untuk aktivitas sehari-hari. Untuk tujuan tertentu seperti penurunan atau peningkatan berat badan, sesuaikan asupan kalori Anda sambil tetap mempertahankan pola makan seimbang dan gaya hidup aktif."
      }

      Gunakan kebutuhan kalori harian saya (${Math.round(
        dailyCalories
      )} kcal) sebagai acuan untuk aktivitas fisik dan rekomendasi makanan. Pastikan:
      1. Terdapat 3 rekomendasi aktivitas fisik dengan durasi, estimasi kalori yang terbakar, dan catatan penjelasan untuk setiap aktivitas.
      2. Untuk makanan, berikan minimal 1 menu dengan informasi nutrisi (karbohidrat, protein, lemak, serat) dan jumlah kalorinya.
      3. Total kalori makanan tetap mendekati kebutuhan harian saya, namun pastikan fleksibilitas dalam catatan untuk menyesuaikan preferensi makanan.
    `;

    const result = await chatSession.sendMessage(prompt);

    // Parsing JSON response dari model
    const response = JSON.parse(
      result.response
        .text()
        .replace(/^```json\n/, "")
        .replace(/```$/, "")
        .replace(/`/g, "")
    );

    return api_response(200, res, req, {
      status: true,
      message: "Success calculate calories and get recommendations.",
      data: response,
    });
  } catch (error) {
    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed to process request.",
    });
  }
};

module.exports = {
  calculateCalories,
};

// {
//   "header": {
//       "time_request": "2025-01-16T09:21:53.083Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success calculate calories and get recommendations.",
//       "data": {
//           "user_daily_calorie_needs": 1538,
//           "activity_recommendations": [
//               {
//                   "activity": "Berenang",
//                   "duration": "60 menit",
//                   "calories_burned": 500,
//                   "notes": "Berenang merupakan olahraga kardio yang efektif dan rendah dampak bagi persendian.  Sesuaikan intensitas dan durasi sesuai kemampuan."
//               },
//               {
//                   "activity": "Jalan Cepat",
//                   "duration": "45 menit",
//                   "calories_burned": 250,
//                   "notes": "Jalan cepat adalah olahraga mudah dilakukan dan dapat dilakukan kapan saja.  Cobalah untuk menjaga kecepatan yang konsisten."
//               },
//               {
//                   "activity": "Yoga atau Pilates",
//                   "duration": "30 menit",
//                   "calories_burned": 150,
//                   "notes": "Yoga dan Pilates meningkatkan fleksibilitas, kekuatan, dan keseimbangan.  Pilih kelas yang sesuai dengan tingkat kemampuan Anda."
//               }
//           ],
//           "meal_recommendations": [
//               {
//                   "name": "Oatmeal dengan Buah dan Kacang",
//                   "calories": 350,
//                   "nutrients": {
//                       "carbohydrates": "50g",
//                       "protein": "10g",
//                       "fat": "15g",
//                       "fiber": "10g"
//                   }
//               },
//               {
//                   "name": "Salad Ayam Panggang",
//                   "calories": 400,
//                   "nutrients": {
//                       "carbohydrates": "30g",
//                       "protein": "35g",
//                       "fat": "15g",
//                       "fiber": "8g"
//                   }
//               },
//               {
//                   "name": "Ikan Bakar dengan Brokoli",
//                   "calories": 388,
//                   "nutrients": {
//                       "carbohydrates": "25g",
//                       "protein": "30g",
//                       "fat": "18g",
//                       "fiber": "7g"
//                   }
//               }
//           ],
//           "total_calories": 1138,
//           "notes": "Rekomendasi makanan di atas memberikan sekitar 1138 kalori.  Anda masih memiliki fleksibilitas untuk menambahkan camilan sehat seperti buah-buahan, yogurt rendah lemak, atau segenggam kacang-kacangan untuk mencapai kebutuhan kalori harian Anda (1538 kalori).  Pastikan untuk menyesuaikan porsi makanan dan jenis aktivitas fisik  sesuai dengan preferensi dan kebutuhan Anda.  Konsultasikan dengan dokter atau ahli gizi untuk rencana diet yang lebih personal dan terperinci."
//       }
//   }
// }
