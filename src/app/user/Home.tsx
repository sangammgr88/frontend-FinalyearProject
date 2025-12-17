"use client";

import Link from "next/link";
import {
  Shield,
  Camera,
  Brain,
  BarChart3,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Footer from "@/components/user/footer";
import Navbar from "@/components/user/Navbar";
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6">
            <Brain className="mr-1 h-3 w-3" />
            AI-Powered Proctoring
          </Badge>
          <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Secure Online Exams with AI-Powered Monitoring
          </h1>
          <p className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Empower your educational institution with advanced proctoring
            technology. Detect cheating in real-time, ensure exam integrity, and
            provide a seamless testing experience for students.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-8 border-t pt-10 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">
                Detection Accuracy
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">500K+</div>
              <div className="text-sm text-muted-foreground">
                Exams Monitored
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Institutions</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">
              Everything you need for secure online exams
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Our comprehensive proctoring solution provides advanced AI
              detection, real-time monitoring, and detailed analytics to ensure
              exam integrity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Video Monitoring</CardTitle>
                <CardDescription>
                  Monitor multiple students simultaneously with live video feeds
                  and instant alerts for suspicious behavior.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Detection</CardTitle>
                <CardDescription>
                  Advanced machine learning algorithms detect cheating patterns,
                  multiple faces, phone usage, and suspicious eye movements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Screen Recording</CardTitle>
                <CardDescription>
                  Capture full screen activity, detect tab switching, and
                  monitor browser behavior during exams.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Browser Lockdown</CardTitle>
                <CardDescription>
                  Restrict access to external resources, disable copy-paste, and
                  prevent unauthorized applications during exams.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Get comprehensive reports on exam performance, violation
                  trends, and student behavior patterns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>
                  Receive real-time notifications for violations, suspicious
                  activities, and critical events during exams.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">
              Simple process, powerful results
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Get started in minutes with our intuitive platform designed for
              both administrators and students.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Create Exam</h3>
              <p className="text-sm text-muted-foreground">
                Set up your exam with questions, duration, and proctoring rules
                in minutes.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Student Setup</h3>
              <p className="text-sm text-muted-foreground">
                Students verify their identity and complete system checks before
                starting.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Our AI continuously monitors for violations and alerts proctors
                in real-time.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                4
              </div>
              <h3 className="mb-2 text-xl font-semibold">Review Results</h3>
              <p className="text-sm text-muted-foreground">
                Access detailed reports, recordings, and violation logs for
                thorough review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t bg-muted/50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">
              Flexible plans for every institution
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Choose the perfect plan for your needs. All plans include core
              proctoring features.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>
                  Perfect for small institutions
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Up to 100 students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Basic AI detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Video recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <Link href="/register" className="mt-6 block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg">
              <CardHeader>
                <Badge className="mb-2 w-fit">Most Popular</Badge>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing institutions</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$299</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Up to 500 students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Advanced AI detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Live monitoring dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Custom branding</span>
                  </li>
                </ul>
                <Link href="/register" className="mt-6 block">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large institutions</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Unlimited students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">All AI features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">24/7 phone support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                </ul>
                <Link href="/register" className="mt-6 block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">
              Trusted by leading institutions
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              See what educators and administrators say about ProctorAI.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "ProctorAI has transformed how we conduct online exams. The AI
                  detection is incredibly accurate, and the interface is
                  intuitive for both staff and students."
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    JD
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Dr. John Davis</div>
                    <div className="text-xs text-muted-foreground">
                      Dean, Stanford University
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "The real-time monitoring dashboard is a game-changer. We can
                  now proctor hundreds of students simultaneously with
                  confidence. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    SM
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Sarah Mitchell</div>
                    <div className="text-xs text-muted-foreground">
                      Exam Coordinator, MIT
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "Implementation was seamless, and the support team was
                  excellent. The detailed analytics help us identify and prevent
                  cheating more effectively than ever."
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    RP
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Robert Patel</div>
                    <div className="text-xs text-muted-foreground">
                      IT Director, Oxford College
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            <h2 className="mb-4 max-w-3xl text-balance text-3xl font-bold md:text-5xl">
              Ready to secure your online exams?
            </h2>
            <p className="mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
              Join thousands of institutions using ProctorAI to maintain exam
              integrity. Start your free trial today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
