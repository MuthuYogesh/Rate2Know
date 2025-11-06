export default function Table({ columns, data }) {
    return (
        <table className="min-w-full table-auto">
            <thead>
                <tr>
                    {columns.map(c => <th key={c.key} className="px-4 py-2 text-left text-sm font-medium text-gray-600">{c.title}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i} className="border-t">
                        {columns.map(c => <td key={c.key} className="px-4 py-2 text-sm">{c.render ? c.render(row) : row[c.key]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}