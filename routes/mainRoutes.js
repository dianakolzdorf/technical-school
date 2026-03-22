const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Главная страница
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'Главная - Техникум'
    });
});

// О техникуме
router.get('/about', (req, res) => {
    res.render('about', { 
        title: 'О техникуме'
    });
});

// Контакты
router.get('/contacts', (req, res) => {
    res.render('contacts', { 
        title: 'Контакты'
    });
});

// Личный кабинет
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { 
        title: 'Личный кабинет'
    });
});

module.exports = router;
