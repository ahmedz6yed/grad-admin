export default function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-8  pb-8 transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-default)]">
      <h1 className="font-serif text-3xl font-normal tracking-tight text-[var(--color-text)] sm:text-4xl">
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
