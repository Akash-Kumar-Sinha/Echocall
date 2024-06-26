import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

import Input from "../components/Input";

type loginVariant = "VERIFY" | "VERIFIED" | "USERNAME" | "FINAL";

type idStatus = "LOGIN" | "SIGNUP";

const Auth = () => {
  const [loaded, setLoaded] = useState(false);

  const [variant, setVariant] = useState<loginVariant>("VERIFY");

  const [idstatus, setIdstatus] = useState<idStatus>("SIGNUP");

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const schema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z
      .string()
      .min(6, { message: "Password should be more than 5 digit" }),
    username:
      idstatus === "LOGIN"
        ? z.string().optional()
        : z.string({ message: "UserName shoud to be unique" }),
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setSubmitting(true);

    try {
      if (idstatus === "SIGNUP") {
        await axios
          .post(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, data)
          .then((response) => {
            sessionStorage.setItem(
              `${import.meta.env.VITE_TOKEN_NAME}`,
              response.data.token
            );
            navigate("/search");
          });
      }
      if (idstatus === "LOGIN") {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/auth/login`,
          data
        );

        sessionStorage.setItem(
          `${import.meta.env.VITE_TOKEN_NAME}`,
          response.data.token
        );
        if (response.status === 200) {
          navigate("/search");
        }
      }
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onClickNext = async () => {
    const formData = watch();
    if (variant === "VERIFY") {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/send`,
        formData
      );

      if (response.data.success === "EXIST") {
        setVariant(() => {
          const newVariant = "FINAL";
          return newVariant;
        });
        setIdstatus(() => {
          const newVariant = "LOGIN";
          return newVariant;
        });
      }

      if (response.data.success === "SEND") {
        setVariant(() => {
          const newVariant = "VERIFIED";
          return newVariant;
        });
      }
    }
    if (variant === "VERIFIED") {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/checkverification`,
        formData
      );
      if (response.data.success === "VERIFIED") {
        setVariant(() => {
          const newVariant = "USERNAME";
          return newVariant;
        });
      }
    }
    if (variant === "USERNAME") {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/getname`,
        formData
      );
      if (response.data.success === "ASSIGNED") {
        setVariant(() => {
          const newVariant = "FINAL";
          return newVariant;
        });
      }
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center w-screen">
      <h1 className="text-yellow-600 text-2xl md:text-5xl lg:text-6xl font-extrabold tracking-tight relative">
        <span className="text-4xl md:text-7xl lg:text-8xl">Echo</span>
        <span className="text-yellow-800">Call</span>
        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg z-[-1] opacity-75"></span>
      </h1>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{ duration: 1 }}
        className={`${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"} transition-opacity transform duration-1000 ease-in-out w-full max-w-md md:max-w-lg lg:max-w-2xl mt-8 flex justify-center items-center`}
      >
        {loaded && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ delay: 0.5, duration: 1 }}
            className="bg-gradient-to-br from-yellow-700 to-yellow-800 p-8 rounded-lg shadow-lg flex flex-col items-center w-full md:w-auto"
          >
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full p-3 mb-4 shadow-lg">
              <FaLock className="text-yellow-50 text-5xl" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="w-full flex flex-col space-y-4 md:space-y-6">
                {(variant === "VERIFY" || variant === "VERIFIED") && (
                  <>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      register={register}
                      required={true}
                      errors={errors}
                      disabled={variant === "VERIFIED"}
                    />
                    {variant === "VERIFIED" && (
                      <p className="text-sm text-black">
                        Check your email to verify
                      </p>
                    )}
                  </>
                )}
                {variant === "USERNAME" && (
                  <>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      register={register}
                      required={true}
                      errors={errors}
                    />
                    <p className="text-sm text-black">
                      Username should be unique
                    </p>
                  </>
                )}
                {variant === "FINAL" && (
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    required={true}
                    register={register}
                    title="Password should be more than 5 digits"
                    errors={errors}
                  />
                )}
              </div>
              {variant === "VERIFY" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClickNext}
                  className="bg-yellow-700 hover:bg-yellow-800 text-yellow-50 font-semibold py-3 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out shadow-md border border-yellow-900 text-center w-full mt-4"
                >
                  Verify
                </motion.button>
              )}
  
              {(variant === "VERIFIED" || variant === "USERNAME") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClickNext}
                  className="bg-yellow-700 hover:bg-yellow-800 text-yellow-50 font-semibold py-3 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out shadow-md border border-yellow-900 text-center w-full mt-4"
                >
                  Next
                </motion.button>
              )}
              {variant === "FINAL" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-yellow-700 hover:bg-yellow-800 text-yellow-50 font-semibold py-3 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out shadow-md border border-yellow-900 text-center w-full mt-4"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </motion.button>
              )}
            </form>
            <p className="mt-6 text-sm text-gray-300 text-center">
              Your privacy matters. We protect your data.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
