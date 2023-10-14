require("./config");
const express = require("express");
const user = require("./user");

const app = express();
const cors = require("cors");
const product = require("./product");
app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
    let check = await user.findOne(req.body);
  
   if( check.name){
         res.send({
          messgae:'user already register'
         })
   }else{
   const data = new user(req.body);

  const result = await data.save();
  console.log(typeof result);
  const newResult = result.toObject();
  delete newResult.password;

  res.send({
    message: "done",
    newResult,
  });
   }
   
});
app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let data = await user.findOne(req.body).select("-password");

    if (data) {
      res.send(data);
    } else {
      res.send({ result: "no user found" });
    }
  } else {
    res.send({ result: "no user found" });
  }
});
app.post('/add-product', async (req,res)=>{
  let products = new product(req.body);
  let result = await products.save();
   console.log(result);
   res.send({
    message:'Done',
    result
   });

})
app.listen(5000);
