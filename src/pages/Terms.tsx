
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t('termsAndConditions')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('lastUpdated')}: January 1, 2023</p>
      </div>

      <div className="prose prose-indigo prose-lg mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('termsIntro')}</h2>
          <p className="text-gray-600 mb-4">
            {t('termsWelcome')}
          </p>
          <p className="text-gray-600">
            {t('termsAgreement')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('accountTerms')}</h2>
          <p className="text-gray-600 mb-4">
            {t('accountResponsibility')}
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li className="mb-2">{t('accountAccuracy')}</li>
            <li className="mb-2">{t('accountSecurity')}</li>
            <li className="mb-2">{t('accountNotify')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('purchaseTerms')}</h2>
          <p className="text-gray-600 mb-4">
            {t('purchasesPolicy')}
          </p>
          <p className="text-gray-600 mb-4">
            {t('paymentTerms')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('returnsPolicy')}</h2>
          <p className="text-gray-600 mb-4">
            {t('returnsTime')}
          </p>
          <p className="text-gray-600">
            {t('refundMethod')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('intellectualProperty')}</h2>
          <p className="text-gray-600">
            {t('ipRights')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactUs')}</h2>
          <p className="text-gray-600">
            {t('questionsAboutTerms')}
          </p>
        </section>
      </div>
    </div>
  );
}
