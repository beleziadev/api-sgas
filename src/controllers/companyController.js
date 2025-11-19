const Company = require('../models/Company');

const ACTIVE_STATUS = 1;
const ACTIVE_STATUS_CLAUSE = { $or: [{ status: ACTIVE_STATUS }, { status: { $exists: false } }] };

const sanitizeStatusValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

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

const normalizeCompanyPayload = (payload = {}) => {
  const {
    name,
    legalName,
    cnpj,
    stateRegistration,
    municipalRegistration,
    activity,
    phones = [],
    emails = [],
    matrixCompany = null,
    status,
  } = payload;

  const sanitizedPhones = Array.isArray(phones) ? phones.filter(Boolean) : [];
  const sanitizedEmails = Array.isArray(emails) ? emails.filter(Boolean) : [];

  return {
    name,
    legalName,
    cnpj,
    stateRegistration,
    municipalRegistration,
    activity,
    phones: sanitizedPhones,
    emails: sanitizedEmails,
    matrixCompany: matrixCompany || null,
    status: sanitizeStatusValue(status),
  };
};

const mapCompanyResponse = (company) => {
  if (!company) return null;
  const { _id, __v, ...rest } = company;
  return { ...rest, id: _id };
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(normalizeCompanyPayload(req.body));
    return res.status(201).json(company);
  } catch (error) {
    return next(error);
  }
};

exports.listCompanies = async (req, res, next) => {
  try {
    const filter = {};
    applyStatusFilter(filter, req.query?.status);

    const companies = await Company.find(filter).lean({ virtuals: true });
    return res.json(companies.map(mapCompanyResponse));
  } catch (error) {
    return next(error);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      ...ACTIVE_STATUS_CLAUSE,
    }).lean({ virtuals: true });
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    return res.json(mapCompanyResponse(company));
  } catch (error) {
    return next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      normalizeCompanyPayload(req.body),
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    return res.json(mapCompanyResponse(company));
  } catch (error) {
    return next(error);
  }
};
