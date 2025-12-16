"use client";

import React from "react";

const DashboardPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 w-max-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Online Examination Monitoring Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Real-time overview of all students and exam activities
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="120" />
        <StatCard title="Active Exams" value="5" />
        <StatCard title="Live Students" value="87" />
        <StatCard title="Detected Violations" value="34" />
      </div>

      {/* Exam Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Ongoing Exams
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3">Exam Name</th>
                <th className="p-3">Total Students</th>
                <th className="p-3">Live</th>
                <th className="p-3">Violations</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  exam: "AI & Machine Learning",
                  total: 40,
                  live: 32,
                  violations: 8,
                  status: "Running",
                },
                {
                  exam: "Database Systems",
                  total: 35,
                  live: 28,
                  violations: 5,
                  status: "Running",
                },
                {
                  exam: "Computer Networks",
                  total: 45,
                  live: 27,
                  violations: 21,
                  status: "Critical",
                },
              ].map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.exam}</td>
                  <td className="p-3">{item.total}</td>
                  <td className="p-3">{item.live}</td>
                  <td className="p-3 text-red-600 font-medium">
                    {item.violations}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.status === "Critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Student Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Student Activities
        </h2>

        <ul className="space-y-3">
          {[
            "Student ID 1023 switched tab twice",
            "Student ID 1045 head movement detected",
            "Student ID 1012 camera disconnected",
            "Student ID 1038 suspicious object detected",
          ].map((log, index) => (
            <li
              key={index}
              className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded"
            >
              {log}
            </li>
          ))}
        </ul>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SystemCard title="AI Engine" status="Operational" color="green" />
        <SystemCard title="Camera Monitoring" status="Active" color="green" />
        <SystemCard
          title="Tab Switch Tracking"
          status="Enabled"
          color="green"
        />
      </div>
    </div>
  );
};

/* Reusable Components */

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-lg shadow p-5">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
  </div>
);

const SystemCard = ({
  title,
  status,
  color,
}: {
  title: string;
  status: string;
  color: "green" | "red";
}) => (
  <div className="bg-white rounded-lg shadow p-5 text-center">
    <h3 className="text-gray-700 font-semibold">{title}</h3>
    <p
      className={`font-bold mt-2 ${
        color === "green" ? "text-green-600" : "text-red-600"
      }`}
    >
      {status}
    </p>
  </div>
);

export default DashboardPage;
