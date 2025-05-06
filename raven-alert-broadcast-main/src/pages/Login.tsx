
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import LoginHeader from "@/components/login/LoginHeader";
import SocialLoginButtons from "@/components/login/SocialLoginButtons";
import LoginForm from "@/components/login/LoginForm";
import LoginFooter from "@/components/login/LoginFooter";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <LoginHeader />
        <SocialLoginButtons isLoading={isLoading} />
        <LoginForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
