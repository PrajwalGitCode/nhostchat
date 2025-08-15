import { useState } from "react";
import { nhost } from "../nhost";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signUpError } = await nhost.auth.signUp({ email, password });

      if (signUpError) {
        // Specific handling for duplicate email
        if (signUpError.error === "conflict" || signUpError.status === 409) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(signUpError.message || "An unexpected error occurred.");
        }
      } else {
        navigate("/signin", { state: { message: "Account created successfully. Please sign in." } });
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
        onSubmit={handleSignUp}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
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
          className={`w-full text-white p-2 rounded ${loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
