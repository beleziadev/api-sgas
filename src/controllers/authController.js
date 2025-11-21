const bcrypt = require('bcrypt');
const Company = require('../models/Company');
const LoginCredential = require('../models/LoginCredential');

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

exports.registerCredential = async (req, res, next) => {
  try {
    const { name, email, password, companyId, branchId } = req.body;

    if (!name || !email || !password || !companyId) {
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

    const credential = await LoginCredential.create({
      name,
      email,
      passwordHash,
      company: companyId,
      branch: branchToUse,
      status: ACTIVE_STATUS,
    });

    return res.status(201).json(credential);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Já existe um login cadastrado para esse email/empresa/filial.',
      });
    }
    return next(error);
  }
};

exports.listCredentials = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.companyId) {
      filter.company = req.query.companyId;
    }

    if (req.query.branchId) {
      filter.branch = normalizeBranch(req.query.companyId, req.query.branchId);
    }

    applyStatusFilter(filter, req.query?.status);

    const logins = await LoginCredential.find(filter)
      .populate('company', 'name cnpj')
      .populate('branch', 'name cnpj')
      .lean();

    const sanitizedLogins = logins.map((login) => {
      const { passwordHash, __v, ...rest } = login;
      return rest;
    });

    return res.json(sanitizedLogins);
  } catch (error) {
    return next(error);
  }
};

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

    const credential = await LoginCredential.findOne({
      email,
      company: companyId,
      branch: branchToUse,
      ...ACTIVE_STATUS_CLAUSE,
    });

    if (!credential) {
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

    const isValidPassword = await bcrypt.compare(password, credential.passwordHash);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: 'Verifique os dados informado!' });
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
