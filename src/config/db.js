const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });
    console.log(`MongoDB conectado: ${connection.connection.host}`);
  } catch (error) {
    console.error('Erro ao conectar no MongoDB', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
