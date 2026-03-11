"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Flag,
  AlertTriangle, Eye, EyeOff, Camera, CameraOff, Users, UserX,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
} from "lucide-react";

interface Option { text: string; isCorrect: boolean; }
interface Question {
  _id: string; questionText: string; questionType: "mcq" | "text";
  points: number; difficulty: "easy" | "medium" | "hard"; options?: Option[];
}
interface Exam {
  _id: string; examTitle: string; description?: string; duration: number;
  totalMarks: number; passingMarks?: number; subject?: string;
  questions: Question[]; isActive: boolean;
}
interface Answer { questionId: string; answer: string | string[]; flagged: boolean; }

// ── Head movement counts ───────────────────────────────────────────────────
interface HeadMovementCounts {
  left: number;   // yaw_left
  right: number;  // yaw_right
  up: number;     // pitch_up
  down: number;   // pitch_down
  tilt_left: number;   // roll_left
  tilt_right: number;  // roll_right
  no_face: number;
  multiple_faces: number;
}

const INITIAL_COUNTS: HeadMovementCounts = {
  left: 0, right: 0, up: 0, down: 0,
  tilt_left: 0, tilt_right: 0,
  no_face: 0, multiple_faces: 0,
};

// ── Cheating threshold ─────────────────────────────────────────────────────
const CHEAT_THRESHOLD = 5; // flag as cheating after 5 moves in any direction

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

