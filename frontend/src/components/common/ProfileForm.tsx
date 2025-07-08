import React from "react";

interface ProfileFormProps<T> {
  profile: T;
  isEditing: boolean;
  error?: string | null;
  success?: string | null;
  fieldLabels: Record<keyof T, string>;
  onChange: (key: keyof T, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
  onCancel: () => void;
}

function ProfileForm<T extends Record<string, any>>({
  profile,
  isEditing,
  error,
  success,
  fieldLabels,
  onChange,
  onSubmit,
  onEdit,
  onCancel,
}: ProfileFormProps<T>) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      {(Object.entries(profile) as [keyof T, string][]).map(([key, value]) => (
        <div key={String(key)}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldLabels[key] || key}
          </label>
          <input
            type={key.toString().toLowerCase().includes("date") ? "date" : "text"}
            value={value}
            onChange={e => onChange(key, e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      ))}
      <div className="flex space-x-4 pt-2">
        {isEditing ? (
          <>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>
    </form>
  );
}

export default ProfileForm; 