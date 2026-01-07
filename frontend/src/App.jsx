import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Seller from "./Seller";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: "10px", background: "#121212" }}>
          <Link to="/" style={{ marginRight: "15px", color: "#4caf50", textDecoration: "none" }}>Admin</Link>
          <Link to="/seller" style={{ color: "#00bcd4", textDecoration: "none" }}>Seller</Link>
        </nav>

        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/seller" element={<Seller />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
