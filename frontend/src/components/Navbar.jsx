import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--primary)' }}>Stream</span>Vault
            </div>
            <div className="nav-links">
                <span>Welcome, {user.username} ({user.role})</span>
                <button onClick={logout} className="btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
