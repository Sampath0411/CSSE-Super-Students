# CSSE Super Student App - Complete Workflow

## Overview
A comprehensive attendance and student management system for Andhra University CSSE Department with three user roles: **Student**, **Faculty**, and **HOD**.

---

## 1. AUTHENTICATION WORKFLOW

### 1.1 Landing Page
```
User visits /
    ↓
Hero Page displays:
  - Andhra University branding
  - Two portal options:
      ├─ Student Portal → /login
      └─ Admin/Faculty Portal → /login
  - Core features highlight
  - Test credentials section
```

### 1.2 Login Flow
```
/login page
    ↓
┌─────────────────────────────────────────┐
│  Student Login        │  Faculty Login │
│  - Roll Number        │  - Email       │
│  - Regd Number        │  - Password    │
└─────────────────────────────────────────┘
    ↓
Authentication Check (sessionStorage)
    ↓
Success ───────────────────→ Failure
    ↓                           ↓
Redirect to              Error message
role-based dashboard     displayed
```

### 1.3 Session Management
```
Login Success
    ↓
Store in sessionStorage:
  - studentUser (for students)
  - facultyUser (for faculty/HOD)
    ↓
Protected routes check session
    ↓
Logout → Clear sessionStorage → Redirect to /
```

---

## 2. STUDENT WORKFLOW

### 2.1 Student Dashboard
```
/student (Dashboard)
    ↓
┌─────────────────────────────────────────────────┐
│ Welcome Banner (name, course, year, semester)   │
│                                                 │
│ Quick Stats Cards:                              │
│ ├─ Overall Attendance % (with progress bar)    │
│ ├─ Classes Attended / Total                    │
│ ├─ Classes Missed                              │
│ └─ Exam Eligibility (Eligible/At Risk)         │
│                                                 │
│ Today's Schedule:                               │
│ └─ Period-wise classes with time slots         │
│                                                 │
│ Subject-wise Attendance:                        │
│ └─ Top 5 subjects with percentage bars         │
│                                                 │
│ Attendance Warning (if < 75%):                  │
│ └─ Low attendance subjects list                │
└─────────────────────────────────────────────────┘
```

### 2.2 Attendance Viewing
```
/student/attendance
    ↓
┌─────────────────────────────────────────────────┐
│ Calendar View                                   │
│ └─ Month-wise attendance display               │
│                                                 │
│ Attendance History Table:                       │
│ ├─ Date                                         │
│ ├─ Subject                                      │
│ ├─ Period                                       │
│ └─ Status (Present/Absent/Late)                │
│                                                 │
│ Subject-wise Summary:                           │
│ └─ Each subject with % and class count         │
└─────────────────────────────────────────────────┘
```

### 2.3 Assignment Workflow
```
/student/assignments
    ↓
┌─────────────────────────────────────────────────┐
│ Assignments List                                │
│                                                 │
│ For Each Assignment:                            │
│ ├─ Subject Code & Name                         │
│ ├─ Title                                        │
│ ├─ Description                                  │
│ ├─ Due Date                                     │
│ ├─ Max Marks                                    │
│ ├─ Status: Active/Closed                       │
│ └─ Submission Status: Submitted/Pending        │
│                                                 │
│ Submit Assignment:                              │
│ ├─ Click "Submit"                              │
│ ├─ Enter submission content (text)             │
│ ├─ Submit → Save to submissions store          │
│ └─ Status updated to "Submitted"               │
└─────────────────────────────────────────────────┘
```

### 2.4 Letter Request Workflow
```
/student/letters
    ↓
┌─────────────────────────────────────────────────┐
│ Available Letter Types:                         │
│ ├─ Bonafide Certificate                        │
│ ├─ Conduct Certificate                         │
│ ├─ Leave Letter                                │
│ └─ Fee Due Certificate                         │
│                                                 │
│ Request Process:                                │
│ 1. Select Letter Type                           │
│ 2. Fill Purpose/Details                           │
│ 3. Submit Request                               │
│ 4. Status: Pending → Approved/Rejected         │
│ 5. View/Download generated PDF                   │
│                                                 │
│ Letter Contains:                                │
│ ├─ Auto-filled student details                 │
│ ├─ AU Logo watermark                           │
│ ├─ QR code for verification                    │
│ └─ Serial number                               │
└─────────────────────────────────────────────────┘
```

