import { cn } from "@/lib/utils";

type Avatar = {
  name: string;
  avatarUrl?: string | null;
};

type AvatarStackProps = {
  users: Avatar[];
  className?: string;
};

const colors = ["bg-blue-200", "bg-cyan-200", "bg-sky-200", "bg-indigo-200", "bg-teal-200"];

export const AvatarStack = ({ users, className }: AvatarStackProps): React.JSX.Element => {
  const visible = users.slice(0, 3);
  const extra = users.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((user, index) => (
        <div
          key={`${user.name}-${index}`}
          className={cn(
            "-ml-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white text-xs font-semibold text-slate-700 first:ml-0",
            colors[index % colors.length]
          )}
          title={user.name}
        >
          {user.name[0]}
        </div>
      ))}
      {extra > 0 && (
        <div className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 px-1 text-xs font-semibold text-slate-600">
          +{extra}
        </div>
      )}
    </div>
  );
};
