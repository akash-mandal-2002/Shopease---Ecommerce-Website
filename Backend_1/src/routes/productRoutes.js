import { Router } from 'express';
import { createProduct, deleteProduct, getCategories, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(getProducts));
router.get('/categories', asyncHandler(getCategories));
router.get('/:id', asyncHandler(getProductById));
router.post('/', requireAuth, requireAdmin, asyncHandler(createProduct));
router.patch('/:id', requireAuth, requireAdmin, asyncHandler(updateProduct));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteProduct));
export default router;
