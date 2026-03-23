const { Sequelize } = require('sequelize');
require('dotenv').config();

// Проверяем наличие всех необходимых переменных окружения
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Ошибка: Переменная ${varName} не определена в .env файле`);
        process.exit(1);
    }
});

// Создание подключения к базе данных
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Отключаем логирование в продакшене
        dialectOptions: {
            connectTimeout: 60000
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            // Отключаем автоматическое создание индексов
            indexes: []
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 60000,
            idle: 10000
        },
        retry: {
            max: 3
        },
        // Отключаем автоматическую синхронизацию
        sync: { alter: false, force: false }
    }
);

// Функция для проверки подключения с повторными попытками
const testConnectionWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await sequelize.authenticate();
            console.log('✅ Подключение к базе данных успешно установлено');
            console.log(`📊 Информация:`);
            console.log(`   - База данных: ${process.env.DB_NAME}`);
            console.log(`   - Хост: ${process.env.DB_HOST || 'localhost'}`);
            console.log(`   - Пользователь: ${process.env.DB_USER}`);
            console.log(`   - Режим: ${process.env.NODE_ENV || 'development'}`);
            return true;
        } catch (error) {
            console.log(`⚠️  Попытка ${i + 1} из ${retries} не удалась: ${error.message}`);
            if (i < retries - 1) {
                console.log('⏳ Ожидание 2 секунды перед следующей попыткой...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    console.error('❌ Не удалось подключиться к базе данных после всех попыток');
    console.error('\n🔧 Возможные решения:');
    console.error('1. Проверьте, запущен ли MySQL: sudo systemctl status mysql');
    console.error('2. Проверьте настройки в .env файле');
    console.error('3. Создайте базу данных: mysql -u root -p -e "CREATE DATABASE technical_school;"');
    console.error('4. Проверьте права пользователя: GRANT ALL PRIVILEGES ON technical_school.* TO "root"@"localhost";');
    
    return false;
};

// Запускаем проверку подключения
testConnectionWithRetry();

// Обработка закрытия соединения при завершении приложения
process.on('SIGINT', async () => {
    try {
        await sequelize.close();
        console.log('👋 Соединение с базой данных закрыто');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при закрытии соединения:', error);
        process.exit(1);
    }
});

module.exports = sequelize;
