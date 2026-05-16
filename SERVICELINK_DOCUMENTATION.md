# ServiceLink — Project Documentation

**Version:** 1.0  
**Platform:** Backend (Node.js)  
**Database:** MySQL  
**Document Type:** Project Flow & Feature Documentation

---

## TABLE OF CONTENTS

1. Project Ka Taaruf (Introduction)
2. Kaun Kaun Use Karta Hai? (User Roles)
3. Registration aur Login System
4. User Profile aur Contractor Profile
5. Job Posting System
6. Bidding System — Regular aur Live Auction
7. Service Request Feature
8. Job Accept, Reject aur Complete Karna
9. Chat System
10. Review aur Rating System
11. Notifications System
12. Contractor Analytics
13. File Upload System (AWS S3)
14. Real-Time Features (Socket.IO)
15. Payment System (Stripe)
16. Admin Features
17. Security aur Middleware
18. Poora Project Flow — Ek Nazar Mein

---

---

# 1. PROJECT KA TAARUF

**ServiceLink** ek **online job marketplace** hai jahan log apne ghar ya business ke kaam ke liye skilled contractors dhundh sakte hain. Yeh platform ek bridge ka kaam karta hai — ek taraf **kaam dene wale (Users)** hain jo jobs post karte hain, aur doosri taraf **kaam karne wale (Contractors)** hain jo un jobs pe apni services offer karte hain.

### Yeh Platform Kisliye Bana Hai?

Sochein ek aadmi ko apne ghar ki plumbing fix karwani hai, ya kisi company ko ek electrician chahiye. Woh ServiceLink pe job post karta hai — budget batata hai, kaam ka description likhta hai, location deta hai. Phir saare registered contractors us job ko dekhte hain aur apna quote (bid) dete hain. Job owner saare quotes compare karta hai aur jo best lage usse accept karta hai. Kaam hone ke baad review deta hai.

### Platform Ki Khaas Baat Kya Hai?

- **Do tarah ki bidding** — Normal (Regular) aur Real-time Live Auction
- **Direct chat** — Job accept hone ke baad owner aur contractor directly baat kar sakte hain
- **Specific contractor invite** — Agar pehle kisi contractor se kaam karwa chuke hain to dobara directly unhe invite kar sakte hain
- **Contractor analytics** — Contractor apna performance dekh sakta hai
- **Secure file sharing** — Documents, proposals, portfolio seedha AWS S3 pe

---

---

# 2. KAUN KAUN USE KARTA HAI? (User Roles)

Is platform pe teen tarah ke log hain:

---

### USER (Job Creator / Client)

Yeh woh banda hai jo kaam karwana chahta hai.

**Kya kar sakta hai:**
- Naya job post karna
- Contractors ke bids dekhna aur compare karna
- Kisi ek bid ko accept karna
- Contractor ke saath chat karna
- Kaam complete hone pe job "Mark as Completed" karna
- Contractor ko star rating aur review dena
- Kisi specific contractor ko dobara invite karna (Service Request)
- Job cancel karna agar zaroorat na rahe

---

### CONTRACTOR (Service Provider)

Yeh woh banda hai jo kaam karna chahta hai aur apni services offer karta hai.

**Kya kar sakta hai:**
- Saari open jobs ki list dekhna
- Kisi bhi job pe bid lagana (apna price aur timeline dena)
- Live auction mein real-time participate karna
- Job owner ke saath chat karna (jab bid accept ho jaye)
- Apne saare bids ka status dekhna (Pending, Active, Past)
- Apni reviews aur ratings dekhna
- Apna analytics dashboard dekhna (success rate, performance)
- Apna detailed profile banana (experience, documents, portfolio, services)

---

### ADMIN

Yeh platform ka manager hai.

**Kya kar sakta hai:**
- Terms & Conditions update karna
- Privacy Policy update karna
- About App content update karna
- Saare users ki list dekhna

---

---

