"use client";

import { useState } from "react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Field, FieldLabel } from "@/components/ui/field";

export function ProductCategoryMultiSelect<T extends string>({
  name,
  label,
  options,
  labels,
  defaultValues = [],
}: {
  name: string;
  label: string;
  options: T[];
  labels: Record<T, string>;
  defaultValues?: T[];
}) {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues);

  return (
    <Field className="min-w-0 overflow-hidden">
      <FieldLabel className="text-base text-muted-foreground">
        {label}
      </FieldLabel>
      {selectedValues.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <MultiSelect values={selectedValues} onValuesChange={setSelectedValues}>
        <MultiSelectTrigger className="h-10 max-h-10 min-h-10 w-full min-w-0 max-w-full overflow-hidden rounded-lg text-base **:data-[slot=badge]:h-6 **:data-[slot=badge]:max-w-28 **:data-[slot=badge]:min-w-0 **:data-[slot=badge]:rounded-md **:data-[slot=badge]:text-base [&_[data-slot=badge]_svg]:size-3.5!">
          <MultiSelectValue
            placeholder="Selecione uma ou mais categorias"
            className="h-full min-w-0 flex-1 items-center text-base **:data-[slot=badge]:truncate"
            overflowBehavior="cutoff"
          />
        </MultiSelectTrigger>
        <MultiSelectContent
          className="**:data-[slot=command-empty]:text-base"
          search={false}
        >
          <MultiSelectGroup>
            {options.map((option) => (
              <MultiSelectItem
                key={option}
                value={option}
                badgeLabel={
                  <span className="min-w-0 max-w-24 truncate">
                    {labels[option]}
                  </span>
                }
                className="min-w-0 text-base"
              >
                <span className="min-w-0 truncate">{labels[option]}</span>
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </Field>
  );
}
