import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  return usuario ? children : <Navigate to="/auth" />;
}
