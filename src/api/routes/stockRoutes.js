import express from 'express';
import {
  getStock,
  updateStock,
  addMovement,
  getMovements
} from '../controllers/stockController.js';

const router = express.Router();

// Rotas para estoque
router.get('/', getStock);
router.put('/', updateStock);
router.post('/movement', addMovement);
router.get('/movements', getMovements);

export default router; 