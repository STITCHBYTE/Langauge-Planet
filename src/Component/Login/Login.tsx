"use client";
import React, { useState } from "react";

// InputField Component
const InputField: React.FC<{
  label: string;
  type: string;
  placeholder?: string;
  showPasswordToggle?: boolean;
}> = ({ label, type, placeholder, showPasswordToggle = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label className="text-sm font-medium leading-none text-zinc-800">{label}</label>
      <div className="flex overflow-hidden gap-3 items-center px-4 py-3 mt-1 w-full bg-white rounded-md border border-solid border-gray-300 min-h-[44px]">
        <div className="flex flex-1 gap-2 items-center">
          <input
            type={showPassword ? "text" : type}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none"
          />
        </div>
        {showPasswordToggle && (
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="w-5"
            type="button"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/d880cb51f6550ddc260e9c622044ee45e8bd44bd"
              className="object-contain w-5 aspect-square"
              alt="Toggle password visibility"
            />
          </button>
        )}
      </div>
    </div>
  );
};

// Logo Component
const Logo: React.FC = () => (
  <div className="flex gap-2 items-center text-2xl font-semibold text-white">
    <img
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/965f0832686729583ec5deb11f973b067f67c091"
      alt="Language Planet Logo"
      className="w-9 aspect-square"
    />
    <span>Language Planet</span>
  </div>
);

// TestimonialCard Component
const TestimonialCard: React.FC = () => (
  <div className="flex flex-col p-4 w-full rounded-xl bg-zinc-700 text-sm">
    <p className="text-zinc-100">
      Lorem ipsum dolor sit amet consectetur. Auctor lacus sodales nunc scelerisque consectetur.
    </p>
    <div className="flex gap-3 items-center mt-3">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/e94ccfdb408c92d36b5a48d4a838e2b3ebd0001c?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
        alt="Ariana Grande"
        className="w-8 aspect-square rounded-full"
      />
      <div>
        <h3 className="text-white text-xs">Ariana Grande</h3>
        <p className="text-neutral-400 text-xs">Teacher</p>
      </div>
    </div>
  </div>
);


// SocialLoginButtons Component
const SocialLoginButtons: React.FC = () => (
  <div className="flex gap-3 w-full text-base font-semibold text-gray-600">
    <button className="flex-1 flex justify-center items-center gap-3 p-3 bg-white rounded-md border border-gray-300">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8de59990e7a1ed9f323c822bd42bfcdafbf13d3"
        alt="Google logo"
        className="w-5"
      />
      Google
    </button>
    <button className="flex-1 flex justify-center items-center gap-3 p-3 bg-white rounded-md border border-gray-300">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/90cc5286de4dac2099e6fd8a5880304c49ff3443"
        alt="Twitter logo"
        className="w-5"
      />
      Twitter
    </button>
  </div>
);

// DividerWithText Component
const DividerWithText: React.FC = () => (
  <div className="flex items-center my-4 text-sm text-slate-500">
    <div className="flex-grow border-t border-gray-200" />
    <span className="mx-4">Or</span>
    <div className="flex-grow border-t border-gray-200" />
  </div>
);

// LoginForm Component
const LoginForm: React.FC = () => (
  <div className="w-full max-md:mt-6">
    <h1 className="text-3xl font-semibold leading-tight text-black">Welcome back!</h1>
    <div className="flex gap-1 mt-1 text-sm text-stone-500">
      <p>Don't have an account?</p>
      <button className="text-blue-600 font-semibold">Sign Up</button>
    </div>

    <form className="mt-6 space-y-4">
      <InputField label="Email Address" type="email" placeholder="Enter your email" />
      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        showPasswordToggle
      />
      <button className="w-full px-6 py-3 text-white text-base font-semibold bg-blue-600 rounded-lg mt-2">
        Login
      </button>

      <div className="flex justify-center mt-4 text-sm gap-1">
        <span className="text-stone-500">Forgot Password?</span>
        <button className="text-blue-500 font-semibold">Recover</button>
      </div>

      <DividerWithText />
      <SocialLoginButtons />
    </form>
  </div>
);

// LeftPanel Component
const LeftPanel: React.FC = () => (
  <div className="relative flex flex-col justify-between px-6 py-8 bg-[#122B59] bg-blend-overlay h-full rounded-l-lg overflow-hidden">
       <img
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/37c12f6b1dffb54662660668d8b082c50fd1e467"
      alt="Background"
      className="object-cover absolute inset-0 w-full h-full rounded-l-lg"
    />
    <div className="relative z-10">
      <Logo />
      <div className="mt-10 text-white">
        <h1 className="text-4xl font-bold leading-tight">
          The Enjoyable Way To Learn New Languages.
        </h1>
        <p className="mt-4 text-base">
          Lorem ipsum dolor sit amet consectetur. Auctor lacus sodales nunc scelerisque consectetur.
        </p>
      </div>
    </div>

    {/* Testimonial card pinned to bottom */}
    <div className="absolute bottom-6 left-6 right-6 z-10">
      <TestimonialCard />
    </div>
  </div>
);

// AuthenticationScreen (main component)
const AuthenticationScreen: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-4xl h-[720px] rounded-lg shadow-lg overflow-hidden bg-white">
        <section className="w-[55%] hidden md:block">
          <LeftPanel />
        </section>
        <section className="w-full md:w-[45%] p-8 flex items-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
};

export default AuthenticationScreen;
