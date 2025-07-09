import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyProjects.css';
import CreateTask from './CreateTask';
import TimeTracker from './TimeTracker';

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [timeTotals, setTimeTotals] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/my-projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        setProjects(res.data.projects);
        fetchAllTimeTotals(res.data.projects);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllTimeTotals(projects);
    }, 10000); 

    return () => clearInterval(interval);
  }, [projects]);

  const fetchAllTimeTotals = (projects) => {
    projects.forEach((project) => {
      axios
        .get(`http://localhost:8000/api/project/${project.id}/time-total`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        })
        .then((res) => {
          setTimeTotals((prev) => ({
            ...prev,
            [project.id]: res.data.formatted,
          }));
        })
        .catch((err) => {
          console.error(`Error loading time for project ${project.id}:`, err);
        });
    });
  };

  const goToDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="clockify-wrapper">
      <h1 className="page-title">My Projects</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tracker-list">
          {projects.map((project) => (
            <div key={project.id} className="tracker-card">
              <div className="tracker-header">
                <div>
                  <h2>{project.name}</h2>
                  <p className="project-description">{project.description}</p>
                </div>
                <div className="project-time">
                  {timeTotals[project.id] || '00:00:00'}
                </div>
              </div>

              <div className="tracker-controls">
                <TimeTracker projectId={project.id} />
              </div>

              <div className="tracker-buttons">
                <button onClick={() => setSelectedProjectId(project.id)}>+ Add Task</button>
                <button onClick={() => goToDetails(project.id)}>View Details</button>
              </div>

              {selectedProjectId === project.id && (
                <CreateTask
                  projectId={project.id}
                  onClose={() => setSelectedProjectId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/user/dashboard')} className="back-btn">
        Back
      </button>
    </div>
  );
}

export default MyProjects;
