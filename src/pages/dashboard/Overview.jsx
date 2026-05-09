import PageHeader from '../../components/ui/PageHeader';

export default function Overview() {
  return (
    <>
      <PageHeader
        title="System Dashboard"
        subtitle="Real-time metrics and system health monitoring."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm transition-shadow duration-[var(--duration-normal)] ease-[var(--ease-default)]">
        <p className="text-sm text-muted">
          Overview content — add widgets and metrics here.
        </p>
      </div>
    </>
  );
}
