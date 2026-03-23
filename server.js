// ============================================
// ПОДКЛЮЧЕНИЕ МОДУЛЕЙ
// ============================================
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// ============================================
// ПОДКЛЮЧЕНИЕ ЛОКАЛЬНЫХ МОДУЛЕЙ
// ============================================
const sequelize = require('./config/database');
const { User, Student, Teacher } = require('./models');

// ============================================
// ПОДКЛЮЧЕНИЕ РОУТОВ
// ============================================
const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

// ============================================
// СОЗДАНИЕ ПРИЛОЖЕНИЯ
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// НАСТРОЙКА ШАБЛОНИЗАТОРА EJS
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// БАЗОВЫЕ MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// НАСТРОЙКА СЕССИЙ
// ============================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));

// ============================================
// FLASH СООБЩЕНИЯ
// ============================================
app.use(flash());

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ШАБЛОНОВ
// ============================================
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning');
    
    res.locals.user = req.session.userId ? {
        userId: req.session.userId,
        userEmail: req.session.userEmail,
        userRole: req.session.userRole,
        userName: req.session.userName
    } : null;
    
    next();
});

// ============================================
// ПОДКЛЮЧЕНИЕ РОУТОВ
// ============================================
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/', studentRoutes);
app.use('/', teacherRoutes);

// ============================================
// ОБРАБОТКА ОШИБКИ 404
// ============================================
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Страница не найдена',
        user: res.locals.user
    });
});

// ============================================
// ОБРАБОТКА ОШИБОК СЕРВЕРА
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err.stack);
    res.status(500).render('500', { 
        title: 'Ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Внутренняя ошибка сервера',
        user: res.locals.user
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
const startServer = async () => {
    try {
        console.log('🔄 Подключение к базе данных...');
        await sequelize.authenticate();
        console.log('✅ База данных подключена');
        
        console.log('🔄 Проверка моделей...');
        // Отключаем автоматическую синхронизацию, чтобы не создавать лишние индексы
        await sequelize.sync({ alter: false });
        console.log('✅ Модели проверены (без изменения структуры)');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================');
            console.log(`✅ СЕРВЕР ЗАПУЩЕН на порту ${PORT}`);
            console.log(`🌐 Локально: http://localhost:${PORT}`);
            if (process.env.RAILWAY_PUBLIC_DOMAIN) {
                console.log(`🌍 Хостинг: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
            }
            console.log(`📁 Режим: ${process.env.NODE_ENV || 'development'}`);
            console.log('=================================');
        });
        
    } catch (error) {
        console.error('❌ Ошибка при запуске сервера:', error);
        console.error('Детали:', error.message);
        process.exit(1);
    }
};

// Обработка завершения
process.on('SIGTERM', () => {
    console.log('👋 Получен SIGTERM, завершаю работу...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Получен SIGINT, завершаю работу...');
    process.exit(0);
});

startServer();
