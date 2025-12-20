import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await authApi.getMe();
                    setUser(response.data.user);
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { user: userData, token: newToken } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const register = async (email: string, password: string, name: string) => {
        const response = await authApi.register({ email, password, name });
        const { user: userData, token: newToken } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
                {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