const TakeExamPage = () => {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tab proctoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitches, setTabSwitches] = useState<Array<{ timestamp: string; duration: number }>>([]);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [currentViolation, setCurrentViolation] = useState("");
  const tabLeftTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>("");

  // Head detection
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevReasonRef = useRef<string | null>(null);
  const prevNoFaceRef = useRef(false);
  const prevMultiFaceRef = useRef(false);

  const [wsStatus, setWsStatus] = useState<"Connected" | "Disconnected" | "Error">("Disconnected");
  const [cameraReady, setCameraReady] = useState(false);
  const [headFlags, setHeadFlags] = useState({
    looking_away: false, reason: null as string | null,
    multiple_faces: false, no_face: false, calibrated: false,
  });
  const [headCounts, setHeadCounts] = useState<HeadMovementCounts>({ ...INITIAL_COUNTS });

  // ── Cheating state ─────────────────────────────────────────────────────
  const [isCheating, setIsCheating] = useState(false);
  const [cheatingDirections, setCheatingDirections] = useState<string[]>([]);
  const [showCheatDialog, setShowCheatDialog] = useState(false);
  const [cheatDialogMessage, setCheatDialogMessage] = useState("");
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => { fetchExamDetails(); }, [examId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => { if (prev <= 1) { handleAutoSubmit(); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (videoRef.current?.srcObject)
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!examStarted) return;
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      if (!isVisible) {
        tabLeftTimeRef.current = Date.now();
        setCurrentViolation("Tab switched or window minimized");
        setShowViolationWarning(true);
        logProctorEvent("tab_switch", "high", "Student switched tabs");
      } else if (tabLeftTimeRef.current) {
        const duration = Math.round((Date.now() - tabLeftTimeRef.current) / 1000);
        setTabSwitches((prev) => [...prev, { timestamp: new Date().toISOString(), duration }]);
        setTabSwitchCount((prev) => prev + 1);
        tabLeftTimeRef.current = null;
        toast({ title: "Violation Detected", description: `You left for ${duration}s. Logged.`, variant: "destructive" });
      }
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); toast({ title: "Action Blocked", description: "Copying is disabled", variant: "destructive" }); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); toast({ title: "Action Blocked", description: "Pasting is disabled", variant: "destructive" }); };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "Leave exam?"; return e.returnValue; };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [examStarted]);

  // ── Log event to Node backend ─────────────────────────────────────────
  const logProctorEvent = async (
    eventType: string, severity: string, description: string,
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/proctor/log-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId: sessionIdRef.current, examId: exam?._id,
          eventType, severity, description,
          timestamp: new Date().toISOString(), metadata,
        }),
      });
    } catch (error) { console.error("Error logging proctor event:", error); }
  };

  // ── Check if any direction exceeds cheat threshold ────────────────────
  const checkCheating = (counts: HeadMovementCounts, newDirection: string, newCount: number) => {
    if (newCount >= CHEAT_THRESHOLD) {
      const label =
        newDirection === "left" ? "Left" :
        newDirection === "right" ? "Right" :
        newDirection === "up" ? "Up" :
        newDirection === "down" ? "Down" :
        newDirection === "tilt_left" ? "Tilt Left" : "Tilt Right";

      // Only trigger if not already flagged for this direction
      setCheatingDirections((prev) => {
        if (prev.includes(newDirection)) return prev;
        const updated = [...prev, newDirection];

        setIsCheating(true);
        setCheatDialogMessage(`Head moved ${label} ${newCount} times — this exceeds the allowed limit and has been flagged as cheating.`);
        setShowCheatDialog(true);

        // Log cheating event to backend
        logProctorEvent("cheating_detected", "critical",
          `Cheating detected: head moved ${label} ${newCount} times`, {
            direction: newDirection, count: newCount,
            all_counts: counts,
          }
        );

        toast({
          title: "🚨 Cheating Detected!",
          description: `Head moved ${label} ${newCount}+ times. This is recorded.`,
          variant: "destructive",
        });

        return updated;
      });
    }
  };

  // ── Start camera + Python WebSocket ──────────────────────────────────
  const startHeadDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setCameraReady(true); }
    } catch (e) {
      toast({ title: "Camera Required", description: "Please allow camera access and refresh.", variant: "destructive" });
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
ws.onopen = () => {
  setWsStatus("Connected");
  const token = localStorage.getItem("token");
  ws.send(JSON.stringify({
    type:       "auth",
    token:      token,
    session_id: sessionIdRef.current,
  }));
};
    ws.onclose = () => setWsStatus("Disconnected");
    ws.onerror = () => setWsStatus("Error");

    ws.onmessage = async (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === "pose") {
          const reason: string | null = msg.reason ?? null;
          const noFace: boolean = msg.no_face ?? false;
          const multiFace: boolean = msg.multiple_faces ?? false;

          setHeadFlags({
            looking_away: msg.looking_away ?? false, reason,
            multiple_faces: multiFace, no_face: noFace, calibrated: msg.calibrated ?? false,
          });

          // ── Count only NEW direction change (edge detection) ─────────
          if (reason && reason !== prevReasonRef.current) {
            // Map Python reason → our key
            const dirMap: Record<string, keyof HeadMovementCounts> = {
              yaw_left:   "left",
              yaw_right:  "right",
              pitch_up:   "up",
              pitch_down: "down",
              roll_left:  "tilt_left",
              roll_right: "tilt_right",
            };
            const dirKey = dirMap[reason];

            if (dirKey) {
              setHeadCounts((prev) => {
                const newCount = prev[dirKey] + 1;
                const updated = { ...prev, [dirKey]: newCount };

                // ✅ Check cheating threshold
                checkCheating(updated, dirKey, newCount);

                // Log each movement to backend
                logProctorEvent("head_movement", "medium",
                  `Head moved ${dirKey.replace("_", " ")}: total ${newCount}`, {
                    direction: dirKey, count: newCount,
                    yaw: msg.yaw, pitch: msg.pitch, roll: msg.roll,
                  }
                );

                return updated;
              });
            }
          }

          if (noFace && !prevNoFaceRef.current) {
            setHeadCounts((prev) => ({ ...prev, no_face: prev.no_face + 1 }));
            await logProctorEvent("no_face", "high", "No face detected");
          }
          if (multiFace && !prevMultiFaceRef.current) {
            setHeadCounts((prev) => ({ ...prev, multiple_faces: prev.multiple_faces + 1 }));
            await logProctorEvent("multiple_faces", "high", "Multiple faces detected");
          }

          prevReasonRef.current = reason;
          prevNoFaceRef.current = noFace;
          prevMultiFaceRef.current = multiFace;
        }

        // Prolonged warning from Python
        if (msg.type === "event" && msg.severity === "warning") {
          await logProctorEvent(msg.event, "high", `Prolonged: ${msg.event}`, { duration: msg.duration });
          toast({ title: "⚠️ Head Movement Warning", description: `Looking away for ${msg.duration}s — recorded.`, variant: "destructive" });
        }
      } catch (e) { console.error("WS parse error:", e); }
    };

    // Send frames every 200ms
    frameIntervalRef.current = setInterval(() => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (!video || !canvas || ws.readyState !== WebSocket.OPEN) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => { if (blob) ws.send(await blob.arrayBuffer()); }, "image/jpeg", 0.6);
    }, 200);
  };

  const fetchExamDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/"); return; }
      const response = await fetch(`${API_BASE_URL}/api/exam/${examId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        if (!data.data.isActive) { router.push("/user/userDashboard"); return; }
        setExam(data.data);
        setTimeRemaining(data.data.duration * 60);
        setAnswers(data.data.questions.map((q: Question) => ({ questionId: q._id, answer: "", flagged: false })));
      } else { router.push("/user/userDashboard"); }
    } catch { router.push("/user/userDashboard"); }
    finally { setLoading(false); }
  };

  const handleStartExam = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = sessionId;
    setExamStarted(true);
    setTimerActive(true);
    startProctorSession(sessionId);
    startHeadDetection();
    toast({ title: "Exam Started!", description: `${exam?.duration} minutes. Camera proctoring active.` });
  };

  const startProctorSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/proctor/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, examId: exam?._id, startTime: new Date().toISOString() }),
      });
    } catch (error) { console.error(error); }
  };

  const handleAnswerChange = (questionId: string, answer: string) =>
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, answer } : a)));

  const toggleFlag = (questionId: string) =>
    setAnswers((prev) => prev.map((a) => (a.questionId === questionId ? { ...a, flagged: !a.flagged } : a)));

  const getCurrentAnswer = () => {
    if (!exam) return null;
    return answers.find((a) => a.questionId === exam.questions[currentQuestionIndex]._id);
  };

  const handleAutoSubmit = () => {
    toast({ title: "Time's Up!", description: "Auto-submitting...", variant: "destructive" });
    setTimerActive(false);
    submitExam();
  };

  const getTotalMoves = (c = headCounts) => c.left + c.right + c.up + c.down + c.tilt_left + c.tilt_right;

  const submitExam = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      let score = 0;
      answers.forEach((answer) => {
        const question = exam?.questions.find((q) => q._id === answer.questionId);
        if (question?.questionType === "mcq") {
          const correct = question.options?.find((opt) => opt.isCorrect);
          if (correct && correct.text === answer.answer) score += question.points;
        }
      });
if (token) {
  const payload = token.split('.')[1]; // get middle part
  const decodedPayload = JSON.parse(atob(payload));

  console.log(decodedPayload); // full payload
  console.log(decodedPayload.id); // your user id
}
      // ✅ Full head movement data sent to backend
      const headMovements = {
        left:           headCounts.left,
        right:          headCounts.right,
        up:             headCounts.up,
        down:           headCounts.down,
        tilt_left:      headCounts.tilt_left,
        tilt_right:     headCounts.tilt_right,
        no_face:        headCounts.no_face,
        multiple_faces: headCounts.multiple_faces,
        total:          getTotalMoves(),
        cheating_detected: isCheating,
        cheating_directions: cheatingDirections,
      };

      const response = await fetch(`${API_BASE_URL}/api/result/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          examId: exam?._id, studentId: userId,
          answers, score, totalMarks: exam?.totalMarks,
          violationCount: tabSwitchCount, tabSwitches,
          headMovements,
          submittedAt: new Date().toISOString(),
        }),
      });
    // const token = localStorage.getItem("token");


      const data = await response.json();
      if (data.success || response.ok) {
        if (wsRef.current) wsRef.current.close();
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        await logProctorEvent("exam_completed", "low", "Exam submitted", { headMovements, tabSwitches: tabSwitchCount, score });
        toast({ title: "Exam Submitted!", description: `Score: ${score}/${exam?.totalMarks} | Head moves: ${getTotalMoves()} | Cheating: ${isCheating ? "YES" : "No"}` });
        setTimeout(() => router.push(`/user/results/${exam?._id}`), 2000);
      } else {
        toast({ title: "Submission Failed", description: data.message || "Try again", variant: "destructive" });
      }
    } catch { toast({ title: "Submission Error", description: "Failed to submit.", variant: "destructive" }); }
    finally { setSubmitting(false); setShowSubmitDialog(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const getProgress = () => !exam ? 0 : (answers.filter((a) => a.answer !== "").length / exam.questions.length) * 100;
  const getAnsweredCount = () => answers.filter((a) => a.answer !== "").length;
  const getFlaggedCount = () => answers.filter((a) => a.flagged).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading exam...</p>
      </div>
    </div>
  );

  if (!exam) return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md"><CardContent className="pt-6 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Exam not found</p>
        <Button className="mt-4" onClick={() => router.push("/user/userDashboard")}>Back to Dashboard</Button>
      </CardContent></Card>
    </div>
  );

  if (!examStarted) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{exam.examTitle}</CardTitle>
          <CardDescription>{exam.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div><p className="text-sm text-muted-foreground">Questions</p><p className="text-2xl font-bold">{exam.questions.length}</p></div>
            <div><p className="text-sm text-muted-foreground">Duration</p><p className="text-2xl font-bold">{exam.duration} min</p></div>
            <div><p className="text-sm text-muted-foreground">Total Marks</p><p className="text-2xl font-bold">{exam.totalMarks}</p></div>
            <div><p className="text-sm text-muted-foreground">Pass Marks</p><p className="text-2xl font-bold">{exam.passingMarks || "N/A"}</p></div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Instructions:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>You have {exam.duration} minutes to complete this exam</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>Once submitted, you cannot change your answers</span></li>
              <li className="flex items-start gap-2"><AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" /><span><strong>Camera and head movements</strong> are monitored and recorded</span></li>
              <li className="flex items-start gap-2"><AlertCircle className="h-5 w-5 text-red-500 mt-0.5" /><span>Moving your head in one direction more than <strong>{CHEAT_THRESHOLD} times</strong> will be flagged as cheating</span></li>
              <li className="flex items-start gap-2"><AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" /><span>Do not switch tabs, copy, paste, or right-click</span></li>
            </ul>
          </div>
          <Button size="lg" className="w-full" onClick={handleStartExam}>Start Exam (Camera will activate)</Button>
        </CardContent>
      </Card>
    </div>
  );

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">{exam.examTitle}</h1>
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Cheating badge */}
              {isCheating && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-red-600 rounded-lg animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">CHEATING DETECTED</span>
                </div>
              )}

              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">{tabSwitchCount} tab violations</span>
                </div>
              )}

              <div className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg">
                {isTabVisible
                  ? <><Eye className="h-4 w-4 text-green-600" /><span className="text-sm text-green-600 font-medium">Active</span></>
                  : <><EyeOff className="h-4 w-4 text-red-600" /><span className="text-sm text-red-600 font-medium">Away</span></>
                }
              </div>

              {/* Camera preview */}
              <div className="relative flex-shrink-0">
                <video ref={videoRef} autoPlay playsInline muted
                  className="w-40 h-26 rounded-lg bg-black object-cover border-2"
                  style={{
                    borderColor: isCheating ? "#dc2626"
                      : headFlags.multiple_faces || headFlags.no_face ? "#ef4444"
                      : headFlags.looking_away ? "#f97316"
                      : wsStatus === "Connected" ? "#22c55e" : "#6b7280",
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white ${wsStatus === "Connected" ? "bg-green-500" : wsStatus === "Error" ? "bg-red-500" : "bg-gray-400"}`} />
                {wsStatus === "Connected" && !headFlags.calibrated && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] px-1 rounded">Calibrating…</div>
                )}
                {isCheating && (
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1 rounded font-bold">CHEAT</div>
                )}
                {!isCheating && headFlags.multiple_faces && (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-red-500 text-white text-[10px] px-1 rounded"><Users className="w-3 h-3" />Multi</div>
                )}
                {!isCheating && headFlags.no_face && (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-red-500 text-white text-[10px] px-1 rounded"><UserX className="w-3 h-3" />No face</div>
                )}
                {!isCheating && headFlags.looking_away && !headFlags.multiple_faces && !headFlags.no_face && (
                  <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1 rounded">Away</div>
                )}
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                    <CameraOff className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Time Left</p>
                <div className="flex items-center gap-1">
                  <Clock className={`h-4 w-4 ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`} />
                  <span className={`text-xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500" : ""}`}>{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <Button variant="destructive" size="sm" onClick={() => setShowSubmitDialog(true)} disabled={submitting}>Submit</Button>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{getAnsweredCount()}/{exam.questions.length} answered</span>
              <span className={getTotalMoves() > 0 ? (isCheating ? "text-red-600 font-semibold" : "text-orange-500") : ""}>
                {getTotalMoves() > 0 && `${getTotalMoves()} head movements${isCheating ? " — CHEATING FLAGGED" : ""}`}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${getProgress()}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question card */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                      <Badge variant={currentQuestion.difficulty === "easy" ? "default" : currentQuestion.difficulty === "medium" ? "secondary" : "destructive"}>{currentQuestion.difficulty}</Badge>
                      <Badge variant="outline">{currentQuestion.points} pts</Badge>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
                  </div>
                  <Button variant={currentAnswer?.flagged ? "destructive" : "outline"} size="sm" onClick={() => toggleFlag(currentQuestion._id)}>
                    <Flag size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.questionType === "mcq" && currentQuestion.options && (
                  <RadioGroup value={currentAnswer?.answer as string} onValueChange={(value) => handleAnswerChange(currentQuestion._id, value)}>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value={option.text} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {currentQuestion.questionType === "text" && (
                  <Textarea placeholder="Type your answer here..." rows={8}
                    value={(currentAnswer?.answer as string) || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="resize-none" />
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentQuestionIndex((p) => p - 1)} disabled={currentQuestionIndex === 0}>
                    <ChevronLeft size={18} /> Previous
                  </Button>
                  <Button onClick={() => setCurrentQuestionIndex((p) => p + 1)} disabled={currentQuestionIndex === exam.questions.length - 1}>
                    Next <ChevronRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28">
              <CardHeader><CardTitle className="text-base">Questions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {exam.questions.map((question, index) => {
                    const answer = answers.find((a) => a.questionId === question._id);
                    return (
                      <button key={question._id} onClick={() => setCurrentQuestionIndex(index)}
                        className={`aspect-square rounded-md text-sm font-medium transition-all
                          ${index === currentQuestionIndex ? "ring-2 ring-primary ring-offset-2" : ""}
                          ${answer?.answer !== "" ? "bg-green-500 text-white hover:bg-green-600" : "bg-muted hover:bg-muted/80"}
                          ${answer?.flagged ? "border-2 border-orange-500" : ""}`}>
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-green-500" /><span>Answered</span></div>
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-muted border-2 border-orange-500" /><span>Flagged</span></div>
                  <div className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-muted" /><span>Not Answered</span></div>
                </div>

                {/* ── Head movement panel ──────────────────────────── */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Head Movements</p>
                    <div className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span className={`text-xs ${wsStatus === "Connected" ? "text-green-600" : "text-red-500"}`}>{wsStatus}</span>
                    </div>
                  </div>

                  {/* Cheating alert banner */}
                  {isCheating && (
                    <div className="p-2 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/30">
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> CHEATING DETECTED
                      </p>
                      <p className="text-[10px] text-red-500 mt-0.5">
                        Flagged directions: {cheatingDirections.join(", ")}
                      </p>
                    </div>
                  )}

                  {headFlags.calibrated ? (
                    <>
                      {/* Direction counters */}
                      {[
                        { key: "left" as const,       label: "Left",    icon: <ArrowLeft className="w-3 h-3" /> },
                        { key: "right" as const,      label: "Right",   icon: <ArrowRight className="w-3 h-3" /> },
                        { key: "up" as const,         label: "Up",      icon: <ArrowUp className="w-3 h-3" /> },
                        { key: "down" as const,       label: "Down",    icon: <ArrowDown className="w-3 h-3" /> },
                        { key: "tilt_left" as const,  label: "Tilt L",  icon: null },
                        { key: "tilt_right" as const, label: "Tilt R",  icon: null },
                        { key: "no_face" as const,    label: "No face", icon: <UserX className="w-3 h-3" /> },
                        { key: "multiple_faces" as const, label: "Multi", icon: <Users className="w-3 h-3" /> },
                      ].map(({ key, label, icon }) => {
                        const count = headCounts[key];
                        const isCheatDir = cheatingDirections.includes(key);
                        const isActive = headFlags.reason === `yaw_${key}` || headFlags.reason === `pitch_${key === "up" ? "up" : key === "down" ? "down" : ""}` || headFlags.reason === `roll_${key === "tilt_left" ? "left" : key === "tilt_right" ? "right" : ""}`;
                        return (
                          <div key={key}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md border text-xs transition-colors
                              ${isCheatDir ? "bg-red-100 border-red-400 dark:bg-red-900/30"
                              : isActive ? "bg-orange-100 border-orange-400 dark:bg-orange-900/30"
                              : "bg-muted border-transparent"}`}>
                            <div className="flex items-center gap-1">
                              {icon}
                              <span>{label}</span>
                              {isCheatDir && <span className="text-red-500 font-bold">!</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`font-bold ${isCheatDir ? "text-red-600" : count >= CHEAT_THRESHOLD - 1 ? "text-orange-500" : ""}`}>
                                {count}
                              </span>
                              <span className="text-muted-foreground">/{CHEAT_THRESHOLD}</span>
                            </div>
                          </div>
                        );
                      })}

                      {getTotalMoves() > 0 && (
                        <div className={`flex items-center justify-between pt-1 border-t text-xs font-semibold ${isCheating ? "text-red-600" : ""}`}>
                          <span>Total moves</span>
                          <span>{getTotalMoves()}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {wsStatus === "Connected" ? "⏳ Calibrating… keep still for a moment" : "Camera not connected"}
                    </p>
                  )}
                </div>
                {/* ───────────────────────────────────────────────── */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cheating detected dialog */}
      <AlertDialog open={showCheatDialog} onOpenChange={setShowCheatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> 🚨 Cheating Detected!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base font-semibold text-foreground">{cheatDialogMessage}</p>
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg dark:bg-red-900/20">
                <p className="text-sm text-red-600 font-medium">
                  This violation has been permanently recorded and sent to the administrator.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {CHEAT_THRESHOLD} head movements in a single direction
                </p>
              </div>
              <p className="text-sm">
                Continuing to look away from the screen may result in exam disqualification.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Violation dialog */}
      <AlertDialog open={showViolationWarning} onOpenChange={setShowViolationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Violation Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base font-semibold text-foreground">{currentViolation}</p>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">Total violations: {tabSwitchCount}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction>I Understand</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                <p>Answered: {getAnsweredCount()}/{exam.questions.length}</p>
                <p>Flagged: {getFlaggedCount()}</p>
                <p>Time Remaining: {formatTime(timeRemaining)}</p>
                {tabSwitchCount > 0 && <p className="text-destructive font-medium">Tab Violations: {tabSwitchCount}</p>}
                {isCheating && <p className="text-red-600 font-bold">⚠️ CHEATING FLAGGED</p>}
                {getTotalMoves() > 0 && (
                  <div className="pt-1 border-t space-y-0.5 text-orange-600">
                    <p className="font-semibold">Head Movements:</p>
                    <p>← Left: {headCounts.left}  → Right: {headCounts.right}</p>
                    <p>↑ Up: {headCounts.up}  ↓ Down: {headCounts.down}</p>
                    {(headCounts.tilt_left > 0 || headCounts.tilt_right > 0) && (
                      <p>Tilt L: {headCounts.tilt_left}  Tilt R: {headCounts.tilt_right}</p>
                    )}
                    <p className="font-semibold">Total: {getTotalMoves()}</p>
                  </div>
                )}
              </div>
              <p className="text-destructive text-sm">Once submitted, you cannot change your answers.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitExam} disabled={submitting} className="bg-primary">
              {submitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExamPage;