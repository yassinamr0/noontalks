import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(process.env.VITE_EMAILJS_PUBLIC_KEY || '');

interface EmailParams {
  to_email: string;
  to_name?: string;
  message?: string;
}

export const sendWelcomeEmail = async (params: EmailParams) => {
  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name || 'Guest',
      message: `You have been added to the Noon Talks event. You can view your ticket by logging in at noon-talks.online with your email address: ${params.to_email}`,
    };

    const response = await emailjs.send(
      process.env.VITE_EMAILJS_SERVICE_ID || '',
      process.env.VITE_EMAILJS_TEMPLATE_ID || '',
      templateParams
    );

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
