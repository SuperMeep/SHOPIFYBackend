const express = require("express");
const {
  createCart,
  getCartUser,
  getCart,
} = require("../controllers/cartController");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// GET all Cart (open to all authenticated users)
router.get("/", getCartUser);

// POST a new Cart
router.post("/", createCart);

// GET a single place (open to all authenticated users)
router.get("/:id", getCart);

module.exports = router;
