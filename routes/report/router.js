import { Router } from 'express';
import ReportController from '../../controllers/report/reportController';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';
import ReportValidator from '../../middlewares/validators/reportValidator';

const router = Router();

router.post('/articles/:slug', ReportValidator.reportArticleValidator, asyncCatchErrors(ReportController.reportArticle));
router.get('/articles', asyncCatchErrors(ReportController.getAllReportedArticles));


export default router;
