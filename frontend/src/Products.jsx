import axios from "axios";
import { useEffect, useState } from "react";

// ---------------- URL API ----------------
const PRODUCTS_URL = "http://localhost:8080/products";
const INVENTORY_URL = "http://localhost:8080/inventory";
const HISTORY_URL = "http://localhost:8080/history";

function Products() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);

  const [form, setForm] = useState({
    name: "",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    unit: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [newSalePrice, setNewSalePrice] = useState("");

  const [decreaseAmounts, setDecreaseAmounts] = useState({});

  
  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(PRODUCTS_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Ошибка загрузки продуктов:", err);
      alert("Не удалось загрузить продукты!");
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${HISTORY_URL}/all`);
      setHistory(res.data);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
      alert("Не удалось загрузить историю!");
    }
  };

  // ---------------- Добавление продукта ----------------
  const addProduct = async (e) => {
    e.preventDefault();

    if (form.quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      await axios.post(PRODUCTS_URL, form);
      setForm({ name: "", purchasePrice: "", salePrice: "", quantity: "", unit: "" });
      loadProducts();
      loadHistory();
    } catch (err) {
      console.error("Ошибка добавления продукта:", err);
      alert("Не удалось добавить продукт!");
    }
  };

  // ---------------- Удаление продукта ----------------
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await axios.delete(`${PRODUCTS_URL}/${id}`);
      loadProducts();
      loadHistory();
    } catch (err) {
      console.error("Ошибка удаления продукта:", err);
      alert("Не удалось удалить продукт!");
    }
  };

  // ---------------- Изменение цены продажи ----------------
  const updateSalePrice = async (id) => {
    try {
      await axios.put(`${PRODUCTS_URL}/${id}/update`, {
        salePrice: newSalePrice,
        quantity: products.find(p => p.id === id).quantity
      });

      setEditingId(null);
      setNewSalePrice("");
      loadProducts();
      loadHistory();
    } catch (err) {
      console.error("Ошибка обновления цены:", err);
      alert("Не удалось обновить цену!");
    }
  };

  // ---------------- Уменьшение количества ----------------
  const decreaseQuantity = async (id) => {
    const amount = Number(decreaseAmounts[id]);
    if (!amount || amount <= 0) {
      alert("Введите корректное количество");
      return;
    }

    try {
      await axios.put(`${INVENTORY_URL}/${id}/decrease`, { amount });
      setDecreaseAmounts({ ...decreaseAmounts, [id]: "" });
      loadProducts();
      loadHistory();
    } catch (err) {
      console.error("Ошибка уменьшения количества:", err);
      alert("Не удалось уменьшить количество!");
    }
  };


  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Product Management</h1>

      {/* ADD PRODUCT */}
      <form onSubmit={addProduct} style={styles.form}>
        <input style={styles.input} placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />

        <input style={styles.input} placeholder="Purchase price"
          value={form.purchasePrice}
          onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required />

        <input style={styles.input} placeholder="Sale price"
          value={form.salePrice}
          onChange={e => setForm({ ...form, salePrice: e.target.value })} required />

        <input style={styles.input} type="number" placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })} required />

        <input style={styles.input} placeholder="Unit"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })} required />

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

              {/* SALE PRICE */}
              <td style={styles.td}>
                {editingId === p.id ? (
                  <>
                    <input
                      style={styles.inputSmall}
                      value={newSalePrice}
                      onChange={e => setNewSalePrice(e.target.value)}
                    />
                    <button style={styles.saveBtn} onClick={() => updateSalePrice(p.id)}>💾</button>
                  </>
                ) : (
                  <>
                    {p.salePrice}
                    <button style={styles.editBtn} onClick={() => { setEditingId(p.id); setNewSalePrice(p.salePrice); }}>✏️</button>
                  </>
                )}
              </td>

              {/* QUANTITY */}
              <td style={styles.td}>
                {p.quantity}
                <input
                  type="number"
                  min="1"
                  placeholder="-qty"
                  style={styles.inputSmall}
                  value={decreaseAmounts[p.id] || ""}
                  onChange={e => setDecreaseAmounts({ ...decreaseAmounts, [p.id]: e.target.value })}
                />
                <button style={styles.minusBtn} onClick={() => decreaseQuantity(p.id)}>OK</button>
              </td>

              <td style={styles.td}>{p.unit}</td>
              <td style={{ ...styles.td, color: p.salePrice - p.purchasePrice >= 0 ? "#4caf50" : "#e53935" }}>
                {p.salePrice - p.purchasePrice}
              </td>

              <td style={styles.td}>
                <button style={styles.delBtn} onClick={() => deleteProduct(p.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HISTORY */}
      <div style={{ marginTop: "20px" }}>
        <h2>История уменьшений</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product ID</th>
              <th style={styles.th}>Old Qty</th>
              <th style={styles.th}>New Qty</th>
              <th style={styles.th}>Time</th>
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

// ---------------- STYLES ----------------
const styles = {
  container: { background: "#121212", minHeight: "100vh", padding: "25px", color: "#fff", fontFamily: "Segoe UI" },
  title: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px", borderRadius: "6px" },
  inputSmall: { width: "70px", background: "#121212", border: "1px solid #444", color: "#fff", padding: "4px", borderRadius: "4px", marginLeft: "6px" },
  addBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  editBtn: { marginLeft: "6px", background: "#3949ab", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  saveBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  minusBtn: { marginLeft: "6px", background: "#f57c00", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  delBtn: { background: "#e53935", border: "none", color: "#fff", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: { padding: "10px", borderBottom: "1px solid #333", background: "#222" },
  td: { padding: "10px", borderBottom: "1px solid #333", textAlign: "center" }
};

export default Products;
