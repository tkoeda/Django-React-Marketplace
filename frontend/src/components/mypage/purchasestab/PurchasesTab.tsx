import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import "../MyPageTabs.css";

const PurchasesTab = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/purchases/`);
            setPurchases(response.data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            setError(
                "An error occurred while fetching your purchased items. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleListingClick = (listingId) => {
        navigate(`/mylistings/${listingId}`);
    };

    const renderPurchase = (purchase) => (
        <div 
            key={purchase.id} 
            className="listing-item"
            onClick={() => handleListingClick(purchase.id)}
        >
            <div className="listing-image">
                {purchase.thumbnail ? (
                    <img src={purchase.thumbnail} alt={purchase.title} />
                ) : (
                    <div className="placeholder-image">No Image</div>
                )}
            </div>
            <div className="listing-details">
                <h3>{purchase.title}</h3>
                <p className="category">{purchase.category}</p>
                <p className="description">{purchase.description}</p>
                <div className="listing-footer">
                    <span className="price">
                        ${purchase.price}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading">Loading purchased items...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        return (
            <div className="listing-tabs">
                {purchases.length === 0 ? (
                    <p className="no-purchases">You haven't made any purchases yet.</p>
                ) : (
                    <div className="tab-list">
                        {purchases.map(renderPurchase)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="purchases-tab">
            {renderContent()}
        </div>
    );
};

export default PurchasesTab;
