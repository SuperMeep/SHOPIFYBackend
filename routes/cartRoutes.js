const express = require("express");
const {
  createCart,
  getCartUser,
  getCart,
  deleteCart,
  updateCart,
} = require("../controllers/cartController");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// GET all Cart (open to all authenticated users)
router.get("/", getCartUser);

// POST a new Cart
router.post("/", createCart);

// GET a single place (open to all authenticated users)
router.get("/:id", getCart);

// DELETE an item (only accessible to users with the "admin" or "host" role)
router.delete("/:id", deleteCart);

// UPDATE an item (only accessible to users with the "admin" or "host" role)
router.put("/:id", requireRole, updateCart);

module.exports = router;
