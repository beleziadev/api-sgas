require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const Pessoa = require('./src/models/Pessoa');
const Sector = require('./src/models/Sector');
const Notice = require('./src/models/Notice');

const ensureStatusField = async (Model) => {
  await Model.updateMany({ status: { $exists: false } }, { $set: { status: 1 } });
};

const ensurePessoaNome = async () => {
  const pessoasSemNome = await Pessoa.find({ nome: { $exists: false } }, { name: 1 }).lean();

  if (pessoasSemNome.length) {
    await Promise.all(
      pessoasSemNome.map((pessoa) =>
        Pessoa.updateOne(
          { _id: pessoa._id },
          {
            $set: { nome: pessoa.name || 'Usuário' },
            $unset: { name: '' },
          }
        )
      )
    );
  }

  await Pessoa.updateMany({ name: { $exists: true } }, { $unset: { name: '' } });
};

const initDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });

    await Promise.all([Company.init(), Pessoa.init(), Sector.init(), Notice.init()]);

    await Promise.all([
      ensureStatusField(Company),
      ensureStatusField(Sector),
      ensureStatusField(Notice),
      ensureStatusField(Pessoa),
      ensurePessoaNome(),
    ]);

    console.log(`Banco de dados "${connection.connection.name}" pronto para uso.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Não foi possível criar/validar o banco de dados:', error.message);
    process.exit(1);
  }
};

initDatabase();
