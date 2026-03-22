const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');  // Добавить

// Связи
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacherProfile' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    User,
    Student,
    Teacher  // Добавить
};
