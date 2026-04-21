import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import './Public.css';

const PublicLayout = () => {
  return (
    <div className="public-app-container">
      <PublicHeader />
      <main className="public-main-content">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
export default PublicLayout;
