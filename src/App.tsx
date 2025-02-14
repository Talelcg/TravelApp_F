import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './pages/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './Layout';
import Trips from './pages/trips';
import UploadPost from './pages/UploadPost';
import UserProfile from './pages/UserProfile';
import PlannerApi from './pages/PlannerApi';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/" element={<Auth />} />

      
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="trips" element={<Trips />} />
          <Route path="upload-post" element={<UploadPost />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="trip-planner" element={<PlannerApi />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