# 3. REGISTRATION AUR LOGIN SYSTEM

### Naya Account Kaise Banta Hai?

Jab koi naya user ServiceLink join karna chahta hai, yeh process hoti hai:

**Step 1 — Basic Info Dena:**
User apna email ya phone number deta hai, password set karta hai, aur batata hai ke woh USER hai ya CONTRACTOR. System ek 6-digit OTP generate karta hai jo sirf 60 seconds ke liye valid hota hai.

**Step 2 — OTP Verify Karna:**
User woh OTP enter karta hai. Agar OTP sahi hai aur 60 seconds ke andar hai, to account verify ho jata hai. Agar OTP galat ho ya time nikal jaye, to error aata hai aur user dobara OTP mangwa sakta hai.

**Step 3 — Profile Banana:**
Verify hone ke baad user ko apna profile complete karna hota hai. Jab tak profile complete nahi hoti, platform ke features use nahi ho sakte. USER ke liye basic profile hoti hai, CONTRACTOR ke liye zyada detailed profile hoti hai (neeche detail mein).

---

### Login Kaise Hota Hai?

User apna email/phone aur password deta hai. System password check karta hai (bcrypt encryption se). Sahi hone pe do tokens milte hain:

- **Access Token** — Yeh ek short-lived token hai jo har API request ke saath bheja jata hai. Isse server samajhta hai ke kaun request kar raha hai.
- **Refresh Token** — Yeh ek long-lived token hai. Jab access token expire ho jata hai, refresh token se naya access token mil jata hai bina dobara login kiye.

---

### Google aur Apple Se Login

Agar user Google ya Apple account se login karna chahta hai:
- Google/Apple ka token bheja jata hai
- System us token ko verify karta hai
- Agar pehle se account hai to seedha login ho jata hai
- Agar naya user hai to automatically account ban jata hai

---

### Password Bhool Gaye?

**Step 1:** Email/phone dete hain  
**Step 2:** OTP aata hai (60 seconds valid)  
**Step 3:** OTP verify karte hain  
**Step 4:** Naya password set karte hain  

Password ki requirements: 8 se 16 characters, kam se kam ek special character (@$!%*?&) hona chahiye.

---

### Logout

Logout karne pe user ka session (refresh token) database se delete ho jata hai. Agar koi us purane token se access karne ki koshish kare to kaam nahi karta.

---

---

# 4. USER PROFILE AUR CONTRACTOR PROFILE

### USER Ka Profile

USER ka profile simple hota hai:

- Pehla naam, aakhri naam
- Gender
- Sheher, state, address
- Contact phone number
- Profile picture

---

### CONTRACTOR Ka Profile

Contractor ka profile bahut detailed hota hai kyunki clients unhe hire karne se pehle sab kuch dekhna chahte hain:

**Basic Info:**
- Naam, gender, address, contact
- Profile picture
- "About Me" — apne baare mein likha hua

**Tajurba (Experience):**
Contractor apni pichli jobs add kar sakta hai:
- Company ka naam
- Designation (kya kaam kiya)
- Job type
- Kab se kab tak (start year, end year)

**Documents:**
- Business License (business ka license)
- Certifications (koi bhi professional certificate)

**Portfolio:**
- Apne pichle kaam ki photos

**Services:**
- Kaunsi kaunsi services offer karta hai (e.g., Plumbing, Electrical, Painting)

**Service Areas:**
- Kahan kahan kaam karta hai
- Location ka naam + latitude/longitude (map ke liye)

---

### Profile Update Karna

Dono USER aur CONTRACTOR apna profile baad mein bhi update kar sakte hain. Contractor ke liye update mein experiences, services, aur service areas bhi update ho sakte hain — purane delete ho ke naye save hote hain.

---

---

# 5. JOB POSTING SYSTEM

### Job Kya Hoti Hai?

Job ek kaam ki request hai jo USER post karta hai. Jaise: "Mujhe apne ghar ki painting karwani hai, budget 500 se 1500 dollar, New York mein, 1 hafte mein chahiye."

