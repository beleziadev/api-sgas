const Company = require('../models/Company');
const Address = require('../models/Address');

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

const ensureCompanyExists = async (companyId, res) => {
  if (!companyId) {
    res.status(400).json({ message: 'O ID da empresa é obrigatório.' });
    return null;
  }

  const company = await Company.findOne({ _id: companyId, ...ACTIVE_STATUS_CLAUSE });
  if (!company) {
    res.status(404).json({ message: 'Empresa informada não encontrada.' });
    return null;
  }

  return company;
};

const normalizePayload = (payload = {}) => {
  const { street, number, complement, city, state, district, companyId, company, status } = payload;

  const normalized = {
    street,
    number,
    complement,
    city,
    state,
    district,
    company: companyId || company,
    status: status === undefined || status === null ? undefined : Number(status),
  };

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
};

exports.createAddress = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.street || !payload.number || !payload.city || !payload.state || !payload.district) {
      return res
        .status(400)
        .json({ message: 'Rua, número, cidade, estado e bairro são obrigatórios.' });
    }

    const company = await ensureCompanyExists(payload.company, res);
    if (!company) return;

    const address = await Address.create(payload);
    return res.status(201).json(address);
  } catch (error) {
    return next(error);
  }
};

exports.listAddresses = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.companyId) {
      filter.company = req.query.companyId;
    }

    applyStatusFilter(filter, req.query?.status);

    const addresses = await Address.find(filter).populate('company', 'name cnpj').exec();
    return res.json(addresses);
  } catch (error) {
    return next(error);
  }
};

exports.getAddressById = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id).populate('company', 'name cnpj').exec();
    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado.' });
    }
    return res.json(address);
  } catch (error) {
    return next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);

    if (payload.company) {
      const company = await ensureCompanyExists(payload.company, res);
      if (!company) return;
    }

    const address = await Address.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name cnpj')
      .exec();

    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado.' });
    }

    return res.json(address);
  } catch (error) {
    return next(error);
  }
};
