const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

//Acceptance Email
module.exports.sendAcceptanceEmail = async (booking) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.guestEmail,
            subject: `Booking Confirmed: ${booking.listing.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Great news! Your booking is confirmed! 🎉</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>The host has accepted your request to stay at <strong>${booking.listing.title}</strong>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <h3 style="color: #555;">Your Trip Details:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 10px;">📅 <strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</li>
                            <li style="margin-bottom: 10px;">📅 <strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</li>
                            <li style="margin-bottom: 10px;">💵 <strong>Total Price:</strong> ₹ ${booking.totalPrice.toLocaleString("en-IN")}</li>
                        </ul>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p>Have a wonderful trip! The host will reach out to you soon with further instructions.</p>
                        <p style="color: #777;">- The BOOKIFYSTAY Team</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Acceptance email successfully sent to ${booking.guestEmail}`);
    } catch (err) {
        console.error("Error sending acceptance email:", err);
    }
};

//Rejcet Email
module.exports.sendRejectionEmail = async (booking) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.guestEmail,
            subject: `Booking Update: ${booking.listing.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Booking Update</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>We're sorry, but the host is currently unable to accommodate your request for <strong>${booking.listing.title}</strong> on the requested dates.</p>
                        <p>Your request for Check-in on <strong>${booking.checkIn.toLocaleDateString()}</strong> has been declined.</p>
                        <p>Don't worry! We have plenty of other amazing properties waiting for you.</p>
                        <a href="http://localhost:3000/listing" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Explore Other Stays</a>
                        <br><br>
                        <p style="color: #777;">- The BOOKIFYSTAY Team</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Rejection email successfully sent to ${booking.guestEmail}`);
    } catch (err) {
        console.error("Error sending rejection email:", err);
    }
};