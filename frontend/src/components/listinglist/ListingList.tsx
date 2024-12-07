import { FC } from "react";
import {
    Card,
    Image,
    Text,
    Group,
    Stack,
    Loader,
    useMantineColorScheme,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface ListingItem {
    id: string | number;
    title: string;
    price: number;
    thumbnail?: string;
}

interface ListingListProps {
    items: ListingItem[];
    isLoading: boolean;
    error: string | null;
}

const ListingList: FC<ListingListProps> = ({ items, isLoading, error }) => {
    const navigate = useNavigate();
    const { colorScheme } = useMantineColorScheme();

    const renderItem = (item: ListingItem) => (
        <Card
            key={item.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            onClick={() => navigate(`/mylistings/${item.id}`)}
            style={{ cursor: "pointer" }}
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
                        style={{
                            height: 100,
                            width: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                                colorScheme === "dark" ? "#25262b" : "#f8f9fa",
                            borderRadius: "var(--mantine-radius-md)",
                            flexShrink: 0,
                        }}
                    >
                        <IconPhoto
                            size={48}
                            stroke={1.5}
                            color={
                                colorScheme === "dark" ? "#5c5f66" : "#adb5bd"
                            }
                        />
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <Stack>
                        <Text size="lg">{item.title}</Text>
                        <Group justify="space-between" mt="auto">
                            <Text fw={500} size="lg">
                                ${item.price}
                            </Text>
                        </Group>
                    </Stack>
                </div>
            </Group>
        </Card>
    );

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "2rem",
                }}
            >
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <Text c="red" ta="center" p="md">
                {error}
            </Text>
        );
    }

    return (
        <Stack p="md">
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

export default ListingList;
