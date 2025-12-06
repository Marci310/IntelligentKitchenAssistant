require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow credentials (cookies, sessions)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api', require('./routes/ingredients'));
app.use('/api', require('./routes/recipe'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

module.exports = app;