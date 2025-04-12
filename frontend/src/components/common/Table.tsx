import React from "react";

// Define the interface for table headers
interface TableHeader {
  key: string;
  label: string;
}

// Define the props for the Table component
interface TableProps<T> {
  headers: TableHeader[];
  data: T[];
  onRowClick: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

const Table = <T extends { id: string }>({ headers, data, onRowClick, actions }: TableProps<T>) => {
  const getCellValue = (row: T, key: string): string => {
    return key.split(".").reduce((obj, keyPart) => obj?.[keyPart as keyof T], row) as string || "";
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking action buttons
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border px-4 py-2 text-left">
                {header.label}
              </th>
            ))}
            {actions && <th className="border px-4 py-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(row)}
            >
              {headers.map((header, index) => (
                <td key={index} className="border px-4 py-2">
                  {getCellValue(row, header.key)}
                </td>
              ))}
              {actions && (
                <td className="border px-4 py-2" onClick={handleActionClick}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
