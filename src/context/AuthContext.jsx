import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('socialflow_token');
    const storedUser = localStorage.getItem('socialflow_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('socialflow_token', token);
      localStorage.setItem('socialflow_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao fazer login. Tente novamente.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('socialflow_token');
    localStorage.removeItem('socialflow_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data;
      
      const mergedUser = { ...user, ...updatedUser };
      localStorage.setItem('socialflow_user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao atualizar perfil.';
      return { success: false, error: errorMsg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
