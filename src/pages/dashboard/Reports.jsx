import PageHeader from '../../components/ui/PageHeader';

export default function Reports() {
  return (
    <>
      <PageHeader
        title="Reports Center"
        subtitle="Track analytics and operational reports."
      />
      <div className="rounded-xl border border-default bg-[var(--color-card)] p-6 shadow-sm">
        <p className="text-sm text-muted">Reports and exports go here.</p>
      </div>
    </>
  );
}
