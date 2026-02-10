type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
};

type AdminFormFieldsProps = {
  fields: Field[];
  values?: Record<string, any>;
  onChange?: (key: string, value: any) => void;
};

export function AdminFormFields({ fields, values = {}, onChange }: AdminFormFieldsProps) {
  const handleChange = (key: string, value: any) => {
    if (onChange) onChange(key, value);
  };

  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <label className="text-sm font-semibold">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              rows={4}
              name={field.key}
              value={values[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.key}
              value={values[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === 'file' ? (
            <input
              type="file"
              name={field.key}
              multiple
              accept="image/*"
              onChange={(e) => handleChange(field.key, e.target.files)}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          ) : (
            <input
              type={field.type || 'text'}
              name={field.key}
              value={values[field.key] || ''}
              onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
              className="p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
        </div>
      ))}
    </div>
  );
}
