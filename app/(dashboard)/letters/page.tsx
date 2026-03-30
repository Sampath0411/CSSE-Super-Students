"use client";

import { useState, useRef } from "react";
import { getStudentByRollNumber, type Student } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Printer, Download, GraduationCap, Building, Briefcase, CreditCard } from "lucide-react";

type LetterType = "bonafide" | "study" | "loan" | "internship";

interface LetterConfig {
  id: LetterType;
  name: string;
  icon: React.ReactNode;
  description: string;
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

export default function LettersPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<LetterType | "">("");
  const [searchError, setSearchError] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState({
    companyName: "",
    internshipDuration: "",
    loanAmount: "",
    bankName: "",
  });
  const letterRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    setSearchError("");
    const student = getStudentByRollNumber(rollNumber);
    if (student) {
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
      setSearchError("Student not found. Please check the roll number.");
    }
  };

  const handlePrint = () => {
    if (letterRef.current) {
      const printContent = letterRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=800");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Letter</title>
              <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 24px; margin: 0; }
                .header h2 { font-size: 18px; margin: 5px 0; }
                .header p { margin: 5px 0; font-size: 14px; }
                .content { margin: 30px 0; text-align: justify; }
                .signature { margin-top: 60px; text-align: right; }
                .date { margin-top: 20px; }
                .ref-no { text-align: left; margin-bottom: 20px; }
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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const generateRefNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `AU/CSSE/${year}/${random}`;
  };

  const renderLetter = () => {
    if (!selectedStudent || !selectedLetter) return null;

    const refNo = generateRefNumber();
    const currentDate = getCurrentDate();

    const letterContent: Record<LetterType, JSX.Element> = {
      bonafide: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span>Ref. No: {refNo}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">BONAFIDE CERTIFICATE</h3>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{selectedStudent.name}</strong>, bearing Registration Number{" "}
              <strong>{selectedStudent.regdNo}</strong> and Roll Number <strong>{selectedStudent.rollNumber}</strong>,
              is a bonafide student of this department, currently pursuing <strong>{selectedStudent.course}</strong> in{" "}
              <strong>{selectedStudent.branch}</strong>.
            </p>
            <p className="mb-4">
              The student is currently in <strong>Year {selectedStudent.year}</strong>,{" "}
              <strong>Semester {selectedStudent.semester}</strong> of the program. The student was admitted to this
              course on <strong>{new Date(selectedStudent.dateOfAdmission).toLocaleDateString("en-IN")}</strong>.
            </p>
            <p>
              This certificate is issued upon request for whatever purpose it may serve. The student&apos;s conduct and
              character during the period of study has been found to be satisfactory.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      study: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span>Ref. No: {refNo}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">STUDY CERTIFICATE</h3>

          <div className="content text-justify leading-8">
            <p className="mb-4">
              This is to certify that <strong>{selectedStudent.name}</strong>, S/o or D/o of the guardian, bearing
              Registration Number <strong>{selectedStudent.regdNo}</strong>, has been studying in this institution.
            </p>
            <p className="mb-4">
              <strong>Course Details:</strong>
            </p>
            <ul className="list-none mb-4 ml-8">
              <li>
                Program: <strong>{selectedStudent.course}</strong>
              </li>
              <li>
                Branch: <strong>{selectedStudent.branch}</strong>
              </li>
              <li>
                Current Year: <strong>{selectedStudent.year}</strong>
              </li>
              <li>
                Current Semester: <strong>{selectedStudent.semester}</strong>
              </li>
              <li>
                Date of Admission: <strong>{new Date(selectedStudent.dateOfAdmission).toLocaleDateString("en-IN")}</strong>
              </li>
            </ul>
            <p>
              This certificate is issued for the purpose of records and verification. The above information is true to
              the best of our knowledge and records.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      loan: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span>Ref. No: {refNo}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">EDUCATION LOAN ESTIMATION LETTER</h3>

          <p className="mb-4">
            To,
            <br />
            The Branch Manager,
            <br />
            {additionalDetails.bankName || "[Bank Name]"},
            <br />
            [Branch Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Education Loan for {selectedStudent.name} - Estimation of Expenses
          </p>

          <div className="content text-justify leading-8">
            <p className="mb-4">Respected Sir/Madam,</p>
            <p className="mb-4">
              This is to certify that <strong>{selectedStudent.name}</strong>, bearing Registration Number{" "}
              <strong>{selectedStudent.regdNo}</strong>, is a bonafide student of this department pursuing{" "}
              <strong>{selectedStudent.course}</strong> in <strong>{selectedStudent.branch}</strong>.
            </p>
            <p className="mb-4">
              The estimated expenses for the remaining duration of the course are as follows:
            </p>
            <table className="w-full mb-4 border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Tuition Fee (per year)</td>
                  <td className="py-2 text-right">Rs. 45,000/-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Examination Fee (per year)</td>
                  <td className="py-2 text-right">Rs. 5,000/-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Books and Study Materials</td>
                  <td className="py-2 text-right">Rs. 10,000/-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Hostel and Mess (per year)</td>
                  <td className="py-2 text-right">Rs. 60,000/-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Other Expenses</td>
                  <td className="py-2 text-right">Rs. 15,000/-</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Total Estimated Amount</td>
                  <td className="py-2 text-right">Rs. {additionalDetails.loanAmount || "1,35,000"}/-</td>
                </tr>
              </tbody>
            </table>
            <p>
              Kindly consider the above request and grant the necessary education loan to the student. We recommend the
              student for the loan facility.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),

      internship: (
        <div ref={letterRef} className="bg-white text-black p-8 font-serif">
          <div className="header text-center mb-8">
            <h1 className="text-2xl font-bold">ANDHRA UNIVERSITY</h1>
            <h2 className="text-lg">Department of Computer Science and Systems Engineering</h2>
            <p className="text-sm text-gray-600">Visakhapatnam - 530003, Andhra Pradesh, India</p>
          </div>

          <div className="ref-no flex justify-between text-sm mb-6">
            <span>Ref. No: {refNo}</span>
            <span>Date: {currentDate}</span>
          </div>

          <h3 className="text-center text-xl font-bold underline mb-8">INTERNSHIP PERMISSION LETTER</h3>

          <p className="mb-4">
            To,
            <br />
            The HR Manager,
            <br />
            {additionalDetails.companyName || "[Company Name]"},
            <br />
            [Company Address]
          </p>

          <p className="mb-4">
            <strong>Subject:</strong> Permission for Internship - {selectedStudent.name}
          </p>

          <div className="content text-justify leading-8">
            <p className="mb-4">Respected Sir/Madam,</p>
            <p className="mb-4">
              This is to certify that <strong>{selectedStudent.name}</strong>, bearing Registration Number{" "}
              <strong>{selectedStudent.regdNo}</strong> and Roll Number <strong>{selectedStudent.rollNumber}</strong>,
              is a bonafide student of our department, currently pursuing <strong>{selectedStudent.course}</strong> in{" "}
              <strong>{selectedStudent.branch}</strong>, Year {selectedStudent.year}, Semester {selectedStudent.semester}.
            </p>
            <p className="mb-4">
              The student has expressed interest in undertaking an internship at your esteemed organization for a
              duration of <strong>{additionalDetails.internshipDuration || "[Duration]"}</strong>. We hereby grant
              permission for the student to pursue the internship program.
            </p>
            <p className="mb-4">
              The department has no objection to the student participating in the internship, provided it does not
              interfere with the academic schedule and examinations. We request you to provide the necessary training
              and exposure to industry practices.
            </p>
            <p>
              We would appreciate if you could provide a completion certificate upon successful completion of the
              internship.
            </p>
          </div>

          <div className="signature mt-16 text-right">
            <p className="mb-12">Head of the Department</p>
            <p className="font-bold">Dr. Valli Kumari V</p>
            <p>Professor & HOD</p>
            <p>Dept. of CSSE, Andhra University</p>
          </div>
        </div>
      ),
    };

    return letterContent[selectedLetter];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Instant Letter Generator</h1>
          <p className="text-muted-foreground mt-1">Generate official documents with auto-filled student data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Student Search & Letter Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Student
                </CardTitle>
                <CardDescription>Enter roll number to fetch student details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 21CS001"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchError && <p className="text-sm text-destructive mt-2">{searchError}</p>}

                {selectedStudent && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">{selectedStudent.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Roll No:</span> {selectedStudent.rollNumber}
                      </p>
                      <p>
                        <span className="font-medium">Regd No:</span> {selectedStudent.regdNo}
                      </p>
                      <p>
                        <span className="font-medium">Course:</span> {selectedStudent.course}
                      </p>
                      <p>
                        <span className="font-medium">Branch:</span> {selectedStudent.branch}
                      </p>
                      <p>
                        <span className="font-medium">Year/Sem:</span> Year {selectedStudent.year}, Sem{" "}
                        {selectedStudent.semester}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Letter Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Select Document Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {letterTypes.map((letter) => (
                    <button
                      key={letter.id}
                      onClick={() => setSelectedLetter(letter.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                        selectedLetter === letter.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md ${
                          selectedLetter === letter.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {letter.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{letter.name}</p>
                        <p className="text-xs text-muted-foreground">{letter.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details for specific letters */}
            {(selectedLetter === "internship" || selectedLetter === "loan") && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLetter === "internship" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Company Name</label>
                        <Input
                          placeholder="Enter company name"
                          value={additionalDetails.companyName}
                          onChange={(e) =>
                            setAdditionalDetails((prev) => ({ ...prev, companyName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Internship Duration</label>
                        <Input
                          placeholder="e.g., 2 months"
                          value={additionalDetails.internshipDuration}
                          onChange={(e) =>
                            setAdditionalDetails((prev) => ({ ...prev, internshipDuration: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  )}
                  {selectedLetter === "loan" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Bank Name</label>
                        <Input
                          placeholder="Enter bank name"
                          value={additionalDetails.bankName}
                          onChange={(e) =>
                            setAdditionalDetails((prev) => ({ ...prev, bankName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Loan Amount (Rs.)</label>
                        <Input
                          placeholder="e.g., 1,50,000"
                          value={additionalDetails.loanAmount}
                          onChange={(e) =>
                            setAdditionalDetails((prev) => ({ ...prev, loanAmount: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Letter Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>Preview the generated document before printing</CardDescription>
                </div>
                {selectedStudent && selectedLetter && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedStudent && selectedLetter ? (
                  <div className="border border-border rounded-lg overflow-hidden shadow-lg">
                    {renderLetter()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Document Selected</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Search for a student by roll number and select a document type to generate a letter.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
