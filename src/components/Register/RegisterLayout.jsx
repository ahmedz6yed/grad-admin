import RegisterSidebar from "./RegisterSidebar";
import RegisterContent from "./RegisterContent";
import Logo from "../ui/Logo";

export default function RegisterLayout() {
  return (
    <div className="h-dvh bg-bg w-full overflow-hidden flex flex-col">
      <header className="flex items-center px-6 lg:hidden">
        <Logo className="text-3xl" />
      </header>
      <div className="flex-1 w-full flex bg-surface overflow-hidden">
        <RegisterSidebar />
        <RegisterContent />
      </div>
    </div>
  );
}
