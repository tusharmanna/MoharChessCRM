# MoharCRM Configuration Guide

This guide outlines the specific CRM configurations for your chess academy.

---

## 1. PIPELINE STAGES (Prospect to Student Journey)

### Stage Definitions

**Stage 1: Inquiry**
- **What it means:** Initial contact, person just learned about us
- **Who enters:** New leads from website, calls, referrals
- **Duration expectation:** 1-3 days
- **Actions:** Welcome message, send academy info, schedule call
- **Success criteria:** Prospect responds or attends trial

**Stage 2: Interested**
- **What it means:** They've shown genuine interest, asked questions
- **Who enters:** From "Inquiry" after positive interaction
- **Duration expectation:** 3-7 days
- **Actions:** Send trial class details, offer specific time slot
- **Success criteria:** Trial class booked

**Stage 3: Trial Scheduled**
- **What it means:** Trial class appointment is confirmed
- **Who enters:** Parent/student has confirmed trial time
- **Duration expectation:** Same day to 1 week before trial
- **Actions:** Send reminder 1 day before, prepare instructor notes
- **Success criteria:** Student attends trial

**Stage 4: Trial Completed**
- **What it means:** Student attended trial class
- **Who enters:** From "Trial Scheduled" after class
- **Duration expectation:** 1 day after trial
- **Actions:** Get feedback from student, discuss enrollment, follow up with parent
- **Success criteria:** Enrollment discussion happens

**Stage 5: Negotiating**
- **What it means:** Discussing batch/timing/pricing with parent
- **Who enters:** After trial, student is interested
- **Duration expectation:** 3-7 days
- **Actions:** Answer questions, offer flexible options, address concerns
- **Success criteria:** Enrollment decision made

**Stage 6: Enrolled**
- **What it means:** Student is officially enrolled, class started
- **Who enters:** After payment received
- **Duration expectation:** Ongoing student lifecycle
- **Actions:** Send welcome materials, schedule first class, set progress tracking
- **Success criteria:** Student completes first 2 classes successfully

**Stage 7: Lost**
- **What it means:** Prospect decided not to join
- **Who enters:** From any stage if prospect declines
- **Duration expectation:** Final stage
- **Actions:** Record loss reason, add to nurture/reminder list
- **Success criteria:** Exit interview completed

---

## 2. LEAD SCORING MODEL

### Scoring Components

**Interest Level (0-3 points)**
- 0 = Just browsing, no specific inquiry
- 1 = Casual question, unsure about enrollment
- 2 = Active inquiry, asking about trial/classes
- 3 = High intent, asking about pricing/schedule specifics

**How to assess:** From communication logs, number of questions asked

**Engagement (0-3 points)**
- 0 = No response to outreach attempts
- 1 = Initial inquiry only, minimal follow-up
- 2 = Multiple interactions, responded to our messages
- 3 = Regular communication, attended trial/multiple interactions

**How to assess:** Count communications, response time, trial attendance

**Chess Experience (0-2 points)**
- 0 = Complete beginner, no prior chess experience
- 1 = Some casual play, uncertain about skill level
- 2 = Experienced player or competitive background

**How to assess:** From inquiry form or conversation

**Demographic Fit (0-2 points)**
- 0 = Outside target area/age, poor fit with available batches
- 1 = Marginal fit, maybe slightly outside target
- 2 = Perfect fit - right age, location, available batch matches level

**How to assess:** Location, age vs available batches

### Scoring Interpretation

| Total Score | Priority | Action |
|-------------|----------|--------|
| 0-3 | Low | Nurture list, quarterly check-in |
| 4-6 | Medium | Follow up weekly, personalized outreach |
| 7-10 | Hot | Follow up within 24 hours, priority attention |

---

## 3. TASK TEMPLATES & AUTOMATION

### Prospect Tasks (Automatically create these)

**First Contact (Due: Next business day)**
```
Title: Call [Name] - First Contact
Description: Introduce academy, answer initial questions about chess, age group, timing
Priority: High
Assigned to: Enrollment staff
Expected outcome: Trial class interest or schedule follow-up
```

**Send Trial Details (Due: Same day or next day)**
```
Title: Send trial class info to [Name]
Description: Email schedule of trial classes, location, what to bring
Priority: Medium
Expected outcome: Trial class booking
```

**Follow-up After Trial (Due: Next business day)**
```
Title: Call [Name] - Trial feedback
Description: Get their feedback, address questions, discuss next steps
Priority: High
Expected outcome: Enrollment decision or next action
```

**Check In on Decision (Due: 5 days after trial)**
```
Title: Follow up on enrollment decision [Name]
Description: Check if parent/student made decision, answer remaining questions
Priority: Medium
Expected outcome: Enrollment or loss
```

### Student Tasks (Automatically create on enrollment)

**Welcome Sequence (Due: On enrollment)**
```
Title: Send welcome materials to [Name]
Description: Email welcome letter, class schedule, instructor info, parent handbook
Priority: High
Assigned to: Admin
```

