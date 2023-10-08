module.exports = {
    
    dialect: 'postgres',
    host: process.env.DB_ADDRESS,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialectOptions: {
        ssl: {
        rejectUnauthorized: false
        }
    },
    define : {
        timestamps: false, //Preencher em automatico created e updated
    }
    
}