import PageHeader from '../../components/ui/PageHeader';

export default function Users() {
  return (
    <>
      <PageHeader
        title="Users Management"
        subtitle="Manage platform users and permissions."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm">
        <p className="text-sm text-muted">Users table and actions go here.</p>
      </div>
    </>
  );
}
