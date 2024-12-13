import { FC } from "react";
import { Card, Image, Text, Group, Stack, Skeleton } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { LISTING_STATUS } from "../../constants";
import styles from "./ListingGrid.module.css";
interface ListingItem {
    id: string | number;
    title: string;
    price: number;
    thumbnail?: string;
}

interface ListingGridProps {
    status: (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];
    items: ListingItem[];
    isLoading: boolean;
    error: string | null;
}

const ListingGrid: FC<ListingGridProps> = ({
    status,
    items,
    isLoading,
    error,
}) => {
    const navigate = useNavigate();

    const getNavigationPath = (itemId: string | number) => {
        return status === LISTING_STATUS.DRAFT
            ? `/sell/edit/${itemId}`
            : `/mylistings/${itemId}`;
    };

    const renderSkeleton = () => (
        <Stack>
            {[1, 2, 3].map((index) => (
                <Card
                    key={index}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    className={styles.card}
                >
                    <Group align="center" wrap="nowrap" gap="lg">
                        <Skeleton height={100} width={100} radius="md" />
                        <div style={{ flex: 1 }}>
                            <Stack>
                                <Skeleton height={20} width="70%" />
                                <Group justify="space-between" mt="auto">
                                    <Skeleton height={20} width={80} />
                                </Group>
                            </Stack>
                        </div>
                    </Group>
                </Card>
            ))}
        </Stack>
    );

    const renderItem = (item: ListingItem) => (
        <Card
            key={item.id}
            onClick={() => navigate(getNavigationPath(item.id))}
            style={{ cursor: "pointer" }}
            className={styles.card}
        >
            <Group align="center" wrap="nowrap" gap="lg">
                {item.thumbnail ? (
                    <Image
                        src={item.thumbnail}
                        height={100}
                        width={100}
                        radius="md"
                        alt={item.title}
                        style={{ flexShrink: 0 }}
                    />
                ) : (
                    <div
                        className={styles.noPhoto}
                        style={{
                            height: 100,
                            width: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "var(--mantine-radius-md)",
                            flexShrink: 0,
                            background: "var(--color-background-secondary-highlight)",
                        }}
                    >
                        <Text size="sm" c="dimmed" ta="center">No <br/>Photo</Text>
                    </div>
                )}
                <Stack gap={0}>
                    <Text size="lg">{item.title || "-"}</Text>
                    <Group justify="space-between" mt="auto">
                        <Text fw={500} size="lg">
                            ${item.price || 0}
                        </Text>
                    </Group>
                </Stack>
            </Group>
        </Card>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    if (error) {
        return (
            <Text c="red" ta="center" p="md">
                {error}
            </Text>
        );
    }

    return (
        <Stack gap={0} className={styles["listing-grid"]}>
            {items.length === 0 ? (
                <Text c="dimmed" ta="center">
                    No items found.
                </Text>
            ) : (
                items.map(renderItem)
            )}
        </Stack>
    );
};

export default ListingGrid;
