import { useRef } from 'react';
import { Box, Text, CloseButton, Stack, rem, Button } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconCamera } from "@tabler/icons-react";
import styles from "./ImageUploader.module.css";

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
    const MAX_IMAGES = 12;

    const handleDrop = (files: File[]) => {
        const remainingSlots = MAX_IMAGES - images.length;
        if (remainingSlots <= 0) return;

        const newFiles = files.slice(0, remainingSlots);
        onImageChange(newFiles);
    };

    const openRef = useRef<() => void>(null);

    return (
        <Box className={styles.imageUploader}>
            <Text className={styles.header}>
                Product Images ({images.length}/{MAX_IMAGES})
            </Text>

            <Box className={styles.imageGrid}>
                {images.map((image, index) => (
                    <Box key={`image-${index}`} className={styles.imageItem}>
                        <Box className={styles.imageWrapper}>
                            <Box
                                component="img"
                                src={
                                    image.image_url ||
                                    (image.file
                                        ? URL.createObjectURL(image.file)
                                        : "")
                                }
                                loading="lazy"
                                alt={`Image ${index + 1}`}
                                className={styles.image}
                            />
                        </Box>
                        <CloseButton
                            size="sm"
                            onClick={() => onRemoveImage(index)}
                            aria-label="Remove image"
                            className={styles.removeButton}
                        />
                    </Box>
                ))}
            </Box>

            {images.length < MAX_IMAGES && (
                <Dropzone
                    onDrop={handleDrop}
                    onReject={(files) => console.log("rejected files", files)}
                    maxSize={5 * 1024 ** 2}
                    accept={IMAGE_MIME_TYPE}
                    multiple
                    className={styles.dropzone}
                    openRef={openRef}
                >
                    <Stack className={styles.stack}>
                        <Button variant="transparent" className={styles.selectButton} > 
                            <IconCamera className={styles.icon} />
                            <Text size="md" inline className={styles.selectText}>
                                Select Images
                            </Text>
                        </Button>
                        <Box className={styles.textContainer}>
                            <Text size="xl" inline c="var(--color-text-placeholder)">
                                Drag images here
                            </Text>
                            <Text size="sm" inline mt={7} c="dimmed">
                                Upload up to {MAX_IMAGES - images.length} more
                                images
                            </Text>
                        </Box>
                    </Stack>
                </Dropzone>
            )}
        </Box>
    );
}

export default ImageUploader;
