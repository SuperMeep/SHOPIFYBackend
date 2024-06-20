const asyncHandler = require("express-async-handler");
const db = require("../firebaseConfig");

// create cart
const createCart = asyncHandler(async (req, res) => {
  const { item, quantity, price, variety } = req.body;
  const user = req.user.userId;

  // Fetch item details from Firebase Realtime Database
  const itemRef = db.ref(`items/${item}`);
  const snapshot = await itemRef.once("value");
  const itemData = snapshot.val();

  // Check if item exists
  if (!itemData) {
    return res.status(404).json({ error: "Item not found." });
  }

  // Validate quantity against available stock
  if (quantity < 1 || quantity > itemData.stock) {
    return res.status(400).json({ error: "Invalid quantity selected." });
  }

  // Deduct stock from item
  const updatedStock = itemData.stock - quantity;

  // Update item stock in Firebase Realtime Database
  await itemRef.update({ stock: updatedStock });

  // Create cart object
  const newCartRef = db.ref("carts").push();
  const cartId = newCartRef.key;

  const cart = {
    id: cartId,
    price,
    item,
    quantity,
    variety,
    user,
  };

  // Store cart details in Firebase Realtime Database
  await newCartRef.set(cart);

  // Respond with success and cart details
  res.status(200).json({ cart });
});

// get carts by user
const getCartUser = asyncHandler(async (req, res) => {
  const user = req.user.userId;
  const cartsSnapshot = await db
    .ref("carts")
    .orderByChild("user")
    .equalTo(user)
    .once("value");
  const carts = cartsSnapshot.val();

  const cartsArray = carts ? Object.values(carts) : [];

  // Fetch item details for each cart
  const itemPromises = cartsArray.map(async (cart) => {
    const itemSnapshot = await db.ref(`items/${cart.item}`).once("value");
    const item = itemSnapshot.val();
    return {
      ...cart,
      itemDetails: item || {},
    };
  });

  const cartsWithItems = await Promise.all(itemPromises);

  res.status(200).json(cartsWithItems);
});

// get a single cart
const getCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cartSnapshot = await db.ref(`carts/${id}`).once("value");
  const cart = cartSnapshot.val();

  if (!cart) {
    return res.status(404).json({ error: "No such cart" });
  }

  const itemSnapshot = await db.ref(`items/${cart.item}`).once("value");
  const item = itemSnapshot.val();

  res.status(200).json({ ...cart, itemDetails: item || {} });
});

// delete an item
const deleteCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cartRef = db.ref(`carts/${id}`);
  const cartSnapshot = await cartRef.once("value");

  if (!cartSnapshot.exists()) {
    res.status(404).json({ error: "No such cart" });
    return;
  }

  const cartData = cartSnapshot.val();
  const { item, quantity } = cartData;

  // Get the item reference
  const itemRef = db.ref(`items/${item}`);
  const itemSnapshot = await itemRef.once("value");

  if (!itemSnapshot.exists()) {
    res.status(404).json({ error: "No such item associated with this cart" });
    return;
  }

  const itemData = itemSnapshot.val();
  const updatedStock = parseInt(itemData.stock, 10) + quantity;

  // Update the item stock
  await itemRef.update({ stock: updatedStock });

  // Remove the cart
  await cartRef.remove();

  res.status(200).json({ message: "Cart deleted successfully, stock updated" });
});

// update an cart
const updateCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cartRef = db.ref(`carts/${id}`);
  const cartSnapshot = await cartRef.once("value");

  if (!cartSnapshot.exists()) {
    res.status(404).json({ error: "No such cart" });
    return;
  }

  await cartRef.update({ ...req.body });

  const updatedCartSnapshot = await cartRef.once("value");

  res.status(200).json(updatedCartSnapshot.val());
});

module.exports = {
  createCart,
  getCartUser,
  getCart,
  deleteCart,
  updateCart,
};
