import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Seller from "./Seller";
import ReportsLogin from "./ReportsLogin";

function App() {
  return (
    <Router>
      <div>
        <nav className="app-nav">
          <Link to="/" className="nav-link nav-admin">
            Админ
          </Link>
          <Link to="/seller" className="nav-link nav-seller">
            Seller
          </Link>
          <Link to="/reports" className="nav-link nav-reports">
            Отчёт
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/reports" element={<ReportsLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
