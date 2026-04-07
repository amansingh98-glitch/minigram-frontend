import React from 'react';
import '../styles/UserListModal.css';

const UserListModal = ({ isOpen, onClose, title, users, onToggleFollow }) => {
    if (!isOpen) return null;

    return (
        <div className="user-list-modal-overlay" onClick={onClose}>
            <div className="user-list-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="user-list-modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="user-list-modal-body">
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <div key={user.id} className="user-list-item">
                                <div className="user-info">
                                    <img 
                                        src={user.profileImageUrl || 'https://via.placeholder.com/150'} 
                                        alt={user.username} 
                                        className="user-avatar" 
                                    />
                                    <span className="username">{user.username}</span>
                                </div>
                                {onToggleFollow && (
                                    <button 
                                        className={`follow-btn ${user.followedByCurrentUser ? 'following' : ''}`}
                                        onClick={() => onToggleFollow(user.id)}
                                    >
                                        {user.followedByCurrentUser ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-users">No users found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
