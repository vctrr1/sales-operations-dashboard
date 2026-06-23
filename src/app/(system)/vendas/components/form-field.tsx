import { Field, FieldLabel } from "@/components/ui/field";

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </Field>
  );
}
export default FormField;
