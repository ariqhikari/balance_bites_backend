const { api } = require("../../configs/prefix.config");
const auth_middleware = require("../../middlewares/authentication.middleware");
const {
  getProducts,
  getProductByUpc,
  getProduct,
} = require("../../controllers/product.controller");

const express = require("express");
const router = express.Router();

router.get(`${api}/products`, auth_middleware, (req, res) =>
  getProducts(req, res)
);

router.get(`${api}/product-upc`, auth_middleware, (req, res) =>
  getProductByUpc(req, res)
);

router.get(`${api}/product`, auth_middleware, (req, res) =>
  getProduct(req, res)
);

module.exports = router;
