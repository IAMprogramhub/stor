import { useEffect, useMemo, useState } from "react";
import { calcDeductionAmount, computeGrossProfit } from "./deductionUtils";
import { formatQty } from "./formatQty";
import api, { PRODUCTS, INVENTORY, HISTORY, SELLERS, DEDUCTIONS } from "./api";

function Products() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [newSellerName, setNewSellerName] = useState("");
  const [sellerPasswords, setSellerPasswords] = useState({});
  const [history, setHistory] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    unit: "",
    sellerId: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [newSalePrice, setNewSalePrice] = useState("");

  const [decreaseAmounts, setDecreaseAmounts] = useState({});

  const [deductions, setDeductions] = useState([]);
  const [deductionComment, setDeductionComment] = useState("");
  const [deductionType, setDeductionType] = useState("FIXED");
  const [deductionValue, setDeductionValue] = useState("");
  const [deductionFormError, setDeductionFormError] = useState(null);
  const [deductionSaving, setDeductionSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSellers();
    loadHistory();
    loadDeductions();
  }, []);

  const loadSellers = async () => {
    try {
      const res = await api.get(SELLERS);
      setSellers(res.data);
    } catch (err) {
      console.error("Ошибка загрузки продавцов:", err);
      alert("Не удалось загрузить продавцов!");
    }
  };

  const addSeller = async (e) => {
    e.preventDefault();
    const name = newSellerName.trim();
    if (!name) {
      alert("Введите имя продавца");
      return;
    }
    try {
      await api.post(SELLERS, { name });
      setNewSellerName("");
      loadSellers();
    } catch (err) {
      console.error("Ошибка добавления продавца:", err);
      alert("Не удалось добавить продавца!");
    }
  };

  const setSellerPassword = async (sellerId) => {
    const pwd = (sellerPasswords[sellerId] || "").trim();
    if (!pwd) {
      alert("Введите пароль для продавца");
      return;
    }
    try {
      await api.put(`${SELLERS}/${sellerId}/password`, { password: pwd });
      setSellerPasswords((prev) => ({ ...prev, [sellerId]: "" }));
      loadSellers();
      alert("Пароль сохранён");
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить пароль");
    }
  };

  const deleteSeller = async (sellerId, sellerName) => {
    if (
      !window.confirm(
        `Удалить продавца «${sellerName}»? Товары останутся в системе (без продавца).`
      )
    ) {
      return;
    }
    try {
      await api.delete(`${SELLERS}/${sellerId}`);
      loadSellers();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить продавца");
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get(PRODUCTS);
      setProducts(res.data);
    } catch (err) {
      console.error("Ошибка загрузки продуктов:", err);
      alert("Не удалось загрузить продукты!");
    }
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return (products || []).filter((p) =>
      String(p.name || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const loadHistory = async () => {
    try {
      const res = await api.get(`${HISTORY}/all`);
      setHistory(res.data);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
      alert("Не удалось загрузить историю!");
    }
  };

  const loadDeductions = async () => {
    try {
      const res = await api.get(DEDUCTIONS);
      setDeductions(res.data || []);
    } catch (err) {
      console.error("Ошибка загрузки вычетов:", err);
      alert("Не удалось загрузить вычеты!");
    }
  };

  const grossProfit = useMemo(
    () => computeGrossProfit(history, products),
    [history, products]
  );

  const deductionRows = useMemo(
    () =>
      (deductions || []).map((d) => ({
        ...d,
        amount: calcDeductionAmount(d, grossProfit),
      })),
    [deductions, grossProfit]
  );

  const addDeduction = async (e) => {
    e.preventDefault();
    setDeductionFormError(null);
    const trimmed = deductionComment.trim();
    if (!trimmed) {
      setDeductionFormError("Укажите комментарий: за что вычет");
      return;
    }
    const num = parseFloat(deductionValue);
    if (Number.isNaN(num) || num <= 0) {
      setDeductionFormError("Введите положительное число");
      return;
    }
    if (deductionType === "PERCENT" && num > 100) {
      setDeductionFormError("Процент не может быть больше 100");
      return;
    }

    setDeductionSaving(true);
    try {
      await api.post(DEDUCTIONS, {
        comment: trimmed,
        type: deductionType,
        value: num,
      });
      setDeductionComment("");
      setDeductionValue("");
      setDeductionType("FIXED");
      loadDeductions();
    } catch (err) {
      const msg =
        err.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "Не удалось сохранить вычет";
      setDeductionFormError(msg);
    } finally {
      setDeductionSaving(false);
    }
  };

  const deleteDeduction = async (id) => {
    if (!window.confirm("Удалить этот вычет?")) return;
    try {
      await api.delete(`${DEDUCTIONS}/${id}`);
      loadDeductions();
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить вычет");
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Удалить всю историю списаний? Остатки на складе не меняются. Отменить действие нельзя.")) {
      return;
    }
    try {
      await api.delete(`${HISTORY}/all`);
      loadHistory();
    } catch (err) {
      console.error("Ошибка очистки истории:", err);
      alert("Не удалось очистить историю!");
    }
  };

  // ---------------- Добавление продукта ----------------
  const addProduct = async (e) => {
    e.preventDefault();

    if (Number(form.quantity) <= 0) {
      alert("Количество должно быть больше 0");
      return;
    }
    if (!form.sellerId) {
      alert("Выберите продавца для товара");
      return;
    }

    try {
      await api.post(PRODUCTS, {
        name: form.name,
        purchasePrice: form.purchasePrice,
        salePrice: form.salePrice,
        quantity: form.quantity,
        unit: form.unit,
        sellerId: Number(form.sellerId)
      });
      setForm({ name: "", purchasePrice: "", salePrice: "", quantity: "", unit: "", sellerId: "" });
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
      await api.delete(`${PRODUCTS}/${id}`);
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
      const p = products.find(pr => pr.id === id);
      await api.put(`${PRODUCTS}/${id}/update`, {
        salePrice: newSalePrice,
        quantity: p.quantity,
        sellerId: p.sellerId != null ? p.sellerId : null
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

  const updateProductSeller = async (productId, sellerIdStr) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    try {
      await api.put(`${PRODUCTS}/${productId}/update`, {
        salePrice: p.salePrice,
        quantity: p.quantity,
        sellerId: sellerIdStr ? Number(sellerIdStr) : null
      });
      loadProducts();
      loadHistory();
    } catch (err) {
      console.error("Ошибка смены продавца:", err);
      alert("Не удалось назначить продавца!");
    }
  };


  const adjustQuantity = async (id, direction) => {
    const amount = Number(decreaseAmounts[id]);
    if (!amount || amount <= 0) {
      alert("Введите положительное число (можно 0.3, 1.5 и т.д.)");
      return;
    }

    const endpoint =
      direction === "plus"
        ? `${INVENTORY}/${id}/increase`
        : `${INVENTORY}/${id}/decrease`;

    try {
      await api.put(endpoint, {
        amount,
        recordSale: false,
      });
      setDecreaseAmounts({ ...decreaseAmounts, [id]: "" });
      loadProducts();
    } catch (err) {
      console.error("Ошибка изменения количества:", err);
      alert(
        direction === "plus"
          ? "Не удалось увеличить количество!"
          : "Не удалось уменьшить количество!"
      );
    }
  };


  return (
    <div style={styles.container} className="page-container">
      <h1 style={styles.title}>📦 Product Management</h1>

      <form className="flex-form" style={{ ...styles.form, marginBottom: "12px" }} onSubmit={(e) => e.preventDefault()}>
        <input
          style={{ ...styles.input, minWidth: "260px" }}
          placeholder="Поиск товара по названию…"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        <button type="button" style={styles.clearSearchBtn} onClick={() => setProductSearch("")}>
          Очистить
        </button>
      </form>

      {/* ADD PRODUCT */}
      <form onSubmit={addProduct} className="flex-form" style={styles.form}>
        <input style={styles.input} placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />

        <input style={styles.input} placeholder="Purchase price"
          value={form.purchasePrice}
          onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required />

        <input style={styles.input} placeholder="Sale price"
          value={form.salePrice}
          onChange={e => setForm({ ...form, salePrice: e.target.value })} required />

        <input style={styles.input} type="number" min="0.001" step="0.001" placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })} required />

        <input style={styles.input} placeholder="Unit"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })} required />

        <select
          style={styles.select}
          value={form.sellerId}
          onChange={e => setForm({ ...form, sellerId: e.target.value })}
          required
        >
          <option value="">— Выберите продавца —</option>
          {sellers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button style={styles.addBtn}>➕ Add</button>
      </form>

      {/* PRODUCTS TABLE */}
      <div className="table-scroll">
      <table style={styles.table} className="data-table">
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Название</th>
            <th style={styles.th}>Продавец</th>
            <th style={styles.th}>Цена покупки</th>
            <th style={styles.th}>цена для продажи</th>
            <th style={styles.th}>Кол-во</th>
            <th style={styles.th}>Ед измерения</th>
            <th style={styles.th}>Profit</th>
            <th style={styles.th}>прибыль</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(p => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>
                <select
                  style={styles.selectRow}
                  className="select-row-mobile"
                  value={p.sellerId != null ? String(p.sellerId) : ""}
                  onChange={(e) => updateProductSeller(p.id, e.target.value)}
                >
                  <option value="">—</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </td>
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
                {formatQty(p.quantity)}
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="±кол-во"
                  style={styles.inputSmall}
                  value={decreaseAmounts[p.id] || ""}
                  onChange={e => setDecreaseAmounts({ ...decreaseAmounts, [p.id]: e.target.value })}
                />
                <button style={styles.plusBtn} onClick={() => adjustQuantity(p.id, "plus")}>+</button>
                <button style={styles.minusBtn} onClick={() => adjustQuantity(p.id, "minus")}>−</button>
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
      </div>

      {/* DEDUCTIONS */}
      <div style={styles.deductionsSection} className="section-box">
        <h2 style={styles.deductionsTitle}>Вычеты для отчёта</h2>
        <p style={styles.deductionsHint}>
          Прибыль до вычетов (для расчёта %): {grossProfit.toFixed(2)}.
        </p>

        <form onSubmit={addDeduction} className="deduction-form" style={styles.deductionForm}>
          <input
            style={{ ...styles.input, minWidth: "280px" }}
            placeholder="Комментарий"
            value={deductionComment}
            onChange={(e) => setDeductionComment(e.target.value)}
            maxLength={500}
          />
          <select
            style={styles.select}
            value={deductionType}
            onChange={(e) => setDeductionType(e.target.value)}
          >
            <option value="FIXED">Сумма (минус)</option>
            <option value="PERCENT">Процент от прибыли</option>
          </select>
          <input
            style={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            max={deductionType === "PERCENT" ? "100" : undefined}
            placeholder={deductionType === "FIXED" ? "Сумма" : "%"}
            value={deductionValue}
            onChange={(e) => setDeductionValue(e.target.value)}
          />
          <button
            type="submit"
            style={styles.deductionAddBtn}
            disabled={deductionSaving}
          >
            {deductionSaving ? "…" : "Добавить вычет"}
          </button>
        </form>
        {deductionFormError && (
          <p style={styles.deductionError}>{deductionFormError}</p>
        )}

        <div className="table-scroll">
        <table style={styles.table} className="data-table">
          <thead>
            <tr>
              <th style={styles.th}>Дата</th>
              <th style={styles.th}>Комментарий</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Значение</th>
              <th style={styles.th}>Сумма</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {deductionRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...styles.td, color: "#888" }}>
                  Вычетов нет
                </td>
              </tr>
            ) : (
              deductionRows.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}>
                    {d.createdAt
                      ? new Date(d.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={styles.td}>{d.comment}</td>
                  <td style={styles.td}>
                    {d.type === "FIXED" ? "Сумма" : "Процент"}
                  </td>
                  <td style={styles.td}>
                    {d.type === "FIXED"
                      ? Number(d.value).toFixed(2)
                      : `${Number(d.value)}%`}
                  </td>
                  <td style={{ ...styles.td, color: "#ffb74d" }}>
                    −{d.amount.toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      style={styles.deductionDelBtn}
                      onClick={() => deleteDeduction(d.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* HISTORY */}
      <div style={{ marginTop: "20px" }}>
        <div style={styles.historyHeader} className="toolbar-row">
          <h2 style={{ margin: 0 }}>История продаж</h2>
          <button type="button" style={styles.clearHistoryBtn} onClick={clearAllHistory}>
            Очистить всю историю
          </button>
        </div>
        <div className="table-scroll">
        <table style={styles.table} className="data-table">
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
                <td style={styles.td}>{formatQty(h.oldQuantity)}</td>
                <td style={styles.td}>{formatQty(h.newQuantity)}</td>
                <td style={styles.td}>{new Date(h.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* SELLERS (последним) */}
      <div style={styles.sellersManage} className="section-box">
        <h3 style={styles.sellersManageTitle}>Продавцы</h3>
        <div className="table-scroll">
        <table style={styles.table} className="data-table">
          <thead>
            <tr>
              <th style={styles.th}>Имя</th>
              <th style={styles.th}>Пароль</th>
              <th style={styles.th}>Новый пароль</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...styles.td, color: "#888" }}>
                  Нет продавцов
                </td>
              </tr>
            ) : (
              sellers.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>
                    {s.hasPassword ? (
                      <span style={{ color: "#81c784" }}>назначен</span>
                    ) : (
                      <span style={{ color: "#ffab40" }}>не задан</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <input
                      type="password"
                      style={styles.inputSmallWide}
                      className="input-small-wide-mobile"
                      placeholder="Пароль для входа"
                      value={sellerPasswords[s.id] || ""}
                      onChange={(e) =>
                        setSellerPasswords({
                          ...sellerPasswords,
                          [s.id]: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td style={styles.td}>
                    <div className="btn-group-mobile">
                    <button
                      type="button"
                      style={styles.savePwdBtn}
                      onClick={() => setSellerPassword(s.id)}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      style={styles.deleteSellerBtn}
                      onClick={() => deleteSeller(s.id, s.name)}
                    >
                      Удалить
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <form onSubmit={addSeller} className="flex-form" style={{ ...styles.form, marginBottom: "12px" }}>
        <span style={{ alignSelf: "center", color: "#aaa" }}>Новый продавец:</span>
        <input
          style={styles.input}
          placeholder="Имя продавца"
          value={newSellerName}
          onChange={(e) => setNewSellerName(e.target.value)}
        />
        <button type="submit" style={styles.addSellerBtn}>➕ Продавец</button>
      </form>
    </div>
  );
}


const styles = {
  container: { background: "#121212", minHeight: "100vh", padding: "25px", color: "#fff", fontFamily: "Segoe UI" },
  title: { marginBottom: "20px" },
  form: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px", borderRadius: "6px" },
  inputSmall: { width: "70px", background: "#121212", border: "1px solid #444", color: "#fff", padding: "4px", borderRadius: "4px", marginLeft: "6px" },
  addBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  addSellerBtn: { background: "#00bcd4", border: "none", color: "#fff", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  clearSearchBtn: { background: "transparent", border: "1px solid #455a64", color: "#b0bec5", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" },
  select: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px", borderRadius: "6px", minWidth: "140px" },
  selectRow: { background: "#121212", border: "1px solid #444", color: "#fff", padding: "6px", borderRadius: "4px", maxWidth: "160px" },
  editBtn: { marginLeft: "6px", background: "#3949ab", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  saveBtn: { background: "#4caf50", border: "none", color: "#fff", padding: "4px 7px", borderRadius: "4px", cursor: "pointer" },
  plusBtn: { marginLeft: "6px", background: "#43a047", border: "none", color: "#fff", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" },
  minusBtn: { marginLeft: "4px", background: "#f57c00", border: "none", color: "#fff", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" },
  delBtn: { background: "#e53935", border: "none", color: "#fff", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: { padding: "10px", borderBottom: "1px solid #333", background: "#222" },
  td: { padding: "10px", borderBottom: "1px solid #333", textAlign: "center" },
  historyHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px",
  },
  clearHistoryBtn: {
    background: "#b71c1c",
    border: "1px solid #e53935",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  deductionsSection: {
    marginTop: "28px",
    padding: "20px",
    background: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #ffb74d",
  },
  deductionsTitle: { margin: "0 0 8px", color: "#ffb74d", fontSize: "18px" },
  deductionsHint: { color: "#9e9e9e", fontSize: "13px", marginBottom: "14px" },
  deductionForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "12px",
    alignItems: "center",
  },
  deductionAddBtn: {
    background: "#ffb74d",
    border: "none",
    color: "#121212",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  deductionDelBtn: {
    background: "transparent",
    border: "1px solid #e53935",
    color: "#e53935",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  deductionError: { color: "#e57373", margin: "0 0 12px" },
  sellersManage: {
    marginBottom: "20px",
    padding: "16px",
    background: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  sellersManageTitle: { margin: "0 0 12px", color: "#00bcd4", fontSize: "16px" },
  inputSmallWide: {
    width: "160px",
    background: "#121212",
    border: "1px solid #444",
    color: "#fff",
    padding: "6px 8px",
    borderRadius: "4px",
  },
  savePwdBtn: {
    background: "#3949ab",
    border: "none",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
  },
  deleteSellerBtn: {
    background: "transparent",
    border: "1px solid #e53935",
    color: "#e53935",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default Products;
