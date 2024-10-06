import { useState, useEffect } from "react";
import api from "../../api";
import '../../styles/pages/home/home.css';
function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getListings();
    }, []);

    const getListings = () => {
        api.get("/api/homepage/")
            .then((res) => res.data)
            .then((data) => {
                setListings(data);
                console.log(data);
            })
            .catch((error) => {
                console.log(error);
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container">
            <h1>Furniture Listings</h1>
            {listings.length > 0 ? (
                <div className="listings-grid">
                    {listings.map((listing) => (
                        <div key={listing.id} className="listing-card">
                            <div className="image-container">
                                <img
                                    src={listing.main_image}
                                    alt={listing.title}
                                    className="listing-image"
                                />
                            </div>
                            <div className="content">
                                <h2 >{listing.title}</h2>
                                <p>Price: ${listing.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-listings">No listings found.</p>
            )}
        </div>
    );
}

export default Home;
