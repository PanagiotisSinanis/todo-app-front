import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProjectList({ projects }) {
  const navigate = useNavigate();

  return (
    <div>
      {projects.map(project => (
        <div key={project.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{project.name}</span>
          <button onClick={() => navigate(`/projects/${project.id}`)}>Details</button>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
