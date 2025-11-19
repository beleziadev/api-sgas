const Company = require('../models/Company');
const Sector = require('../models/Sector');
const Notice = require('../models/Notice');

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

const normalizeNoticePayload = (payload = {}) => {
  const {
    message,
    companyId,
    company,
    sectorId,
    sector,
    expiresAt,
    viewed,
    importance,
    status,
  } = payload;

  const normalized = {
    message,
    company: companyId || company,
    sector: sectorId || sector || null,
    expiresAt,
    viewed,
    importance,
    status: sanitizeStatusValue(status),
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined)
  );
};

const ensureCompanyExists = async (companyId, res) => {
  if (!companyId) {
    res.status(400).json({ message: 'O ID da empresa é obrigatório.' });
    return null;
  }

  const companyDoc = await Company.findOne({ _id: companyId, ...ACTIVE_STATUS_CLAUSE });
  if (!companyDoc) {
    res.status(404).json({ message: 'Empresa informada não encontrada.' });
    return null;
  }

  return companyDoc;
};

const ensureSectorIsValid = async (sectorId, companyId, res) => {
  if (!sectorId) {
    return null;
  }

  const sectorDoc = await Sector.findOne({ _id: sectorId, ...ACTIVE_STATUS_CLAUSE });
  if (!sectorDoc) {
    res.status(404).json({ message: 'Setor informado não encontrado.' });
    return null;
  }

  if (companyId && sectorDoc.company.toString() !== companyId.toString()) {
    res
      .status(400)
      .json({ message: 'O setor informado não pertence à empresa especificada.' });
    return null;
  }

  return sectorDoc;
};

exports.createNotice = async (req, res, next) => {
  try {
    const payload = normalizeNoticePayload(req.body);

    if (!payload.message) {
      return res.status(400).json({ message: 'O texto do aviso é obrigatório.' });
    }

    const company = await ensureCompanyExists(payload.company, res);
    if (!company) return;

    if (payload.sector) {
      const sector = await ensureSectorIsValid(payload.sector, payload.company, res);
      if (!sector) return;
    }

    const notice = await Notice.create(payload);
    return res.status(201).json(notice);
  } catch (error) {
    return next(error);
  }
};

exports.listNotices = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.companyId) {
      filter.company = req.query.companyId;
    }

    if (req.query.sectorId) {
      filter.sector = req.query.sectorId;
    }

    if (req.query.viewed !== undefined) {
      filter.viewed = req.query.viewed === 'true';
    }

    applyStatusFilter(filter, req.query?.status);

    const notices = await Notice.find(filter)
      .populate('company', 'name cnpj')
      .populate('sector', 'name')
      .exec();

    return res.json(notices);
  } catch (error) {
    return next(error);
  }
};

exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('company', 'name cnpj')
      .populate('sector', 'name')
      .exec();

    if (!notice) {
      return res.status(404).json({ message: 'Aviso não encontrado.' });
    }

    return res.json(notice);
  } catch (error) {
    return next(error);
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const payload = normalizeNoticePayload(req.body);

    if (payload.company) {
      const company = await ensureCompanyExists(payload.company, res);
      if (!company) return;
    }

    if (payload.sector) {
      const companyId = payload.company || (await Notice.findById(req.params.id))?.company;
      if (!companyId) {
        return res.status(400).json({
          message: 'Informe o ID da empresa ao atualizar o setor do aviso.',
        });
      }

      const sector = await ensureSectorIsValid(payload.sector, companyId, res);
      if (!sector) return;
    }

    const notice = await Notice.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name cnpj')
      .populate('sector', 'name')
      .exec();

    if (!notice) {
      return res.status(404).json({ message: 'Aviso não encontrado.' });
    }

    return res.json(notice);
  } catch (error) {
    return next(error);
  }
};
