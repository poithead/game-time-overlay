import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DEPRECATED: This component has been replaced by MyGames (landing page) and ControlPanel.
 * Kept for backward compatibility but redirects to /dashboard (MyGames).
 */
const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Dashboard;
