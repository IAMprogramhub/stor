import { useState } from "react";
import Products from "./Products";

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const correctPassword = "admin123"; // пароль администратора

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setLoggedIn(true);
    } else {
      alert("Неверный пароль");
      setPassword("");
    }
  };

  if (loggedIn) {
    return <Products />; // показываем админ-панель
  }

  return (
    <div style={styles.container}>
      <h2>Введите пароль администратора</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Войти</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#121212",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Segoe UI"
  },
  form: {
    display: "flex",
    gap: "10px"
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    background: "#1e1e1e",
    color: "#fff"
  },
  button: {
    padding: "8px 15px",
    borderRadius: "4px",
    border: "none",
    background: "#4caf50",
    color: "#fff",
    cursor: "pointer"
  }
};

export default AdminLogin;
