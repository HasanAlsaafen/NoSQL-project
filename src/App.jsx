import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Users,
  BookOpen,
  Briefcase,
  Building,
  Activity,
  PlusCircle,
  Trash2,
  Link as LinkIcon,
  BarChart2,
  TrendingUp,
  ArrowRight,
  UserCheck,
  SearchCheck,
  Zap,
  Database,
  RefreshCw,
  DatabaseZap,
  ChevronRight
} from "lucide-react";
import useTheme from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";

export default function AcademicNetworkDashboard() {
  const { theme } = useTheme();
  const [database, setDatabase] = useState("neo4j"); 
  
  // Neo4j State
  const [neoStudents, setNeoStudents] = useState([]);
  const [neoInstructors, setNeoInstructors] = useState([]);
  const [neoCourses, setNeoCourses] = useState([]);
  const [neoDepartments, setNeoDepartments] = useState([]);
  const [neoRelationships, setNeoRelationships] = useState({});
  const [peers, setPeers] = useState([]); 
  const [mentors, setMentors] = useState([]); 

  // Mongo State
  const [mongoStudents, setMongoStudents] = useState([]);
  const [mongoEnrollmentStats, setMongoEnrollmentStats] = useState([]);

  // Cassandra State (Analytics)
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsCategory, setAnalyticsCategory] = useState("TOP_COURSES");
  const [studentPerformance, setStudentPerformance] = useState([]);

  // Influx State (Course Activity)
  const [influxMetrics, setInfluxMetrics] = useState([]);
  const [influxStudentId, setInfluxStudentId] = useState("");
  const [peakHours, setPeakHours] = useState([]);

  // Aggregate Stats State
  const [deptInfluence, setDeptInfluence] = useState([]);
  const [programGPA, setProgramGPA] = useState([]);
  const [globalGPATrend, setGlobalGPATrend] = useState([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [formData, setFormData] = useState({}); 

  const NEO_API = "http://localhost:5000/api/neo4j";
  const MONGO_API = "http://localhost:5000/api/mongo";
  const CASSANDRA_API = "http://localhost:5000/api/cassandra";
  const INFLUX_API = "http://localhost:5000/api/influx";
  const UNIFIED_API = "http://localhost:5000/api";

  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [cacheHits, setCacheHits] = useState({});
  const [redisKeys, setRedisKeys] = useState([]);

  const fetchRedisKeys = async () => {
      try {
          const r = await fetch(`${UNIFIED_API}/redis/keys`);
          if (r.ok) {
              const data = await r.json();
              console.log("Redis Sync:", data.keys);
              setRedisKeys(data.keys || []);
          }
      } catch(e) { console.error("Redis Sync Error", e); }
  };

  const CacheBadge = ({ id, label }) => {
    const status = cacheHits[id];
    if (!status) return (
      <span className="text-[10px] text-gray-400 font-medium italic">Waiting...</span>
    );
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border ${
          status === 'HIT' 
            ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' 
            : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {status === 'HIT' ? '⚡ Redis HIT' : '💾 DB MISS'}
        </span>
      </div>
    );
  };

  // Initial Data Load
  useEffect(() => {
    checkConnection();
    fetchAllData(); 
    fetchRedisKeys();
  }, [database]); 

  useEffect(() => {
    if (activeTab === 'dashboard') {
        fetchAllStats(); 
        fetchRedisKeys();
    }
  }, [activeTab]);

  const checkConnection = async () => setConnectionStatus("connected");

  const fetchAllStats = async () => {
      try {
          fetch(`${NEO_API}/students`).then(r=>r.ok?r.json():[]).then(setNeoStudents);
          fetch(`${NEO_API}/instructors`).then(r=>r.ok?r.json():[]).then(setNeoInstructors);
          fetch(`${NEO_API}/courses`).then(r=>r.ok?r.json():[]).then(setNeoCourses);
          fetch(`${NEO_API}/departments`).then(r=>r.ok?r.json():[]).then(setNeoDepartments);
          fetch(`${MONGO_API}/students`).then(r=>r.ok?r.json():[]).then(setMongoStudents);
          fetch(`${MONGO_API}/stats/course-enrollments`).then(r=>r.ok?r.json():[]).then(setMongoEnrollmentStats);
          
          // Complex Aggregations
          fetch(`${NEO_API}/stats/department-influence`).then(r=>r.ok?r.json():[]).then(setDeptInfluence);
          fetch(`${MONGO_API}/stats/avg-gpa`).then(r=>r.ok?r.json():[]).then(setProgramGPA);
          fetch(`${CASSANDRA_API}/stats/global-gpa`).then(r=>r.ok?r.json():[]).then(setGlobalGPATrend);
          fetch(`${INFLUX_API}/stats/peak-hours`).then(r=>r.ok?r.json():[]).then(setPeakHours);
      } catch (e) { console.error("Stats fetch error", e); }
  };

  const fetchAllData = async () => {
    setLoading(true);
    if (database === "neo4j") {
      await Promise.all([
        fetchEntities(NEO_API, "students", setNeoStudents),
        fetchEntities(NEO_API, "instructors", setNeoInstructors),
        fetchEntities(NEO_API, "courses", setNeoCourses),
        fetchEntities(NEO_API, "departments", setNeoDepartments),
      ]);
    } else if (database === "mongo") {
      await fetchEntities(MONGO_API, "students", setMongoStudents);
    } else if (database === "cassandra") {
       fetchCassandraAnalytics();
    }
    setLoading(false);
  };

  const fetchEntities = async (baseUrl, endpoint, setter) => {
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`);
      const cacheHeader = response.headers.get('X-Cache');
      if (cacheHeader) {
          setCacheHits(prev => ({ ...prev, [endpoint]: cacheHeader }));
      }
      if (response.ok) setter(await response.json());
      fetchRedisKeys();
    } catch (err) { console.error("Fetch failed", err); }
  };

  const fetchCassandraAnalytics = async (categoryOverride) => {
      const cat = categoryOverride || analyticsCategory;
      try {
          const response = await fetch(`${CASSANDRA_API}/analytics?category=${cat}`);
          const cacheHeader = response.headers.get('X-Cache');
          if (cacheHeader) {
              setCacheHits(prev => ({ ...prev, analytics: cacheHeader }));
          }
          if (response.ok) {
              const data = await response.json();
              setAnalyticsData(data.sort((a,b) => a.rank - b.rank));
          }
          fetchRedisKeys();
      } catch (e) { console.error(e); }
  }

  const fetchInfluxMetrics = async () => {
      if (!influxStudentId) return;
      try {
          const response = await fetch(`${INFLUX_API}/metrics/${encodeURIComponent(influxStudentId)}`);
          if (response.ok) setInfluxMetrics(await response.json());
      } catch (err) { console.error("Failed to fetch metrics", err); }
  }

  const fetchStudentCourses = async (studentId) => {
      try {
          const response = await fetch(`${NEO_API}/relationships/takes/${studentId}`);
          if (response.ok) return await response.json();
      } catch (err) {} return [];
  };

  const fetchInstructorCourses = async (instructorId) => {
      try {
          const response = await fetch(`${NEO_API}/relationships/teaches/${instructorId}`);
          if (response.ok) return await response.json();
      } catch (err) {} return [];
  };

  const fetchPeers = async (studentId) => {
      try {
          const response = await fetch(`${NEO_API}/recommendations/peers/${studentId}`);
          if (response.ok) {
              setPeers(await response.json());
              setMentors([]); // Reset mentors when looking at peers
          }
      } catch (e) {}
  };

  const fetchMentors = async (studentId) => {
      try {
          const response = await fetch(`${NEO_API}/recommendations/mentors/${studentId}`);
          if (response.ok) {
              setMentors(await response.json());
              setPeers([]); // Reset peers when looking at mentors
          }
      } catch (e) {}
  };

  const handleCreate = async (e, endpoint, refresh) => {
    e.preventDefault();
    try {
      let body = {};

      if (database === "neo4j") {
        if (endpoint === 'students') {
           body = { id: formData.id, name: formData.name, major: formData.major, year: parseInt(formData.year) };
           await postData(`${NEO_API}/${endpoint}`, body);
           await postData(`${MONGO_API}/students`, { studentId: formData.id, name: formData.name, email: `${formData.id}@ppu.edu`, program: { programId: "unk", programName: formData.major, department: "General" } }).catch(() => {});
        } else if (endpoint === 'instructors') {
           body = { id: formData.id, name: formData.name, title: formData.title };
           await postData(`${NEO_API}/${endpoint}`, body);
        } else if (endpoint === 'courses') {
           body = { id: formData.id, name: formData.name, creditHours: parseInt(formData.creditHours) };
           await postData(`${NEO_API}/${endpoint}`, body);
        } else if (endpoint === 'relationships/takes') {
           body = { studentId: formData.studentId, courseId: formData.courseId, semester: formData.semester, grade: formData.grade };
           await postData(`${UNIFIED_API}/enroll`, body);
           alert("Atomic Enrollment Success!"); setFormData({}); return;
        } else if (endpoint === 'relationships/teaches') {
           body = { instructorId: formData.instructorId, courseId: formData.courseId, semester: formData.semester || "Spring 2024" };
           await postData(`${NEO_API}/${endpoint}`, body);
        } else if (endpoint === 'relationships/member-of') {
           body = { instructorId: formData.instructorId, departmentId: formData.departmentId };
           await postData(`${NEO_API}/${endpoint}`, body);
        }
      } 
      else if (database === "mongo") {
          body = { 
              studentId: formData.studentId, name: formData.name, email: formData.email, 
              program: { programId: "P"+Math.floor(Math.random()*100), programName: formData.program, department: formData.department }
          };
          await postData(`${MONGO_API}/students`, body);
      }
      else if (database === "influx") {
          const val = formData.action === 'attendance' ? (formData.attendanceStatus === 'present' ? 1 : 0) : parseFloat(formData.value);
          body = { student_id: formData.student_id, action: formData.action, value: val, status: formData.attendanceStatus };
          await postData(`${INFLUX_API}/metrics`, body);
      } 
      else if (database === "cassandra") {
          body = { category: formData.category, entity_id: formData.entity_id, metric_value: parseFloat(formData.metric_value), rank: parseInt(formData.rank) };
          await postData(`${CASSANDRA_API}/analytics`, body);
      }

      alert("Success!"); setFormData({});
      if (refresh) refresh(); else fetchAllData();
    } catch (err) { alert("Error: " + err.message); }
  };

  const postData = async (url, body) => {
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) { 
          const err = await response.json(); 
          const msg = err.details ? `${err.error} - ${err.details}` : (err.error || "Failed");
          throw new Error(msg); 
      }
      return response.json();
  }

  const flushCache = async () => {
    try {
        const response = await fetch(`${UNIFIED_API}/redis/flush`, { method: 'POST' });
        if (response.ok) {
            setCacheHits({});
            setRedisKeys([]);
            alert("Redis Cache Flushed Successfully!");
            fetchAllData();
            fetchAllStats();
            fetchRedisKeys();
        }
    } catch (e) { alert("Failed to flush cache"); }
  };

  const handleDelete = async (id, endpoint, refresh) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const url = database === "neo4j" ? `${NEO_API}/${endpoint}/${id}` : `${MONGO_API}/${endpoint}/${id}`;
      await fetch(url, { method: "DELETE" });
      refresh();
    } catch (err) { console.error(err); }
  };

  const generateAnalytics = async (type) => {
      if (!influxStudentId || influxMetrics.length === 0) { alert("Fetch metrics first"); return; }
      if (type === 'AVG_SCORE') {
          const scores = influxMetrics.filter(m => m.score !== undefined || m._value !== undefined).map(m => m.score || m._value);
          if (scores.length === 0) return;
          const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
          await postData(`${CASSANDRA_API}/analytics`, { category: "STUDENT_AVG_SCORE", entity_id: influxStudentId, metric_value: parseFloat(avg), rank: 1 });
          setDatabase('cassandra'); setAnalyticsCategory("STUDENT_AVG_SCORE"); setActiveTab('analytics');
      }
  };

  const dashboardBox = (title, count, Icon, color) => (
       <div className={`${cardBg} p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700`}>
            <div className="flex justify-between items-start">
                <div><p className={`text-sm font-medium ${textSub}`}>{title}</p><h3 className={`text-3xl font-bold mt-2 ${textMain}`}>{count}</h3></div>
                <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text', 'bg')}`}><Icon size={24} className={color} /></div>
            </div>
       </div>
  );

  const cardBg = "bg-white dark:bg-gray-800";
  const textMain = "text-gray-800 dark:text-gray-100";
  const textSub = "text-gray-600 dark:text-gray-400";
  const inputStyle = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><Activity className="text-blue-600" size={28} /><h1 className={`text-2xl font-bold ${textMain}`}>Academic Hub</h1></div>
          <div className="flex flex-wrap justify-center gap-2">
             <div className="mr-4 flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['neo4j', 'mongo', 'cassandra', 'influx'].map(db => (
                    <button key={db} onClick={() => { setDatabase(db); setActiveTab('dashboard'); }} className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${database === db ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500'}`}>{db.toUpperCase()}</button>
                ))}
             </div>
             <ThemeToggle />
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-2 flex gap-4 overflow-x-auto">
                <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : textSub}`}>Dashboard</button>
                {database === 'neo4j' && <>
                    <button onClick={() => setActiveTab('students')} className={`${activeTab === 'students' ? 'text-blue-600 font-bold' : textSub}`}>Students</button>
                    <button onClick={() => setActiveTab('instructors')} className={`${activeTab === 'instructors' ? 'text-blue-600 font-bold' : textSub}`}>Instructors</button>
                    <button onClick={() => setActiveTab('courses')} className={`${activeTab === 'courses' ? 'text-blue-600 font-bold' : textSub}`}>Courses</button>
                </>}
                {database === 'mongo' && <button onClick={() => setActiveTab('students')} className={`${activeTab === 'students' ? 'text-blue-600 font-bold' : textSub}`}>Document Store</button>}
                {database === 'cassandra' && <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'text-blue-600 font-bold' : textSub}`}>Analytics</button>}
                {database === 'influx' && <button onClick={() => setActiveTab('metrics')} className={`${activeTab === 'metrics' ? 'text-blue-600 font-bold' : textSub}`}>Activities</button>}
                <button onClick={() => setActiveTab('aggregations')} className={`${activeTab === 'aggregations' ? 'text-blue-600 font-bold' : textSub}`}>Aggregations</button>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {dashboardBox("Neo4j Students", neoStudents.length, Users, "text-blue-500")}
                   {dashboardBox("Instructors", neoInstructors.length, Briefcase, "text-indigo-500")}
                   {dashboardBox("Mongo Students", mongoStudents.length, Users, "text-green-600")}
                   {dashboardBox("Courses", neoCourses.length, BookOpen, "text-purple-500")}
                   {dashboardBox("Avg Enrollments", mongoEnrollmentStats.length ? (mongoEnrollmentStats.reduce((a,b)=>a+b.count,0)/mongoEnrollmentStats.length).toFixed(1) : 0, TrendingUp, "text-orange-500")}
                </div>

                <div className={`p-8 rounded-2xl ${cardBg} border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden`}>
                   <div className="flex flex-col xl:flex-row justify-between items-start gap-10 relative z-10">
                      
                      {/* Left: Info & Strategy */}
                      <div className="flex-1 space-y-4">
                          <div>
                              <h3 className={`text-2xl font-black ${textMain} flex items-center gap-3 mb-2`}>
                                  <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
                                    <DatabaseZap size={22} />
                                  </div>
                                  Smart Caching Control
                              </h3>
                        
                          </div>

                          {/* Simplified Strategy Flow */}
                          <div className="flex items-center gap-3 py-4">
                              <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black">1</div>
                                  <span className="text-[9px] font-bold text-gray-400 mt-1">REQUEST</span>
                              </div>
                              <ArrowRight size={12} className="text-gray-300" />
                              <div className="flex flex-col items-center p-2 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                  <Zap size={14} className="text-blue-600" />
                                  <span className="text-[9px] font-black text-blue-600 mt-1 uppercase">Check Redis</span>
                              </div>
                              <ArrowRight size={12} className="text-gray-300" />
                              <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black">2</div>
                                  <span className="text-[9px] font-bold text-gray-400 mt-1 text-center">IF MISS: FETCH DB<br/>& SAVE TO CACHE</span>
                              </div>
                          </div>
                      </div>

                      {/* Right: Live Status & Controls */}
                      <div className="flex flex-col sm:flex-row xl:flex-col items-center sm:items-end gap-6 min-w-[300px]">
                          <div className="flex flex-wrap justify-center sm:justify-end gap-6">
                              <CacheBadge id="analytics" label="Analytics" />
                              <CacheBadge id="students" label="Students" />
                              <div className="flex flex-col items-center gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Service Status</span>
                                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800/50">
                                      <Zap size={12} className="text-green-600 fill-green-600 animate-pulse" />
                                      <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase leading-none">Redis Active</span>
                                  </div>
                              </div>
                          </div>

                          <div className="w-full h-px bg-gray-100 dark:bg-gray-700 sm:hidden xl:block"></div>

                          <div className="flex flex-col items-center sm:items-end gap-2">
                              <p className="text-[10px] text-gray-400 font-medium italic">Clear all temporary data to force fresh DB reads:</p>
                              <button 
                                  onClick={flushCache}
                                  className="group flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
                              >
                                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                                  Nuke & Refresh Cache
                              </button>
                          </div>
                      </div>

                   </div>

                   {/* Redis Memory Map Visualization */}
                   <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Redis Live Memory Map ({redisKeys.length} Blocks)</h4>
                            <button onClick={fetchRedisKeys} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400" title="Refresh Map">
                               <RefreshCw size={10} />
                            </button>
                          </div>
                          {redisKeys.length > 0 && <span className="text-[10px] text-blue-600 font-bold animate-pulse">● Cache Active</span>}
                      </div>
                      
                      {redisKeys.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                              <Database size={24} className="text-gray-200 mb-2" />
                              <p className="text-[10px] text-gray-400 font-medium italic">Memory is empty. Fetch data to populate the cache.</p>
                          </div>
                      ) : (
                          <div className="flex flex-wrap gap-2">
                              {redisKeys.map((key, i) => (
                                  <div 
                                      key={key} 
                                      className="group relative flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-default animate-scaleIn"
                                      style={{ animationDelay: `${i * 30}ms` }}
                                  >
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-white animate-pulse"></div>
                                      <span className="text-[10px] font-mono font-bold truncate max-w-[120px] uppercase tracking-tighter">{key}</span>
                                      
                                      {/* Tooltip on hover */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                          In-Memory JSON Object
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                   </div>
                </div>
             </div>
        )}

        {/* --- NEO4J STUDENTS --- */}
        {database === 'neo4j' && activeTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                <div className="space-y-6">
                    <div className={`${cardBg} p-6 rounded-xl shadow-sm`}>
                        <h2 className={`text-xl font-bold mb-4 ${textMain} flex items-center gap-2`}><PlusCircle /> Add Student</h2>
                        <form onSubmit={(e) => handleCreate(e, 'students')} className="space-y-3">
                            <input placeholder="ID (S1)" className={inputStyle} onChange={e => setFormData({...formData, id: e.target.value})} required />
                            <input placeholder="Name" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input placeholder="Major" className={inputStyle} onChange={e => setFormData({...formData, major: e.target.value})} required />
                            <input placeholder="Year" type="number" className={inputStyle} onChange={e => setFormData({...formData, year: e.target.value})} required />
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Create</button>
                        </form>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl shadow-sm border-2 border-green-500/20`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600"><LinkIcon /> Unified Enroll</h2>
                        <form onSubmit={(e) => handleCreate(e, 'relationships/takes')} className="space-y-3">
                            <input placeholder="Student ID" className={inputStyle} list="std_ids" onChange={e => setFormData({...formData, studentId: e.target.value})} />
                            <datalist id="std_ids">{neoStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</datalist>
                            <input placeholder="Course ID" className={inputStyle} list="crs_ids" onChange={e => setFormData({...formData, courseId: e.target.value})} />
                            <datalist id="crs_ids">{neoCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</datalist>
                            <input placeholder="Semester" className={inputStyle} onChange={e => setFormData({...formData, semester: e.target.value})} />
                            <input placeholder="Grade" className={inputStyle} onChange={e => setFormData({...formData, grade: e.target.value})} />
                            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">Enroll Across DBs</button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {neoStudents.map(s => (
                        <div key={s.id} className={`${cardBg} p-4 rounded-lg border dark:border-gray-700`}>
                            <div className="flex justify-between items-start">
                                <div><h4 className="font-bold text-lg">{s.name}</h4><p className={textSub}>{s.major} - Yr {s.year}</p></div>
                                <button onClick={() => handleDelete(s.id, 'students', () => fetchEntities(NEO_API, 'students', setNeoStudents))} className="text-red-500"><Trash2 size={18}/></button>
                            </div>
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => fetchStudentCourses(s.id).then(r => setNeoRelationships(prev => ({...prev, [s.id]: r})))} className="text-xs text-blue-600 font-bold hover:underline">View Courses</button>
                                <button onClick={() => fetchPeers(s.id)} className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"><Users size={12}/> Find Peers</button>
                                <button onClick={() => fetchMentors(s.id)} className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"><Briefcase size={12}/> Mentors</button>
                            </div>
                            {neoRelationships[s.id] && <div className="mt-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">{neoRelationships[s.id].map(r => r.course.name).join(', ') || "No courses"}</div>}
                        </div>
                    ))}
                    {peers.length > 0 && (
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-xl animate-scaleIn">
                           <div className="flex justify-between items-center mb-6">
                               <h4 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
                                   <UserCheck size={32} /> Social Circle Recommendations
                               </h4>
                               <button onClick={() => setPeers([])} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                   <XAxis size={20} />
                               </button>
                           </div>
                           <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mb-6 font-medium">Based on your shared academic journey, these students have similar course profiles.</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                               {peers.map((p,i) => (
                                   <div key={i} className="group bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-white dark:border-gray-700 flex flex-col gap-3 relative overflow-hidden">
                                       <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform"/>
                                       <div className="flex items-center gap-4">
                                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg">
                                               {p.peer.name[0]}
                                           </div>
                                           <div>
                                               <span className="block font-black text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors">{p.peer.name}</span>
                                               <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{p.peer.major}</span>
                                           </div>
                                       </div>
                                       <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                           <span className="text-[10px] text-gray-500 font-black">STRENGTH</span>
                                           <div className="flex gap-1">
                                               {[...Array(5)].map((_, idx) => (
                                                   <div key={idx} className={`w-3 h-1.5 rounded-full ${idx < p.sharedCount ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}/>
                                               ))}
                                           </div>
                                           <span className="text-xs font-black text-indigo-600">{p.sharedCount} courses</span>
                                       </div>
                                   </div>
                               ))}
                           </div>
                        </div>
                    )}
                    {mentors.length > 0 && (
                        <div className="md:col-span-2 bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 animate-slideIn">
                           <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2"><Briefcase /> Suggested Mentors</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {mentors.map((m,i) => (
                                   <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900">
                                       <div className="flex justify-between">
                                           <span className="font-bold">{m.instructor.name}</span>
                                           <span className="text-[10px] uppercase text-orange-500 font-bold">{m.instructor.title}</span>
                                       </div>
                                       <div className="mt-1 text-[10px] text-gray-400">Expertise: {m.commonCourses.join(', ')}</div>
                                   </div>
                               ))}
                           </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- NEO4J INSTRUCTORS --- */}
        {database === 'neo4j' && activeTab === 'instructors' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                 <div className="space-y-6">
                    <div className={`${cardBg} p-6 rounded-xl shadow-sm`}>
                        <h2 className={`text-xl font-bold mb-4 ${textMain} flex items-center gap-2`}><PlusCircle /> Add Instructor</h2>
                        <form onSubmit={(e) => handleCreate(e, 'instructors', () => fetchEntities(NEO_API, 'instructors', setNeoInstructors))} className="space-y-3">
                            <input placeholder="ID (I1)" className={inputStyle} onChange={e => setFormData({...formData, id: e.target.value})} required />
                            <input placeholder="Name" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <input placeholder="Title (Professor/Dr.)" className={inputStyle} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold shadow-lg hover:shadow-indigo-500/30 transition-shadow">Create Instructor</button>
                        </form>
                    </div>

                    <div className={`${cardBg} p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600"><LinkIcon /> Assign Course</h2>
                        <form onSubmit={(e) => handleCreate(e, 'relationships/teaches', () => {})} className="space-y-3">
                            <select className={inputStyle} onChange={e => setFormData({...formData, instructorId: e.target.value})} required>
                                <option value="">Select Instructor</option>
                                {neoInstructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <select className={inputStyle} onChange={e => setFormData({...formData, courseId: e.target.value})} required>
                                <option value="">Select Course</option>
                                {neoCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input placeholder="Semester (e.g. Fall 2024)" className={inputStyle} onChange={e => setFormData({...formData, semester: e.target.value})} required />
                            <button className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold">Assign Teaching</button>
                        </form>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900`}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-600"><Building /> Link Department</h2>
                        <form onSubmit={(e) => handleCreate(e, 'relationships/member-of', () => {})} className="space-y-3">
                            <select className={inputStyle} onChange={e => setFormData({...formData, instructorId: e.target.value})} required>
                                <option value="">Select Instructor</option>
                                {neoInstructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <select className={inputStyle} onChange={e => setFormData({...formData, departmentId: e.target.value})} required>
                                <option value="">Select Department</option>
                                {neoDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold">Assign Department</button>
                        </form>
                    </div>
                 </div>

                 <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                    {neoInstructors.map(inst => (
                        <div key={inst.id} className={`${cardBg} p-5 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col justify-between group`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{inst.name?.[0]}</div>
                                    <div>
                                        <h4 className="font-bold text-lg">{inst.name}</h4>
                                        <p className="text-sm text-indigo-500 font-medium">{inst.title}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(inst.id, 'instructors', () => fetchEntities(NEO_API, 'instructors', setNeoInstructors))} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={() => fetchInstructorCourses(inst.id).then(r => setNeoRelationships(prev => ({...prev, [inst.id]: r})))} 
                                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                >
                                    View Teaching Load <ChevronRight size={12}/>
                                </button>
                                {neoRelationships[inst.id] && (
                                    <div className="mt-2 flex flex-wrap gap-2 animate-fadeIn">
                                        {neoRelationships[inst.id].length > 0 ? neoRelationships[inst.id].map((r, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-100 dark:border-indigo-800">
                                                {r.course?.name} ({r.props?.semester || "N/A"})
                                            </span>
                                        )) : <p className="text-[10px] text-gray-400 italic">No courses assigned yet</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* --- NEO4J COURSES --- */}
        {database === 'neo4j' && activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                 <div className={`${cardBg} p-6 rounded-xl shadow-sm h-fit`}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-600"><PlusCircle /> New Course</h2>
                    <form onSubmit={(e) => handleCreate(e, 'courses')} className="space-y-4">
                        <input placeholder="Course ID (CS101)" className={inputStyle} onChange={e => setFormData({...formData, id: e.target.value})} required />
                        <input placeholder="Course Name" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input placeholder="Credit Hours" type="number" className={inputStyle} onChange={e => setFormData({...formData, creditHours: e.target.value})} required />
                        <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Add Course</button>
                    </form>
                 </div>
                 <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {neoCourses.map(c => (
                        <div key={c.id} className={`${cardBg} p-4 rounded-lg border dark:border-gray-700 flex justify-between`}>
                            <div><h4 className="font-bold">{c.name}</h4><p className={textSub}>{c.id} - {c.creditHours} Credits</p></div>
                            <button onClick={() => handleDelete(c.id, 'courses', () => fetchEntities(NEO_API, 'courses', setNeoCourses))} className="text-red-400"><Trash2 size={16}/></button>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* --- MONGO STUDENTS --- */}
        {database === 'mongo' && activeTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                <div className={`${cardBg} p-6 rounded-xl shadow-sm h-fit`}>
                    <h2 className="text-xl font-bold mb-4 text-green-600">Mongo Student Profile</h2>
                    <form onSubmit={(e) => handleCreate(e, 'students')} className="space-y-4">
                        <input placeholder="Student ID" className={inputStyle} onChange={e => setFormData({...formData, studentId: e.target.value})} required />
                        <input placeholder="Full Name" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input placeholder="Email" type="email" className={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <input placeholder="Program" className={inputStyle} onChange={e => setFormData({...formData, program: e.target.value})} />
                        <input placeholder="Department" className={inputStyle} onChange={e => setFormData({...formData, department: e.target.value})} />
                        <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold">Save to Mongo</button>
                    </form>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    {mongoStudents.map(s => (
                        <div key={s.studentId} className={`${cardBg} p-5 rounded-xl border dark:border-gray-700 shadow-sm flex justify-between items-center`}>
                            <div>
                                <h4 className="font-bold text-lg">{s.name} <span className="text-sm font-normal text-gray-400">({s.studentId})</span></h4>
                                <p className="text-sm text-blue-500">{s.email}</p>
                                <p className="text-xs text-gray-500 mt-1">{s.program?.programName} | {s.program?.department}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(s.studentId, 'students', () => fetchEntities(MONGO_API, 'students', setMongoStudents))} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- CASSANDRA ANALYTICS --- */}
        {database === 'cassandra' && activeTab === 'analytics' && (
             <div className="space-y-6 animate-fadeIn">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Manual Add Form */}
                     <div className={`${cardBg} p-6 rounded-xl shadow-sm h-fit`}>
                         <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2"><PlusCircle /> New Entry</h2>
                         <form onSubmit={(e) => handleCreate(e, 'analytics')} className="space-y-3">
                             <select className={inputStyle} onChange={e => setFormData({...formData, category: e.target.value})} value={formData.category || analyticsCategory}>
                                 <option value="TOP_COURSES">Top Courses</option>
                                 <option value="MOST_ACTIVE_STUDENTS">Most Active Students</option>
                                 <option value="STUDENT_AVG_SCORE">Student Avg Score</option>
                             </select>
                             <input placeholder="Entity ID (e.g. CS101 or S1)" className={inputStyle} onChange={e => setFormData({...formData, entity_id: e.target.value})} required />
                             <input placeholder="Metric Value" type="number" step="0.01" className={inputStyle} onChange={e => setFormData({...formData, metric_value: e.target.value})} required />
                             <input placeholder="Rank" type="number" className={inputStyle} onChange={e => setFormData({...formData, rank: e.target.value})} required />
                             <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Store in Cassandra</button>
                         </form>
                     </div>
                     
                     <div className="lg:col-span-2 space-y-6">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                {['TOP_COURSES', 'MOST_ACTIVE_STUDENTS', 'STUDENT_AVG_SCORE'].map(cat => (
                                    <button key={cat} onClick={() => { setAnalyticsCategory(cat); fetchCassandraAnalytics(cat); }} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${analyticsCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{cat.replace(/_/g, ' ')}</button>
                                ))}
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analyticsData.map((item, i) => (
                                <div key={i} className={`${cardBg} p-6 rounded-xl border shadow-sm flex justify-between items-center`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">#{item.rank}</div>
                                        <div><h4 className="font-bold">{item.entity_id}</h4><p className="text-xs text-gray-400">Score/Metric</p></div>
                                    </div>
                                    <div className="text-2xl font-black text-blue-600">{item.metric_value}</div>
                                </div>
                            ))}
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* --- INFLUX ACTIVITIES --- */}
        {database === 'influx' && activeTab === 'metrics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                <div className={`${cardBg} p-6 rounded-xl shadow-sm h-fit space-y-6`}>
                    <h2 className="text-xl font-black text-pink-600">Register Action</h2>
                    <form onSubmit={(e) => handleCreate(e, 'metrics')} className="space-y-4">
                        <input placeholder="Student ID" className={inputStyle} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
                        <select className={inputStyle} onChange={e => setFormData({...formData, action: e.target.value})}>
                            <option value="">Select Activity</option>
                            <option value="login">Login</option>
                            <option value="quiz">Quiz</option>
                            <option value="attendance">Attendance</option>
                        </select>
                        {formData.action === 'attendance' ? (
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setFormData({...formData, attendanceStatus: 'present'})} className={`flex-1 py-2 rounded border ${formData.attendanceStatus === 'present' ? 'bg-green-100 border-green-500' : ''}`}>Present</button>
                                <button type="button" onClick={() => setFormData({...formData, attendanceStatus: 'absent'})} className={`flex-1 py-2 rounded border ${formData.attendanceStatus === 'absent' ? 'bg-red-100 border-red-500' : ''}`}>Absent</button>
                            </div>
                        ) : <input placeholder="Score" type="number" className={inputStyle} onChange={e => setFormData({...formData, value: e.target.value})} />}
                        <button className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold">Log Record</button>
                    </form>
                    <button onClick={() => generateAnalytics('AVG_SCORE')} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center gap-2 font-bold"><BarChart2 size={18} /> Store Avg to Cassandra</button>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className={`${cardBg} p-6 rounded-xl border`}>
                        <div className="flex gap-2 mb-6">
                            <input placeholder="Enter Student ID" className={inputStyle} value={influxStudentId} onChange={e => setInfluxStudentId(e.target.value)} />
                            <button onClick={fetchInfluxMetrics} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Query</button>
                        </div>
                        {influxMetrics.length > 0 ? (
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={influxMetrics}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="_time" tickFormatter={t => new Date(t).toLocaleTimeString()}/><YAxis/><Tooltip/><Line type="step" dataKey={d => d.score || d._value} stroke="#db2777" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div>
                        ) : <div className="h-64 flex items-center justify-center text-gray-400">No time-series data</div>}
                        <div className="mt-8 border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-500 mb-3">Event History</h4>
                            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {[...influxMetrics].reverse().map((m, i) => (
                                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 rounded-lg flex justify-between items-center animate-slideUp">
                                        <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${m.status === 'absent' ? 'bg-red-500' : 'bg-green-500'}`} /><div><p className="font-bold text-sm uppercase">{m.activity_type || m.action}</p><p className="text-xs text-gray-400">{new Date(m._time).toLocaleString()}</p></div></div>
                                        <div className="font-black text-pink-600">{m.status || m.score || m._value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- AGGREGATIONS TAB --- */}
        {activeTab === 'aggregations' && (
            <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Neo4j: Dept Influence */}
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Users className="text-blue-600"/> Dept Influence (Neo4j)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptInfluence}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="dept"/>
                                    <YAxis />
                                    <Tooltip/>
                                    <Legend />
                                    <Bar dataKey="studentCount" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]}/>
                                    <Bar dataKey="courseCount" fill="#8b5cf6" name="Courses" radius={[4, 4, 0, 0]}/>
                                    <Bar dataKey="instructorCount" fill="#f59e0b" name="Instructors" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Mongo: Program GPA */}
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-green-600"/> Program GPA (MongoDB)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={programGPA} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis type="number" domain={[0, 4]}/>
                                    <YAxis dataKey="programName" type="category" width={100}/>
                                    <Tooltip/>
                                    <Bar dataKey="avgGpa" fill="#10b981" name="Avg GPA" radius={[0, 4, 4, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cassandra: Global GPA Trend */}
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Activity className="text-purple-600"/> Global GPA Trend (Cassandra)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={globalGPATrend}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="semester"/>
                                    <YAxis domain={[0, 4]}/>
                                    <Tooltip/>
                                    <Line type="monotone" dataKey="avg_gpa" stroke="#a855f7" strokeWidth={4} name="Global Avg GPA"/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart2 className="text-pink-600"/> Peak Activity Hours (InfluxDB)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={peakHours}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="hour" tickFormatter={h => `${h}:00`}/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Line type="basis" dataKey="count" stroke="#ec4899" strokeWidth={4} name="Activities" dot={true}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 3s linear infinite; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; } @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } } .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }`}</style>
    </div>
  );
}
