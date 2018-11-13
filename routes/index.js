import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorHandler from '../helpers/exceptionHandler/errorHandler';
import Authorization from '../middlewares/Authorization';
import articles from './article';
import like from './like';
import profiles from './profiles';
import bookmark from './bookmark';
import searchRouter from './search';
import sentiment from './sentiment';
import series from './series';
import me from './me';
import report from './report';
import tags from './tag';

const router = Router();

router.use(
  '/api/v1',
  Authorization.secureRoutes,
  searchRouter,
  auth,
  users,
  me,
  articles,
  like,
  profiles,
  bookmark,
  sentiment,
  series,
  me,
  report,
  tags,
  errorHandler
);

export default router;
