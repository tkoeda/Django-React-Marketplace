import AuthForm from "../../components/authform/AuthForm";
function Register() {
    return <AuthForm route="/api/user/register/" method="register" />;
}

export default Register;
