const send_grid = require('@sendgrid/mail');
if (process.env.NODE_ENV !== 'test') {
    send_grid.setApiKey(process.env.SENDGRID_API_KEY);
}

const send_email = async (options) => {
    if (process.env.NODE_ENV === 'test') {
        return true;
    }
    
    // Validate required fields
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    
    if (!process.env.EMAIL_FROM) {
        throw new Error('EMAIL_FROM is not set in environment variables');
    }
    
    // Get email from options.email or options.to
    const recipientEmail = options.email || options.to;
    
    if (!recipientEmail) {
        throw new Error('Recipient email is required');
    }
    
    // Create professional HTML template if not provided
    const htmlTemplate = options.html || `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                    .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { padding: 20px; }
                    .footer { background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Restaurant App</h2>
                    </div>
                    <div class="content">
                        <p>${options.message}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
    
    const message = {
        to: recipientEmail,
        from: process.env.EMAIL_FROM,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
        subject: options.subject,
        text: options.message,
        html: htmlTemplate,
    };

    try {
        await send_grid.send(message);
        console.log(`Email sent successfully to ${recipientEmail}`);
    } catch (error) {
        console.error('SendGrid Error:', error.message);
        throw error;
    }
};

module.exports = send_email;
