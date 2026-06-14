import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import AuthPageLayout from "../layouts/AuthPageLayout";

const initialState = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <AuthForm
          title="Welcome back"
          subtitle="Sign in to access your SomuPilot AI dashboard."
          fields={[
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
              autoComplete: "email",
              required: true,
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "Enter your password",
              autoComplete: "current-password",
              required: true,
            },
          ]}
          formData={formData}
          error={error}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Login"
          alternateText="Need an account?"
          alternateTo="/register"
          alternateLabel="Create one"
        />
      </div>
    </AuthPageLayout>
  );
}

export default LoginPage;
