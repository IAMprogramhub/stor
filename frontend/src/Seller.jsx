import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/products";

function Seller() {
  const [products, setProducts] = useState([]);
  const [decreaseAmounts, setDecreaseAmounts] = useState({});
  const [recentHistory, setRecentHistory] = useState([]);

  // ---------------- загрузка данных ----------------
  useEffect(() => {
    loadProducts();
    loadRecentHistory();

    const interval = setInterval(loadRecentHistory, 60000); // обновление истории каждые 60 секунд
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecentHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history/recent`);
      setRecentHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- уменьшение количества ----------------
  const decreaseQuantity = async (id) => {
    const amount = Number(decreaseAmounts[id]);
    if (!amount || amount <= 0) {
      alert("Введите корректное количество");
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}/decrease`, { amount });
      setDecreaseAmounts({ ...decreaseAmounts, [id]: "" });
      loadProducts();
      loadRecentHistory();
    } catch (err) {
      console.error(err);
      alert("Ошибка при уменьшении количества!");
    }
  };

  // ---------------- отмена продажи ----------------
  const rollbackSale = async (historyId) => {
    if (!window.confirm("Вы уверены, что хотите отменить эту операцию?")) return;

    try {
      await axios.put(`${API_URL}/history/${historyId}/rollback`);
      loadProducts();
      loadRecentHistory();
    } catch (err) {
      console.error(err);
      alert("Ошибка при отмене продажи!");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛒 Seller Panel</h1>

      {/* ---------------- Продукты ---------------- */}
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
          {products.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.salePrice}</td>
              <td style={styles.td}>{p.quantity}</td>
              <td style={styles.td}>{p.unit}</td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="1"
                  placeholder="-qty"
                  style={styles.inputSmall}
                  value={decreaseAmounts[p.id] || ""}
                  onChange={(e) =>
                    setDecreaseAmounts({
                      ...decreaseAmounts,
                      [p.id]: e.target.value,
                    })
                  }
                />
                <button
                  style={styles.minusBtn}
                  onClick={() => decreaseQuantity(p.id)}
                >
                  OK
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------------- История последних 10 минут ---------------- */}
      <h2 style={{ marginTop: "20px" }}>История последних 10 минут</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product ID</th>
            <th style={styles.th}>Old Qty</th>
            <th style={styles.th}>New Qty</th>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {recentHistory.map((h) => (
            <tr key={h.id}>
              <td style={styles.td}>{h.productId}</td>
              <td style={styles.td}>{h.oldQuantity}</td>
              <td style={styles.td}>{h.newQuantity}</td>
              <td style={styles.td}>
                {new Date(h.timestamp).toLocaleTimeString()}
              </td>
              <td style={styles.td}>
                <button
                  style={styles.rollbackBtn}
                  onClick={() => rollbackSale(h.id)}
                >
                  🔄 Отмена
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
  },
  title: { marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: { padding: "10px", borderBottom: "1px solid #333", background: "#222" },
  td: { padding: "10px", borderBottom: "1px solid #333", textAlign: "center" },
  inputSmall: {
    width: "60px",
    background: "#121212",
    border: "1px solid #444",
    color: "#fff",
    padding: "4px",
    borderRadius: "4px",
    marginRight: "6px",
  },
  minusBtn: {
    background: "#f57c00",
    border: "none",
    color: "#fff",
    padding: "4px 7px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  rollbackBtn: {
    background: "#e53935",
    border: "none",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Seller;
