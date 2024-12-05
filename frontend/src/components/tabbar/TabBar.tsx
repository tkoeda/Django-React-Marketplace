import { Link, useLocation } from 'react-router-dom';
import './TabBar.css';

const TabBar = () => {
  const location = useLocation();

  return (
    <nav className="tab-bar">
      <Link to="/" className={`tab-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span>Home</span>
      </Link>
      <Link to="/sell" className={`tab-item ${location.pathname === '/sell' ? 'active' : ''}`}>
        <span>Sell</span>
      </Link>
      <Link to="/mypage" className={`tab-item ${location.pathname === '/mypage' ? 'active' : ''}`}>
        <span>MyPage</span>
      </Link>
    </nav>
  );
};

export default TabBar;
