import { useStore } from "@/store/useStore";
import { deleteCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";

const handleLogout = () => {
  const { reset } = useStore();
  const router = useRouter();

  // Clear store
  reset();

  // Clear cookies
  deleteCookie("shodh-user");
  deleteCookie("shodh-contest-id");

  // Redirect to home
  router.push("/");
};
