import { Router } from 'express';
import UserController from '../../controllers/user/UserController';

const router = Router();

// router.put('/', UserController.updateUser);
router.put('/', UserController.updateUser);

router.post('/', UserController.createUser);


export default router;
