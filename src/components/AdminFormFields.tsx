type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
};

type AdminFormFieldsProps = {
  fields: Field[];
};

export function AdminFormFields({ fields }: AdminFormFieldsProps) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <label className="text-sm font-semibold">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              rows={4}
              name={field.key}
              placeholder={field.placeholder}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.key}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.key}
              placeholder={field.placeholder}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
        </div>
      ))}
    </div>
  );
}
