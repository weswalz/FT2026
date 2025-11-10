import nodemailer from 'nodemailer';

// Create transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
  }
  return transporter;
}

// Send email
export async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();

  try {
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'noreply@fieldandtides.com',
      to,
      subject,
      text,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Send contact form notification
export async function sendContactNotification(data) {
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
    <hr>
    <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
  `;

  return await sendEmail({
    to: process.env.CONTACT_EMAIL || 'info@fieldandtides.com',
    subject: 'New Contact Form Submission',
    text: `New contact form submission from ${data.name} (${data.email})`,
    html
  });
}

// Send private dining inquiry notification
export async function sendPrivateDiningNotification(data) {
  const html = `
    <h2>New Private Dining Inquiry</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Event Date:</strong> ${data.event_date}</p>
    <p><strong>Guest Count:</strong> ${data.guest_count}</p>
    <p><strong>Event Type:</strong> ${data.event_type || 'Not specified'}</p>
    <p><strong>Special Requests:</strong></p>
    <p>${data.special_requests || 'None'}</p>
    <hr>
    <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
  `;

  return await sendEmail({
    to: process.env.EVENTS_EMAIL || 'events@fieldandtides.com',
    subject: `Private Dining Inquiry - ${data.event_date}`,
    text: `New private dining inquiry from ${data.name} for ${data.guest_count} guests on ${data.event_date}`,
    html
  });
}

// Send confirmation email to customer
export async function sendCustomerConfirmation(email, name, type = 'contact') {
  const html = `
    <h2>Thank You for Contacting Field & Tides</h2>
    <p>Dear ${name},</p>
    <p>We've received your ${type === 'contact' ? 'message' : 'private dining inquiry'} and will get back to you shortly.</p>
    <p>Thank you for your interest in Field & Tides!</p>
    <hr>
    <p>
      <strong>Field & Tides Restaurant & Bar</strong><br>
      Houston Heights<br>
      <a href="https://fieldandtides.com">fieldandtides.com</a>
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: 'Thank you for contacting Field & Tides',
    text: `Dear ${name}, We've received your ${type} and will get back to you shortly.`,
    html
  });
}
