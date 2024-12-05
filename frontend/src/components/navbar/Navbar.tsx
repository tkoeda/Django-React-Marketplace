// src/components/navbar/Navbar.tsx
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';
import './NavBar.css';

const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        onLinkClick?.();
    };

    return (
        <>
            {isLoggedIn ? (
                <button onClick={handleLogout} className="nav-button">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            ) : (
                <>
                    <Link to="/login" className="nav-link">
                        <User size={18} />
                        <span>Login</span>
                    </Link>
                    <Link to="/register" className="nav-link primary">
                        <span>Register</span>
                    </Link>
                </>
            )}
        </>
    );
};

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="navbar">
            <div className="container">
                <div className="content">
                    <div className="nav-start">
                        <Link to="/" className="logo">
                            Logo
                        </Link>
                    </div>

                    <div className="nav-mid">
                        {/* Add middle content here */}
                    </div>

                    <div className="nav-end">
                        <nav>
                            <NavLinks />
                        </nav>
                        <button 
                            className="mobile-menu-button"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${!isMobileMenuOpen ? 'hidden' : ''}`}>
                    <NavLinks onLinkClick={closeMobileMenu} />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
