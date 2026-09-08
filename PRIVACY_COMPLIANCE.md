# Uganda Data Protection and Privacy Act (2019) — Implementation Guide

## Overview
This document describes the complete privacy compliance framework implemented for AMDERN PROPERTIES SMC LIMITED under the Uganda Data Protection and Privacy Act, 2019 (UDPPA).

## Architecture

### Backend Privacy Infrastructure

#### 1. Privacy Controller (`server/src/controllers/privacy.controller.ts`)
Four main functions implementing Data Subject Rights (Articles 10–12):

**exportPersonalData()**
- Route: `GET /api/user/privacy/data`
- Purpose: Data Subject Access Request (Article 10)
- Returns: JSON object containing:
  - Profile (name, email, phone, role, verification status, consent records)
  - Property listings (all user-owned properties)
  - Search alerts (saved searches for automation)
  - Inquiries (messages sent by user)
  - Data controller contact info (for transparency)

**deletePersonalData()**
- Route: `DELETE /api/user/privacy/data?mode=anonymize|delete`
- Purpose: Right to Erasure / Right to be Forgotten (Article 12)
- Two modes:
  - **anonymize** (default): Blanks PII (name→"Deleted User", email→"anonymous-{uuid}@deleted.amdern.ug", phone→null, password→null, avatarUrl→null). Account record retained for legal/audit purposes.
  - **delete**: Permanently removes user account and cascades to search alerts. Properties reassigned to sentinel user (00000000-0000-0000-0000-000000000000) with moderationStatus="flagged" to preserve business records.
- Clears auth cookie to log out user everywhere

**getConsentStatus()**
- Route: `GET /api/user/privacy/consent`
- Purpose: Return current consent preferences
- Returns: { privacyPolicyAgreed, privacyAgreedAt, marketingConsent, marketingConsentAt }

**updateConsent()**
- Route: `PATCH /api/user/privacy/consent`
- Purpose: Update marketing preference or other consent flags
- Body: { marketingConsent: boolean }

#### 2. Privacy Router (`server/src/routes/privacy.router.ts`)
- All routes protected by `authenticateToken` middleware
- Data access/deletion routes protected by `requirePrivacyConsent` middleware (ensures user has agreed to privacy policy before we process their PII)
- Consent management routes (GET/PATCH /consent) available even before full consent given

#### 3. Auth Password Verification (`server/src/controllers/auth.controller.ts`)
**verifyPassword()**
- Route: `POST /api/auth/verify-password`
- Purpose: Verify user password for sensitive operations (e.g., account deletion)
- Protected by `authenticateToken`
- Body: { password: string }
- Returns: { message: "Password verified" } or 401 error

#### 4. Database Schema (`prisma/schema.prisma`)
User model privacy fields:
```prisma
privacyPolicyAgreed    Boolean   @default(false)    // Article 9 consent
privacyAgreedAt        DateTime?                     // Timestamp of agreement
marketingConsent       Boolean   @default(false)    // Optional marketing opt-in
marketingConsentAt     DateTime?                     // Timestamp of marketing consent
```

### Frontend Privacy Infrastructure

#### 1. Cookie Banner (`src/components/site/CookieBanner.tsx`)
- Context-based consent management with `CookieConsentProvider` & `useCookieConsent()`
- Displays on every page until user accepts/rejects
- Informs about session cookies (login, search preferences, saved listings)
- Clarifies: no advertising or third-party tracking cookies
- Links to /privacy-policy and /terms-and-conditions
- Persists choice in localStorage with key "amdern_cookie_consent"

#### 2. Privacy Settings Component (`src/components/site/PrivacySettings.tsx`)
Comprehensive user-facing interface for Data Subject Rights:

**Section 1: Privacy Consent Status**
- Displays privacyPolicyAgreed + privacyAgreedAt
- Displays marketingConsent + marketingConsentAt
- Fetches via GET /api/user/privacy/consent

**Section 2: Download Your Data**
- Calls GET /api/user/privacy/data
- Returns JSON file: `amdern-personal-data-{date}.json`
- Includes profile, properties, search alerts, inquiries

**Section 3: Delete Your Account**
- Two-step confirmation:
  1. Choose mode: anonymize or permanent delete
  2. Enter password for verification
- Sends POST /api/auth/verify-password to confirm password
- Sends DELETE /api/user/privacy/data?mode=anonymize|delete
- Redirects to home on success

**Section 4: Data Rights Information**
- Lists all 7 data subject rights under UDPPA 2019
- Provides DPO contact email: dpo@amdernproperties.ug

