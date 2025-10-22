# Email Service Debugging Guide for Render Deployment

## Current Status
- ✅ Request completes faster (10.85s instead of 30s) - timeout fix working
- ❌ Still getting 500 Internal Server Error
- ❌ Email not being sent

## The Real Problem

Based on the logs showing a 500 error after ~10 seconds, the issue is likely **ONE of these**:

### 1. **Render is Blocking Outbound SMTP Connections** (Most Likely)
Many cloud providers block outbound connections on ports 587 and 25 to prevent spam. Render may be doing this.

**How to verify:**
```bash
# Check Render logs for SMTP connection errors
# Look for errors like:
# - "ETIMEDOUT" 
# - "ECONNREFUSED"
# - "Connection timeout"
```

### 2. **SMTP Environment Variables Not Set on Render**
The environment variables might be missing or incorrect on Render.

### 3. **SMTP Credentials Invalid**
Gmail App Password might be incorrect or expired.

## Step-by-Step Debugging

### Step 1: Check Email Configuration Endpoint

Visit this URL to see if email service is configured:
```
https://einfo-bakend.onrender.com/debug/email-config
```

**Expected output if configured correctly:**
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

**If any values are `false` or "not set":**
→ You need to add those environment variables in Render dashboard

### Step 2: Check Render Logs for Detailed Error

After pushing the new changes (with enhanced logging), check Render logs and look for:

```
"Email Service Configuration Check"
```

This will show you:
- If email service initialized
- Which environment variables are present/missing

And when sending a message, look for:
```
"Error sending message - DETAILED"
```

This will show the exact SMTP error code and message.

### Step 3: Common SMTP Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `ETIMEDOUT` | Connection timeout | Render is likely blocking port 587 |
| `ECONNREFUSED` | Connection refused | Render blocking or wrong host/port |
| `EAUTH` or `535` | Authentication failed | Wrong Gmail credentials |
| `ESOCKET` | Socket error | Network issue, firewall blocking |
| `550` | Email rejected | Recipient server rejected email |

## Solutions Based on Error Type

### Solution A: If Render Blocks SMTP (ETIMEDOUT/ECONNREFUSED)

**Option 1: Use a Transactional Email Service (RECOMMENDED)**

Switch from direct Gmail SMTP to a service that Render doesn't block:

**SendGrid (Free tier: 100 emails/day)**
```bash
# In Render Environment Variables, set:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_SECURE=false
FROM_EMAIL=your-verified-sender@yourdomain.com
FROM_NAME=E-Info.me
```

**Mailgun (Free tier: 100 emails/day)**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=<your-mailgun-username>
SMTP_PASSWORD=<your-mailgun-password>
SMTP_SECURE=false
```

**AWS SES (Very cheap, $0.10 per 1000 emails)**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=<your-ses-username>
SMTP_PASSWORD=<your-ses-password>
SMTP_SECURE=false
```

**Option 2: Use Alternative Gmail Port**

Try Gmail's port 465 with SSL:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=mail.einfo.me@gmail.com
SMTP_PASSWORD=<your-app-password>
```

**Option 3: Contact Render Support**

Ask Render support if they allow outbound SMTP and on which ports.

### Solution B: If Environment Variables Missing

1. Go to Render Dashboard → Your Service → Environment
2. Add these variables (click "Add Environment Variable"):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=mail.einfo.me@gmail.com
SMTP_PASSWORD=oxkzlasdxfpzmekg
FROM_EMAIL=mail.einfo.me@gmail.com
FROM_NAME=E-Info.me
```

3. Click "Save Changes"
4. Render will automatically redeploy

### Solution C: If Gmail Authentication Failing

1. **Verify 2FA is enabled** on your Gmail account
2. **Generate a new App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "E-Info Render"
   - Copy the 16-character password
3. **Update Render environment variable:**
   ```
   SMTP_PASSWORD=<new-16-char-password>
   ```

## Testing After Fixes

### 1. Deploy the Enhanced Logging

Push the changes:
```bash
cd /Users/pranav/Developer/einfo/backend
git add .
git commit -m "Add enhanced email error logging for debugging"
git push origin dockerized-trial
```

### 2. Wait for Render to Deploy

Monitor the deployment logs in Render dashboard.

### 3. Check Startup Logs

Look for this section in Render logs:
```
"Email Service Configuration Check"
"Testing SMTP connection..."
"✅ SMTP connection test successful" OR "⚠️ SMTP connection test failed"
```

### 4. Try Sending a Message

Send a test message and immediately check Render logs for:
```
"Error sending message - DETAILED"
```

This will show:
- `errorCode`: The actual error (ETIMEDOUT, EAUTH, etc.)
- `errorResponse`: SMTP server response
- `smtpConfig`: Your current SMTP settings

## Quick Decision Tree

```
Can you access /debug/email-config?
│
├─ NO → Check if backend is running
│
└─ YES → Is isConfigured: true?
    │
    ├─ NO → Add SMTP environment variables in Render
    │
    └─ YES → Send a test message and check Render logs
        │
        ├─ Error: ETIMEDOUT → Render blocking SMTP → Use SendGrid/Mailgun
        │
        ├─ Error: EAUTH → Gmail credentials wrong → Generate new App Password
        │
        └─ Other error → Check error details in logs
```

## Recommended Immediate Action

Since you're on Render and getting timeout errors, I **strongly recommend switching to SendGrid**:

### SetUp SendGrid (5 minutes):

1. **Sign up**: https://signup.sendgrid.com/
2. **Verify email address**
3. **Create API Key**:
   - Settings → API Keys → Create API Key
   - Name: "E-Info Render"
   - Permissions: "Full Access"
   - Copy the key (starts with `SG.`)
4. **Add Sender**:
   - Settings → Sender Authentication
   - Verify a single sender: mail.einfo.me@gmail.com
   - Check your email and click verify link
5. **Update Render Environment Variables**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=apikey
   SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SMTP_SECURE=false
   FROM_EMAIL=mail.einfo.me@gmail.com
   FROM_NAME=E-Info.me
   ```
6. **Save and wait for redeploy**

SendGrid has a free tier (100 emails/day) and works reliably on all cloud platforms.

## Still Not Working?

If after all these steps it's still not working:

1. **Share the exact error from Render logs** (the "DETAILED" error log)
2. **Share the output from** `/debug/email-config`
3. **Confirm which solution you tried** (SendGrid, Gmail port 465, etc.)

Then I can provide more specific help.

---

**Next Steps:**
1. Deploy the enhanced logging changes (already committed)
2. Check `/debug/email-config` endpoint
3. Check Render logs for detailed error
4. Based on error code, apply appropriate solution above

**Created**: October 22, 2025  
**Status**: 🔍 Debugging in progress
