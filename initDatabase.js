require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const LoginCredential = require('./src/models/LoginCredential');
const Sector = require('./src/models/Sector');
const Notice = require('./src/models/Notice');

const ensureStatusField = async (Model) => {
  await Model.updateMany({ status: { $exists: false } }, { $set: { status: 1 } });
};

const ensureCredentialName = async () => {
  await LoginCredential.updateMany(
    { name: { $exists: false } },
    { $set: { name: 'Usuário' } }
  );
};

const initDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    await Promise.all([Company.init(), LoginCredential.init(), Sector.init(), Notice.init()]);

    await Promise.all([
      ensureStatusField(Company),
      ensureStatusField(Sector),
      ensureStatusField(Notice),
      ensureStatusField(LoginCredential),
      ensureCredentialName(),
    ]);

    console.log(`Banco de dados "${connection.connection.name}" pronto para uso.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Não foi possível criar/validar o banco de dados:', error.message);
    process.exit(1);
  }
};

initDatabase();
