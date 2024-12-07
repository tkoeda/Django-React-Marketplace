import AuthForm from "../../components/authform/authform";
function Register() {
    return <AuthForm route="/api/user/register/" method="register" />;
}

export default Register;
