import SearchEngine from '../../helpers/SearchEngine';

const searchController = async (req, res, next) => {
  try {
    const { q: query } = req.query;
    const {
      page, limit, author, tag
    } = req.sanitizedQuery;

    const searchEngine = new SearchEngine(query);
    searchEngine.setPagination({ limit, page });
    searchEngine.setFilters({ tag, author });
    const { count: totalCount, rows: searchResults } = await searchEngine.execute();
    const cleanResults = searchResults.map(result => ({
      slug: result.slug,
      id: result.id,
      title: result.title,
      description: result.description,
      authorId: result.userId
    }));

    res.status(200).json({
      results: cleanResults,
      meta: {
        totalCount,
        page,
        limit,
        query
      }
    });
  } catch (err) {
    next(err);
  }
};

export default searchController;
