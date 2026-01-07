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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await axios.get(API_URL);
    setProducts(res.data);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, form);
    setForm({ name:"", purchasePrice:"", salePrice:"", quantity:"", unit:"" });
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    loadProducts();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Products</h2>

      {/* Add form */}
      <form onSubmit={addProduct} style={styles.form}>
        <input style={styles.input} placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} />

        <input style={styles.input} placeholder="Purchase price"
          value={form.purchasePrice}
          onChange={e => setForm({...form, purchasePrice: e.target.value})} />

        <input style={styles.input} placeholder="Sale price"
          value={form.salePrice}
          onChange={e => setForm({...form, salePrice: e.target.value})} />

        <input style={styles.input} placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({...form, quantity: e.target.value})} />

        <input style={styles.input} placeholder="Unit"
          value={form.unit}
          onChange={e => setForm({...form, unit: e.target.value})} />

        <button style={styles.addBtn}>Add</button>
      </form>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Purchase</th>
            <th style={styles.th}>Sale</th>
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
              <td style={styles.td}>{p.purchasePrice}</td>
              <td style={styles.td}>{p.salePrice}</td>
              <td style={styles.td}>{p.quantity}</td>
              <td style={styles.td}>{p.unit}</td>
              <td style={styles.td}>
                <button
                  style={styles.delBtn}
                  onClick={() => deleteProduct(p.id)}
                >
                  ✖
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    background: "#121212",
    minHeight: "100vh",
    padding: "30px",
    color: "#fff",
    fontFamily: "Arial"
  },
  title: {
    marginBottom: "20px"
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  input: {
    background: "#1e1e1e",
    border: "1px solid #333",
    color: "#fff",
    padding: "8px",
    borderRadius: "5px"
  },
  addBtn: {
    background: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#1e1e1e"
  },
  th: {
    borderBottom: "1px solid #333",
    padding: "10px",
    background: "#222"
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #333",
    textAlign: "center"
  },
  delBtn: {
    background: "#e53935",
    border: "none",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Products;
