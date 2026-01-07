import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    unit: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [newSalePrice, setNewSalePrice] = useState("");

  const [history, setHistory] = useState([]);

  // Загрузка продуктов и истории при старте
  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    const res = await axios.get(API_URL);
    setProducts(res.data);
  };

  const loadHistory = async () => {
    const res = await axios.get(`${API_URL}/history/all`); // весь history
    setHistory(res.data);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (form.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    await axios.post(API_URL, form);
    setForm({ name:"", purchasePrice:"", salePrice:"", quantity:"", unit:"" });
    loadProducts();
    loadHistory();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await axios.delete(`${API_URL}/${id}`);
    loadProducts();
    loadHistory();
  };

  const updateSalePrice = async (id) => {
    await axios.put(`${API_URL}/${id}/update`, {
      salePrice: newSalePrice,
      quantity: products.find(p => p.id === id).quantity
    });
    setEditingId(null);
    setNewSalePrice("");
    loadProducts();
    loadHistory();
  };

  const decreaseQuantity = async (id) => {
    await axios.put(`${API_URL}/${id}/decrease`);
    loadProducts();
    loadHistory();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Product Management</h1>

      {/* ADD PRODUCT */}
      <form onSubmit={addProduct} style={styles.form}>
        <input style={styles.input} placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} required />
        <input style={styles.input} placeholder="Purchase price"
          value={form.purchasePrice}
          onChange={e => setForm({...form, purchasePrice: e.target.value})} required />
        <input style={styles.input} placeholder="Sale price"
          value={form.salePrice}
          onChange={e => setForm({...form, salePrice: e.target.value})} required />
        <input style={styles.input} placeholder="Quantity"
          type="number"
          value={form.quantity}
          onChange={e => setForm({...form, quantity: e.target.value})} required />
        <input style={styles.input} placeholder="Unit"
          value={form.unit}
          onChange={e => setForm({...form, unit: e.target.value})} required />
        <button style={styles.addBtn}>➕ Add</button>
      </form>

      {/* PRODUCTS TABLE */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Purchase</th>
            <th style={styles.th}>Sale</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Unit</th>
            <th style={styles.th}>Profit</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.purchasePrice}</td>

              {/* SALE PRICE EDIT */}
              <td style={styles.td}>
                {editingId === p.id ? (
                  <>
                    <input
                      style={styles.inputSmall}
                      value={newSalePrice}
                      onChange={e => setNewSalePrice(e.target.value)}
                    />
                    <button
                      style={styles.saveBtn}
                      onClick={() => updateSalePrice(p.id)}
                    >
                      💾
                    </button>
                  </>
                ) : (
                  <>
                    {p.salePrice}
                    <button
                      style={styles.editBtn}
                      onClick={() => {
                        setEditingId(p.id);
                        setNewSalePrice(p.salePrice);
                      }}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </td>

              {/* QUANTITY */}
              <td style={styles.td}>
                {p.quantity}
                <button
                  style={styles.minusBtn}
                  onClick={() => decreaseQuantity(p.id)}
                >
                  -1
                </button>
              </td>

              <td style={styles.td}>{p.unit}</td>

              {/* PROFIT */}
              <td style={{
                ...styles.td,
                color: p.salePrice - p.purchasePrice >= 0 ? "#4caf50" : "#e53935"
              }}>
                {p.salePrice - p.purchasePrice}
              </td>

              <td style={styles.td}>
                <button
                  style={styles.delBtn}
                  onClick={() => deleteProduct(p.id)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HISTORY ВСЕХ ПРОДУКТОВ */}
      <div style={{ marginTop: "20px" }}>
        <h2>История всех уменьшений -1</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Old Qty</th>
              <th>New Qty</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td style={styles.td}>{h.productId}</td>
                <td style={styles.td}>{h.oldQuantity}</td>
                <td style={styles.td}>{h.newQuantity}</td>
                <td style={styles.td}>{new Date(h.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------- STYLES --------------------
const styles = {
  container: { background: "#121212", minHeight: "100vh", padding: "25px", color: "#fff", fontFamily: "Segoe UI" },
  title: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px", borderRadius: "6px" },
  inputSmall: { width: "70px", background: "#121212", border: "1px solid #444", color: "#fff", padding: "4px", borderRadius: "4px", marginRight: "5px" },
  addBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  editBtn: { marginLeft: "6px", background: "#3949ab", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  saveBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  minusBtn: { marginLeft: "6px", background: "#f57c00", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  delBtn: { background: "#e53935", border: "none", color: "#fff", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" },
  historyBtn: { marginLeft: "6px", background: "#00bcd4", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: { padding: "10px", borderBottom: "1px solid #333", background: "#222" },
  td: { padding: "10px", borderBottom: "1px solid #333", textAlign: "center" }
};

export default Products;
