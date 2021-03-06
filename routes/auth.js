const express = require("express");
const nodemailer = require("nodemailer");
require("./../db/mongoose");
let User = require("./../models/user");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const router = express.Router();

//google auth

const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
//send mail
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER,
    pass: process.env.SENDER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/login", async (req, res) => {
  res.render("login");
});
router.post("/login", async (req, res) => {
  let token = req.body.id_token;
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    let doc = await User.findOne({ email: payload["email"] }).exec();
    if (!doc) {
      const user = new User({
        userid: payload["sub"],
        email: payload["email"],
        name: payload["name"],
      });
      user
        .save()
        .then(() => {
          console.log("data entered");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  verify()
    .then(async () => {
      res.cookie("session-token", token);
      res.send("success");
    })
    .catch(console.error);
});
router.get("/dashboard", checkAuthnticated, async (req, res) => {
  let user = req.user;
  res.render("dashboard", { user });
});
router.get("/protectedroute", checkAuthnticated, async (req, res) => {
  res.render("protectedroute");
});
router.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/auth/login");
});
router.get("/forgotpassword", async (req, res) => {
  res.render("forgotpassword");
});
router.post("/resetpassword", async (req, res) => {
  let doc = await User.findOne({ email: req.body.email }).exec();
  if (!doc) {
        return res.send("User Dose not exist");
    }
    let today = new Date()
    let expiery = today.getTime() + 259200000;
    let mailOptions = {
      from: "sanchithoza@gmail.com",
      to: req.body.email,
      subject: "Reset Password link",
      text: `reset your password using http://localhost:4000/auth/setnewpassword?id=${doc._id}&expiery=${expiery}`,
    };
    transporter.sendMail(mailOptions, function (error, success) {
      if (error) {
        return console.log(error);
      }
      console.log("email sent succcessfully");
      res.send("success");
    });
  
});
router.get("/setnewpassword", async (req, res) => {

  res.render("setnewpassword");
});

function checkAuthnticated(req, res, next) {
  let token = req.cookies["session-token"];
  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
  verify()
    .then(async () => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/auth/login");
    });
}

module.exports = router;
