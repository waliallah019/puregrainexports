# Wise Transfer Integration - Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file (or `.env` for production):

### 1. WISE_API_TOKEN (Required)
Your Wise API token for authentication.

**How to get it:**
1. Log in to your Wise Business account
2. Go to Settings → Developer options
3. Create a new API token
4. Copy the token (it starts with something like `your-api-token-here`)

**Example format:**
```env
WISE_API_TOKEN=your-actual-api-token-from-wise-dashboard
```

### 2. WISE_PROFILE_ID (Required)
Your Wise Business profile ID (numeric).

**How to get it:**
1. Log in to your Wise Business account
2. Go to Settings → API
3. Your Profile ID is displayed there (it's a number like `12345678`)

**Example format:**
```env
WISE_PROFILE_ID=12345678
```

### 3. WISE_API_BASE_URL (Optional - for testing)
Base URL for Wise API. Defaults to production if not set.

**For Sandbox/Testing:**
```env
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**For Production (default):**
```env
WISE_API_BASE_URL=https://api.wise.com
```
(Or omit this variable to use production)

## Example .env.local File

```env
# Wise Transfer Configuration
WISE_API_TOKEN=test-token-for-sandbox-testing
WISE_PROFILE_ID=12345678

# For testing in sandbox environment
WISE_API_BASE_URL=https://api.sandbox.transferwise.com

# Your existing backend API URL
NEXT_PUBLIC_BACKEND_API_URL=/api
```

## Testing with Sandbox

1. **Get Sandbox Credentials:**
   - Sign up for Wise Business account
   - Request sandbox access from Wise support
   - Get sandbox API token and profile ID

2. **Test Values (Sandbox):**
   ```env
   WISE_API_TOKEN=sandbox-token-from-wise
   WISE_PROFILE_ID=sandbox-profile-id-number
   WISE_API_BASE_URL=https://api.sandbox.transferwise.com
   ```

3. **Note:** Sandbox environment may have limitations:
   - Test transfers don't actually move money
   - Some features may behave differently
   - Check Wise documentation for sandbox-specific behavior

## Production Setup

For production, use your real Wise Business credentials:

```env
WISE_API_TOKEN=your-production-api-token
WISE_PROFILE_ID=your-production-profile-id
# Omit WISE_API_BASE_URL to use production (or set to https://api.wise.com)
```

## Verification

To verify your setup is working:

1. Check that environment variables are loaded:
   - The API will return an error if `WISE_API_TOKEN` or `WISE_PROFILE_ID` is missing
   - Check server logs for configuration errors

2. Test the API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/sample-requests/create-wise-transfer \
     -H "Content-Type: application/json" \
     -d '{
       "country": "United States",
       "currency": "usd",
       "email": "test@example.com",
       "contactPerson": "Test User",
       "companyName": "Test Company"
     }'
   ```

3. Expected response (if configured correctly):
   ```json
   {
     "success": true,
     "transferId": "...",
     "quoteId": "...",
     "amount": 25.00,
     "currency": "usd",
     "status": "incoming_payment_waiting",
     "paymentInstructions": {...}
   }
   ```

## Troubleshooting

### Error: "WISE_API_TOKEN is not configured"
- Make sure your `.env.local` file exists in the project root
- Restart your Next.js development server after adding environment variables
- Check that the variable name is exactly `WISE_API_TOKEN` (case-sensitive)

### Error: "Wise profile not configured"
- Make sure `WISE_PROFILE_ID` is set in your `.env.local`
- Verify the profile ID is a valid number
- Restart your development server

### Error: "Failed to create payment quote"
- Check that your API token is valid
- Verify your profile ID is correct
- For sandbox, ensure you're using sandbox credentials
- Check Wise API status page for outages

### API Returns 401 Unauthorized
- Your API token may be expired or invalid
- Regenerate the token in Wise dashboard
- Ensure you're using the correct token for sandbox vs production

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` or `.env` files to version control
- Add `.env*` to your `.gitignore` file
- Use different tokens for development and production
- Rotate API tokens regularly
- Keep your API tokens secure and never share them publicly

## Additional Resources

- [Wise API Documentation](https://docs.wise.com/)
- [Wise Developer Portal](https://wise.com/developer)
- [Wise API Reference](https://api-docs.wise.com/)

