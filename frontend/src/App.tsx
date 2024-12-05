import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import NotFound from "./pages/notfound/NotFound";
import ProtectedRoute from "./components/protectedroute/ProtectedRoute";
import MyPage from "./pages/mypage/MyPage";
import ListingForm from "./components/listing/ListingForm";
import Sell from "./pages/sell/Sell";
import TabBar from "./components/tabbar/TabBar";
import ListingDetailPage from "./pages/listing/ListingDetailPage";
import ListingsTabs from "./components/mypage/listingstab/ListingsTab";
import DraftListings from "./pages/draftlistings/DraftListings";
import Navbar from "./components/navbar/Navbar";

import "./styles/base/global.css";

function Logout() {
    localStorage.clear();
    return <Navigate to="/login" />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}

function ConditionalTabBar() {
    const location = useLocation();
    const showTabBarPaths = ["/", "/mypage", "/sell"];

    const shouldShowTabBar = showTabBarPaths.some(
        (path) =>
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`)
    );
    return shouldShowTabBar ? <TabBar /> : null;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterAndLogout />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="*" element={<NotFound />} />
                    <Route
                        path="/listings/:listing_id"
                        element={<ListingDetailPage />}
                    />
                    {/* Protected Routes */}
                    <Route
                        path="/mypage/*"
                        element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="" element={<ListingsTabs />} />
                    </Route>
                    <Route path="/sell" element={<Sell />} />
                    <Route
                        path="/sell/create"
                        element={
                            <ProtectedRoute>
                                <ListingForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sell/drafts"
                        element={
                            <ProtectedRoute>
                                <DraftListings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sell/edit/:listing_id"
                        element={
                            <ProtectedRoute>
                                <ListingForm />
                            </ProtectedRoute>
                        }
                    />
                    # Listing
                    <Route
                        path="/mylistings/:listing_id"
                        element={
                            <ProtectedRoute>
                                <ListingDetailPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                <ConditionalTabBar />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
