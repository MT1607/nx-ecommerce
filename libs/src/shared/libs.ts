import { Resend } from 'resend';

const keyResend = process.env.RESEND_TOKEN || '';
const resend = new Resend(`${keyResend}`);

const fromEmail = process.env.FROM_EMAIL;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  const { data, error } = await resend.emails.send({
    from: `From ${fromEmail} <${fromEmail}>`,
    to: to,
    subject: subject,
    html: html,
  });

  if (error) {
    console.error('Error sending email', error);
    return false;
  }

  if (data) {
    console.log('Email sent successfully ', data);
    return true;
  }

  return false;
};
