import db from '../../models/index';
import {
  searchArticleWithTagFilter,
  searchArticleWithAuthorFilter,
  searchArticleNoFilter
} from '../../helpers/rawSqlHelpers';

const { sequelize } = db;

const searchController = async (req, res, next) => {
  try {
    const { q: queryText } = req.query;
    const {
      page, limit, author, tag
    } = req.sanitizedQuery;

    let searchResults = [];

    const queryConfig = {
      model: db.Article,
      replacements: {
        query: queryText,
        author,
        tag,
        limit,
        offset: (page - 1) * limit
      }
    };

    if (tag) {
      searchResults = await sequelize.query(searchArticleWithTagFilter(), queryConfig);
    } else if (author) {
      searchResults = await sequelize.query(searchArticleWithAuthorFilter(), queryConfig);
    } else {
      searchResults = await sequelize.query(searchArticleNoFilter(), queryConfig);
    }

    const cleanResults = searchResults.map(result => ({
      slug: result.slug,
      id: result.id,
      title: result.title,
      description: result.description,
      authorId: result.userId
    }));

    const formattedResults = {
      results: cleanResults,
      meta: {
        totalCount: searchResults.length
          ? parseInt(searchResults[0].dataValues.total_count, 10)
          : 0,
        page,
        limit,
        query: queryText
      }
    };
    res.status(200).json(formattedResults);
  } catch (err) {
    next(err);
  }
};

export default searchController;
