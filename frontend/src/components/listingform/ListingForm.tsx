import { useState, useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
    TextInput,
    Textarea,
    Select,
    NumberInput,
    Stack,
    Group,
    Button,
    Paper,
    Title,
    Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import api from "../../api";
import ImageUploader from "../imageuploader/ImageUploader";
import "./ListingForm.css";

interface Listing {
    title: string;
    description: string;
    price: string;
    category: string;
    condition: string;
    status: string;
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
    const [displayImages, setDisplayImages] = useState<Image[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(!!listing_id);

    const form = useForm({
        initialValues: {
            title: "",
            description: "",
            price: "",
            category: "",
            condition: "",
            status: "draft",
        },
        validate: {
            title: (value) => (value.length < 1 ? "Title is required" : null),
            price: (value) => {
                if (!value) return "Price is required";
                if (parseFloat(value) < 0) return "Price cannot be negative";
                return null;
            },
            category: (value) => (!value ? "Category is required" : null),
            condition: (value) => (!value ? "Condition is required" : null),
        },
    });

    const categoryOptions = [
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

    const conditionOptions = [
        { value: "new_with_tags", label: "New with tags" },
        { value: "new_without_tags", label: "New without tags" },
        { value: "like_new", label: "Like new" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" },
    ];

    useEffect(() => {
        if (listing_id) {
            const fetchListing = async () => {
                try {
                    const response = await api.get(
                        `/api/listings/${listing_id}/`
                    );
                    form.setValues({
                        title: response.data.title,
                        description: response.data.description,
                        price: response.data.price,
                        category: response.data.category,
                        condition: response.data.condition,
                        status: response.data.status,
                    });
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
                    if (!prev.includes(removedImage.id!)) {
                        return [...prev, removedImage.id!];
                    }
                    return prev;
                });
            }

            updatedImages.splice(index, 1);
            return updatedImages.map((img, i) => ({ ...img, order: i + 1 }));
        });
    };

    const handleDelete = async () => {
        if (!listing_id) return;
        try {
            await api.delete(`/api/listings/${listing_id}/`);
            navigate("/sell");
        } catch (error) {
            console.error("Error deleting listing:", error);
        }
    };

    const handleSubmit = async (action: "draft" | "publish") => {
        if (action === "publish") {
            const validation = form.validate();
            if (validation.hasErrors) return;
        }

        const formData = new FormData();

        Object.entries(form.values).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        formData.set("status", action === "publish" ? "published" : "draft");

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

        displayImages.forEach((img, index) => {
            if (img.file) {
                formData.append(`image_${index + 1}`, img.file);
            }
        });

        try {
            if (listing_id) {
                await api.patch(`/api/listings/${listing_id}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                navigate("/sell/draft");
            } else {
                await api.post("/api/listings/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                navigate("/sell");
            }
        } catch (error) {
            console.error("Error updating/creating listing:", error);
        }
    };

    return (
        <Container className="listing-form-container">
            <Stack className="listing-form-stack">
                <Title order={2}>
                    {listing_id ? "Edit Listing" : "Create New Listing"}
                </Title>

                <ImageUploader
                    images={displayImages}
                    onImageChange={handleImageChange}
                    onRemoveImage={removeImage}
                />

                <TextInput
                    label="Title"
                    placeholder="Enter title"
                    {...form.getInputProps("title")}
                    required
                />

                <Textarea
                    label="Description"
                    placeholder="Enter description"
                    {...form.getInputProps("description")}
                    minRows={4}
                    required
                />

                <NumberInput
                    label="Price"
                    placeholder="0"
                    {...form.getInputProps("price")}
                    min={0}
                    decimalScale={2}
                    hideControls
                    required
                    leftSection="$"
                />

                <Select
                    label="Category"
                    placeholder="Select category"
                    data={categoryOptions}
                    {...form.getInputProps("category")}
                    required
                />

                <Select
                    label="Condition"
                    placeholder="Select condition"
                    data={conditionOptions}
                    {...form.getInputProps("condition")}
                    required
                />

                <Stack mt="xl">
                    <Button
                        variant="outline"
                        color="var(--color-border-attention)"
                        onClick={() => handleSubmit("draft")}
                    >
                        Save as Draft
                    </Button>

                    <Button
                        color="var(--color-background-attention)"
                        onClick={() => handleSubmit("publish")}
                    >
                        Publish
                    </Button>

                    {listing_id && (
                        <Button
                            color="red"
                            variant="outline"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Container>
    );
}

export default ListingForm;
