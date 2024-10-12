// ImageUploader.tsx
import { useRef, ChangeEvent } from 'react';

interface ExistingImage {
  id: number;
  image_url: string;
}

interface ImageUploaderProps {
  existingImages: ExistingImage[];
  previewImages: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number, type: 'existing' | 'new') => void;
}

function ImageUploader({
  existingImages,
  previewImages,
  onImageChange,
  onRemoveImage
}: ImageUploaderProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <section className="product-image-section">
      <div className="form-group-title">
        <span>Product Images</span>
      </div>
      <div className="product-image-container">
        {existingImages.map((image, index) => (
          <div key={`existing-${image.id}`} className="product-image-item">
            <div className="image-wrapper">
              <img src={image.image_url} alt={`Existing ${index + 1}`} className="product-image" />
            </div>
            <button
              type="button"
              className="remove-btn"
              onClick={() => onRemoveImage(index, "existing")}
              aria-label="Remove image"
            >
              X
            </button>
          </div>
        ))}
        {previewImages.map((preview, index) => (
          <div key={`new-${index}`} className="product-image-item">
            <div className="image-wrapper">
              <img src={preview} alt={`Preview ${index + 1}`} className="product-image" />
            </div>
            <button
              type="button"
              className="remove-btn"
              onClick={() => onRemoveImage(index, "new")}
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
          onChange={onImageChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        <div className="file-input__button">
          <button type="button" className="upload-btn" onClick={handleFileInputClick}>
            Upload Photos
          </button>
        </div>
      </div>
    </section>
  );
}

export default ImageUploader;
