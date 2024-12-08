import AuthForm from "../../components/authform/AuthForm";
function Login() {
    return <AuthForm route="/api/token/" method="login" />;
}

export default Login;
