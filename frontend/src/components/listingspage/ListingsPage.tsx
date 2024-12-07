import { useEffect, useState } from "react";
import { Button, Container, Group, Paper, Stack, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import ListingList from "../listinglist/ListingList";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";

const LISTING_STATUSES = {
    PUBLISHED: "published",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
};

const ListingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const status =
        location.pathname.split("/").pop() || LISTING_STATUSES.PUBLISHED;

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/mylistings/${status}/`);
                setListings(response.data);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setError("Failed to load listings. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, [status]);

    const getStatusTitle = (status) => {
        return status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <Container size="xl">
            <Paper shadow="xs" p="md">
                <Stack>
                    <Group justify="space-between">
                        <Title order={2}>
                            {getStatusTitle(status)} Listings
                        </Title>
                        <Button
                            variant="subtle"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate("/mypage")}
                        >
                            Back to My Page
                        </Button>
                    </Group>
                    <ListingList
                        items={listings}
                        isLoading={isLoading}
                        error={error}
                    />
                </Stack>
            </Paper>
        </Container>
    );
};

export default ListingsPage;
