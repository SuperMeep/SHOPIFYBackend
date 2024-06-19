const express = require("express");
const { errorHandler } = require("./middleware/errorHandler");
const cors = require("cors");
require("dotenv").config();
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const mongoose = require("mongoose");
const colors = require("colors");
const bodyParser = require("body-parser");

const port = process.env.PORT || 5000;

// express app
const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

// middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/items", itemRoutes);
app.use("/api/user", userRoutes);
app.use("/api/carts", cartRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
