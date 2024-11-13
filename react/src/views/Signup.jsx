import { Link } from "react-router-dom";
import { createRef, useState } from "react";
import axiosClient from "../lib/axios-client.js";
import { useStateContext } from "../context/ContextProvider.jsx";
import React from "react";
// import "./../assets/signup.css";

const Signup = () => {
  const nameRef = createRef();
  const emailRef = createRef();
  const passwordRef = createRef();
  const passwordConfirmationRef = createRef();
  const { setUser, setToken } = useStateContext();
  const [setErrors] = useState(null);

  const onSubmit = (ev) => {
    ev.preventDefault();

    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
    };
    axiosClient
      .post("/signup", payload)
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  return (
    <div
      className="bg-no-repeat bg-cover bg-center relative"
      style={{
        backgroundImage: `url(https://www.ismartrecruit.com/upload/blog/main_image/boost-employee-productivity.webp)`,
      }}
    >
      <div className="absolute bg-gradient-to-b from-blue-500 to-blue-400 opacity-75 inset-0 z-0"></div>
      <div className="min-h-screen sm:flex sm:flex-row mx-0 justify-center">
        {/* <div className="flex-col flex  self-center p-10 sm:max-w-5xl xl:max-w-2xl  z-10">
          <div className="self-start hidden lg:flex flex-col  text-white">
            <img src="" className="mb-3" />
            <h1 className="mb-3 font-bold text-5xl">Welcome to Admin Page</h1>
            <p className="pr-3">
              A strong team can take any crazy vision and turn it into reality.
            </p>
          </div>
        </div> */}
        <div className="flex justify-center self-center z-10">
          <div className="p-12 bg-white mx-auto rounded-2xl w-100 ">
            <div className="mb-4">
              <h3 className="font-semibold text-2xl text-gray-800">Sign Up </h3>
              <p className="text-gray-500">Administrator Registration Form.</p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 tracking-wide">
                    Email
                  </label>
                  <input
                    className=" w-full text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    type="email"
                    ref={emailRef}
                    placeholder="admin@novatechset.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 tracking-wide">
                    Password
                  </label>
                  <input
                    className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    type="password"
                    ref={passwordRef}
                    placeholder="Enter your password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    type="password"
                    ref={passwordRef}
                    placeholder="Enter your password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 tracking-wide">
                    Department
                  </label>
                  <select className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-blue-400">
                    <option>Technology</option>
                    <option>Copy Editor</option>
                    <option>HR</option>
                    <option>Quality Assurance</option>
                  </select>
                  {/* <input
                    className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    type="password"
                    ref={passwordRef}
                    placeholder="Enter your password"
                  /> */}
                </div>

                <div className="flex justify-end">
                  {/* <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 bg-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember_me"
                      className="ml-2 text-sm text-gray-400"
                    >
                      Remember me
                    </label>
                  </div> */}
                  <div className="text-sm">
                    <span className="text-blue-400 hover:text-blue-500">
                      <Link to={"/login"}>Already have an account?</Link>
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center bg-blue-400  hover:bg-blue-500 text-gray-100 p-3  rounded-full tracking-wide font-semibold  shadow-lg cursor-pointer transition ease-in duration-500"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
            <div className="pt-5 text-center text-gray-400 text-xs">
              <span>Copyright © 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
