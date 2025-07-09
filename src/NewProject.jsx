import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NewTask.css';

const getToken = () => localStorage.getItem('apiToken');
const getUserId = () => localStorage.getItem('userId');
const getUserRole = () => localStorage.getItem('userRole');

function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then(response => {
        setAllUsers(response.data.users);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'http://localhost:8000/api/projects',
        {
          name,
          description,
          user_ids: selectedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Project created successfully');
      if (role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      if (err.response) {
        console.error('Response data:', err.response.data);
        alert(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        console.error('Error:', err.message);
        alert('Error creating project');
      }
    }
  };

  return (
    <div className="new-task-container">
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit} className="new-task-form">
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Project Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <label>Select users for this project:</label>
        <select
          multiple
          value={selectedUsers}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions);
            const values = options.map(option => parseInt(option.value));
            setSelectedUsers(values);
          }}
        >
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>

        <button type="submit">Create</button>
        <button
          type="button"
          onClick={() =>
            navigate(role === 'superadmin' ? '/superadmin/dashboard' : '/user/dashboard')
          }
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default NewProject;
