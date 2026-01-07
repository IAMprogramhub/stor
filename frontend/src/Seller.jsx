import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/products";

function Seller() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await axios.get(API_URL);
    setProducts(res.data);
  };

  // ---------------- Уменьшить quantity на 1 ----------------
  const decreaseQuantity = async (id) => {
    await axios.put(`${API_URL}/${id}/decrease`);
    loadProducts();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛒 Seller Panel</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Sale Price</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Unit</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.salePrice}</td>
              <td style={styles.td}>{p.quantity}</td>
              <td style={styles.td}>{p.unit}</td>
              <td style={styles.td}>
                <button
                  style={styles.minusBtn}
                  onClick={() => decreaseQuantity(p.id)}
                >
                  -1
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------- STYLES --------------------
const styles = {

  
  container: {
  background: "#121212",
  minHeight: "100vh",
  padding: "25px",
  color: "#fff",
  fontFamily: "Segoe UI",
  border: "none",       // убираем рамку
  outline: "none"       // убираем обводку
},
  title: { marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: { padding: "10px", borderBottom: "1px solid #333", background: "#222" },
  td: { padding: "10px", borderBottom: "1px solid #333", textAlign: "center" },
  minusBtn: { background: "#f57c00", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" }
};

export default Seller;
