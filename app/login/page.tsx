"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  GraduationCap, 
  UserCog, 
  LogIn, 
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen
} from "lucide-react";
import { validateTeacherLogin, getStudentByRegdNo, getStudentByRollNumber } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Student login state
  const [studentId, setStudentId] = useState("");
  const [studentError, setStudentError] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);

  const handleAdminLogin = async () => {
    setAdminError("");
    setAdminLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const teacher = validateTeacherLogin(adminEmail, adminPassword);
    
    if (teacher) {
      // Store teacher info in sessionStorage
      sessionStorage.setItem("adminUser", JSON.stringify(teacher));
      router.push("/dashboard");
    } else {
      setAdminError("Invalid email or password. Try: aneela@andhrauniversity.edu.in / admin123");
    }
    
    setAdminLoading(false);
  };

  const handleStudentLogin = async () => {
    setStudentError("");
    setStudentLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to find student by registration number or roll number
    let student = getStudentByRegdNo(studentId.trim());
    if (!student) {
      student = getStudentByRollNumber(studentId.trim());
    }
    
    if (student) {
      // Store student info in sessionStorage
      sessionStorage.setItem("studentUser", JSON.stringify(student));
      router.push("/student");
    } else {
      setStudentError("Student not found. Please enter a valid Registration Number (e.g., 3235064022211) or Roll Number (e.g., 22211)");
    }
    
    setStudentLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CSSE Super Student App</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Andhra University - Department of CSSE
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the attendance system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Admin/Faculty
                </TabsTrigger>
              </TabsList>

              {/* Student Login */}
              <TabsContent value="student" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Registration Number / Roll Number</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., 3235064022211 or 22211"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStudentLogin()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your full registration number or last 5 digits
                  </p>
                </div>

                {studentError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{studentError}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleStudentLogin} 
                  className="w-full" 
                  disabled={!studentId.trim() || studentLoading}
                >
                  {studentLoading ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In as Student
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium mb-1">Test Student Accounts:</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>Karedla Tanush Sai: <code className="bg-muted px-1 rounded">3235064022211</code></li>
                    <li>Karnam Nivrutha Naidu: <code className="bg-muted px-1 rounded">22212</code></li>
                    <li>Kiran Malla: <code className="bg-muted px-1 rounded">22229</code></li>
                  </ul>
                </div>
              </TabsContent>

              {/* Admin/Faculty Login */}
              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="faculty@andhrauniversity.edu.in"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {adminError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleAdminLogin} 
                  className="w-full"
                  disabled={!adminEmail.trim() || !adminPassword.trim() || adminLoading}
                >
                  {adminLoading ? (
                    <>
                      <span className="animate-spin mr-2">&#9696;</span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In as Admin
                    </>
                  )}
                </Button>

                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium mb-1">Test Faculty Accounts:</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>Ms. D. Aneela: <code className="bg-muted px-1 rounded">aneela@andhrauniversity.edu.in</code></li>
                    <li>Mrs. B. Sunanda: <code className="bg-muted px-1 rounded">sunanda@andhrauniversity.edu.in</code></li>
                    <li>Password for all: <code className="bg-muted px-1 rounded">admin123</code></li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          3/6 BTECH (CSE)-4, II Semester - Room A33
          <br />
          W.E.F. 19-01-2026
        </p>
      </div>
    </div>
  );
}