#### 3. Privacy Policy (`src/routes/privacy-policy.tsx`)
- Route: `/privacy-policy`
- Content from `src/lib/legals.ts` (privacySections array)
- Includes sections:
  - Who we are (AMDERN PROPERTIES SMC LIMITED, DPO contact)
  - Information we collect (identity, profile, property, usage, transaction data)
  - How we use your information (contract, legitimate interests, legal obligation, consent)
  - Sharing your data (no selling; only service providers, authorities, explicit contact)
  - Cookies and tracking (session cookies only, no advertising cookies)
  - Your rights under the Act (7 rights with specific endpoints)
  - Data security and storage (HTTPS, bcrypt hashing, IP hashing, db encryption)
  - Changes to this policy (how updates are notified)

#### 4. Terms & Conditions (`src/routes/terms-and-conditions.tsx`)
- Route: `/terms-and-conditions`
- Content from `src/lib/legals.ts` (termsSections array)
- Includes sections:
  - Using the site (lawful use, no scraping)
  - Your account (password security, notification requirements)
  - Listing accuracy (verification responsibility on user)
  - No agency relationship (platform acts as advertising only)
  - Fees and payments (non-refundable per law)
  - Intellectual property (copyright/trademark protection)
  - Disclaimer (as-is/as-available, no warranties)
  - Limitation of liability (damages exclusion per Ugandan law)
  - Governing law (Uganda)

#### 5. Privacy Settings Route (`src/routes/account.privacy.tsx`)
- Route: `/account/privacy`
- Wraps PrivacySettings component in Page layout
- Protected by authentication (handled by PrivacySettings component)

### Integration Points

#### Frontend → Backend Data Flow
1. **Cookie Banner** (public):
   - Displays on load
   - Saves consent to localStorage
   - No backend call (consent confirmation happens at signup)

2. **Privacy Settings Page** (authenticated):
   - `GET /api/user/privacy/consent` → Load current status
   - `GET /api/user/privacy/data` → Download data as JSON
   - `POST /api/auth/verify-password` → Verify password before deletion
   - `DELETE /api/user/privacy/data?mode=X` → Delete/anonymize account

3. **Dashboard Navigation**:
   - Added "Privacy & Data" link in dashboard sidebar (Shield icon)
   - Points to `/account/privacy`

4. **Signup Flow**:
   - Auth controller validates `privacyPolicyAgreed === true`
   - Stores `privacyAgreedAt` timestamp
   - Error message references Uganda DPPA 2019 Article 9

## Testing Checklist

### 1. Cookie Banner
- [ ] Banner displays on first visit
- [ ] Banner shows on every page until dismissed
- [ ] "Accept all" button saves choice to localStorage
- [ ] "Reject non-essential" button saves different choice
- [ ] Once accepted/rejected, banner doesn't show again
- [ ] Links to /privacy-policy and /terms-and-conditions work
- [ ] Message correctly explains session vs. tracking cookies

### 2. Privacy Policy Page
- [ ] `/privacy-policy` route loads without errors
- [ ] All sections display correctly (10 sections)
- [ ] DPO email link works (mailto:)
- [ ] Markdown formatting displays properly
- [ ] Links to /terms-and-conditions work
- [ ] Article numbers are accurate (Article 9, 10, 12, etc.)
- [ ] Data retention periods are accurate (30 days for logs, 90 days for listings, etc.)

### 3. Terms & Conditions Page
- [ ] `/terms-and-conditions` route loads
- [ ] All 8 sections display
- [ ] Standard legal disclaimers are present
- [ ] Reference to Uganda law is clear

### 4. Privacy Settings Component
- [ ] Accessible only when authenticated
- [ ] Shows "sign in" message when not authenticated
- [ ] `GET /api/user/privacy/consent` loads and displays consent status
- [ ] Consent status shows correct boolean values and timestamps
- [ ] "Download My Data" button triggers download without errors
- [ ] Downloaded JSON file contains:
  - [ ] exportedAt timestamp
  - [ ] dataController info (AMDERN PROPERTIES SMC LIMITED)
  - [ ] profile section (name, email, phone, consent records)
  - [ ] property_listings array (all user properties)
  - [ ] search_alerts array (all saved searches)
  - [ ] inquiries array (all messages)
- [ ] File downloads with name format: `amdern-personal-data-YYYY-MM-DD.json`

### 5. Account Deletion Flow
- [ ] "Delete Account" button shows confirmation UI
- [ ] Can select between "anonymize" and "permanent delete" modes
- [ ] Password input field is required
- [ ] "Confirm Deletion" button disabled if password empty
- [ ] `POST /api/auth/verify-password` validates password
  - [ ] Incorrect password shows error
  - [ ] Correct password allows deletion
- [ ] After deletion with "anonymize" mode:
  - [ ] User account still exists in database
  - [ ] name = "Deleted User"
  - [ ] email = "anonymous-{uuid}@deleted.amdern.ug"
  - [ ] phone = null
  - [ ] password = null
  - [ ] avatarUrl = null
  - [ ] privacyPolicyAgreed = false
  - [ ] privacyAgreedAt = null
  - [ ] User can re-register with same email
