
const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const bycrypt = require('bcrypt')
const multer = require("multer");
const uuid = require('uuid')
const UserModel = require("../models/userModels");
app.use(express.json())
const BlogModel = require("../models/blogModels");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/uploads");

  },
  filename: function (req, file, cb) {
    const filenamesplit = file.originalname.split('.')
    const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      return(cb(new Error('Error while uploading images')))
    }
    const extension = filenamesplit[filenamesplit.length -1]
   
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const newFilename = "node_blog" + "_" + uniqueSuffix + "." + extension;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

app.get("/dashboard", checkauth, async (req, res) => {
  console.log(req.cookies);


  const username = jwt.verify(
    req.cookies.token,
    process.env.SECRET_KEY
  ).username;

  const { firstname, lastname, email } = await UserModel.findOne({ username });
  return res.render("pages/accounts/dashboard.ejs", { firstname });
});


app.get("/profile", checkauth, async(req, res) => {
    try {
        const username = jwt.verify(
    req.cookies.token,
    process.env.SECRET_KEY
  ).username;

  const { firstname, lastname, email, image } = await UserModel.findOne({ username });

    return res.render("pages/accounts/profile.ejs", {
      firstname,
      lastname,
      email,
      message: "",
      image
    });
  } catch (error) {}
});
 
app.put('/update-profile', checkauth, express.urlencoded({ extended: false }), async (req, res) => {
  const {firstname, lastname, email} = req.body
try {
    const username = jwt.verify(
      req.cookies.token,
      process.env.SECRET_KEY
    ).username;

    const update = await UserModel.updateOne(
      { username },
      { firstname, lastname, email }
    );

  res.render("pages/accounts/profile.ejs", {
    firstname,
    lastname,
    email,
    message: "success",
  });
} catch (error) {
  console.log(error);
}
     
})

app.post('/upload-profile-pics', upload.single('file'), async(req, res) => {
  try {
    if (!req.file) {
      return res.render("pages/accounts/profile.ejs", {
        firstname,
        lastname,
        email,
        message: "please upload a pics",
        image: "/img/default.png",
      });
    }

           const username = jwt.verify(
    req.cookies.token,
    process.env.SECRET_KEY
  ).username;
    const user = await UserModel.findOne({ username }).exec();
    const update = await UserModel.updateOne(
      { username },
      { image: `http://localhost:3000/uploads/${req.file.filename}` }
    );
    return res.redirect('/admin/profile')
  } catch (error) {
    console.log(error);
  }
})

app.put('/update-pass', checkauth, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body

       const username = jwt.verify(
         req.cookies.token,
         process.env.SECRET_KEY
    ).username;
    const { password } = await UserModel.findOne({ username });
    
    if (!current_password || !confirm_password || !new_password) {
      return res.status(400).json({ message: "fill in all input" });
    }
    if (confirm_password !== new_password) {
   return res.status(400).json({ message: "invalid passwords  match" });
}
    const ispass = bycrypt.compareSync(current_password, password)
    if (!ispass) {
     return res.status(400).json({message:"incorrect password"})
    }
    const salt = bycrypt.genSaltSync(10)
const hashedpass = bycrypt.hashSync(new_password, salt)
    const update = await UserModel.updateOne({ username }, { password: hashedpass })
    return res.status(200).json({ message: "password updated" })
  } catch (error) {
    console.log(error);
  }
})

app.get('/add-blog', (req, res) => {
  return res.render('pages/accounts/add-blog.ejs')
})
app.post('/add-blog', upload.single('file'), async (req, res) => {
 
  const { author, details, title } = req.body
  const file = req.file
  if (!file || !author || !details || !title) {
    return res.json({message: "empty inputs"})
  }
  const blogId = uuid.v4()
  
  const newblog = await BlogModel({
    blogId,
    author,
    details,
    title,
    image: `http://localhost:3000/uploads/${file.filename}`

  })
 newblog.save() 
 return res.status(200).json({message: "success"})
})

app.delete("/delete-blog", async(req, res) => {
  console.log(req.body.blogId.replace(' ', ''))

  const { blogId } = req.body
  try {
    const delblog = await BlogModel.findOneAndDelete({blogId: blogId.replace(' ', '') })
    console.log(delblog)
    return res.status(200).send("blog delete successfully")
  } catch (error) {
    console.log(error)
  }
});

app.get('/blog/:blogId', async(req, res)=>{
  console.log(req.params)
  const { blogId } = req.params
  const blog = await BlogModel.findOne({blogId})
  return res.render('pages/accounts/edit-blog.ejs', {blog})
})

app.get('/blogs', async(req, res) => {
  const blogs = await BlogModel.find()

  return res.render('pages/accounts/blogs.ejs', {blogs})
})

app.put('/edit-blog', upload.single('file'), async (req, res) => {

  const { blogId, title, details } = req.body
  
  if (req.file) {
const update =     await BlogModel.updateOne(
      { blogId },
      {
        title,
        details,
        image: `http://localhost:3000/uploads/${file.filename}`,
      }
    );
    
    return res.status(201).json({message:"update successfull"})
  }
  
  
  const update = await BlogModel.updateOne(
    {blogId }, {title, details})
  
  
    console.log(update);
    
  return res.status(201).json({ message: "update successfull" });

});

app.get("**", (req, res) => {
  res.render("pages/404.ejs");
});

module.exports = app

function checkauth(req, res, next) {
      if (!req.cookies.token) {
        return res.redirect("/login");
    }
    next()
}