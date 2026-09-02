/**
 * Vishwa Solutions — Serverless Enquiry Handler
 * Handles Google Sheets persistence and SMTP notification dispatches.
 */

const nodemailer = require('nodemailer');

const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzLrbcE1nOCpPruNvNsdm06EU0KSehLvErMP3Anq6ZypbssmNxUo8Wi4HAIMSWq0ZoU/exec';
const DEFAULT_NOTIFICATION_EMAIL = 'vishwasolutions199@gmail.com';

/**
 * Escapes HTML characters to prevent XSS in email bodies.
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Builds the professional, branded HTML email template.
 */
function buildHtmlEmail({ name, phone, email, service, message, submissionTime }) {
    const cleanName = escapeHtml(name);
    const cleanPhone = escapeHtml(phone);
    const cleanEmail = escapeHtml(email || 'Not Provided');
    const cleanService = escapeHtml(service || 'General Enquiry');
    const cleanMessage = escapeHtml(message || 'No additional message provided.').replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry</title>
</head>
<body style="margin:0; padding:24px 10px; background-color:#f4efe9; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#222; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08); border:1px solid #e5dcce;">
    <!-- Header -->
    <tr>
      <td style="background-color:#3d2b1f; padding:32px 30px; text-align:center; border-bottom:4px solid #c5a059;">
        <h1 style="margin:0; font-size:24px; letter-spacing:1px; color:#ffffff; font-weight:700; text-transform:uppercase;">Vishwa Solutions</h1>
        <p style="margin:6px 0 0; font-size:13px; color:#c5a059; letter-spacing:2px; text-transform:uppercase;">Premium Furniture &amp; Interior Solutions</p>
      </td>
    </tr>

    <!-- Alert Ribbon -->
    <tr>
      <td style="background-color:#f7f2ea; padding:16px 30px; border-bottom:1px solid #e8decb;">
        <span style="display:inline-block; background-color:#c5a059; color:#3d2b1f; font-size:11px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:20px; letter-spacing:1px;">New Website Enquiry</span>
        <span style="float:right; font-size:12px; color:#777;">${submissionTime}</span>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:32px 30px;">
        <p style="margin:0 0 20px; font-size:15px; color:#444; line-height:1.5;">
          A new customer enquiry has been submitted through the <strong>Vishwa Solutions</strong> website:
        </p>

        <!-- Customer Details Box -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#faf7f2; border:1px solid #ede3d2; border-radius:8px; margin-bottom:24px;">
          <tr>
            <td style="padding:18px 20px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:6px 0; width:130px; font-size:13px; font-weight:600; color:#7d6148; text-transform:uppercase; letter-spacing:0.5px;">Customer Name:</td>
                  <td style="padding:6px 0; font-size:15px; font-weight:700; color:#1a1a1a;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; width:130px; font-size:13px; font-weight:600; color:#7d6148; text-transform:uppercase; letter-spacing:0.5px;">Phone Number:</td>
                  <td style="padding:6px 0; font-size:15px; font-weight:700; color:#3d2b1f;">
                    <a href="tel:${cleanPhone}" style="color:#3d2b1f; text-decoration:none; font-weight:700;">${cleanPhone}</a>
                    <span style="font-size:12px; color:#888; margin-left:8px;">(Click to call)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; width:130px; font-size:13px; font-weight:600; color:#7d6148; text-transform:uppercase; letter-spacing:0.5px;">Email:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;">
                    ${email ? `<a href="mailto:${cleanEmail}" style="color:#c5a059; text-decoration:none; font-weight:600;">${cleanEmail}</a>` : '<span style="color:#888;">Not Provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; width:130px; font-size:13px; font-weight:600; color:#7d6148; text-transform:uppercase; letter-spacing:0.5px;">Service:</td>
                  <td style="padding:6px 0; font-size:14px; font-weight:600; color:#c5a059;">${cleanService}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Message Box -->
        <div style="margin-bottom:28px;">
          <h3 style="margin:0 0 10px; font-size:13px; font-weight:700; color:#7d6148; text-transform:uppercase; letter-spacing:1px;">Customer Message:</h3>
          <div style="background-color:#ffffff; border-left:4px solid #c5a059; border-top:1px solid #eee; border-right:1px solid #eee; border-bottom:1px solid #eee; border-radius:0 6px 6px 0; padding:16px 20px; font-size:14px; line-height:1.6; color:#333; font-style:normal;">
            ${cleanMessage}
          </div>
        </div>

        <!-- Action Buttons -->
        <table role="presentation" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="border-radius:6px; background-color:#3d2b1f; text-align:center;">
              <a href="tel:${cleanPhone}" style="background-color:#3d2b1f; border:1px solid #3d2b1f; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block;">Call Customer</a>
            </td>
            ${email ? `
            <td style="padding-left:12px; border-radius:6px;">
              <a href="mailto:${cleanEmail}?subject=Re:%20Enquiry%20with%20Vishwa%20Solutions" style="background-color:#c5a059; border:1px solid #c5a059; font-size:14px; font-weight:600; color:#3d2b1f; text-decoration:none; padding:12px 24px; border-radius:6px; display:inline-block;">Reply via Email</a>
            </td>
            ` : ''}
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#f9f8f6; padding:20px 30px; text-align:center; border-top:1px solid #eee; font-size:12px; color:#888;">
        <p style="margin:0 0 6px;">This alert was automatically generated from your website enquiry form.</p>
        <p style="margin:0; color:#aaa;">&copy; ${new Date().getFullYear()} Vishwa Solutions &bull; Craftsmanship &amp; Trust Since 2010</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}

/**
 * Main handler compatible with Vercel and Node HTTP.
 */
module.exports = async function handler(req, res) {
    // Enable CORS for frontend clients
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ status: 'error', message: 'Method Not Allowed. Please use POST.' });
        return;
    }

    try {
        const data = req.body || {};
        const { name, phone, email, service, message, _gotcha } = data;

        // 1. Anti-spam honeypot detection
        if (_gotcha && String(_gotcha).trim().length > 0) {
            console.log('[Spam Prevention] Bot trap triggered. Silently discarded.');
            res.status(200).json({
                status: 'success',
                message: 'Thank you for contacting Vishwa Solutions. We have received your enquiry.'
            });
            return;
        }

        // 2. Server-side field validation
        if (!name || String(name).trim().length < 2) {
            res.status(400).json({ status: 'error', message: 'Please provide your full name.' });
            return;
        }

        const phoneClean = String(phone || '').replace(/[^0-9+]/g, '');
        if (!phone || phoneClean.length < 7 || phoneClean.length > 16) {
            res.status(400).json({ status: 'error', message: 'Please provide a valid contact phone number.' });
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            res.status(400).json({ status: 'error', message: 'Please provide a valid email address.' });
            return;
        }

        const cleanPayload = {
            name: String(name).trim().slice(0, 100),
            phone: String(phone).trim().slice(0, 25),
            email: email ? String(email).trim().slice(0, 100) : '',
            service: service ? String(service).trim().slice(0, 100) : 'General Enquiry',
            message: message ? String(message).trim().slice(0, 2000) : ''
        };

        const now = new Date();
        const submissionTime = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        }) + ' IST';

        // 3. Forward enquiry to Google Apps Script (Google Sheets storage)
        const sheetUrl = process.env.GOOGLE_SHEET_SCRIPT_URL || DEFAULT_SHEET_URL;
        let sheetSuccess = false;

        try {
            console.log(`[Google Sheets] Submitting enquiry for ${cleanPayload.name}...`);
            const params = new URLSearchParams();
            params.append('name', cleanPayload.name);
            params.append('phone', cleanPayload.phone);
            params.append('service', cleanPayload.service);
            params.append('message', cleanPayload.message);
            if (cleanPayload.email) {
                params.append('email', cleanPayload.email);
            }

            const sheetResponse = await fetch(sheetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (sheetResponse.ok) {
                sheetSuccess = true;
                console.log('[Google Sheets] Recorded successfully.');
            } else {
                console.warn(`[Google Sheets Warning] HTTP Status ${sheetResponse.status}`);
            }
        } catch (sheetErr) {
            console.error('[Google Sheets Error]', sheetErr.message);
        }

        // 4. Send SMTP Email Notification
        let emailSuccess = false;
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASSWORD;

        if (smtpHost && smtpUser && smtpPass) {
            try {
                const port = parseInt(process.env.SMTP_PORT || '587', 10);
                const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: port,
                    secure: isSecure,
                    auth: {
                        user: smtpUser,
                        pass: smtpPass
                    },
                    connectionTimeout: 10000,
                    greetingTimeout: 5000
                });

                const notificationRecipient = process.env.NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL;
                const fromAddress = process.env.SMTP_FROM || `"Vishwa Solutions Enquiries" <${smtpUser}>`;

                const mailOptions = {
                    from: fromAddress,
                    to: notificationRecipient,
                    replyTo: cleanPayload.email || undefined,
                    subject: `New Website Enquiry — ${cleanPayload.name} — ${cleanPayload.service}`,
                    text: `
VISHWA SOLUTIONS — New Website Enquiry

Customer Details:
Name: ${cleanPayload.name}
Phone: ${cleanPayload.phone}
Email: ${cleanPayload.email || 'Not Provided'}
Service: ${cleanPayload.service}

Message:
${cleanPayload.message || 'No additional message.'}

Submitted on: ${submissionTime}
                    `.trim(),
                    html: buildHtmlEmail({
                        ...cleanPayload,
                        submissionTime
                    })
                };

                await transporter.sendMail(mailOptions);
                emailSuccess = true;
                console.log(`[SMTP Notification] Email successfully delivered to ${notificationRecipient}`);
            } catch (smtpErr) {
                // Log technical error server-side, do not expose to customer
                console.error('[SMTP Notification Error]', smtpErr.message);
            }
        } else {
            console.log('[SMTP Notification] SMTP credentials not set in environment. Skipping email dispatch.');
        }

        // 5. Response logic based on failure matrix
        if (sheetSuccess || emailSuccess) {
            res.status(200).json({
                status: 'success',
                message: 'Thank you for contacting Vishwa Solutions. We have received your enquiry and will get back to you shortly.',
                details: {
                    sheetsRecorded: sheetSuccess,
                    emailNotified: emailSuccess
                }
            });
        } else {
            // Neither succeeded
            res.status(500).json({
                status: 'error',
                message: 'Unable to submit your enquiry right now. Please try again or contact us directly at +91 9819215853 / +91 9773725281.'
            });
        }
    } catch (err) {
        console.error('[Enquiry Handler Unhandled Error]', err);
        res.status(500).json({
            status: 'error',
            message: 'Unable to submit your enquiry right now. Please try again or call us at +91 9819215853 / +91 9773725281.'
        });
    }
};
