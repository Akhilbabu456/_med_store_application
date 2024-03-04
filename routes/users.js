var express = require('express');
var router = express.Router();
const User = require("../models/userModel")
const Medicine = require("../models/medicationModel")
const { body, validationResult } = require("express-validator")

/* GET users listing. */
router.get('/', async(req, res)=> {
  const userId = req.session.userId
  console.log(userId)
 try{
  const user = await User.findOne({_id:userId})
  const salesData = await Medicine.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$stocksold" },
        totalItems: { $sum: "$totalStock"}
      }
    }
  ])
  const medicineList = await Medicine.find({})
  const lowStock = await Medicine.find({stock: { $lt: 20}}).exec()
  const sold =Math.floor((salesData[0].totalSales/salesData[0].totalItems)*100)
  console.log(sold)
   if(medicineList){
    res.render("index", {
      layout: "userlayout",
      name: user.name,
      title: "Medicine Stock List",
      medicine: medicineList,
      low: lowStock,
      sale: sold,
      successMessage: req.flash("success"),
      errors: req.flash("danger")
        })
   }else{
    res.render("index", {
      layout: "userlayout",
      name: user.name,
      low: lowStock
      })
   }
 }catch(err){
    if(err){
      res.send(err.message)
    }
 }
});

router.get("/add", (req,res)=>{
   res.render("add", {layout: "updatelayout", action: "/user", title: "Add Medicine"})
})

router.post("/add",[
  body("name")
  .notEmpty()
  .withMessage("Name is required"),
  body("type")
  .notEmpty()
  .withMessage("Type is required"),
  body("stock")
  .notEmpty()
  .withMessage("Stock is required")
], async(req,res)=>{
   const errors = validationResult(req);
   const {name , type, stock} = req.body
   
   const data = await Medicine.findOne({name: name})
   if (!errors.isEmpty()) {
    req.flash('danger', errors.array())
   return res.render("add", {
     layout: "updatelayout",
     title: "Add medicine",
      errors: req.flash('danger'),
      values: req.body,
    });
  }else if(data){
    req.flash("danger", "Medicine already exists")
    res.render("add", {
      layout: "updatelayout",
      action: "/user",
      title: "Add Medicine",
      value: req.body,
      errors: [{msg : "Medicine already exists"}]
      })
   }else{
     try{
      const medicine = new Medicine({
        name,
        type,
        stock
      })
  
      medicine.save()
  
      if(medicine){
        req.flash("success", "Medicine added successfully")
        res.redirect("/user")
      }else{
        res.send("medicine no added")
      }
     }catch(err){
      res.send(err.message)
     }
   }
})
router.get("/remove/:id", async(req,res)=>{
   const medicineId = req.params.id
   try{
     const medicine = await Medicine.deleteOne({_id: medicineId})

     if(medicine){
      req.flash("success", "Successfully deleted")
      res.redirect("/user")
     }else{
      res.redirect("/user")
     }
   }catch(err){
     res.send(err.message)
   }
})

router.get("/edit/:id", async(req,res)=>{
   const medicineId = req.params.id
   try{
     const data = await Medicine.findOne({_id: medicineId})

     res.render("update", {
        layout: "updatelayout",
        action: "/user",
        id: medicineId,
        name: data.name,
        type: data.type,
        stock: data.stock,
        title: "Update Medicine"
     })
   }catch(err){
    res.send(err.message)
   }

})

router.post("/edit/:id", async(req,res)=>{
   const medicineId = req.params.id
   const{name , type, stock} = req.body
   
   try{
     const medicine = await Medicine.findOne({_id: medicineId})

     
     if(medicine.stock > stock){
      var sold = medicine.stock-stock
     }

     if(medicine){
       medicine.name = name
       medicine.type = type
       medicine.stock = stock
       medicine.stocksold += sold

       medicine.save()
       req.flash("success", "Updated successfully")
       res.redirect("/user")
     }else{
      res.redirect("/user")
     }
   }catch(err){
     res.send(err.message)
   }
})

router.get("/search", async(req,res)=>{
  const searchTerm = req.query.search;
  const regex = new RegExp(searchTerm, 'i')
  
  try{
    const result = await Medicine.find({ $or: [{ name: regex }, { type: regex }] });
    console.log(result)
    if(result){
      
      req.flash("success", "Search result of "+ searchTerm)
    res.render("index", {
      layout: "updatelayout",
      action: "/user",
      medicine:result,
      title: "Search Results",
      successMessage: req.flash("success")
    })
   
  }else{
    req.flash("danger", "No search results found")
    res.redirect("/user")
  }
  }catch(err){
    console.log(err)
  }
})

router.get("/logout", (req,res)=>{
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging out');
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    }
  });
})

router.get("/stockadd/:id", async(req,res)=>{
  const stockId = req.params.id
  console.log(stockId)
  try {
  const medicine = await Medicine.findOneAndUpdate({_id: stockId}, {$inc: {stock: 1}}, {new: true});
   if(medicine){
     res.redirect("/user")
   }else{
    res.redirect("/user")
   }
  } catch(err) {
    res.send(err.message); 
  }
})

router.get("/sold/:id", async(req,res)=>{
  const stockId = req.params.id
  console.log(stockId)
  try {
  const medicine = await Medicine.findOne({_id: stockId});
   if(medicine){
    medicine.stock -= 1; 
    medicine.stocksold += 1;
    medicine.save();
    res.redirect("/user")
   }else{
    res.redirect("/user")
   }
  } catch(err) {
    res.send(err.message);
  }
})

module.exports = router;
