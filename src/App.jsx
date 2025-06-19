import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Φόρμα login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Πάρε CSRF cookie
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });

      // Κάνε login
      await axios.post(
        'http://localhost:8000/login',
        { email, password },
        { withCredentials: true }
      );

      setLoggedIn(true);

      // Φέρε τα tasks μετά το login
      const response = await axios.get('http://localhost:8000/tasks', { withCredentials: true });
      setTasks(response.data);

    } catch (err) {
      setError('Login failed');
      console.error(err);
    }
  };

  // Αν είσαι ήδη logged in (πχ αν έχεις session cookie), φέρε τα tasks αυτόματα
  useEffect(() => {
    if (loggedIn) return; // Μην ξανακαλέσεις αν ήδη logged in

    axios.get('http://localhost:8000/tasks', { withCredentials: true })
      .then(res => {
        setLoggedIn(true);
        setTasks(res.data);
      })
      .catch(() => {
        // Δεν είσαι logged in ή κάποιο άλλο σφάλμα
      });
  }, [loggedIn]);

  return (
    <div>
      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p style={{color: 'red'}}>{error}</p>}
        </form>
      ) : (
        <div>
          <h2>Tasks</h2>
          <ul>
            {tasks.map(task => (
              <li key={task.id}>{task.title} - {task.status || 'pending'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
