import emailjs from '@emailjs/browser';

interface EmailParams {
  [key: string]: string;
  to_email: string;
  to_name: string;
}

export const sendWelcomeEmail = async (params: EmailParams) => {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      params,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
