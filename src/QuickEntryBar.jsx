import React, { useEffect, useState, useRef } from 'react';
import { Button, Select, Typography, Space } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Option } = Select;
const { Text } = Typography;

const QuickEntryBar = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // On mount, check for active timer
  useEffect(() => {
    const fetchActiveEntry = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/time/active', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        if (res.data.active && res.data.entry?.start_time) {
         const startedAt = dayjs.utc(res.data.entry.start_time);
const now = dayjs.utc();
const diff = now.diff(startedAt, 'second');

          setStartTime(startedAt);
          setElapsed(diff);
          setIsRunning(true);
          setSelectedProject(res.data.entry.project_id || null);
          setSelectedTask(res.data.entry.task_id || null);

          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setElapsed(prev => prev + 1);
          }, 1000);
        } else {
          setIsRunning(false);
          setElapsed(0);
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error('Failed to fetch active timer:', err);
      }
    };

    fetchActiveEntry();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/my-projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) return;

      try {
        const res = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setTasks([]);
      }
    };

    fetchTasks();
    setSelectedTask(null);
  }, [selectedProject]);

  const handleStart = async () => {
    if (!selectedProject) return;

    try {
      await axios.post('http://localhost:8000/api/time/start', {
        project_id: selectedProject,
        task_id: selectedTask,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });

      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
      setElapsed(0);

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting time entry:', err.response?.data);
      alert('Failed to start timer');
    }
  };

  const handleStop = async () => {
    if (!startTime || !selectedProject) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);

    try {
      await axios.post('http://localhost:8000/api/time/stop', {
        project_id: selectedProject,
        task_id: selectedTask,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });

      setIsRunning(false);
      setElapsed(0);
      setStartTime(null);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const formatElapsed = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{
      background: '#f0f2f5',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <Space direction="vertical" size="small">
        <Text strong>Quick Timer Entry</Text>

        <Select
          placeholder="Select Project"
          style={{ minWidth: 200 }}
          onChange={value => setSelectedProject(value)}
          value={selectedProject}
        >
          {projects.map(project => (
            <Option key={project.id} value={project.id}>
              {project.name}
            </Option>
          ))}
        </Select>

        {tasks.length > 0 && (
          <Select
            placeholder="Select Task"
            style={{ minWidth: 200 }}
            onChange={value => setSelectedTask(value)}
            value={selectedTask}
          >
            {tasks.map(task => (
              <Option key={task.id} value={task.id}>
                {task.title}
              </Option>
            ))}
          </Select>
        )}
      </Space>

      <Space direction="horizontal">
        <Button
          type="primary"
          onClick={handleStart}
          disabled={!selectedProject || isRunning}
          style={{ borderRadius: 6 }}
        >
          Start
        </Button>
        <Button
          danger
          onClick={handleStop}
          disabled={!isRunning}
          style={{ borderRadius: 6, marginLeft: 8 }}
        >
          Stop
        </Button>
        <Text style={{ marginLeft: 16, fontWeight: 'bold' }}>
          {isRunning ? formatElapsed(elapsed) : '00:00:00'}
        </Text>
      </Space>
    </div>
  );
};

export default QuickEntryBar;
