const nodemailer = require('nodemailer');

// Create transporter with fallback when SMTP is not configured
const createTransporter = async () => {
	const hasService = !!process.env.EMAIL_SERVICE;
	const hasSmtp = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
	const useEthereal = process.env.EMAIL_USE_ETHEREAL === 'true';
	const isDev = (process.env.NODE_ENV || 'development') !== 'production';

	// Explicit Ethereal dev mode
	if (useEthereal || (isDev && !hasService && !hasSmtp)) {
		console.log('[email] Using Ethereal test account');
		const testAccount = await nodemailer.createTestAccount();
		return nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});
	}

	// Prefer well-known service configuration when provided (e.g., Gmail)
	if (hasService && process.env.EMAIL_SERVICE.toLowerCase() === 'gmail') {
		if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
			console.log('[email] Using Gmail transport');
			return nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS
				}
			});
		}
		console.warn('[email] EMAIL_SERVICE=gmail set but EMAIL_USER or EMAIL_PASS missing; using jsonTransport');
		return nodemailer.createTransport({ jsonTransport: true });
	}

	// If SMTP host looks like Gmail, prefer Gmail service semantics
	if (!hasService && process.env.EMAIL_HOST && /gmail\.com$/i.test(process.env.EMAIL_HOST)) {
		if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
			console.log('[email] Detected Gmail SMTP host; switching to Gmail service');
			return nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS
				}
			});
		}
	}

	// Otherwise use explicit SMTP host/port
	if (hasSmtp) {
		const port = Number(process.env.EMAIL_PORT) || 587;
		console.log(`[email] Using SMTP transport ${process.env.EMAIL_HOST}:${port}`);
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port,
			secure: port === 465,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		});
	}

	console.warn('[email] No email transport configured; using jsonTransport (logs emails to console)');
	return nodemailer.createTransport({ jsonTransport: true });
};

// Send email function
const sendEmail = async (options) => {
	const transporter = await createTransporter();

	const message = {
		from: `${process.env.EMAIL_FROM || 'AU Research Grants'} <${process.env.EMAIL_USER || 'noreply@local.test'}>`,
		to: options.email,
		subject: options.subject,
		text: options.text,
		html: options.html
	};

	const info = await transporter.sendMail(message);

	// When using jsonTransport or Ethereal, log the output for visibility
	if (nodemailer.getTestMessageUrl && info) {
		const previewUrl = nodemailer.getTestMessageUrl(info);
		if (previewUrl) {
			console.log('[email] Ethereal preview URL:', previewUrl);
		}
	}

	if (info?.message) {
		try {
			const parsed = JSON.parse(info.message.toString());
			console.log('Email (jsonTransport) queued:', parsed);
		} catch {
			console.log('Email queued:', info.messageId || info);
		}
	} else {
		console.log('Message sent: %s', info.messageId);
	}
	return info;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
	const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

	const message = {
		email,
		subject: 'Password Reset Request',
		text: `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease open: ${resetUrl}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Air University Research Grant System</p>
      </div>
    `
	};

	await sendEmail(message);
};

// Send email verification email
const sendEmailVerification = async (email, verificationToken) => {
	const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

	const message = {
		email,
		subject: 'Email Verification',
		text: `Please verify your email by clicking the link:\n\n${verificationUrl}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering with Air University Research Grant System.</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Air University Research Grant System</p>
      </div>
    `
	};

	await sendEmail(message);
};

// Send application status update email
const sendApplicationStatusEmail = async (email, applicationTitle, status, comments = '') => {
	const statusColors = {
		'approved': '#28a745',
		'rejected': '#dc3545',
		'under_review': '#ffc107',
		'submitted': '#17a2b8'
	};

	const statusText = {
		'approved': 'Approved',
		'rejected': 'Rejected',
		'under_review': 'Under Review',
		'submitted': 'Submitted'
	};

	const message = {
		email,
		subject: `Research Grant Application ${statusText[status]}`,
		text: `Your research grant application "${applicationTitle}" has been ${statusText[status].toLowerCase()}.`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Research Grant Application Update</h2>
        <p>Your research grant application has been updated.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details</h3>
          <p><strong>Title:</strong> ${applicationTitle}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColors[status]}; font-weight: bold;">${statusText[status]}</span></p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
        </div>
        <p>You can view the full details of your application by logging into your account.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Air University Research Grant System</p>
      </div>
    `
	};

	await sendEmail(message);
};

module.exports = { sendEmail, sendPasswordResetEmail, sendEmailVerification, sendApplicationStatusEmail };
