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
} from "@mantine/core";
import api from "../../api";
import styles from "./Home.module.css";

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
                "An error occurred while fetching listings. Please try again later."
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
        <Container size="xl" py="xl">
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
                                span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                            >
                                <Card
                                    component={Link}
                                    to={`/listings/${listing.id}`}
                                    padding="md"
                                    radius="md"
                                    className={styles["card"]}
                                >
                                    <Card.Section className={styles["card-section-image"]}>
                                        <Image
                                            src={listing.thumbnail}
                                            height="100%"
                                            width="100%"
                                            alt={listing.title}
                                            fallbackSrc="https://placehold.co/200x200"
                                            fit="contain"
                                        />
                                    </Card.Section>
                                    <Card.Section className={styles["card-section-text"]}> 
                                        <Text fw={500} size="lg" className={styles["title-text"]}>
                                            {listing.title}
                                        </Text>
                                        <Text
                                            size="md"
                                            fw={700}
                                            c="white"
                                            className={styles["price-text"]}
                                        >
                                            ${listing.price}
                                        </Text>
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
