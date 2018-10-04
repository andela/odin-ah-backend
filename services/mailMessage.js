const emailMessages = {
  signupVerification: (email, url) => ({
    message: `<b>This is a comfimation mail for ${email} from </b>  <h1> Authors Haven </h1> <br>
Please follow this link <a href="${url}"> ${url} </a> to confrim your registration`
  })
};
export default emailMessages;
