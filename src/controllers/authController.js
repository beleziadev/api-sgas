const bcrypt = require('bcrypt');
const Company = require('../models/Company');
const Pessoa = require('../models/Pessoa');

const SALT_ROUNDS = 10;
const ACTIVE_STATUS = 1;
const ACTIVE_STATUS_CLAUSE = { $or: [{ status: ACTIVE_STATUS }, { status: { $exists: false } }] };

const resolveStatusFilter = (value) => {
  if (value === undefined || value === null || value === '') {
    return ACTIVE_STATUS;
  }
  if (value === 'all') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? ACTIVE_STATUS : parsed;
};

const buildStatusClause = (value) => {
  const resolved = resolveStatusFilter(value);
  if (typeof resolved === 'undefined') {
    return null;
  }
  if (resolved === ACTIVE_STATUS) {
    return ACTIVE_STATUS_CLAUSE;
  }
  return { status: resolved };
};

const applyStatusFilter = (filter, value) => {
  const clause = buildStatusClause(value);
  if (!clause) return;

  if (!filter.$and) {
    filter.$and = [];
  }
  filter.$and.push(clause);
};

const normalizeBranch = (companyId, branchId) => {
  if (!branchId || branchId === companyId) {
    return null;
  }
  return branchId;
};

exports.createPessoa = async (req, res, next) => {
  try {
    const { nome, cargo, telefone, email, password, companyId, branchId } = req.body;

    if (!nome || !email || !password || !companyId) {
      return res
        .status(400)
        .json({ message: 'Nome, email, senha e o ID da empresa são obrigatórios.' });
    }

    const branchToUse = normalizeBranch(companyId, branchId);

    const [company, branch] = await Promise.all([
      Company.findOne({ _id: companyId, ...ACTIVE_STATUS_CLAUSE }),
      branchToUse
        ? Company.findOne({ _id: branchToUse, ...ACTIVE_STATUS_CLAUSE })
        : Promise.resolve(null),
    ]);

    if (!company) {
      return res.status(404).json({ message: 'Empresa informada não encontrada.' });
    }

    if (branchToUse && !branch) {
      return res.status(404).json({ message: 'Filial informada não encontrada.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const pessoa = await Pessoa.create({
      nome,
      cargo: cargo || null,
      telefone: telefone || null,
      email,
      passwordHash,
      company: companyId,
      branch: branchToUse,
      status: ACTIVE_STATUS,
    });

    return res.status(201).json(pessoa);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Já existe uma pessoa cadastrada para esse email/empresa/filial.',
      });
    }
    return next(error);
  }
};

exports.listPessoas = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.companyId) {
      filter.company = req.query.companyId;
    }

    if (req.query.branchId) {
      filter.branch = normalizeBranch(req.query.companyId, req.query.branchId);
    }

    applyStatusFilter(filter, req.query?.status);

    const pessoas = await Pessoa.find(filter)
      .populate('company', 'name cnpj')
      .populate('branch', 'name cnpj')
      .lean();

    const sanitized = pessoas.map((pessoa) => {
      const { passwordHash, __v, ...rest } = pessoa;
      return rest;
    });

    return res.json(sanitized);
  } catch (error) {
    return next(error);
  }
};

exports.pessoa = async (req, res, next) => {

  try {

    if (!req.params.id) {
      return res
        .status(400)
        .json({ message: 'ID da pessoa não identificados.' });
    }

    const pessoa = await Pessoa.findOne({
      _id: req.params.id,
      ...ACTIVE_STATUS_CLAUSE,
    })
      .populate('company', 'name cnpj')
      .populate('branch', 'name cnpj')
      .lean({ virtuals: true });

    if (!pessoa) {
      return res.status(404).json({ message: 'Pessoa não encontrada' });
    }

    const { passwordHash, __v, ...sanitizedPessoa } = pessoa;
    return res.json(sanitizedPessoa);
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { email, password, branchId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: 'O ID da empresa é obrigatório na rota.' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const branchToUse = normalizeBranch(companyId, branchId);

    const pessoa = await Pessoa.findOne({
      email,
      company: companyId,
      branch: branchToUse,
      ...ACTIVE_STATUS_CLAUSE,
    });

    if (!pessoa) {
      return res
        .status(401)
        .json({ message: 'Combinação de empresa/filial e credenciais inválida.' });
    }

    const [company, branch] = await Promise.all([
      Company.findOne({ _id: companyId, ...ACTIVE_STATUS_CLAUSE }),
      branchToUse
        ? Company.findOne({ _id: branchToUse, ...ACTIVE_STATUS_CLAUSE })
        : Promise.resolve(null),
    ]);

    if (!company || (branchToUse && !branch)) {
      return res
        .status(401)
        .json({ message: 'Combinação de empresa/filial e credenciais inválida.' });
    }

    const isValidPassword = await bcrypt.compare(password, pessoa.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Verifique os dados informado!' });
    }

    const isMatrix = !branchToUse;

    return res.json({
      message: 'Login efetuado com sucesso.',
      companyId,
      branchId: branchToUse || companyId,
      matriz: isMatrix,
    });
  } catch (error) {
    return next(error);
  }
};
