// Types
export interface Student {
  id: string;
  rollNumber: string;
  regdNo: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  year: number;
  email: string;
  phone: string;
  parentPhone: string;
  dateOfAdmission: string;
  dateOfBirth: string;
  password: string;
  photo?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortName: string;
  credits: number;
  type: "theory" | "lab";
  teacherId: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  maxMarks: number;
  status: "active" | "closed";
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  password: string; // For demo purposes - in production use proper auth
  role: "faculty" | "hod"; // Role for portal access
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  period: number;
  status: "present" | "absent" | "late";
  markedBy: string;
}

export interface AlertLog {
  id: string;
  studentId: string;
  type: "sms" | "email";
  message: string;
  sentAt: string;
  parentContact: string;
}

export interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
}

export interface TimetableEntry {
  day: string;
  period: number;
  subjectId: string | null;
  type: "class" | "lab" | "break" | "ncc/nss" | "self-study" | "remedial" | "cancelled" | "substitute";
  originalTeacherId?: string; // Track original teacher for substitutions
  substituteTeacherId?: string; // Track substitute teacher
  isCancelled?: boolean;
  modifiedBy?: string; // ID of faculty/HOD who made the change
  modifiedAt?: string; // Timestamp of modification
  modificationReason?: string; // Reason for change
}

// Timetable modification history
export interface TimetableModification {
  id: string;
  day: string;
  period: number;
  originalSubjectId: string | null;
  newSubjectId: string | null;
  originalTeacherId?: string;
  newTeacherId?: string;
  action: "assigned" | "cancelled" | "substituted";
  modifiedBy: string;
  modifiedByName: string;
  modifiedAt: string;
  reason?: string;
}

