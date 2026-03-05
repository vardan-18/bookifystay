const nodemailer = require("nodemailer");


const sendVerificationEmail = async (email, token) => {
    const url = `http://localhost:8080/verify-email?token=${token}`;
    
    try {
        const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Use this instead of "service: 'gmail'"
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});
        });

        
        const mailOptions = {
            from: `"BookifyStay" <${process.env.EMAIL_USER}>`, 
            to: email, 
            subject: 'Verify your BookifyStay Account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="color: #fe424d;">Welcome to BookifyStay!</h2>
                    <p>We're thrilled to have you here. Please verify your email to activate your account and start booking.</p>
                    <div style="margin: 25px 0;">
                        <a href="${url}" style="background-color: #fe424d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account</a>
                    </div>
                    
                </div>
            `
        };

        
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent successfully to ${email}`);

    } catch (error) {
        console.error("Email failed:", error);
    }
};

module.exports = sendVerificationEmail;
