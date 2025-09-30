# Email Service Debugging Guide for Render Deployment

## Problem
Email sending works perfectly on localhost but fails with 500 error when deployed to Render in a Docker container.

## Diagnostic Steps

### 1. Check Email Configuration on Render

After the latest push, visit this endpoint on your Render deployment:
```
https://einfo-bakend.onrender.com/debug/email-config
```

This will show you:
- Whether the email service initialized correctly
- Which environment variables are present/missing
- The current configuration

Expected output should look like:
```json
{
  "isConfigured": true,
  "hasTransporter": true,
  "env": {
    "hasSmtpHost": true,
    "hasSmtpPort": true,
    "hasSmtpUsername": true,
    "hasSmtpPassword": true,
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "nodeEnv": "production"
  }
}
```

**If any of these are `false` or missing, that's your issue!**

### 2. Check Render Logs

In Render dashboard → your service → Logs tab, look for:

**On startup, you should see:**
```
info: Email service initializing {"host":"smtp.gmail.com","port":587,"username":"mail.einfo.me@gmail.com"...}
info: Email transporter verified successfully
```

**If you see this instead:**
```
error: Email service is not configured. Missing SMTP credentials.
```
Then the environment variables aren't being loaded properly.

**When a message is attempted, look for:**
```
info: Message request received
info: Attempting to send email
info: Message sent successfully
```

**Or if it fails:**
```
error: Email sending failed
```
The error details will tell you exactly what went wrong.

### 3. Environment Variables Checklist

In Render dashboard → your service → Environment tab, verify these are set **WITHOUT quotes**:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=mail.einfo.me@gmail.com
SMTP_PASSWORD=oxkzlasdxfpzmekg   # No spaces!
FROM_EMAIL=mail.einfo.me@gmail.com
FROM_NAME=E-Info.me
NODE_ENV=production
```

**Common mistakes:**
- ❌ `SMTP_PASSWORD="oxkz lasd xfpz mekg"` (has quotes and spaces)
- ✅ `SMTP_PASSWORD=oxkzlasdxfpzmekg` (correct)

### 4. Test Email Service Manually

You can run the test script locally to verify credentials work:
```bash
cd backend
TEST_EMAIL_RECIPIENT=your-email@example.com node src/scripts/test-email.js
```

This will:
- Show all environment variables
- Test SMTP connection
- Send a test email to the specified recipient

### 5. Gmail-Specific Issues

If the configuration looks correct but Gmail is rejecting the connection:

**A. Generate a fresh App Password:**
1. Go to Google Account → Security → 2-Step Verification → App passwords
2. Delete the old "E-Info.me" password
3. Create new: "Mail" → "Other (Custom name)" → "E-Info.me Backend"
4. Copy the 16-character password (it shows with spaces but you must remove them)
5. Update `SMTP_PASSWORD` in Render

**B. Allow access from new IP:**
1. After deployment, check email for "Was this you?" from Google
2. Click "Yes, it was me" to approve the new server IP
3. Alternatively, visit: https://accounts.google.com/DisplayUnlockCaptcha
4. Click "Continue" to allow less secure app access

**C. Check Gmail account security:**
- Make sure 2-Step Verification is enabled
- Verify App Passwords feature is available
- Check if there are any suspicious activity blocks

### 6. Network/Docker Issues

**Check if port 587 (SMTP) is blocked:**
```bash
# In Render shell or locally in Docker
telnet smtp.gmail.com 587
```
Should connect successfully. If it times out, the network is blocking SMTP.

**Check DNS resolution:**
```bash
nslookup smtp.gmail.com
```
Should return valid IP addresses.

### 7. Alternative SMTP Providers

If Gmail continues to be problematic in production, consider switching to a transactional email service:

**SendGrid (recommended):**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
```

**Mailgun:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=<your-mailgun-username>
SMTP_PASSWORD=<your-mailgun-password>
```

**Postmark:**
```bash
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USERNAME=<your-postmark-token>
SMTP_PASSWORD=<your-postmark-token>
```

These services are designed for server-to-email delivery and don't have the same restrictions as Gmail.

## What We've Added

1. **Diagnostic endpoint:** `/debug/email-config` to check configuration
2. **Test script:** `src/scripts/test-email.js` to verify email setup
3. **Enhanced logging:** Email service now logs initialization details
4. **Better error messages:** Controller logs more context about what failed
5. **Configuration validation:** Email service validates credentials on startup

## Next Steps

1. Visit `/debug/email-config` on your Render deployment
2. Check the Render logs for the startup initialization messages
3. Verify all environment variables are set correctly
4. Try sending a message again and check the detailed logs
5. Share the output from `/debug/email-config` and any error logs if still not working

## Quick Test

To quickly verify if the issue is credentials vs. code:

```bash
# Locally, use your Render credentials temporarily
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=mail.einfo.me@gmail.com
export SMTP_PASSWORD=oxkzlasdxfpzmekg
export NODE_ENV=production

node src/scripts/test-email.js
```

If this fails locally with the same error, it's a credential issue.
If this works locally but fails on Render, it's an environment/network issue.
