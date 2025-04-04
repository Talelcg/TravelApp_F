import { useState, useEffect } from 'react';
import { getUserById } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faUpload, faUser, faRoute, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string>('Guest');
  const [profileImage, setProfileImage] = useState<string>("");


  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = localStorage.getItem('user');

    if (!token) {
      navigate('/', { replace: true });
    } else if (userId) {
      userId = userId.replace(/"/g, '');
      if (userId.trim()) {
        fetchUser(userId);
      }
    }
  }, [navigate]);

  const fetchUser = async (userId: string) => {
    try {
      const response = await getUserById(userId);
      setUserName((response.data as { username: string }).username);
      if (response.data.profileImage) {
        setProfileImage(`${response.data.profileImage}`);
      } else {
        setProfileImage("https://www.w3schools.com/w3images/avatar2.png"); // Default profile picture
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setUserName('Guest');
      setProfileImage("https://www.w3schools.com/w3images/avatar2.png");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="navbar">
      <div className="navbar-header">
        <h2>Easy Travel </h2>

      </div>

      <div className="user-profile">
        {/* User Profile Picture */}
        <img src={profileImage} alt="Profile" className="profile-image" />
        <span>{userName}</span>
      </div>

      <ul>
        <li className={location.pathname === '/trips' ? 'active' : ''} onClick={() => navigate('/trips')}>
          <FontAwesomeIcon icon={faMap} />
          Explore Trips
        </li>
        <li className={location.pathname === '/upload-post' ? 'active' : ''} onClick={() => navigate('/upload-post')}>
          <FontAwesomeIcon icon={faUpload} />
           Upload Post
        </li>
        <li className={location.pathname === '/user-profile' ? 'active' : ''} onClick={() => navigate('/user-profile')}>
          <FontAwesomeIcon icon={faUser} />
           Profile
        </li>
        <li className={location.pathname === '/trip-planner' ? 'active' : ''} onClick={() => navigate('/trip-planner')}>
          <FontAwesomeIcon icon={faRoute} />
           Plan & Go
        </li>
        <li onClick={handleLogout} className="logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
           Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
