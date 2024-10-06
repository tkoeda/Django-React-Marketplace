import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/home/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPage from "./pages/mypage/MyPage";
import ListingForm from "./components/listing/ListingForm";
import Sell from "./pages/sell/Sell";
import TabBar from "./components/TabBar";
import ListingDetailPage from "./pages/listing/ListingDetailPage";
import ListingsTabs from "./components/mypage/ListingsTabs";
import DraftListings from "./pages/sell/DraftListings";
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
    const showTabBarPaths = ['/', '/mypage','/sell',];

    const shouldShowTabBar = showTabBarPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    return shouldShowTabBar ? <TabBar /> : null;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                # Auth
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<NotFound />} />
                # Mypage
                <Route path="/mypage/*" element={<MyPage />}>
                    <Route path="" element={<ListingsTabs />} />
                </Route>

                # Sell
                <Route path="/sell" element={<Sell />} />
                <Route path="/sell/create" element={<ListingForm />} />

                <Route path="/sell/drafts" element={<DraftListings />} />
                {/* <Route path="/sell/draft/:listing_id" element={<ListingForm />} /> */}
                <Route path="/sell/edit/:listing_id" element={<ListingForm />} />
                # Listing
                <Route path="/mylistings/:listing_id" element={<ListingDetailPage />} />
            </Routes>
            <ConditionalTabBar />
        </BrowserRouter>
    );
}

export default App;
