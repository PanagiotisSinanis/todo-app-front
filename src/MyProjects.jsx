import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './MyProjects.css';
import CreateTask from './CreateTask'; 


function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
    const navigate = useNavigate(); 

  useEffect(() => {
    axios.get('http://localhost:8000/api/my-projects', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
      }
    }).then(res => {
      setProjects(res.data.projects);
    }).catch(err => {
      console.error('Error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const goToDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
  <div className="project-list-container">
    <h1>My Projects</h1>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <ul className="project-list">
        {projects.map(project => (
          <li key={project.id}>
            <strong>{project.name}</strong>
            <p>{project.description}</p>
            <button onClick={() => setSelectedProjectId(project.id)}>Add Task</button>
            {selectedProjectId === project.id && (
  <CreateTask projectId={project.id} onClose={() => setSelectedProjectId(null)} />
)}

          </li>
        ))}
      </ul>
    )}
    <button onClick={() => navigate('/user/dashboard')}>Back</button>
  </div>
);
}

export default MyProjects;
