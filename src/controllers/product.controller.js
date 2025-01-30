const axios = require("axios");
const { api_response } = require("../libs/response.lib");
const { model, generationConfig } = require("../configs/gemini.config");
const product_model = require("../databases/models/product.model");
const { v1 } = require("uuid");

const getProducts = async (req, res) => {
  try {
    const result = await axios.get(
      `https://api.spoonacular.com/food/products/search?query=${req.query.search}&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    return api_response(200, res, req, {
      status: true,
      message: "Success get data products.",
      data: result.data,
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

      Berikan penilaian apakah produk ini sehat atau tidak berdasarkan beberapa aspek: kandungan kalori, kadar lemak jenuh, kandungan gula, kandungan sodium, bahan-bahan yang digunakan, dan apakah ada bahan yang berisiko atau tidak aman bagi sebagian orang. Jawaban harus berupa JSON yang jelas dengan status produk tersebut (baik atau buruk), beserta alasan yang mendukung penilaian tersebut.

      Tolong berikan dengan format JSON yang **selalu** mengikuti struktur berikut:
      {
        "product": "SNICKERS Minis Size Chocolate Candy Bars Variety Mix 10.5-oz. Bag",
        "evaluation": "D",
        "reasoning": "Penjelasan Deskripsi makanan nya terlebih dahulu, kemudian jelaskan kandungannya. Makanan ini mengandung 180 kalori per porsi, tergolong tinggi dan dapat berkontribusi signifikan pada asupan harian, terutama bagi yang memiliki kebutuhan kalori rendah. Lemak jenuh mencapai 8g (40% dari nilai harian), yang dapat meningkatkan kolesterol LDL dan risiko penyakit jantung, sehingga perlu dibatasi. Kandungan gula yang tinggi (20g) dapat memicu penambahan berat badan dan masalah kesehatan lainnya, sementara natrium 85mg masih dalam kategori sedang, tetapi tetap perlu diawasi. Makanan ini mengandung bahan kurang sehat seperti sirup jagung, minyak inti sawit terhidrogenasi, dan perasa buatan. Jika alergi terhadap kacang, susu, atau kedelai, pastikan membaca label dengan cermat. Sebaiknya pilih camilan dengan bahan lebih alami dan minim olahan.",
      }
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

const getProductByUpc = async (req, res) => {
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
      `https://api.spoonacular.com/food/products/upc/${req.query.upc}?apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    result.data.nutrition.nutrients = result.data.nutrition.nutrients.filter(
      (n) => n.amount > 0
    );

    let product = {
      id: result.data.id,
      upc: result.data.upc,
      title: result.data.title,
      image: result.data.image,
      description: result.data.description,
      nutrition: result.data.nutrition.filter((n) => n.amount > 0),
    };

    // Panggil fungsi getEvaluateScore
    const score = await getEvaluateScore(product);
    product.score = score;

    const newProduct = await product_model.create({
      id: `PRD-${v1()}`,
      idSpoonacular: product.id,
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

const getProduct = async (req, res) => {
  try {
    const productInDb = await product_model.findOne({
      where: { idSpoonacular: req.query.id },
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
      `https://api.spoonacular.com/food/products/${req.query.id}?apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    result.data.nutrition.nutrients = result.data.nutrition.nutrients.filter(
      (n) => n.amount > 0
    );

    let product = {
      id: result.data.id,
      upc: result.data.upc,
      title: result.data.title,
      image: result.data.image,
      description: result.data.description,
      nutrition: result.data.nutrition,
    };

    // // Panggil fungsi getEvaluateScore
    const score = await getEvaluateScore(product);
    product.score = score;

    const newProduct = await product_model.create({
      id: `PRD-${v1()}`,
      idSpoonacular: product.id,
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

module.exports = {
  getProducts,
  getProductByUpc,
  getProduct,
};

// {
//   "header": {
//       "time_request": "2025-01-16T09:25:24.045Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success get data products.",
//       "data": {
//           "type": "product",
//           "products": [
//               {
//                   "id": 1112715,
//                   "title": "Indomie Mi Goreng Instant Stir Fry Noodles, Halal Certified, Original Flavor, 2.8 OZ (24 Pack)",
//                   "image": "https://img.spoonacular.com/products/1112715-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 1642309,
//                   "title": "Indomie Mi Goreng Instant Noodle, 3 oz - Pack of 30",
//                   "image": "https://img.spoonacular.com/products/1642309-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 1413065,
//                   "title": "Indomie Mi Goreng Instant Stir Fry Noodles, Halal Certified, Original Flavor, 2.8 OZ",
//                   "image": "https://img.spoonacular.com/products/1413065-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 2007761,
//                   "title": "Indomie Instant Noodles, Chicken Curry Flavor, 2.64 OZ (30 Pack)",
//                   "image": "https://img.spoonacular.com/products/2007761-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 8270120,
//                   "title": "Indomie Instant Noodles Vegetable Flavour",
//                   "image": "https://img.spoonacular.com/products/8270120-312x231.jpg",
//                   "imageType": "jpg"
//               },
//               {
//                   "id": 11805156,
//                   "title": "indomie pepper chicken",
//                   "image": "https://img.spoonacular.com/products/11805156-312x231.jpg",
//                   "imageType": "jpg"
//               },
//               {
//                   "id": 1922309,
//                   "title": "Indomie Chicken Kari, 2.8 Oz",
//                   "image": "https://img.spoonacular.com/products/1922309-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 1004407,
//                   "title": "Indomie Mi Goreng Instant Stir Fry Noodles, Halal Certified, Hot &amp; Spicy / Pedas Flavor (Pack of 40)",
//                   "image": "https://img.spoonacular.com/products/1004407-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 1448055,
//                   "title": "Indomie Mi Goreng Instant Stir Fry Noodles, Halal Certified, Original Flavor, 2.8 OZ (30 Pack)",
//                   "image": "https://img.spoonacular.com/products/1448055-312x231.jpeg",
//                   "imageType": "jpeg"
//               },
//               {
//                   "id": 9837332,
//                   "title": "Indomie Fried Noodle 5 PC. - 5 PC X",
//                   "image": "https://img.spoonacular.com/products/9837332-312x231.jpg",
//                   "imageType": "jpg"
//               }
//           ],
//           "offset": 0,
//           "number": 10,
//           "totalProducts": 92,
//           "processingTimeMs": 139
//       }
//   }
// }

// {
//   "header": {
//       "time_request": "2025-01-16T09:26:38.063Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success get data product.",
//       "data": {
//           "product": {
//               "id": 22347,
//               "title": "SNICKERS Minis Size Chocolate Candy Bars Variety Mix 10.5-oz. Bag",
//               "description": "SnickersÂ® brand almond bar.What&#39;s inside... per minis piece.Calories 45, 2% DV.Total fat 2g, 3% DV.Sat fat 1g, 5% DV.Sugars 5g.Sodium 20mg, 1% DV.GDA&#39;s are based on a 2,000 calorie diet.To learn more visit www.marshealthyliving.com.*No DV defined.SnickersÂ® brand.What&#39;s inside... per minis piece.Calories 45, 2% DV.Total fat 2g, 3% DV.Sat fat 1g, 5% DV.Sugars 5g.Sodium 20mg, 1% DV.GDA&#39;s are based on a 2,000 calorie diet.To learn more visit www.marshealthyliving.com.*No DV defined.SnickersÂ® brand peanut butter squared bars.What&#39;s inside... per minis piece.Calories 50, 3% DV.Total fat 2.5g, 4% DV.Sat fat 1g, 5% DV.Sugars 4g.Sodium 30mg, 1% DV.GDA&#39;s are based on a 2,000 calorie diet.To learn more visit www.marshealthyliving.com.*No DV defined.snickers.com.Please save the unused product and wrapper.Mars Real ChocolateÂ®.We value your questions or comments. Call 1-800-551-0702 or visit us at www.snickers.com.Visit us at www.snickers.com.Â®/TM trademarks.Â©Mars, Incorporated.",
//               "nutrition": {
//                   "nutrients": [
//                       {
//                           "name": "Alcohol",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 100
//                       },
//                       {
//                           "name": "Caffeine",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Calcium",
//                           "amount": 40,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 4
//                       },
//                       {
//                           "name": "Carbohydrates",
//                           "amount": 25,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 8.33
//                       },
//                       {
//                           "name": "Cholesterol",
//                           "amount": 5,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 1.67
//                       },
//                       {
//                           "name": "Choline",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Copper",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Calories",
//                           "amount": 180,
//                           "unit": "kcal",
//                           "percentOfDailyNeeds": 9
//                       },
//                       {
//                           "name": "Fat",
//                           "amount": 8,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 12.31
//                       },
//                       {
//                           "name": "Saturated Fat",
//                           "amount": 3.5,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 21.88
//                       },
//                       {
//                           "name": "Trans Fat",
//                           "amount": 0.5,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 5000
//                       },
//                       {
//                           "name": "Fiber",
//                           "amount": 1,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 4
//                       },
//                       {
//                           "name": "Fluoride",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Folate",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Folic Acid",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Iodine",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Iron",
//                           "amount": 0.36,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 2
//                       },
//                       {
//                           "name": "Magnesium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Manganese",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B3",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B5",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Phosphorus",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Potassium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Protein",
//                           "amount": 2,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 4
//                       },
//                       {
//                           "name": "Vitamin B2",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Selenium",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Sodium",
//                           "amount": 85,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 3.7
//                       },
//                       {
//                           "name": "Sugar",
//                           "amount": 20,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 22.22
//                       },
//                       {
//                           "name": "Sugar Alcohol",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 100
//                       },
//                       {
//                           "name": "Vitamin B1",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin A",
//                           "amount": 0,
//                           "unit": "IU",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B12",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B6",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin C",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin D",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin E",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin K",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Zinc",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Net Carbohydrates",
//                           "amount": 24,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 8.73
//                       }
//                   ],
//                   "caloricBreakdown": {
//                       "percentProtein": 4.44,
//                       "percentFat": 40,
//                       "percentCarbs": 55.56
//                   },
//                   "calories": 180,
//                   "fat": "8g",
//                   "protein": "2g",
//                   "carbs": "25g"
//               },
//               "ingredients": [
//                   "artificial flavor.snickersâ® brand",
//                   "skim milk less than 2% - lactose",
//                   "snickersâ® brand almond bar",
//                   "artificial flavor.snickersâ® brand peanut butter squared bars",
//                   "tbhq to maintain freshness",
//                   "less than 2% - glycerin",
//                   "artificial flavor",
//                   "vegetable oil",
//                   "peanuts",
//                   "peanut butter",
//                   "lactose",
//                   "calcium carbonate",
//                   "egg whites",
//                   "invert sugar",
//                   "corn syrup solids",
//                   "chocolate",
//                   "palm oil",
//                   "sugar",
//                   "cocoa butter",
//                   "cottonseed oil",
//                   "milkfat",
//                   "milk chocolate",
//                   "skim milk",
//                   "partially hydrogenated soybean oil",
//                   "corn syrup",
//                   "rapeseed oil",
//                   "soy lecithin",
//                   "dextrose",
//                   "partially hydrogenated palm kernel oil",
//                   "almonds",
//                   "hydrogenated palm kernel oil",
//                   "salt"
//               ]
//           },
//           "score": {
//               "product": "SNICKERS Minis Size Chocolate Candy Bars Variety Mix 10.5-oz. Bag",
//               "evaluation": "Buruk",
//               "reasoning": "Berdasarkan komposisi gizinya, Snickers Minis memiliki beberapa aspek yang mengkhawatirkan dari segi kesehatan.  Pertama, kandungan kalorinya yang tinggi (180 kkal per porsi) menyumbang proporsi signifikan terhadap asupan kalori harian, terutama jika Anda memiliki kebutuhan kalori rendah. Kedua, kadar lemak jenuhnya (3.5g) mencapai 21.88% dari nilai harian yang direkomendasikan,  meningkatkan risiko penyakit jantung jika dikonsumsi secara berlebihan.  Ketiga, kandungan gulanya (20g) sangat tinggi dan dapat berkontribusi terhadap peningkatan berat badan, kerusakan gigi, dan masalah kesehatan metabolik lainnya.  Meskipun kadar natriumnya (85mg) relatif rendah, penting untuk mempertimbangkan asupan sodium total dari seluruh makanan yang dikonsumsi dalam sehari.  Bahan-bahannya juga mengandung beberapa komponen yang kurang sehat, seperti sirup jagung, minyak sawit terhidrogenasi parsial, dan sejumlah besar gula tambahan.  Kehadiran perasa buatan juga perlu diperhatikan, meskipun umumnya aman, pilihan bahan alami lebih disukai.  Terakhir,  produk ini berpotensi menjadi pemicu alergi bagi individu yang sensitif terhadap kacang, susu, atau kedelai.  Perlu diperhatikan bahwa persentase Daily Value (%DV) yang tertera pada label nutrisi  berdasarkan asupan kalori 2000 kkal,  sehingga persentase ini bisa lebih tinggi jika kebutuhan kalori harian Anda lebih rendah.",
//               "overall_assessment": "Snickers Minis tidak direkomendasikan sebagai pilihan camilan sehat karena kandungan gula, lemak jenuh, dan kalori yang tinggi.  Konsumsinya harus sangat terbatas dan hanya sebagai  kesenangan sesekali.  Pilihan camilan yang lebih sehat, seperti buah-buahan segar, sayuran, atau kacang-kacangan tanpa tambahan garam atau gula, jauh lebih direkomendasikan untuk menjaga kesehatan."
//           }
//       }
//   }
// }

// {
//   "header": {
//       "time_request": "2025-01-16T09:27:25.992Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success get data product.",
//       "data": {
//           "product": {
//               "id": 30004,
//               "title": "Swan Flour",
//               "description": null,
//               "nutrition": {
//                   "nutrients": [
//                       {
//                           "name": "Alcohol",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 100
//                       },
//                       {
//                           "name": "Caffeine",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Calcium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Carbohydrates",
//                           "amount": 8,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 2.67
//                       },
//                       {
//                           "name": "Cholesterol",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Choline",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Copper",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Calories",
//                           "amount": 30,
//                           "unit": "kcal",
//                           "percentOfDailyNeeds": 1.5
//                       },
//                       {
//                           "name": "Fat",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Saturated Fat",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Trans Fat",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Fiber",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Fluoride",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Folate",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Folic Acid",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Iodine",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Iron",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Magnesium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Manganese",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B3",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B5",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Phosphorus",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Potassium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Protein",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B2",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Selenium",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Sodium",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Sugar",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Sugar Alcohol",
//                           "amount": 0,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 100
//                       },
//                       {
//                           "name": "Vitamin B1",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin A",
//                           "amount": 0,
//                           "unit": "IU",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B12",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin B6",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin C",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin D",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin E",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Vitamin K",
//                           "amount": 0,
//                           "unit": "µg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Zinc",
//                           "amount": 0,
//                           "unit": "mg",
//                           "percentOfDailyNeeds": 0
//                       },
//                       {
//                           "name": "Net Carbohydrates",
//                           "amount": 8,
//                           "unit": "g",
//                           "percentOfDailyNeeds": 2.91
//                       }
//                   ],
//                   "caloricBreakdown": {
//                       "percentProtein": 0,
//                       "percentFat": 0,
//                       "percentCarbs": 100
//                   },
//                   "calories": 30,
//                   "fat": "0g",
//                   "protein": "0g",
//                   "carbs": "8g"
//               },
//               "ingredients": [
//                   "starch",
//                   "potato starch"
//               ]
//           },
//           "score": {
//               "product": "Swan Flour",
//               "evaluation": "Baik",
//               "reasoning": "Swan Flour, berdasarkan informasi nutrisi yang diberikan, dinilai sebagai produk yang baik untuk kesehatan karena beberapa alasan. Pertama, kandungan kalorinya rendah, hanya 30 kkal per porsi. Ini berarti  contributes minimal to daily caloric intake. Kedua,  tidak mengandung lemak, lemak jenuh, atau lemak trans. Ketiga, kandungan gula juga nol. Keempat,  tidak mengandung sodium. Kelima, bahan-bahannya sederhana dan terdiri dari pati dan pati kentang, yang umumnya aman dikonsumsi.  Tidak ada bahan-bahan yang berisiko atau tidak aman bagi sebagian orang yang tercantum dalam informasi yang tersedia.  Meskipun rendah akan mikronutrien, ini adalah produk yang relatif netral secara nutrisi dan cocok untuk mereka yang ingin mengontrol asupan kalori dan karbohidrat.",
//               "overall_assessment": "Swan Flour merupakan pilihan yang sehat sebagai sumber karbohidrat, khususnya bagi mereka yang sedang membatasi kalori dan lemak.  Namun, penting untuk diingat bahwa produk ini rendah akan nutrisi penting lainnya. Sebaiknya dikombinasikan dengan makanan lain yang kaya akan vitamin, mineral, dan protein untuk memastikan asupan nutrisi yang seimbang."
//           }
//       }
//   }
// }
