import { useState, useEffect } from "react";
import {
    LoadingSpinner,
    LoadingOverlay,
} from "../../components/LoadingComponent";
import { Link } from 'react-router-dom';

import api from "../../api";
import "../../styles/pages/home/home.css";

function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getListings();
    }, []);

    const getListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/homepage/`);
            setListings(response.data.results);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setError(
                "An error occurred while fetching listings. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <LoadingOverlay isLoading={loading}>
            <div className="container">
                <h1>Furniture Listings</h1>
                {listings.length > 0 ? (
                    <ul className="listings-list">
                        {listings.map((listing) => (
                            <li key={listing.id} className="listing-item">
                                <Link
                                    to={`/listings/${listing.id}`}
                                    className="listing-link"
                                >
                                    <div className="listing-card">
                                        <div className="image-container">
                                            <img
                                                src={listing.thumbnail}
                                                alt={listing.title}
                                                className="listing-image"
                                            />
                                        </div>
                                        <div className="content">
                                            <h2>{listing.title}</h2>
                                            <p>Price: ${listing.price}</p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-listings">No listings found.</p>
                )}
            </div>
        </LoadingOverlay>
    );
}

export default Home;