---

### Job Mein Kya Kya Hota Hai?

- **Title** — Kaam ka naam (e.g., "Kitchen Plumbing Repair")
- **Description** — Detail mein kya kaam hai
- **Budget** — Minimum aur maximum kitna denge
- **Expire Days** — Kitne din tak bids accept karni hain
- **Timeline** — Kaam kitne time mein chahiye
- **Location** — Kahan ka kaam hai
- **Provider Preferences** — Kaunse type ka contractor chahiye (e.g., experienced, licensed)
- **Attachments** — Photos, videos, ya documents (kaam ki jagah ki photos wagera)

---

### Job Ki Do Qismein

**REGULAR Job:**
- Budget 2000 ya usse kam ho to automatically REGULAR hoti hai
- Normal bidding — contractors apna quote dete hain, user dekhta hai aur accept karta hai

**LIVE Job (Auction):**
- Budget 2001 se zyada ho to automatically LIVE hoti hai
- Real-time auction — saare contractors ek saath live room mein hote hain, bids real-time update hoti hain, jaise ek auction hoti hai

> Note: Job type manually bhi set ki ja sakti hai, lekin default budget se decide hoti hai.

---

### Job Ki Zindagi (Lifecycle)

```
Job Post Hoti Hai
       |
       | (Status: OPEN)
       | Contractors bids lagate hain
       |
User Ek Bid Accept Karta Hai
       |
       | (Status: CLOSED)
       | Chat shuru hoti hai
       | Kaam hota hai
       |
User "Mark as Completed" Karta Hai
       |
       | (is_completed = true)
       | Chat read-only ho jati hai
       |
User Review Deta Hai
       |
       | (Kaam mukammal)
```

Agar user job cancel karna chahta hai (kaam ki zaroorat nahi rahi), to job cancel ho jati hai. Completed job cancel nahi ho sakti.

---

### My Jobs — User Ke Tabs

User apni jobs teen tabs mein dekhta hai:
- **Pending** — Jo jobs abhi OPEN hain, bids aa rahi hain
- **Active** — Jis job ka bid accept ho gaya, kaam chal raha hai
- **Completed** — Jo kaam mukammal ho gaye
- **Cancelled** — Jo jobs cancel ho gayi

---

---

# 6. BIDDING SYSTEM — REGULAR AUR LIVE AUCTION

### Bid Kya Hoti Hai?

Bid ek contractor ka proposal hota hai. Contractor keh raha hota hai: "Yeh kaam main karoonga, itne paise mein, itne time mein."

---

### Regular Bidding Kaise Kaam Karta Hai?

1. Contractor jobs ki list dekhta hai
2. Koi job pasand aaye to uski detail dekhta hai
3. Apna quote deta hai:
   - **Quote Price** — Kitne paise mein karega
   - **Timeline** — Kitne time mein karega
   - **Notes** — Kuch extra batana ho to
   - **Proposal Documents** — Koi document attach karna ho to (PDF, etc.)
4. Bid submit ho jati hai

**Ek Important Rule:** Ek contractor ek job pe sirf ek baar bid kar sakta hai. Agar dobara bid kare to purani bid update ho jati hai, naya record nahi banta.

---

### Live Auction Kaise Kaam Karta Hai?

Live auction mein sab kuch real-time hota hai Socket.IO ki madad se:

1. **Room Join Karna:** Contractor ya user job ka "room" join karta hai. Room ka naam hota hai `job-room-{jobId}`. Room join karte hi usse saare current bids dikh jaate hain.

2. **Real-time Bidding:** Jab bhi koi contractor bid lagata hai, woh bid turant saare room members ko dikh jaati hai. Koi refresh nahi karna padta.

3. **Live Leaderboard:** Bids price ke hisaab se sort hoti hain — sabse kam price wali bid upar hoti hai.

