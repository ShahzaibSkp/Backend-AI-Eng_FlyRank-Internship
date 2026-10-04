const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, required: true, default: false },
  },
  { versionKey: false },
);

taskSchema.index({ title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