**First Class Check (Due: After 1st class)**
```
Title: Follow up after first class - [Name]
Description: Call to confirm comfort level, answer questions
Priority: High
Assigned to: Instructor
```

**Progress Check (Due: Every 30 days)**
```
Title: Monthly progress check - [Name]
Description: Update attendance %, skill progress, get parent feedback
Priority: Medium
Assigned to: Instructor
```

**Tuition Reminder (Due: 2 days before payment due)**
```
Title: Payment reminder - [Name]
Description: Remind about upcoming payment
Priority: Low
Assigned to: Admin
```

### At-Risk Student Tasks (Automatically create if triggered)

**Trigger:** Student misses 2+ classes in a month

```
Title: Engagement check - [Name]
Description: Call parent to understand issues, offer support
Priority: High
Assigned to: Management
Expected outcome: Re-engagement or understanding reason
```

---

## 4. COMMUNICATION PLAN

### Weekly (Automated or manual)

**Monday Morning - New Inquiries Review**
- Check all new inquiries from past 7 days
- Assign lead scores
- Schedule follow-up calls
- Target: Contact 100% within 24 hours

**Wednesday - Trial Student Reminder**
- Email/SMS reminder to students with trial scheduled this week
- Confirm attendance
- Answer last-minute questions

**Friday - Weekly Summary**
- Review this week's enrollments
- Identify at-risk students
- Plan next week's priorities

### Monthly

**First Week - Student Progress Reviews**
- Instructor reviews each student's progress
- Update skill level, attendance, areas to improve
- Parent communication summary

**Second Week - Parent Check-ins**
- Scheduled calls with select parents (by batch/risk level)
- Discuss progress, address concerns, gather feedback

**Third Week - Analytics & Planning**
- Review conversion rates, retention, churn
- Identify trends, adjust strategy
- Pipeline health review

**Last Week - Next Month Planning**
- Plan enrollment campaigns
- Identify at-risk students
- Set team goals

### Quarterly

**Full Parent Meetings (Video/Phone)**
- 30-minute one-on-one with parent
- Comprehensive progress review
- Goal-setting for next quarter
- Satisfaction feedback

**Retention Review**
- Analyze churn data
- Identify at-risk students
- Proactive outreach plan

---

## 5. STUDENT STATUS DEFINITIONS

| Status | Meaning | Active? | Actions |
|--------|---------|---------|---------|
| **Prospect** | Inquiry received, not enrolled | No | Daily follow-up, nurturing |
| **Enrolled** | Paid for classes, ongoing student | Yes | Track progress, monthly check-ins |
| **Active** | Current student, good standing | Yes | Regular progress tracking |
| **Alumni** | Completed program or left | No | Maintain relationship, re-enrollment nurturing |
| **Inactive** | Haven't attended in 30+ days | No | Re-engagement attempt |

---

## 6. PAYMENT STATUS TRACKING

| Status | Meaning | Action |
|--------|---------|--------|
| **Current** | Payment up to date | No action needed |
| **Due Soon** | Due within 3 days | Send reminder |
| **Overdue** | Past due | Call parent, discuss options |
| **Expired** | No recent payment, student removed | Contact about re-enrollment |

---

## 7. RISK SCORE INTERPRETATION

**Low Risk (Green)**
- Attending 85%+ classes
- Parent communicates regularly
- Showing progress
- On-time payment

**Medium Risk (Yellow)**
- Attendance 70-85%
- Occasional parent contact needed
- Inconsistent progress
- Payment sometimes late

**High Risk (Red)**
- Attendance below 70%
- Limited parent engagement
- No visible progress
- Payment issues
- **Action required:** Immediate outreach

---

## 8. DATA CLEANUP CHECKLIST

Before using CRM strategically, clean your data:

### Student Records
- [ ] Remove duplicate entries (check by email, phone, name)
- [ ] Fill missing emails (at least 90% should have email)
- [ ] Ensure all phone numbers are formatted consistently
- [ ] Add source_of_lead for all existing students
- [ ] Set initial status (prospect, enrolled, alumni)
- [ ] Assign all students to a batch

### Parent Records
- [ ] Ensure each student has at least one parent
- [ ] Remove duplicate parent entries
- [ ] Verify phone numbers are correct
- [ ] Add email addresses where available
- [ ] Set communication preferences

### Communications Log
- [ ] Review and update communication types (Call, Email, SMS, In-person)
- [ ] Ensure all key interactions are logged
- [ ] Add missing dates to communications
- [ ] Clean up vague notes, make them specific

### Tasks
- [ ] Close completed tasks
- [ ] Update pending task statuses
- [ ] Remove duplicates
- [ ] Assign owner to all open tasks

---

## 9. LEAD SOURCE CODES

Use these codes for source_of_lead field:

- `GOOGLE` - Google search
- `SOCIAL_MEDIA` - Facebook, Instagram, etc.
- `REFERRAL` - Student/parent referral
- `WALK_IN` - Walk-in inquiry
- `EVENT` - Chess event or workshop
- `SCHOOL` - School connection
- `WEBSITE` - Website inquiry form
- `CALL` - Direct phone call
- `OTHER` - Other (specify in notes)

