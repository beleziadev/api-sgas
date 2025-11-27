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

const normalizeCompanyId = (input) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  if (typeof input === 'object') return input.id || input._id || null;
  return null;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchClause = (search) => {
  if (!search || typeof search !== 'string') return null;
  const trimmed = search.trim();
  if (!trimmed) return null;

  const pattern = new RegExp(escapeRegex(trimmed), 'i');
  return {
    $or: [{ nome: pattern }, { email: pattern }, { cargo: pattern }, { telefone: pattern }],
  };
};

const applySearchFilter = (filter, value) => {
  const clause = buildSearchClause(value);
  if (!clause) return;

  if (!filter.$and) {
    filter.$and = [];
  }
  filter.$and.push(clause);
};

const sanitizePessoa = (pessoa) => {
  if (!pessoa) return null;
  const { passwordHash, __v, ...rest } = pessoa;
  return rest;
};

exports.createPessoa = async (req, res, next) => {
  try {
    const { nome, cargo, telefone, email, password, companyId, branchId, company } = req.body;
    const resolvedCompanyId = normalizeCompanyId(companyId || company);

    if (!nome || !email || !password || !resolvedCompanyId) {
      return res
        .status(400)
        .json({ message: 'Nome, email, senha e o ID da empresa são obrigatórios.' });
    }

    const branchToUse = normalizeBranch(resolvedCompanyId, normalizeCompanyId(branchId));

    const [companyDoc, branch] = await Promise.all([
      Company.findOne({ _id: resolvedCompanyId, ...ACTIVE_STATUS_CLAUSE }),
      branchToUse
        ? Company.findOne({ _id: branchToUse, ...ACTIVE_STATUS_CLAUSE })
        : Promise.resolve(null),
    ]);

    if (!companyDoc) {
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
      company: resolvedCompanyId,
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

    const companyFilter = normalizeCompanyId(req.query.companyId || req.query.company);
    if (companyFilter) {
      filter.company = companyFilter;
    }

    const branchFilter = normalizeCompanyId(req.query.branchId || req.query.branch);
    if (branchFilter) {
      filter.branch = normalizeBranch(companyFilter, branchFilter);
    }

    applyStatusFilter(filter, req.query?.status);
    applySearchFilter(filter, req.query?.search || req.query?.q);

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

    return res.json(sanitizePessoa(pessoa));
  } catch (error) {
    next(error)
  }
}

exports.updatePessoa = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID da pessoa não identificados.' });
    }

    const { nome, cargo, telefone, email, password, companyId, branchId, status, company } =
      req.body;

    const existingPessoa = await Pessoa.findOne({ _id: id, ...ACTIVE_STATUS_CLAUSE });
    if (!existingPessoa) {
      return res.status(404).json({ message: 'Pessoa não encontrada' });
    }

    const companyToUse = normalizeCompanyId(companyId || company || existingPessoa.company);
    const branchToUse = normalizeBranch(
      companyToUse,
      normalizeCompanyId(branchId) || existingPessoa.branch
    );

    const [companyDoc, branch] = await Promise.all([
      Company.findOne({ _id: companyToUse, ...ACTIVE_STATUS_CLAUSE }),
      branchToUse
        ? Company.findOne({ _id: branchToUse, ...ACTIVE_STATUS_CLAUSE })
        : Promise.resolve(null),
    ]);

    if (!companyDoc) {
      return res.status(404).json({ message: 'Empresa informada não encontrada.' });
    }

    if (branchToUse && !branch) {
      return res.status(404).json({ message: 'Filial informada não encontrada.' });
    }

    const payload = {
      nome,
      cargo: cargo ?? existingPessoa.cargo ?? null,
      telefone: telefone ?? existingPessoa.telefone ?? null,
      email,
      company: companyToUse,
      branch: branchToUse,
    };

    if (status !== undefined) {
      payload.status = resolveStatusFilter(status);
    }

    if (password) {
      payload.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const pessoaAtualizada = await Pessoa.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name cnpj')
      .populate('branch', 'name cnpj')
      .lean();

    if (!pessoaAtualizada) {
      return res.status(404).json({ message: 'Pessoa não encontrada' });
    }

    return res.json(sanitizePessoa(pessoaAtualizada));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Já existe uma pessoa cadastrada para esse email/empresa/filial.',
      });
    }
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
