// ImageUploader.tsx
import { useRef, ChangeEvent } from "react";

interface Image {
    id?: number;
    image_url?: string;
    file?: File;
    order: number;
}

interface ImageUploaderProps {
    images: Image[];
    onImageChange: (newImages: File[]) => void;
    onRemoveImage: (index: number) => void;
}

function ImageUploader({
    images,
    onImageChange,
    onRemoveImage,
}: ImageUploaderProps): JSX.Element {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileInputClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onImageChange(Array.from(e.target.files));
        }
    };

    return (
        <section className="product-image-section">
            <div className="form-group-title">
                <span>Product Images</span>
            </div>
            <div className="product-image-container">
                {images.map((image, index) => (
                    <div key={`image-${index}`} className="product-image-item">
                        <div className="image-wrapper">
                            <img
                                src={
                                    image.image_url ||
                                    (image.file
                                        ? URL.createObjectURL(image.file)
                                        : "")
                                }
                                loading="lazy"
                                alt={`Image ${index + 1}`}
                                className="product-image"
                            />
                        </div>
                        <button
                            type="button"
                            className="remove-btn"
                            onClick={() => onRemoveImage(index)}
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
                    onChange={handleFileChange}
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
    );
}

export default ImageUploader;
