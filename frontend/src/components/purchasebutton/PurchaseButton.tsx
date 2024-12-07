import React, { useState } from "react";
import api from "../../api";
import "./PurchaseButton.css";

interface PurchaseButtonProps {
    listingId: string | number;
    onPurchaseSuccess?: (data: PurchaseResponse) => void;
}

interface PurchaseResponse {
    message: string;
    listing_id: string | number;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({
    listingId,
    onPurchaseSuccess,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const handlePurchase = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<PurchaseResponse>(
                `/api/listings/${listingId}/purchase/`
            );
            setIsLoading(false);
            setShowConfirm(false);
            if (onPurchaseSuccess) {
                onPurchaseSuccess(response.data);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error || "An error occurred during purchase"
            );
            setIsLoading(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3 className="modal-title">Confirm Purchase</h3>
                    <p className="modal-text">
                        Are you sure you want to purchase this item? This action
                        cannot be undone.
                    </p>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-buttons">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="button cancel-button"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePurchase}
                            className="button confirm-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Confirm Purchase"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="buy-button"
            disabled={isLoading}
        >
            {isLoading ? "Processing..." : "Buy Now"}
        </button>
    );
};

export default PurchaseButton;
