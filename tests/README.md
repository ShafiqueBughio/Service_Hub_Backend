# ServiceLink API Tests

Yeh tests **TEST_CASES.txt** ke saath match karte hain. Sab API endpoints ko cover karta hai (Auth, User, Contractor, Job, Bid, Presigned URL, Notifications, Help/Feedback, Public, About/Privacy/Terms, Chat).

## Run tests

1. **Dependencies install karo** (Jest + supertest devDependencies me hain):
   ```bash
   npm install
   ```

2. **Database ready hona chahiye** – tests real DB use karte hain (Prisma). `.env` me `DATABASE_URL` set karo.

3. **Tests chalao**:
   ```bash
   npm test
   ```

4. **Watch mode** (file change pe auto re-run):
   ```bash
   npm run test:watch
   ```

## Test files

| File | Coverage |
|------|----------|
| `auth.test.js` | Register, verify OTP, login, profile, refresh token, 401 without token |
| `public.test.js` | Reasons, categories, professions, nested professions (no auth) |
| `user-profile.test.js` | Get profile, get me, update profile; contractor profile create (USER=403, CONTRACTOR=200), missing services=400 |
| `job.test.js` | Create job (REGULAR/LIVE), invalid expire_days/min>max, get/update/delete (owner vs non-owner), my-jobs, list |
| `bid.test.js` | Place bid (contractor), place as user=403, invalid jobId=404, get bids, accept bid, my-bids |
| `presigned-url.test.js` | Single/multiple upload URL (auth), no token=401 |
| `notifications.test.js` | Get all, mark all read, mark one read, no token=401 |
| `help-feedback.test.js` | Send (valid), missing subject=400, no token=401, get list |
| `about-app.test.js` | Get about-app, privacy_policy, terms_and_conditions |
| `chat.test.js` | Get chat (valid/invalid id), no token=401 |

## Notes

- Tests **runInBand** chalte hain (ek ek karke) taake DB state consistent rahe.
- **beforeAll** me naye USER/CONTRACTOR register + verify OTP hote hain, phir un tokens se baaki calls.
- Presigned URL tests 500 de sakte hain agar AWS S3 configure na ho.
- Socket tests (join_job_room, bid_received) yahan **nahi** hain – manual/Postman se TEST_CASES.txt ke hisaab se check karo.
