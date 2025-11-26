const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      trim: true,
    },
    cnpj: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    stateRegistration: {
      type: String,
      trim: true,
    },
    municipalRegistration: {
      type: String,
      trim: true,
    },
    activity: {
      type: String,
      trim: true,
    },
    phones: [
      {
        type: String,
        trim: true,
      },
    ],
    emails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    matrixCompany: {
      type: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Company',
        },
        name: {
          type: String,
          trim: true,
        },
      },
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

companySchema.virtual('isMatrix').get(function isMatrix() {
  return !this.matrixCompany || !this.matrixCompany.id;
});

companySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model('Company', companySchema);
