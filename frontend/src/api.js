import axios from "axios";

/** Адрес API на сервере (по умолчанию для всех сборок) */
const SERVER_API_BASE = "http://178.105.185.20:8080";

export const API_BASE = (
  process.env.REACT_APP_API_URL || SERVER_API_BASE
).replace(/\/$/, "");

export const api = axios.create({ baseURL: API_BASE });

/** Относительные пути — всегда через api / API_BASE, без localhost */
export const PRODUCTS = "/products";
export const INVENTORY = "/inventory";
export const HISTORY = "/history";
export const SELLERS = "/sellers";
export const DEDUCTIONS = "/deductions";

/** Полные URL (если нужны явно) */
export const PRODUCTS_URL = `${API_BASE}${PRODUCTS}`;
export const INVENTORY_URL = `${API_BASE}${INVENTORY}`;
export const HISTORY_URL = `${API_BASE}${HISTORY}`;
export const SELLERS_URL = `${API_BASE}${SELLERS}`;
export const DEDUCTIONS_URL = `${API_BASE}${DEDUCTIONS}`;

export default api;
