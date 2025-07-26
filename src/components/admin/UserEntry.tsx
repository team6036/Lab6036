import { selectDataFetching } from "../../store/slice.loading";
import { useAppSelector } from "../../store/store";
import type { User } from "../../types";
import { IoAddSharp, IoCloseSharp, IoPencilSharp } from "react-icons/io5";

export interface UserEntryProps {
  user: User;
  onChange?: (newUser: User) => void;
  onRemove?: () => void;
}

export default function UserEntry({
  user,
  onChange,
  onRemove,
}: UserEntryProps) {
  const fetching = useAppSelector(selectDataFetching);

  return (
    <>
      <button
        disabled={fetching}
        className="col-span-1 flex flex-row items-center justify-start hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
        onClick={onRemove}
      >
        <IoCloseSharp />
      </button>
      <div className="col-span-1 flex flex-row items-center justify-start pr-4">
        <div className="flex-1">{user.name}</div>
        <button
          disabled={fetching}
          className="hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
          onClick={() => {
            const newUserName = prompt(
              `What do you want to rename ${user.name} to?`,
            );
            if (!newUserName) return;
            onChange?.({ ...user, name: newUserName });
          }}
        >
          <IoPencilSharp />
        </button>
      </div>
      {Array.from(new Array(2).keys()).map((i) => (
        <div
          key={i}
          className="col-span-1 flex flex-row items-center justify-start pr-4"
        >
          {user.nicknames[i] ?? ""}
          {i < user.nicknames.length && (
            <>
              <button
                disabled={fetching}
                className="ml-2 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                onClick={() => {
                  onChange?.({
                    ...user,
                    nicknames: user.nicknames.filter(
                      (nickname) => nickname !== user.nicknames[i],
                    ),
                  });
                }}
              >
                <IoCloseSharp />
              </button>
            </>
          )}
          {i === user.nicknames.length && (
            <>
              <button
                disabled={fetching}
                className="hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                onClick={() => {
                  const newUserNickname = prompt(
                    `What is another nickname for ${user.name}?`,
                  );
                  if (!newUserNickname) return;
                  onChange?.({
                    ...user,
                    nicknames: [...user.nicknames, newUserNickname],
                  });
                }}
              >
                <IoAddSharp />
              </button>
            </>
          )}
        </div>
      ))}
    </>
  );
}
