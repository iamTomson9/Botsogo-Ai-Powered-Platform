Botsogo: AI-Powered Healthcare Platform

Hey everyone! super excited to share this project we've been working on. This is a 80% complete, AI-driven healthcare ecosystem built with React Native (Expo) and Firebase. 

First and foremost, a HUGE shoutout and massive praise to my incredible team members, the AUTOBOTS  You guys totally made this possible. Your designs were absolutely stellar, your support was unmatched, and your ability to set milestones and keep us on track was the only reason we pulled this off. I couldn't have asked for a better team!


What does this app do?

Botsogo connects patients, doctors, pharmacists, and admins together using the power of AI (shoutout to Gemini 2.0!).To reduce quing, help monitor inventory and patients to ensure healthcare service is provided 

Patients
 can chat with an AI triage bot, 
 check their symptoms, 
 automatically book appointments if things look serious, 
 and view their medical records.

Doctors 
get AI-summarized notes from patient consultations, 
AI-assisted image diagnostics for things like 
X-rays or skin conditions, 
and an easy way to prescribe medication.

Pharmacists 
get a streamlined dashboard to see incoming prescriptions, 
manage heavy inventory, 
and get alerts when stock is low.

Admins 
have a bird's-eye view of everything: 
app performance, 
AI impact, 
operational alerts, 
and user role management.

Developer Information

Folder Structure

/app - This is where the magic of Expo Router happens. It handles all our navigation based on the user's role:
/(patient) - All the screens the patients see (Home, Chat, Records).
/(doctor) - The doctor's workspace (Appointments, Diagnostics, Prescribing).
/(pharmacy) - Inventory and dispensing screens for the pharmacists.
/(admin) - The big boss dashboard and user management routes.
/(auth)` - Login and registration screens.

/components - These are our reusable elements throughout the app cards and others
  /Admin, /Doctor, /Patient, /Pharmacy - Specific designs element for each role (like the Admin Dashboard KPI cards and the Doctor's prescription form).
  /Chat - The AI chat interface components.
  /UI - Generic buttons, inputs, and cards used everywhere.

/services - The "Backend" in our frontend. its more like a bridge between the frontend and backend 
  aiService.ts - Where we talk to Google's Gemini AI to do symptom checking and image analysis.
  authService.ts & userService.ts - Handling Firebase authentication, logins, and managing roles.
  medicalService.ts - Fetching records, updating inventory, and saving prescriptions to Firestore.

/constants & /utils - Our theme colors, layout dimensions, and helpful little formatting functions so we don't repeat ourselves.

/firebase - The config files that connect us to our Firebase backend database and auth.

How to run it locally

1. Clone the repo.
2. Run npm install to install all the dependencies.
3. Have your Firebase config set up in firebase/config.ts.
4. Run npx expo start to launch the Metro bundler. uses Expo 54 now but expo 55 is up and coming so some dependencies might be deprecated by that time
5. Hit a for Android, i for iOS, or w for Web! and by the way for phone ensure you have expo installed you can simply scan or enter the link on expo go it start with exp://

Again, thank you so much to the AUTOBOTS my wonderful teammate for pushing this across the finish line. We built something really cool! 
