const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sector',
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    importance: {
      type: String,
      trim: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  { timestamps: true, versionKey: false }
);

noticeSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model('Notice', noticeSchema);
