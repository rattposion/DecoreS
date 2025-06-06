import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['DISPONÍVEL', 'RESERVADO', 'EM_MANUTENÇÃO'],
    default: 'DISPONÍVEL'
  }
});

const movementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ENTRADA', 'SAÍDA'],
    required: true
  },
  model: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  source: String,
  destination: String,
  responsibleUser: String,
  observations: String
});

const stockSchema = new mongoose.Schema({
  items: {
    v1: stockItemSchema,
    v9: stockItemSchema
  },
  movements: [movementSchema]
}, {
  timestamps: true
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock; 