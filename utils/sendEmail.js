const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder('ipv4first');

const sendVerificationEmail = async (email, token) => {
   
    const baseUrl = process.env.BASE_URL || "http://localhost:8080";
    const url = `${baseUrl}/verify-email?token=${token}`;
    
    try {
        // 2. Configure the Transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });

        // 3. Setup the Email Options
        const mailOptions = {
            from: `"BookifyStay" <${process.env.EMAIL_USER}>`, 
            to: email, 
            subject: 'Verify your BookifyStay Account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="color: #0d6efd;">Welcome to BookifyStay!</h2>
                    <p>We're thrilled to have you here. Please verify your email to activate your account and start booking.</p>
                    <div style="margin: 25px 0;">
                        <a href="${url}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account</a>
                    </div>
                </div>
            `
        };

        // 4. Send the Email
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent successfully to ${email}`);

    } catch (error) {
        console.error("Email failed:", error);
    }
};

module.exports = sendVerificationEmail;
