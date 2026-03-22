const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
    // ПОЛЕ 1: ID (автоинкрементное, первичный ключ)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Уникальный идентификатор студента'
    },
    
    // ПОЛЕ 2: Студенческий билет (уникальный)
    student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Студенческий ID не может быть пустым'
            }
        },
        comment: 'Номер студенческого билета'
    },
    
    // ПОЛЕ 3: Имя
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Имя не может быть пустым'
            }
        },
        comment: 'Имя студента'
    },
    
    // ПОЛЕ 4: Фамилия
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Фамилия не может быть пустой'
            }
        },
        comment: 'Фамилия студента'
    },
    
    // ПОЛЕ 5: Группа
    group_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Название группы не может быть пустым'
            }
        },
        comment: 'Учебная группа'
    },
    
    // ПОЛЕ 6: Дата рождения
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Введите корректную дату'
            }
        },
        comment: 'Дата рождения'
    },
    
    // ПОЛЕ 7: Фото (путь к файлу)
    photo: {
        type: DataTypes.STRING(255),
        defaultValue: 'default-avatar.jpg',
        comment: 'Путь к фотографии студента'
    },
        email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: {
                msg: 'Введите корректный email адрес'
            }
        },
        comment: 'Email студента'
    },
    
    // ПОЛЕ ДЛЯ СВЯЗИ С USER (дополнительное)
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID пользователя (связь с таблицей users)'
    }
}, {
    tableName: 'students',
    timestamps: true,
    underscored: true,
    
    indexes: [
        { unique: true, fields: ['student_id'] },
        { fields: ['group_name'] },
        { fields: ['user_id'] }
    ],
    
    virtuals: {
        full_name: {
            get() {
                return `${this.first_name} ${this.last_name}`;
            }
        },
        
        age: {
            get() {
                if (!this.birth_date) return null;
                const today = new Date();
                const birthDate = new Date(this.birth_date);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            }
        },
        
        initials: {
            get() {
                return `${this.first_name.charAt(0)}${this.last_name.charAt(0)}`.toUpperCase();
            }
        }
    }
});

// Методы для работы со связями
Student.prototype.getUser = async function() {
    const { User } = require('./index');
    return await User.findByPk(this.user_id);
};

Student.prototype.getFullData = async function() {
    const { User } = require('./index');
    const user = await User.findByPk(this.user_id);
    
    return {
        id: this.id,
        student_id: this.student_id,
        full_name: this.full_name,
        first_name: this.first_name,
        last_name: this.last_name,
        group_name: this.group_name,
        birth_date: this.birth_date,
        age: this.age,
        photo: this.photo,
        user: user ? user.getPublicData() : null,
        created_at: this.createdAt
    };
};

Student.prototype.hasUser = function() {
    return this.user_id !== null;
};

Student.prototype.getFormattedBirthDate = function() {
    if (!this.birth_date) return '';
    const date = new Date(this.birth_date);
    return date.toLocaleDateString('ru-RU');
};

Student.prototype.getPhotoUrl = function() {
    return this.photo ? `/uploads/${this.photo}` : '/images/default-avatar.jpg';
};

module.exports = Student;
