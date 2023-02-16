const express = require('express');
const UserModel = require('../models/userModels')
const bcrypt = require('bcrypt')
const app = express()
const BlogModel = require("../models/blogModels");
const cookie = require("cookie-parser");
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookie());
const jwt = require('jsonwebtoken')
app.get('/', async (req, res) => { 
  const blogs = await BlogModel.find()
  

   return res.render('pages/index.ejs', {blogs}  )
})

app.get("/blog/:blogId", async (req, res) => {
  const { blogId } = req.params;
  const blog = await BlogModel.findOne({ blogId });
  console.log(blog);
  return res.render("pages/details.ejs", { blog });
});
app.get('/login', (req, res) => { 
    res.render("pages/login.ejs", { message: { type: "", msg: "" } });
})
app.get('/signup', (req, res) => { 
    res.render("pages/signup.ejs", {
      message: { type: "", msg: "" },
    });
})



app.post('/auth/create-account', express.urlencoded({ extended: false }), async (req, res) => {
  try {
   const { firstname, lastname, username, email, password, repeat_password } =
     req.body;

   if (
     !firstname ||
     !lastname ||
     !username ||
     !email ||
     !password ||
     !repeat_password
   ) {
     return res.render("pages/signup.ejs", {
       message: { type: "error", msg: "empty inputs" },
     });
   }

   if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
     return res.render("pages/signup.ejs", {
       message: { type: "error", msg: "Invalid email address" },
     });
   }

   if (password.length < 8) {
     return res.render("pages/signup.ejs", {
       message: { type: "error", msg: "Password is too short" },
     });
   }

   if (password !== repeat_password) {
     return res.render("pages/signup.ejs", {
       message: { type: "error", msg: "Passwords don't match" },
     });
    }
    
    const existingUser = await UserModel.findOne({ username })
    // console.log(existingUser);
    if (existingUser) {
      return res.render("pages/signup.ejs", {
        message: { type: "error", msg: "user already exist in the database" }
      })
    }
    
   const salt = bcrypt.genSaltSync(10);
   const hashedPassword = bcrypt.hashSync(password, salt);

   const user = new UserModel({
     firstname,
     lastname,
     username,
     email,
     password: hashedPassword,
   });

   user.save();

   return res.render("pages/signup.ejs", {
     message: { type: "success", msg: "user added successfully" },
   }); 
  } catch (error) {
    console.log('server error');
  }
    
})


app.post('/auth/login', express.urlencoded({extended:false}), async (req, res)=>{
try {
  const { username, password } = req.body
  
  if (!username || !password) {
          return res.render("pages/login.ejs", {
            message: {
              type: "error",
              msg: "please fill in all input",
            },
          });
  }

  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
     return res.render("pages/login.ejs", {
       message: {
         type: "error",
         msg: "user does not exist",
       },
     });
  }

  const isPass = bcrypt.compareSync(password, existingUser.password);
  if (!isPass) {
         return res.render("pages/login.ejs", {
           message: {
             type: "error",
             msg: "invalid password",
           },
         });
  }

  const token = jwt.sign({ username }, process.env.SECRET_KEY);

res.cookie('token', token, {httpOnly:true,secure:true, sameSite:"strict", maxAge: 1000*60*60})
return res.redirect('/admin/dashboard')
} catch (error) {
  console.log(error);
}
})
app.get("/logout", (req, res) => {

  res.clearCookie()
  res.cookie("token",'', {
    httpOnly: true,
    maxAge: 0,
  });
 return res.redirect('/login')
});



module.exports = app