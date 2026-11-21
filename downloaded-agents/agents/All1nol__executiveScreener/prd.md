The EchoHire Recruitment Funnel is a two-part web application designed to streamline the hiring process by:

Providing candidates with a seamless, multi-step application flow.

Equipping recruiters with a centralized dashboard to review, assess, and manage applicants efficiently.

Key Objectives
✔ Streamline Screening – Automate collection of candidate data, language skills, and job-simulation tasks.
✔ Enhance Candidate Experience – Reduce drop-offs with a user-friendly, guided application process.
✔ Improve Assessment Quality – Evaluate candidates via structured English tests and job-simulated tasks before interviews.
✔ Centralize Recruiter Workflow – Consolidate applicant data (resumes, test answers, notes) in one dashboard.
✔ Secure & Scalable – Built on Supabase (PostgreSQL) with encryption, RBAC, and modular Next.js architecture.

2. Features
Candidate-Facing Features
1. Multi-Step Application Form
Inputs:

Personal Info (Name, Email, Phone, Location)

Professional Details (Current Role, Company, LinkedIn, Website)

File Uploads (Resume, Profile Photo)

Validations: Required fields, email format, file type/size checks.

2. English Proficiency Test
Format:

Audio Responses (Record answers via browser microphone, min. 30 sec).

Written Responses (Short-answer questions).

Example Questions:

"Tell me about yourself." (Audio)

"Describe your availability for US time zones." (Written)

3. Job Simulation Tasks
Task Examples:

"Draft a professional email responding to a client complaint."

"Schedule a meeting given conflicting calendars."

UI: One task per screen with clear instructions.

4. Progress Tracking & Confirmation
Progress Bar: "Step 2 of 4" indicators.

Submission Confirmation: "Thank you! We’ve received your application."

Recruiter-Facing Features
1. Admin Dashboard
Secure Login: Supabase Auth (Email/Password).

Job Pipeline View: List of roles (e.g., "Partnerships Manager – 9 Applicants").

2. Applicant Management
List View: Sort/filter by status (New/Pass/Fail), search by name/email.

Detail View:

Personal info + resume download.

Audio player for English test responses.

Simulation task answers (text).

3. Decision-Making Tools
Pass/Fail Toggle: Mark candidates with one click.

Internal Notes: Add comments (e.g., "Strong English but weak in task 3").

4. Responsive Design
Works on desktop (primary) and mobile (quick checks).

3. Technical Stack
Component	Technology
Frontend	Next.js (React), Tailwind CSS
Backend	Next.js API Routes
Database	Supabase (PostgreSQL)
File Storage	Supabase Storage
Authentication	Supabase Auth
Deployment	Vercel
4. Data Schema (Key Tables)
1. candidates
candidate_id (UUID), job_id (UUID), full_name, email, resume_url, status (Applied/Pass/Fail).

2. english_test_answers
answer_id, candidate_id, question, audio_url, answer_text.

3. task_responses
task_id, candidate_id, task_prompt, response_text.

4. admin_users
admin_id, email, password_hash (Supabase-managed).

5. User Flows
Candidate Flow
Step 1: Submit personal info + resume.

Step 2: Complete English test (audio/written).

Step 3: Perform job-simulation tasks.

Step 4: See confirmation screen.

Recruiter Flow
Log in → Select job → View applicant list.

Click candidate → Review details (resume, audio, tasks).

Mark Pass/Fail + add notes.