const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    technicalManager: {
      type: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pessoa' },
        name: { type: String, trim: true },
      },
      default: null,
    },
    responsible: {
      type: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pessoa' },
        name: { type: String, trim: true },
      },
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    sectorType: {
      type: String,
      trim: true,
    },
    manager: {
      type: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pessoa' },
        name: { type: String, trim: true },
      },
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true, versionKey: false }
);

sectorSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    const normalizeRef = (ref) =>
      ref
        ? {
            id: ref.id ? `${ref.id}` : null,
            nome: ref.nome || ref.name || null,
          }
        : null;
    ret.manager = normalizeRef(ret.manager);
    ret.responsible = normalizeRef(ret.responsible);
    ret.technicalManager = normalizeRef(ret.technicalManager);
    delete ret._id;
  },
});

module.exports = mongoose.model('Sector', sectorSchema);
