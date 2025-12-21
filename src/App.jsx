import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  LogIn,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import useTheme from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";

export default function StudentActivityDashboard() {
  const { theme } = useTheme();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [activitySummary, setActivitySummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    enrollmentDate: "",
  });
  const [activityForm, setActivityForm] = useState({
    action: "LOGIN",
    quizId: "",
    score: "",
    totalScore: "",
    assignmentId: "",
    submissionUrl: "",
    courseName: "",
    courseId: "",
    sessionId: "",
    attendanceStatus: "PRESENT",
  });

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchActivitySummary = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/students/${studentId}/activity-summary`
      );
      const data = await response.json();
      setActivitySummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/students/${studentId}/activity`
      );
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    fetchActivitySummary(studentId);
    fetchActivities(studentId);
  };

  const createStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Student created successfully");
        setFormData({ studentId: "", name: "", email: "", enrollmentDate: "" });
        fetchStudents();
        setActiveTab("dashboard");
      }
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const logActivity = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      let endpoint = "";
      let body = {};

      if (activityForm.action === "LOGIN") {
        endpoint = `/students/${selectedStudent}/login`;
      } else if (activityForm.action === "QUIZ") {
        endpoint = `/students/${selectedStudent}/quiz-submission`;
        body = {
          quizId: activityForm.quizId,
          score: parseInt(activityForm.score),
          totalScore: parseInt(activityForm.totalScore),
        };
      } else if (activityForm.action === "ASSIGNMENT") {
        endpoint = `/students/${selectedStudent}/assignment-submission`;
        body = {
          assignmentId: activityForm.assignmentId,
          submissionUrl: activityForm.submissionUrl,
          courseName: activityForm.courseName,
        };
      } else if (activityForm.action === "ATTENDANCE") {
        endpoint = `/students/${selectedStudent}/attendance`;
        body = {
          courseId: activityForm.courseId,
          sessionId: activityForm.sessionId,
          status: activityForm.attendanceStatus,
        };
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Activity logged successfully");
        fetchActivitySummary(selectedStudent);
        fetchActivities(selectedStudent);
        setActivityForm({
          action: "LOGIN",
          quizId: "",
          score: "",
          totalScore: "",
          assignmentId: "",
          submissionUrl: "",
          courseName: "",
          courseId: "",
          sessionId: "",
          attendanceStatus: "PRESENT",
        });
      }
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const summaryData = activitySummary
    ? [
        { name: "Logins", value: activitySummary.totalLogins },
        { name: "Quizzes", value: activitySummary.quizSubmissions },
        { name: "Assignments", value: activitySummary.assignmentSubmissions },
        { name: "Attendance", value: activitySummary.attendanceRecords },
        { name: "Grades", value: activitySummary.gradeUpdates },
      ]
    : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#4B5563'; // gray-400 : gray-600
  const cardBg = "bg-white dark:bg-gray-800";
  const textMain = "text-gray-800 dark:text-gray-100";
  const textSub = "text-gray-600 dark:text-gray-400";
  const inputStyle = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${textMain}`}>
            Student Activity Tracker
          </h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded ${
                activeTab === "dashboard"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 rounded ${
                activeTab === "activity"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              Log Activity
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 rounded ${
                activeTab === "students"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              Add Student
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
              <label className={`block text-sm font-medium ${textSub} mb-2`}>
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className={inputStyle}
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && activitySummary && !loading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${textSub} text-sm`}>Logins</p>
                        <p className={`text-2xl font-bold ${textMain}`}>
                          {activitySummary.totalLogins}
                        </p>
                      </div>
                      <LogIn className="text-blue-500" size={32} />
                    </div>
                  </div>
                  <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${textSub} text-sm`}>Quizzes</p>
                        <p className={`text-2xl font-bold ${textMain}`}>
                          {activitySummary.quizSubmissions}
                        </p>
                      </div>
                      <BookOpen className="text-green-500" size={32} />
                    </div>
                  </div>
                  <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${textSub} text-sm`}>Assignments</p>
                        <p className={`text-2xl font-bold ${textMain}`}>
                          {activitySummary.assignmentSubmissions}
                        </p>
                      </div>
                      <FileText className="text-yellow-500" size={32} />
                    </div>
                  </div>
                  <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${textSub} text-sm`}>Attendance</p>
                        <p className={`text-2xl font-bold ${textMain}`}>
                          {activitySummary.attendanceRecords}
                        </p>
                      </div>
                      <Calendar className="text-red-500" size={32} />
                    </div>
                  </div>
                  <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${textSub} text-sm`}>Grade Updates</p>
                        <p className={`text-2xl font-bold ${textMain}`}>
                          {activitySummary.gradeUpdates}
                        </p>
                      </div>
                      <TrendingUp className="text-purple-500" size={32} />
                    </div>
                  </div>
                </div>

                <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                  <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>
                    Activity Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summaryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {summaryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke={theme === 'dark' ? '#1F2937' : '#fff'}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#fff',
                          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                          color: theme === 'dark' ? '#fff' : '#000'
                        }}
                      />
                      <Legend formatter={(value) => <span style={{ color: axisColor }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className={`${cardBg} rounded-lg shadow p-6 transition-colors duration-200`}>
                  <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>
                    Recent Activities
                  </h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.slice(0, 10).map((activity, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <p className={`font-semibold ${textMain}`}>
                          {activity.action_type?.replace(/_/g, " ")}
                        </p>
                        <p className={`text-sm ${textSub}`}>
                          {activity.module_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(activity.event_time).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {loading && <p className={`text-center ${textSub}`}>Loading...</p>}
          </div>
        )}

        {activeTab === "activity" && (
          <div className={`${cardBg} rounded-lg shadow p-6 max-w-2xl mx-auto transition-colors duration-200`}>
            <h2 className={`text-xl font-semibold mb-6 ${textMain}`}>Log Activity</h2>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${textSub} mb-2`}>
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className={inputStyle}
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-2`}>
                  Activity Type
                </label>
                <select
                  value={activityForm.action}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, action: e.target.value })
                  }
                  className={inputStyle}
                >
                  <option value="LOGIN">Login</option>
                  <option value="QUIZ">Quiz Submission</option>
                  <option value="ASSIGNMENT">Assignment Submission</option>
                  <option value="ATTENDANCE">Attendance</option>
                </select>
              </div>

              {activityForm.action === "QUIZ" && (
                <>
                  <input
                    type="text"
                    placeholder="Quiz ID"
                    value={activityForm.quizId}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        quizId: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={activityForm.score}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        score: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Total Score"
                    value={activityForm.totalScore}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        totalScore: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                </>
              )}

              {activityForm.action === "ASSIGNMENT" && (
                <>
                  <input
                    type="text"
                    placeholder="Assignment ID"
                    value={activityForm.assignmentId}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        assignmentId: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={activityForm.courseName}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        courseName: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Submission URL"
                    value={activityForm.submissionUrl}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        submissionUrl: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                </>
              )}

              {activityForm.action === "ATTENDANCE" && (
                <>
                  <input
                    type="text"
                    placeholder="Course ID"
                    value={activityForm.courseId}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        courseId: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Session ID"
                    value={activityForm.sessionId}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        sessionId: e.target.value,
                      })
                    }
                    className={inputStyle}
                    required
                  />
                  <select
                    value={activityForm.attendanceStatus}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        attendanceStatus: e.target.value,
                      })
                    }
                    className={inputStyle}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
                </>
              )}

              <button
                onClick={logActivity}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Log Activity
              </button>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className={`${cardBg} rounded-lg shadow p-6 max-w-2xl mx-auto transition-colors duration-200`}>
            <h2 className={`text-xl font-semibold mb-6 ${textMain}`}>Add New Student</h2>

            <div className="space-y-4 mb-8">
              <input
                type="text"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                className={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputStyle}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputStyle}
              />
              <input
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentDate: e.target.value })
                }
                className={inputStyle}
              />
              <button
                onClick={createStudent}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Student
              </button>
            </div>

            <div>
              <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>All Students</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="border border-gray-200 dark:border-gray-700 rounded p-4"
                  >
                    <p className={`font-semibold ${textMain}`}>{student.name}</p>
                    <p className={`text-sm ${textSub}`}>{student.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
