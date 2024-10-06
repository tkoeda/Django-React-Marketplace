import { useState, useEffect } from "react";
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
                    const response = await api.get(`/api/listings/${listing_id}/`);
                    setListing(response.data);
                    console.log(response.data)
                    if (response.data.images) {
                        setExistingImages(response.data.images);
                        setImageOrder(response.data.images.map(img => img.id));


                    }
                    console.log(response.data)
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
        setImages(prevImages => [...prevImages, ...newImages]);

        // Create preview URLs for the new images
        const newPreviewImages = newImages.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviewImages]);
    };

    const removeImage = (index, type) => {
        if (type === 'new') {
            const updatedImages = [...images];
            updatedImages.splice(index, 1);
            setImages(updatedImages);

            const updatedPreviews = [...previewImages];
            URL.revokeObjectURL(updatedPreviews[index]);
            updatedPreviews.splice(index, 1);
            setPreviewImages(updatedPreviews);
        } else if (type === 'existing') {
            const updatedExistingImages = [...existingImages];
            const deletedImage = updatedExistingImages.splice(index, 1)[0];
            console.log(deletedImage.id)
            setExistingImages(updatedExistingImages);
            setDeletedImages([...deletedImages, deletedImage.id]); // Add the deleted image ID to deletedImages
        }
    };

    const handleImageReorder = (dragIndex, hoverIndex) => {
        const draggedId = imageOrder[dragIndex];
        const newOrder = [...imageOrder];
        newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, draggedId);
        setImageOrder(newOrder);
    };


    const handleSubmit = async (e, action) => {
        e.preventDefault();
        const formData = new FormData();

        // Append listing data
        Object.keys(listing).forEach((key) => {
            formData.append(key, listing[key]);
        });

        // Set the status based on the action
        formData.set('status', action === 'publish' ? 'published' : 'draft');

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

        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        try {
            let response;
            if (listing_id) {
                response = await api.patch(`/api/listings/${listing_id}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                navigate("/sell/drafts");
            } else {
                response = await api.post("/api/listings/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                navigate("/sell");
            }
                console.log("Listing Saved:", response.data);
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
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={listing.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={listing.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={listing.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
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
                </div>
                <div className="form-group">
                    <label htmlFor="condition">Condition</label>
                    <select
                        id="condition"
                        name="condition"
                        value={listing.condition}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Condition</option>
                        <option value="new_with_tags">New with tags</option>
                        <option value="new_without_tags">New without tags</option>
                        <option value="like_new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>
                <div className="file-input">
                    <label htmlFor="images">Images</label>
                    <input
                        id="images"
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
                <div className="image-preview-container">
                {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="image-preview">
                        <img src={image.image_url} alt={`Existing ${index + 1}`} />
                        <button 
                            type="button" 
                            className="remove-btn" 
                            onClick={() => removeImage(index, 'existing')} 
                            aria-label="Remove image"
                        >X</button>
                    </div>
                ))}
                {previewImages.map((preview, index) => (
                    <div key={`new-${index}`} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button 
                            type="button" 
                            className="remove-btn" 
                            onClick={() => removeImage(index, 'new')} 
                            aria-label="Remove image"
                        >X</button>
                    </div>
                ))}
            </div>
                <div className="button-group">
                    <button type="button" className="draft-btn" onClick={(e) => handleSubmit(e, 'draft')}>
                        {listing_id ? "Update Draft" : "Save as Draft"}
                    </button>
                    <button type="button" className="publish-btn" onClick={(e) => handleSubmit(e, 'publish')}>
                        {listing_id ? "Update and Publish" : "Publish"}
                    </button>
                </div>
            </form>
        );
    };

    export default ListingForm;
