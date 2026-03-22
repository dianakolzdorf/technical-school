// Проверка авторизации
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'Пожалуйста, войдите в систему');
    res.redirect('/login');
};

// Проверка администратора
const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        req.flash('error', 'Пожалуйста, войдите в систему');
        return res.redirect('/login');
    }
    
    if (req.session.userRole === 'admin') {
        return next();
    }
    
    req.flash('error', 'У вас нет прав администратора');
    res.redirect('/');
};

// Проверка гостя (не авторизован)
const isGuest = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next();
    }
    res.redirect('/dashboard');
};

// Добавление пользователя в шаблоны
const addUserToLocals = (req, res, next) => {
    res.locals.user = req.session.userId ? {
        userId: req.session.userId,
        userEmail: req.session.userEmail,
        userRole: req.session.userRole,
        userName: req.session.userName
    } : null;
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest,
    addUserToLocals
};
