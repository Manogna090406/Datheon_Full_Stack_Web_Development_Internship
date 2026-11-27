/* =========================================
   TASKNOVA — TURN PLANS INTO PROGRESS
   ========================================= */

const { useState, useEffect, useMemo } = React;
const { motion, AnimatePresence, Reorder } = window.Motion;

const Icon = ({ name, className = "w-5 h-5" }) => {
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
    return <i data-lucide={name} className={className}></i>;
};

const QUOTES = [
    "Productivity is never an accident. It is always the result of commitment.",
    "Small progress every day leads to big results.",
    "Your future is created by what you do today."
];

const STORAGE_KEY = "tasknova_missions_v1";
const THEME_KEY = "tasknova_theme_v1";

function App() {
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        return savedTheme ? savedTheme === "dark" : true;
    });

    const [activeNav, setActiveNav] = useState("dashboard");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Work");
    const [priority, setPriority] = useState("Medium");
    const [dueDate, setDueDate] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [toast, setToast] = useState(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", darkMode);
        document.body.classList.toggle("dark-mode", darkMode);
        document.body.classList.toggle("light-mode", !darkMode);
    }, [darkMode]);

    useEffect(() => {
        const timer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const triggerToast = (message) => {
        setToast({ message, id: Date.now() });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const fireConfetti = () => {
        if (window.confetti) {
            window.confetti({
                particleCount: 70,
                spread: 65,
                origin: { y: 0.7 },
                colors: ["#8B5CF6", "#6366F1", "#EC4899", "#22C55E"]
            });
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (editingId) {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === editingId
                        ? { ...t, title: title.trim(), category, priority, dueDate }
                        : t
                )
            );
            triggerToast("Mission updated successfully!");
            setEditingId(null);
        } else {
            const newTask = {
                id: `mission-${Date.now()}`,
                title: title.trim(),
                category,
                priority,
                dueDate,
                completed: false
            };
            setTasks((prev) => [newTask, ...prev]);
            triggerToast("New mission launched!");
        }

        setTitle("");
        setCategory("Work");
        setPriority("Medium");
        setDueDate("");
    };

    const toggleComplete = (id) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    const nextState = !t.completed;
                    if (nextState) {
                        fireConfetti();
                        triggerToast("Achievement unlocked! Mission completed");
                    }
                    return { ...t, completed: nextState };
                }
                return t;
            })
        );
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setTitle(task.title);
        setCategory(task.category);
        setPriority(task.priority);
        setDueDate(task.dueDate || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setTitle("");
        }
        triggerToast("Mission removed from workspace");
    };

    const clearAllTasks = () => {
        setTasks([]);
        setEditingId(null);
        setTitle("");
        triggerToast("All missions cleared");
    };

    const getCountdown = (dateStr) => {
        if (!dateStr) return { text: "No deadline", color: "text-slate-400" };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(`${dateStr}T00:00:00`);
        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: "text-rose-400 font-semibold" };
        if (diffDays === 0) return { text: "Due today", color: "text-amber-400 font-semibold" };
        if (diffDays === 1) return { text: "Due tomorrow", color: "text-indigo-400" };
        return { text: `In ${diffDays} days`, color: "text-slate-400" };
    };

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const inProgress = total - completed;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

        const byCategory = {
            Work: tasks.filter((t) => t.category === "Work").length,
            Study: tasks.filter((t) => t.category === "Study").length,
            Personal: tasks.filter((t) => t.category === "Personal").length
        };

        return { total, completed, inProgress, rate, byCategory };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => {
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && !t.completed) ||
                (statusFilter === "completed" && t.completed);

            const matchesCategory =
                categoryFilter === "all" || t.category === categoryFilter;

            const matchesSearch =
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesCategory && matchesSearch;
        });
    }, [tasks, statusFilter, categoryFilter, searchQuery]);

    const handleNavClick = (navId, filter = "all") => {
        setActiveNav(navId);
        setStatusFilter(filter);
        setMobileMenuOpen(false);
    };

    const priorityBadge = (level) => {
        if (level === "High") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
        if (level === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    };

    const categoryBadge = (cat) => {
        if (cat === "Work") return "bg-violet-500/15 text-violet-400 border-violet-500/30";
        if (cat === "Study") return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
        return "bg-pink-500/15 text-pink-400 border-pink-500/30";
    };

    const isFiltered = statusFilter !== "all" || categoryFilter !== "all" || searchQuery.trim() !== "";
    const inputClasses = darkMode
        ? "px-4 py-3 rounded-xl bg-slate-900/70 text-slate-100 border border-white/15 focus:border-violet-500 focus:outline-none text-sm"
        : "px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 focus:border-violet-500 focus:outline-none text-sm";

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 glass-card border-b border-white/10 sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-violet-500/30">
                        ✦
                    </div>
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                        TaskNova
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setDarkMode((prev) => !prev)}
                        className="p-2 rounded-xl glass-card hover:border-violet-500/50 transition"
                        aria-label="Toggle Theme"
                    >
                        {darkMode ? <Icon name="sun" className="w-5 h-5 text-amber-400" /> : <Icon name="moon" className="w-5 h-5 text-violet-600" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="p-2 rounded-xl glass-card"
                        aria-label="Toggle Menu"
                    >
                        <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Responsive Sidebar Navigation */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-68 lg:w-72 p-6 flex flex-col justify-between glass-card border-r border-white/10 transition-transform duration-300 ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div>
                    <div className="flex items-center gap-3 mb-9">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-violet-500/30">
                            ✦
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                                TaskNova
                            </h1>
                            <p className="text-[11px] font-medium opacity-60 tracking-wide">
                                Turn Plans Into Progress
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-45 px-3 mb-3">
                        Workspace
                    </p>
                    <nav className="space-y-1.5">
                        {[
                            { id: "dashboard", label: "🏠 Dashboard", filter: "all" },
                            { id: "all", label: "📋 All Tasks", filter: "all" },
                            { id: "active", label: "⚡ In Progress", filter: "active" },
                            { id: "completed", label: "✅ Completed", filter: "completed" },
                            { id: "analytics", label: "📊 Analytics", filter: "all" },
                            { id: "settings", label: "⚙ Settings", filter: "all" }
                        ].map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => handleNavClick(item.id, item.filter)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    activeNav === item.id
                                        ? "bg-gradient-to-r from-violet-500/20 to-pink-500/15 border border-violet-500/40 text-violet-300 shadow-sm"
                                        : "opacity-75 hover:opacity-100 hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <span>{item.label}</span>
                                {item.id === "active" && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                                        {stats.inProgress}
                                    </span>
                                )}
                                {item.id === "completed" && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                        {stats.completed}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-5 border-t border-white/10 space-y-4">
                    <button
                        type="button"
                        onClick={() => setDarkMode((prev) => !prev)}
                        className="w-full py-2.5 px-4 rounded-xl glass-card hover:border-violet-500/40 flex items-center justify-center gap-2 text-xs font-semibold transition"
                    >
                        {darkMode ? (
                            <>
                                <Icon name="sun" className="w-4 h-4 text-amber-400" />
                                <span>Switch to Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Icon name="moon" className="w-4 h-4 text-violet-600" />
                                <span>Switch to Dark Mode</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            TN
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight">TaskNova User</p>
                            <p className="text-xs opacity-60">Local Workspace</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
                {/* 1. Hero Welcome Section */}
                <motion.section
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                >
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute right-20 -bottom-20 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 mb-3">
                                👋 Welcome Back
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                                TaskNova{" "}
                                <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                    — Turn Plans Into Progress
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base opacity-75 max-w-2xl">
                                Transform your ideas into achievements. Organize, track, and complete every task with confidence.
                            </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <div className="px-4 py-2 rounded-2xl glass-card text-xs font-semibold opacity-85 flex items-center gap-2">
                                <Icon name="calendar" className="w-4 h-4 text-violet-400" />
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Settings Panel */}
                {activeNav === "settings" && (
                    <motion.section
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-3xl p-6 sm:p-8 space-y-4"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            ⚙ Workspace Settings
                        </h2>
                        <p className="text-sm opacity-75">
                            Switch theme mode or clear all tasks stored in localStorage.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setDarkMode((prev) => !prev)}
                                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
                            >
                                Switch to {darkMode ? "Light" : "Dark"} Mode
                            </button>
                            <button
                                type="button"
                                onClick={clearAllTasks}
                                className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm font-semibold transition"
                            >
                                Clear All Tasks
                            </button>
                        </div>
                    </motion.section>
                )}

                {/* 2. Dashboard Statistics Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass-card glass-card-hover rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold opacity-85">📋 Total Tasks</span>
                            <span className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                                <Icon name="layers" className="w-4 h-4" />
                            </span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-violet-400 mb-1">{stats.total}</h2>
                        <p className="text-xs opacity-65">Keep track of all your productivity goals.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card glass-card-hover rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold opacity-85">⚡ In Progress</span>
                            <span className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                                <Icon name="zap" className="w-4 h-4" />
                            </span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-amber-400 mb-1">{stats.inProgress}</h2>
                        <p className="text-xs opacity-65">Tasks currently demanding your attention.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card glass-card-hover rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold opacity-85">✅ Achievements</span>
                            <span className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                                <Icon name="trophy" className="w-4 h-4" />
                            </span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-emerald-400 mb-1">{stats.completed}</h2>
                        <p className="text-xs opacity-65">Successfully completed milestones.</p>
                    </motion.div>
                </section>

                {/* 3. Create New Mission Form */}
                {activeNav !== "analytics" && (
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-3xl p-6 sm:p-8"
                    >
                        <div className="mb-5">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                {editingId ? "✏️ Update Mission" : "Create New Mission 🚀"}
                            </h2>
                            <p className="text-xs sm:text-sm opacity-70 mt-1">
                                Plan smarter, stay organized, and accomplish more every day.
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a new mission..."
                                required
                                className={`md:col-span-5 ${inputClasses}`}
                            />

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`md:col-span-2 ${inputClasses}`}
                            >
                                <option value="Work">Work</option>
                                <option value="Study">Study</option>
                                <option value="Personal">Personal</option>
                            </select>

                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className={`md:col-span-2 ${inputClasses}`}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={`md:col-span-3 ${inputClasses}`}
                            />

                            <div className="md:col-span-12 flex flex-wrap items-center justify-end gap-3 pt-1">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setTitle("");
                                        }}
                                        className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-violet-600/30 transition transform hover:-translate-y-0.5"
                                >
                                    {editingId ? "✓ Save Changes" : "✨ Create Task"}
                                </button>
                            </div>
                        </form>
                    </motion.section>
                )}

                {/* 4. Task Management Table & Drag-and-Drop List */}
                {activeNav !== "analytics" && (
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
                    >
                        <div className="flex flex-col md:flex-row gap-3.5 justify-between">
                            <div className="relative flex-1">
                                <span className="absolute left-3.5 top-3.5 opacity-50">
                                    <Icon name="search" className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tasks by title or category..."
                                    className={`w-full pl-10 ${inputClasses}`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {["all", "Work", "Study", "Personal"].map((cat) => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                                            categoryFilter === cat
                                                ? "bg-violet-600 border-violet-500 text-white"
                                                : "border-white/10 opacity-75 hover:opacity-100"
                                        }`}
                                    >
                                        {cat === "all" ? "All Categories" : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                            <div className="flex gap-2">
                                {[
                                    { id: "all", label: "All" },
                                    { id: "active", label: "In Progress" },
                                    { id: "completed", label: "Completed" }
                                ].map((tab) => (
                                    <button
                                        type="button"
                                        key={tab.id}
                                        onClick={() => setStatusFilter(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            statusFilter === tab.id
                                                ? "bg-white/10 text-violet-300"
                                                : "opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs opacity-60">
                                {!isFiltered ? "Drag items to reorder" : `Showing ${filteredTasks.length} missions`}
                            </span>
                        </div>

                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-14 space-y-2">
                                <div className="text-4xl">📋</div>
                                <h3 className="text-lg font-bold">No tasks yet</h3>
                                <p className="text-xs opacity-65">
                                    Create a task above to start tracking your progress.
                                </p>
                            </div>
                        ) : (
                            <Reorder.Group
                                axis="y"
                                values={isFiltered ? filteredTasks : tasks}
                                onReorder={(newOrder) => {
                                    if (!isFiltered) setTasks(newOrder);
                                }}
                                className="space-y-3"
                            >
                                <AnimatePresence>
                                    {filteredTasks.map((task) => {
                                        const countdown = getCountdown(task.dueDate);
                                        return (
                                            <Reorder.Item
                                                key={task.id}
                                                value={task}
                                                dragListener={!isFiltered}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.96 }}
                                                className={`glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition ${
                                                    task.completed ? "opacity-70 border-emerald-500/20" : "border-white/10 hover:border-violet-500/40"
                                                }`}
                                            >
                                                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                                    {!isFiltered && (
                                                        <span className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-90 pt-1 sm:pt-0">
                                                            <Icon name="grip-vertical" className="w-4 h-4" />
                                                        </span>
                                                    )}

                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleComplete(task.id)}
                                                        className="w-5 h-5 rounded-md accent-violet-500 cursor-pointer mt-0.5 sm:mt-0 shrink-0"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <h4
                                                            className={`text-sm sm:text-base font-bold truncate ${
                                                                task.completed ? "line-through opacity-60" : ""
                                                            }`}
                                                        >
                                                            {task.title}
                                                        </h4>

                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                                            <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${categoryBadge(task.category)}`}>
                                                                {task.category}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${priorityBadge(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                            <span className={`flex items-center gap-1 ${countdown.color}`}>
                                                                <Icon name="clock" className="w-3.5 h-3.5" />
                                                                {countdown.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(task)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-violet-500/20 text-violet-300 transition"
                                                        title="Edit Task"
                                                    >
                                                        <Icon name="edit-3" className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteTask(task.id)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 transition"
                                                        title="Delete Task"
                                                    >
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </Reorder.Item>
                                        );
                                    })}
                                </AnimatePresence>
                            </Reorder.Group>
                        )}
                    </motion.section>
                )}

                {/* 5. Productivity Insights Analytics */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-extrabold">📈 Productivity Insights</h2>
                            <p className="text-xs sm:text-sm opacity-70 mt-1">
                                Visualize your progress and stay motivated toward your goals.
                            </p>
                        </div>
                        <span className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                            {stats.rate}%
                        </span>
                    </div>

                    <div className="w-full h-4 rounded-full bg-slate-800/80 overflow-hidden p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.rate}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full progress-gradient shadow-lg shadow-pink-500/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        {[
                            { label: "Work", count: stats.byCategory.Work, color: "bg-violet-500" },
                            { label: "Study", count: stats.byCategory.Study, color: "bg-indigo-500" },
                            { label: "Personal", count: stats.byCategory.Personal, color: "bg-pink-500" }
                        ].map((item) => {
                            const pct = stats.total === 0 ? 0 : Math.round((item.count / stats.total) * 100);
                            return (
                                <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>{item.label}</span>
                                        <span>{item.count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            style={{ width: `${pct}%` }}
                                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* 6. Motivational Quotes Section */}
                <section className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                            className="text-sm sm:text-base font-semibold italic opacity-85"
                        >
                            “{QUOTES[quoteIndex]}”
                        </motion.p>
                    </AnimatePresence>
                    <div className="flex justify-center gap-1.5 mt-3">
                        {QUOTES.map((_, idx) => (
                            <button
                                type="button"
                                key={idx}
                                onClick={() => setQuoteIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${
                                    quoteIndex === idx ? "w-6 bg-violet-400" : "w-1.5 bg-white/25"
                                }`}
                                aria-label={`Quote ${idx + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-xs opacity-60 pb-6">
                    Built with passion for productivity • TaskNova © 2026
                </footer>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl glass-card border border-violet-500/40 shadow-2xl flex items-center gap-3 text-sm font-bold"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);