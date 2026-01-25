"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Menu, Shield, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { toast } from "../ui/use-toast";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register Form State
  const [registerData, setRegisterData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    institution: "",
    program: "",
    semester: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        
        localStorage.setItem("role", data.role);
        
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userName", data.user.fullName);
          localStorage.setItem("userEmail", data.user.email);
        }

        toast({
          title: "Login Successful!",
          description: `Welcome back! Redirecting to ${data.role} dashboard...`,
        });

        // Close dialog
        setLoginOpen(false);

        // Reset form
        setLoginData({
          email: "",
          password: "",
        });

        // Redirect based on role
        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/user/userDashboard";
          }
        }, 1500);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!registerData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: registerData.fullName,
            email: registerData.email,
            password: registerData.password,
            role: "student",
            studentId: registerData.studentId,
            institution: registerData.institution,
            program: registerData.program,
            semester: registerData.semester,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please login.",
        });

        // Reset form and close dialog
        setRegisterData({
          fullName: "",
          studentId: "",
          email: "",
          institution: "",
          program: "",
          semester: "",
          password: "",
          confirmPassword: "",
          acceptTerms: false,
        });
        setRegisterOpen(false);

        // Open login dialog
        setTimeout(() => setLoginOpen(true), 500);
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "User already exists",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">ProctorAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {/* Login Dialog */}
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Login</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleLogin}>
                  <DialogHeader>
                    <DialogTitle>Student Login</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access the AI-powered
                      examination system.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="student@example.com"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-6 flex justify-between items-center">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Register Dialog */}
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button>Get Started</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleRegister}>
                  <DialogHeader>
                    <DialogTitle>Student Registration</DialogTitle>
                    <DialogDescription>
                      Enter your details to register for the AI-powered
                      examination system.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Your full name"
                          value={registerData.fullName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              fullName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          placeholder="LC00017002053"
                          value={registerData.studentId}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              studentId: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="reg-email">Email Address *</Label>
                        <Input
                          id="reg-email"
                          name="email"
                          type="email"
                          placeholder="student@example.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          name="institution"
                          placeholder="Texas College of Management & IT"
                          value={registerData.institution}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              institution: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="program">Program</Label>
                        <Input
                          id="program"
                          name="program"
                          placeholder="BIT (Honours)"
                          value={registerData.program}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              program: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="semester">Semester / Year</Label>
                        <Input
                          id="semester"
                          name="semester"
                          placeholder="6th Semester"
                          value={registerData.semester}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              semester: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="reg-password">Password *</Label>
                        <Input
                          id="reg-password"
                          name="password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password *
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="terms"
                        checked={registerData.acceptTerms}
                        onCheckedChange={(checked) =>
                          setRegisterData({
                            ...registerData,
                            acceptTerms: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="terms">
                        Accept terms and conditions *
                      </Label>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              <Link
                href="#features"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setLoginOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setRegisterOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;