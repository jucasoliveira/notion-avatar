import type { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import LoadingState from '@/components/LoadingState';
import { AvatarConfig } from '@/types';
import Header from './components/Header';
import Footer from './components/Footer';
import AvatarEditor from './components/AvatarEditor';

const URL = `https://slop-ai-avatar.vercel.app/`;

const Home: NextPage = () => {
  const { t } = useTranslation(`common`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [avatarConfig, setAvatarConfig] =
    useState<Partial<AvatarConfig> | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lowConfidenceParts, setLowConfidenceParts] = useState<string[]>([]);
  const [showManualControls, setShowManualControls] = useState(false);
  const [customAssets, setCustomAssets] = useState<{ [key: string]: string }>(
    {},
  );

  const handleImageSelect = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadedImage(imageData);

    try {
      const response = await fetch('/api/analyze-selfie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setAvatarConfig(data.config);
      setLowConfidenceParts(data.lowConfidenceParts || []);
      setCustomAssets(data.customAssets || {});
    } catch (err: any) {
      console.error('Error analyzing selfie:', err);
      setError(err.message || t('error.analysisFailed'));
      setUploadedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAvatarConfig(null);
    setUploadedImage(null);
    setError(null);
    setLowConfidenceParts([]);
    setShowManualControls(false);
    setCustomAssets({});
  };

  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <title>{t(`siteTitle`)}</title>
        <meta name="description" content={t(`siteDescription`)} />
        <meta name="msapplication-TileColor" content="#fffefc" />
        <meta
          name="msapplication-TileImage"
          content="/favicon/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#fffefc" />
        <meta content={t(`siteDescription`)} name="description" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={t(`siteTitle`)} />
        <meta property="og:title" content={t(`siteTitle`)} />
        <meta property="og:description" content={t(`siteDescription`)} />
        <meta property="og:url" content={URL} />
        <meta property="og:image" content="https://i.imgur.com/F5R0K03.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://i.imgur.com/F5R0K03.png" />
        <meta name="twitter:site" content="@phillzou" />
        <meta name="twitter:title" content={t(`siteTitle`)} />
        <meta name="twitter:description" content={t(`siteDescription`)} />
      </Head>

      <Header />
      <main className="my-5">
        {!avatarConfig ? (
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-gray-600 text-lg mb-2">{t('hero.subtitle')}</p>
              <p className="text-sm text-gray-500">{t('hero.privacy')}</p>
            </div>
            {!isAnalyzing ? (
              <ImageUpload
                onImageSelect={handleImageSelect}
                isLoading={false}
              />
            ) : (
              <LoadingState message={t('loading.analyzing')} />
            )}
            {error && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        {t('error.title')}
                      </h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="container mx-auto px-4">
            {/* Before/After Comparison */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                {t('results.title')}
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-4xl mx-auto">
                {/* Original Photo */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/img-redundant-alt */}
                    <img
                      src={uploadedImage || ''}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    {t('results.yourPhoto')}
                  </p>
                </div>

                {/* Arrow */}
                <div className="transform rotate-90 md:rotate-0">
                  <svg
                    className="w-8 h-8 md:w-12 md:h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>

                {/* Generated Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 md:w-64 md:h-64">
                    <AvatarEditor
                      initialConfig={avatarConfig}
                      showControls={showManualControls}
                      customAssets={customAssets}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    {t('results.generatedAvatar')}
                  </p>
                </div>
              </div>
            </div>

            {/* Low Confidence Warning */}
            {lowConfidenceParts.length > 0 && !showManualControls && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-casino-light-gold border-2 border-casino-gold rounded-lg p-4 shadow-lg">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-casino-dark-red mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-casino-dark-red">
                        {t('results.imperfectMatch')}
                      </h3>
                      <p className="mt-1 text-sm text-casino-black">
                        {t('results.imperfectMatchDescription', {
                          parts: lowConfidenceParts.join(', '),
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowManualControls(true)}
                        className="mt-3 text-sm font-bold text-casino-red hover:text-casino-dark-red underline"
                      >
                        {t('results.customizeManually')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              {showManualControls && (
                <button
                  type="button"
                  onClick={() => setShowManualControls(false)}
                  className="focus:ring-2 focus:ring-offset-2 focus:ring-casino-gold hover:bg-casino-black outline-none flex items-center justify-center border-3 border-casino-gold bg-casino-black text-casino-gold font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-lg"
                >
                  {t('results.hideControls')}
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="focus:ring-2 focus:ring-offset-2 focus:ring-casino-red hover:bg-casino-dark-red outline-none flex items-center justify-center border-3 border-casino-gold bg-casino-red text-white font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-lg"
              >
                {t('tryAnother')}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export async function getStaticProps({
  locale,
}: GetStaticPropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [`common`])),
    },
  };
}

export default Home;