4. **Bid Accept:** User jab koi bid accept karta hai, to saare room members ko real-time notification milti hai ke auction khatam ho gaya.

---

### My Bids — Contractor Ke Tabs

Contractor apne bids teen tabs mein dekhta hai:
- **Pending** — Jo bids abhi review ho rahi hain (job OPEN hai)
- **Active** — Jis bid ko accept kar liya gaya (kaam chal raha hai)
- **Past** — Jo bids reject ho gayi, ya kaam complete ho gaya, ya job cancel ho gayi

Contractor Regular aur Live bids alag alag filter karke bhi dekh sakta hai.

---

### Bid Reject Karna

User kisi bid ko reject kar sakta hai aur reason bhi de sakta hai. Yeh reason contractor ko "Past → Rejected" screen pe dikh jaata hai taake woh samjhe ke kyun reject hua.

---

---

# 7. SERVICE REQUEST FEATURE

### Yeh Feature Kya Hai?

Maan lo ek user ne pehle kisi contractor se kaam karwaya aur woh bahut khush hua. Ab dobara koi kaam hai. Woh directly usi contractor ko invite kar sakta hai — yeh "Service Request" feature hai.

---

### Kaise Kaam Karta Hai?

1. User naya job post karta hai lekin is baar ek specific contractor ka ID deta hai (`invited_contractor_id`)
2. Woh job sirf us contractor ko "Pending" tab mein dikh ti hai — baaki contractors ko nahi
3. Contractor us job pe normal bid lagata hai
4. Phir normal flow — user accept/reject karta hai

---

### Contractor Ko Kaise Pata Chalta Hai?

Contractor ke "Pending" tab mein yeh job `invited_only: true` flag ke saath aati hai. Matlab contractor samajh jata hai ke yeh job specifically uske liye hai — kisi user ne directly invite kiya hai.

---

---

# 8. JOB ACCEPT, REJECT AUR COMPLETE KARNA

### Bid Accept Karna

Jab user kisi contractor ki bid accept karta hai, system yeh sab ek saath karta hai (ek transaction mein):

1. Accepted bid ka status **ACCEPTED** ho jata hai
2. Baaki saari bids automatically **REJECTED** ho jaati hain
3. Job ka status **OPEN** se **CLOSED** ho jata hai
4. Job mein `accepted_bid_id` save ho jata hai
5. **Chat room automatically create ho jati hai** — sirf job owner aur accepted contractor ke liye
6. Dono ko notification milti hai

User chahay to bid accept karte waqt final price aur timeline bhi adjust kar sakta hai (jo chat mein negotiate hua ho).

---

### Job Complete Karna

Kaam hone ke baad user "Mark as Completed" karta hai:
- Job `is_completed = true` ho jata hai
- Chat read-only ho jati hai (messages nahi bhej sakte, sirf dekh sakte hain)
- User ab review de sakta hai

---

### Job Cancel Karna

Agar kaam ki zaroorat nahi rahi:
- Job `is_cancelled = true` ho jata hai
- Completed job cancel nahi ho sakti

---

---

# 9. CHAT SYSTEM

### Chat Kab Hoti Hai?

Chat sirf tab available hoti hai jab:
- Job ka bid accept ho gaya ho (job CLOSED ho)
- Job complete nahi hui ho

Jab job complete ho jati hai, chat **read-only** ho jati hai — purane messages dekh sakte hain lekin naye nahi bhej sakte.

---

### Chat Ka Structure

- Ek job = ek chat room
- Sirf do log: job owner (USER) aur accepted bid wala contractor
- Koi third person chat mein nahi aa sakta

---

### Chat Kaise Kaam Karta Hai?

**Chat Open Karna:**
User ya contractor job ki chat open karta hai. System check karta hai ke yeh dono is job ke authorized participants hain ya nahi. Agar job complete ho chuki hai to `chat_allowed: false` return hota hai — matlab read-only mode.

