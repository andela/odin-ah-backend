import { Router } from 'express';
import ProfileController from '../../controllers/profile/ProfileController';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';
import ProfileValidator from '../../middlewares/validators/ProfileValidator';

const router = Router();

router.post('/:userId/follow', ProfileValidator.validateFollow, asyncCatchErrors(ProfileController.follow));
router.delete('/:userId/follow', ProfileValidator.validateFollow, asyncCatchErrors(ProfileController.unfollow));
router.get('/follower', asyncCatchErrors(ProfileController.getMyFollowers));
router.get('/following', asyncCatchErrors(ProfileController.getUsersIFollow));


export default router;
