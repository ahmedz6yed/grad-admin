import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, []);
  return (
    <div>
      Hi
      <button
        onClick={() => {
          navigate("/login");
        }}
      >
        Go to dashboard
      </button>
    </div>
  );
}
