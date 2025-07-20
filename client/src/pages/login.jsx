import { useState, useEffect } from "react";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LoginGif from "../assets/study.gif";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(false);

  const [registerUser, { data: registerData, error: registerError, isLoading: registerIsLoading, isSuccess: registerIsSuccess }] = useRegisterUserMutation();
  const [loginUser, { data: loginData, error: loginError, isLoading: loginIsLoading, isSuccess: loginIsSuccess }] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    try {
      const inputData = type === "signup" ? signupInput : loginInput;
      await (type === "signup" ? registerUser(inputData) : loginUser(inputData));
    } catch (error) {
      console.error('Error during registration/login:', error);
      toast.error('An unexpected error occurred');
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
    }
    if (registerError) {
      const errorMessage = registerError?.data?.message || registerError?.error || "Signup Failed";
      toast.error(errorMessage);
    }
    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/");
    }
    if (loginError) {
      const errorMessage = loginError?.data?.message || loginError?.error || "Login Failed";
      toast.error(errorMessage);
    }
  }, [registerIsSuccess, registerData, registerError, loginIsSuccess, loginData, loginError, navigate]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-4 bg-background">
      <div className="flex flex-col md:flex-row bg-card rounded-lg shadow-lg w-full max-w-[1200px] md:h-[500px] lg:h-[600px] md:w-[90%] lg:w-[80%]">
        {/* GIF Section */}
        <div className="items-center justify-center hidden w-1/2 p-6 md:flex">
          <img src={LoginGif} alt="Login Illustration" className="w-full max-w-[700px] h-auto rounded-lg" />
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center w-full p-6 md:w-1/2">
          <Tabs defaultValue="login" className="w-full max-w-[350px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Signup</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            {/* Signup Form */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Signup</CardTitle>
                  <CardDescription>Create a new account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" name="name" value={signupInput.name} onChange={(e) => changeInputHandler(e, "signup")} placeholder="Eg. XYZ" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" name="email" value={signupInput.email} onChange={(e) => changeInputHandler(e, "signup")} placeholder="Eg. xyz@gmail.com" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" name="password" value={signupInput.password} onChange={(e) => changeInputHandler(e, "signup")} placeholder="Eg. xyz@123" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled={registerIsLoading} onClick={() => handleRegistration("signup")}>
                    {registerIsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Signup"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your details to log in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" name="email" value={loginInput.email} onChange={(e) => changeInputHandler(e, "login")} placeholder="Eg. xyz@gmail.com" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" name="password" value={loginInput.password} onChange={(e) => changeInputHandler(e, "login")} placeholder="Eg. xyz@123" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled={loginIsLoading} onClick={() => handleRegistration("login")}>
                    {loginIsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Login"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