---

## 10. CHESS EXPERIENCE LEVELS

Use these codes for chess_experience field:

- `BEGINNER` - Never played or learned basics
- `BEGINNER_PLUS` - Played casually a few times
- `INTERMEDIATE` - Regular player, basic tactics known
- `INTERMEDIATE_PLUS` - Serious player, tournament experience
- `ADVANCED` - Strong player, high rating
- `MASTER` - Expert level, serious competitive

---

## 11. BATCH NAMING CONVENTION

Use these batch names consistently:

- `Beginner_Kids` - Ages 6-10, no experience
- `Beginner_Teens` - Ages 11-17, no experience
- `Intermediate_Kids` - Ages 6-10, some experience
- `Intermediate_Teens` - Ages 11-17, some experience
- `Advanced_Kids` - Ages 6-10, advanced
- `Advanced_Teens` - Ages 11-17, advanced
- `Adults_Beginner` - Adult beginners
- `Adults_Advanced` - Advanced adult players

---

## 12. IMPLEMENTATION CHECKLIST

### Week 1: Data Cleanup
- [ ] Clean duplicate student records
- [ ] Add missing email addresses
- [ ] Verify phone numbers
- [ ] Add source_of_lead to all students
- [ ] Ensure all students assigned to batch

### Week 2: Pipeline Setup
- [ ] Define 7 pipeline stages (as above)
- [ ] Set current students to "Enrolled" stage
- [ ] Move prospects to correct stage (Inquiry, Interested, etc.)
- [ ] Add expected enrollment dates for prospects

### Week 3: Lead Scoring
- [ ] Score all current prospects (0-10 scale)
- [ ] Identify and prioritize "hot leads"
- [ ] Create follow-up plan for hot leads

### Week 4: Progress Tracking
- [ ] Set attendance rates for all active students
- [ ] Estimate months enrolled
- [ ] Rate parent satisfaction 1-5
- [ ] Note strengths and areas to improve

### Week 5: Automation
- [ ] Create task templates
- [ ] Set up auto-task creation for prospects
- [ ] Set up student welcome task sequence

### Week 6: Communication Plan
- [ ] Establish weekly review meetings
- [ ] Schedule monthly parent check-ins
- [ ] Create communication templates
- [ ] Train team on process

### Ongoing: Monitoring
- [ ] Review hot leads daily
- [ ] Check at-risk students weekly
- [ ] Update progress monthly
- [ ] Review analytics quarterly

---

## 13. KEY METRICS TO TRACK

### Enrollment Metrics
- **Lead volume** - New inquiries per month
- **Conversion rate** - % of inquiries that become students
- **Days to enrollment** - Average time from first contact to enrollment
- **Cost per enrollment** - Marketing spend / enrollments

### Retention Metrics
- **Churn rate** - % of students leaving per month
- **Retention rate** - % of students staying
- **Average student lifetime** - How long students stay on average

### Engagement Metrics
- **Attendance rate** - Average class attendance %
- **Parent communication** - Responses per communication attempt
- **Task completion** - % of follow-up tasks completed

### Financial Metrics
- **Monthly recurring revenue** - Total student fees
- **Revenue per student** - Average fees
- **Payment collection rate** - % of on-time payments

---

## 14. SAMPLE COMMUNICATION TEMPLATES

### First Contact Email
```
Subject: Welcome to Mohar Chess Academy!

Hi [Name],

Thank you for your interest in Mohar Chess Academy! We're excited to help 
[Student Name] learn chess.

I wanted to reach out personally. Do you have any initial questions about:
- Our curriculum and teaching approach
- Class schedules and pricing
- Your [Student Name]'s chess experience level

We offer a FREE trial class so your child can experience our teaching style 
before enrolling. Would next [DAY] or [DAY] work for a trial?

Looking forward to hearing from you!

Best regards,
[Your Name]
Mohar Chess Academy
```

### Post-Trial Follow-up
```
Subject: How was [Student Name]'s trial class?

Hi [Name],

I hope [Student Name] enjoyed the trial class today! 

I'd love to get your feedback:
- How did [Student Name] enjoy it?
- Do you have any questions about enrollment?
- Which batch timing works best for you?

We have spots available in [Batch Name] starting [DATE]. Let me know if 
you'd like to move forward!

Best regards,
[Your Name]
```

### Monthly Progress Update
```
Subject: [Student Name]'s Chess Progress - Monthly Update

Hi [Name],

Here's [Student Name]'s progress this month:

Attendance: 90% (9/10 classes)
Skill development: Strong improvement in opening theory
Areas to focus: Endgame positions

[Student Name] is showing great potential and consistent improvement!

Next month's focus: Practical tournament practice

Feel free to reach out with any questions!

Best regards,
[Instructor Name]
```

---

**Next Steps:**
1. Review this guide with your team
2. Start with Week 1 checklist (data cleanup)
3. Gradually implement each week
4. Track metrics and adjust as needed

Good luck! 🎯
