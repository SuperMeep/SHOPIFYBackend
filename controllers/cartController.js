const asyncHandler = require("express-async-handler");
const db = require("../firebaseConfig");

// create cart
const createCart = asyncHandler(async (req, res) => {
  const { item, quantity, price } = req.body;
  const user = req.user.userId;

  // // Retrieve the item details from the database
  // const itemRef = db.ref(`items/${item}`);
  // const itemSnapshot = await itemRef.once("value");

  // if (!itemSnapshot.exists()) {
  //   return res.status(404).json({ error: "Item not found" });
  // }

  // const item = itemSnapshot.val();

  const newCartRef = db.ref("carts").push();
  const cartId = newCartRef.key;

  const cart = {
    id: cartId,
    price,
    item,
    quantity,

    user,
  };

  await newCartRef.set(cart);

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

module.exports = {
  createCart,
  getCartUser,
  getCart,
};
