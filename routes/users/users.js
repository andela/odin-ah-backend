import { Router } from 'express';
import profileController from '../../controllers/profile/ProfileController';
import profileValidator from '../../middlewares/validators/ProfileValidator';
import UserController from '../../controllers/user/UserController';
import Validator from '../../middlewares/validators';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';
import Guard from '../../middlewares/Guard';
import Roles from '../../config/role/index';

const router = Router();


router.put('/', profileValidator.validation, asyncCatchErrors(profileController.updateProfile));
router.get('/', asyncCatchErrors(profileController.getProfileById));

router.get('/list', asyncCatchErrors(profileController.getAllProfile));
router.get('/:id', profileValidator.validateId, asyncCatchErrors(profileController.getProfileById));
router.post('/reset-password/begin', Validator.User.beginResetPassword, asyncCatchErrors(UserController.beginResetPassword));
router.post('/reset-password/complete/:token', Validator.User.completeResetPassword, asyncCatchErrors(UserController.completePasswordReset));
router.put('/:id/:role', Guard.allow(Roles.superAdmin), asyncCatchErrors(profileController.updateRole));

export default router;
