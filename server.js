const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const {Server: HttpServer} = require('http');
const {Server: Socket} = require('socket.io');

const app = express();
const httpServer = new HttpServer(app)
const io = new Socket(httpServer)

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname+'/public'));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(session({
    store : MongoStore.create({
        mongoUrl: "mongodb://localhost/sesiones",
        ttl: 60
       }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

const checkLogged = (req,res,next)=>{
    if(req.session.username){
        next();
    } else {
        res.redirect("/login");
    }
}

const userNotLogged = (req,res,next)=>{
    if(req.session.username){
        res.redirect("/");
    } else {
        next();
    }
}

app.post("/login",(req,res)=>{
    const {name} = req.body;
    if(name){
        req.session.username = name;
        res.redirect("/");
    } else{
        res.render("login",{error:"por favor ingresa el nombre"})
    }
});

app.get("/logout",(req,res)=>{
    req.session.destroy((error)=>{
        if(error){
            res.redirect("/")
        } else{
            res.render("logout")
        }
    })
});

app.get('/', checkLogged, (req,res)=>{
    res.render('home',{username:req.session.username});
});

app.get("/login",userNotLogged,(req,res)=>{
    res.render("login");
}); 

const mensaje = "Socket is working";

io.on('connection', socket => {
    console.log(mensaje)
    socket.emit('mensaje', mensaje)
})

app.listen(8080);
console.log('Servidor conectado')