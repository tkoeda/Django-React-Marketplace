import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import './DraftListings.css';

const DraftListings = () => {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await api.get('/api/mylistings/draft/');
        setDrafts(response.data);
      } catch (err) {
        setError('Failed to fetch draft listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  if (isLoading) return <div className="draft-listings">Loading...</div>;
  if (error) return <div className="draft-listings">{error}</div>;

  return (
    <div className="draft-listings">
      <h1>Draft Listings</h1>
      {drafts.length === 0 ? (
        <p>You have no draft listings.</p>
      ) : (
        <ul>
          {drafts.map(draft => (
            <li key={draft.id}>
              <Link to={`/sell/edit/${draft.id}`}>
                <div className="image-container">
                  {draft.thumbnail ? (
                    <picture>
                      <img src={draft.thumbnail} alt={draft.title} />
                    </picture>
                  ) : (
                    <div className="placeholder-image">
                      <span className="placeholder-text">No Image</span>
                    </div>
                  )}
                </div>
                <div className="draft-info">
                  <span className="draft-title">{draft.title}</span>
                  <span className="draft-price">${draft.price}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/sell/create" className="button create-new">Create New Listing</Link>
    </div>
  );
};

export default DraftListings;
