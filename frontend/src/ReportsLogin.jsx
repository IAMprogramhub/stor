import { useState } from "react";
import Reports from "./Reports";

function ReportsLogin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const correctPassword = "otchet123";

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
    return <Reports />;
  }

  return (
      <div style={styles.container} className="login-page">
        <h2>Пароль для просмотра отчёта</h2>
        <form onSubmit={handleLogin} style={styles.form} className="login-form">
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
    form: {},
    input: {
      padding: "12px",
      borderRadius: "4px",
      border: "none",
      outline: "none",
      background: "#1e1e1e",
      color: "#fff"
    },
    button: {
      padding: "12px 15px",
      minHeight: "44px",
      borderRadius: "4px",
      border: "none",
      background: "#ffb74d",
      color: "#121212",
      cursor: "pointer"
    }
  };

  export default ReportsLogin;