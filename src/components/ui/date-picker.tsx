"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return new Date();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = ymd
    ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePicker({
  id,
  name,
  defaultValue,
  disabled = false,
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(() =>
    parseDate(defaultValue),
  );

  React.useEffect(() => {
    const next = parseDate(defaultValue);
    if (next) setDate(next);
  }, [defaultValue]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className="w-32 justify-between font-normal"
            disabled={disabled}
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <IconChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>

      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? toDateInputValue(date) : ""}
          disabled={disabled}
        />
      )}
    </>
  );
}

export { DatePicker };
