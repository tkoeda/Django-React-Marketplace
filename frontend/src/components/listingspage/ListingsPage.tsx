import { useEffect, useState } from "react";
import {
    Container,
    Group,
    Paper,
    Stack,
    Title,
    LoadingOverlay,
} from "@mantine/core";
import ListingGrid from "../listinggrid/ListingGrid";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import { LISTING_STATUS } from "../../constants";

const ListingsPage = () => {
    const location = useLocation();
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const status =
        location.pathname.split("/").pop() || LISTING_STATUS.PUBLISHED;

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
            <Stack justify="center">
                <Group justify="center">
                    <Title order={2}>{getStatusTitle(status)} Listings</Title>
                </Group>
                <ListingGrid
                    status={status}
                    items={listings}
                    isLoading={isLoading}
                    error={error}
                />
            </Stack>
        </Container>
    );
};

export default ListingsPage;