### 2.5 Timetable View
```
/student/timetable
    ↓
┌─────────────────────────────────────────────────┐
│ Weekly Schedule (MON-SAT)                      │
│                                                 │
│ Each Day Shows:                                 │
│ ├─ Period 1-8 with time slots                  │
│ ├─ Subject code                                 │
│ ├─ Subject name                                 │
│ ├─ Type (Class/Lab/Break)                      │
│ └─ Special markings (Cancelled/Substitute)     │
└─────────────────────────────────────────────────┘
```

### 2.6 Notifications
```
/student/notifications
    ↓
┌─────────────────────────────────────────────────┐
│ Notification Types:                               │
│ ├─ Letter approval/rejection                    │
│ ├─ Attendance warnings                          │
│ ├─ Assignment due reminders                     │
│ └─ General announcements                        │
│                                                 │
│ Actions:                                        │
│ └─ Mark as read, View details                  │
└─────────────────────────────────────────────────┘
```

---

## 3. FACULTY WORKFLOW

### 3.1 Faculty Dashboard
```
/faculty (Analytics Dashboard)
    ↓
┌─────────────────────────────────────────────────┐
│ Quick Stats:                                    │
│ ├─ Total Students                               │
│ ├─ Average Attendance %                         │
│ ├─ Chronic Absentees (< 75%)                   │
│ └─ Total Alerts Sent                            │
│                                                 │
│ Analytics Tabs:                                 │
│ ├─ Day-wise: Daily absentee reports            │
│ ├─ Subject-wise: Subject attendance analysis  │
│ └─ Semester: Chronic absentees & alerts         │
│                                                 │
│ Charts:                                         │
│ ├─ Attendance trend (line chart)               │
│ ├─ Subject-wise attendance (bar chart)          │
│ └─ Student distribution (pie chart)             │
└─────────────────────────────────────────────────┘
```

### 3.2 Manual Attendance Marking
```
/faculty/attendance
    ↓
┌─────────────────────────────────────────────────┐
│ Step 1: Select Parameters                       │
│ ├─ Subject (dropdown)                           │
│ ├─ Period (1-8)                                 │
│ ├─ Date (default: today)                        │
│ └─ Marking Type: Present/Absent/Late          │
│                                                 │
│ Step 2: Mark Attendance                           │
│ ├─ Search by roll number                        │
│ ├─ Click to toggle present/absent              │
│ ├─ Bulk selection option                        │
│ └─ Submit to save records                        │
│                                                 │
│ Validation:                                     │
│ └─ Duplicate check (same period/subject/date) │
└─────────────────────────────────────────────────┘
```

### 3.3 Assignment Management
```
/faculty/assignments
    ↓
┌─────────────────────────────────────────────────┐
│ View Assignments:                               │
│ ├─ List of all created assignments             │
│ ├─ Subject, Due Date, Status                   │
│ └─ Submission count                             │
│                                                 │
│ Create Assignment:                              │
│ ├─ Title                                        │
│ ├─ Description                                  │
│ ├─ Select Subject                               │
│ ├─ Due Date                                     │
│ └─ Max Marks                                    │
│                                                 │
│ Manage Submissions:                             │
│ ├─ View class list                             │
│ ├─ Toggle submitted/not submitted              │
│ ├─ Add remarks                                  │
│ └─ Save changes                                 │
│                                                 │
│ Edit/Delete:                                    │
│ └─ Modify assignment details                   │
└─────────────────────────────────────────────────┘
```

### 3.4 Timetable Management
```
/faculty/timetable
    ↓
┌─────────────────────────────────────────────────┐
│ View Weekly Schedule                            │
│                                                 │
│ Modify Schedule:                                │
│ ├─ Cancel Class:                               │
│ │  ├─ Select day & period                      │
│ │  ├─ Reason for cancellation                │
│ │  └─ Mark as cancelled                       │
│ │                                               │
│ └─ Substitution:                                │
│    ├─ Select original period                  │
│    ├─ Select substitute teacher               │
│    ├─ Reason for substitution                 │
│    └─ Assign substitute                       │
│                                                 │
│ Modification History:                           │
│ └─ Track all changes with timestamps          │
└─────────────────────────────────────────────────┘
```

