import { useState, useEffect } from "react";
import {
    LoadingSpinner,
    LoadingOverlay,
} from "../../components/loadingcomponent/LoadingComponent";
import { Link } from "react-router-dom";
import { Container } from "@mantine/core";
import api from "../../api";
import "./Home.css";

interface Listing {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
}

function Home() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        getListings();
    }, []);

    const getListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/homepage/`);
            setListings(response.data.results);
            console.log(response.data.results);
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
            <Container className="container">
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
            </Container>
        </LoadingOverlay>
    );
}

export default Home;
