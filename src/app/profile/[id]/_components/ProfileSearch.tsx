"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { User } from "@/lib/types";
import Link from "next/link";
import { Search } from "lucide-react";

export function ProfileSearch({ users }: { users: User[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);

  const isFocused = useMemo(
    () => () =>
      popoverRef.current?.contains(document.activeElement) ||
      triggerRef.current?.contains(document.activeElement),
    [popoverRef, triggerRef]
  );

  useEffect(() => {
    if (!open && value && isFocused() && isDirty) {
      setOpen(true);
    }
  }, [open, value, isFocused, isDirty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFilteredUsers(
      users.filter((user) =>
        user.runescapeName?.toLocaleLowerCase().includes(newValue.toLowerCase())
      )
    );
    setValue(newValue);
    setIsDirty(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isFocused()) {
        setOpen(false);
        setValue("");
      }
    }, 0);
  };

  return (
    <div className="flex flex-col gap-1 w-fit mx-auto">
      <Popover open={open} modal={false}>
        <PopoverTrigger asChild>
          <div className="relative w-fit">
            <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              onFocus={(event) => {
                event.preventDefault();
              }}
              onBlur={handleBlur}
              ref={triggerRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              placeholder="Search to see other profiles"
              className="w-96 bg-input h-12 placeholder:text-lg px-10 text-lg"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 p-2 overflow-y-auto h-96 overflow-x-hidden"
          forceMount
          ref={popoverRef}
          onBlur={handleBlur}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {filteredUsers.length > 0 ? (
            <ul className="flex flex-col items-start h-fit gap-1">
              {filteredUsers.map((user: User) => (
                <li key={user.id} className="w-full">
                  <Link
                    href={`/profile/${user.runescapeName}`}
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-4 cursor-pointer w-full rounded-lg hover:text-accent-foreground hover:bg-accent hover:border hover:border-foreground hover:px-[7px] hover:py-[15px]"
                  >
                    <div className="w-fit h-fit rounded-full overflow-hidden bg-accent mr-2">
                      <div className="relative size-12">
                        {user.discordImg && (
                          <Image
                            src={user.discordImg}
                            alt={user.runescapeName || ""}
                            sizes="100%"
                            fill
                            className="rounded-sm absolute object-contain"
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-xl">{user.runescapeName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-sm">No results found.</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
