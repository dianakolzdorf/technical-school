const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teacher_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue: 'без категории'
    },
    experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // ДОБАВЛЕНО ПОЛЕ ДЛЯ ФОТО
    photo: {
        type: DataTypes.STRING(255),
        defaultValue: 'default-avatar.jpg'
    }
}, {
    tableName: 'teachers',
    timestamps: true,
    underscored: true
});

module.exports = Teacher;
