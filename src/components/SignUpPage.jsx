import { SignUp } from "@clerk/clerk-react";

// eslint-disable-next-line react/prop-types
export default function SignUpPage() {
  const userType = "admin";
  const redirectUrl =
    userType === "admin" ? "/admin-dashboard" : "/user-dashboard";

  return (
    <div className="flex justify-center my-4">
      <SignUp redirectUrl={redirectUrl} />
    </div>
  );
}
