require("./config");
const express = require("express");
const user = require("./user");

const app = express();
const cors = require("cors");
const product = require("./product");
const jwt = require("jsonwebtoken");

const jwtKey = "e-comm";
app.use(express.json());
app.use(cors());
app.post("/register",  async (req, res) => {
  let check = await user.findOne(req.body);

  if (check) {
    res.send({
      messgae: "user already register",
    });
  } else {
    const data = new user(req.body);

    const result = await data.save();
    console.log(typeof result);
    const newResult = result.toObject();
    delete newResult.password;

    jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
        res.send({ result: "something went wrong try again after some times" });
      }
      res.send({ newResult, auth: token, message: "done" });
    });
  }
});
app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let data = await user.findOne(req.body).select("-password");

    if (data) {
      jwt.sign({ data }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({
            result: "something went wrong try again after some times",
          });
        }
        res.send({ data, auth: token });
      });
    } else {
      res.send({ result: "no user found" });
    }
  } else {
    res.send({ result: "no user found" });
  }
});
app.post("/add-product",verifyToken, async (req, res) => {
  let products = new product(req.body);

  let result = await products.save();

  res.send({
    message: "Done",
    result,
  });
});
app.get("/products",verifyToken, async (req, res) => {
  let products = await product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({
      result: "no products found",
    });
  }
});
app.delete("/delete/:_id", verifyToken, async (req, res) => {
  let products = await product.deleteOne(req.params);

  res.send(products);
});
app.put("/update/:_id", verifyToken, async (req, res) => {
  try {
    const updatedProduct = await product.updateOne(req.params, {
      $set: req.body,
    });
    console.log(updatedProduct, req.body, req.params._id);
    if (updatedProduct.modifiedCount > 0) {
      res.send({
        message: "updated",
      });
    } else {
      res.send({
        message: "not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/products/:id",verifyToken, async (req, res) => {
  console.log(req.params.id);
  let result = await product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.status(500).send("interal Server error");
  }
});
app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ");
    console.log(token);
    jwt.verify(token[0], jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(401).send({ message: "please add token with headers" });
  }
  console.warn("middle ware called", token);
}

app.listen(5000);
