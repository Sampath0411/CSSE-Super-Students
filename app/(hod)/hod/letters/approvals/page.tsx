"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getStudentById, type Student } from "@/lib/data";
import { addNotification } from "@/lib/notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Printer,
  Download,
  GraduationCap,
  Briefcase,
  CreditCard,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LetterType = "bonafide" | "study" | "loan" | "internship";
type RequestStatus = "pending" | "approved" | "rejected";

const LETTER_REQUESTS_KEY = "letter_requests";
const APPROVED_LETTERS_KEY = "approved_letters";

interface LetterRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  letterType: LetterType;
  status: RequestStatus;
  requestedAt: string;
  additionalDetails?: Record<string, string>;
  adminNotes?: string;
  processedAt?: string;
}

const letterTypes = {
  bonafide: { name: "Bonafide Certificate", icon: GraduationCap },
  study: { name: "Study Certificate", icon: FileText },
  loan: { name: "Loan Estimation Letter", icon: CreditCard },
  internship: { name: "Internship Permission Letter", icon: Briefcase },
};

export default function LetterApprovalsPage() {
  const [requests, setRequests] = useState<LetterRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LetterRequest | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | "view" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRequests();

    // Listen for storage changes from other tabs
    const handleStorageChange = () => {
      loadRequests();
    };
    window.addEventListener("storage", handleStorageChange);

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      loadRequests();
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadRequests = () => {
    const stored = localStorage.getItem(LETTER_REQUESTS_KEY);
    if (stored) {
      const allRequests: LetterRequest[] = JSON.parse(stored);
      setRequests(allRequests);
    }
  };

  const handleApprove = (request: LetterRequest) => {
    setSelectedRequest(request);
    setStudentDetails(getStudentById(request.studentId));
    setAdminNotes("");
    setDialogMode("approve");
    setShowDialog(true);
  };

  const handleReject = (request: LetterRequest) => {
    setSelectedRequest(request);
    setStudentDetails(getStudentById(request.studentId));
    setAdminNotes("");
    setDialogMode("reject");
    setShowDialog(true);
  };

  const handleView = (request: LetterRequest) => {
    setSelectedRequest(request);
    setStudentDetails(getStudentById(request.studentId));
    setDialogMode("view");
    setShowDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;

    const processedAt = new Date().toISOString();

    // Update request status
    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id
        ? { ...req, status: "approved" as const, adminNotes, processedAt }
        : req
    );

    // Save to localStorage
    localStorage.setItem(LETTER_REQUESTS_KEY, JSON.stringify(updatedRequests));

    // Add to approved letters history
    const approvedLetter = {
      ...selectedRequest,
      status: "approved" as const,
      adminNotes,
      processedAt,
    };
    const storedApproved = localStorage.getItem(APPROVED_LETTERS_KEY);
    const approvedLetters = storedApproved ? JSON.parse(storedApproved) : [];
    approvedLetters.push(approvedLetter);
    localStorage.setItem(APPROVED_LETTERS_KEY, JSON.stringify(approvedLetters));

    // Create notification for student
    const letterTypeNames: Record<LetterType, string> = {
      bonafide: "Bonafide Certificate",
      study: "Study Certificate",
      loan: "Loan Estimation Letter",
      internship: "Internship Permission Letter",
    };

    addNotification({
      studentId: selectedRequest.studentId,
      type: "letter_approved",
      title: "Letter Request Approved",
      message: `Your ${letterTypeNames[selectedRequest.letterType]} has been approved. You can download your official letter from the Letters page.`,
      letterRequestId: selectedRequest.id,
      letterType: selectedRequest.letterType,
    });

    setRequests(updatedRequests);
    setShowDialog(false);
    setSuccessMessage(`Letter approved! Notification sent to student.`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const confirmRejection = () => {
    if (!selectedRequest) return;

    const processedAt = new Date().toISOString();

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id
        ? { ...req, status: "rejected" as const, adminNotes, processedAt }
        : req
    );

    localStorage.setItem(LETTER_REQUESTS_KEY, JSON.stringify(updatedRequests));

    // Create notification for student
    const letterTypeNames: Record<LetterType, string> = {
      bonafide: "Bonafide Certificate",
      study: "Study Certificate",
      loan: "Loan Estimation Letter",
      internship: "Internship Permission Letter",
    };

    addNotification({
      studentId: selectedRequest.studentId,
      type: "letter_rejected",
      title: "Letter Request Rejected",
      message: `Your request for ${letterTypeNames[selectedRequest.letterType]} has been rejected. ${adminNotes ? `Reason: ${adminNotes}` : "Please contact the department for more information."}`,
      letterRequestId: selectedRequest.id,
    });

    setRequests(updatedRequests);
    setShowDialog(false);
    setSuccessMessage(`Letter request rejected. Notification sent to student.`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrintOfficial = () => {
    if (letterRef.current) {
      const printContent = letterRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=800");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Official Letter</title>
              <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 24px; margin: 0; }
                .header h2 { font-size: 18px; margin: 5px 0; }
                .header p { margin: 5px 0; font-size: 14px; }
                .content { margin: 30px 0; text-align: justify; }
                .signature { margin-top: 60px; text-align: right; }
                .ref-no { text-align: right; margin-bottom: 20px; }
                @media print {
                  body { margin: 0; padding: 20mm; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const renderOfficialLetter = () => {
    if (!studentDetails || !selectedRequest) return null;

    const currentDate = getCurrentDate();
    const { letterType, additionalDetails } = selectedRequest;

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
              This is to certify that <strong>{studentDetails.name}</strong>, bearing Registration Number{" "}
              <strong>{studentDetails.regdNo}</strong> and Roll Number <strong>{studentDetails.rollNumber}</strong>,
              is a bonafide student of this department, currently pursuing <strong>{studentDetails.course}</strong> in{" "}
              <strong>{studentDetails.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is currently in <strong>Year {studentDetails.year}</strong>,{" "}
              <strong>Semester {studentDetails.semester}</strong> of the program. The student was admitted to this
              course on <strong>{new Date(studentDetails.dateOfAdmission).toLocaleDateString("en-IN")}</strong>.
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
              This is to certify that <strong>{studentDetails.name}</strong>, S/o or D/o of the guardian, bearing
              Registration Number <strong>{studentDetails.regdNo}</strong>, has been studying in this institution.
            </p>
            <p className="mb-4">
              <strong>Course Details:</strong>
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Program: <strong>{studentDetails.course}</strong></li>
              <li>Branch: <strong>{studentDetails.branch}</strong></li>
              <li>Current Year: <strong>{studentDetails.year}</strong></li>
              <li>Current Semester: <strong>{studentDetails.semester}</strong></li>
              <li>Date of Admission: <strong>{new Date(studentDetails.dateOfAdmission).toLocaleDateString("en-IN")}</strong></li>
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
            {additionalDetails?.bankName || "[Bank Name]"},<br />
            [Branch Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Education Loan for {studentDetails.name} - Estimation of Expenses
          </p>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{studentDetails.name}</strong>, bearing Registration Number{" "}
              <strong>{studentDetails.regdNo}</strong>, is a bonafide student of this department, currently pursuing{" "}
              <strong>{studentDetails.course}</strong> in <strong>{studentDetails.branch}</strong>.
            </p>
            <p className="mb-4">
              The estimated expenses for the course are as follows:
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>Tuition Fee: <strong>Rs. {additionalDetails?.loanAmount || "[Amount]"}</strong></li>
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
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8 relative z-10">INTERNSHIP PERMISSION LETTER</h3>

          <p className="mb-4">
            To,<br />
            The HR Manager,<br />
            {additionalDetails?.companyName || "[Company Name]"},<br />
            [Company Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Permission for Internship - {studentDetails.name}
          </p>

          <div className="content text-justify leading-8 relative z-10">
            <p className="mb-4">
              This is to certify that <strong>{studentDetails.name}</strong>, bearing Registration Number{" "}
              <strong>{studentDetails.regdNo}</strong> and Roll Number <strong>{studentDetails.rollNumber}</strong>, is a bonafide
              student of this department, currently pursuing <strong>{studentDetails.course}</strong> in{" "}
              <strong>{studentDetails.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is permitted to undergo an internship program at your organization for a duration of{" "}
              <strong>{additionalDetails?.internshipDuration || "[Duration]"}</strong>.
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
        </div>
      ),
    };

    return letterContent[letterType];
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  const RequestCard = ({ request }: { request: LetterRequest }) => (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{request.studentName}</h4>
            {getStatusBadge(request.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {letterTypes[request.letterType].name}
          </p>
          <p className="text-xs text-muted-foreground">
            Requested: {new Date(request.requestedAt).toLocaleDateString()}
          </p>
          {request.adminNotes && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Note: {request.adminNotes}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {request.status === "pending" ? (
            <>
              <Button size="sm" variant="outline" onClick={() => handleView(request)}>
                <Search className="h-4 w-4" />
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request)}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleReject(request)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleView(request)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Letter Request Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve student letter requests
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and approve pending letter requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Letters</CardTitle>
                <CardDescription>View approved letter requests with serial numbers</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approved letters yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedRequests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Requests</CardTitle>
                <CardDescription>View rejected letter requests</CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rejected requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rejectedRequests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog for Approve/Reject/View */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "approve" && "Approve Letter Request"}
                {dialogMode === "reject" && "Reject Letter Request"}
                {dialogMode === "view" && "View Letter Request"}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <span>
                    {selectedRequest.studentName} - {letterTypes[selectedRequest.letterType].name}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {studentDetails && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Student Details</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {studentDetails.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedRequest?.studentEmail}</p>
                    <p><span className="text-muted-foreground">Roll No:</span> {studentDetails.rollNumber}</p>
                    <p><span className="text-muted-foreground">Regd No:</span> {studentDetails.regdNo}</p>
                    <p><span className="text-muted-foreground">Course:</span> {studentDetails.course}</p>
                    <p><span className="text-muted-foreground">Branch:</span> {studentDetails.branch}</p>
                    <p><span className="text-muted-foreground">Year:</span> Year {studentDetails.year}</p>
                    <p><span className="text-muted-foreground">Semester:</span> Sem {studentDetails.semester}</p>
                  </div>
                </div>

                {/* Additional Details */}
                {selectedRequest?.additionalDetails && Object.keys(selectedRequest.additionalDetails).length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Additional Details</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedRequest.additionalDetails)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => (
                          <p key={key}>
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                {/* Official Letter Preview (for approved) */}
                {(dialogMode === "view" && selectedRequest?.status === "approved") || dialogMode === "approve" ? (
                  <div>
                    <h4 className="font-semibold mb-2">
                      {dialogMode === "approve" ? "Official Letter Preview (will be generated)" : "Official Letter"}
                    </h4>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      {renderOfficialLetter()}
                    </div>
                  </div>
                ) : null}

                {/* Admin Notes */}
                {(dialogMode === "approve" || dialogMode === "reject") && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Admin Notes {dialogMode === "reject" && "(required)"}
                    </label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder={dialogMode === "approve"
                        ? "Add any notes about this approval (optional)"
                        : "Reason for rejection (required)"
                      }
                      rows={3}
                    />
                  </div>
                )}

                {/* Previous admin notes */}
                {dialogMode === "view" && selectedRequest?.adminNotes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Admin Notes:</strong> {selectedRequest.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
              {dialogMode === "approve" && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={confirmApproval}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Approval
                </Button>
              )}
              {dialogMode === "reject" && (
                <Button
                  variant="destructive"
                  onClick={confirmRejection}
                  disabled={!adminNotes.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </Button>
              )}
              {dialogMode === "view" && selectedRequest?.status === "approved" && (
                <Button onClick={handlePrintOfficial}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Official Letter
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