**Messages Bhejna (Real-time):**
Messages Socket.IO se bheje jaate hain. Jab koi message bhejta hai:
1. Message database mein save hota hai
2. Recipient ko real-time notification milti hai
3. Unread count update hota hai

**Attachments:**
Messages ke saath files bhi bhej sakte hain (images, documents).

**Typing Indicator:**
Jab koi type kar raha hota hai, doosre ko real-time pata chalta hai ("typing..." dikh ta hai).

**Unread Count:**
Har user ka unread messages ka count real-time update hota rehta hai.

---

---

# 10. REVIEW AUR RATING SYSTEM

### Review Kab Di Ja Sakti Hai?

Sirf tab jab:
- Job complete ho chuki ho (`is_completed = true`)
- Job ka bid accepted tha

---

### Review Kaun De Sakta Hai?

Sirf **job owner (USER)** review de sakta hai — contractor ko rate karta hai.

---

### Review Mein Kya Hota Hai?

- **Rating:** 1 se 5 stars
- **Review Text:** Likha hua feedback (optional)

Ek job pe sirf ek baar review di ja sakti hai.

---

### Contractor Apni Reviews Kahan Dekhta Hai?

Contractor apni saari reviews ek list mein dekh sakta hai — kaunse job pe kaunsa rating mila, kya likha gaya. Woh individual review ki detail bhi dekh sakta hai jisme job ki poori info hoti hai.

---

---

# 11. NOTIFICATIONS SYSTEM

### Notifications Kab Aati Hain?

| Event | Kise Milti Hai |
|-------|----------------|
| Naya bid aaya | Job owner (USER) ko |
| Bid accept hua | Contractor ko |
| Bid reject hua | Contractor ko |
| Naya chat message aaya | Recipient ko |
| Job complete hua | Contractor ko |

---

### Notifications Kaise Deliver Hoti Hain?

**Push Notifications:** Firebase Cloud Messaging (FCM) use hota hai. Jab user login karta hai, uska device token (FCM token) save hota hai. Notification bhejte waqt us token pe push notification jaati hai — chahe app band ho.

**In-App Notifications:** Saari notifications database mein bhi save hoti hain. User app khole to apni saari notifications dekh sakta hai, unread count dekh sakta hai, aur read mark kar sakta hai.

---

### Notification Mein Kya Hota Hai?

- Title (heading)
- Message (detail)
- Screen name (kis screen pe le jaaye — e.g., JOB, USER_REQUESTS)
- Metadata (extra info jaise job_id)

---

---

# 12. CONTRACTOR ANALYTICS

Contractor apna performance dashboard dekh sakta hai. Isme teen cheezein hain:

---

### 1. Job Success Score (Pie Chart)

Contractor ke saare bids ka breakdown:
- **Active %** — Kitne bids accept hue aur kaam chal raha hai
- **Pending %** — Kitne bids abhi review ho rahe hain
- **Rejected %** — Kitne bids reject hue

Yeh ek pie chart ki tarah hota hai jo contractor ko batata hai ke uski success rate kya hai.

---

### 2. Bids Success Rate

- **Bid on Jobs** — Total kitni jobs pe bid lagayi
- **Success on Jobs** — Kitni jobs mein bid accept hua
- **Proposal Viewed** — Kitni distinct jobs pe proposal gaya

---

### 3. Profile Views

Monthly trend — har mahine kitne log contractor ka profile dekh rahe hain. (Structure ready hai, real tracking future mein add ho sakti hai.)

---

---

# 13. FILE UPLOAD SYSTEM (AWS S3)

### Files Kahan Store Hoti Hain?

Saari files (profile pictures, portfolio images, documents, proposal files) **Amazon S3** pe store hoti hain — yeh ek cloud storage service hai.

---

### Upload Kaise Hota Hai?

ServiceLink ek smart approach use karta hai jise **Presigned URL** kehte hain:

