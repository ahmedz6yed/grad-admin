import PageHeader from '../../components/ui/PageHeader';

export default function SystemLogs() {
  return (
    <>
      <PageHeader
        title="System Logs"
        subtitle="Monitor backend events and security logs."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm">
        <p className="text-sm text-muted">Log stream and filters go here.</p>
      </div>
    </>
  );
}
