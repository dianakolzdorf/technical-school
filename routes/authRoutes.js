const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { isGuest, isAuthenticated } = require('../middleware/auth');

// ============================================
// СТРАНИЦА ВХОДА
// ============================================
router.get('/login', isGuest, (req, res) => {
    console.log('GET /login - session:', req.session?.userId);
    res.render('login', { 
        title: 'Вход в систему',
        error: req.flash('error'),
        success: req.flash('success'),
        oldData: {}
    });
});

// ============================================
// ОБРАБОТКА ВХОДА
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('POST /login - попытка входа:', email);
        
        if (!email || !password) {
            req.flash('error', 'Заполните все поля');
            return res.redirect('/login');
        }
        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.log('Пользователь не найден:', email);
            req.flash('error', 'Неверный email или пароль');
            return res.redirect('/login');
        }
        
        const isValid = await user.validatePassword(password);
        
        if (!isValid) {
            console.log('Неверный пароль для:', email);
            req.flash('error', 'Неверный email или пароль');
            return res.redirect('/login');
        }
        
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;
        req.session.userName = user.full_name;
        
        console.log('Успешный вход! Сессия создана:', req.session.userId);
        
        req.flash('success', `Добро пожаловать, ${user.full_name}!`);
        res.redirect('/');
        
    } catch (error) {
        console.error('Ошибка при входе:', error);
        req.flash('error', 'Произошла ошибка при входе в систему');
        res.redirect('/login');
    }
});

// ============================================
// СТРАНИЦА РЕГИСТРАЦИИ
// ============================================
router.get('/register', isGuest, (req, res) => {
    res.render('register', { 
        title: 'Регистрация',
        error: req.flash('error'),
        success: req.flash('success'),
        oldData: {}
    });
});

// ============================================
// ОБРАБОТКА РЕГИСТРАЦИИ
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password, confirm_password, phone, role } = req.body;
        
        if (!full_name || !email || !password || !confirm_password) {
            req.flash('error', 'Заполните все обязательные поля');
            return res.redirect('/register');
        }
        
        if (password !== confirm_password) {
            req.flash('error', 'Пароли не совпадают');
            return res.redirect('/register');
        }
        
        if (password.length < 6) {
            req.flash('error', 'Пароль должен содержать минимум 6 символов');
            return res.redirect('/register');
        }
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.flash('error', 'Пользователь с таким email уже существует');
            return res.redirect('/register');
        }
        
        await User.create({
            full_name,
            email,
            password,
            phone: phone || null,
            role: role || 'student',
            status: 'active'
        });
        
        req.flash('success', 'Регистрация прошла успешно! Теперь вы можете войти.');
        res.redirect('/login');
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        req.flash('error', 'Произошла ошибка при регистрации');
        res.redirect('/register');
    }
});

// ============================================
// ВЫХОД ИЗ СИСТЕМЫ
// ============================================
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Ошибка при выходе:', err);
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
