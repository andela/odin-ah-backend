import passport from 'passport';
import { Router } from 'express';
import AuthController from '../../controllers/auth/AuthController';
import AuthValidator from '../../middlewares/validators/AuthValidator';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';

const router = Router();

router.post('/login', AuthValidator.validateLogin, asyncCatchErrors(AuthController.login));
router.post('/signup', AuthValidator.validatesignup, AuthController.signUp);

router.get('/confirmation/:token', AuthController.verifyUser);
router.post('/confirmation', AuthController.resendVerificationLink);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false
  }),
  AuthController.serializeUser
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false
  }),
  AuthController.serializeUser
);

router.get(
  '/twitter',
  passport.authenticate('twitter', { scope: ['include_email=true', 'include_entities=false'] })
);
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    session: false
  }),
  AuthController.serializeUser
);

export default router;
