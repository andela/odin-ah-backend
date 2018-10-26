import Util from '../../helpers/Util';
import { createDummyArticles } from './articleUtil';
import db from '../../models';

const {
  Series
} = db;
export const seriesContent = {
  title: 'Ever wonder how?',
  description: 'Ever wonder how?',
  imageUrl: 'http://localhost:3000/path/to/my/awesome/series/cover.jpeg',
};

/**
 *
 * @param {User} user1
 * @param {number} [numOfArticles]
 * @return {Promise<any[]>} Creates and returns two dummy series.
 */
export async function createDummySeries(user1, numOfArticles = 5) {
  const [series, articles] = await Promise.all([
    Series.create({
      ...seriesContent,
      slug: Util.createSlug('Ever wonder how?')
    })
      .then(result => result.setUser(user1)),
    createDummyArticles(user1, numOfArticles),
  ]);
  await Promise.all(articles.map(article => article.setSeries(series)));
  return series;
}

/**
 *
 * @param {response} response
 * @param {number} [numOfSeries]
 * @return {void} Assert the response return by the server when a user gets multiple series
 */
export function assertMultipleSeriesResponse(response, numOfSeries = 0) {
  response.body.should.be.a('object');
  response.body.data.should.be.a('object');
  response.body.should.have.property('data');
  response.body.should.have.property('message');
  response.body.should.have.property('status');
  response.body.data.should.have.property('series');
  response.body.data.series.should.be.a('Array');
  response.body.data.series.length.should.be.eql(numOfSeries);
}

/**
 *
 * @param {response} response
 * @param {object} series request data
 * @param {User} user
 * @param {Array<string>} tags
 * @param {number} articles
 * @return {void} Assert the series data result by the server
 */
export function assertSeriesResponseData(response, series, user, tags, articles) {
  response.body.should.have.property('message');
  response.body.should.have.property('status');
  response.body.should.have.property('series');
  response.body.series.should.have.property('title')
    .eq(series.title);
  response.body.series.should.have.property('description')
    .eq(series.description);
  response.body.series.should.have.property('imageUrl')
    .eq(series.imageUrl);
  response.body.series.should.have.property('tags');
  response.body.series.should.have.property('author');
  if (tags) {
    response.body.series.tags.length.should.be.eq(tags.length);
  }
  response.body.series.author.should.have.property('username')
    .eq(user.username);
  if (articles) {
    response.body.series.should.have.property('articles');
    response.body.series.articles.data.length.should.be.eql(articles);
    response.body.series.articles.data[0].should.have.property('title');
    response.body.series.articles.data[0].should.have.property('description');
    response.body.series.articles.data[0].should.have.property('body');
  }
}
