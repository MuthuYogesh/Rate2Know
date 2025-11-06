import { useState, useContext, createContext } from "react";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export default function AuthProvider({ children }) {
    const [user, setUser] = useState({}); // {id,email,role,token,name} id: 1, email: "dev@gmail.com", role: "system_admin", token: "123456", name: "AdminDev" 
    const login = (userObj) => setUser(userObj);
    const logout = () => setUser(null);
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}