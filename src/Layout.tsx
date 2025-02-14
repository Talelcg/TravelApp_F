import { Outlet } from 'react-router-dom';
import Sidebar from '../src/models/Sidebar';
import '../src/Layout.css';
const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};


export default Layout;