- [ ] After deletion with "permanent delete" mode:
  - [ ] User deleted from User table
  - [ ] SearchAlerts cascade-deleted
  - [ ] Properties reassigned to sentinel user (00000000-0000-0000-0000-000000000000)
  - [ ] User cannot log in anymore
  - [ ] Auth cookie cleared automatically
  - [ ] User redirected to home page
- [ ] After successful deletion, user is logged out everywhere

### 6. Dashboard Integration
- [ ] "Privacy & Data" link appears in dashboard sidebar
- [ ] Shield icon displays correctly
- [ ] Link navigates to `/account/privacy`
- [ ] Link appears after "Account" and before "Subscription"

### 7. Signup Privacy Validation
- [ ] Signup form includes privacy policy checkbox
- [ ] Without checking privacy box, signup fails
- [ ] Error message references Article 9 of Uganda DPPA 2019
- [ ] Upon successful signup:
  - [ ] privacyPolicyAgreed = true
  - [ ] privacyAgreedAt = current timestamp
  - [ ] marketingConsent = false (default, can be opted in later)

### 8. Error Handling
- [ ] Unauthenticated requests to /api/user/privacy/* return 401
- [ ] Invalid password returns 401 with "Invalid password" message
- [ ] Failed data export shows user-friendly error message
- [ ] Failed deletion shows user-friendly error message
- [ ] Network errors are caught and displayed

## Regulatory Compliance Notes

### Uganda Data Protection and Privacy Act, 2019

**Article 5 — Purpose Limitation**
- Data collected only for specified, explicit, legitimate purposes
- ✅ Implemented: Users must agree to privacy policy; data used only for platform services

**Article 6 — Data Minimisation**
- Collect only data necessary for purposes
- ✅ Implemented: IP addresses hashed; analytics anonymized; only essential profile fields

**Article 9 — Consent**
- Explicit, informed, freely given consent required for certain processing
- ✅ Implemented: Privacy policy checkbox at signup; privacyAgreedAt timestamp; consent management endpoints

**Article 10 — Right of Access**
- Data subject has right to obtain copy of personal data
- ✅ Implemented: GET /api/user/privacy/data exports full personal dataset as JSON

**Article 11 — Right to Rectification**
- Data subject can correct inaccurate/incomplete data
- ✅ Implemented: Profile edit functionality in dashboard settings

**Article 12 — Right to Erasure**
- Data subject can request deletion (right to be forgotten)
- ✅ Implemented: DELETE /api/user/privacy/data with anonymize/delete modes

**Article 13 — Cookies & Tracking**
- Website must inform users about cookies and tracking
- ✅ Implemented: CookieBanner explains session-only cookies; no tracking cookies

**Data Controller Identification**
- ✅ Implemented: Privacy policy and DPO contact visible at dpo@amdernproperties.ug

**Data Retention**
- ✅ Implemented: Clear retention policy defined in privacy policy (30 days for logs, 90 days for listings, 7 years for financial)

## API Endpoint Summary

| Method | Endpoint | Protected | Consent Required | Purpose |
|--------|----------|-----------|------------------|---------|
| GET | /api/user/privacy/consent | ✅ Auth | ❌ No | Get current consent status |
| PATCH | /api/user/privacy/consent | ✅ Auth | ❌ No | Update marketing preference |
| GET | /api/user/privacy/data | ✅ Auth | ✅ Yes | Export personal data (Article 10) |
| DELETE | /api/user/privacy/data | ✅ Auth | ✅ Yes | Delete/anonymize account (Article 12) |
| POST | /api/auth/verify-password | ✅ Auth | ❌ No | Verify password for sensitive ops |

## Future Enhancements

1. **Automated Consent Reminders**: Send annual emails asking users to reaffirm privacy policy consent
2. **Audit Logging**: Log all data access/deletion requests for compliance audits
3. **Bulk Data Deletion**: Scheduled task to delete anonymized accounts after 30 days
4. **Admin Dashboard**: View consent status, track privacy incidents, generate DPPA compliance reports
5. **Data Processing Agreement (DPA)**: For third-party service providers accessing user data
6. **Privacy Impact Assessment (PIA)**: Document prepared for high-risk data processing
7. **Breach Notification**: Automated notification system for data breaches (within 72 hours per Article 14)
8. **Vendor Management**: Database of third-party processors and their data handling practices

## Support & Contact

**Data Protection Officer (DPO)**
- Email: dpo@amdernproperties.ug
- Phone: +256 702 104 499
- Address: Matugga, Wakiso/Kampala, Uganda

**Compliance Questions**
For questions about this implementation or Uganda DPPA 2019 compliance, contact the DPO or create an issue in the repository.
