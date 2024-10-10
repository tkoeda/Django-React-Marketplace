import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, NavLink } from "react-router-dom";
import api from "../../api";
import "../../styles/components/mypage/ListingsTabs.css";

const ListingsTabs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const tabs = [
        { key: "published", label: "Published" },
        { key: "in_progress", label: "In Progress" },
        { key: "completed", label: "Completed" },
    ];

    useEffect(() => {
        const tab = location.pathname.split('/').pop() || 'published';
        fetchListings(tab);
    }, [location]);

    const fetchListings = async (tab) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/mylistings/${tab}/`);
            setListings(response.data);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setError(
                "An error occurred while fetching listings. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleListingClick = (listingId) => {
        navigate(`/mylistings/${listingId}`);
    };

    const renderListing = (listing) => (
        <div key={listing.id} className="listing-item" onClick={() => handleListingClick(listing.id)}>
            <div className="listing-image">
                {listing.thumbnail ? (
                    <img src={listing.thumbnail} alt={listing.title} />
                ) : (
                    <div className="placeholder-image">No Image</div>
                )}
            </div>
            <div className="listing-details">
                <h3>{listing.title}</h3>
                <p className="category">{listing.category}</p>
                <p className="description">{listing.description}</p>
                <div className="listing-footer">
                    <span className="price">${listing.price}</span>
                    <span className="condition">{listing.condition}</span>
                    <span className="status">{listing.status}</span>
                </div>
            </div>
        </div>
    );

    const renderListings = () => {
        if (isLoading) {
            return <div className="loading">Loading listings...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        return (
            <div className="tab-content">
                {listings.length === 0 ? (
                    <p className="no-listings">No listings found.</p>
                ) : (
                    listings.map(renderListing)
                )}
            </div>
        );
    };

    return (
        <div className="listing-tabs">
            <div className="tab-list">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.key}
                        to={`/mypage/listings/${tab.key}`}
                        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>
            <Routes>
                <Route path="/" element={renderListings()} />
                <Route path="published" element={renderListings()} />
                <Route path="in_progress" element={renderListings()} />
                <Route path="completed" element={renderListings()} />
            </Routes>
        </div>
    );
};

export default ListingsTabs;
