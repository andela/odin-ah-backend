import { Router } from 'express';
import auth from '../../middlewares/Authorization';
import userProfile from '../../controllers/user/UserProfile';
import profileValidator from '../../middlewares/validators/ProfileValidator';

const router = Router();


router.put('/', auth.verifyToken, profileValidator.validation, userProfile.updateProfile);
router.get('/', auth.verifyToken, userProfile.getProfile);


export default router;
