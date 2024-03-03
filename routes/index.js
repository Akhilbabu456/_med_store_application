var express = require('express');
var router = express.Router();
const session = require("express-session")
const bcrypt= require('bcryptjs')
const User = require("../models/userModel")
const { body, validationResult } = require("express-validator")

/* GET home page. */
router.get('/register', function(req, res) {
  res.render('signup', {layout: "formlayout"});
});
router.get('/', function(req, res) {
  res.render('login', {layout: "formlayout"});
})
router.post("/signup", [
  body("name")
  .notEmpty()
  .withMessage("Name is required")
  .custom((value) => {
    if (!/^[a-zA-Z ]+$/.test(value)) {
      throw new Error("Name should only contain letters and spaces");
    }
    return true;
  }),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not in correct format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long"),
] , async (req,res)=>{
  const errors = validationResult(req);
  const name = req.body.name
    const email = req.body.email
    const password = req.body.password

  if(!name && !email && !password){
    req.flash('danger', "All fields are required")
    return res.render("signup", {
      layout: "formlayout",
      errors: [{msg : "All fields are required"}]
    })
  }
  if (!errors.isEmpty()) {
    req.flash('danger', errors.array())
   return res.render("signup", {
     layout: "formlayout",
      errors: req.flash('danger'),
      values: req.body,
    });
  } else {
    
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const data= await User.findOne({email})
      if(data){
        req.flash("danger", "Email already exists")
       return res.render("signup", {
          title: "Sign Up",
          values: req.body,
          layout: "formlayout",
          errors: [{ msg: 'Email already exists' }],
          })
        
      }else{
        const user = new User({
          name,
          email,
          password: hashedPassword,
        });
      
        await user.save();
        res.session.userId = user._id.valueOf()
        res.redirect("/user");
      }
     
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error while registering user");
  }
}
})

router.post('/login', async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const data = await User.findOne({ email });
    if (!data) {
      req.flash('danger', 'Invalid credentials');
      return res.render('login', {
        layout: 'formlayout',
        errors: [{ msg: 'Invalid credentials' }],
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, data.password);
    if (isPasswordMatch) {
      req.session.userId = data._id.valueOf();
      req.flash('success', 'Login successful')
      res.redirect('/user');
      console.log('Redirected');
    } else {
      res.render('login', {  errors: [{ msg: 'Wrong Password' }], layout: "formlayout" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error user not found');
  }
});

module.exports = router;
