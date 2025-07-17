import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import QuickEntryBar from './QuickEntryBar'; 
import { Card } from 'antd';


const { Header, Content, Sider } = Layout;

const UserLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ color: 'white', padding: '16px' }}>
          User Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={[
            {
              key: 'dashboard',
              icon: <UserOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/user/dashboard'),
            },
            {
              key: 'projects',
              icon: <ProjectOutlined />,
              label: 'My Projects',
              onClick: () => navigate('/my-projects'),
            },
            {
              key: 'create-project',
              icon: <PlusOutlined />,
              label: 'Create Project',
              onClick: () => navigate('/projects/new'),
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
         <Card style={{ marginBottom: 24 }}>
    <QuickEntryBar />
  </Card>
  
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
