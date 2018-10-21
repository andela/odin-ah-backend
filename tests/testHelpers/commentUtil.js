import db from '../../models';

const { Comment } = db;

/**
 *
 * @param {response} response
 * @param {string} body
 * @param {User} user
 * @return {void}
 */
export function assertCommentResponse(response, body, user) {
  response.body.should.be.a('object');
  response.body.should.have.property('comment');
  response.body.comment.should.be.a('object');
  response.body.comment.should.have.property('body')
    .eq(body);

  response.body.comment.should.have.property('author');
  response.body.comment.author.should.have.property('username')
    .eq(user.username);
  response.body.comment.author.should.have.property('bio');
  response.body.comment.author.should.have.property('imageUrl');
}

export const body = 'Nunc sed diam suscipit, lobortis eros nec, auctor nisl. Nunc ac magna\n'
  + '          non justo varius rutrum sit amet feugiat elit. Pellentesque vehicula,\n'
  + '          ante rutrum condimentum tempor, purus metus vulputate ligula, et\n'
  + '          commodo tortor massa eu tortor.';
export const commentToSave = { body };

/**
 *
 * @param {User} commenter
 * @param {Article} article
 * @param {number} size
 * @return {Promise<Array>} creates dummy comment
 */
export async function createComments(commenter, article, size) {
  const comments = [];
  for (let i = 0; i < size; i += 1) {
    comments.push(Comment.create(commentToSave)
      .then(result => result.setUser(commenter))
      .then(result => result.setArticle(article)));
  }
  return Promise.all(comments);
}

/**
 *
 * @param {Comment} comment
 * @param {User} commenter
 * @param {Article} article
 * @param {number} numOfSubs
 * @return {Promise<void>} add comment on a comment
 */
export async function addSubComments(comment, commenter, article, numOfSubs) {
  const comments = await createComments(commenter, article, numOfSubs);
  const bulkUpdates = [];
  comments.forEach((item) => {
    bulkUpdates.push(item.setUser(commenter));
    bulkUpdates.push(item.setArticle(article));
    bulkUpdates.push(item.setParent(comment));
  });

  await Promise.all(bulkUpdates);
}

/**
 *
 * @param {User} commenter
 * @param {Article} article
 * @param {User} subCommenter
 * @param {number} num
 * @return {Promise<void>} create dummy comments
 */
export async function createDummyCommentWithSubComments(
  commenter, article, subCommenter = null, num = 0
) {
  const [parentComment] = await createComments(commenter, article, 1);
  const bulkUpdates = [];
  if (subCommenter) {
    bulkUpdates.push(addSubComments(parentComment, subCommenter, article, num));
  }
  await Promise.all(bulkUpdates);
  return parentComment;
}

/**
 *
 * @param {response}response
 * @param {number}length
 * @return {void} Assert the body of response
 */
export function assertCommentArrayResponse(response, length) {
  response.body.data.should.be.a('object');
  response.body.should.have.property('data');
  response.body.should.have.property('message');
  response.body.should.have.property('status');
  response.body.data.should.have.property('comments');
  response.body.data.comments.should.be.a('Array');
  response.body.data.comments.length.should.be.eql(length);
  if (length > 0) {
    response.body.data.comments[0].should.have.property('id');
    response.body.data.comments[0].should.have.property('body');
    response.body.data.comments[0].should.have.property('createdAt');
    response.body.data.comments[0].should.have.property('author');
  }
}

/**
 *
 * @param {response} response
 * @param {number} length
 * @return {void} r
 */
export function assertCommentWithSubCommentResponse(response, length) {
  response.body.comment.should.have.property('comments');
  response.body.comment.comments.data.should.be.a('Array');
  response.body.comment.comments.data.length.should.be.eql(length);
  if (length) {
    response.body.comment.comments.data[0].should.have.property('id');
    response.body.comment.comments.data[0].should.have.property('body');
    response.body.comment.comments.data[0].should.have.property('createdAt');
    response.body.comment.comments.data[0].should.have.property('author');
  }
}
