export default function Logo({ className = "text-2xl" }) {
  return (
    <h1 className={`font-bold font-logo tracking-tight ${className}`}>
      Fix<span className="text-accent">Pay</span>
    </h1>
  );
}
