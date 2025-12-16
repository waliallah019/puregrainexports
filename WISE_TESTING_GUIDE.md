# Wise Transfer - Testing Guide

## Exact Variables Needed for Testing

Create or update your `.env.local` file in the project root with these **3 variables**:

```env
WISE_API_TOKEN=test-token-placeholder
WISE_PROFILE_ID=99999999
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**IMPORTANT:** If you use `test-token-placeholder` as the token, the API will automatically return mock/test data without calling Wise. This is perfect for testing the UI flow!

### Variable Breakdown:

1. **WISE_API_TOKEN** - Any string (will fail API calls but verify config is loaded)
   - Example: `test-token-placeholder` or `abc123`

2. **WISE_PROFILE_ID** - Any number (will fail API calls but verify config is loaded)
   - Example: `99999999` or `12345678`

3. **WISE_API_BASE_URL** - Sandbox URL for testing
   - **Must be:** `https://api.sandbox.transferwise.com`
   - This ensures you're testing against Wise's sandbox, not production

## Step-by-Step Testing Process

### Step 1: Add Variables to .env.local

Create/update `.env.local` in your project root:

```env
WISE_API_TOKEN=test-token-placeholder
WISE_PROFILE_ID=99999999
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

### Step 2: Restart Your Development Server

**Important:** Environment variables only load when the server starts.

1. Stop your Next.js server (Ctrl+C)
2. Start it again: `npm run dev` or `pnpm dev`

### Step 3: Test Configuration Loading

**Test 1: Check if variables are loaded**

1. Open your browser and go to the sample request page
2. Fill out the form with test data
3. Submit the form
4. Check the browser console (F12) and server terminal

**Expected Results:**

✅ **If using `test-token-placeholder` (Test Mode):**
- API will return mock/test data immediately
- You'll see payment instructions with test bank details
- No actual API calls to Wise (perfect for UI testing!)
- Transfer ID will start with "test-transfer-"

✅ **If using real/invalid tokens:**
- You'll see API errors from Wise (authentication failed)
- Error message: "Failed to create payment quote" or "401 Unauthorized"
- This means your config is working, but the tokens are invalid

❌ **If variables are NOT loaded:**
- Error message: "WISE_API_TOKEN is not configured" or "Wise profile not configured"
- This means the variables aren't being read

### Step 4: Test with Real Sandbox Credentials (Optional)

Once you have real Wise sandbox credentials:

```env
WISE_API_TOKEN=your-real-sandbox-token-from-wise
WISE_PROFILE_ID=your-real-sandbox-profile-id
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**How to get sandbox credentials:**
1. Sign up for Wise Business account
2. Contact Wise support to request sandbox access
3. Get sandbox API token and profile ID from Wise dashboard

### Step 5: Verify the Flow Works

1. **Fill out sample request form**
   - Company Name: "Test Company"
   - Contact Person: "Test User"
   - Email: "test@example.com"
   - Country: "United States"
   - Address: "123 Test St"
   - Sample Type: Any selection

2. **Click "Proceed to Payment"**
   - Should attempt to create Wise transfer
   - With test tokens: Will show error (expected)
   - With real sandbox tokens: Should show payment instructions

3. **Check browser console for:**
   - API call to `/api/sample-requests/create-wise-transfer`
   - Response with error or success message

## Quick Test Checklist

- [ ] Created `.env.local` file in project root
- [ ] Added all 3 variables (WISE_API_TOKEN, WISE_PROFILE_ID, WISE_API_BASE_URL)
- [ ] Restarted development server
- [ ] Opened sample request page
- [ ] Filled out form and submitted
- [ ] Checked browser console for API calls
- [ ] Verified error messages (if using test tokens) or success (if using real tokens)

## Common Testing Scenarios

### Scenario 1: Testing Configuration Only
**Goal:** Verify environment variables are being read

**Use these values:**
```env
WISE_API_TOKEN=test-config-check
WISE_PROFILE_ID=12345
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**Expected:** API will return authentication errors (this confirms config is loaded!)

### Scenario 2: Testing with Invalid Credentials
**Goal:** See how the app handles API errors

**Use these values:**
```env
WISE_API_TOKEN=invalid-token-123
WISE_PROFILE_ID=99999999
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**Expected:** 
- Error message: "Failed to create payment quote"
- User sees error toast notification
- Form doesn't proceed to payment screen

### Scenario 3: Testing with Real Sandbox Credentials
**Goal:** Full end-to-end test

**Use real values from Wise:**
```env
WISE_API_TOKEN=your-actual-sandbox-token
WISE_PROFILE_ID=your-actual-profile-id
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**Expected:**
- Transfer created successfully
- Payment instructions displayed
- User can copy bank details
- Status checking works

## Troubleshooting Tests

### Problem: "WISE_API_TOKEN is not configured"
**Solution:**
- Check `.env.local` file exists in project root (not in a subfolder)
- Verify variable name is exactly `WISE_API_TOKEN` (case-sensitive)
- Restart development server

### Problem: Variables not updating
**Solution:**
- Make sure you're editing `.env.local` (not `.env`)
- Restart server after changing variables
- Check for typos in variable names

### Problem: API calls going to wrong URL
**Solution:**
- Verify `WISE_API_BASE_URL` is set correctly
- Check it's `https://api.sandbox.transferwise.com` for testing
- Restart server after changing

## Testing Endpoints Manually

You can also test the API endpoint directly:

```bash
# Test transfer creation
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

**Expected response with test tokens:**
```json
{
  "error": "Failed to create payment quote",
  "details": { ... }
}
```

**Expected response with valid tokens:**
```json
{
  "success": true,
  "transferId": "...",
  "quoteId": "...",
  "amount": 25.00,
  "currency": "usd",
  "status": "incoming_payment_waiting",
  "paymentInstructions": { ... }
}
```

## Summary

**Minimum for Testing:**
```env
WISE_API_TOKEN=test-token-placeholder
WISE_PROFILE_ID=99999999
WISE_API_BASE_URL=https://api.sandbox.transferwise.com
```

**Remember:**
- These test values will cause API errors (this is expected!)
- Errors confirm your configuration is being read correctly
- For full testing, you need real Wise sandbox credentials
- Always restart your dev server after changing `.env.local`

