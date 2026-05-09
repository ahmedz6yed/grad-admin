export default function Logo({ className = "text-2xl" }) {
  return (
    <div className={`flex items-center gap-2 group cursor-default ${className}`}>
      <h1 className="font-bold font-logo tracking-tight">
        Fix<span className="text-accent">Pay</span>
      </h1>
    </div>
  );
}