import { useEffect, useState } from 'react'
import '../styles/landing.css'

const translations = {
  en: {
    brandTag: 'Delivery for people and businesses',
    languageLabel: 'Language',
    eyebrow: 'Fast delivery, local support',
    headline: 'Move faster with Qareeb.',
    subheadline:
      'Qareeb connects riders, drivers, and everyday people who need something delivered quickly, safely, and with real-time updates.',
    signIn: 'Sign In',
    learnMore: 'Learn More',
    statOneValue: '24/7',
    statOneLabel: 'Available delivery requests at any time',
    statTwoValue: 'Fast',
    statTwoLabel: 'Quick dispatch for nearby trips and errands',
    statThreeValue: 'Local',
    statThreeLabel: 'Built for neighborhoods, cities, and communities',
    screenLive: 'Live status',
    screenTitle: 'Pickup in progress',
    screenCopy:
      'A driver is already heading to the pickup point and the delivery is being tracked live.',
    deliveryTitle: 'Quick delivery to your door',
    deliveryCopy: 'From stores, offices, or friends - everything stays on the way.',
    featureOneTitle: 'Built for everyday deliveries',
    featureOneCopy:
      'Send packages, documents, food, or essentials without making the trip yourself.',
    featureTwoTitle: 'Simple for riders and drivers',
    featureTwoCopy:
      'A clean workflow makes it easy to accept trips, complete jobs, and stay updated.',
  },
  ar: {
    brandTag: 'خدمة توصيل للأفراد والأعمال',
    languageLabel: 'اللغة',
    eyebrow: 'توصيل سريع مع دعم محلي',
    headline: 'تحرك أسرع مع قريب.',
    subheadline:
      'يربط تطبيق قريب بين السائقين والأفراد وكل من يحتاج خدمة توصيل سريعة وآمنة مع تحديثات لحظية.',
    signIn: 'تسجيل الدخول',
    learnMore: 'اعرف المزيد',
    statOneValue: '24/7',
    statOneLabel: 'طلبات توصيل متاحة في أي وقت',
    statTwoValue: 'سريع',
    statTwoLabel: 'إرسال سريع للطلبات القريبة والمشاوير',
    statThreeValue: 'محلي',
    statThreeLabel: 'مصمم للأحياء والمدن والمجتمعات',
    screenLive: 'الحالة مباشرة',
    screenTitle: 'جاري الاستلام',
    screenCopy:
      'السائق في طريقه إلى نقطة الاستلام ويتم تتبع عملية التوصيل لحظة بلحظة.',
    deliveryTitle: 'توصيل سريع إلى بابك',
    deliveryCopy: 'من المتاجر أو المكاتب أو الأصدقاء - كل شيء يبقى في الطريق بسهولة.',
    featureOneTitle: 'مصمم للتوصيل اليومي',
    featureOneCopy:
      'أرسل الطرود أو المستندات أو الطعام أو المستلزمات بدون أن تغادر مكانك.',
    featureTwoTitle: 'بسيط للسائقين والطلبات',
    featureTwoCopy: 'تجربة واضحة تسهل قبول الطلبات وإنجازها ومتابعتها.',
  },
}

const stats = [
  { valueKey: 'statOneValue', labelKey: 'statOneLabel' },
  { valueKey: 'statTwoValue', labelKey: 'statTwoLabel' },
  { valueKey: 'statThreeValue', labelKey: 'statThreeLabel' },
]

const features = [
  { titleKey: 'featureOneTitle', copyKey: 'featureOneCopy' },
  { titleKey: 'featureTwoTitle', copyKey: 'featureTwoCopy' },
]

function Landing() {
  const [language] = useState('ar')
  const copy = translations[language]

  useEffect(() => {
    document.body.dataset.lang = language
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  return (
    <div className="page landing-page">
      <div className="container">
        <header className="topbar fade-in">
          <a className="brand" href="#" aria-label="Qareeb home">
            <div className="brand-mark">Q</div>
            <div className="brand-text">
              <strong>Qareeb</strong>
              <span>{copy.brandTag}</span>
            </div>
          </a>

        </header>

        <main className="hero">
          <section className="hero-content fade-in delay-1">
            <div className="eyebrow">{copy.eyebrow}</div>
            <h1>{copy.headline}</h1>
            <p>{copy.subheadline}</p>

            <div className="actions">
              <a className="btn btn-primary" href="#signin">
                {copy.signIn}
              </a>
              <a className="btn btn-secondary" href="#learn-more">
                {copy.learnMore}
              </a>
            </div>

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div className={`stat fade-in delay-${index + 2}`} key={stat.valueKey}>
                  <strong>{copy[stat.valueKey]}</strong>
                  <span>{copy[stat.labelKey]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="showcase fade-in delay-2" aria-label="App preview">
            <div className="phone">
              <div className="screen">
                <div className="screen-top">
                  <span className="pill">Qareeb</span>
                  <span className="pill">{copy.screenLive}</span>
                </div>

                <div className="screen-card">
                  <h3>{copy.screenTitle}</h3>
                  <p>{copy.screenCopy}</p>
                </div>

                <div className="map" aria-hidden="true">
                  <div className="route"></div>
                  <div className="pin"></div>
                  <div className="pin-alt"></div>
                  <div className="delivery-card">
                    <div className="avatar">Q</div>
                    <div>
                      <strong>{copy.deliveryTitle}</strong>
                      <span>{copy.deliveryCopy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <section className="feature-strip" id="learn-more">
          {features.map((feature, index) => (
            <article className={`feature fade-in delay-${index + 2}`} key={feature.titleKey}>
              <h2>{copy[feature.titleKey]}</h2>
              <p>{copy[feature.copyKey]}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Landing