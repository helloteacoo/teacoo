"use client";
import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { useTranslation } from 'react-i18next';

// Icons import
import {
  BoltIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: BoltIcon,
    titleKey: 'features.aiImport.title',
    descriptionKey: 'features.aiImport.description',
  },
  {
    icon: DocumentTextIcon,
    titleKey: 'features.easyCreate.title',
    descriptionKey: 'features.easyCreate.description',
  },
  {
    icon: ShareIcon,
    titleKey: 'features.simpleAssign.title',
    descriptionKey: 'features.simpleAssign.description',
  },
  {
    icon: CloudArrowUpIcon,
    titleKey: 'features.selfPractice.title',
    descriptionKey: 'features.selfPractice.description',
  },
  {
    icon: ChartBarIcon,
    titleKey: 'features.autoStats.title',
    descriptionKey: 'features.autoStats.description',
  },
  {
    icon: ShieldCheckIcon,
    titleKey: 'features.secureStorage.title',
    descriptionKey: 'features.secureStorage.description',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("登入成功", userCredential.user);
      router.push('/question');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative overflow-hidden">
      {/* 背景圖案 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern-grid.svg')] opacity-5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#215F97] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#215F97] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#215F97] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* 左側介紹區 */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="hidden lg:flex lg:w-2/3 bg-primary p-12 flex-col justify-between relative z-10"
      >
        <div className="max-w-2xl mx-auto w-full">
          {/* Logo 區域 */}
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-3xl font-bold text-mainBg">Teacoo</h1>
            <p className="mt-2 text-lg text-mainBg/80">
              Build your own question bank with ease 
            </p>
          </motion.div>

          {/* 特色功能區 */}
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.titleKey}
                variants={itemVariants}
                className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-mainBg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-mainBg mb-1">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-mainBg/80 text-sm leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 右側登入區 */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 bg-white backdrop-blur-sm p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">歡迎回來</h2>
            <p className="mt-2 text-gray-600">請登入您的帳號以繼續使用</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3"
              >
                <Image
                  src="/google.svg"
                  alt="Google logo"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                使用 Google 帳號登入
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    或使用 Email 登入
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  placeholder="請輸入您的電子郵件"
                  className="placeholder:text-gray-400 text-gray-900 bg-white dark:bg-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密碼
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  placeholder="請輸入您的密碼"
                  className="placeholder:text-gray-400 text-gray-900 bg-white dark:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  記住我
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                忘記密碼？
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              登入
            </Button>

            <p className="text-center text-sm text-gray-600">
              還沒有帳號？{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                立即註冊
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}