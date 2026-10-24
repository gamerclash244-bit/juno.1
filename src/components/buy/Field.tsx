interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (p: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => React.ReactNode;
}

/** Label + control + inline error, wired together for screen readers. */
function Field({ id, label, error, hint, children }: FieldProps): React.ReactElement {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy, className: "field-input" })}
      {error ? (
        <p id={`${id}-err`} className="field-error">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-gray">{hint}</p>
      )}
    </div>
  );
}

export default Field;
