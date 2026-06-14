import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import AuthPageLayout from "../layouts/AuthPageLayout";

const initialState = {
  name: "",
  email: "",
  password: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <AuthForm
          title="Create your account"
          subtitle="Start your SomuPilot AI workspace with secure authentication."
          fields={[
            {
              name: "name",
              label: "Name",
              type: "text",
              placeholder: "Your full name",
              autoComplete: "name",
              required: true,
            },
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
              placeholder: "At least 6 characters",
              autoComplete: "new-password",
              required: true,
            },
          ]}
          formData={formData}
          error={error}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Register"
          alternateText="Already have an account?"
          alternateTo="/login"
          alternateLabel="Sign in"
        />
      </div>
    </AuthPageLayout>
  );
}

export default RegisterPage;
