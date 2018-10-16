module.exports = {
  addCustomTypeColumn: (tableName, columnName, columnType) => `
  ALTER TABLE "${tableName}" ADD COLUMN ${columnName} ${columnType};
  `,

  updateTsVectorColumn: (tableName, columnName, columnFields) => `
  UPDATE "${tableName}" SET ${columnName} = to_tsvector('english', ${columnFields.join(
  " || ' ' || "
)});
  `,

  createTriggerOnVectorTable: (tableName, vectorColumn, columnFields) => `
  CREATE TRIGGER ${tableName}_vector_update
                BEFORE INSERT OR UPDATE ON "${tableName}"
                FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(${vectorColumn}, 'pg_catalog.english', ${columnFields.join(
  ', '
)});
  `,

  createGinIndexOnColumn: (tableName, columnName) => `
    CREATE INDEX ${tableName}_search ON "${tableName}" USING gin(${columnName});
  `,

  dropTriggerOnVectorTable: tableName => `
  DROP TRIGGER ${tableName}_vector_update ON "${tableName}";
  `,

  dropIndexOnColumn: tableName => `
  DROP INDEX ${tableName}_search;
  `,

  searchArticleWithTagFilter: () => `
    SELECT *, count(*) OVER() AS total_count
    FROM "Articles" LEFT OUTER JOIN "ArticleTags" 
    ON "Articles".id = "ArticleTags"."articleId" 
    WHERE "userId" = coalesce(:author, "userId") AND  
    "tagId" = :tag  AND
    _search @@ plainto_tsquery('english', :query)
    ORDER BY ts_rank("Articles"._search, plainto_tsquery('english', :query)) DESC
    LIMIT :limit OFFSET :offset;
  `,

  searchArticleWithAuthorFilter: () => `
    SELECT *, count(*) OVER() AS total_count
    FROM "Articles" WHERE "userId" = coalesce(:author, "userId") AND 
    _search @@ plainto_tsquery('english', :query)
    ORDER BY ts_rank("Articles"._search, plainto_tsquery('english', :query)) DESC
    LIMIT :limit OFFSET :offset;
  `,

  searchArticleNoFilter: () => `
    SELECT *, count(*) OVER() AS total_count FROM "Articles" 
    WHERE _search @@ plainto_tsquery('english', :query)
    ORDER BY ts_rank("Articles"._search, plainto_tsquery('english', :query)) DESC
    LIMIT :limit OFFSET :offset;
  `
};
