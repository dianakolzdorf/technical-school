const express = require('express');
const router = express.Router();
const { Student } = require('../models');
const { isAdmin } = require('../middleware/auth');

// ========== СПЕЦИФИЧНЫЕ МАРШРУТЫ ДОЛЖНЫ БЫТЬ ПЕРВЫМИ ==========

// Форма добавления студента (только админ) - ЭТО ДОЛЖНО БЫТЬ ПЕРВЫМ
router.get('/students/add', isAdmin, (req, res) => {
    console.log('Открыта форма добавления студента');
    res.render('add-student', { 
        user: req.session,
        isAdmin: true
    });
});

// Обработка добавления студента (только админ)
router.post('/students/add', isAdmin, async (req, res) => {
    try {
        const { student_id, first_name, last_name, group_name, email, birth_date } = req.body;
        
        console.log('Добавление студента:', req.body);
        
        await Student.create({
            student_id,
            first_name,
            last_name,
            group_name,
            email,
            birth_date,
            photo: 'default-avatar.jpg'
        });
        
        req.flash('success', 'Студент успешно добавлен');
        res.redirect('/students');
    } catch (error) {
        console.error('Ошибка при добавлении студента:', error);
        req.flash('error', 'Ошибка при добавлении студента: ' + error.message);
        res.redirect('/students/add');
    }
});

// Форма редактирования студента (только админ)
router.get('/students/edit/:id', isAdmin, async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            req.flash('error', 'Студент не найден');
            return res.redirect('/students');
        }
        
        res.render('edit-student', { 
            title: 'Редактировать студента',
            student: student,
            user: req.session,
            isAdmin: true
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Обработка редактирования студента (только админ)
router.post('/students/edit/:id', isAdmin, async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            req.flash('error', 'Студент не найден');
            return res.redirect('/students');
        }
        
        const { first_name, last_name, group_name, email, birth_date } = req.body;
        
        await student.update({
            first_name,
            last_name,
            group_name,
            email,
            birth_date
        });
        
        req.flash('success', 'Студент успешно обновлен');
        res.redirect('/students');
        
    } catch (error) {
        console.error('Ошибка:', error);
        req.flash('error', 'Ошибка при обновлении');
        res.redirect('/students/edit/' + req.params.id);
    }
});

// Удаление студента (только админ)
router.post('/students/delete/:id', isAdmin, async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (student) {
            await student.destroy();
            req.flash('success', 'Студент удален');
        } else {
            req.flash('error', 'Студент не найден');
        }
        res.redirect('/students');
    } catch (error) {
        console.error('Ошибка:', error);
        req.flash('error', 'Ошибка при удалении');
        res.redirect('/students');
    }
});

// ========== ДИНАМИЧЕСКИЕ МАРШРУТЫ ДОЛЖНЫ БЫТЬ ПОСЛЕДНИМИ ==========

// Публичный список студентов (доступен всем)
router.get('/students', async (req, res) => {
    try {
        const students = await Student.findAll({
            order: [['last_name', 'ASC']]
        });
        
        res.render('students', { 
            title: 'Список студентов',
            students: students,
            user: req.session,
            isAdmin: req.session?.userRole === 'admin'
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Просмотр детальной информации о студенте (доступно всем) - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
router.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            req.flash('error', 'Студент не найден');
            return res.redirect('/students');
        }
        
        res.render('student-view', { 
            title: 'Просмотр студента',
            student: student,
            user: req.session,
            isAdmin: req.session?.userRole === 'admin'
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
