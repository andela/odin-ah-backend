const emailMessages = {
  signupVerification: (email, url) => ({
    to: email,
    from: process.env.Email,
    subject: 'Comfirmation Email',
    text: 'Authors have verification email',
    html: `<b>This is a comfimation mail for ${email} from </b>  <h1> Authors Haven </h1> <br>
Please follow this link <a href="${url}"> ${url} </a> to confrim your registration`
  })
};
export default emailMessages;
