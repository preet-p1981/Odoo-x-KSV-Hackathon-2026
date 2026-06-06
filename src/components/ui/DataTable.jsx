import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({ columns, rows, loading, emptyTitle, emptyMessage }) {
  if (loading) return <LoadingSpinner label="Loading table..." />;
  if (!rows?.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;

  return (
    <div className="panel">
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
