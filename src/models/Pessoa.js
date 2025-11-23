const mongoose = require('mongoose');

const pessoaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    cargo: {
      type: String,
      trim: true,
      default: null,
    },
    telefone: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true, versionKey: false }
);

pessoaSchema.index({ email: 1, company: 1, branch: 1, status: 1 }, { unique: true });

pessoaSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model('Pessoa', pessoaSchema);
