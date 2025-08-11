const axios = require("axios");
const { api_response } = require("../libs/response.lib");
const { model, generationConfig } = require("../configs/gemini.config");
const product_model = require("../databases/models/product.model");
const { v1 } = require("uuid");

const getProducts = async (req, res) => {
  try {
    let result = "";

    if (!req.query.search) {
      result = await axios.get(
        `https://search.openfoodfacts.org/search?q=countries_tags:"en:indonesia"&page_size=20&page=1&fields=code,product_name,image_url,labels`
      );
    } else {
      result = await axios.get(
        `https://search.openfoodfacts.org/search?q=countries_tags:"en:indonesia" AND product_name="${req.query.search}"&page_size=20&page=1&fields=code,product_name,image_url,labels`
      );
    }

    return api_response(200, res, req, {
      status: true,
      message: "Success get data products.",
      data: result.data.hits
        .filter((item) => item.product_name && item.code && item.image_url)
        .map((item) => ({
          upc: item.code,
          title: item.product_name,
          image: item.image_url,
        })),
    });
  } catch (error) {
    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed get data products.",
    });
  }
};

const getEvaluateScore = async (product) => {
  try {
    // Chat dengan model untuk mendapatkan rekomendasi
    const chatSession = model.startChat({ generationConfig });
    const prompt = `
      Evaluasi dan nilai apakah produk ini baik atau buruk untuk kesehatan berdasarkan komposisi gizi, bahan-bahan, dan kandungan lainnya.

      ${JSON.stringify(product, null, 2)}

      Berikan penilaian kesehatan produk berdasarkan kalori, lemak jenuh, gula, sodium (garam), bahan-bahan, dan potensi risiko bagi sebagian orang dalam format JSON. Sertakan status produk (baik atau buruk) beserta alasan singkatnya. Gunakan istilah yang mudah dipahami dengan tanda kurung (contoh: garam [sodium]).

      Tolong berikan dengan format JSON yang **selalu** mengikuti struktur berikut:
      {
        "product": "Snickers Big Bag Mini 19.5 Oz 20 Ct",
        "evaluation": "D",
        "reasoning": "Deskripsi singkat terlebih dahulu. Snickers Big Bag Mini mengandung gula yang sangat tinggi (18g per sajian), lebih dari batas yang disarankan untuk konsumsi harian. Juga mengandung lemak jenuh yang cukup banyak (3g), yang bisa meningkatkan kadar kolesterol. Meskipun kadar garam (sodium) dalam produk ini relatif rendah (80mg), tingginya kandungan gula dan lemak jenuh membuatnya tidak baik untuk kesehatan. Selain itu, produk ini rendah serat dan protein, jadi hanya memberikan kalori tanpa banyak nutrisi penting. Jika dikonsumsi berlebihan, bisa meningkatkan risiko obesitas, penyakit jantung, dan diabetes. Sebaiknya batasi konsumsi camilan ini dan pilih camilan yang lebih sehat seperti buah atau kacang-kacangan.",
        "nutrients": [
          {
            "name": "Kalori",
            "amount": 200,
            "unit": "kcal",
            "description": "Energi yang diberikan per porsi. Untuk diet sehat, rata-rata kebutuhan harian sekitar 2000 kcal."
          },
          {
            "name": "Protein",
            "amount": 4,
            "unit": "g",
            "description": "Membantu pertumbuhan otot dan pemulihan tubuh. Disarankan 50g protein per hari untuk orang dewasa."
          },
          {
            "name": "Sodium",
            "amount": 410,
            "unit": "mg",
            "description": "Sangat tinggi! Batas harian yang disarankan adalah 2300 mg, jadi produk ini mengandung hampir 20% dari batas harian hanya dalam satu porsi."
          },
          {
            "name": "Gula",
            "amount": 3,
            "unit": "g",
            "description": "Rendah, tetapi tetap perlu dikontrol jika dikonsumsi dengan makanan lain yang tinggi gula."
          }
        ]
      }

      Jika terdapat nurtiens yang tidak terdapat dalam produk, tidak perlu disertakan dalam JSON.
    `;

    const result = await chatSession.sendMessage(prompt);

    // Parsing JSON response dari model
    return JSON.parse(
      result.response
        .text()
        .replace(/^```json\n/, "")
        .replace(/```$/, "")
        .replace(/`/g, "")
    );
  } catch (error) {
    throw new Error(error || "Failed to evaluate product.");
  }
};

const getProduct = async (req, res) => {
  try {
    const productInDb = await product_model.findOne({
      where: { upc: req.query.upc },
    });

    if (productInDb) {
      return api_response(200, res, req, {
        status: true,
        message: "Success get data product.",
        data: {
          product: productInDb,
        },
      });
    }

    const result = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${req.query.upc}?fields=product_name,brands,quantity,labels_tags,countries_tags,,nutriments,image_url,serving_quantity,serving_quantity_unit,serving_size,ingredients`
    );

    let product = {
      upc: result.data.code,
      brand: result.data.product.brands,
      title: capitalizeFirstLetter(result.data.product.product_name),
      image: result.data.product.image_url,
      nutrition: result.data.product.nutriments,
      serving_quantity: result.data.product.serving_quantity,
      serving_quantity_unit: result.data.product.serving_quantity_unit,
      serving_size: result.data.product.serving_size,
      ingredients: result.data.product.ingredients || [],
      labels_tags: result.data.product.labels_tags || [],
    };

    // // Panggil fungsi getEvaluateScore
    const score = await getEvaluateScore(product);
    product.nutrition = score.nutrients;
    product.score = {
      evaluation: score.evaluation,
      reasoning: score.reasoning,
    };

    const newProduct = await product_model.create({
      id: `PRD-${v1()}`,
      upc: product.upc,
      title: product.title,
      image: product.image,
      nutrition: product.nutrition,
      score: product.score,
    });

    return api_response(200, res, req, {
      status: true,
      message: "Success get data product.",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed get data product.",
    });
  }
};

const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

module.exports = {
  getProducts,
  getProduct,
};
