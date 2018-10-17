import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { realUser1 } from '../testHelpers/testLoginData';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import { assertErrorResponse, assertResponseStatus, deleteTable } from '../testHelpers';
import sentiment from '../../helpers/Sentiment';

const { User } = db;

chai.use(chaiHttp);
chai.should();
const text = 'Greetings from the Watson Developer Cloud Node SDK, we are pleased to say hello!';
const dummySentiment = {
  document_tone: {
    tones: [
      {
        score: 0.57529,
        tone_id: 'sadness',
        tone_name: 'Sadness'
      },
      {
        score: 0.54728,
        tone_id: 'joy',
        tone_name: 'Joy'
      }
    ]
  },
  sentences_tone: [
    {
      sentence_id: 0,
      text: 'I feel horrible about this even today but I need to admit this to get this off my chest.',
      tones: [
        {
          score: 0.553454,
          tone_id: 'sadness',
          tone_name: 'Sadness'
        },
        {
          score: 0.727988,
          tone_id: 'tentative',
          tone_name: 'Tentative'
        }
      ]
    },
  ]
};
const baseUrl = '/api/v1/sentiment-analyzer';
describe('Sentiment Analysis Test', () => {
  let user;
  before(async () => {
    await deleteTable(User);
    user = await User.create({ ...realUser1 });
  });
  it('should provide validate request input', async () => {
    const jwt = Authorization.generateToken(user.id);
    let response = await chai.request(server)
      .post(baseUrl)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({});
    assertResponseStatus(response, 400);
    assertErrorResponse(response);

    response = await chai.request(server)
      .post(baseUrl)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ text: '                   ' });
    assertResponseStatus(response, 400);
    assertErrorResponse(response);
  });

  it('should analyze the text', async () => {
    const jwt = Authorization.generateToken(user.id);
    const tone = sinon.stub(sentiment.toneAnalyzer, 'tone')
      .callsArgWith(1, null, dummySentiment);
    const response = await chai.request(server)
      .post(baseUrl)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ text });
    assertResponseStatus(response);
    response.body.should.be.a('object');
    response.body.should.have.property('result');
    response.body.result.should.be.a('object');

    response.body.result.should.have.property('document_tone');
    response.body.result.document_tone.should.be.a('object');
    response.body.result.document_tone.should.have.property('tones');
    response.body.result.document_tone.tones.should.be.a('Array');

    response.body.result.should.have.property('sentences_tone');
    response.body.result.sentences_tone.should.a('Array');
    response.body.should.be.have.property('result');
    tone.restore();
  });
  it('should return error message', async () => {
    const jwt = Authorization.generateToken(user.id);
    const err = new Error('Payload too large');
    err.code = 413;
    const tone = sinon.stub(sentiment.toneAnalyzer, 'tone')
      .callsArgWith(1, err, null);
    const response = await chai.request(server)
      .post(baseUrl)
      .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
      .send({ text });
    assertResponseStatus(response, 500);
    assertErrorResponse(response);
    response.body.should.have.property('errorCode').eq(413);
    tone.restore();
  });

  it('should not like a comment when user is not authenticated', async () => {
    const response = await chai.request(server)
      .post(baseUrl)
      .send({ text: 'like' });
    assertResponseStatus(response, 401);
    assertErrorResponse(response);
  });
});
