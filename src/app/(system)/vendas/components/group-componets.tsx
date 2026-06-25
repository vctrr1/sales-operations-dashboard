import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RadioGroup<T extends string>({
  name,
  label,
  options,
  labels,
  defaultValue,
  columns = "sm:grid-cols-2",
}: {
  name: string;
  label: string;
  options: T[];
  labels: Record<T, string>;
  defaultValue?: T;
  columns?: string;
}) {
  const checkedValue = defaultValue ?? options[0];

  return (
    <fieldset className="grid gap-2">
      <legend className="text-base leading-snug text-muted-foreground">
        {label}
      </legend>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-input px-2 py-1 text-base transition-colors has-checked:border-primary/50 has-checked:bg-primary/5 hover:bg-muted/50 dark:has-checked:bg-primary/10"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={option === checkedValue}
              className="size-4 accent-primary"
            />
            <span className="leading-snug">{labels[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Field className={className}>
      <FieldLabel className="text-base text-muted-foreground">
        {label}
      </FieldLabel>
      {children}
    </Field>
  );
}

export function SelectField<T extends string>({
  name,
  label,
  options,
  labels,
  defaultValue,
}: {
  name: string;
  label: string;
  options: T[];
  labels: Record<T, string>;
  defaultValue?: T;
}) {
  return (
    <FormField label={label}>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
