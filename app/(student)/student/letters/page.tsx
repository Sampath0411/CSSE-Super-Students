"use client";

import { useState, useRef, useEffect } from "react";
import type { Student } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { FileText, Send, GraduationCap, Briefcase, CreditCard, AlertCircle, CheckCircle2, Clock, Download } from "lucide-react";

type LetterType = "bonafide" | "study" | "loan" | "internship";
type RequestStatus = "pending" | "approved" | "rejected";

const LETTER_REQUESTS_KEY = "letter_requests";

interface LetterConfig {
  id: LetterType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface LetterRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  letterType: LetterType;
  status: RequestStatus;
  requestedAt: string;
  additionalDetails?: Record<string, string>;
}

const letterTypes: LetterConfig[] = [
  {
    id: "bonafide",
    name: "Bonafide Certificate",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Certificate confirming student enrollment",
  },
  {
    id: "study",
    name: "Study Certificate",
    icon: <FileText className="h-5 w-5" />,
    description: "Certificate of course completion/study",
  },
  {
    id: "loan",
    name: "Loan Estimation Letter",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Letter for educational loan purposes",
  },
  {
    id: "internship",
    name: "Internship Permission Letter",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Permission letter for internship programs",
  },
];

export default function StudentLettersPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<LetterType | "">("");
  const [additionalDetails, setAdditionalDetails] = useState({
    companyName: "",
    internshipDuration: "",
    loanAmount: "",
    bankName: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [myRequests, setMyRequests] = useState<LetterRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsed = JSON.parse(storedStudent);
      setStudent(parsed);
      loadMyRequests(parsed.id);

      // Listen for storage changes from other tabs
      const handleStorageChange = () => {
        loadMyRequests(parsed.id);
      };
      window.addEventListener("storage", handleStorageChange);

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        loadMyRequests(parsed.id);
      }, 2000);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

  const loadMyRequests = (studentId: string) => {
    const stored = localStorage.getItem(LETTER_REQUESTS_KEY);
    if (stored) {
      const allRequests: LetterRequest[] = JSON.parse(stored);
      const myRequests = allRequests.filter((r) => r.studentId === studentId);
      setMyRequests(myRequests);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownloadLetter = (request: LetterRequest) => {
    const currentDate = new Date(request.requestedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const generateLetterHTML = () => {
      const letterType = request.letterType;
      const additionalDetails = request.additionalDetails || {};

      const content: Record<LetterType, string> = {
        bonafide: `
          <div class="header" style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0;">ANDHRA UNIVERSITY</h1>
            <h2 style="font-size: 18px; margin: 5px 0;">Department of Computer Science and Systems Engineering</h2>
            <p style="margin: 5px 0; font-size: 14px;">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>
          <div style="text-align: right; margin-bottom: 20px; font-size: 14px;">Date: ${currentDate}</div>
          <h3 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">BONAFIDE CERTIFICATE</h3>
          <div style="text-align: justify; line-height: 1.8;">
            <p style="margin-bottom: 16px;">This is to certify that <strong>${student?.name}</strong>, bearing Registration Number <strong>${student?.regdNo}</strong> and Roll Number <strong>${student?.rollNumber}</strong>, is a bonafide student of this department, currently pursuing <strong>${student?.course}</strong> in <strong>${student?.branch}</strong>.</p>
            <p style="margin-bottom: 16px;">The student is currently in <strong>Year ${student?.year}</strong>, <strong>Semester ${student?.semester}</strong> of the program. The student was admitted to this course on <strong>${new Date(student?.dateOfAdmission || "").toLocaleDateString("en-IN")}</strong>.</p>
            <p>This certificate is issued upon request for whatever purpose it may serve. The student's conduct and character during the period of study has been found to be satisfactory.</p>
          </div>
          <div style="margin-top: 60px; text-align: right;">
            <p style="margin-bottom: 48px;">Head of the Department</p>
            <p style="font-weight: bold;">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        `,
        study: `
          <div class="header" style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0;">ANDHRA UNIVERSITY</h1>
            <h2 style="font-size: 18px; margin: 5px 0;">Department of Computer Science and Systems Engineering</h2>
            <p style="margin: 5px 0; font-size: 14px;">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>
          <div style="text-align: right; margin-bottom: 20px; font-size: 14px;">Date: ${currentDate}</div>
          <h3 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">STUDY CERTIFICATE</h3>
          <div style="text-align: justify; line-height: 1.8;">
            <p style="margin-bottom: 16px;">This is to certify that <strong>${student?.name}</strong>, S/o or D/o of the guardian, bearing Registration Number <strong>${student?.regdNo}</strong>, has been studying in this institution.</p>
            <p style="margin-bottom: 16px;"><strong>Course Details:</strong></p>
            <ul style="list-style: none; margin-bottom: 16px; margin-left: 32px;">
              <li>Program: <strong>${student?.course}</strong></li>
              <li>Branch: <strong>${student?.branch}</strong></li>
              <li>Current Year: <strong>${student?.year}</strong></li>
              <li>Current Semester: <strong>${student?.semester}</strong></li>
              <li>Date of Admission: <strong>${new Date(student?.dateOfAdmission || "").toLocaleDateString("en-IN")}</strong></li>
            </ul>
            <p>This certificate is issued for the purpose of records and verification. The above information is true to the best of our knowledge and records.</p>
          </div>
          <div style="margin-top: 60px; text-align: right;">
            <p style="margin-bottom: 48px;">Head of the Department</p>
            <p style="font-weight: bold;">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        `,
        loan: `
          <div class="header" style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0;">ANDHRA UNIVERSITY</h1>
            <h2 style="font-size: 18px; margin: 5px 0;">Department of Computer Science and Systems Engineering</h2>
            <p style="margin: 5px 0; font-size: 14px;">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>
          <div style="text-align: right; margin-bottom: 20px; font-size: 14px;">Date: ${currentDate}</div>
          <h3 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">EDUCATION LOAN ESTIMATION LETTER</h3>
          <p style="margin-bottom: 16px;">To,<br/>The Branch Manager,<br/>${additionalDetails.bankName || "[Bank Name]"},<br/>[Branch Address]</p>
          <p style="margin-bottom: 16px;"><strong>Subject:</strong> Education Loan for ${student?.name} - Estimation of Expenses</p>
          <div style="text-align: justify; line-height: 1.8;">
            <p style="margin-bottom: 16px;">This is to certify that <strong>${student?.name}</strong>, bearing Registration Number <strong>${student?.regdNo}</strong>, is a bonafide student of this department, currently pursuing <strong>${student?.course}</strong> in <strong>${student?.branch}</strong>.</p>
            <p style="margin-bottom: 16px;">The estimated expenses for the course are as follows:</p>
            <ul style="list-style: none; margin-bottom: 16px; margin-left: 32px;">
              <li>Tuition Fee: <strong>Rs. ${additionalDetails.loanAmount || "[Amount]"}</strong></li>
              <li>Other Expenses: <strong>As per actuals</strong></li>
            </ul>
            <p>This letter is issued for the purpose of obtaining an educational loan.</p>
          </div>
          <div style="margin-top: 60px; text-align: right;">
            <p style="margin-bottom: 48px;">Head of the Department</p>
            <p style="font-weight: bold;">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        `,
        internship: `
          <div class="header" style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0;">ANDHRA UNIVERSITY</h1>
            <h2 style="font-size: 18px; margin: 5px 0;">Department of Computer Science and Systems Engineering</h2>
            <p style="margin: 5px 0; font-size: 14px;">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>
          <div style="text-align: right; margin-bottom: 20px; font-size: 14px;">Date: ${currentDate}</div>
          <h3 style="text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">INTERNSHIP PERMISSION LETTER</h3>
          <p style="margin-bottom: 16px;">To,<br/>The HR Manager,<br/>${additionalDetails.companyName || "[Company Name]"},<br/>[Company Address]</p>
          <p style="margin-bottom: 16px;"><strong>Subject:</strong> Permission for Internship - ${student?.name}</p>
          <div style="text-align: justify; line-height: 1.8;">
            <p style="margin-bottom: 16px;">This is to certify that <strong>${student?.name}</strong>, bearing Registration Number <strong>${student?.regdNo}</strong> and Roll Number <strong>${student?.rollNumber}</strong>, is a bonafide student of this department, currently pursuing <strong>${student?.course}</strong> in <strong>${student?.branch}</strong>.</p>
            <p style="margin-bottom: 16px;">The student is permitted to undergo an internship program at your organization for a duration of <strong>${additionalDetails.internshipDuration || "[Duration]"}</strong>.</p>
            <p>We request you to kindly provide the necessary facilities for the internship. This letter is issued with the approval of the Head of the Department.</p>
          </div>
          <div style="margin-top: 60px; text-align: right;">
            <p style="margin-bottom: 48px;">Head of the Department</p>
            <p style="font-weight: bold;">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        `,
      };

      return content[letterType];
    };

    const htmlContent = `
      <html>
        <head>
          <title>${letterTypes.find(t => t.id === request.letterType)?.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 24px; margin: 0; }
            .header h2 { font-size: 18px; margin: 5px 0; }
            .header p { margin: 5px 0; font-size: 14px; }
            @media print {
              body { margin: 0; padding: 20mm; }
            }
          </style>
        </head>
        <body>
          ${generateLetterHTML()}
        </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${request.letterType}_letter_${student?.rollNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleSubmitRequest = () => {
    if (!student || !selectedLetter) return;

    const newRequest: LetterRequest = {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email || "",
      letterType: selectedLetter,
      status: "pending",
      requestedAt: new Date().toISOString(),
      additionalDetails: additionalDetails,
    };

    // Get existing requests
    const stored = localStorage.getItem(LETTER_REQUESTS_KEY);
    const existingRequests: LetterRequest[] = stored ? JSON.parse(stored) : [];

    // Add new request
    existingRequests.push(newRequest);
    localStorage.setItem(LETTER_REQUESTS_KEY, JSON.stringify(existingRequests));

    // Update local state
    loadMyRequests(student.id);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const renderLetterPreview = () => {
    if (!student || !selectedLetter) return null;

    const currentDate = getCurrentDate();

    const letterContent: Record<LetterType, React.ReactElement> = {
      bonafide: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif relative">
          {/* Watermark - AU Official Logo */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            style={{ opacity: 0.15 }}
          >
            <Image
              src="/au-watermark.png"
              alt="Andhra University Official Watermark"
              width={450}
              height={450}
              className="object-contain"
              priority
            />
          </div>

          <div className="header text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-end text-sm mb-6 relative z-10">
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8 relative z-10">BONAFIDE CERTIFICATE</h3>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong> and Roll Number <strong>{student.rollNumber}</strong>,
              is a bonafide student of this department, currently pursuing <strong>{student.course}</strong> in{" "}
              <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is currently in <strong>Year {student.year}</strong>,{" "}
              <strong>Semester {student.semester}</strong> of the program. The student was admitted to this
              course on <strong>{new Date(student.dateOfAdmission).toLocaleDateString("en-IN")}</strong>.
            </p>
            <p>
              This certificate is issued upon request for whatever purpose it may serve. The student&apos;s conduct and
              character during the period of study has been found to be satisfactory.
            </p>
          </div>

          <div className="signature mt-16 text-right relative z-10">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>

        </div>
      ),

      study: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif relative">
          {/* Watermark - AU Official Logo */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            style={{ opacity: 0.15 }}
          >
            <Image
              src="/au-watermark.png"
              alt="Andhra University Official Watermark"
              width={450}
              height={450}
              className="object-contain"
              priority
            />
          </div>

          <div className="header text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-end text-sm mb-6 relative z-10">
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8 relative z-10">STUDY CERTIFICATE</h3>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, S/o or D/o of the guardian, bearing
              Registration Number <strong>{student.regdNo}</strong>, has been studying in this institution.
            </p>
            <p className="mb-4">
              <strong>Course Details:</strong>
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Program: <strong>{student.course}</strong></li>
              <li>Branch: <strong>{student.branch}</strong></li>
              <li>Current Year: <strong>{student.year}</strong></li>
              <li>Current Semester: <strong>{student.semester}</strong></li>
              <li>Date of Admission: <strong>{new Date(student.dateOfAdmission).toLocaleDateString("en-IN")}</strong></li>
            </ul>
            <p>
              This certificate is issued for the purpose of records and verification. The above information is true to
              the best of our knowledge and records.
            </p>
          </div>

          <div className="signature mt-16 text-right relative z-10">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
            This is a preview. Submit request for official letter.
          </div>
        </div>
      ),

      loan: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif relative">
          {/* Watermark - AU Official Logo */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            style={{ opacity: 0.15 }}
          >
            <Image
              src="/au-watermark.png"
              alt="Andhra University Official Watermark"
              width={450}
              height={450}
              className="object-contain"
              priority
            />
          </div>

          <div className="header text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-end text-sm mb-6 relative z-10">
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8 relative z-10">EDUCATION LOAN ESTIMATION LETTER</h3>

          <p className="mb-4">
            To,<br />
            The Branch Manager,<br />
            {additionalDetails.bankName || "[Bank Name]"},<br />
            [Branch Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Education Loan for {student.name} - Estimation of Expenses
          </p>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong>, is a bonafide student of this department, currently pursuing{" "}
              <strong>{student.course}</strong> in <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The estimated expenses for the course are as follows:
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Tuition Fee: <strong>Rs. {additionalDetails.loanAmount || "[Amount]"}</strong></li>
              <li>Other Expenses: <strong>As per actuals</strong></li>
            </ul>
            <p>
              This letter is issued for the purpose of obtaining an educational loan.
            </p>
          </div>

          <div className="signature mt-16 text-right relative z-10">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
            This is a preview. Submit request for official letter.
          </div>
        </div>
      ),

      internship: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif relative">
          {/* Watermark - AU Official Logo */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            style={{ opacity: 0.15 }}
          >
            <Image
              src="/au-watermark.png"
              alt="Andhra University Official Watermark"
              width={450}
              height={450}
              className="object-contain"
              priority
            />
          </div>

          <div className="header text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-end text-sm mb-6 relative z-10">
            <span>Date: {getCurrentDate()}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8 relative z-10">INTERNSHIP PERMISSION LETTER</h3>

          <p className="mb-4">
            To,<br />
            The HR Manager,<br />
            {additionalDetails.companyName || "[Company Name]"},<br />
            [Company Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Permission for Internship - {student.name}
          </p>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{student.name}</strong>, bearing Registration Number{" "}
              <strong>{student.regdNo}</strong> and Roll Number <strong>{student.rollNumber}</strong>, is a bonafide
              student of this department, currently pursuing <strong>{student.course}</strong> in{" "}
              <strong>{student.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is permitted to undergo an internship program at your organization for a duration of{" "}
              <strong>{additionalDetails.internshipDuration || "[Duration]"}</strong>.
            </p>
            <p>
              We request you to kindly provide the necessary facilities for the internship. This letter is issued with
              the approval of the Head of the Department.
            </p>
          </div>

          <div className="signature mt-16 text-right relative z-10">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
            This is a preview. Submit request for official letter.
          </div>
        </div>
      ),
    };

    return letterContent[selectedLetter];
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Letter Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Request official letters and certificates from the department
        </p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Letter request submitted successfully! It will be reviewed by the admin.
          </AlertDescription>
        </Alert>
      )}

      {/* Letter Type Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {letterTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedLetter(type.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedLetter === type.id
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {type.icon}
              </div>
              <span className="font-medium">{type.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </button>
        ))}
      </div>

      {selectedLetter && (
        <>
          {/* Additional Details Form */}
          {selectedLetter === "internship" && (
            <Card>
              <CardHeader>
                <CardTitle>Internship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Name</label>
                    <Input
                      value={additionalDetails.companyName}
                      onChange={(e) =>
                        setAdditionalDetails((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration</label>
                    <Input
                      value={additionalDetails.internshipDuration}
                      onChange={(e) =>
                        setAdditionalDetails((prev) => ({ ...prev, internshipDuration: e.target.value }))
                      }
                      placeholder="e.g., 3 months"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedLetter === "loan" && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bank Name</label>
                    <Input
                      value={additionalDetails.bankName}
                      onChange={(e) =>
                        setAdditionalDetails((prev) => ({ ...prev, bankName: e.target.value }))
                      }
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Loan Amount</label>
                    <Input
                      value={additionalDetails.loanAmount}
                      onChange={(e) =>
                        setAdditionalDetails((prev) => ({ ...prev, loanAmount: e.target.value }))
                      }
                      placeholder="e.g., 500000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Letter Preview (with Watermark)</span>
                <Button size="sm" onClick={handleSubmitRequest}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardTitle>
              <CardDescription>
                Preview your letter before submitting the request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {renderLetterPreview()}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* My Requests */}
      {myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Letter Requests</CardTitle>
            <CardDescription>Track and download your letter requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {letterTypes.find((t) => t.id === request.letterType)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadLetter(request)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
