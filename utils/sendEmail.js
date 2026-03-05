const sendVerificationEmail = async (email, token) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:8080";
    const url = `${baseUrl}/verify-email?token=${token}`;
    
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "BookifyStay",
                    email: process.env.EMAIL_USER 
                },
                to: [{ email: email }],
                subject: "Verify your BookifyStay Account",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
                        <h2 style="color: #0d6efd;">Welcome to BookifyStay!</h2>
                        <p>We're thrilled to have you here. Please verify your email to activate your account and start booking.</p>
                        <div style="margin: 25px 0;">
                            <a href="${url}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account</a>
                        </div>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Brevo API Error:", errData);
            return;
        }
        
        console.log(`Verification email sent successfully to ${email}`);

    } catch (error) {
        console.error("Email failed:", error);
    }
};

module.exports = sendVerificationEmail;
