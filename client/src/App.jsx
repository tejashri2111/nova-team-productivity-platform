import Auth from "./Auth";
import API from "./api";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState("Dashboard");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [users, setUsers] = useState([]);

  // ---------------- FETCH PROJECTS ----------------

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, [user]);

  // ---------------- FETCH TASKS ----------------

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const response = await API.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchTasks();
  }, [user]);

  useEffect(() => {
  if (!user) return;

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  fetchUsers();
}, [user]);

  // ---------------- CREATE PROJECT ----------------

  const createProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    try {
      const response = await API.post("/projects", {
        name: projectName,
        description: projectDescription,
      });

      setProjects((prev) => [response.data, ...prev]);

      setProjectName("");
      setProjectDescription("");
      setShowProjectForm(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create project"
      );
    }
  };

  // ---------------- CREATE TASK ----------------

  const createTask = async () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (projects.length === 0) {
      alert("Please create a project first.");
      return;
    }

    try {
      const response = await API.post("/tasks", {
        title: taskTitle,
        project: projects[0]._id,
        priority: taskPriority,
      });

      setTasks((prev) => [response.data, ...prev]);

      setTaskTitle("");
      setTaskPriority("Medium");
      setShowTaskForm(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  // ---------------- UPDATE TASK STATUS ----------------

  const updateTaskStatus = async (task) => {
    let newStatus;

    if (task.status === "Todo") {
      newStatus = "In Progress";
    } else if (task.status === "In Progress") {
      newStatus = "Completed";
    } else {
      newStatus = "Todo";
    }

    try {
      const response = await API.put(`/tasks/${task._id}`, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

    // ---------------- PROJECT PROGRESS ----------------

  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(
      (task) => task.project?._id === projectId
    );

    if (projectTasks.length === 0) {
      return 0;
    }

    const completedTasks = projectTasks.filter(
      (task) => task.status === "Completed").length;

    return Math.round(
      (completedTasks / projectTasks.length) * 100
    );
  };

  // ---------------- LOGOUT ----------------

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
};

  // ---------------- AUTH ----------------

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // ---------------- UI ----------------

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-box">N</div>
          <span>NOVA</span>
        </div>

        <p className="menu-title">MENU</p>

        {["Dashboard", "Projects", "Tasks", "Team"].map(
          (item) => (
            <button
              key={item}
              className={`menu-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              <span>
                {item === "Dashboard" && "▦"}
                {item === "Projects" && "◈"}
                {item === "Tasks" && "✓"}
                {item === "Team" && "◉"}
              </span>

              {item}
            </button>
          )
        )}

        <div className="sidebar-bottom">

          <p className="menu-title">WORKSPACE</p>

          <button className="menu-item">
            ⚙ Settings
          </button>

          <button
            className="menu-item"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div>
            <h1>{activePage}</h1>
            <p>Plan. Collaborate. Deliver.</p>
          </div>

          <div className="profile">

            <div className="notification">
              🔔
            </div>

            <div className="avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>

          </div>

        </header>

        {/* ================= DASHBOARD ================= */}

        {activePage === "Dashboard" && (
          <>

            {/* STATS */}

            <section className="stats">

              <div className="stat-card">
                <div className="stat-icon purple">
                  ◈
                </div>

                <div>
                  <span>Total Projects</span>
                  <h2>{projects.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  ✓
                </div>

                <div>
                  <span>Total Tasks</span>
                  <h2>{tasks.length}</h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  ✓
                </div>

                <div>
                  <span>Completed</span>

                  <h2>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "Completed"
                      ).length
                    }
                  </h2>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  ◷
                </div>

                <div>
                  <span>In Progress</span>

                  <h2>
                    {
                      tasks.filter(
                        (task) =>
                          task.status === "In Progress"
                      ).length
                    }
                  </h2>
                </div>
              </div>

            </section>

            {/* PROJECTS */}

            <section className="section">

              <div className="section-header">

                <div>
                  <h2>Projects</h2>
                  <p>
                    Track your team's projects
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setShowProjectForm(true)
                  }
                >
                  + New Project
                </button>

              </div>

              <div className="project-grid">

                {projects.map((project) => (

                  <div
                    className="project-card"
                    key={project._id}
                  >

                    <div className="project-top">
                      <div className="project-icon">
                        ◈
                      </div>

                      <button className="more">
                        •••
                      </button>
                    </div>

                    <h3>{project.name}</h3>

                    <p>
                      {project.description ||
                        "No description"}
                    </p>

                    <div className="progress-label">
                    <span>Progress</span>

                    <strong> {getProjectProgress(project._id)}% </strong>
                    </div>

                    <div className="progress-bar"><div
                     style={{ width: `${getProjectProgress(project._id)}%`,}}
                    ></div>
                    </div>  
                   <div className="project-footer">
                      <span>
                        Project
                      </span>

                      <span>
                        View project →
                      </span>
                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* TASKS */}

            <section className="section">

              <div className="section-header">

                <div>
                  <h2>Recent Tasks</h2>
                  <p>
                    Manage your team's tasks
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setShowTaskForm(true)
                  }
                >
                  + Add Task
                </button>

              </div>

              <div className="task-table">

                <div className="table-header">
                  <span>Task</span>
                  <span>Project</span>
                  <span>Priority</span>
                  <span>Status</span>
                </div>

                {tasks.map((task) => (

                  <div
                    className="table-row"
                    key={task._id}
                  >

                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {task.project?.name ||
                        "Project"}
                    </span>

                    <span
                      className={`priority ${
                        task.priority?.toLowerCase()
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      className={`status ${
                        task.status
                          ?.toLowerCase()
                          .replace(" ", "-")
                      }`}
                      onClick={() =>
                        updateTaskStatus(task)
                      }
                    >
                      {task.status}
                    </button>

                  </div>

                ))}

              </div>

            </section>

          </>
        )}

        {/* ================= PROJECTS ================= */}

        {activePage === "Projects" && (

          <section className="page-box">

            <div className="section-header">

              <div>
                <h2>Projects</h2>
                <p>
                  All your projects
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowProjectForm(true)
                }
              >
                + New Project
              </button>

            </div>

            <div className="project-grid">

              {projects.map((project) => (

                <div
                  className="project-card"
                  key={project._id}
                >

                  <div className="project-icon">
                    ◈
                  </div>

                  <h3>
                    {project.name}
                  </h3>

                  <p>
                    {project.description ||
                      "No description"}
                  </p>

                  <strong> {getProjectProgress(project._id)}% completed </strong>

                </div>

              ))}

            </div>

          </section>

        )}

        {/* ================= TASKS ================= */}

        {activePage === "Tasks" && (

          <section className="page-box">

            <div className="section-header">

              <div>
                <h2>All Tasks</h2>
                <p>
                  Click a status to update
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  setShowTaskForm(true)
                }
              >
                + Add Task
              </button>

            </div>

            <div className="task-table">

              {tasks.map((task) => (

                <div
                  className="table-row"
                  key={task._id}
                >

                  <strong>
                    {task.title}
                  </strong>

                  <span>
                    {task.project?.name ||
                      "Project"}
                  </span>

                  <span>
                    {task.priority}
                  </span>

                  <button
                    className="status"
                    onClick={() =>
                      updateTaskStatus(task)
                    }
                  >
                    {task.status}
                  </button>

                </div>

              ))}

            </div>

          </section>

        )}

{/* ================= TEAM ================= */}

{activePage === "Team" && (

  <section className="page-box">

    <h2>Team Members</h2>

    <p>
      Manage your project team.
    </p>

    <div className="team-grid">

      {users.length === 0 ? (

        <p>No team members found.</p>

      ) : (

        users.map((member) => (

          <div
            className="member"
            key={member._id}
          >

            <div className="big-avatar">
              {member.name?.charAt(0).toUpperCase()}
            </div>

            <h3>{member.name}</h3>

            <p>{member.role}</p>

            <small>{member.email}</small>

          </div>

        ))

      )}

    </div>

  </section>

)}

        {/* ================= PROJECT POPUP ================= */}

        {showProjectForm && (

          <div className="project-form-overlay">

            <div className="project-form">

              <h2>Create New Project</h2>

              <p>
                Add a new project to your workspace.
              </p>

              <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
              />

              <textarea
                placeholder="Project description"
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(
                    e.target.value
                  )
                }
              />

              <div className="project-form-actions">

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowProjectForm(false);
                    setProjectName("");
                    setProjectDescription("");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="primary-btn"
                  onClick={createProject}
                >
                  Create Project
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= TASK POPUP ================= */}

        {showTaskForm && (

          <div className="project-form-overlay">

            <div className="project-form">

              <h2>Create New Task</h2>

              <p>
                Add a task to your workspace.
              </p>

              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(e.target.value)
                }
              />

              <select
                value={taskPriority}
                onChange={(e) =>
                  setTaskPriority(e.target.value)
                }
              >

                <option value="Low">
                  Low Priority
                </option>

                <option value="Medium">
                  Medium Priority
                </option>

                <option value="High">
                  High Priority
                </option>

              </select>

              <div className="project-form-actions">

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskTitle("");
                    setTaskPriority("Medium");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="primary-btn"
                  onClick={createTask}
                >
                  Create Task
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;