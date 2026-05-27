export function calcDeductionAmount(deduction, grossProfit) {
  const v = Number(deduction.value);
  if (deduction.type === "FIXED") return v;
  if (deduction.type === "PERCENT") return (grossProfit * v) / 100;
  return 0;
}

export function computeGrossProfit(history, products) {
  const productById = {};
  for (const p of products || []) {
    productById[p.id] = p;
  }
  let profit = 0;
  for (const h of history || []) {
    const sold = Math.max(0, h.oldQuantity - h.newQuantity);
    const p = productById[h.productId];
    if (!p) continue;
    profit += sold * (Number(p.salePrice) - Number(p.purchasePrice));
  }
  return profit;
}