---

## 4. HOD WORKFLOW

### 4.1 HOD Dashboard
```
/hod
    ↓
Same as Faculty Dashboard but with additional:
├─ Department-wide analytics
├─ All faculty oversight
└─ Letter approval authority
```

### 4.2 Letter Approval Workflow
```
/hod/letters/approvals
    ↓
┌─────────────────────────────────────────────────┐
│ Incoming Requests:                              │
│ ├─ Student name, Roll number                    │
│ ├─ Letter type                                  │
│ ├─ Purpose                                      │
│ └─ Request date                                 │
│                                                 │
│ Approval Process:                               │
│ 1. Review request details                       │
│ 2. Check student eligibility                    │
│ 3. Action:                                      │
│    ├─ Approve → Generate PDF                  │
│    │            ├─ Add AU watermark            │
│    │            ├─ Auto-fill student data      │
│    │            ├─ Add QR code                 │
│    │            └─ Assign serial number        │
│    └─ Reject → Add reason                      │
│ 4. Student receives notification               │
│                                                 │
│ Generated Letter Contains:                      │
│ ├─ Official AU letterhead                      │
│ ├─ Auto-filled student details                 │
│ ├─ Approval signature area                     │
│ ├─ QR code for verification                    │
│ ├─ Serial number                                │
│ └─ Watermark                                     │
└─────────────────────────────────────────────────┘
```

### 4.3 Alerts Management
```
/hod/alerts
    ↓
┌─────────────────────────────────────────────────┐
│ Chronic Absentees List (< 75% attendance)      │
│                                                 │
│ For Each Student:                               │
│ ├─ Name, Roll number                            │
│ ├─ Attendance percentage                        │
│ ├─ Classes attended/total                       │
│ ├─ Status: Not Eligible                        │
│ └─ Actions: Send SMS / Send Email              │
│                                                 │
│ Alert Content:                                  │
│ └─ "Your ward [name] has attendance of          │
│     [X]% which is below required 75%.          │
│     Please contact the department."            │
│                                                 │
│ Alert History:                                  │
│ └─ Log of all sent alerts with timestamps      │
└─────────────────────────────────────────────────┘
```

---

## 5. DATA FLOW DIAGRAM

### 5.1 Attendance Data Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Faculty   │────▶│  Mark Attend │────▶│ attendanceRecords│
│   Action    │     │   (Manual)   │     │   (in-memory)   │
│             │     │              │     │                 │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                          ┌────────────────────────┘
                          ▼
                   ┌──────────────┐
                   │ Calculate %  │
                   │ (Real-time)  │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │   Student   │ │   Faculty    │ │    HOD      │
   │  Dashboard  │ │  Dashboard   │ │   Alerts    │
   │   View %    │ │  Analytics   │ │   Check     │
   └─────────────┘ └─────────────┘ └─────────────┘
```

### 5.2 Letter Request Flow
```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Student │────▶│ Request  │────▶│   HOD    │────▶│ Approve/ │
│ Request │     │  Submit  │     │  Review  │     │  Reject  │
└─────────┘     └──────────┘     └────┬─────┘     └────┬─────┘
                                        │                │
                                        ▼                ▼
                                 ┌──────────┐     ┌──────────┐
                                 │ Pending  │     │ Generate │
                                 │  Status  │     │   PDF    │
                                 └──────────┘     └────┬─────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │ Student  │
                                                 │ Notified │
                                                 └──────────┘
```

### 5.3 Assignment Submission Flow
```
┌─────────┐     ┌──────────┐     ┌──────────┐
│ Faculty │────▶│ Create   │────▶│  Store   │
│ Creates │     │ Assignment│    │  in assignments│
└─────────┘     └──────────┘     └────┬─────┘
                                      │
                                      ▼
┌─────────┐     ┌──────────┐     ┌──────────┐
│ Student │────▶│ Submit   │────▶│  Store   │
│ Submits │     │ Content  │     │  in submissions│
└─────────┘     └──────────┘     └────┬─────┘
                                      │
                                      ▼
                               ┌──────────┐
                               │ Faculty  │
                               │  View &  │
                               │  Toggle  │
                               └──────────┘
