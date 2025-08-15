import { useState } from "react";
import { nhost } from "../nhost";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || "";

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await nhost.auth.signIn({ email, password });

      if (signInError) {
        // Friendly messages for common error types
        if (signInError.error === "invalid-credentials") {
          setError("Incorrect email or password. Please try again.");
        } else if (signInError.error === "email-not-verified") {
          setError("Your email is not verified. Please check your inbox.");
        } else {
          setError(signInError.message || "Unable to sign in. Please try again.");
        }
      } else {
        navigate("/welcome");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-96"
        onSubmit={handleSignIn}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {successMessage && (
          <p className="text-green-500 mb-2">{successMessage}</p>
        )}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-2 rounded ${loading ? "bg-green-300" : "bg-green-500 hover:bg-green-600"}`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
