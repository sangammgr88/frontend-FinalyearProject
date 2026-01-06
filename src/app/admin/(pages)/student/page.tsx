"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, UserPlus, Eye } from "lucide-react";
import Link from "next/link";

const students = [
  {
    id: "LC00017002053",
    name: "Sangam Thapa",
    email: "sangam.thapa@example.com",
    enrolled: 12,
    completed: 10,
    violations: 2,
    status: "active",
  },
  {
    id: "LC00017002054",
    name: "John Doe",
    email: "john.doe@example.com",
    enrolled: 8,
    completed: 7,
    violations: 0,
    status: "active",
  },
  {
    id: "LC00017002055",
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    enrolled: 15,
    completed: 12,
    violations: 5,
    status: "flagged",
  },
  {
    id: "LC00017002056",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    enrolled: 10,
    completed: 8,
    violations: 1,
    status: "active",
  },
  {
    id: "LC00017002057",
    name: "Emily Brown",
    email: "emily.brown@example.com",
    enrolled: 6,
    completed: 5,
    violations: 0,
    status: "active",
  },
  {
    id: "LC00017002058",
    name: "David Wilson",
    email: "david.wilson@example.com",
    enrolled: 14,
    completed: 11,
    violations: 3,
    status: "warning",
  },
  {
    id: "LC00017002059",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    enrolled: 9,
    completed: 9,
    violations: 0,
    status: "active",
  },
  {
    id: "LC00017002060",
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    enrolled: 11,
    completed: 8,
    violations: 4,
    status: "flagged",
  },
];

export default function StudentsPage() {
  return (
    <div className="flex flex-col sm:w-7xl ">
      <div className="flex-1 space-y-6 p-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="">
              <div className="">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, ID, or email..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Exams Enrolled</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Violations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">
                      {student.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.enrolled}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.completed}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${
                          student.violations > 3
                            ? "text-destructive"
                            : student.violations > 0
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {student.violations}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "active"
                            ? "default"
                            : student.status === "warning"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/AnswerDetails/${student.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
