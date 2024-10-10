import { useState, useEffect, useRef } from "react";
import api from "../../api";

import "../../styles/components/listings/ListingForm.css";
import { useNavigate, useParams } from "react-router-dom";
const ListingForm = () => {
    const navigate = useNavigate();
    const { listing_id } = useParams();
    const [listing, setListing] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        status: "draft", // Add this line
    });
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]); // New state for tracking deleted images
    const [imageOrder, setImageOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(listing_id ? true : false);

    useEffect(() => {
        if (listing_id) {
            const fetchListing = async () => {
                try {
                    const response = await api.get(
                        `/api/listings/${listing_id}/`
                    );
                    setListing(response.data);
                    if (response.data.images) {
                        setExistingImages(response.data.images);
                        setImageOrder(
                            response.data.images.map((img) => img.id)
                        );
                    }
                } catch (error) {
                    console.error("Error fetching listing:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchListing();
        }
    }, [listing_id]);

    const handleChange = (e) => {
        setListing({ ...listing, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const newImages = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...newImages]);

        // Create preview URLs for the new images
        const newPreviewImages = newImages.map((file) =>
            URL.createObjectURL(file)
        );
        setPreviewImages([...previewImages, ...newPreviewImages]);
    };

    const fileInputRef = useRef(null);

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const removeImage = (index, type) => {
        if (type === "new") {
            const updatedImages = [...images];
            updatedImages.splice(index, 1);
            setImages(updatedImages);

            const updatedPreviews = [...previewImages];
            URL.revokeObjectURL(updatedPreviews[index]);
            updatedPreviews.splice(index, 1);
            setPreviewImages(updatedPreviews);
        } else if (type === "existing") {
            const updatedExistingImages = [...existingImages];
            const deletedImage = updatedExistingImages.splice(index, 1)[0];
            setExistingImages(updatedExistingImages);
            setDeletedImages([...deletedImages, deletedImage.id]); // Add the deleted image ID to deletedImages
        }
    };

    const handleDelete = async () => {
        if (!listing_id) return; // Don't attempt to delete if there's no listing_id

        if (
            window.confirm(
                "Are you sure you want to delete this listing? This action cannot be undone."
            )
        ) {
            try {
                await api.delete(`/api/listings/${listing_id}/`);
                navigate("/sell"); // Navigate back to the sell page or wherever appropriate
            } catch (error) {
                console.error(
                    "Error deleting listing:",
                    error.response?.data || error.message
                );
                // Handle error (e.g., show error message to user)
            }
        }
    };

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        const formData = new FormData();

        // Append listing data
        Object.keys(listing).forEach((key) => {
            formData.append(key, listing[key]);
        });

        // Set the status based on the action
        formData.set("status", action === "publish" ? "published" : "draft");

        // Append new images
        images.forEach((image, index) => {
            formData.append(`new_images`, image);
        });

        // Append deleted images
        deletedImages.forEach((imageId) => {
            formData.append(`deleted_images`, imageId);
        });

        // Append image order
        imageOrder.forEach((imageId) => {
            formData.append(`image_order`, imageId);
        });
       
        try {
            let response;
            if (listing_id) {
                response = await api.patch(
                    `/api/listings/${listing_id}/`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                navigate("/sell/drafts");
            } else {
                response = await api.post("/api/listings/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                navigate("/sell");
            }
        } catch (error) {
            console.error(
                "Error creating listing:",
                error.response?.data || error.message
            );
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
            <section className="product-image-section">
                <div className="form-group-title">
                    <span>Product Images</span>
                </div>
                <div className="product-image-container">
                    {existingImages.map((image, index) => (
                        <div
                            key={`existing-${index}`}
                            className="product-image-item"
                        >
                            <div className="image-wrapper">
                                <img
                                    src={image.image_url}
                                    alt={`Existing ${index + 1}`}
                                    className="product-image"
                                />
                            </div>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeImage(index, "existing")}
                                aria-label="Remove image"
                            >
                                X
                            </button>
                        </div>
                    ))}
                    {previewImages.map((preview, index) => (
                        <div
                            key={`new-${index}`}
                            className="product-image-item"
                        >
                            <div className="image-wrapper">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="product-image"
                                />
                            </div>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeImage(index, "new")}
                                aria-label="Remove image"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
                <div className="file-input">
                    <input
                        ref={fileInputRef}
                        id="images"
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />
                    <div className="file-input__button">
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={handleFileInputClick}
                        >
                            Upload Photos
                        </button>
                    </div>
                </div>
            </section>
            <div className="listing-form__input-group">
                <label>
                    <div className="form-group-title">
                        <span>Title</span>
                    </div>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={listing.title}
                        onChange={handleChange}
                        required
                    />
                </label>
            </div>
            <section className="listing-form__input-group">
                <label>
                    <div className="form-group-title">
                        <span>Title</span>
                    </div>
                    <textarea
                        id="description"
                        name="description"
                        value={listing.description}
                        onChange={handleChange}
                        required
                    />
                </label>
            </section>
            <section className="listing-form__input-group">
                <label>
                    <div className="form-group-title">
                        <span>Price</span>
                    </div>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={listing.price}
                        onChange={handleChange}
                        required
                    />
                </label>
            </section>
            <section className="listing-form__input-group">
                <label>
                    <div className="form-group-title">
                        <span>Category</span>
                    </div>
                    <select
                        id="category"
                        name="category"
                        value={listing.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="CHAIR">Chair</option>
                        <option value="TABLE">Table</option>
                        <option value="SOFA">Sofa</option>
                        <option value="BED">Bed</option>
                        <option value="DRESSER">Dresser</option>
                        <option value="BOOKSHELF">Bookshelf</option>
                        <option value="DESK">Desk</option>
                        <option value="CABINET">Cabinet</option>
                        <option value="WARDROBE">Wardrobe</option>
                        <option value="OTHER">Other</option>
                    </select>
                </label>
            </section>
            <section className="listing-form__input-group">
                <label>
                    <div className="form-group-title">
                        <span>Title</span>
                    </div>
                    <select
                        id="condition"
                        name="condition"
                        value={listing.condition}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Condition</option>
                        <option value="new_with_tags">New with tags</option>
                        <option value="new_without_tags">
                            New without tags
                        </option>
                        <option value="like_new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </label>
            </section>
            <div className="button-group">
                <button
                    type="button"
                    className="draft-btn"
                    onClick={(e) => handleSubmit(e, "draft")}
                >
                    {listing_id ? "Update Draft" : "Save as Draft"}
                </button>
                <button
                    type="button"
                    className="publish-btn"
                    onClick={(e) => handleSubmit(e, "publish")}
                >
                    {listing_id ? "Update and Publish" : "Publish"}
                </button>
                {listing_id && (
                    <button
                        type="button"
                        className="delete-btn"
                        onClick={handleDelete}
                    >
                        Delete Listing
                    </button>
                )}
            </div>
        </form>
    );
};

export default ListingForm;
