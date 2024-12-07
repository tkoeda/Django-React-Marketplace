import AuthForm from "../../components/authform/authform";
function Login() {
    return <AuthForm route="/api/token/" method="login" />;
}

export default Login;
