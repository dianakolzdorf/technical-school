const express = require('express');
const router = express.Router();
const { Teacher } = require('../models');
const { isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка загрузки файлов
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'teacher-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Только изображения разрешены'));
    }
});

// ========== СПЕЦИФИЧНЫЕ МАРШРУТЫ ==========

// Форма добавления преподавателя (только админ)
router.get('/teachers/add', isAdmin, (req, res) => {
    console.log('Открыта форма добавления преподавателя');
    res.render('add-teacher', { 
        user: req.session,
        isAdmin: true
    });
});

// Обработка добавления преподавателя (только админ) - с фото
router.post('/teachers/add', isAdmin, upload.single('photo'), async (req, res) => {
    try {
        const { teacher_id, first_name, last_name, subject, category, experience } = req.body;
        
        let photoFilename = 'default-avatar.jpg';
        if (req.file) {
            photoFilename = req.file.filename;
        }
        
        await Teacher.create({
            teacher_id,
            first_name,
            last_name,
            subject,
            category: category || 'без категории',
            experience: parseInt(experience),
            photo: photoFilename
        });
        
        req.flash('success', 'Преподаватель успешно добавлен');
        res.redirect('/teachers');
    } catch (error) {
        console.error('Ошибка:', error);
        req.flash('error', 'Ошибка при добавлении преподавателя');
        res.redirect('/teachers/add');
    }
});

// Форма редактирования преподавателя
router.get('/teachers/edit/:id', isAdmin, async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            req.flash('error', 'Преподаватель не найден');
            return res.redirect('/teachers');
        }
        res.render('edit-teacher', { 
            teacher: teacher,
            user: req.session,
            isAdmin: true
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Обработка редактирования
router.post('/teachers/edit/:id', isAdmin, upload.single('photo'), async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            req.flash('error', 'Преподаватель не найден');
            return res.redirect('/teachers');
        }
        
        const { first_name, last_name, subject, category, experience } = req.body;
        
        if (req.file) {
            teacher.photo = req.file.filename;
        }
        
        await teacher.update({
            first_name,
            last_name,
            subject,
            category,
            experience: parseInt(experience)
        });
        
        req.flash('success', 'Преподаватель обновлен');
        res.redirect('/teachers');
    } catch (error) {
        console.error('Ошибка:', error);
        req.flash('error', 'Ошибка при обновлении');
        res.redirect('/teachers/edit/' + req.params.id);
    }
});

// Удаление преподавателя
router.post('/teachers/delete/:id', isAdmin, async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (teacher) {
            await teacher.destroy();
            req.flash('success', 'Преподаватель удален');
        }
        res.redirect('/teachers');
    } catch (error) {
        console.error('Ошибка:', error);
        req.flash('error', 'Ошибка при удалении');
        res.redirect('/teachers');
    }
});

// ========== ПУБЛИЧНЫЕ МАРШРУТЫ ==========

// Список преподавателей
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            order: [['last_name', 'ASC']]
        });
        
        // Отладка: выводим фото каждого преподавателя
        console.log('=== Преподаватели и их фото ===');
        teachers.forEach(t => {
            console.log(`ID: ${t.id}, Имя: ${t.first_name}, Фото: ${t.photo}`);
        });
        
        res.render('teachers', { 
            teachers: teachers,
            user: req.session,
            isAdmin: req.session?.userRole === 'admin'
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка загрузки');
    }
});

// Просмотр преподавателя
router.get('/teachers/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            req.flash('error', 'Преподаватель не найден');
            return res.redirect('/teachers');
        }
        console.log(`Просмотр преподавателя ${teacher.id}, фото: ${teacher.photo}`);
        res.render('teacher-view', { 
            teacher: teacher,
            user: req.session,
            isAdmin: req.session?.userRole === 'admin'
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
