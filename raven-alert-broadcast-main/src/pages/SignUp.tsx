
import { useState } from "react";
import { Link } from "react-router-dom";
import SignUpHeader from "@/components/signup/SignUpHeader";
import SignUpForm from "@/components/signup/SignUpForm";
import SocialSignUpButtons from "@/components/signup/SocialSignUpButtons";
import SignUpFooter from "@/components/signup/SignUpFooter";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <SignUpHeader />
        <SocialSignUpButtons isLoading={isLoading} />
        <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} />
        <SignUpFooter />
      </div>
    </div>
  );
};

export default SignUp;
