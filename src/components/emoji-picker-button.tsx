"use client";

import { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function EmojiPickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" type="button" className="text-lg">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-none shadow-none">
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            onChange(emojiData.emoji);
            setOpen(false);
          }}
          theme={Theme.AUTO}
          width={300}
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}
