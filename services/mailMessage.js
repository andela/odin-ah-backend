const mailMessages = {
  signupVerification: (email, url) => ({
    message: `<b>This is a comfimation mail for ${email} from </b>  <h1> Authors Haven </h1> <br>
Please follow this link <a href="${url}"> ${url} </a> to confrim your registration`
  }),
  passwordReset: url => ({
    message: `You requested requested a password reset, follow this link to continue <a href='${url}'>${url}</a>`
  }),

  sendCommentNotification: (recipientEmail, fromUsername, articleTitle, articleSlug) => ({
    message: `<b>To ${recipientEmail}, <br><b>${fromUsername} </b>commented on your Article: ${articleTitle}. <br>Click <a href="${articleSlug}">HERE</a> to view their comment.`
  }),
  sendLikeNotification: (recipientEmail, fromUsername, articleTitle, articleSlug) => ({
    message: `<b>To ${recipientEmail}, <br><b>${fromUsername} </b>liked on your Article: ${articleTitle}. <br>Click <a href="${articleSlug}">HERE</a> to view their comment.`
  }),
  newFollowNotification: (recipientEmail, fromUsername) => ({
    message: `<b>To ${recipientEmail}, <br><b>${fromUsername} </b>just followed you.`
  }),
  followArticleNotification: (email, fromUsername, articleTitle, articleSlug) => ({
    message: `<b>To ${email}, <br><b>${fromUsername} </b>just published a new Article: ${articleTitle}. <br>Click <a href="${articleSlug}">HERE</a> to read.`
  }),
};
export default mailMessages;
