import { useCallback, useEffect, useMemo, useState } from "react";
import { calcDeductionAmount } from "./deductionUtils";
import api, { PRODUCTS, HISTORY, DEDUCTIONS } from "./api";

function Reports() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, pRes, dRes] = await Promise.all([
        api.get(`${HISTORY}/all`),
        api.get(PRODUCTS),
        api.get(DEDUCTIONS),
      ]);
      setHistory(hRes.data || []);
      setProducts(pRes.data || []);
      setDeductions(dRes.data || []);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const productById = useMemo(() => {
    const m = {};
    for (const p of products) {
      m[p.id] = p;
    }
    return m;
  }, [products]);

  const rows = useMemo(() => {
    const list = (history || []).map((h) => {
      const sold = Math.max(0, h.oldQuantity - h.newQuantity);
      const p = productById[h.productId];
      const salePrice = p ? Number(p.salePrice) : 0;
      const purchasePrice = p ? Number(p.purchasePrice) : 0;
      const revenue = sold * salePrice;
      const profit = sold * (salePrice - purchasePrice);
      return {
        id: h.id,
        timestamp: h.timestamp,
        productId: h.productId,
        productName: p ? p.name : "— (товар удалён)",
        sellerName: p && p.sellerName ? p.sellerName : "—",
        oldQty: h.oldQuantity,
        newQty: h.newQuantity,
        sold,
        revenue,
        profit,
      };
    });
    list.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return tb - ta;
    });
    return list;
  }, [history, productById]);

  const totals = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    for (const r of rows) {
      revenue += r.revenue;
      profit += r.profit;
    }
    return { revenue, profit };
  }, [rows]);

  const deductionRows = useMemo(() => {
    const gross = totals.profit;
    return (deductions || []).map((d) => ({
      ...d,
      amount: calcDeductionAmount(d, gross),
    }));
  }, [deductions, totals.profit]);

  const totalDeductions = useMemo(
    () => deductionRows.reduce((s, d) => s + d.amount, 0),
    [deductionRows]
  );

  const netProfit = totals.profit - totalDeductions;

  if (loading) {
    return (
      <div style={styles.container} className="page-container">
        <p style={styles.muted}>Загрузка…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container} className="page-container">
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-container">
      <h1 style={styles.title}>📊 История и доход</h1>
      <p style={styles.subtitle} className="page-subtitle">

      </p>

      <div style={styles.summary} className="summary-grid">
        <div style={styles.summaryCard} className="summary-card">
          <div style={styles.summaryLabel}>Итого выручка</div>
          <div style={styles.summaryValue}>{totals.revenue.toFixed(2)}</div>
        </div>
        <div style={styles.summaryCard} className="summary-card">
          <div style={styles.summaryLabel}>Прибыль (до вычетов)</div>
          <div
            style={{
              ...styles.summaryValue,
              color: totals.profit >= 0 ? "#81c784" : "#e57373",
            }}
          >
            {totals.profit.toFixed(2)}
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#ffb74d" }} className="summary-card">
          <div style={styles.summaryLabel}>Сумма вычетов</div>
          <div style={{ ...styles.summaryValue, color: "#ffb74d" }}>
            −{totalDeductions.toFixed(2)}
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#4caf50" }} className="summary-card">
          <div style={styles.summaryLabel}>Чистая прибыль</div>
          <div
            style={{
              ...styles.summaryValue,
              color: netProfit >= 0 ? "#81c784" : "#e57373",
            }}
          >
            {netProfit.toFixed(2)}
          </div>
        </div>
        <div style={styles.summaryCard} className="summary-card">
          <div style={styles.summaryLabel}>Записей в истории</div>
          <div style={styles.summaryValue}>{rows.length}</div>
        </div>
      </div>

      <section style={styles.section} className="section-box">
        <h2 style={styles.sectionTitle}>Вычеты (просмотр)</h2>
        <div className="table-scroll">
        <table style={styles.table} className="data-table">
          <thead>
            <tr>
              <th style={styles.th}>Дата</th>
              <th style={styles.th}>Комментарий</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Значение</th>
              <th style={styles.th}>Сумма вычета</th>
            </tr>
          </thead>
          <tbody>
            {deductionRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...styles.td, color: "#888" }}>
                  Вычетов пока нет
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
                  <td style={styles.td} className="wrap-cell">{d.comment}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </section>

      <h2 style={{ ...styles.sectionTitle, marginTop: "32px" }}>
        История продаж
      </h2>

      <div className="table-scroll">
      <table style={styles.table} className="data-table">
        <thead>
          <tr>
            <th style={styles.th}>Время</th>
            <th style={styles.th}>Товар</th>
            <th style={styles.th}>Продавец</th>
            <th style={styles.th}>Было</th>
            <th style={styles.th}>Стало</th>
            <th style={styles.th}>Списано</th>
            <th style={styles.th}>Выручка</th>
            <th style={styles.th}>Прибыль</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ ...styles.td, color: "#888" }}>
                История пуста
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td style={styles.td}>
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td style={styles.td}>
                  {r.productName}
                  <span style={styles.idHint}> #{r.productId}</span>
                </td>
                <td style={styles.td}>{r.sellerName}</td>
                <td style={styles.td}>{r.oldQty}</td>
                <td style={styles.td}>{r.newQty}</td>
                <td style={styles.td}>{r.sold}</td>
                <td style={styles.td}>{r.revenue.toFixed(2)}</td>
                <td
                  style={{
                    ...styles.td,
                    color: r.profit >= 0 ? "#a5d6a7" : "#ef9a9a",
                  }}
                >
                  {r.profit.toFixed(2)}
                </td>
              </tr>
            ))
          )}
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
  title: { marginBottom: "8px" },
  subtitle: {
    color: "#9e9e9e",
    marginBottom: "20px",
    maxWidth: "720px",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: "28px",
    padding: "20px",
    background: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #333",
  },
  sectionTitle: { fontSize: "18px", marginBottom: "16px", color: "#ffb74d" },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "16px 24px",
    minWidth: "160px",
  },
  summaryLabel: { color: "#9e9e9e", fontSize: "13px", marginBottom: "6px" },
  summaryValue: { fontSize: "22px", fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e1e1e" },
  th: {
    padding: "10px",
    borderBottom: "1px solid #333",
    background: "#222",
    textAlign: "left",
  },
  td: { padding: "10px", borderBottom: "1px solid #333" },
  idHint: { color: "#666", fontSize: "12px" },
  muted: { color: "#888" },
  error: { color: "#e57373" },
};

export default Reports;
