const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.get('/login', (req, res) => {
    res.redirect("https://gumzo-chat.onrender.com");
});

app.post('/login', (req, res) => {
    if(req.cookies.token){
        jwt.decode(req.cookies.token, (err, decoded) => {
            if (err) {
                res.status(401).send("Invalid token");
            } else {
                res.status(200).json(JSON.parse(decoded));
            }
        });
    }
    const payload = req.body.token;
    jwt.decode(payload, (err, decoded) => {
        if (err) {
            res.status(401).send("Invalid token");
        } else {
            res.cookie('token', payload, { httpOnly: true });
            res.status(201).json(JSON.parse(decoded));
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});