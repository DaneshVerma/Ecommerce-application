import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserRouteProtector = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) navigate("/user/login");

  return children;
};

export default UserRouteProtector;
