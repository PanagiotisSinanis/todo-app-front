import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import './TaskList.css';
import './NewTask.css';
import logo from './assets/apollo_gs_logo.jfif';





const getToken = () => localStorage.getItem('apiToken');

// ---------------- LOGIN ----------------
function LoginPage({ setLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password });
      localStorage.setItem('apiToken', response.data.token);
      setUser(response.data.user);
      setLoggedIn(true);
      navigate('/');
    } catch {
      setError('Login failed');
    }
  };

 return (
    <div className="container">
  <div className="card">
    <img src={logo} alt="App Logo" className="logo" />
    <h2 className="title">Login</h2>
    <form onSubmit={handleLogin} className="form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="input"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" className="button">Login</button>
    </form>
    <button
      className="linkButton"
      onClick={() => navigate('/register')}
    >
      Don't have an account? Sign up
    </button>
  </div>
</div>

  );
}

// ---------------- REGISTER ----------------
function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/register', {
        name,
        email,
        password
      });
      alert('Registration successful. Log in.');
      navigate('/login');
    } catch {
      setError('Registration failed');
    }
  };

   return (
    <div className="container">
      <div className="card">
        <img src={logo} alt="App Logo" className="logo" />
        <h2 className="title">Register</h2>
        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">Register</button>
        </form>
        <button
          className="linkButton"
          onClick={() => navigate('/login')}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}


// ---------------- TASK LIST ----------------
function TaskList({ setLoggedIn, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (date) params.date = date;

      const res = await axios.get('http://localhost:8000/api/tasks', {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
      setTasks(res.data);
    } catch {
      localStorage.removeItem('apiToken');
      setLoggedIn(false);
      setUser(null);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch {}
    localStorage.removeItem('apiToken');
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/tasks/${id}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchTasks();
    } catch {
      alert('Σφάλμα στην ολοκλήρωση');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchTasks();
    } catch {
      alert('Σφάλμα στη διαγραφή');
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

   return (
    <div className="task-container">
      <div className="task-header">
        <h2>Tasks</h2>
        <div>
          <button onClick={() => navigate('/tasks/new')}>New Task</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <form onSubmit={handleFilterSubmit} className="task-filter-form">
        <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button type="submit">Filter</button>
      </form>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.status || 'pending'} — {task.deadline || 'no date'}
            <br />
            <button onClick={() => handleComplete(task.id)} disabled={task.status === 'completed'}>
              Complete
            </button>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- NEW TASK ----------------
function NewTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/tasks', { title, description, deadline }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      navigate('/');
    } catch {
      alert('Σφάλμα δημιουργίας task');
    }
  };

  return (
    <div className="new-task-container">
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit} className="new-task-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
        <button type="submit">Add Task</button>
        <button type="button" onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
}

// ---------------- APP ----------------
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (getToken()) setLoggedIn(true);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={loggedIn ? <TaskList setLoggedIn={setLoggedIn} setUser={setUser} /> : <LoginPage setLoggedIn={setLoggedIn} setUser={setUser} />} />
        <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks/new" element={<NewTask />} />
      </Routes>
    </Router>
  );
}

export default App;
