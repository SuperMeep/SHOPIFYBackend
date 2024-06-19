const express = require("express");
const { requireAuth, requireRole } = require("../middleware/requireAuth");
const upload = require("../middleware/multer");
const {
  getItemsUser,
  getItems,
  getItem,
  createItem,
  deleteItem,
  updateItem,
} = require("../controllers/itemController");
const router = express.Router();

router.use(requireAuth);

// GET all items of user (open to all authenticated users)
router.get("/user", getItemsUser);

// GET all items (open to all authenticated users)
router.get("/", getItems);

// GET a single item (open to all authenticated users)
router.get("/:id", getItem);

// POST a new item (only accessible to users with the "admin" or "host" role)
router.post("/", requireRole(["admin", "host"]), upload, createItem);

// DELETE an item (only accessible to users with the "admin" or "host" role)
router.delete("/:id", requireRole(["admin", "host"]), deleteItem);

// UPDATE an item (only accessible to users with the "admin" or "host" role)
router.put("/:id", requireRole(["admin", "host"]), updateItem);

module.exports = router;
