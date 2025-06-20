'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const features = [
    {
      name: 'AI 轉換次數',
      free: '每日 3 次',
      pro: '每日 10 次'
    },
    {
      name: '題目數量',
      free: '最多 100 題',
      pro: '最多 1000 題'
    },
    {
      name: '標籤資料夾',
      free: false,
      pro: true
    },
    {
      name: '派送作業功能',
      free: '支援不指定對象每份10人',
      pro: '支援不指定對象每份100人 + 建立名單'
    },
    {
      name: '作答結果畫面',
      free: '可檢視近5筆紀錄',
      pro: '不限'
    }
  ];

  return (
    <div className="min-h-screen bg-mainBg dark:bg-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* 標題區塊 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            選擇適合您的方案
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            無論您是個人教師還是教育機構，我們都有適合您的方案
          </p>
        </div>

        {/* 切換按鈕 */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <Button
              variant={isAnnual ? "default" : "ghost"}
              className="rounded-full px-6"
              onClick={() => setIsAnnual(true)}
            >
              年付方案
            </Button>
            <Button
              variant={!isAnnual ? "default" : "ghost"}
              className="rounded-full px-6"
              onClick={() => setIsAnnual(false)}
            >
              月付方案
            </Button>
          </div>
        </div>

        {/* 方案卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 免費版 */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">免費版</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">體驗題庫建立與基本派發功能</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">NT$ 0</span>
                <span className="text-gray-500 dark:text-gray-400">/永久</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <Cross2Icon className="h-5 w-5 text-red-500" />
                    )
                  ) : (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-auto">
                    {typeof feature.free === 'boolean' ? '' : feature.free}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                開始使用
              </Button>
            </CardFooter>
          </Card>

          {/* 付費版 */}
          <Card className="relative border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg text-sm">
              推薦方案
            </div>
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">專業版</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">滿足日常練習與教學管理需求</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">
                  US$ {isAnnual ? '79.99' : '6.99'}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/{isAnnual ? '年' : '月'}</span>
                
                {isAnnual && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                    省下 US$ {(6.99 * 12 - 79.99).toFixed(2)}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <Cross2Icon className="h-5 w-5 text-red-500" />
                    )
                  ) : (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-auto">
                    {typeof feature.pro === 'boolean' ? '' : feature.pro}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                升級方案
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ 區塊 */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            常見問題
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                如何升級到專業版？
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                您可以點擊「升級方案」按鈕，選擇您想要的付費方案（月付或年付），
                填寫付款資訊後即可立即升級。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                付費版有試用期嗎？
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                目前我們提供 14 天的免費試用期，您可以在這期間內體驗所有專業版功能。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                可以隨時取消訂閱嗎？
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                是的，您可以隨時取消訂閱。取消後，您仍可以使用付費功能直到當期結束。
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                取消專業版訂閱之後資料會被清除嗎？
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                不會，您的資料與題庫都會完整保留，不會被刪除。
              </p>
            </div>
                       
            
          </div>
        </div>
      </main>
    </div>
  );
} 