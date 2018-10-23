import chai from 'chai';
import sinon from 'sinon';
import ReadingStats from '../../services/ReadingStats';
import db from '../../models';

const { ReadingStatistics } = db;
const { expect } = chai;

describe('ReadingStats class', () => {
  const eventInfo = {
    authorId: 1,
    readerId: 2,
    articleSlug: 'my-article-slug'
  };
  it('should create record for unique view', async () => {
    const ReadingStatisticsStub = sinon.stub(ReadingStatistics, 'find').resolves(true);
    const createMethod = sinon.spy(ReadingStatistics, 'create');
    await ReadingStats.articleViewHandler(eventInfo);
    const readingStatsInfo = Object.assign(eventInfo, { isUnique: false });
    expect(createMethod).to.be.calledOnceWith(readingStatsInfo);
    ReadingStatisticsStub.restore();
    createMethod.restore();
  });
  it('should create record for not unique view', async () => {
    const ReadingStatisticsStub = sinon.stub(ReadingStatistics, 'find').resolves(false);
    const createMethod = sinon.spy(ReadingStatistics, 'create');
    await ReadingStats.articleViewHandler(eventInfo);
    const readingStatsInfo = Object.assign(eventInfo, { isUnique: true });
    expect(createMethod).to.be.calledOnceWith(readingStatsInfo);
    ReadingStatisticsStub.restore();
    createMethod.restore();
  });
  it('should throw any unforseen error', async () => {
    const ReadingStatisticsStub = sinon.stub(ReadingStatistics, 'find').rejects();
    await ReadingStats.articleViewHandler(eventInfo);
    expect();
    ReadingStatisticsStub.restore();
  });
});
