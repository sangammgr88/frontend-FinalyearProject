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

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant="outline">Login</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-100">
                  <DialogHeader>
                    <DialogTitle>Student Login</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access the AI-powered
                      examination system.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="student@example.com"
                      />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" />
                    </div>
                  </div>

                  <DialogFooter className="mt-6 flex justify-between items-center">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Login</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>

            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant="outline">Get Started</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-125">
                  <DialogHeader>
                    <DialogTitle>Student Registration</DialogTitle>
                    <DialogDescription>
                      Enter your details to register for the AI-powered
                      examination system.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Your full name"
                        />
                      </div>

                      {/* Student ID */}
                      <div className="grid gap-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          placeholder="LC00017002053"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="student@example.com"
                        />
                      </div>

                      {/* Institution */}
                      <div className="grid gap-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          name="institution"
                          placeholder="Texas College of Management & IT"
                        />
                      </div>
                    </div>

                    {/* Program */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="program">Program</Label>
                        <Input
                          id="program"
                          name="program"
                          placeholder="BIT (Honours)"
                        />
                      </div>

                      {/* Semester */}
                      <div className="grid gap-2">
                        <Label htmlFor="semester">Semester / Year</Label>
                        <Input
                          id="semester"
                          name="semester"
                          placeholder="6th Semester"
                        />
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="grid gap-2">
                      <Label htmlFor="photo">Profile Photo</Label>
                      <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                      />
                    </div>
                    {/* Password */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" />
                      </div>

                      {/* Confirm Password */}
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                        />
                      </div>
                    </div>

                    {/* Consent */}

                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms">
                          Accept terms and conditions
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Register</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
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
                <Link href="/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Dialog>
                  <form>
                    <DialogTrigger asChild>
                      <Button variant="outline">Get Started</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-125">
                      <DialogHeader>
                        <DialogTitle>Student Registration</DialogTitle>
                        <DialogDescription>
                          Enter your details to register for the AI-powered
                          examination system.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              placeholder="Your full name"
                            />
                          </div>

                          {/* Student ID */}
                          <div className="grid gap-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                              id="studentId"
                              name="studentId"
                              placeholder="LC00017002053"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="student@example.com"
                            />
                          </div>

                          {/* Institution */}
                          <div className="grid gap-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Input
                              id="institution"
                              name="institution"
                              placeholder="Texas College of Management & IT"
                            />
                          </div>
                        </div>

                        {/* Program */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="program">Program</Label>
                            <Input
                              id="program"
                              name="program"
                              placeholder="BIT (Honours)"
                            />
                          </div>

                          {/* Semester */}
                          <div className="grid gap-2">
                            <Label htmlFor="semester">Semester / Year</Label>
                            <Input
                              id="semester"
                              name="semester"
                              placeholder="6th Semester"
                            />
                          </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="grid gap-2">
                          <Label htmlFor="photo">Profile Photo</Label>
                          <Input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                          />
                        </div>
                        {/* Password */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                            />
                          </div>

                          {/* Confirm Password */}
                          <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">
                              Confirm Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                            />
                          </div>
                        </div>

                        {/* Consent */}

                        <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-3">
                            <Checkbox id="terms" />
                            <Label htmlFor="terms">
                              Accept terms and conditions
                            </Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Register</Button>
                      </DialogFooter>
                    </DialogContent>
                  </form>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
