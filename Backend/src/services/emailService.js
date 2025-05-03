const nodemailer = require('nodemailer');
const Supplier = require('../models/Supplier');

// Create a transporter with the provided credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'leo806535@gmail.com',
    pass: '********'
  },
  debug: true
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
    if (error.code === 'EAUTH') {
      console.error('\nTo fix this error:');
      console.error('1. Go to your Google Account settings (https://myaccount.google.com/)');
      console.error('2. Enable 2-Step Verification if not already enabled');
      console.error('3. Go to Security > App passwords');
      console.error('4. Generate a new App password for this application');
      console.error('5. Replace the password in this file with the generated App password');
      console.error('\nCurrent configuration:');
      console.error('Email:', 'leo806535@gmail.com');
      console.error('Password:', 'leosoft@57');
    }
  } else {
    console.log('✅ Email transporter is ready to send emails');
    console.log('Using email:', 'leo806535@gmail.com');
  }
});

const sendOrderEmail = async (order) => {
  try {
    console.log('\n=== Starting Email Sending Process ===');
    console.log('Order ID:', order.orderId);
    
    // Get all active suppliers
    const suppliers = await Supplier.find({ isActive: true });
    console.log(`Found ${suppliers.length} active suppliers`);

    if (!suppliers || suppliers.length === 0) {
      console.log('❌ No active suppliers found to send email');
      return;
    }

    // Log supplier details
    console.log('\nActive Suppliers:');
    suppliers.forEach(supplier => {
      console.log(`- ${supplier.name} (${supplier.email})`);
    });

    // Prepare email content
    const emailContent = `
Dear Supplier,

We hope this message finds you well.

This is to inform you that a new order has been placed in our system. Kindly find the details below:

Order Details:
----------------------------
${order.items.map(item => `
• Order ID        : ${order.orderId}
• Item Name       : ${item.item.name}
• Category        : ${item.item.category}
• Unit            : ${item.item.unit}
• Quantity        : ${item.quantity}
• Total Amount    : ₹${order.totalAmount}
`).join('\n')}

We kindly request you to process this order at the earliest convenience. If you have any questions or need further clarification, please feel free to reach out.

Thank you for your continued support.

Best regards,
Koppireddy Shiva Gangadhar,
Panduru,
9878567889,
Kakinada.
`;

    console.log('\n=== Sending Emails ===');
    // Send email to each supplier
    for (const supplier of suppliers) {
      try {
        console.log(`\nAttempting to send email to: ${supplier.name} (${supplier.email})`);
        
        const mailOptions = {
          from: 'leo806535@gmail.com',
          to: supplier.email,
          subject: `New Order Notification - Order ID: ${order.orderId}`,
          text: emailContent
        };

        console.log('Mail options:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${supplier.name}`);
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📦 Order ID: ${order.orderId}`);
        console.log(`💰 Total Amount: ₹${order.totalAmount}`);
        console.log('----------------------------------------');
      } catch (supplierError) {
        console.error(`❌ Error sending email to ${supplier.name}:`, supplierError);
        // Continue with next supplier even if one fails
      }
    }
    
    console.log('\n=== Email Sending Process Completed ===');
  } catch (error) {
    console.error('❌ Error in sendOrderEmail:', error);
    throw error;
  }
};

module.exports = {
  sendOrderEmail
}; 
