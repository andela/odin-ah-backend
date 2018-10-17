import sqlHelper from '../../helpers/rawSqlHelpers';

describe('sqlHelper functions', () => {
  const tableName = 'tableName';
  const columnName = 'columnName';
  const columnFields = ['field1', 'field2'];
  const columnType = 'TYPE';
  const vectorColumn = 'vectorColumn';

  it('should call all functions', (done) => {
    sqlHelper.addCustomTypeColumn(tableName, columnName, columnType);
    sqlHelper.createGinIndexOnColumn(tableName, columnName);
    sqlHelper.createTriggerOnVectorTable(tableName, vectorColumn, columnFields);
    sqlHelper.dropIndexOnColumn(tableName);
    sqlHelper.dropTriggerOnVectorTable(tableName);
    sqlHelper.searchArticleNoFilter();
    sqlHelper.searchArticleWithAuthorFilter();
    sqlHelper.searchArticleWithTagFilter();
    sqlHelper.updateTsVectorColumn(tableName, columnName, columnFields);
    done();
  });
});
