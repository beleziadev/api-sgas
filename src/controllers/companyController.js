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

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchClause = (search) => {
  if (!search || typeof search !== 'string') return null;
  const trimmed = search.trim();
  if (!trimmed) return null;

  const pattern = new RegExp(escapeRegex(trimmed), 'i');
  return {
    $or: [{ name: pattern }, { legalName: pattern }, { cnpj: pattern }],
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

const parseBooleanLike = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return null;
};

const buildMatrixClause = (value) => {
  const parsed = parseBooleanLike(value);
  if (parsed === null) return null;

  if (parsed) {
    return {
      $or: [
        { matrixCompany: null },
        { matrixCompany: { $exists: false } },
        { 'matrixCompany.id': { $exists: false } },
        { 'matrixCompany.id': null },
      ],
    };
  }

  return {
    $and: [
      { matrixCompany: { $exists: true } },
      { matrixCompany: { $ne: null } },
      { 'matrixCompany.id': { $exists: true } },
      { 'matrixCompany.id': { $ne: null } },
    ],
  };
};

const applyMatrixFilter = (filter, value) => {
  const clause = buildMatrixClause(value);
  if (!clause) return;

  if (!filter.$and) {
    filter.$and = [];
  }
  filter.$and.push(clause);
};

const normalizeMatrixCompany = (matrixCompany) => {
  if (!matrixCompany) return null;

  if (typeof matrixCompany === 'string') {
    const trimmed = matrixCompany.trim();
    return trimmed ? { id: trimmed, name: null } : null;
  }

  if (typeof matrixCompany === 'object') {
    const id = matrixCompany.id || matrixCompany._id || matrixCompany;
    const name = matrixCompany.name || matrixCompany.legalName || null;

    if (!id && !name) return null;

    return {
      id: id ? `${id}` : null,
      name: name || null,
    };
  }

  return null;
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
    matrixCompany: normalizeMatrixCompany(matrixCompany),
    status: sanitizeStatusValue(status),
  };
};

const mapCompanyResponse = (company) => {
  if (!company) return null;
  const { _id, __v, matrixCompany, ...rest } = company;

  const normalizedMatrix =
    matrixCompany && typeof matrixCompany === 'object'
      ? {
          id: matrixCompany.id ? `${matrixCompany.id}` : null,
          name: matrixCompany.name || null,
        }
      : matrixCompany
      ? { id: `${matrixCompany}`, name: null }
      : null;

  return { ...rest, id: _id, matrixCompany: normalizedMatrix };
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
    applySearchFilter(filter, req.query?.search || req.query?.q);
    applyMatrixFilter(filter, req.query?.isMatrix ?? req.query?.matrixOnly);

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
