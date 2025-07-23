import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';
import LibraryPage from './pages/LibraryPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player/:videoId" element={<PlayerPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </Layout>
  );
}

export default App;