// Session timeout configuration
export const SESSION_TIMEOUTS = {
  student: 30 * 60 * 1000, // 30 minutes in milliseconds
  faculty: 60 * 60 * 1000, // 1 hour in milliseconds
  hod: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Session activity tracking
export interface SessionActivity {
  userId: string;
  userType: "student" | "faculty" | "hod";
  lastActivity: number;
  loginTime: number;
}

// Time Slots as per actual timetable
export const timeSlots: TimeSlot[] = [
  { period: 1, startTime: "09:00", endTime: "09:50" },
  { period: 2, startTime: "09:50", endTime: "10:40" },
  { period: 3, startTime: "10:40", endTime: "11:30" },
  { period: 4, startTime: "11:30", endTime: "12:20" },
  // Lunch Break 12:20 - 01:30
  { period: 5, startTime: "13:30", endTime: "14:20" },
  { period: 6, startTime: "14:20", endTime: "15:10" },
  { period: 7, startTime: "15:10", endTime: "16:00" },
];

// Teachers (based on actual timetable)
export const teachers: Teacher[] = [
  { id: "HOD001", name: "Dr. Valli Kumari V", email: "hod@andhrauniversity.edu.in", department: "CSSE", designation: "Professor & HOD", password: "hod123", role: "hod" },
  { id: "T001", name: "Ms. D. Aneela", email: "aneela@andhrauniversity.edu.in", department: "CSSE", designation: "Research Scholar", password: "admin123", role: "faculty" },
  { id: "T002", name: "Mrs. B. Sunanda", email: "sunanda@andhrauniversity.edu.in", department: "CSSE", designation: "SWTA Faculty", password: "admin123", role: "faculty" },
  { id: "T003", name: "Dr. G. Sandhya Devi", email: "sandhya@andhrauniversity.edu.in", department: "CSSE", designation: "Adjunct Faculty", password: "admin123", role: "faculty" },
  { id: "T004", name: "Mr. S. Rajesh Kumar", email: "rajesh@andhrauniversity.edu.in", department: "CSSE", designation: "SWTA Faculty", password: "admin123", role: "faculty" },
  { id: "T005", name: "Ms. S. Sireesha", email: "sireesha@andhrauniversity.edu.in", department: "CSSE", designation: "SWTA Faculty", password: "admin123", role: "faculty" },
  { id: "T006", name: "Mrs. K. Sri Vaishnavi", email: "vaishnavi@andhrauniversity.edu.in", department: "CSSE", designation: "SWTA Faculty", password: "admin123", role: "faculty" },
  { id: "T007", name: "Ms. Sailaja Rani Setty", email: "sailaja@andhrauniversity.edu.in", department: "CSSE", designation: "Research Scholar", password: "admin123", role: "faculty" },
  { id: "T008", name: "Mr. P. Swamy", email: "swamy@andhrauniversity.edu.in", department: "CSSE", designation: "Research Scholar", password: "admin123", role: "faculty" },
  { id: "T009", name: "Dr. N. P. Lavanya Kumari", email: "lavanya@andhrauniversity.edu.in", department: "CSSE", designation: "Faculty", password: "admin123", role: "faculty" },
];

// Subjects (based on actual 3/6 BTECH CSE-4 timetable)
export const subjects: Subject[] = [
  { id: "CS3201", code: "CS3201", name: "Object Oriented Software Engineering", shortName: "OOSE", credits: 3, type: "theory", teacherId: "T001" },
  { id: "CS3202", code: "CS3202", name: "Machine Learning", shortName: "ML", credits: 4, type: "theory", teacherId: "T002" },
  { id: "CS3203", code: "CS3203", name: "Cryptography & Network Security", shortName: "CNS", credits: 3, type: "theory", teacherId: "T003" },
  { id: "CS3204", code: "CS3204", name: "Cloud Computing", shortName: "CC", credits: 3, type: "theory", teacherId: "T004" },
  { id: "CS3205", code: "CS3205", name: "Embedded Systems", shortName: "ES", credits: 3, type: "theory", teacherId: "T005" },
  { id: "CS3206", code: "CS3206", name: "Object Oriented Software Engineering Lab", shortName: "OOSE Lab", credits: 2, type: "lab", teacherId: "T006" },
  { id: "CS3207", code: "CS3207", name: "Machine Learning Lab", shortName: "ML Lab", credits: 2, type: "lab", teacherId: "T007" },
  { id: "CS3208", code: "CS3208", name: "Cryptography & Network Security Lab", shortName: "CNS Lab", credits: 2, type: "lab", teacherId: "T008" },
  { id: "CS3209", code: "CS3209", name: "Embedded Systems Lab", shortName: "ES Lab", credits: 2, type: "lab", teacherId: "T009" },
];

// Timetable for 3/6 BTECH (CSE)-4, II Semester - Room A33
export const timetable: TimetableEntry[] = [
  // Monday
  { day: "MON", period: 1, subjectId: "CS3208", type: "lab" }, // CNS LAB-2
  { day: "MON", period: 2, subjectId: "CS3206", type: "lab" }, // OOSE LAB-1
  { day: "MON", period: 3, subjectId: "CS3202", type: "class" }, // ML
  { day: "MON", period: 4, subjectId: "CS3202", type: "class" }, // ML (continued)
  { day: "MON", period: 5, subjectId: "CS3209", type: "lab" }, // ES LAB-1
  { day: "MON", period: 6, subjectId: "CS3207", type: "lab" }, // ML LAB-2
  { day: "MON", period: 7, subjectId: null, type: "ncc/nss" },
  
  // Tuesday
  { day: "TUE", period: 1, subjectId: "CS3205", type: "class" }, // ES
  { day: "TUE", period: 2, subjectId: "CS3205", type: "class" }, // ES
  { day: "TUE", period: 3, subjectId: "CS3201", type: "class" }, // OOSE
  { day: "TUE", period: 4, subjectId: "CS3201", type: "class" }, // OOSE
  { day: "TUE", period: 5, subjectId: "CS3203", type: "class" }, // CNS
  { day: "TUE", period: 6, subjectId: "CS3203", type: "class" }, // CNS
  { day: "TUE", period: 7, subjectId: null, type: "ncc/nss" },
  
  // Wednesday
  { day: "WED", period: 1, subjectId: "CS3204", type: "class" }, // CC
  { day: "WED", period: 2, subjectId: "CS3204", type: "class" }, // CC
  { day: "WED", period: 3, subjectId: "CS3201", type: "class" }, // OOSE
  { day: "WED", period: 4, subjectId: "CS3201", type: "class" }, // OOSE
  { day: "WED", period: 5, subjectId: "CS3209", type: "lab" }, // ES LAB-2
  { day: "WED", period: 6, subjectId: "CS3208", type: "lab" }, // CNS LAB-1
  { day: "WED", period: 7, subjectId: null, type: "ncc/nss" },
  
  // Thursday
  { day: "THU", period: 1, subjectId: "CS3207", type: "lab" }, // ML LAB-1
  { day: "THU", period: 2, subjectId: "CS3206", type: "lab" }, // OOSE LAB-2
  { day: "THU", period: 3, subjectId: "CS3202", type: "class" }, // ML
  { day: "THU", period: 4, subjectId: "CS3202", type: "class" }, // ML
  { day: "THU", period: 5, subjectId: null, type: "remedial" }, // REMEDIAL CLASSES
  { day: "THU", period: 6, subjectId: null, type: "remedial" },
  { day: "THU", period: 7, subjectId: null, type: "ncc/nss" },
  
  // Friday
  { day: "FRI", period: 1, subjectId: "CS3204", type: "class" }, // CC
  { day: "FRI", period: 2, subjectId: "CS3204", type: "class" }, // CC
  { day: "FRI", period: 3, subjectId: "CS3205", type: "class" }, // ES
  { day: "FRI", period: 4, subjectId: "CS3205", type: "class" }, // ES
  { day: "FRI", period: 5, subjectId: "CS3203", type: "class" }, // CNS
  { day: "FRI", period: 6, subjectId: "CS3203", type: "class" }, // CNS
  { day: "FRI", period: 7, subjectId: null, type: "ncc/nss" },
  
  // Saturday
  { day: "SAT", period: 1, subjectId: null, type: "self-study" },
  { day: "SAT", period: 2, subjectId: null, type: "self-study" },
  { day: "SAT", period: 3, subjectId: null, type: "self-study" },
  { day: "SAT", period: 4, subjectId: null, type: "self-study" },
  { day: "SAT", period: 5, subjectId: null, type: "self-study" }, // SWATCH BHARATH
  { day: "SAT", period: 6, subjectId: null, type: "self-study" },
  { day: "SAT", period: 7, subjectId: null, type: "self-study" },
];

// Real Students from the PDF data (3rd year CSSE)
export const students: Student[] = [
  { id: "STU211", rollNumber: "22211", regdNo: "3235064022211", name: "Karedla Tanush Sai", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "tanushsai104@gmail.com", phone: "9398167031", parentPhone: "9398167030", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-05-15", password: "Student123" },
  { id: "STU212", rollNumber: "22212", regdNo: "3235064022212", name: "Karnam Nivrutha Naidu", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "nivruthanaidu004@gmail.com", phone: "9398842656", parentPhone: "9398842655", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-02-20", password: "Student123" },
  { id: "STU213", rollNumber: "22213", regdNo: "3235064022213", name: "Karri Swathi Kumar", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "swathkumarkarri@gmail.com", phone: "7670966106", parentPhone: "7670966105", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-08-10" },
  { id: "STU214", rollNumber: "22214", regdNo: "3235064022214", name: "Kartikeya Rapeti", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kartikeyarapeti16@gmail.com", phone: "9391666660", parentPhone: "9391666661", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-11-25" },
  { id: "STU215", rollNumber: "22215", regdNo: "3235064022215", name: "Kasa Chaithanya Reddy", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kasa.chaithanyareddy@gmail.com", phone: "8688923581", parentPhone: "8688923580", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-01-12" },
  { id: "STU216", rollNumber: "22216", regdNo: "3235064022216", name: "Kasina Akhila", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "akhilakasina513@gmail.com", phone: "9701165189", parentPhone: "9701165188", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-04-08" },
  { id: "STU217", rollNumber: "22217", regdNo: "3235064022217", name: "Kasina Sowjanya", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kasinasowjanya9@gmail.com", phone: "9121846324", parentPhone: "9121846323", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-07-19" },
  { id: "STU218", rollNumber: "22218", regdNo: "3235064022218", name: "Kasireddy Ram Harsha Vardhan", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "ramharsha2006@gmail.com", phone: "9063655324", parentPhone: "9063655323", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-09-30" },
  { id: "STU219", rollNumber: "22219", regdNo: "3235064022219", name: "Kasturi Mahesh Kumar", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "ramarao9494676797@gmail.com", phone: "9392532157", parentPhone: "9392532156", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-12-05" },
  { id: "STU220", rollNumber: "22220", regdNo: "3235064022220", name: "Katru Srinidhi", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "srinidhikatru06@gmail.com", phone: "9247202605", parentPhone: "9247202604", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-03-14" },
  { id: "STU221", rollNumber: "22221", regdNo: "3235064022221", name: "Keesar Syam Siva Prasad Reddy", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "syamsivaprasadreddy19@gmail.com", phone: "7674846514", parentPhone: "7674846513", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-06-22" },
  { id: "STU222", rollNumber: "22222", regdNo: "3235064022222", name: "Kesaram Bhaskar", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kesarambhaskar05@gmail.com", phone: "9032874548", parentPhone: "9032874547", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-10-18" },
  { id: "STU223", rollNumber: "22223", regdNo: "3235064022223", name: "Kesari Satya Sumith Reddy", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "sumithreddy35@gmail.com", phone: "9849666811", parentPhone: "9849666810", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-02-28" },
  { id: "STU224", rollNumber: "22224", regdNo: "3235064022224", name: "Kethavarapu Narasimhamurthy Gupta", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "nareshgupta0891@gmail.com", phone: "7075976755", parentPhone: "7075976754", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-08-07" },
  { id: "STU225", rollNumber: "22225", regdNo: "3235064022225", name: "Khatija Fathima", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "khatijafathima30@gmail.com", phone: "8374596986", parentPhone: "8374596985", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-05-01" },
  { id: "STU226", rollNumber: "22226", regdNo: "3235064022226", name: "Killi Abhilash", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "abhilashkilli2@gmail.com", phone: "9618088394", parentPhone: "9618088393", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-11-12" },
  { id: "STU227", rollNumber: "22227", regdNo: "3235064022227", name: "Killi Harshith Dev", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "killiharshith@gmail.com", phone: "8897932032", parentPhone: "8897932031", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-03-25" },
  { id: "STU228", rollNumber: "22228", regdNo: "3235064022228", name: "Kintali Narendra", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "narendrakintali1919@gmail.com", phone: "9346833534", parentPhone: "9346833533", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-07-08" },
  { id: "STU229", rollNumber: "22229", regdNo: "3235064022229", name: "Kiran Malla", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kiranmalla2600p@gmail.com", phone: "6305581553", parentPhone: "6305581552", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-09-19" },
  { id: "STU230", rollNumber: "22230", regdNo: "3235064022230", name: "Kodali Hari Chandana", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "phaniharichandana@gmail.com", phone: "9948375308", parentPhone: "9948375307", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-01-30" },
  { id: "STU231", rollNumber: "22231", regdNo: "3235064022231", name: "Kola Kartheek", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kolakartheek2004@gmail.com", phone: "8523055519", parentPhone: "8523055518", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-04-15", password: "Student123" },
  { id: "STU232", rollNumber: "22232", regdNo: "3235064022232", name: "Kolachina Venkata Durga Sai Kiran", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "durgasaikiran25@gmail.com", phone: "9440344772", parentPhone: "9440344771", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-05-15", password: "Student123" },
  { id: "STU233", rollNumber: "22233", regdNo: "3235064022233", name: "Kolipaka Hemanth Kumar", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kolipakahemanthkumar777@gmail.com", phone: "9391410829", parentPhone: "9391410828", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-06-20", password: "Student123" },
  { id: "STU234", rollNumber: "22234", regdNo: "3235064022234", name: "Kolipaka Venkata Sai", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "venkatsai582523@gmail.com", phone: "9618617413", parentPhone: "9618617412", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-08-25" },
  { id: "STU235", rollNumber: "22235", regdNo: "3235064022235", name: "Kolli Chandra Sekhar", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "sekharkolli404@gmail.com", phone: "8341415746", parentPhone: "8341415745", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-10-10" },
  { id: "STU236", rollNumber: "22236", regdNo: "3235064022236", name: "Kolli Sowmya", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "sowmyakolli18@gmail.com", phone: "7386427472", parentPhone: "7386427471", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-12-15" },
  { id: "STU237", rollNumber: "22237", regdNo: "3235064022237", name: "Kolusu Sonia", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "kolususonia@gmail.com", phone: "7989306488", parentPhone: "7989306487", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-02-08" },
  { id: "STU238", rollNumber: "22238", regdNo: "3235064022238", name: "Komara Ajay", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "itsmeajay4110@gmail.com", phone: "9032900932", parentPhone: "9032900931", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-05-22" },
  { id: "STU239", rollNumber: "22239", regdNo: "3235064022239", name: "Kompella Venkata Satyasri Jahnavi", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "jahnavikvs11@gmail.com", phone: "8519960354", parentPhone: "8519960353", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-07-28" },
  { id: "STU240", rollNumber: "22240", regdNo: "3235064022240", name: "Kona Amram Thimothi", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "amramkona@gmail.com", phone: "8499941560", parentPhone: "8499941559", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-09-12" },
  { id: "STU241", rollNumber: "22241", regdNo: "3235064022241", name: "Konala S V Murali Ramakrishna Reddy", course: "B.Tech", branch: "Computer Science & Systems Engineering", semester: 6, year: 3, email: "konalamurali2006@gmail.com", phone: "9492054444", parentPhone: "9492054443", dateOfAdmission: "2022-08-01", dateOfBirth: "2004-11-05", password: "Student123" },
];

// Sample Assignments
export const assignments: Assignment[] = [
  {
    id: "ASG001",
    title: "OOSE Design Patterns Implementation",
    description: "Implement Singleton, Factory, and Observer patterns in Java. Submit code with documentation.",
    subjectId: "CS3201",
    dueDate: "2026-04-15",
    maxMarks: 20,
    status: "active",
    createdAt: "2026-03-25",
  },
  {
    id: "ASG002",
    title: "ML Linear Regression Project",
    description: "Build a linear regression model using Python (scikit-learn) on the provided dataset. Submit Jupyter notebook.",
    subjectId: "CS3202",
    dueDate: "2026-04-10",
    maxMarks: 25,
    status: "active",
    createdAt: "2026-03-28",
  },
  {
    id: "ASG003",
    title: "Cryptography Caesar Cipher Implementation",
    description: "Implement encryption and decryption using Caesar cipher. Write a Python program with GUI.",
    subjectId: "CS3203",
    dueDate: "2026-04-12",
    maxMarks: 15,
    status: "active",
    createdAt: "2026-03-26",
  },
  {
    id: "ASG004",
    title: "Cloud Computing AWS Deployment",
    description: "Deploy a simple web application on AWS EC2. Submit screenshots and architecture diagram.",
    subjectId: "CS3204",
    dueDate: "2026-04-20",
    maxMarks: 30,
    status: "active",
    createdAt: "2026-03-27",
  },
  {
    id: "ASG005",
    title: "Embedded Systems Arduino Project",
    description: "Create a temperature monitoring system using Arduino and DHT11 sensor. Submit code and video demo.",
    subjectId: "CS3205",
    dueDate: "2026-04-18",
    maxMarks: 25,
    status: "active",
    createdAt: "2026-03-24",
  },
  {
    id: "ASG006",
    title: "OOSE Lab: UML Diagrams",
    description: "Draw Use Case, Class, Sequence, and Activity diagrams for Library Management System.",
    subjectId: "CS3206",
    dueDate: "2026-04-05",
    maxMarks: 20,
    status: "closed",
    createdAt: "2026-03-15",
  },
  {
    id: "ASG007",
    title: "ML Lab: K-Means Clustering",
    description: "Implement K-Means clustering on Iris dataset. Visualize results using matplotlib.",
    subjectId: "CS3207",
    dueDate: "2026-04-08",
    maxMarks: 20,
    status: "active",
    createdAt: "2026-03-20",
  },
];

// Helper function to get assignments
export function getAssignments(): Assignment[] {
  return assignments;
}

export function getActiveAssignments(): Assignment[] {
  return assignments.filter((a) => a.status === "active");
}

export function getAssignmentsBySubject(subjectId: string): Assignment[] {
  return assignments.filter((a) => a.subjectId === subjectId);
}

// Seeded random number generator for deterministic attendance data
// This prevents hydration mismatches between server and client
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate mock attendance data with deterministic randomness
function generateAttendanceData(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const startDate = new Date("2026-01-19"); // W.E.F from timetable
  const endDate = new Date("2026-03-29");
  
  let recordId = 1;
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  // Use a fixed seed for deterministic generation
  const random = seededRandom(42);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayName = days[d.getDay()];
    
    // Skip Sundays
    if (dayName === "SUN") continue;
    
    const dateStr = d.toISOString().split("T")[0];
    const dayTimetable = timetable.filter(t => t.day === dayName && t.subjectId !== null);
    
    students.forEach((student) => {
      dayTimetable.forEach((entry) => {
        if (!entry.subjectId) return;
        
        // Generate attendance with deterministic randomness
        // Students ending in 5, 9, 3 have lower attendance (chronic absentees)
        let absentProbability = 0.12;
        const rollEnd = parseInt(student.rollNumber.slice(-1));
        if ([5, 9, 3].includes(rollEnd)) {
          absentProbability = 0.42;
        }
        
        const isAbsent = random() < absentProbability;
        const subject = subjects.find(s => s.id === entry.subjectId);
        
        records.push({
          id: `ATT${String(recordId++).padStart(6, "0")}`,
          studentId: student.id,
          subjectId: entry.subjectId,
          date: dateStr,
          period: entry.period,
          status: isAbsent ? "absent" : "present",
          markedBy: subject?.teacherId || "T001",
        });
      });
    });
  }
  
  return records;
}

export const attendanceRecords: AttendanceRecord[] = generateAttendanceData();

// Generate alert logs for chronic absentees
export const alertLogs: AlertLog[] = [
  { id: "AL001", studentId: "STU215", type: "sms", message: "Your ward has attendance below 60%. Please contact the department.", sentAt: "2026-02-15T10:30:00", parentContact: "8688923580" },
  { id: "AL002", studentId: "STU219", type: "email", message: "Attendance Alert: Student has been marked absent for 5 consecutive days.", sentAt: "2026-02-20T14:15:00", parentContact: "ramarao9494676797@gmail.com" },
  { id: "AL003", studentId: "STU223", type: "sms", message: "Your ward has attendance below 60%. Please contact the department.", sentAt: "2026-03-01T09:00:00", parentContact: "9849666810" },
  { id: "AL004", studentId: "STU229", type: "email", message: "Final Warning: Student attendance is critically low at 55%.", sentAt: "2026-03-10T11:00:00", parentContact: "kiranmalla2600p@gmail.com" },
];

// Classrooms
export const classrooms = [
  { id: "A33", name: "Room A33", lat: 17.7337, lon: 83.3186 }, // AU College of Engineering coordinates
  { id: "LAB1", name: "Computer Lab 1", lat: 17.7338, lon: 83.3187 },
  { id: "LAB2", name: "Computer Lab 2", lat: 17.7336, lon: 83.3185 },
  { id: "SEMINAR", name: "Seminar Hall", lat: 17.7339, lon: 83.3188 },
];

// Helper functions
export function getStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export function getStudentByRollNumber(rollNumber: string): Student | undefined {
  // Try exact match first
  let student = students.find((s) => s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
  if (student) return student;
  
  // Try matching with registration number
  student = students.find((s) => s.regdNo === rollNumber);
  if (student) return student;
  
  // Try partial match (last 5 digits)
  const partial = rollNumber.slice(-5);
  return students.find((s) => s.rollNumber.endsWith(partial) || s.regdNo.endsWith(partial));
}

export function getStudentByRegdNo(regdNo: string): Student | undefined {
  return students.find((s) => s.regdNo === regdNo);
}

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function getTeacherById(id: string): Teacher | undefined {
  return teachers.find((t) => t.id === id);
}

export function getTeacherByEmail(email: string): Teacher | undefined {
  return teachers.find((t) => t.email.toLowerCase() === email.toLowerCase());
}

export function validateTeacherLogin(email: string, password: string): Teacher | null {
  const teacher = teachers.find(
    (t) => t.email.toLowerCase() === email.toLowerCase() && t.password === password
  );
  return teacher || null;
}

export function validateStudentLogin(identifier: string, password: string): Student | null {
  // Try matching by roll number, regd number, or email
  const student = students.find(
    (s) =>
      (s.rollNumber.toLowerCase() === identifier.toLowerCase() ||
       s.regdNo.toLowerCase() === identifier.toLowerCase() ||
       s.email.toLowerCase() === identifier.toLowerCase()) &&
      s.password === password
  );
  return student || null;
}

export function calculateStudentAttendance(studentId: string, subjectId?: string): { total: number; present: number; percentage: number } {
  let filtered = attendanceRecords.filter((r) => r.studentId === studentId);
  
  if (subjectId) {
    filtered = filtered.filter((r) => r.subjectId === subjectId);
  }
  
  const total = filtered.length;
  const present = filtered.filter((r) => r.status === "present").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return { total, present, percentage };
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return attendanceRecords.filter((r) => r.date === date);
}

export function getAbsenteesForDate(date: string): { student: Student; records: AttendanceRecord[] }[] {
  const dateRecords = getAttendanceByDate(date);
  const absenteeMap = new Map<string, AttendanceRecord[]>();
  
  dateRecords.forEach((record) => {
    if (record.status === "absent") {
      if (!absenteeMap.has(record.studentId)) {
        absenteeMap.set(record.studentId, []);
      }
      absenteeMap.get(record.studentId)!.push(record);
    }
  });
  
  return Array.from(absenteeMap.entries()).map(([studentId, records]) => ({
    student: getStudentById(studentId)!,
    records,
  }));
}

export function getChronicAbsentees(threshold: number = 75): { student: Student; attendance: { total: number; present: number; percentage: number } }[] {
  return students
    .map((student) => ({
      student,
      attendance: calculateStudentAttendance(student.id),
    }))
    .filter((item) => item.attendance.percentage < threshold);
}

export function getTimetableForDay(day: string): TimetableEntry[] {
  return timetable.filter(t => t.day === day);
}

export function getCurrentPeriodInfo(): { period: number; subject: Subject | null; timeSlot: TimeSlot } | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const slot of timeSlots) {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const slotStart = startH * 60 + startM;
    const slotEnd = endH * 60 + endM;
    
    if (currentTime >= slotStart && currentTime <= slotEnd) {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = days[now.getDay()];
      const entry = timetable.find(t => t.day === dayName && t.period === slot.period);
      
      return {
        period: slot.period,
        subject: entry?.subjectId ? getSubjectById(entry.subjectId) || null : null,
        timeSlot: slot,
      };
    }
  }
  
  return null;
}

export const ATTENDANCE_THRESHOLD = 75; // Minimum required attendance percentage
export const ROOM_NUMBER = "A33";
export const CLASS_NAME = "3/6 BTECH (CSE)-4, II Semester";
