import { Router } from 'express';
import SearchQueryValidator from '../middlewares/SearchQueryValidator';
import searchController from '../controllers/search/SearchController';
import SearchQuerySanitizer from '../middlewares/SearchQuerySanitizer';

const searchRouter = Router();

searchRouter.get(
  '/search',
  SearchQueryValidator.validate,
  SearchQuerySanitizer.sanitize,
  searchController
);

export default searchRouter;
