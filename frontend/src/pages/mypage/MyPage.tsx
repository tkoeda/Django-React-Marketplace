import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import ListingsTabs from "../../components/mypage/ListingsTabs";
import "../../styles/pages/mypage/mypage.css";

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState("published");
    
    useEffect(() => {
        const path = location.pathname.split('/')[2] || 'published';
        setActiveSection(path);
    }, [location]);

    const handleSectionChange = (section) => {
        setActiveSection(section);
        navigate(`/mypage/${section}`);
    };

    return (
        <div className="container">
            <div className="button-grid">
                <NavLink 
                    to="/mypage/liked"
                    className={({ isActive }) => `grid-button ${isActive ? "active" : ""}`}
                >
                    <span className="button-icon">❤️</span>
                    <span>Liked</span>
                </NavLink>
                <NavLink 
                    to="/mypage/bought"
                    className={({ isActive }) => `grid-button ${isActive ? "active" : ""}`}
                >
                    <span className="button-icon">🛍️</span>
                    <span>Bought Items</span>
                </NavLink>
                <NavLink 
                    to="/mypage/listings/published"
                    className={({ isActive }) => `grid-button ${isActive ? "active" : ""}`}
                >
                    <span className="button-icon">📦</span>
                    <span>My Listings</span>
                </NavLink>
            </div>

            <Routes>
                <Route path="listings/*" element={
                    <div className="section-content">
                        <h2 className="section-title">My Listings</h2>
                        <ListingsTabs />
                    </div>
                } />
                <Route path="liked" element={
                    <div className="section-content">
                        <h2 className="section-title">Liked Items</h2>
                        <p>Liked items will be displayed here.</p>
                    </div>
                } />
                <Route path="bought" element={
                    <div className="section-content">
                        <h2 className="section-title">Bought Items</h2>
                        <p>Bought items will be displayed here.</p>
                    </div>
                } />
            </Routes>
        </div>
    );
};

export default MyPage;
