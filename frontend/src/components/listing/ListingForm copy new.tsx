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

interface SelectOption {
    value: string;
    label: string;
}

interface Image {
    id?: number;
    image_url?: string;
    file?: File;
    order: number;
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
    const [displayImages, setDisplayImages] = useState<Image[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    // const [previewImages, setPreviewImages] = useState<string[]>([]);
    // const [existingImages, setExistingImages] = useState<Image[]>([]);
    // const [deletedImages, setDeletedImages] = useState<number[]>([]); // New state for tracking deleted images
    // const [imageOrder, setImageOrder] = useState<number[]>([]);
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
                        setDisplayImages(
                            response.data.images.map(
                                (img: any, index: number) => ({
                                    id: img.id,
                                    image_url: img.image_url,
                                    order: index + 1,
                                })
                            )
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

    const handleImageChange = (newImages: File[]) => {
        const newImageObjects = newImages.map((file, index) => ({
            file,
            image_url: URL.createObjectURL(file),
            order: displayImages.length + index + 1,
        }));
        setDisplayImages([...displayImages, ...newImageObjects]);
    };

    const removeImage = (index: number) => {
        setDisplayImages((prevImages) => {
            const updatedImages = [...prevImages];
            const removedImage = updatedImages[index];

            if (removedImage.id) {
                setDeletedImageIds((prev) => {
                    if (!prev.includes(removedImage.id)) {
                        return [...prev, removedImage.id];
                    }
                    return prev;
                });
            }

            updatedImages.splice(index, 1);
            return updatedImages.map((img, i) => ({ ...img, order: i + 1 }));
        });
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
        const imageUpdates = [
            ...displayImages.map((img, index) => ({
                id: img.id || null,
                order: index + 1,
                delete: false,
            })),
            ...deletedImageIds.map((id) => ({
                id,
                order: 0,
                delete: true,
            })),
        ];

        formData.append("image_updates", JSON.stringify(imageUpdates));

        // Append files separately
        displayImages.forEach((img, index) => {
            if (img.file) {
                formData.append(`image_${index}`, img.file);
            }
        });

        // Display the key/value pairs
        for (var pair of formData.entries()) {
            console.log(pair[0] + ", " + pair[1]);
        }

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
                images={displayImages}
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
