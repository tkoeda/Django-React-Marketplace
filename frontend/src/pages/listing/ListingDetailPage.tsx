import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Slider from "react-slick";
import "./ListingDetailPage.css";
import PurchaseButton from "../../components/purchasebutton/PurchaseButton";

function ListingDetailPage() {
    const [listing, setListing] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();
    const { listing_id } = useParams();

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        setCurrentUserId(storedUserId);
        fetchListing();
    }, [listing_id]);

    const fetchListing = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/listings/${listing_id}/`);
            setListing(response.data);
        } catch (error) {
            console.error("Error fetching listing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        try {
            if (action === "edit") {
                // Navigate to edit page
                navigate(`/sell/edit/${listing_id}`);
            } else if (action === "unpublish") {
                // Send request to unpublish the listing
                await api.patch(`/api/listings/${listing_id}/`, {
                    status: "draft",
                });
                // Refresh the listing data
                navigate(`/mypage/listings/published`);
                // Optionally, show a success message
                alert("Listing unpublished successfully");
            }
        } catch (error) {
            console.error(
                `Error ${
                    action === "draft" ? "editing" : "unpublishing"
                } listing:`,
                error
            );
            // Optionally, show an error message
            alert(
                `Error ${
                    action === "draft" ? "editing" : "unpublishing"
                } listing. Please try again.`
            );
        }
    };

    const handlePurchaseSuccess = (data) => {
        navigate("/"); 
    };

    if (isLoading) {
        return <div>Loading listing...</div>;
    }

    const isOwner = currentUserId === listing.seller?.id?.toString();

    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div className="listing-detail">
            <div className="carousel-container">
                <Slider {...settings}>
                    {listing.images.map((image, index) => (
                        <div key={index} className="listing-image">
                            <img src={image.image_url} alt={listing.title} />
                        </div>
                    ))}
                </Slider>
            </div>
            <div className="listing-info">
                <div className="title-container">
                    <h1>{listing.title}</h1>
                </div>
                <div className="price-container">
                    <span className="price">${listing.price}</span>
                </div>
                <div className="description-container">
                    <p>{listing.description}</p>
                </div>
                <span className="condition">{listing.condition_display}</span>
            </div>
            <div className="button-group">
                {isOwner ? (
                    <>
                        <button
                            type="button"
                            className="edit-btn"
                            onClick={(e) => handleSubmit(e, "edit")}
                        >
                            Edit Listing
                        </button>
                        <button
                            type="button"
                            className="unpublish-btn"
                            onClick={(e) => handleSubmit(e, "unpublish")}
                        >
                            Unpublish
                        </button>
                    </>
                ) : (
                    <PurchaseButton
                        listingId={listing.id}
                        onPurchaseSuccess={handlePurchaseSuccess}
                    />
                )}
            </div>
        </div>
    );
}

export default ListingDetailPage;
