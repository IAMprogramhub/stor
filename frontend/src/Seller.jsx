import { useEffect, useState, useMemo } from "react";
import { formatQty } from "./formatQty";
import api, { PRODUCTS, INVENTORY, HISTORY, SELLERS } from "./api";

function Seller() {
  const [sellers, setSellers] = useState([]);
  const [loggedInSeller, setLoggedInSeller] = useState(null);
  const [loginSellerId, setLoginSellerId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [decreaseAmounts, setDecreaseAmounts] = useState({});
  const [recentHistory, setRecentHistory] = useState([]);

  const selectedSellerId = loggedInSeller?.id ?? null;

  useEffect(() => {
    loadSellers();
  }, []);

  useEffect(() => {
    if (selectedSellerId == null) {
      setProducts([]);
      return;
    }
    loadProducts(selectedSellerId);
  }, [selectedSellerId]);

  useEffect(() => {
    if (selectedSellerId == null) return;

    loadRecentHistory();
    const interval = setInterval(loadRecentHistory, 60000);
    return () => clearInterval(interval);
  }, [selectedSellerId]);

  const loadSellers = async () => {
    try {
      const res = await api.get(SELLERS);
      setSellers(res.data);
    } catch (err) {
      console.error("Ошибка загрузки продавцов:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginSellerId) {
      setLoginError("Продавцы");
      return;
    }
    try {
      const res = await api.post(`${SELLERS}/login`, {
        sellerId: Number(loginSellerId),
        password: loginPassword,
      });
      setLoggedInSeller(res.data);
      setLoginPassword("");
    } catch (err) {
      const msg =
        err.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "Ошибка входа";
      setLoginError(msg);
    }
  };

  const handleLogout = () => {
    setLoggedInSeller(null);
    setLoginSellerId("");
    setLoginPassword("");
    setLoginError(null);
    setProducts([]);
    setRecentHistory([]);
  };

  const loadProducts = async (sellerId) => {
    try {
      const res = await api.get(PRODUCTS, {
        params: { sellerId },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Ошибка загрузки продуктов:", err);
    }
  };

  const loadRecentHistory = async () => {
    try {
      const res = await api.get(`${HISTORY}/recent`);
      setRecentHistory(res.data);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    }
  };

  const productIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return (products || []).filter((p) =>
      String(p.name || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const historyForSeller = useMemo(
    () => recentHistory.filter((h) => productIds.has(h.productId)),
    [recentHistory, productIds]
  );

  const decreaseQuantity = async (id) => {
    const amount = Number(decreaseAmounts[id]);
    if (!amount || amount <= 0) {
      alert("Введите положительное число (можно 0.3, 1.5 и т.д.)");
      return;
    }
    if (selectedSellerId == null) return;

    try {
      await api.put(`${INVENTORY}/${id}/decrease`, { amount, recordSale: true });
      setDecreaseAmounts({ ...decreaseAmounts, [id]: "" });
      loadProducts(selectedSellerId);
      loadRecentHistory();
    } catch (err) {
      console.error("Ошибка уменьшения количества:", err);
      alert("Ошибка при уменьшении количества!");
    }
  };

  const rollbackSale = async (historyId) => {
    if (!window.confirm("Вы уверены, что хотите отменить эту операцию?")) return;
    if (selectedSellerId == null) return;

    try {
      await api.put(`${HISTORY}/${historyId}/rollback`);
      loadProducts(selectedSellerId);
      loadRecentHistory();
    } catch (err) {
      console.error("Ошибка отката продажи:", err);
      alert("Ошибка при отмене продажи!");
    }
  };

  if (!loggedInSeller) {
    return (
      <div style={styles.container} className="page-container login-page">
        <h1 style={styles.title}>🛒 Вход продавца</h1>
        <p style={styles.hint} className="page-subtitle">
          для смены пороля обратиться к админу
        </p>

        {sellers.length === 0 ? (
          <p style={styles.muted}>Нет продавцов — добавьте их в панели Admin</p>
        ) : (
          <form onSubmit={handleLogin} style={styles.loginForm} className="login-form">
            <select
              style={styles.select}
              value={loginSellerId}
              onChange={(e) => setLoginSellerId(e.target.value)}
            >
              <option value="">— Выберите себя —</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {!s.hasPassword ? " (пароль не задан)" : ""}
                </option>
              ))}
            </select>
            <input
              type="password"
              style={styles.input}
              placeholder="Пароль"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button type="submit" style={styles.loginBtn}>
              Войти
            </button>
          </form>
        )}
        {loginError && <p style={styles.loginError}>{loginError}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-container">
      <div style={styles.topBar} className="top-bar">
        <h1 style={{ ...styles.title, margin: 0 }}>🛒 {loggedInSeller.name}</h1>
        <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </div>

        <form className="flex-form" style={{ marginBottom: "12px" }} onSubmit={(e) => e.preventDefault()}>
          <input
            style={{ ...styles.input, minWidth: "240px" }}
            placeholder="Поиск товара по названию…"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <button type="button" style={styles.clearSearchBtn} onClick={() => setProductSearch("")}>
            Очистить
          </button>
        </form>

      <div className="table-scroll">
      <table style={styles.table} className="data-table">
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Товар</th>
            <th style={styles.th}>Цена Price</th>
            <th style={styles.th}>Колво</th>
            <th style={styles.th}>ед измерения</th>
            <th style={styles.th}>продано</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.salePrice}</td>
              <td style={styles.td}>{formatQty(p.quantity)}</td>
              <td style={styles.td}>{p.unit}</td>
              <td style={styles.td}>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="-кол-во"
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
      </div>

      {filteredProducts.length === 0 && (
        <p style={styles.emptyProducts}>У вас пока нет товаров</p>
      )}

      <h2 style={{ marginTop: "20px" }}>История -10 минут</h2>
      <div className="table-scroll">
      <table style={styles.table} className="data-table">
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Колво до</th>
            <th style={styles.th}>Колво после</th>
            <th style={styles.th}>время</th>
            <th style={styles.th}>действие</th>
          </tr>
        </thead>
        <tbody>
          {historyForSeller.map((h) => (
            <tr key={h.id}>
              <td style={styles.td}>{h.productId}</td>
              <td style={styles.td}>{formatQty(h.oldQuantity)}</td>
              <td style={styles.td}>{formatQty(h.newQuantity)}</td>
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
    </div>
  );
}

const styles = {
  container: {
    background: "#121212",
    minHeight: "100vh",
    padding: "25px",
    color: "#fff",
    fontFamily: "Segoe UI",
  },
  title: { marginBottom: "16px" },
  topBar: { marginBottom: "16px" },
  hint: { color: "#9e9e9e", marginBottom: "16px", maxWidth: "480px" },
  loginForm: {},
  select: {
    background: "#1e1e1e",
    border: "1px solid #333",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    minWidth: "200px",
  },
  input: {
    background: "#1e1e1e",
    border: "1px solid #333",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
  },
  loginBtn: {
    background: "#00bcd4",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  clearSearchBtn: {
    background: "transparent",
    border: "1px solid #455a64",
    color: "#b0bec5",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #78909c",
    color: "#b0bec5",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loginError: { color: "#e57373", marginTop: "12px" },
  emptyProducts: { color: "#888", marginTop: "8px" },
  muted: { color: "#888", marginTop: "8px" },
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
