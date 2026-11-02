import { Router } from 'express';
import { createCategory, deleteCategory, updateCategory } from '../controllers/categoryController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();router.use(requireAuth,requireAdmin);router.post('/',asyncHandler(createCategory));router.patch('/:id',asyncHandler(updateCategory));router.delete('/:id',asyncHandler(deleteCategory));export default router;
