const Company = require('../models/Company');

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
  };
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(normalizeCompanyPayload(req.body));
    return res.status(201).json(company);
  } catch (error) {
    return next(error);
  }
};

exports.listCompanies = async (_req, res, next) => {
  try {
    const companies = await Company.find().lean({ virtuals: true });
    return res.json(companies);
  } catch (error) {
    return next(error);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).lean({ virtuals: true });
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    return res.json(company);
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

    return res.json(company);
  } catch (error) {
    return next(error);
  }
};
