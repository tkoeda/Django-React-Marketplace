import { Link } from 'react-router-dom';
import '../../styles/pages/sell/sell.css';

const Sell = () => {
  return (
    <div className="sell-container">
      <h1>Sell Your Furniture</h1>
      <div className="button-container">
        <Link to="/sell/create" className="button create-listing">
          Create New Listing
        </Link>
        <Link to="/sell/drafts" className="button view-drafts">
          View Draft Listings
        </Link>
      </div>
    </div>
  );
};

export default Sell;