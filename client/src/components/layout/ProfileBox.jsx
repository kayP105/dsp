import React from 'react';
import './Sidebars.css';
import koalaImage from '../../assets/icons/koala.png'; 

const ProfileBox = ({ user, isLoading }) => {
  return (
    <aside className="info-panel-cute profile-box">
      <img src={koalaImage} alt="Mascot" className="profile-koala" />
      <div className="profile-username">
        {isLoading ? 'Loading...' : user?.name || 'Study Buddy'}
      </div>
    </aside>
  );
};
export default ProfileBox;