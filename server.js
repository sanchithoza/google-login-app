const cookieParser = require('cookie-parser');
const express = require('express');
require('dotenv').config()

const auth_routes=require("./routes/auth")
const app = express();

// Importing all the routes

const PORT = process.env.PORT;

//middleware
app.set('view engine','ejs');
app.use(express.json());
app.use(cookieParser());

//routes
app.get('/',async(req,res)=>{
    res.render("index")
})

app.use("/auth",auth_routes)

app.listen(PORT,()=>{
    console.log(`Server is Up and Running on ${PORT}`);
})