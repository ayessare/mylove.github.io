const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Gmail Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Endpoint to send email directly to your Gmail
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.GMAIL_USER}>`,
        replyTo: email,
        to: process.env.GMAIL_USER,
        subject: `[Portfolio Inquiry] ${subject || 'New Contact Form Submission'}`,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #fdfaf7;">
                <h2 style="color: #381014; margin-top: 0; border-bottom: 2px solid #381014; padding-bottom: 8px;">New Message from Portfolio</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <div style="background-color: #ffffff; padding: 16px; border-left: 4px solid #381014; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; white-space: pre-wrap; color: #280c0e;">${message}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
                <div style="text-align: center;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Portfolio Contact')}" 
                       style="background-color: #381014; color: #fcf6f0; padding: 12px 24px; text-decoration: none; border-radius: 20px; display: inline-block; font-weight: bold;">
                        Reply Direct to ${name}
                    </a>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: 'Server error. Failed to send message.' });
    }
});

app.listen(PORT, () => {
    console.log(`Portfolio Backend running on http://localhost:${PORT}`);
});