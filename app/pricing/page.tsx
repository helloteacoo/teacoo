'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { t } = useTranslation();

  const features = [
    {
      name: t('pricing.features.aiConversion.name'),
      free: t('pricing.features.aiConversion.free'),
      pro: t('pricing.features.aiConversion.pro')
    },
    {
      name: t('pricing.features.questionLimit.name'),
      free: t('pricing.features.questionLimit.free'),
      pro: t('pricing.features.questionLimit.pro')
    },
    {
      name: t('pricing.features.tagFolders.name'),
      free: false,
      pro: true
    },
    {
      name: t('pricing.features.assignment.name'),
      free: t('pricing.features.assignment.free'),
      pro: t('pricing.features.assignment.pro')
    },
    {
      name: t('pricing.features.results.name'),
      free: t('pricing.features.results.free'),
      pro: t('pricing.features.results.pro')
    }
  ];

  return (
    <div className="min-h-screen bg-mainBg dark:bg-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* 標題區塊 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* 切換按鈕 */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-full p-1">
            <Button
              variant={isAnnual ? "default" : "ghost"}
              className="rounded-full px-6"
              onClick={() => setIsAnnual(true)}
            >
              {t('pricing.annual')}
            </Button>
            <Button
              variant={!isAnnual ? "default" : "ghost"}
              className="rounded-full px-6"
              onClick={() => setIsAnnual(false)}
            >
              {t('pricing.monthly')}
            </Button>
          </div>
        </div>

        {/* 方案卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 免費版 */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('pricing.plans.free.name')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {t('pricing.plans.free.description')}
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t('pricing.plans.free.price')}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/{t('pricing.plans.free.period')}</span>
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
                {t('pricing.buttons.startNow')}
              </Button>
            </CardFooter>
          </Card>

          {/* 付費版 */}
          <Card className="relative border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg text-sm">
              {t('pricing.plans.pro.recommended')}
            </div>
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('pricing.plans.pro.name')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {t('pricing.plans.pro.description')}
              </p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">
                  US$ {isAnnual ? '79.99' : '6.99'}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  /{isAnnual ? t('pricing.plans.pro.period.year') : t('pricing.plans.pro.period.month')}
                </span>
                
                {isAnnual && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                    {t('pricing.plans.pro.save', { amount: (6.99 * 12 - 79.99).toFixed(2) })}
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
                {t('pricing.buttons.upgrade')}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ 區塊 */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {t('pricing.faq.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.faq.questions.howToUpgrade.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq.questions.howToUpgrade.answer')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.faq.questions.trialPeriod.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq.questions.trialPeriod.answer')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.faq.questions.cancellation.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq.questions.cancellation.answer')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.faq.questions.dataRetention.question')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pricing.faq.questions.dataRetention.answer')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 