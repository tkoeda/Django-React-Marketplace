import { useState, useEffect, useRef } from "react";
import api from "../../api";
import ImageUploader from "../imageuploader/ImageUploader";
import ButtonGroup from "../buttongroup/ButtonGroup";
import { TextInput, TextArea, SelectInput } from "../inputs/FormInputs";
import "../../styles/components/listings/ListingForm.css";
import { useNavigate, useParams } from "react-router-dom";

interface Listing {
    title: string;
    description: string;
    price: string;
    category: string;
    condition: string;
    status: string;
}

interface Image {
    id: number;
    image_url: string;
}

interface SelectOption {
    value: string;
    label: string;
}

function ListingForm(): JSX.Element {
    const navigate = useNavigate();
    const { listing_id } = useParams<{ listing_id: string }>();
    const [listing, setListing] = useState<Listing>({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        status: "draft",
    });
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<Image[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]); // New state for tracking deleted images
    const [imageOrder, setImageOrder] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(
        listing_id ? true : false
    );

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

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setListing({ ...listing, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleImageChange called", e);
        console.log("e.target:", e.target);
        console.log("e.target.files:", e.target.files);

        if (!e.target.files) {
            console.error("No Files Selected");
            return;
        }
        const newImages = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...newImages]);

        // Create preview URLs for the new images
        const newPreviewImages = newImages.map((file) =>
            URL.createObjectURL(file)
        );
        setPreviewImages([...previewImages, ...newPreviewImages]);
    };

    const removeImage = (index: number, type: "new" | "existing") => {
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
                    error instanceof Error ? error.message : String(error)
                );
            }
        }
    };

    const handleSubmit = async (
        e: React.MouseEvent<HTMLButtonElement>,
        action: "draft" | "publish"
    ) => {
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
            formData.append(`deleted_images`, imageId.toString());
        });

        // Append image order
        imageOrder.forEach((imageId) => {
            formData.append(`image_order`, imageId.toString());
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
                "Error updating/creating listing:",
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    const categoryOptions: SelectOption[] = [
        { value: "", label: "Select Category" },
        { value: "CHAIR", label: "Chair" },
        { value: "TABLE", label: "Table" },
        { value: "SOFA", label: "Sofa" },
        { value: "BED", label: "Bed" },
        { value: "DRESSER", label: "Dresser" },
        { value: "BOOKSHELF", label: "Bookshelf" },
        { value: "DESK", label: "Desk" },
        { value: "CABINET", label: "Cabinet" },
        { value: "WARDROBE", label: "Wardrobe" },
        { value: "OTHER", label: "Other" },
    ];

    const conditionOptions: SelectOption[] = [
        { value: "", label: "Select Condition" },
        { value: "new_with_tags", label: "New with tags" },
        { value: "new_without_tags", label: "New without tags" },
        { value: "like_new", label: "Like new" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
    ];

    return (
        <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
            <ImageUploader
                existingImages={existingImages}
                previewImages={previewImages}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
            />
            <TextInput
                label="Title"
                id="title"
                name="title"
                type="text"
                value={listing.title}
                onChange={handleChange}
                required
            />
            <TextArea
                label="Description"
                id="description"
                name="description"
                value={listing.description}
                onChange={handleChange}
                required
            />
            <TextInput
                label="Price"
                id="price"
                name="price"
                type="number"
                value={listing.price}
                onChange={handleChange}
                required
            />
            <SelectInput
                label="Category"
                id="category"
                name="category"
                value={listing.category}
                onChange={handleChange}
                options={categoryOptions}
                required
            />
            <SelectInput
                label="Condition"
                id="condition"
                name="condition"
                value={listing.condition}
                onChange={handleChange}
                options={conditionOptions}
                required
            />
            <ButtonGroup
                onDraft={(e) => handleSubmit(e, "draft")}
                onPublish={(e) => handleSubmit(e, "publish")}
                onDelete={listing_id ? handleDelete : undefined}
                isEdit={!!listing_id}
            />
        </form>
    );
}

export default ListingForm;
