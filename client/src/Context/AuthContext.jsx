import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext =
    createContext(null);

export const AuthProvider = ({
    children
}) => {
    const [user, setUser] =
        useState(() => {
            const storedUser =
                sessionStorage.getItem(
                    "user"
                );

            if (!storedUser) {
                return null;
            }

            try {
                return JSON.parse(
                    storedUser
                );
            } catch (error) {
                console.error(
                    "Failed to parse stored user:",
                    error
                );

                sessionStorage.removeItem(
                    "user"
                );

                return null;
            }
        });

    const login = (
        token,
        userData
    ) => {
        sessionStorage.setItem(
            "token",
            token
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};