import { LogOut } from "lucide-react";
// import Logo from "../assets/agribank.png";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();
  const { token } = useAuth();

  return (
    <header className="bg-gray-100 shadow p-4 flex sticky top-0 z-50 w-full">
      <div className="flex items-center max-w-7xl w-full mx-auto justify-between">
        {/* <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Agribank Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div className="text-xl font-semibold text-gray-800 flex items-center">
            Agribank
          </div>
        </div> */}
        {token && (
          <Popover>
            <PopoverTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div
                className="cursor-pointer flex items-center gap-4"
                onClick={logout}
              >
                <span className="font-semibold">Đăng xuất</span>
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
