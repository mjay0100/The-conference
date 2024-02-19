import { SignIn } from "@clerk/clerk-react";

// eslint-disable-next-line react/prop-types
export default function SignInPage() {
  const userType = "admin";
  const redirectUrl =
    userType === "admin" ? "/admin-dashboard" : "/user-dashboard";

  return (
    <div className="flex justify-center my-4">
      <SignIn redirectUrl={redirectUrl} />
    </div>
  );
}
