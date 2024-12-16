import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Center,
    Loader,
    Grid,
    Card,
    Text,
    Image,
    Title,
    Stack,
    Group
} from "@mantine/core";
import api from "../../api";
import styles from "./Home.module.css";

import { IconHeart } from '@tabler/icons-react';

interface Listing {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
}

function Home() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        getListings();
    }, []);

    const getListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/homepage/`);
            setListings(response.data.results);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setError(
                new Error(
                    "An error occurred while fetching listings. Please try again later."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Center>
                <Text c="red" fw={500}>
                    {error.message}
                </Text>
            </Center>
        );
    }

    return (
        <Container fluid py="xl">
            <Stack gap="xl">
                <Title order={1} ta="center">
                    Furniture Listings
                </Title>

                {loading ? (
                    <Center h={200}>
                        <Loader size="xl" />
                    </Center>
                ) : listings.length > 0 ? (
                    <Grid>
                        {listings.map((listing) => (
                            <Grid.Col
                                key={listing.id}
                                span={2.4}
                            >
                                <Card
                                    component={Link}
                                    to={`/listings/${listing.id}`}
                                    padding="md"
                                    radius="md"
                                    className={styles["card"]}
                                >
                                    <Card.Section>
                                        <figure className={styles["image-container"]}>
                                            <Image
                                                className={styles.image}
                                                src={listing.thumbnail}
                                                alt={listing.title}
                                                fallbackSrc="https://placehold.co/200x200"
                                                fit="contain"
                                            />
                                        </figure>
                                    </Card.Section>
                                    <Card.Section
                                        className={styles["card-section-text"]}
                                    >
                                        <Text
                                            fw={500}
                                            size="lg"
                                            className={styles["title-text"]}
                                        >
                                            {listing.title}
                                        </Text>
                                        <Group justify="space-between">
                                            <Text
                                                size="md"
                                                fw={700}
                                                c="white"
                                                className={styles["price-text"]}
                                            >
                                                ${listing.price}
                                            </Text>
                                            {/* <IconHeart stroke={1} className={styles["heart-icon"]}/> */}
                                        </Group>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <Center>
                        <Text size="lg" c="dimmed">
                            No listings found.
                        </Text>
                    </Center>
                )}
            </Stack>
        </Container>
    );
}

export default Home;