```

---

## 6. NOTIFICATION WORKFLOW

```
Trigger Event                    Notification
─────────────────────────────────────────────────────
Letter Approved        →    Student receives alert
Letter Rejected          →    Student receives alert
Attendance < 75%        →    Warning notification
Assignment Due Soon     →    Reminder notification
Class Cancelled         →    Student notification
Substitute Teacher      →    Student notification
```

---

## 7. CALCULATION WORKFLOW

### 7.1 Attendance Percentage
```
For Each Student:
    totalClasses = count of all attendance records
    presentClasses = count of "present" status
    percentage = (presentClasses / totalClasses) × 100

    if percentage >= 75%:
        status = "Eligible for Exams"
    else:
        status = "At Risk - Condonation Required"
```

### 7.2 Subject-wise Attendance
```
For Each Subject:
    subjectRecords = filter by subjectId
    present = count of "present" in subjectRecords
    total = count of subjectRecords
    percentage = (present / total) × 100
```

### 7.3 Chronic Absentees
```
For All Students:
    if overallAttendance < 75%:
        add to chronicAbsentees list
```

---

## 8. STORAGE ARCHITECTURE

```
sessionStorage:
  ├─ studentUser: Current logged-in student
  ├─ facultyUser: Current logged-in faculty/HOD
  └─ notifications: Unread notification count

In-Memory Data (lib/data.ts):
  ├─ students[]: 30 student records
  ├─ teachers[]: Faculty/HOD accounts
  ├─ subjects[]: 9 course subjects
  ├─ attendanceRecords[]: All attendance entries
  ├─ assignments[]: Assignment definitions
  ├─ timetable[]: Weekly schedule
  ├─ alertLogs[]: Sent alert history
  ├─ letterRequests[]: Letter applications
  └─ assignmentSubmissions[]: Student submissions

Browser Session:
  └─ All data persists during session
  └─ Cleared on logout/browser close
```

---

## 9. SECURITY WORKFLOW

```
Protected Routes:
  ├─ /student/* → Requires studentUser session
  ├─ /faculty/* → Requires facultyUser session (role: faculty)
  └─ /hod/* → Requires facultyUser session (role: hod)

Authentication Check:
  ├─ Middleware checks sessionStorage
  ├─ No session → Redirect to /login
  ├─ Wrong role → Redirect to appropriate portal
  └─ Valid session → Allow access

Password Storage (Demo):
  └─ Plain text in data.ts (NOT for production)
  └─ Production: Use bcrypt + proper auth
```

---

## 10. USER ROLES & PERMISSIONS

| Feature | Student | Faculty | HOD |
|---------|---------|---------|-----|
| View Own Attendance | ✅ | ✅ | ✅ |
| Mark Attendance | ❌ | ✅ | ✅ |
| View Analytics | Own Only | All | All |
| Create Assignments | ❌ | ✅ | ✅ |
| Submit Assignments | ✅ | ❌ | ❌ |
| Manage Timetable | ❌ | Own Only | All |
| Request Letters | ✅ | ❌ | ❌ |
| Approve Letters | ❌ | ❌ | ✅ |
| Send Alerts | ❌ | ❌ | ✅ |
| View Chronic Absentees | Own Only | All | All |

---

## 11. KEY INTEGRATIONS

| Service | Purpose |
|---------|---------|
| Recharts | Analytics charts |
| QRCode.react | Letter verification codes |
| Framer Motion | UI animations |
| shadcn/ui | Component library |
| Lucide React | Icons |
| date-fns | Date formatting |

---

## 12. COMPLETE USER JOURNEY

### Student Journey
```
1. Visit Landing Page
2. Click "Student Login"
3. Enter Roll Number (e.g., 22211)
4. View Dashboard
5. Check Attendance
6. View/Submit Assignments
7. Request Letters
8. Check Notifications
9. View Timetable
10. Edit Profile
```

### Faculty Journey
```
1. Visit Landing Page
2. Click "Admin Login"
3. Login with Email/Password
4. View Analytics Dashboard
5. Mark Attendance (Manual)
6. Create/Manage Assignments
7. Modify Timetable
8. Send Alerts (HOD only)
9. Approve Letters (HOD only)
```

---

**End of Workflow Document**
