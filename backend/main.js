const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://gumzo-chat.onrender.com',
    credentials: true
}));

app.get('/login', (req, res) => {
    res.redirect("https://gumzo-chat.onrender.com");
});

app.post('/login', (req, res) => {
    let token;
    if(req.cookies.token){
        token = req.cookies.token;
    }
    else{
        token = req.body.token;
    }
    if(!token){
        res.status(400).send("No token provided");
        return;
    }
    let user = jwt.decode(token);

    if(!user){
        res.status(400).send("Invalid token");
        return;
    }

    let accessToken = jwt.sign(user, "ACCESS_TOKEN_SECRET");
    let refreshToken = jwt.sign(user, "REFRESH_TOKEN_SECRET");

    res.cookie('token', refreshToken, {httpOnly: true});
    res.status(201).json({user: user ,accessToken: accessToken});
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Socket

const io = socket(app.listen(3000));

io.on('connection', (socket) => {
    console.log('User connected');
});