import React, { useEffect } from 'react';
import { AppSettings } from '../data/appSettings';

interface SeoHeadProps {
  activeTab: string;
  isMaintenanceActive: boolean;
  settings: AppSettings;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  activeTab,
  isMaintenanceActive,
  settings
}) => {
  useEffect(() => {
    const siteName = 'আবেদনী (Abedoni)';
    let pageTitle = 'আবেদনী (Abedoni) - SSC বোর্ড চ্যালেঞ্জ ও খাতা পুনঃমূল্যায়ন ২০২৬';
    let metaDescription = 'আবেদনী (Abedoni) - SSC বোর্ড চ্যালেঞ্জ ও খাতা পুনঃমূল্যায়ন আবেদনের জন্য একটি স্বাধীন অনলাইন সহায়তাকারী প্ল্যাটফর্ম। সহজ ও নিরাপদ প্রক্রিয়ায় টেলিটক সিম ছাড়াই বিকাশ/নগদে আবেদন করুন।';
    let canonicalPath = '/';

    if (isMaintenanceActive) {
      const headline = settings.maintenanceHeadline || 'SSC Board Challenge 2026';
      pageTitle = `${headline} - প্রাক-উদ্বোধন (Pre-Launch) | ${siteName}`;
      metaDescription = `${headline} প্রাক-উদ্বোধন পোর্টালে স্বাগতম। এসএসসি পরীক্ষার ফলাফল প্রকাশের পরই বোর্ড চ্যালেঞ্জ বা খাতা পুনঃমূল্যায়ন অনলাইন আবেদন সেবা শুরু হবে।`;
      canonicalPath = '/';
    } else {
      switch (activeTab) {
        case 'home':
          pageTitle = `আবেদনী (Abedoni) - SSC বোর্ড চ্যালেঞ্জ ও খাতা পুনঃমূল্যায়ন ২০২৬ আবেদন সহায়তা`;
          metaDescription = `SSC পরীক্ষা ২০২৬ এর বোর্ড চ্যালেঞ্জ ও খাতা পুনঃমূল্যায়ন আবেদনের স্বাধীন ডিজিটাল অনলাইন প্ল্যাটফর্ম। টেলিটক সিম ছাড়াই বিকাশ, নগদ বা রকেট দিয়ে সহজ আবেদন।`;
          canonicalPath = '/';
          break;
        case 'apply':
          pageTitle = `অনলাইন আবেদন ফরম - SSC বোর্ড চ্যালেঞ্জ ২০২৬ | ${siteName}`;
          metaDescription = `SSC বোর্ড চ্যালেঞ্জের অনলাইন আবেদন ফরম পূরণ করুন। আপনার শিক্ষাবোর্ড, রোল, রেজিস্ট্রেশন নম্বর ও বিষয় নির্বাচন করে বিকাশ বা নগদে ফি পরিশোধ করুন।`;
          canonicalPath = '/apply';
          break;
        case 'tracking':
          pageTitle = `আবেদন ট্র্যাকিং ও অনলাইন স্ট্যাটাস - SSC বোর্ড চ্যালেঞ্জ ২০২৬ | ${siteName}`;
          metaDescription = `আপনার বোর্ড চ্যালেঞ্জ আবেদনের বর্তমান স্ট্যাটাস, পেমেন্ট রিসিপ্ট ও আপডেট ট্র্যাক করুন আপনার অর্ডার ট্র্যাকিং আইকন বা মোবাইল নম্বর দিয়ে।`;
          canonicalPath = '/tracking';
          break;
        case 'pricing':
          pageTitle = `ফি ও প্রসেসিং চার্জ তালিকা - SSC বোর্ড চ্যালেঞ্জ ২০২৬ | ${siteName}`;
          metaDescription = `SSC বোর্ড চ্যালেঞ্জ প্রতি বিষয়ের সরকারি বোর্ড ফি (৳${settings.officialBoardFee || 175}), SMS প্রসেসিং ফি (৳${settings.smsFeePerSubject || 6}) ও আবেদনী সার্ভিস চার্জের পূর্ণাঙ্গ স্বচ্ছ তালিকা।`;
          canonicalPath = '/pricing';
          break;
        case 'notice':
          pageTitle = `শিক্ষা বোর্ড নোটিশ ও গাইডলাইন - SSC বোর্ড চ্যালেঞ্জ ২০২৬ | ${siteName}`;
          metaDescription = `বাংলাদেশের সকল শিক্ষা বোর্ডের এসএসসি খাতা পুনঃমূল্যায়ন (বোর্ড চ্যালেঞ্জ) অফিশিয়াল নির্দেশিকা, আবেদনের নিয়মাবলি ও সর্বশেষ নোটিশ।`;
          canonicalPath = '/notice';
          break;
        case 'faq':
          pageTitle = `সাধারণ জিজ্ঞাসা (FAQ) - SSC বোর্ড চ্যালেঞ্জ ২০২৬ | ${siteName}`;
          metaDescription = `বোর্ড চ্যালেঞ্জ আবেদন, টেলিটক সিম ছাড়া আবেদন, ফি পরিশোধ, ডিজিটাল রিসিপ্ট ও সার্ভিস সংক্রান্ত যেকোনো প্রশ্নের উত্তর জানুন।`;
          canonicalPath = '/faq';
          break;
        case 'about':
          pageTitle = `আমাদের সম্পর্কে (About Us) - ${siteName} স্বাধীন ডিজিটাল সেবা`;
          metaDescription = `আবেদনী (Abedoni) একটি সম্পূর্ণ স্বাধীন ডিজিটাল আবেদন সহায়তাকারী প্ল্যাটফর্ম। শিক্ষার্থীদের সময় বাঁচাতে আধুনিক প্রযুক্তি ভিত্তিক বিশ্বস্ত সার্ভিস।`;
          canonicalPath = '/about';
          break;
        default:
          canonicalPath = '/';
      }
    }

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Meta Description
    let metaDescElement = document.querySelector('meta[name="description"]');
    if (!metaDescElement) {
      metaDescElement = document.createElement('meta');
      metaDescElement.setAttribute('name', 'description');
      document.head.appendChild(metaDescElement);
    }
    metaDescElement.setAttribute('content', metaDescription);

    // 3. Update Canonical Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', `https://abedoni.shop${canonicalPath}`);

    // 4. Update Open Graph Meta & Images
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', metaDescription);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://abedoni.shop${canonicalPath}`);

    // Dynamic Branding & Cache Busting (Favicon, OG Image, Touch Icons)
    const brandingVer = settings.brandingVersion || Date.now();
    const applyCacheBuster = (url: string) => {
      if (!url) return '';
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}v=${brandingVer}`;
    };

    const favUrl = settings.favicon || settings.websiteLogo || settings.logoIconUrl || 'https://munna.pro.bd/tmassets/favicon-logo-icon.svg';
    const versionedFavicon = applyCacheBuster(favUrl);

    // Update / Replace Favicons in DOM
    const updateLinkTag = (rel: string, href: string) => {
      let existing = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (existing) {
        existing.remove(); // Force browser cache bust by replacing element
      }
      const newLink = document.createElement('link');
      newLink.rel = rel;
      newLink.href = href;
      document.head.appendChild(newLink);
    };

    updateLinkTag('icon', versionedFavicon);
    updateLinkTag('shortcut icon', versionedFavicon);

    const appleTouchUrl = settings.appleTouchIcon || favUrl;
    updateLinkTag('apple-touch-icon', applyCacheBuster(appleTouchUrl));

    // Update OG & Twitter Card Images
    const ogImgUrl = settings.ogImage || settings.defaultShareImage || settings.websiteLogo || settings.logoIconUrl;
    const versionedOgImg = applyCacheBuster(ogImgUrl);

    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.setAttribute('content', versionedOgImg);

    const twitterImgUrl = settings.twitterCardImage || ogImgUrl;
    const versionedTwitterImg = applyCacheBuster(twitterImgUrl);

    let twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImageMeta) {
      twitterImageMeta = document.createElement('meta');
      twitterImageMeta.setAttribute('name', 'twitter:image');
      document.head.appendChild(twitterImageMeta);
    }
    twitterImageMeta.setAttribute('content', versionedTwitterImg);

    // 5. Inject Dynamic JSON-LD Structured Data
    let schemaScript = document.getElementById('dynamic-seo-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'dynamic-seo-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const orgLogo = settings.websiteLogo || settings.logoIconUrl;

    const breadcrumbs = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "হোম (Home)",
        "item": "https://abedoni.shop/"
      }
    ];

    if (canonicalPath !== '/') {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": pageTitle.split('-')[0].trim(),
        "item": `https://abedoni.shop${canonicalPath}`
      });
    }

    const dynamicGraph: any[] = [
      {
        "@type": "Organization",
        "@id": "https://abedoni.shop/#organization",
        "name": settings.siteName || "Abedoni (আবেদনী)",
        "url": "https://abedoni.shop/",
        "logo": orgLogo,
        "description": "Abedoni is an independent digital application assistance platform for SSC Board Challenge & Re-scrutiny processing in Bangladesh.",
        "email": settings.officialEmail,
        "sameAs": [
          settings.facebookPageUrl || "https://facebook.com/abedoni.bd"
        ]
      },
      {
        "@type": "WebPage",
        "@id": `https://abedoni.shop${canonicalPath}#webpage`,
        "url": `https://abedoni.shop${canonicalPath}`,
        "name": pageTitle,
        "description": metaDescription,
        "inLanguage": "bn-BD",
        "isPartOf": {
          "@id": "https://abedoni.shop/#website"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://abedoni.shop${canonicalPath}#breadcrumb`,
        "itemListElement": breadcrumbs
      }
    ];

    // Add Service Schema if on main or apply or maintenance
    if (activeTab === 'home' || activeTab === 'apply' || isMaintenanceActive) {
      dynamicGraph.push({
        "@type": "Service",
        "@id": "https://abedoni.shop/#service",
        "name": "SSC Board Challenge Online Application Processing Assistance",
        "serviceType": "Educational Application Assistance",
        "provider": {
          "@type": "Organization",
          "name": "Abedoni (আবেদনী)",
          "url": "https://abedoni.shop/"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Bangladesh"
        },
        "description": "Independent online application processing service for SSC Board Challenge and Re-scrutiny in Bangladesh."
      });
    }

    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": dynamicGraph
    });

  }, [activeTab, isMaintenanceActive, settings]);

  return null;
};
