const Company = require('../models/Company');
const Sector = require('../models/Sector');

const normalizeSectorPayload = (payload = {}) => {
  const {
    name,
    technicalManager,
    responsible,
    phone,
    email,
    address,
    sectorType,
    manager,
    description,
    companyId,
    company,
  } = payload;

  const normalized = {
    name,
    technicalManager,
    responsible,
    phone,
    email,
    address,
    sectorType,
    manager,
    description,
    company: companyId || company,
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

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404).json({ message: 'Empresa informada não encontrada.' });
    return null;
  }

  return company;
};

exports.createSector = async (req, res, next) => {
  try {
    const payload = normalizeSectorPayload(req.body);

    const company = await ensureCompanyExists(payload.company, res);
    if (!company) return;

    if (!payload.name) {
      return res.status(400).json({ message: 'Nome do setor é obrigatório.' });
    }

    const sector = await Sector.create(payload);
    return res.status(201).json(sector);
  } catch (error) {
    return next(error);
  }
};

exports.listSectors = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.companyId) {
      filter.company = req.query.companyId;
    }

    const sectors = await Sector.find(filter)
      .populate('company', 'name cnpj')
      .exec();

    return res.json(sectors);
  } catch (error) {
    return next(error);
  }
};

exports.listSectorsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await ensureCompanyExists(companyId, res);
    if (!company) return;

    const sectors = await Sector.find({ company: companyId })
      .populate('company', 'name cnpj')
      .exec();

    return res.json(sectors);
  } catch (error) {
    return next(error);
  }
};

exports.getSectorById = async (req, res, next) => {
  try {
    const sector = await Sector.findById(req.params.id)
      .populate('company', 'name cnpj')
      .exec();

    if (!sector) {
      return res.status(404).json({ message: 'Setor não encontrado.' });
    }

    return res.json(sector);
  } catch (error) {
    return next(error);
  }
};

exports.updateSector = async (req, res, next) => {
  try {
    const payload = normalizeSectorPayload(req.body);

    if (payload.company) {
      const company = await ensureCompanyExists(payload.company, res);
      if (!company) return;
    }

    const sector = await Sector.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name cnpj')
      .exec();

    if (!sector) {
      return res.status(404).json({ message: 'Setor não encontrado.' });
    }

    return res.json(sector);
  } catch (error) {
    return next(error);
  }
};
