import { formatter, objectToCSS } from './util';
import {
  collapseBorder, contentTemplate, emailTemplate, footStyles, linkStyle,
} from './index';


export const about = `
<tr>
    <td width="15" style="${objectToCSS(footStyles.padding)}">&nbsp;&nbsp;&nbsp;</td>
    <td>
        <table border="0" width="100%" cellspacing="0" cellpadding="0" align="left" style="${objectToCSS(collapseBorder)}">
            <tbody>
                 <tr>
                     <td height="19" style="line-height:19px">&nbsp;</td>
                 </tr>
                <tr>
                    <td style="${objectToCSS(footStyles.content)}">
                        Authors Haven is community of like minded authors that foster innovation and inspiration through writing and sharing.
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
    <td width="15" style="${objectToCSS(footStyles.padding)}">&nbsp;&nbsp;&nbsp;</td>
</tr>
`;

const getTemplate = ({ recipientName, confirmationLink, recipientEmail }) => {
  const context = {
    recipientName,
    recipientEmail,
    link: confirmationLink,
    message: 'Thanks for signing up with Authors Haven.',
    linkMessage: 'Click here to complete your registration',
  };
  const content = formatter(contentTemplate, context);
  const footer = formatter(about, context);
  return formatter(emailTemplate, {
    ...context,
    footer,
    content
  });
};
export default getTemplate;


export const button = `
<tr>
    <td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td>
    <td>
        <table border="0" width="100%" cellspacing="0" cellpadding="0" style="${objectToCSS(collapseBorder)}">
            <tbody>
                <tr>
                    <td height="2" style="line-height:2px" colspan="3">&nbsp;</td>
                </tr>
                <tr>
                    <td class="m_6694813797275553308mb_blk">
                        <a href="{{link}}" style="${objectToCSS(linkStyle)}" target="_blank" >
                            <table border="0" width="100%" cellspacing="0" cellpadding="0" style="${objectToCSS(collapseBorder)}">
                                <tbody>
                                    <tr>
                                        <td style="border-collapse:collapse;border-radius:2px;text-align:center;display:block;border:solid 1px #344c80;background:#4c649b;padding:7px 16px 11px 16px">
                                            <a href="{{link}}" style="${objectToCSS({ ...linkStyle, display: 'block' })}" target="_blank">
                                                <center>
                                                    <font size="3">
                                                        <span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;white-space:nowrap;font-weight:bold;vertical-align:middle;color:#ffffff;font-size:14px;line-height:14px">Change&nbsp;Password</span>
                                                    </font>
                                                </center>
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </a>
                    </td>
                    <td width="100%" class="m_6694813797275553308mb_hide"></td>
                </tr>
                <tr>
                    <td height="32" style="line-height:32px" colspan="3">&nbsp;</td>
                </tr>
            </tbody>
        </table>
    </td>
    <td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td>
</tr>
`;
