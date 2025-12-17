import { Shield } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Top Section */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                ProctorAI
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered online examination proctoring system ensuring secure,
              fair, and reliable remote assessments.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-foreground">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Access
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/login/student" className="hover:text-foreground">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/student/help" className="hover:text-foreground">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2025 ProctorAI. All rights reserved.</p>
          <p>Built for secure online examinations using AI-based monitoring.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
