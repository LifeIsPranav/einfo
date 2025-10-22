#!/bin/bash

# Email Configuration Fix - Switch to Gmail Port 465
# Copy these EXACT values to your Render Environment Variables

echo "================================================"
echo "RENDER ENVIRONMENT VARIABLES - COPY THESE"
echo "================================================"
echo ""
echo "Go to: https://dashboard.render.com → Your Service → Environment"
echo ""
echo "SET THESE VARIABLES:"
echo ""
echo "SMTP_HOST=smtp.gmail.com"
echo "SMTP_PORT=465"
echo "SMTP_SECURE=true"
echo "SMTP_USERNAME=mail.einfo.me@gmail.com"
echo "SMTP_PASSWORD=oxkzlasdxfpzmekg"
echo "FROM_EMAIL=mail.einfo.me@gmail.com"
echo "FROM_NAME=E-Info.me"
echo ""
echo "DELETE THESE IF THEY EXIST:"
echo "- SMTP_SERVICE"
echo "- Any SendGrid related variables"
echo ""
echo "After updating, click 'Save Changes' and wait for redeploy"
echo "================================================"
