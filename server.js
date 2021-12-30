const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

//google auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "148553424442-e56n0s7cj6dt2mlq7p2abblk3duab43k.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 4000;

//middleware
app.set('view engine','ejs');
app.use(express.json());
app.use(cookieParser());

//routes
app.get('/',async(req,res)=>{
    res.render("index")
})
app.get('/login',async(req,res)=>{
    res.render("login")
})
app.post('/login',async(req,res)=>{
    let token = req.body.id_token;
    async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    console.log(payload);
    }
    verify().then(async()=>{
        res.cookie('session-token',token)
        res.send('success');
    }).catch(console.error);
})
app.get('/dashboard',checkAuthnticated,async(req,res)=>{
    let user=req.user;
    res.render('dashboard',{user});
})
app.get('/protectedroute',checkAuthnticated,async(req,res)=>{
    res.render('protectedroute');
})
app.get('/logout',(req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login');
})

function checkAuthnticated(req,res,next){
    let token = req.cookies['session-token'];
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
    verify().then(async()=>{
        req.user = user;
        next();
    }).catch((err)=>{
        res.redirect('/login');
    });
}
app.listen(PORT,()=>{
    console.log(`Server is Up and Running on ${PORT}`);
})