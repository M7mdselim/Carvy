
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronUp } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';

export default function TermsAndConditions() {
  const { t, language } = useLanguage();
  const rtlClass = language === 'ar' ? 'rtl' : '';
  const lastUpdated = "June 1, 2023";
  const isArabic = language === 'ar';

  return (
    <div className={`py-12 bg-gray-50 min-h-screen ${rtlClass}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('termsAndConditions')}</h1>
          <p className="text-gray-500 text-sm">{isArabic ? 'آخر تحديث:' : 'Last Updated:'} {lastUpdated}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Introduction */}
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-600">
              {isArabic ? 
                'مرحبًا بك في ظبط. يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا. من خلال الوصول إلى منصتنا أو استخدامها، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام خدماتنا.' : 
                'Welcome to Zabtt. Please read these Terms and Conditions carefully before using our services. By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use our services.'
              }
            </p>
          </div>
          
          {/* Main Terms Content */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="section-1">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '1. قبول الشروط' : '1. Acceptance of Terms'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p>
                  {isArabic ? 
                    'من خلال إنشاء حساب أو استخدام خدمات ظبط، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام. نحتفظ بالحق في تحديث أو تعديل هذه الشروط في أي وقت دون إشعار مسبق. استمرارك في استخدام خدماتنا بعد أي تغييرات يشكل قبولك للشروط المعدلة.' : 
                    'By creating an account or using Zabtt services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. We reserve the right to update or modify these terms at any time without prior notice. Your continued use of our services following any changes constitutes your acceptance of the revised terms.'
                  }
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-2">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '2. تسجيل الحساب' : '2. Account Registration'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 
                    'لاستخدام بعض ميزات منصتنا، يجب عليك التسجيل للحصول على حساب. عند التسجيل، فإنك توافق على:' : 
                    'To use certain features of our platform, you must register for an account. When you register, you agree to:'
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{isArabic ? 'تقديم معلومات دقيقة وحديثة وكاملة' : 'Provide accurate, current, and complete information'}</li>
                  <li>{isArabic ? 'الحفاظ على معلومات حسابك وتحديثها على الفور' : 'Maintain and promptly update your account information'}</li>
                  <li>{isArabic ? 'الحفاظ على سرية كلمة المرور الخاصة بك' : 'Keep your password secure and confidential'}</li>
                  <li>{isArabic ? 'تحمل المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك' : 'Be responsible for all activities that occur under your account'}</li>
                  <li>{isArabic ? 'إبلاغنا على الفور بأي استخدام غير مصرح به لحسابك' : 'Notify us immediately of any unauthorized use of your account'}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-3">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '3. سلوك المستخدم' : '3. User Conduct'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 'عند استخدام خدماتنا، فإنك توافق على عدم:' : 'When using our services, you agree not to:'}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{isArabic ? 'انتهاك أي قوانين أو لوائح سارية أو حقوق الطرف الثالث' : 'Violate any applicable laws, regulations, or third-party rights'}</li>
                  <li>{isArabic ? 'استخدام المنصة لأي غرض غير قانوني أو غير مصرح به' : 'Use the platform for any illegal or unauthorized purpose'}</li>
                  <li>{isArabic ? 'نشر أو نقل محتوى ضار أو احتيالي أو مضلل' : 'Post or transmit harmful, fraudulent, or deceptive content'}</li>
                  <li>{isArabic ? 'محاولة الوصول غير المصرح به إلى حسابات المستخدمين الآخرين أو الأنظمة' : 'Attempt to gain unauthorized access to other user accounts or systems'}</li>
                  <li>{isArabic ? 'التدخل في أو تعطيل سلامة منصتنا' : 'Interfere with or disrupt the integrity of our platform'}</li>
                  <li>{isArabic ? 'جمع أو حصاد معلومات المستخدم دون موافقة صريحة' : 'Collect or harvest user information without express consent'}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-4">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '4. المنتجات والخدمات' : '4. Products and Services'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 
                    '4.1 معلومات المنتج: نحن نسعى جاهدين لتقديم معلومات دقيقة عن المنتج، ولكننا لا نضمن أن أوصاف المنتجات أو الأسعار أو المحتويات الأخرى على منصتنا كاملة أو موثوقة أو حديثة أو خالية من الأخطاء.' : 
                    '4.1 Product Information: We strive to provide accurate product information, but we do not warrant that product descriptions, prices, or other content on our platform are complete, reliable, current, or error-free.'
                  }
                </p>
                <p className="mb-3">
                  {isArabic ? 
                    '4.2 الأسعار والتوفر: أسعار وتوفر المنتجات عرضة للتغيير دون إشعار. نحتفظ بالحق في تحديد كميات المنتجات المشتراة ورفض أو إلغاء الطلبات.' : 
                    '4.2 Pricing and Availability: Prices and availability of products are subject to change without notice. We reserve the right to limit quantities of products purchased and to refuse or cancel orders.'
                  }
                </p>
                <p>
                  {isArabic ? 
                    '4.3 البائعين من الطرف الثالث: تُباع بعض المنتجات على منصتنا من قبل بائعين من جهات خارجية. نحن لسنا مسؤولين عن فحص أو تقييم محتوى أو دقة منتجات الطرف الثالث. نحن لا نضمن أو نكفل أي منتجات من طرف ثالث وأنت توافق على أننا لسنا مسؤولين عن أي أضرار أو خسائر ناتجة عن معاملاتك مع البائعين من الطرف الثالث.' : 
                    '4.3 Third-Party Sellers: Some products on our platform are sold by third-party sellers. We are not responsible for examining or evaluating the content or accuracy of third-party products. We do not warrant or guarantee any third-party products and you agree that we are not responsible for any damages or losses resulting from your transactions with third-party sellers.'
                  }
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-5">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '5. الدفع والمبالغ المستردة' : '5. Payment and Refunds'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 
                    '5.1 طرق الدفع: نقبل طرق دفع مختلفة كما هو موضح أثناء عملية الدفع. من خلال تقديم معلومات الدفع، فإنك تقر وتضمن أنك مخول باستخدام طريقة الدفع المحددة.' : 
                    '5.1 Payment Methods: We accept various payment methods as indicated during the checkout process. By providing payment information, you represent and warrant that you are authorized to use the designated payment method.'
                  }
                </p>
                <p className="mb-3">
                  {isArabic ? 
                    '5.2 الأسعار والضرائب: جميع الأسعار بالجنيه المصري (EGP) ما لم يذكر خلاف ذلك. سيتم إضافة الضرائب المطبقة إلى السعر النهائي أثناء الدفع.' : 
                    '5.2 Pricing and Taxes: All prices are in Egyptian Pounds (EGP) unless otherwise stated. Applicable taxes will be added to the final price during checkout.'
                  }
                </p>
                <p className="mb-3">
                  {isArabic ? 
                    '5.3 المبالغ المستردة: تسمح سياسة الاسترداد الخاصة بنا بالإرجاع في غضون 24 ساعة من استلام المنتج. للتأهل للحصول على استرداد، يجب أن تكون العناصر غير مستخدمة وفي عبواتها الأصلية. تكاليف شحن الإرجاع هي مسؤولية العميل ما لم يكن الإرجاع بسبب خطأ من جانبنا.' : 
                    '5.3 Refunds: Our refund policy allows returns within 24 hours of receiving the product. To qualify for a refund, items must be unused and in their original packaging. Return shipping costs are the responsibility of the customer unless the return is due to our error.'
                  }
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-6">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '6. الملكية الفكرية' : '6. Intellectual Property'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 
                    '6.1 المحتوى الخاص بنا: جميع المحتويات الموجودة على منصتنا، بما في ذلك على سبيل المثال لا الحصر النصوص والرسومات والشعارات والرموز والصور ومقاطع الصوت والتنزيلات الرقمية والبرامج، هي ملك لشركة ظبط أو موردي المحتوى الخاصين بها وهي محمية بموجب قوانين حقوق الطبع والنشر والعلامات التجارية وغيرها من قوانين الملكية الفكرية الدولية.' : 
                    '6.1 Our Content: All content on our platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of Zabtt or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.'
                  }
                </p>
                <p className="mb-3">
                  {isArabic ? 
                    '6.2 ترخيص محدود: نمنحك ترخيصًا محدودًا وغير حصري وغير قابل للتحويل وقابل للإلغاء للوصول إلى منصتنا واستخدامها لأغراض شخصية وغير تجارية. لا يتضمن هذا الترخيص:' : 
                    '6.2 Limited License: We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our platform for personal, non-commercial purposes. This license does not include:'
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-3">
                  <li>{isArabic ? 'تعديل أو نسخ المواد الخاصة بنا' : 'Modifying or copying our materials'}</li>
                  <li>{isArabic ? 'استخدام المواد لأي غرض تجاري' : 'Using the materials for any commercial purpose'}</li>
                  <li>{isArabic ? 'محاولة فك أو عكس هندسة أي برنامج على منصتنا' : 'Attempting to decompile or reverse engineer any software on our platform'}</li>
                  <li>{isArabic ? 'إزالة أي إشعارات حقوق الطبع والنشر أو الملكية من المواد' : 'Removing any copyright or proprietary notations from the materials'}</li>
                </ul>
                <p>
                  {isArabic ? 
                    '6.3 محتوى المستخدم: من خلال تقديم المحتوى (مثل المراجعات أو التعليقات) إلى منصتنا، فإنك تمنحنا ترخيصًا عالميًا وغير حصري وبدون حقوق ملكية لاستخدام ونسخ وتكييف ونشر وترجمة وتوزيع المحتوى الخاص بك في أي وسائط حالية أو مستقبلية.' : 
                    '6.3 User Content: By submitting content (such as reviews or comments) to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media.'
                  }
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-7">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '7. تحديد المسؤولية' : '7. Limitation of Liability'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 border-b border-gray-100">
                <p className="mb-3">
                  {isArabic ? 
                    'في أي حال من الأحوال، لن تكون شركة ظبط أو مسؤوليها أو مديريها أو موظفيها أو وكلائها مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية، بما في ذلك على سبيل المثال لا الحصر، خسارة الأرباح أو البيانات أو الاستخدام أو الشهرة أو غيرها من الخسائر غير الملموسة، الناتجة عن:' : 
                    'In no event shall Zabtt, its officers, directors, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:'
                  }
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{isArabic ? 'وصولك إلى أو استخدامك أو عدم قدرتك على الوصول إلى أو استخدام خدماتنا' : 'Your access to or use of or inability to access or use our services'}</li>
                  <li>{isArabic ? 'أي سلوك أو محتوى لأي طرف ثالث على منصتنا' : 'Any conduct or content of any third party on our platform'}</li>
                  <li>{isArabic ? 'أي محتوى تم الحصول عليه من منصتنا' : 'Any content obtained from our platform'}</li>
                  <li>{isArabic ? 'الوصول غير المصرح به أو الاستخدام أو التغيير في إرسالاتك أو محتواك' : 'Unauthorized access, use, or alteration of your transmissions or content'}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-8">
              <AccordionTrigger className="px-6 py-4 text-left text-gray-900 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center">
                  <span className="font-semibold">{isArabic ? '8. القانون الحاكم' : '8. Governing Law'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600">
                <p>
                  {isArabic ? 
                    'تخضع هذه الشروط والأحكام وتفسر وفقًا لقوانين مصر، دون اعتبار لأحكام تنازع القوانين فيها. أي نزاع ينشأ عن أو يتعلق بهذه الشروط يخضع للاختصاص القضائي الحصري للمحاكم في مصر.' : 
                    'These Terms and Conditions shall be governed and construed in accordance with the laws of Egypt, without regard to its conflict of law provisions. Any dispute arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Egypt.'
                  }
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isArabic ? 
              'إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى الاتصال بنا على ' : 
              'If you have any questions about these Terms and Conditions, please contact us at '}
            <a href="mailto:support@zabtt.com" className="text-blue-600 hover:underline">support@zabtt.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