**Step 1:** App server se ek special temporary URL maanga jata hai
**Step 2:** Server AWS S3 se ek "presigned URL" generate karta hai — yeh ek temporary permission hai seedha S3 pe upload karne ki
**Step 3:** File seedha S3 pe upload hoti hai — server ke through nahi jaati
**Step 4:** Upload hone ke baad jo URL mila woh profile/job/bid mein save ho jata hai

**Faida:** Server pe load nahi padta, files seedha cloud mein jaati hain, zyada fast aur secure.

---

### Kaunsi Files Upload Ho Sakti Hain?

- **Images** — Profile pictures, portfolio photos, job attachments
- **PDFs** — Business license, certifications, proposals
- **Videos** — Portfolio videos

---

---

# 14. REAL-TIME FEATURES (SOCKET.IO)

### Socket.IO Kya Hai?

Socket.IO ek technology hai jo real-time, two-way communication enable karta hai. Normal HTTP mein client request karta hai aur server respond karta hai. Socket mein server bhi apni marzi se client ko data bhej sakta hai — bina client ke maange.

---

### Connection Kaise Hoti Hai?

Jab app Socket se connect karta hai, apna JWT token bhejta hai. Server token verify karta hai. Sahi hone pe connection establish hoti hai aur user authenticated ho jata hai.

---

### Live Auction Room

- Har job ka ek alag room hota hai
- Contractor ya user room join karta hai
- Jab bhi koi bid aati hai, saare room members ko real-time update milti hai
- Bid accept hone pe bhi saare ko real-time pata chalta hai

---

### Chat Room

- Har active job ka ek private chat room hota hai
- Sirf job owner aur contractor us room mein hote hain
- Messages real-time deliver hote hain
- Typing indicator real-time kaam karta hai
- Unread count real-time update hota hai

---

---

# 15. PAYMENT SYSTEM (STRIPE)

Payment integration ka structure tayyar hai lekin abhi fully active nahi hai. Jo kaam hona tha woh yeh tha:

- **User ke liye:** Stripe customer account banana taake payment kar sake
- **Contractor ke liye:** Stripe Connected Account banana taake payment receive kar sake
- **Webhooks:** Jab payment successful ya fail ho to system ko automatically pata chale

Abhi yeh feature future development ke liye ready hai.

---

---

# 16. ADMIN FEATURES

Admin ka kaam platform ka static content manage karna hai:

- **Terms & Conditions** — Platform ke rules update karna
- **Privacy Policy** — Privacy policy update karna
- **About App** — App ke baare mein info update karna
- **Users List** — Saare registered users (USER aur CONTRACTOR) dekhna

---

---

# 17. SECURITY AUR MIDDLEWARE

### Har Request Kaise Process Hoti Hai?

Jab bhi koi request server pe aati hai, yeh steps hote hain:

**1. CORS Check**
Cross-origin requests allow karna — taake mobile app ya web app server se baat kar sake.

**2. Request Parsing**
JSON body parse hoti hai (100MB tak).

**3. Logging**
Har request log hoti hai (Winston logger) — debugging ke liye.

**4. Token Verification**
Private routes pe JWT token check hota hai. Token invalid ya missing ho to request reject ho jati hai.

**5. User Type Check**
Kuch routes sirf USER ke liye hain, kuch sirf CONTRACTOR ke liye, kuch sirf ADMIN ke liye. Galat type ka user access karne ki koshish kare to forbidden error aata hai.

**6. Input Validation**
Har request ka data Joi library se validate hota hai. Galat ya missing fields ho to clear error message aata hai.

**7. Controller → Service → Database**
Validated request controller mein jaati hai, wahan se service mein (business logic), wahan se database mein (Prisma ORM → MySQL).

**8. Error Handler**
Agar koi bhi step mein error aaye, centralized error handler pakad leta hai aur standard format mein error response bhejta hai.

---

### Password Security

Passwords kabhi plain text mein save nahi hote. **bcrypt** hashing use hoti hai — ek one-way encryption jo password ko unreadable bana deti hai. Login pe bhi original password se hash compare hota hai.

