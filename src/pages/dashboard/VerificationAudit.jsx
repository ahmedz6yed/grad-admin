import PageHeader from '../../components/ui/PageHeader';

export default function VerificationAudit() {
  return (
    <>
      <PageHeader
        title="Verification Audit"
        subtitle="Review verification requests and audit logs."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm">
        <p className="text-sm text-muted">Audit queue and history go here.</p>
      </div>
    </>
  );
}
