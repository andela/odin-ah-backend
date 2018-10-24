import chai from 'chai';
import sinon from 'sinon';
import server from '../../index';
import db from '../../models';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import Authorization from '../../middlewares/Authorization';
import { realUser1 } from '../testHelpers/testLoginData';
import { defaultArticle } from '../testHelpers/articleUtil';
import { deleteTable } from '../testHelpers';

const { expect } = chai;
const { User, Article } = db;

describe('POST /share', () => {
  let user, jwt, publicArticleSlug, privateArticleSlug, unpublishedArticleSlug;

  before(async () => {
    await Promise.all([deleteTable(User), deleteTable(Article)]);
    user = await User.create({ ...realUser1 });
    jwt = Authorization.generateToken(user.id);
    const publicArticlePromise = Article.create({ ...defaultArticle, slug: 'my-custom-slug' });
    const privateArticlePromise = Article.create({
      ...defaultArticle,
      slug: 'another-custom-slug',
      private: true
    });
    const unpublishedArticlePromise = Article.create({
      ...defaultArticle,
      slug: 'tired-custom-slug',
      isPublished: false
    });
    [
      { slug: publicArticleSlug },
      { slug: privateArticleSlug },
      { slug: unpublishedArticleSlug }
    ] = await Promise.all([publicArticlePromise, privateArticlePromise, unpublishedArticlePromise]);
  });

  it("should send a mail to an authenticated user's contact", async () => {
    const response = await chai
      .request(server)
      .post(`/api/v1/articles/${publicArticleSlug}/mailto`)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ email: 'olusola.oguntimehin@andela.com' });
    expect(response).to.have.status(200);
  });

  it('should return 400 if the user does not supply a valid email', async () => {
    const response = await chai
      .request(server)
      .post(`/api/v1/articles/${publicArticleSlug}/mailto`)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({});
    expect(response).to.have.status(400);
  });

  it('should return 404 if the article shared does not exist', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/articles/0/mailto')
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ email: realUser1.email });
    expect(response).to.have.status(404);
  });

  it('should return 403 forbidden if the article shared is private', async () => {
    const response = await chai
      .request(server)
      .post(`/api/v1/articles/${privateArticleSlug}/mailto`)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ email: realUser1.email });
    expect(response).to.have.status(403);
  });

  it('should return 403 forbidden if the article shared is not yet published', async () => {
    const response = await chai
      .request(server)
      .post(`/api/v1/articles/${unpublishedArticleSlug}/mailto`)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ email: realUser1.email });
    expect(response).to.have.status(403);
  });

  it('should return 500 internal error if a database error occurs', async () => {
    const articleModelStub = sinon.stub(Article, 'findOne').rejects();
    const response = await chai
      .request(server)
      .post(`/api/v1/articles/${publicArticleSlug}/mailto`)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ email: realUser1.email });
    expect(response).to.have.status(500);
    articleModelStub.restore();
  });
});
