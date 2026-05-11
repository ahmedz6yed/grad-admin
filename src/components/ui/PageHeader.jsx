export default function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-8 pb-8 transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-default)] border-b border-white/40">
      <h1 className="font-josefin text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-base text-[var(--color-text-subtle)] sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