---

### Token Security

- Access token short-lived hota hai
- Refresh token database mein store hota hai
- Logout pe refresh token delete ho jata hai
- Koi purana token use karne ki koshish kare to kaam nahi karta

---

---

# 18. POORA PROJECT FLOW — EK NAZAR MEIN

### USER Ka Poora Safar:

```
REGISTER
  → Email/Phone + Password dena
  → OTP verify karna (60 sec)
  → Profile complete karna (naam, address, photo)
  
JOB POST KARNA
  → Title, description, budget, location, timeline dena
  → Attachments add karna (optional)
  → Job OPEN ho jati hai
  
BIDS DEKHNA
  → Contractors ke quotes aate hain
  → Notifications milti hain
  → Har bid ka price, timeline, notes dekh sakte hain
  
BID ACCEPT KARNA
  → Best bid select karna
  → Baaki sab automatically reject
  → Chat room ban jata hai
  
CHAT KARNA
  → Contractor se directly baat karna
  → Kaam ki details finalize karna
  
KAAM COMPLETE KARNA
  → "Mark as Completed" karna
  → Chat read-only ho jati hai
  
REVIEW DENA
  → 1-5 stars rating
  → Written feedback
  
DOBARA KAAM KARWANA
  → Same contractor ko "Service Request" se invite karna
```

---

### CONTRACTOR Ka Poora Safar:

```
REGISTER
  → Email/Phone + Password dena
  → OTP verify karna
  → Detailed profile banana:
    - About, experience, documents
    - Portfolio, services, service areas
  
JOBS DHUNDHNA
  → Open jobs ki list dekhna
  → Search by location, job type
  → Job detail dekhna
  
BID LAGANA
  → Quote price dena
  → Timeline batana
  → Notes aur proposal documents attach karna
  → LIVE auction mein real-time participate karna
  
WAIT KARNA
  → Notification aayegi agar bid accept ya reject hua
  → "My Bids" mein status dekhna
  
KAAM KARNA
  → Bid accept hone pe job owner se chat karna
  → Kaam karna
  
REVIEW MILNA
  → Job owner review deta hai
  → Stars aur feedback milta hai
  
ANALYTICS DEKHNA
  → Success rate dekhna
  → Performance track karna
```

---

### LIVE AUCTION Ka Poora Safar:

```
User LIVE job post karta hai (budget > 2000)
  ↓
Contractors job room join karte hain (Socket)
  ↓
Saare current bids real-time dikh te hain
  ↓
Contractor bid lagata hai → Saare ko real-time update
  ↓
Doosra contractor kam price pe bid lagata hai → Saare ko update
  ↓
User best bid accept karta hai → Saare ko real-time pata chalta hai
  ↓
Auction khatam, chat shuru
```

---

### CHAT Ka Poora Safar:

```
Bid Accept Hota Hai
  ↓
Chat Room Automatically Banta Hai
  ↓
User/Contractor Chat Open Karta Hai
  ↓
Socket Se Room Join Karta Hai
  ↓
Messages Real-time Jaate Hain
  ↓
Typing Indicator Kaam Karta Hai
  ↓
Unread Count Update Hota Rehta Hai
  ↓
Job Complete Hone Pe Chat Read-Only
```

---

---

## TECHNICAL SUMMARY

| Component | Technology |
|-----------|------------|
| Backend Framework | Node.js + Express.js |
| Database | MySQL |
| ORM (Database Layer) | Prisma |
| Real-time Communication | Socket.IO |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt |
| File Storage | Amazon S3 |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Payment | Stripe (partial) |
| Input Validation | Joi |
| Logging | Winston |
| Social Login | Google OAuth, Apple OAuth |
| Scheduled Tasks | node-cron |

---

*ServiceLink Backend — Complete Project Documentation*  
*Prepared for: Development Team Reference*
