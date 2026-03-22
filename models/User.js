const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('student', 'teacher', 'admin'),
        defaultValue: 'student'
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Метод для проверки пароля
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Методы для проверки ролей
User.prototype.isStudent = function() {
    return this.role === 'student';
};

User.prototype.isTeacher = function() {
    return this.role === 'teacher';
};

User.prototype.isAdmin = function() {
    return this.role === 'admin';
};

// Метод для получения студенческого профиля
User.prototype.getStudentProfile = async function() {
    const { Student } = require('./index');
    return await Student.findOne({ where: { user_id: this.id } });
};

// Метод для публичных данных
User.prototype.getPublicData = function() {
    return {
        id: this.id,
        full_name: this.full_name,
        email: this.email,
        role: this.role,
        phone: this.phone,
        status: this.status
    };
};

module.exports = User;
