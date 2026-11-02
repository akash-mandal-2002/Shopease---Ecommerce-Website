import { Router } from 'express';
import { createInquiry, getMyInquiries } from '../controllers/inquiryController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(createInquiry));
router.get('/mine', asyncHandler(getMyInquiries));
export default router;
