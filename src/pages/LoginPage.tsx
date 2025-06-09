import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useRouter } from 'next/router';
import Link from 'next/link';

type RoleType = "teacher" | "student";

export default function LoginPage() {
  const [role, setRole] = useState<RoleType>("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("登入成功", userCredential.user);
      router.push('/QuestionPage');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("登入失敗", error.message);
        alert("登入失敗：" + error.message);
      } else {
        console.error("未知錯誤", error);
        alert("登入失敗：未知錯誤");
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value);
  };

  return (
    <div className="relative min-h-screen bg-mainBg">
      {/* ✅ 語言切換在右上角 */}
      <LanguageSwitcher labelClass="text-gray-700" />

      <div className="grid grid-cols-1 md:grid-cols-3 min-h-screen">
        {/* 左側示意欄 */}
        <div className="p-8 bg-primary flex flex-col justify-center items-center md:col-span-2">
          <div className="space-y-6 max-w-sm">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側登入區 */}
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-mainBg md:col-span-1">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              className="mx-auto h-10 w-auto"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              alt="Your Company"
            />

            <div className="mt-10 flex justify-center">
              <div className="inline-flex border-b">
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`px-4 py-2 text-base font-medium text-text border-b-2 ${
                    role === "teacher"
                      ? "border-primary text-primary"
                      : "border-transparent hover:text-primary hover:border-primary"
                  }`}
                >
                  老師登入
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`px-4 py-2 text-base font-medium text-text border-b-2 ${
                    role === "student"
                      ? "border-primary text-primary"
                      : "border-transparent hover:text-primary hover:border-primary"
                  }`}
                >
                  學生答題
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm min-h-[300px]">
            {role === "teacher" ? (
              <div className="space-y-6">
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="h-[0px] hidden sm:block" />
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => handleInputChange(e, setEmail)}
                        required
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                        Password
                      </label>
                      <div className="text-sm">
                        <Link href="#" className="font-semibold text-primary hover:text-primary/80">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => handleInputChange(e, setPassword)}
                        required
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Sign in
                    </button>
                  </div>
                </form>

                <p className="text-center text-sm text-gray-500">
                  Not a member?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:text-primary/80">
                    Register Now
                  </Link>
                </p>
              </div>
            ) : (
              <form className="space-y-6 mt-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    你的名字
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={studentName}
                      onChange={(e) => handleInputChange(e, setStudentName)}
                      placeholder="請輸入你的名字"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-900">
                    作業代碼
                  </label>
                  <div className="mt-2">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      autoComplete="off"
                      placeholder="請輸入老師提供的作業代碼"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  開始
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
