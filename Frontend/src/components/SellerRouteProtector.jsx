import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SellerRouteProtector = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== "seller") return navigate("/seller/login");
  return children;
};

export default SellerRouteProtector;
