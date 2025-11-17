require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const LoginCredential = require('./src/models/LoginCredential');

const initDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    await Promise.all([Company.init(), LoginCredential.init()]);

    console.log(`Banco de dados "${connection.connection.name}" pronto para uso.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Não foi possível criar/validar o banco de dados:', error.message);
    process.exit(1);
  }
};

initDatabase();
