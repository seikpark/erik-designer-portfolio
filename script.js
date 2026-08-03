const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const currentPage = document.body.dataset.page;
const pageNavLinks = navLinks.filter((link) => link.getAttribute("href")?.startsWith("#"));
const sections = pageNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const mediaCopyTargets = "img, picture, svg, canvas, video";
const editableTargets = "input, textarea, [contenteditable='true']";
const closestFromEvent = (event, selector) => {
  const target = event.target;

  return target instanceof Element ? target.closest(selector) : null;
};

document.addEventListener("copy", (event) => {
  event.preventDefault();
});

document.addEventListener("cut", (event) => {
  event.preventDefault();
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (closestFromEvent(event, mediaCopyTargets)) {
    event.preventDefault();
  }
});

document.addEventListener("selectstart", (event) => {
  if (!closestFromEvent(event, editableTargets)) {
    event.preventDefault();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if ((event.metaKey || event.ctrlKey) && ["a", "c", "x"].includes(key)) {
    event.preventDefault();
  }
});

if (window.location.protocol === "file:") {
  const cleanRoutes = {
    "/projects/": "projects/index.html",
    "/about/": "about/index.html",
    "/pages/workshop.html": "pages/workshop.html",
    "/pages/ai-design-lovable.html": "pages/ai-design-lovable.html",
  };
  const nestedDirectories = new Set(["about", "cases", "pages", "projects"]);
  const currentDirectory = window.location.pathname.split("/").slice(0, -1).pop();
  const isNestedFile = nestedDirectories.has(currentDirectory);

  document.querySelectorAll("a[href]").forEach((link) => {
    const target = cleanRoutes[link.getAttribute("href")];

    if (!target) {
      return;
    }

    const targetDirectory = target.split("/")[0];
    const targetFile = target.split("/").pop();
    const localHref = currentDirectory === targetDirectory ? targetFile : `${isNestedFile ? "../" : ""}${target}`;

    link.setAttribute("href", localHref);
  });
}

navLinks.forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === currentPage);
});

const setNavIconState = () => {
  navLinks.forEach((link) => {
    const icon = link.querySelector(".nav-icon");
    const src = icon?.getAttribute("src");

    if (!icon || !src) {
      return;
    }

    const defaultSrc = icon.dataset.defaultSrc || src.replace("_filled.svg", ".svg");
    const activeSrc = icon.dataset.activeSrc || defaultSrc.replace(".svg", "_filled.svg");

    icon.dataset.defaultSrc = defaultSrc;
    icon.dataset.activeSrc = activeSrc;
    icon.setAttribute("src", link.classList.contains("is-active") ? activeSrc : defaultSrc);
  });
};

setNavIconState();

const initializeChatbotTrigger = () => {
  const avatar = document.querySelector(".slime-character");

  if (!avatar) {
    return;
  }

  avatar.dataset.chatbotTrigger = "";
  avatar.setAttribute("role", "button");
  avatar.setAttribute("aria-label", "Open portfolio chatbot");
  avatar.setAttribute("tabindex", "0");
  avatar.setAttribute("aria-controls", "portfolio-chatbot-message");
  avatar.setAttribute("aria-expanded", "false");
  avatar.title = "Chatbot";

  const chatbotMessage = document.createElement("div");
  const chatbotMessageCopy = {
    en: "Hi, I'm Erik's AI agent. This feature is still being tested, so it isn't available yet.",
    ko: "안녕하세요. 저는 에릭의 AI 에이전트예요. 아직 테스트 중인 기능이라 지금은 사용할 수 없어요.",
  };

  chatbotMessage.id = "portfolio-chatbot-message";
  chatbotMessage.className = "chatbot-status-message";
  chatbotMessage.hidden = true;
  chatbotMessage.setAttribute("role", "status");
  chatbotMessage.setAttribute("aria-live", "polite");
  avatar.insertAdjacentElement("afterend", chatbotMessage);

  let autoCloseTimer;

  const updateChatbotMessageLanguage = () => {
    const language = document.body.dataset.language === "ko" ? "ko" : "en";

    chatbotMessage.lang = language;
    chatbotMessage.textContent = chatbotMessageCopy[language];
  };

  const setChatbotMessageVisibility = (isVisible) => {
    window.clearTimeout(autoCloseTimer);
    chatbotMessage.hidden = !isVisible;
    avatar.setAttribute("aria-expanded", String(isVisible));

    if (isVisible) {
      updateChatbotMessageLanguage();
      autoCloseTimer = window.setTimeout(() => {
        setChatbotMessageVisibility(false);
      }, 5000);
    }
  };

  avatar.addEventListener("click", () => {
    setChatbotMessageVisibility(chatbotMessage.hidden);
  });

  avatar.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    avatar.click();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      !(target instanceof Node) ||
      chatbotMessage.hidden ||
      avatar.contains(target) ||
      chatbotMessage.contains(target)
    ) {
      return;
    }

    setChatbotMessageVisibility(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setChatbotMessageVisibility(false);
    }
  });
};

initializeChatbotTrigger();

const setActiveNav = () => {
  const offset = window.scrollY + 140;
  let activeId = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });

  pageNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });

  setNavIconState();
};

const copyButtons = document.querySelectorAll("[data-copy-email]");
const contactButtons = Array.from(document.querySelectorAll(".app-button[href^='mailto:']"));
const workFeeds = Array.from(document.querySelectorAll("[data-work-feed]"));
const upcomingProjects = [];
const WORK_VIEW_STORAGE_KEY = "workView";
const TILE_CASE_RETURN_KEY = "tileCaseReturn";
const PORTFOLIO_LANGUAGE_STORAGE_KEY = "portfolioLanguage";
const recommendationRailKoreanContentSelectors = [
  ".recommendation-rail .testimonial-person p > span:last-child",
  ".recommendation-rail .testimonial-summary-text",
  ".recommendation-rail .testimonial-card details > span",
  ".recommendation-rail .topic-cloud > span",
  ".recommendation-rail .rail-credit-links > a",
  ".recommendation-rail .rail-credit",
];
const portfolioLanguageSelectors = {
  projects: [
    ".story-copy h2 a",
    ".story-copy .story-deck",
    ".recommendation-rail .rail-section:first-child article > h3 > a",
    ".recommendation-rail .rail-section:first-child article > h3:not(:has(a))",
    ...recommendationRailKoreanContentSelectors,
  ],
  project: [
    ".article-header h1",
    ".article-header .story-deck",
    ".case-detail-section > h2",
    ".case-detail-section > p",
    ".case-detail-section > ul > li",
    ".case-beroai .case-table th",
    ".case-beroai .case-table td",
    ".case-under-construction-section .case-image-kicker",
    ".case-under-construction-section figcaption > strong",
    ".case-under-construction-section figcaption > span",
  ],
  about: [
    ".medium-wordmark",
    ".following-card-profile .profile-sidebar-name",
    ".profile-intro-title",
    ".profile-intro-tags > span",
    ".profile-intro-copy",
    ".profile-feed .profile-chapter h2",
    ".profile-feed .profile-chapter h3",
    ".profile-feed .profile-chapter p",
    ".profile-feed .profile-chapter li",
    ".profile-feed .profile-bridge > h2",
    ".profile-feed .profile-bridge > p",
    ".profile-feed .profile-bridge-actions > a",
    ".recommendation-rail .rail-section:first-child article > span",
    ...recommendationRailKoreanContentSelectors,
  ],
  workshop: [
    ".story-copy .story-source-copy",
    ".story-copy h2 > a",
    ".story-copy h2:not(:has(a))",
    ".story-copy .story-deck",
    ".story-copy .story-actions > span",
    ".recommendation-rail .rail-section:first-child article > h3 > a",
    ".recommendation-rail .rail-section:first-child article > h3:not(:has(a))",
    ...recommendationRailKoreanContentSelectors,
  ],
  workshopArticle: [
    ".article-header .story-source-copy",
    ".article-header h1",
    ".article-header .story-deck",
    ".article-byline > span:not(.avatar-button)",
    ".article-byline .article-source-link",
    ".case-detail-section > h2",
    ".case-detail-section > p",
    ".workshop-question-list > p > span",
    ".case-nav-row a",
  ],
};
const portfolioKoreanTranslations = new Map([
  [
    "Turning smart collar data into useful, trustworthy guidance for dog owners.",
    "반려견의 행동 신호를 해석하는 AI 스마트 목걸이 서비스",
  ],
  [
    "BeroAI connects a smart collar and companion app to help dog owners understand what may be happening and respond with more confidence. I also designed a separate pre-order site to explain the product and capture early demand.",
    "BeroAI는 스마트 목걸이와 앱을 연결해, 보호자가 반려견의 상태를 이해하고 상황에 맞게 대응하도록 돕습니다. 사전 주문 사이트는 제품의 쓰임을 설명하고 초기 수요를 확인하는 별도 경험으로 설계했습니다.",
  ],
  [
    "Helping owners understand their dog's personality beyond a simple label.",
    "반려견의 성격과 행동을 이해하는 반려동물 돌봄 서비스",
  ],
  [
    "Pawdle helps dog owners understand their dog's personality with insights, tips, and tools that support better care and communication.",
    "Pawdle은 반려견의 성격을 이해할 수 있는 인사이트와 팁, 도구를 제공합니다. 보호자는 이를 더 나은 돌봄과 소통에 활용할 수 있습니다.",
  ],
  [
    "Creating a practical community hub for Koreans settling in Canada.",
    "캐나다 교민들을 위한 커뮤니티 서비스",
  ],
  [
    "Canbu grew into a Korean community service in Canada, passing 2,000 users through offline promotion, local verification, and community-driven information sharing.",
    "Canbu는 오프라인 홍보와 현지 정보 검증, 커뮤니티 구성원이 나누는 정보를 바탕으로 2,000명 이상이 사용하는 캐나다 한인 커뮤니티로 성장했습니다.",
  ],
  [
    "Making company analysis easier to scan for everyday investors.",
    "개인 투자자를 위한 기업 분석 서비스",
  ],
  [
    "Butler is an investment assistant service that organizes visualized company data, disclosures, reports, news, screeners, and portfolio workflows for individual investors.",
    "Butler는 시각화한 기업 데이터와 공시, 리포트, 뉴스, 스크리너, 관심 종목, 포트폴리오 관리 기능을 한곳에 모은 투자 지원 서비스입니다.",
  ],
  [
    "Butler organizes company data, disclosures, reports, news, screeners, and portfolio workflows into an investment assistant experience for individual investors.",
    "Butler는 기업 데이터와 공시, 리포트, 뉴스, 스크리너, 포트폴리오 관리 기능을 한곳에 모아 개인 투자자의 기업 분석과 투자 관리를 돕습니다.",
  ],
  [
    "Turning fan identity into a mobile passport for the SMTOWN universe.",
    "SM 팬을 위한 디지털 여권 서비스",
  ],
  [
    "SMTOWN Meta-Passport connects fan identity, membership, event stamps, and the Music Nation SMTOWN concept into a mobile passport experience.",
    "SMTOWN Meta-Passport는 팬의 디지털 정체성과 멤버십, 이벤트 참여, 스탬프를 연결해 팬이 Music Nation SMTOWN 세계관을 모바일 여권 형태로 경험할 수 있게 합니다.",
  ],
  [
    "SMTOWN Meta-Passport connected fan identity, membership, event stamps, and the Music Nation SMTOWN concept into a mobile passport experience.",
    "SMTOWN Meta-Passport는 팬의 디지털 정체성과 멤버십, 이벤트 참여, 스탬프를 하나의 모바일 여권에 담아 Music Nation SMTOWN 세계관으로 연결했습니다.",
  ],
  [
    "Bringing fashion shopping and community into one mobile flow.",
    "쇼핑과 커뮤니티를 결합한 패션 커머스 서비스",
  ],
  [
    "iToo was a fashion commerce project for Lotte Homeshopping, combining shopping mall flows, product detail, purchase, return, and community features into one mobile-first experience.",
    "iToo는 롯데홈쇼핑의 패션 커머스 프로젝트입니다. 상품 탐색과 상세 정보 확인, 구매, 반품, 커뮤니티 기능을 하나의 모바일 경험으로 연결했습니다.",
  ],
  [
    "iToo connected mobile shopping mall functions with community-driven fashion content, giving shoppers a place to discover products, check details, purchase, return, and participate beyond the transaction.",
    "iToo는 모바일 쇼핑 기능과 커뮤니티 기반의 패션 콘텐츠를 연결했습니다. 사용자는 상품을 찾고 구매·반품하는 데서 나아가 거래 이후에도 콘텐츠에 참여할 수 있습니다.",
  ],
  [
    "Making wearable strength-training feedback easier to understand.",
    "웨어러블 근력 운동을 위한 피드백 서비스",
  ],
  [
    "PTBOT turns BLE-connected device and sensor data into clear feedback, helping users understand workout quality, intensity, and progress.",
    "PTBOT는 BLE로 연결된 기기와 센서 데이터를 알기 쉬운 피드백으로 보여줍니다. 사용자는 운동이 제대로 되고 있는지, 강도는 적절한지, 얼마나 나아졌는지를 확인할 수 있습니다.",
  ],
  [
    "Helping pet owners manage daily feeding through a connected app.",
    "반려동물의 급여 루틴을 관리하는 IoT 연동 서비스",
  ],
  [
    "Duit The Table links a connected pet-care device with mobile controls, helping guardians manage feeding routines and device interaction from the app.",
    "Duit The Table은 반려동물 급여 기기와 모바일 앱을 연결합니다. 보호자는 앱에서 급여 루틴을 관리하고 기기를 제어할 수 있습니다.",
  ],
  [
    "Turning virtual assets into points people can actually use.",
    "가상자산을 기업 포인트로 바꾸는 크립토 지갑 서비스",
  ],
  [
    "Metafin helps users manage virtual assets and convert them into company points that can be used like cash across connected services.",
    "Metafin은 가상자산을 관리하고, 연동 서비스에서 현금처럼 사용할 수 있는 기업 포인트로 전환하는 크립토 지갑 서비스입니다.",
  ],
  [
    "Extending photo-booth memories beyond the kiosk.",
    "포토부스 촬영 경험을 이어주는 사진 관리 서비스",
  ],
  [
    "Photoism helps users manage photo-booth memories, discover frames, prepare kiosk shoots, and keep photos and videos in My Album.",
    "Photoism은 포토부스에서 만든 추억을 관리하는 앱입니다. 프레임을 찾고 촬영을 준비하며, 촬영한 사진과 영상을 My Album에 보관할 수 있습니다.",
  ],
  [
    "Photoism helps users manage special memories, discover frames, prepare kiosk shoots, and automatically keep photos and videos in My Album.",
    "Photoism은 포토부스에서 만든 특별한 추억을 관리하는 앱입니다. 프레임 탐색과 촬영 준비부터 촬영한 사진과 영상을 My Album에 자동으로 보관하는 과정까지 하나로 연결했습니다.",
  ],
  [
    "Helping families compare education services through real reviews.",
    "학부모와 학생의 후기로 비교하는 교육 정보 서비스",
  ],
  [
    "YZYZ turns parent and student reviews into service analysis reports, themed rankings, and practical education-service information.",
    "YZYZ는 학부모와 학생의 후기를 바탕으로 분석 리포트와 테마별 순위, 실용적인 교육 정보를 제공합니다.",
  ],
  [
    "Helping fans make and share their own emoticons.",
    "팬이 직접 만들고 공유하는 커스텀 이모티콘 서비스",
  ],
  [
    "SmileMe helps users create and share custom emoticons using K-pop artist, celebrity, influencer, content, and sticker assets.",
    "SmileMe는 K-pop 아티스트와 셀럽, 인플루언서의 콘텐츠와 스티커를 활용해 나만의 이모티콘을 만들고 공유할 수 있는 서비스입니다.",
  ],
  [
    "Designing sensitive end-of-life support for families.",
    "임종 전후의 준비와 추모를 돕는 가족 지원 서비스",
  ],
  [
    "HI supports emotional and practical needs before and after passing away, while helping families create memorials for loved ones.",
    "HI는 임종 전후에 필요한 정서적·실질적 지원을 제공하고, 남은 가족이 고인을 위한 추모 공간을 만들 수 있도록 돕습니다.",
  ],
  ["Overview", "프로젝트 개요"],
  [
    "iToo was a Lotte Homeshopping fashion commerce project from 2022 Q1 to 2022 Q4 that combined shopping mall functions with community features. The work covered product discovery, product detail, purchase, shipping, return, refund, order tracking, and user-generated community touchpoints.",
    "iToo는 2022년 1분기부터 4분기까지 진행한 롯데홈쇼핑 패션 커머스 프로젝트입니다. 쇼핑몰 기능과 커뮤니티를 결합해 상품 탐색, 상세 정보, 구매, 배송, 반품, 환불, 주문 조회와 사용자 참여까지 하나의 흐름으로 설계했습니다.",
  ],
  [
    "My responsibility covered project management, UX structure, service planning, and UI design. The case study will focus on how commerce workflows and community participation were organized into one mobile-first shopping experience.",
    "프로젝트 관리, UX 구조 설계, 서비스 기획, UI 디자인을 맡았습니다. 커머스의 복잡한 이용 과정과 커뮤니티 참여가 하나의 모바일 경험 안에서 자연스럽게 이어지도록 설계했습니다.",
  ],
  [
    "Photoism is an app for managing and enjoying the special memories users create at Photoism. It connects moment registration, frame recommendations, shooting reviews, cart-to-kiosk preparation, My Album storage, frame requests, and frame news into one mobile experience.",
    "Photoism은 포토부스에서 만든 특별한 추억을 관리하고 즐기는 앱입니다. 모먼트 등록, 프레임 추천, 촬영 후기, 키오스크 촬영 준비, My Album 보관, 프레임 요청과 소식을 하나의 모바일 경험으로 연결했습니다.",
  ],
  [
    "My responsibility was design management. The case study will focus on how the app supports the full photo-booth journey, from discovering a frame before shooting to automatically saving photos and videos after kiosk use.",
    "디자인 매니지먼트를 맡았습니다. 촬영 전에 프레임을 찾는 과정부터 키오스크 촬영 뒤 사진과 영상을 자동으로 저장하는 과정까지, 전체 포토부스 경험을 앱으로 연결했습니다.",
  ],
  [
    "Canbu started from the friction and limitations of existing community channels for Koreans living in Canada. The goal was to create a service where Korean residents could help each other and make better everyday decisions through trustworthy local information.",
    "Canbu는 캐나다 거주 한인들이 기존 커뮤니티 채널에서 겪는 불편과 한계에서 시작했습니다. 신뢰할 수 있는 지역 정보를 바탕으로 서로 도움을 주고받으며, 일상에서 더 나은 결정을 내릴 수 있는 서비스를 만드는 것이 목표였습니다.",
  ],
  [
    "My responsibility was design. The team promoted the service through marketing events and offline visits to local Korean markets, and also verified discounted items in person to improve the accuracy of local deal information. Canbu has grown past 2,000 users and is becoming a representative Korean community service in Canada.",
    "저는 디자인을 맡았습니다. 팀은 마케팅 행사와 현지 한인 마트 방문을 통해 서비스를 알렸고, 할인 상품을 직접 확인해 지역 할인 정보의 정확도를 높였습니다. Canbu는 2,000명 이상의 사용자를 확보했고, 캐나다의 대표적인 한인 커뮤니티 서비스로 성장하고 있습니다.",
  ],
  [
    "HI was part of an internal venture project at KT. The service was designed to support people with emotional and practical needs before and after passing away, and to help family members who are left behind create memorials.",
    "HI는 KT 사내 벤처 프로젝트로, 임종 전후에 필요한 정서적·실질적 지원을 제공하고 남은 가족이 추모 공간을 만들 수 있도록 설계한 서비스입니다.",
  ],
  [
    "My responsibility was product design. The case study will focus on how a sensitive end-of-life service can organize preparation, remembrance, practical support, and family-facing memorial creation into one experience.",
    "프로덕트 디자인을 맡았습니다. 민감한 주제를 다루는 만큼, 이별을 준비하는 과정과 실질적인 지원, 남은 가족이 추모 공간을 만드는 과정이 자연스럽게 이어지도록 설계했습니다.",
  ],
  [
    "Metafin Company was established by KG Inicis to enter the blockchain and virtual-asset payment market. The service direction focused on a crypto wallet experience where users could manage virtual assets and convert them into company points.",
    "Metafin Company는 KG이니시스가 블록체인과 가상자산 결제 시장에 진출하기 위해 설립한 회사입니다. 사용자가 가상자산을 관리하고 기업 포인트로 전환할 수 있는 크립토 지갑 경험에 초점을 맞췄습니다.",
  ],
  [
    "My responsibility was product design. The case study will focus on how wallet balance, asset conversion, point usability, and payment-ready flows were translated into a clearer fintech product experience.",
    "프로덕트 디자인을 맡았습니다. 지갑 잔액 확인, 자산 전환, 포인트 사용, 결제 준비 과정을 더 명확하고 이해하기 쉬운 핀테크 경험으로 정리했습니다.",
  ],
  [
    "Butler was a 2023 Q3 fintech service project for individual investors who need to make sense of dense company information. The service brings together visualized company data, public disclosures, IR materials, analyst-style reports, news, screeners, watchlists, and portfolio workflows.",
    "Butler는 복잡한 기업 정보를 확인해야 하는 개인 투자자를 위해 2023년 3분기에 진행한 핀테크 서비스 프로젝트입니다. 시각화한 기업 데이터, 공시, IR 자료, 분석 리포트, 뉴스, 스크리너, 관심 종목, 포트폴리오 관리 기능을 한곳에 모았습니다.",
  ],
  [
    "The case study will focus on how the product helps users move from scattered market information to a more scan-friendly research and monitoring flow.",
    "흩어진 시장 정보를 빠르게 훑어보고 필요한 기업을 조사·모니터링할 수 있는 흐름으로 정리했습니다.",
  ],
  [
    "SmileMe was a Danal Entertainment mobile platform for creating and sharing custom emoticons. The service used K-pop artist, celebrity, influencer, content, and sticker assets to help users make personal expressive content instead of only consuming pre-made items.",
    "SmileMe는 나만의 이모티콘을 만들고 공유할 수 있는 다날엔터테인먼트의 모바일 플랫폼입니다. K-pop 아티스트와 셀럽, 인플루언서의 콘텐츠와 스티커를 활용해 완성된 이모티콘을 소비하는 데서 나아가 사용자가 직접 자신만의 표현을 만들 수 있도록 했습니다.",
  ],
  [
    "My responsibility was product design. The case study will focus on how the creation flow, asset discovery, market structure, and personal collection/shopping areas were organized into one mobile experience.",
    "프로덕트 디자인을 맡았습니다. 이모티콘 제작, 소재 탐색, 마켓, 개인 컬렉션과 쇼핑 영역을 하나의 모바일 경험으로 연결했습니다.",
  ],
  [
    "Duit The Table was a mobile app project connected to an IoT pet-care device. Duit's brand context centers on connecting people and pets, and The Table sits in the connected feeding-device experience.",
    "Duit The Table은 IoT 반려동물 돌봄 기기와 연결되는 모바일 앱 프로젝트입니다. 사람과 반려동물을 연결한다는 Duit의 브랜드 방향을 바탕으로, 급여 기기와 앱을 함께 사용하는 경험을 설계했습니다.",
  ],
  [
    "My responsibility was design management. The case study will focus on how the app supports device-linked controls, everyday feeding routines, and a mobile experience that helps guardians care for pets through connected hardware.",
    "디자인 매니지먼트를 맡았습니다. 앱에서 기기를 제어하고 일상적인 급여 루틴을 관리할 수 있도록 하드웨어와 모바일 경험을 하나의 흐름으로 연결했습니다.",
  ],
  [
    "Pawdle is a BeroAI service that helps dog owners discover their dog's unique personality and understand behavior more clearly. The product direction centers on insights, tips, and tools that strengthen the bond between dogs and owners.",
    "Pawdle은 보호자가 반려견의 고유한 성격을 발견하고 행동을 더 잘 이해할 수 있도록 돕는 BeroAI 서비스입니다. 반려견과 보호자의 유대감을 높이는 인사이트와 팁, 도구를 중심으로 설계했습니다.",
  ],
  [
    "My responsibility covered product ownership and product design. The case study will focus on how personality insights, care guidance, and owner-facing education were organized into a friendly pet-care service experience.",
    "프로덕트 오너와 프로덕트 디자이너 역할을 함께 맡았습니다. 성격 인사이트와 돌봄 가이드, 보호자 교육 콘텐츠를 친근한 반려동물 돌봄 경험으로 연결했습니다.",
  ],
  [
    "SMTOWN Meta-Passport is a digital passport service for SM Entertainment fans, built around the Music Nation SMTOWN concept. The product gives fans a digital identity and connects membership, event participation, stamps, and visa-style information into one mobile experience.",
    "SMTOWN Meta-Passport는 Music Nation SMTOWN 세계관을 바탕으로 만든 SM엔터테인먼트 팬을 위한 디지털 여권 서비스입니다. 팬에게 디지털 ID를 부여하고 멤버십, 이벤트 참여, 스탬프, 비자 형식의 정보를 하나의 모바일 경험으로 연결했습니다.",
  ],
  [
    "My responsibility was design management. The case study will focus on how the visual direction and mobile experience were organized around fandom identity, collectible participation, and the connection between online and offline SM events.",
    "디자인 매니지먼트를 맡아 팬덤 정체성과 수집의 재미를 비주얼에 담고, 온라인 활동이 오프라인 SM 이벤트 참여로 이어지도록 비주얼 방향과 모바일 경험을 설계했습니다.",
  ],
  [
    "PTBOT was an Android app for a wearable strength-training robot. Its core purpose was to help users understand whether they were exercising correctly by collecting device data and returning meaningful workout feedback through the app.",
    "PTBOT는 웨어러블 근력 운동 로봇을 위한 Android 앱입니다. 기기 데이터를 수집해 의미 있는 운동 피드백으로 보여주고, 사용자가 운동을 제대로 하고 있는지 확인할 수 있도록 설계했습니다.",
  ],
  [
    "My responsibility was project management. The work coordinated app requirements, BLE communication logic, app server collaboration, and visualization flows for exercise quality, resistance, assistance, and workout-history feedback.",
    "프로젝트 관리를 맡아 앱 요구사항, BLE 통신 로직, 앱 서버 협업을 조율했습니다. 운동 수행 상태와 저항·보조 강도, 운동 기록을 이해하기 쉽게 보여주는 시각화 흐름도 함께 정리했습니다.",
  ],
  [
    "YZYZ is an education information app that helps consumers understand services through stories from people who experienced them in the field. It covers subjects such as academies, home-visit education, English kindergartens, and digital learning.",
    "YZYZ는 실제 이용자의 경험을 바탕으로 교육 서비스를 이해할 수 있도록 돕는 정보 앱입니다. 학원, 방문 교육, 영어 유치원, 디지털 학습 등 다양한 교육 서비스를 다룹니다.",
  ],
  [
    "The service provides review-based analysis reports, themed rankings, and direct consumer reviews from parents and students, helping users compare education services and make more informed choices.",
    "후기 기반의 분석 리포트와 테마별 순위, 학부모와 학생이 직접 작성한 리뷰를 제공합니다. 사용자는 여러 교육 서비스를 비교하고 자신에게 맞는 선택을 할 수 있습니다.",
  ],
  [
    "BeroAI is an AI IoT pet communication service built around a smart collar and companion app. The service had to turn collar signals into a useful answer: what may be happening, what the owner can do now, and how care can continue over time.",
    "BeroAI는 스마트 목걸이와 앱으로 반려견의 행동 신호를 해석하는 AI IoT 서비스입니다. 단순히 데이터를 보여주는 것으로는 부족했습니다. 보호자가 ‘지금 무슨 일이 일어나고 있지?’, ‘내가 무엇을 해야 하지?’에 답을 얻고, 이후의 돌봄까지 이어갈 수 있어야 했습니다.",
  ],
  [
    "I led product strategy, app UX/UI, AI communication logic, and avatar interaction. In parallel, I designed a pre-order site to explain the product and capture early demand; it supported the launch without becoming part of the app service.",
    "저는 제품 전략, 앱 UX/UI, AI 커뮤니케이션 로직, 아바타 인터랙션을 맡았습니다. 사전 주문 사이트는 앱 서비스와 분리해, 제품의 쓰임을 설명하고 초기 수요를 확인하는 출시 경험으로 설계했습니다.",
  ],
  [
    "Reframed BeroAI from a tracking device into an AI communication service.",
    "BeroAI를 활동량만 보여주는 추적 기기가 아니라, 행동 신호의 맥락을 설명하는 AI 커뮤니케이션 서비스로 정의했습니다.",
  ],
  [
    "Mapped categories for emotion, behavior, and needs with the AI team so interpretation could become usable product logic.",
    "AI 팀과 감정·행동·욕구 체계를 정리하고, 해석 결과를 아바타·아이콘·채팅에 쓰일 제품 로직으로 바꿨습니다.",
  ],
  [
    "Structured the app around Understand, Respond, and Bond loops.",
    "앱은 이해하기, 대응하기, 유대 쌓기로 이어지는 세 가지 흐름으로 설계했습니다.",
  ],
  ["Problem", "해결해야 했던 문제"],
  [
    "Dog owners can see activity, camera footage, or health numbers. The hard part is deciding what a change means and whether it needs a response.",
    "활동량과 카메라 영상, 건강 수치를 볼 수 있어도 변화의 의미를 바로 알기는 어렵습니다. 평소와 다른 행동이 왜 나타났는지, 지금 대응해야 하는지를 판단하기는 더 어렵습니다.",
  ],
  [
    "BeroAI therefore had to explain context and next steps without pretending that AI could know a dog's inner state.",
    "그래서 BeroAI는 AI가 반려견의 속마음을 정확히 안다고 말하지 않으면서도, 관찰한 신호와 가능한 맥락, 보호자가 할 수 있는 다음 행동을 함께 설명해야 했습니다.",
  ],
  ["Research", "화면 설계 전에 확인한 것"],
  [
    "Before designing screens, I used a Pre-PRD questionnaire to turn the broad idea of an AI pet communicator into explicit product decisions. It covered owner uncertainty, dog-signal taxonomy, explanation logic, privacy, reliability, and responsible engagement.",
    "화면을 그리기 전에 Pre-PRD 질문지를 만들어 ‘AI로 반려동물과 소통한다’는 아이디어를 구체적인 제품 결정으로 바꿨습니다. 보호자의 불확실성, 반려견 신호 분류, 설명 방식, 개인정보 보호, 신뢰성, 책임 있는 사용 조건을 다뤘습니다.",
  ],
  [
    "This was an internal product-definition exercise, not a usability study. Its purpose was to expose assumptions and align the product and AI teams before interface design.",
    "사용성 테스트 결과는 아니었습니다. 화면을 설계하기 전에 제품팀과 AI 팀이 같은 가정을 보고, 무엇부터 검증할지 맞추기 위한 내부 제품 정의 과정이었습니다.",
  ],
  ["Product Positioning", "제품의 약속 정하기"],
  [
    "For BeroAI to earn trust, I first had to set the boundary of its promise. Rather than claim perfect dog translation, I framed it as a service that interprets patterns, explains possible context, and helps owners respond at a better time.",
    "BeroAI가 신뢰를 얻으려면 먼저 제품의 약속에 경계를 세워야 했습니다. ‘반려견의 말을 완벽하게 번역한다’고 말하는 대신, 관찰된 패턴과 가능한 맥락을 설명하고 보호자가 더 적절한 때에 대응하도록 돕는 서비스로 정의했습니다.",
  ],
  ["Service Architecture", "서비스의 세 가지 반복 구조"],
  [
    "I organized the product around three connected loops: understand the dog's state, respond with an appropriate action, and build the bond through repeated care, training, and rewards.",
    "앱은 세 가지 흐름이 이어지도록 설계했습니다. 반려견의 상태를 이해하고, 알맞은 행동으로 대응하고, 돌봄과 훈련을 반복하며 유대감을 쌓는 흐름입니다.",
  ],
  ["AI Communication UX", "AI 해석을 설명하는 방법"],
  [
    "The Chat Room became the explanation layer. Need icons show immediate states such as hunger, potty, or thirst; Chat explains the context, the deviation, and why a response may help.",
    "배고픔, 배변, 갈증처럼 바로 확인해야 하는 상태는 아이콘으로 빠르게 보여줬습니다. 왜 그런 신호가 나타났는지, 평소와 무엇이 다른지는 Chat Room에서 설명했습니다.",
  ],
  [
    "Each message moved through a scenario: trigger, interpretation, owner action, and resolution. It needed enough reasoning to feel credible without implying that the system knew the dog's exact inner state.",
    "각 메시지는 신호, 해석, 보호자의 행동, 결과 순서로 이어집니다. 반려견의 속마음을 정확히 안다고 단정하지 않으면서도, 왜 이런 안내를 하는지는 이해할 수 있어야 했습니다.",
  ],
  ["Care Home Experience", "한눈에 상태를 보여주는 Care Home"],
  [
    "Care Home became the app's primary status surface. It answers the owner's first question: what is happening right now? The answer appears through the avatar, status cards, chat preview, and quick actions.",
    "Care Home은 앱에서 가장 먼저 보는 상태 화면입니다. 보호자가 가장 궁금해하는 ‘지금 무슨 일이 일어나고 있지?’에 아바타, 상태 카드, 채팅 미리보기, 빠른 실행으로 답했습니다.",
  ],
  ["Dog Space Structure", "유대감을 쌓는 Dog Space"],
  [
    "Dog Space was designed as the bonding loop. It makes the product feel playful while keeping customization, rewards, and return paths connected to care, walking, training, and repeated visits.",
    "Dog Space는 보호자와 반려견이 유대감을 쌓는 공간입니다. 꾸미기와 보상을 돌봄, 산책, 훈련에 연결해 놀이 요소가 서비스의 목적에서 벗어나지 않도록 했습니다.",
  ],
  ["Map and Training Systems", "이해에서 행동으로"],
  [
    "Map and Training gave the service an action layer. Owners could move from understanding a signal to doing something useful outdoors, during practice, or in daily routines.",
    "Map과 Training은 이해한 내용을 실제 행동으로 옮기는 기능입니다. 보호자가 산책이나 훈련, 일상에서 바로 해볼 수 있는 행동을 제안했습니다.",
  ],
  ["Pre-order Website and Funnel", "새로운 제품을 설명하고 수요 확인하기"],
  [
    "The pre-order site needed to define a new category, answer trust questions, and collect measurable demand. I led with owner uncertainty and concrete care scenarios before moving into product details and conversion.",
    "사전 주문 사이트는 낯선 제품을 설명하고, 구매 전에 생기는 질문에 답하고, 초기 수요를 확인해야 했습니다. 기능을 먼저 나열하기보다 보호자가 겪는 상황과 제품이 필요한 이유를 보여준 뒤 사전 주문으로 이어지게 했습니다.",
  ],
  ["Launch Outcome", "출시 준비도로 결과 확인하기"],
  [
    "The pre-order site launched, and the mobile prototype reached a defined product logic. That shows launch readiness, not product-market success.",
    "사전 주문 사이트는 실제로 출시했고, 모바일 앱은 주요 화면과 동작 원리를 프로토타입 수준까지 정의했습니다. 여기서 확인한 건 출시 준비도이지, 시장 성과나 장기 사용성은 아닙니다.",
  ],
  [
    "Verified: BeroAI's value, service boundaries, and core app structure were defined.",
    "확인한 것: BeroAI의 가치와 서비스 범위, 핵심 앱 구조를 정의했습니다.",
  ],
  [
    "Verified: The product and AI teams shared an Emotion-Behavior-Needs mapping and scenario logic.",
    "확인한 것: 제품팀과 AI 팀이 감정·행동·욕구 매핑과 시나리오 로직을 같은 기준으로 보게 됐습니다.",
  ],
  [
    "Verified: The pre-order site launched with lead capture and trust-building FAQ content.",
    "확인한 것: 수요 확인 흐름과 FAQ를 갖춘 사전 주문 사이트를 출시했습니다.",
  ],
  [
    "Not yet verified: interpretation accuracy, real-world care outcomes, retention, and conversion performance.",
    "아직 확인하지 못한 것: AI 해석 정확도, 실제 돌봄 변화, 재방문, 사전 주문 전환 성과는 이후 검증이 필요합니다.",
  ],
  ["Reflection", "돌아보며"],
  [
    "AI product design is not about making intelligence visible for its own sake. It is about helping people understand what the system is telling them, where its confidence stops, and what they can do next. In BeroAI, that meant connecting hardware signals, AI interpretation, and app experience into one service, while giving the separate pre-order site a clear way to explain that service.",
    "이 프로젝트에서 다시 확인한 건, AI 제품 디자인의 역할은 지능을 드러내는 데 있지 않다는 점입니다. 사용자가 시스템이 무엇을 알려주는지, 어디까지 믿을 수 있는지, 다음에 무엇을 할 수 있는지 이해하게 해야 합니다. BeroAI에서는 하드웨어 신호와 AI 해석, 앱 경험을 하나로 연결하고, 사전 주문 사이트는 그 서비스를 설명하는 별도 경험으로 남겼습니다.",
  ],
  ["The product question", "무엇을 알려주고, 어디까지 말할 것인가"],
  ["The question behind the product", "데이터보다 어려운 건 의미를 설명하는 일이었습니다"],
  ["The questions that shaped the product", "제품을 만들기 전에 확인한 질문"],
  ["Set the promise before designing the interface", "화면을 만들기 전에 제품의 약속부터 정하기"],
  ["Three loops: understand, respond, bond", "이해하고, 대응하고, 유대 쌓는 세 가지 흐름"],
  ["Show the signal, then explain the context", "신호를 보여주고 맥락을 설명하기"],
  ["Answer the first question first", "가장 먼저 궁금한 질문에 답하기"],
  ["Keep bonding tied to care", "유대감도 돌봄과 연결하기"],
  ["Turn understanding into action", "이해한 내용을 행동으로 옮기기"],
  ["Explain the product before asking for a pre-order", "사전 주문 전에 제품의 필요성 설명하기"],
  ["What was ready, and what still needed validation", "출시한 것과 아직 검증하지 못한 것"],
  ["What this changed in my view of AI design", "AI 제품 디자인에 대해 다시 확인한 것"],
  ["Raw signals had to become guidance that an owner could understand.", "목걸이가 모은 원시 신호는 보호자가 이해할 수 있는 안내로 바뀌어야 했습니다."],
  ["AI interpretations had to communicate likelihood, not certainty.", "AI 해석은 확정된 답이 아니라 가능성으로 전달해야 했습니다."],
  ["The product story had to establish value before asking for a pre-order.", "사전 주문을 요청하기 전에 제품이 왜 필요한지 먼저 설명해야 했습니다."],
  ["The avatar and status cards summarize the current state before exposing raw metrics.", "아바타와 상태 카드는 원시 수치보다 먼저 현재 상태를 요약해 보여줍니다."],
  [
    "Chat Preview shows the latest explanation behind a behavior change and opens the full Chat Room when more context is needed.",
    "Chat Preview는 행동 변화에 대한 최신 설명을 보여주고, 더 많은 맥락이 필요할 때 Chat Room으로 이어집니다.",
  ],
  [
    "Quick Actions lead to a relevant care or training response, while device and account controls remain secondary.",
    "Quick Action은 돌봄이나 훈련으로 바로 이어지게 하고, 기기와 계정 설정은 보조 영역에 두었습니다.",
  ],
  [
    "The room and avatar reflect the dog's recent context and provide a consistent place to return to.",
    "공간과 아바타는 반려견의 최근 상태를 반영하고, 사용자가 계속 돌아올 수 있는 기준점이 됩니다.",
  ],
  [
    "Customization and rewards stay connected to walks, training, and records rather than becoming a separate game.",
    "꾸미기와 보상은 별도 게임이 되지 않도록 산책, 훈련, 기록과 연결했습니다.",
  ],
  [
    "Closing Dog Space returns to Care Home, and blocked states lead to a clear recovery path.",
    "Dog Space를 닫으면 Care Home으로 돌아가고, 막힌 상태에서는 복구 방법을 분명히 보여줍니다.",
  ],
  [
    "Walk insights turn routes into behavior patterns through heatmaps, sniffing signals, stress zones, and reports.",
    "산책 인사이트는 히트맵, 냄새 탐색 신호, 스트레스 구역, 리포트를 통해 경로를 행동 패턴으로 바꿔 보여줍니다.",
  ],
  [
    "Safety features surface nearby risks through alerts, privacy zones, and status indicators.",
    "안전 기능은 알림, 프라이버시 구역, 상태 표시를 통해 주변 위험을 알려줍니다.",
  ],
  [
    "Training progresses from foundational commands to socialization, alone training, and behavior support.",
    "훈련은 기본 명령에서 시작해 사회화, 혼자 있기, 행동 지원으로 이어집니다.",
  ],
  ["Area", "항목"],
  ["Scope", "내용"],
  ["Product", "제품"],
  [
    "Bero Smart Collar — AI IoT pet communication service built around a smart collar and companion app",
    "Bero Smart Collar — 스마트 목걸이와 모바일 앱을 중심으로 만든 AI IoT 반려견 커뮤니케이션 서비스",
  ],
  ["Role", "역할"],
  [
    "Product Designer, Product Strategy, Service Design, UX/UI Design",
    "프로덕트 디자인 · 제품 전략 · 서비스 디자인 · UX/UI 디자인",
  ],
  ["Output", "주요 산출물"],
  [
    "App IA and flows, mobile screen system, Emotion-Behavior-Needs mapping, scenario logic, pre-order site and demand-capture flow",
    "앱 정보 구조와 사용자 흐름, 모바일 화면 체계, 감정·행동·욕구 매핑, 시나리오 로직, 사전 주문 사이트와 수요 확인 흐름",
  ],
  ["Status", "진행 상태"],
  ["Pre-order site launched; mobile prototype logic defined", "사전 주문 사이트 출시, 모바일 프로토타입 로직 정의"],
  ["Tension", "고려할 점"],
  ["Design challenge", "디자인 과제"],
  ["Raw data vs meaning", "신호와 의미 사이의 거리"],
  [
    "Turn barking, movement, location, and routine signals into understandable owner guidance.",
    "짖음, 움직임, 위치, 일상 패턴 신호를 보호자가 이해할 수 있는 안내로 바꿉니다.",
  ],
  ["AI promise vs trust", "AI의 약속과 신뢰"],
  [
    "Communicate possibilities and context without overclaiming that AI can know everything.",
    "AI가 모든 것을 안다고 과장하지 않으면서, 가능성과 맥락을 전달합니다.",
  ],
  ["New category vs conversion", "낯선 제품과 사전 주문 전환"],
  [
    "Explain the product's value before asking visitors to pre-order.",
    "사전 주문을 요청하기 전에 제품의 가치를 설명합니다.",
  ],
  ["Decision area", "의사결정 영역"],
  ["Questions explored", "확인한 질문"],
  ["How it shaped the product", "제품에 반영한 점"],
  ["Owner uncertainty", "보호자의 불확실성"],
  [
    "What owners need to know when they are away, walking, or seeing unusual behavior.",
    "외출 중이거나 산책할 때, 평소와 다른 행동을 봤을 때 보호자가 알고 싶어 하는 것은 무엇인지 확인했습니다.",
  ],
  [
    "Framed BeroAI around practical care moments instead of device novelty.",
    "기기 자체의 새로움이 아니라 실제 돌봄이 필요한 순간을 중심으로 BeroAI를 정의했습니다.",
  ],
  ["Emotion, behavior, and needs", "감정, 행동, 욕구"],
  [
    "Which emotional states, behavior labels, needs, and conflict rules the AI should support.",
    "AI가 다뤄야 할 감정 상태, 행동 분류, 욕구와 신호가 충돌할 때의 기준을 정리했습니다.",
  ],
  [
    "Created the shared mapping for avatar states, need icons, and chat explanations.",
    "아바타 상태, 욕구 아이콘, 채팅 설명이 같은 기준으로 움직이도록 매핑을 만들었습니다.",
  ],
  ["Narrative and reports", "기록과 리포트"],
  [
    "How behavior, emotion, activity, and needs should become diaries, trends, and alerts.",
    "행동, 감정, 활동량, 욕구를 일지, 변화 추이, 알림으로 어떻게 보여줄지 살폈습니다.",
  ],
  [
    "Shifted History and Report from metric dumping to explanations of change.",
    "History와 Report에서 수치를 나열하는 대신, 어떤 변화가 있었는지 설명하도록 바꿨습니다.",
  ],
  ["Trust, privacy, and reliability", "신뢰, 개인정보 보호, 안정성"],
  [
    "How to handle consent, AI data use, signal loss, confidence thresholds, and latency.",
    "동의, AI 데이터 사용, 신호 끊김, 신뢰도 기준, 지연 시간을 어떻게 다룰지 확인했습니다.",
  ],
  [
    "Set the rule that BeroAI should communicate context and likelihood, not certainty.",
    "BeroAI는 확정적인 답 대신 상황의 맥락과 가능성을 전달한다는 기준을 세웠습니다.",
  ],
  ["Care loops and engagement", "돌봄 흐름과 재방문"],
  [
    "What Auto Cue, scoring, rewards, and Dog Space should encourage or avoid.",
    "Auto Cue, 점수, 보상, Dog Space가 어떤 행동을 북돋거나 피해야 하는지 정리했습니다.",
  ],
  [
    "Kept engagement tied to responsible care actions, not shallow gamification.",
    "가벼운 게임 요소에 머물지 않도록, 재방문 경험을 책임 있는 돌봄 행동과 연결했습니다.",
  ],
  ["Instead of", "기존의 설명"],
  ["I positioned BeroAI as", "BeroAI를 이렇게 정의했습니다"],
  ["A smart collar that tracks activity", "활동량을 추적하는 스마트 목걸이"],
  [
    "A service that turns dog behavior signals into context and care guidance.",
    "반려견의 행동 신호를 상황의 맥락과 돌봄 안내로 바꾸는 서비스",
  ],
  ["An AI that \"translates\" dogs perfectly", "반려견의 말을 완벽하게 번역하는 AI"],
  [
    "An AI communicator that helps owners interpret patterns and respond with better timing.",
    "보호자가 패턴을 해석하고 더 적절한 때에 대응하도록 돕는 AI 커뮤니케이터",
  ],
  ["A price-led launch message", "가격을 앞세운 출시 메시지"],
  [
    "A trust-led story that shows why the product matters before asking users to pre-order.",
    "사전 주문을 요청하기 전에 제품이 왜 필요한지 설명하는 신뢰 중심의 이야기",
  ],
  ["Layer", "구성 요소"],
  ["Purpose", "하는 일"],
  ["Experience output", "사용자에게 보이는 결과"],
  ["Smart collar", "스마트 목걸이"],
  [
    "Collect behavior, motion, sound, location, and routine signals.",
    "행동, 움직임, 소리, 위치, 일상 패턴 신호를 수집합니다.",
  ],
  ["Raw signals and confidence limits", "원시 신호와 신뢰도 한계"],
  ["AI interpretation and mapping", "AI 해석과 매핑"],
  [
    "Translate signal patterns into emotion, behavior, needs, and likely context.",
    "신호 패턴을 감정, 행동, 욕구, 가능성 있는 맥락으로 해석합니다.",
  ],
  ["Avatar state, need icon, chat explanation", "아바타 상태, 욕구 아이콘, 채팅 설명"],
  ["Care surfaces", "돌봄 화면"],
  [
    "Make the dog's status and next action visible in the app.",
    "반려견의 상태와 보호자의 다음 행동을 앱에서 확인할 수 있게 합니다.",
  ],
  ["Care Home, Chat Room, History", "Care Home, Chat Room, History"],
  ["Action systems", "행동 지원 기능"],
  [
    "Support outdoor safety, activity records, training practice, and repeat engagement.",
    "야외 안전, 활동 기록, 훈련 연습, 반복적인 사용을 돕습니다.",
  ],
  ["Walk report, route insight, training journey, missions", "산책 리포트, 경로 인사이트, 훈련 과정, 미션"],
  ["Scenario", "상황"],
  ["Signal pattern", "신호 패턴"],
  ["Owner-facing interpretation", "보호자에게 전달하는 설명"],
  ["Unfamiliar noise", "낯선 소리"],
  ["Unusual sound, fixed head direction, barking", "평소와 다른 소리, 한쪽에 고정된 시선, 짖음"],
  [
    "The dog may be alert because of an unfamiliar sound outside.",
    "바깥의 낯선 소리에 반응해 경계하고 있을 수 있습니다.",
  ],
  ["Activity-based hunger", "활동량에 따른 배고픔"],
  [
    "High activity, mealtime proximity, continued hunger cues",
    "평소보다 많은 활동, 다가오는 식사 시간, 계속되는 배고픔 신호",
  ],
  [
    "The need icon can show hunger; Chat explains why it may be happening earlier than usual.",
    "욕구 아이콘은 배고픔을 보여주고, Chat은 평소보다 이른 이유를 설명합니다.",
  ],
  ["Separation anxiety", "보호자가 없을 때 느끼는 불안"],
  ["Frozen posture near entrance, micro howling, owner away", "현관 근처의 굳은 자세, 작은 하울링, 보호자 부재"],
  [
    "The dog may be waiting anxiously and reacting to outside footsteps.",
    "보호자를 기다리며 불안해하고, 바깥 발소리에 반응하고 있을 수 있습니다.",
  ],
  ["Surface", "화면 요소"],
  ["UX role", "UX 역할"],
  ["Primary transition", "이어지는 행동"],
  ["Avatar status", "아바타 상태"],
  [
    "Shows visible state, emotion, and care context without exposing raw metrics first.",
    "원시 수치를 먼저 보여주지 않고, 눈에 보이는 상태와 감정, 돌봄 맥락을 전달합니다.",
  ],
  ["Inspect status detail or quick actions.", "상세 상태를 보거나 빠른 실행으로 이어집니다."],
  ["Chat Preview", "채팅 미리보기"],
  [
    "Surfaces the latest interpretation behind a behavior change.",
    "행동 변화 뒤에 있는 최신 해석을 바로 보여줍니다.",
  ],
  ["Open Chat Room for history and response actions.", "이력과 대응 방법을 보려면 Chat Room으로 이동합니다."],
  ["Quick Action", "빠른 실행"],
  [
    "Lets owners respond quickly to needs such as walk, wait, stop, training, or care prompts.",
    "산책, 기다리기, 멈추기, 훈련, 돌봄 안내처럼 필요한 행동에 빠르게 대응하게 합니다.",
  ],
  [
    "Trigger an action, start a related flow, or close a resolved scenario.",
    "행동을 시작하거나 관련 흐름으로 이어지고, 해결한 상황은 마무리할 수 있습니다.",
  ],
  ["Utility access", "설정과 기기 상태"],
  [
    "Keeps profile, notification, and device controls reachable without turning the home screen into a settings page.",
    "홈 화면이 설정 화면처럼 복잡해지지 않으면서, 프로필·알림·기기 제어에 접근할 수 있게 합니다.",
  ],
  [
    "Open dog profile, alerts, collar connection, battery, or account settings.",
    "반려견 프로필, 알림, 목걸이 연결 상태, 배터리, 계정 설정을 확인할 수 있습니다.",
  ],
  ["Connected flow", "연결되는 흐름"],
  ["Room and avatar", "공간과 아바타"],
  [
    "Gives the dog a persistent place while reflecting recent dog context.",
    "반려견에게 계속 돌아올 수 있는 공간을 만들고, 최근 상태를 아바타에 반영합니다.",
  ],
  [
    "Enter from Care Home, History rewards, push links, or item events.",
    "Care Home, History 보상, 푸시 링크, 아이템 이벤트에서 들어올 수 있습니다.",
  ],
  ["Customization", "꾸미기"],
  [
    "Supports consumables, custom skins, room items, and reward-based collection.",
    "소모품, 커스텀 스킨, 공간 아이템, 보상 기반 수집을 지원합니다.",
  ],
  [
    "Items can be earned from walks, training, records, or purchased as custom assets.",
    "아이템은 산책, 훈련, 기록으로 얻거나 꾸미기 자산으로 구매할 수 있습니다.",
  ],
  ["Return and recovery", "복귀와 오류 복구"],
  [
    "Defines how users close Dog Space, recover from blocked states, or return after an external event.",
    "Dog Space를 나가는 방법, 막힌 상태에서 복구하는 방법, 외부 이벤트 뒤 돌아오는 흐름을 정합니다.",
  ],
  ["Close returns to Care Home; errors route to a clear recovery UI.", "닫으면 Care Home으로 돌아가고, 오류가 나면 복구 방법을 분명히 보여줍니다."],
  ["System", "기능"],
  ["Direction", "설계 방향"],
  ["Example features", "예시 기능"],
  ["Walk insight", "산책 인사이트"],
  ["Turn walks into behavior patterns, not just paths.", "산책을 단순한 경로가 아니라 행동 패턴으로 이해하게 합니다."],
  ["Behavior heatmap, sniff index, stress zones, walk report", "행동 히트맵, 냄새 탐색 지수, 스트레스 구역, 산책 리포트"],
  ["Safety layer", "안전 기능"],
  ["Help owners understand nearby risks during outdoor activity.", "야외 활동 중 주변의 위험을 이해하도록 돕습니다."],
  ["Safety pins, danger alerts, privacy zone, status badge", "안전 지점, 위험 알림, 프라이버시 구역, 상태 배지"],
  ["Training curriculum", "훈련 과정"],
  [
    "Structure learning from foundational commands to advanced care and behavior support.",
    "기본 명령부터 돌봄과 행동 지원까지, 훈련이 이어지는 과정을 만듭니다.",
  ],
  ["Name recognition, recall, leash walking, socialization, alone training", "이름 인식, 돌아오기, 리드줄 산책, 사회화, 혼자 있기 훈련"],
  ["Funnel layer", "사전 주문 흐름"],
  ["Design decision", "설계 결정"],
  ["Why it mattered", "이유"],
  ["Hero and story", "첫 화면과 제품 이야기"],
  ["Lead with owner uncertainty and the value of understanding the dog.", "보호자가 느끼는 불확실성과 반려견을 이해하는 가치를 먼저 보여줍니다."],
  ["Make the new product category emotionally legible in the first screen.", "낯선 제품이 무엇을 돕는지 첫 화면에서 이해하게 합니다."],
  ["Lead capture", "신청 정보 받기"],
  [
    "Collect email, region, optional dog profile fields, and key conversion events.",
    "이메일, 지역, 선택형 반려견 프로필과 주요 전환 이벤트를 수집합니다.",
  ],
  ["Support segmentation and measurable demand.", "대상별 반응을 구분하고, 수요를 확인합니다."],
  ["FAQ and policy", "FAQ와 정책"],
  [
    "Address shipping, refunds, subscriptions, hardware fit, warranty, coverage, privacy, and support.",
    "배송, 환불, 구독, 목걸이 착용 조건, 보증, 사용 가능 범위, 개인정보 보호, 고객 지원에 답합니다.",
  ],
  ["Reduce purchase anxiety for an early hardware and AI service.", "초기 하드웨어·AI 서비스에 대한 구매 불안을 낮춥니다."],
  ["Coming soon", "상세 내용 준비 중"],
  [
    "Detailed process, role, UX decisions, and outcomes will be added later.",
    "상세 과정과 역할, UX 의사결정, 결과를 추후 업데이트할 예정입니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full YZYZ case study is being prepared.",
    "YZYZ의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Butler case study is being prepared.",
    "Butler의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Photoism case study is being prepared.",
    "Photoism의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full KG Inicis Metafin case study is being prepared.",
    "KG Inicis Metafin의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full iToo case study is being prepared.",
    "iToo의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Duit The Table case study is being prepared.",
    "Duit The Table의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full KT HI case study is being prepared.",
    "KT HI의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Samsung PTBOT case study is being prepared.",
    "Samsung PTBOT의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Canbu case study is being prepared.",
    "Canbu의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full Pawdle case study is being prepared.",
    "Pawdle의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full SMTOWN Meta-Passport case study is being prepared.",
    "SMTOWN Meta-Passport의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  [
    "This section is intentionally parked as a construction area while the full SmileMe case study is being prepared.",
    "SmileMe의 전체 케이스 스터디를 준비하고 있습니다.",
  ],
  ["MFA in Service Design", "서비스디자인 석사"],
  ["Design community organizer", "디자인 커뮤니티 운영자"],
  [
    "I'm a Senior Product Designer and Product Manager from South Korea, based in Vancouver. I help teams define what to build, turn complex requirements into clear product flows, and move products from planning to launch.",
    "한국에서 프로덕트 디자이너로 커리어를 시작해, 지금은 캐나다 밴쿠버에서 시니어 프로덕트 디자이너이자 프로덕트 매니저로 일합니다. 팀이 무엇을 만들어야 하는지 정하고, 복잡한 요구사항을 명확한 제품 흐름으로 바꾸며, 기획부터 출시까지 이어지도록 돕습니다.",
  ],
  ["What I do", "더 나은 질문에서 제품을 시작합니다"],
  ["Career snapshot", "경력을 한눈에 보면"],
  ["How I work", "저는 이렇게 일합니다"],
  ["Working in South Korea", "한국에서 팀을 이끌며 배운 것"],
  ["Military service", "군 복무에서 배운 실행의 기본"],
  ["Travel", "여행을 좋아합니다"],
  ["Cooking", "요리는 제가 가족을 돌보는 방법입니다"],
  [
    "I began my career as a product designer and gradually took on design management, project management, and product ownership. Over eight years, I have worked across hands-on design, team leadership, client communication, and product delivery, often within the same project.",
    "프로덕트 디자이너로 커리어를 시작해 8년 동안 디자인 매니지먼트, 프로젝트 관리, 프로덕트 오너 역할까지 맡아왔습니다. 하나의 프로젝트 안에서 실무 디자인과 팀 리딩, 클라이언트 커뮤니케이션, 제품 출시를 함께 책임지는 경우가 많았습니다.",
  ],
  [
    "I use AI-assisted workflows in product design and delivery. I apply them where they reduce repetitive work, then use research, product context, and team input to decide which problems to solve and how the product should work.",
    "제품 디자인과 출시 과정에서 반복 업무를 줄이고 더 빠르게 시도할 수 있는 일에 AI를 활용합니다. 그다음에는 리서치와 제품 맥락, 팀의 의견을 바탕으로 어떤 문제를 풀고 제품이 어떻게 작동해야 하는지 정합니다.",
  ],
  [
    "I have worked on more than 30 digital projects and helped launch over 10 products and services. The work includes AI and IoT products, e-commerce, fintech, healthcare, internal tools, and community platforms.",
    "AI·IoT, 이커머스, 핀테크, 헬스케어, 사내 도구, 커뮤니티 플랫폼을 포함해 30개 이상의 디지털 프로젝트에 참여했습니다. 그중 10개 이상의 제품과 서비스를 출시하는 데 함께했습니다.",
  ],
  [
    "Product decisions often had to satisfy users, clients, business teams, and developers at the same time. I pursued an MFA in Service Design to study these relationships more systematically and improve how I plan products and services.",
    "제품을 결정할 때는 사용자뿐 아니라 클라이언트, 비즈니스 팀, 개발자까지 함께 납득할 수 있어야 했습니다. 이 관계를 더 체계적으로 이해하고 제품과 서비스를 더 잘 설계하기 위해 서비스디자인 석사 과정을 밟았습니다.",
  ],
  [
    "My thesis, “A Study on Colors to Improve Kiosk Usability for the Elderly,” examined how color choices could improve the usability and accessibility of self-service kiosks for older adults.",
    "논문 「고령자의 키오스크 사용성 향상을 위한 색채 연구」에서는 색채 선택이 고령자의 셀프서비스 키오스크 사용성과 접근성을 어떻게 높일 수 있는지 연구했습니다.",
  ],
  [
    "In South Korea, I worked as both a hands-on designer and a team lead. I reviewed user flows, set visual direction, gave design feedback, resolved stakeholder issues, and helped teams decide what had to ship first.",
    "한국에서는 실무 디자이너이자 팀 리드로 일했습니다. 사용자 흐름을 검토하고, 비주얼 방향을 정하고, 디자인 피드백을 주고, 이해관계자의 의견을 조율하며 무엇을 먼저 출시할지 팀과 결정했습니다.",
  ],
  [
    "At Brickmate, I built onboarding, hiring, and training processes for the design team while managing delivery for client projects. The clients included Samsung, SM Entertainment, Lotte, and Danal.",
    "브릭메이트에서는 디자인팀의 온보딩과 채용, 교육 과정을 만들면서 클라이언트 프로젝트의 실행도 관리했습니다. 삼성, SM엔터테인먼트, 롯데, 다날 등의 프로젝트에 참여했습니다.",
  ],
  [
    "In my early twenties, I served as an administration specialist at Republic of Korea Army headquarters and completed my service as a sergeant.",
    "20대 초반에는 약 2년 동안 대한민국 육군 본부에서 행정병으로 복무했습니다.",
  ],
  [
    "The role involved coordinating schedules, people, documents, and administrative requests. It required accurate handoffs, clear responsibilities, and consistent follow-through.",
    "일정과 인원, 문서, 행정 요청을 조율하는 역할이었습니다. 정확하게 인계하고, 책임을 분명히 나누고, 맡은 일을 끝까지 마무리하는 태도가 필요했습니다.",
  ],
  [
    "I travel whenever my schedule allows. I like walking through unfamiliar neighbourhoods, trying local food, and seeing how people use everyday services in different places.",
    "시간이 허락할 때마다 여행합니다. 낯선 동네를 걷고, 현지 음식을 맛보고, 다른 곳의 사람들이 일상적인 서비스를 어떻게 이용하는지 살펴보는 일을 좋아합니다.",
  ],
  [
    "I do not have a complicated reason for travelling. I simply enjoy it.",
    "여행을 좋아하는 이유는 복잡하지 않습니다. 그냥 좋아합니다.",
  ],
  [
    "I studied cooking before moving into design, and it has remained part of my daily life.",
    "디자인을 시작하기 전에 요리를 공부했고, 지금도 요리는 제 일상의 한 부분입니다.",
  ],
  [
    "At home, I usually cook for my wife and son. I plan the meals, buy the ingredients, and make the food.",
    "집에서는 주로 아내와 아들을 위해 요리합니다. 메뉴를 정하고, 재료를 사고, 직접 음식을 만듭니다.",
  ],
  [
    "Education → MFA in Service Design and BFA in Industrial Design.",
    "학력 → 서비스디자인 석사와 산업디자인 학사 과정을 마쳤습니다.",
  ],
  [
    "South Korea and Canada → Built my design career in South Korea and now work in Vancouver.",
    "한국과 캐나다 → 한국에서 디자인 경력을 쌓았고, 지금은 밴쿠버에서 일합니다.",
  ],
  [
    "Global teams → Worked with designers, developers, product managers, and clients across multiple countries, including team members in Vietnam.",
    "글로벌 팀 → 베트남을 포함한 여러 나라의 디자이너, 개발자, 프로덕트 매니저, 클라이언트와 협업했습니다.",
  ],
  [
    "AI-assisted delivery → Added AI tools to product design and delivery workflows to reduce repetitive work and speed up iteration.",
    "AI를 활용한 실행 → 반복 업무를 줄이고 더 빠르게 개선하기 위해 제품 디자인과 출시 과정에 AI 도구를 적용했습니다.",
  ],
  [
    "OCR service → Worked on a government-funded service that uses OCR to help travellers identify allergenic ingredients.",
    "OCR 서비스 → 여행자가 알레르기 유발 성분을 확인할 수 있도록 OCR을 활용한 정부 지원 서비스에 참여했습니다.",
  ],
  [
    "Product strategy → Define the user problem, business goal, scope, and tradeoffs before the team commits to a solution.",
    "제품 전략 → 해결안을 정하기 전에 사용자 문제와 비즈니스 목표, 범위, 선택에 따른 조건을 먼저 분명히 합니다.",
  ],
  [
    "Service design → Map the user journey, touchpoints, operating process, and business model into one service flow.",
    "서비스 디자인 → 사용자 여정과 접점, 운영 과정, 비즈니스 모델을 하나의 서비스 흐름으로 연결합니다.",
  ],
  [
    "UX systems → Translate product rules and edge cases into journeys, information architecture, screens, and reusable interaction patterns.",
    "UX 시스템 → 제품 정책과 예외 상황을 사용자 여정, 정보 구조, 화면, 재사용할 수 있는 인터랙션 패턴으로 구체화합니다.",
  ],
  [
    "Design management → Set responsibilities, review work, document decisions, and keep designers, developers, product managers, and clients aligned through delivery.",
    "디자인 매니지먼트 → 역할을 나누고, 결과물을 리뷰하고, 결정 사항을 기록하며 디자이너와 개발자, PM, 클라이언트가 출시까지 같은 방향으로 움직이도록 조율합니다.",
  ],
  ["Community and side projects", "커뮤니티에서 배우고, 사이드 프로젝트로 확인합니다"],
  [
    "I mentor junior designers through ADPList and design communities. My sessions focus on portfolio reviews, product thinking, and practical career decisions.",
    "ADPList와 디자인 커뮤니티에서 주니어 디자이너를 멘토링합니다. 포트폴리오 리뷰와 제품을 보는 관점, 현실적인 커리어 결정을 중심으로 이야기합니다.",
  ],
  [
    "I organize workshops, AI hackathons, and community events for product designers. I have also hosted in-person events in Vancouver.",
    "프로덕트 디자이너를 위한 워크숍과 AI 해커톤, 커뮤니티 행사를 기획하고 운영합니다. 밴쿠버에서도 오프라인 행사를 열었습니다.",
  ],
  [
    "I also co-launched a community app for Koreans. It reached more than 1,500 users and signed its first advertising clients within three months.",
    "한인 커뮤니티 앱을 함께 출시하기도 했습니다. 사용자 1,500명 이상을 확보했고, 출시 3개월 안에 첫 광고 고객을 유치했습니다.",
  ],
  ["Erik Park", "박세익"],
  ["Hi, I'm Erik Park", "안녕하세요, 박세익입니다"],
  ["Master's in Service Design", "서비스디자인 석사"],
  [
    "I'm a Senior Product Designer and Product Manager from South Korea, now based in Vancouver, BC. I help teams turn unclear product ideas into clear direction, usable experiences, and products they can launch and improve.",
    "좋은 제품은 더 나은 질문에서 시작한다고 믿습니다. 한국에서 프로덕트 디자이너로 커리어를 시작해, 지금은 캐나다 밴쿠버에서 시니어 프로덕트 디자이너이자 프로덕트 매니저로 일합니다. 아직 답이 없는 아이디어에서 팀이 먼저 풀어야 할 질문을 찾고, 사용자가 이해할 수 있는 경험과 출시 가능한 제품으로 구체화합니다.",
  ],
  ["What I Do", "더 나은 질문에서 제품을 시작합니다"],
  [
    "I started my career as a Product Designer. Over eight years, I expanded into Design Manager, Project Manager, and Product Owner roles while staying hands-on in design. I often carried these responsibilities in parallel, connecting user needs and design decisions with project delivery and product direction.",
    "제 커리어의 중심은 프로덕트 디자인입니다. 8년 동안 실무 디자인을 이어가면서 디자인 매니저, 프로젝트 매니저, 프로덕트 오너 역할까지 맡았습니다. 사용자가 필요로 하는 것, 팀이 만들 수 있는 것, 제품이 가야 할 방향을 하나의 결정으로 연결해왔습니다.",
  ],
  [
    "As AI changes how we work, my strength is not simply creating faster. It is using experience and judgment to identify the problem worth solving, ask better questions, and turn what I learn from real people into product decisions that work in practice.",
    "AI는 만드는 속도를 높여줍니다. 하지만 무엇을 왜 만들어야 하는지까지 정해주지는 않습니다. 저는 경험과 판단을 바탕으로 풀 가치가 있는 문제를 찾고, 실제 사람에게서 배운 내용을 제품 결정으로 옮깁니다.",
  ],
  [
    "Across different roles and industries, I keep returning to the same questions: which problem is worth solving, and what does the team need to decide next?",
    "역할과 분야가 달라져도 시작점은 같습니다. 지금 풀어야 할 문제가 무엇인지, 팀이 다음으로 무엇을 정해야 하는지부터 봅니다.",
  ],
  ["Career Snapshot", "8년 동안 역할은 넓어졌지만, 중심은 제품 디자인입니다"],
  [
    "Product Design → Began my career by turning user problems into product flows, screens, and interactions.",
    "제품 디자인 → 사용자 문제를 이해하고, 제품의 흐름과 화면으로 풀어내는 일에서 커리어를 시작했습니다.",
  ],
  [
    "Expanding Roles → Stayed hands-on in design while taking on Design Manager, Project Manager, and Product Owner responsibilities.",
    "역할 확장 → 실무 디자인을 이어가며 디자인 매니저, 프로젝트 매니저, 프로덕트 오너 역할을 함께 맡았습니다.",
  ],
  [
    "Launch Experience → Contributed to 30+ projects and launched 10+ digital products and services.",
    "출시 경험 → 30개 이상의 프로젝트에 참여했고, 10개 이상의 디지털 제품과 서비스를 출시했습니다.",
  ],
  [
    "Global Collaboration → Worked in South Korea and Canada and collaborated with and led teams across regions, including Vietnam.",
    "글로벌 협업 → 한국과 캐나다에서 일했고, 베트남을 포함한 여러 지역의 동료와 협업하고 팀을 이끌었습니다.",
  ],
  [
    "OCR Service → Worked on a government-funded OCR service to help travellers identify allergenic ingredients.",
    "OCR 서비스 → 여행자가 식품 성분에서 알레르기 유발 물질을 확인할 수 있도록 정부 지원 OCR 서비스에 참여했습니다.",
  ],
  ["How I Work", "제품의 방향을 정하고, 출시까지 연결합니다"],
  [
    "Product Strategy → Frame the problem, define the direction, and make tradeoffs visible.",
    "제품 전략 → 무엇을 풀어야 하는지, 왜 지금 풀어야 하는지, 어디까지 만들지 먼저 정합니다.",
  ],
  [
    "Service Design → Map users, touchpoints, operations, and business models into workable service flows.",
    "서비스 디자인 → 사용자 여정과 접점, 운영 방식, 비즈니스 모델이 실제 서비스 안에서 함께 작동하도록 설계합니다.",
  ],
  [
    "UX Systems → Turn complex product logic into clear journeys, screens, and interaction patterns.",
    "UX 시스템 → 복잡한 정책과 제품 로직을 사용자가 이해할 수 있는 여정, 화면, 인터랙션으로 바꿉니다.",
  ],
  [
    "Design Management → Align designers, product managers, developers, clients, and priorities through delivery.",
    "디자인 매니지먼트 → 결정의 이유와 우선순위를 분명히 공유하고, 디자이너·PM·개발자·클라이언트가 출시까지 같은 방향으로 움직이도록 조율합니다.",
  ],
  ["Community & Side Projects", "커뮤니티에서 듣고, 사이드 프로젝트로 확인합니다"],
  [
    "Mentoring and community work keep me close to the questions designers are asking now. Through ADPList, workshops, and community events, I offer direct feedback on portfolios, product thinking, and career direction.",
    "ADPList와 워크숍, 커뮤니티 행사에서 디자이너를 멘토링합니다. 포트폴리오와 제품을 함께 보고 커리어 이야기를 나누다 보면, 지금 어디에서 막히는지 더 구체적으로 알게 됩니다.",
  ],
  [
    "I lead a design community in South Korea and have hosted in-person events in Vancouver. These spaces let designers compare approaches, share what worked, and learn from one another.",
    "한국에서는 디자인 커뮤니티를 이끌고, 밴쿠버에서는 디자이너들이 직접 만나는 행사를 열었습니다. 서로 어떤 방법을 썼고 무엇이 잘됐는지 나누는 자리입니다.",
  ],
  [
    "Side projects give me another way to test ideas outside formal product work: find a real problem, build enough to learn, and respond to what people actually do.",
    "사이드 프로젝트도 그렇게 시작합니다. 아이디어를 오래 설명하기보다 실제 문제가 있는지 먼저 확인합니다. 배울 수 있을 만큼 만들고, 사람들이 쓰는 모습을 보며 다음에 무엇을 바꿀지 정합니다.",
  ],
  ["Master’s Degree in Service Design", "직관을 설명 가능한 기준으로 바꾸고 싶었습니다"],
  [
    "I kept running into the same challenge: product decisions had to make sense to clients, business teams, developers, and users at the same time. Good intuition helped, but it was not enough.",
    "제품을 결정할 때는 사용자뿐 아니라 클라이언트, 비즈니스 팀, 개발자도 함께 납득할 수 있어야 했습니다. 실무에서 쌓은 직관만으로는 서로 다른 관점을 연결하고 결정의 이유를 설명하기 어려웠습니다.",
  ],
  [
    "That is why I pursued a master’s degree in Service Design. My research, “A Study on Colors to Improve Kiosk Usability for the Elderly,” examined how color could make self-service kiosks more usable and accessible for older adults.",
    "그래서 서비스디자인 석사 과정을 밟았습니다. 논문 「고령자의 키오스크 사용성 향상을 위한 색채 연구」에서는 색채가 고령자의 셀프서비스 키오스크 사용성과 접근성을 어떻게 높일 수 있는지 연구했습니다.",
  ],
  ["What I Learned Working in Korea", "신뢰는 작은 실행에서 쌓인다는 것을 배웠습니다"],
  [
    "In South Korea, I worked as both a hands-on designer and a team lead. On any given project, that could mean reviewing a flow, giving design feedback, resolving a stakeholder disagreement, or helping the team decide what had to ship first.",
    "한국에서는 실무 디자이너이자 팀 리드로 일했습니다. 프로젝트에 따라 화면 흐름을 검토하고, 디자인 피드백을 주고, 이해관계자의 의견 충돌을 조율하고, 무엇을 먼저 출시할지 팀과 정했습니다.",
  ],
  [
    "I learned that trust is built through the small, repeatable parts of the work: listening closely, explaining decisions clearly, and following through.",
    "잘 듣고, 결정의 이유를 설명하고, 맡은 일을 끝까지 마무리하는 것. 한국에서 팀을 이끌며 배운 이 기본은 지금도 프로젝트를 운영하는 기준입니다.",
  ],
  ["What Military Service Taught Me", "누군가 기다리는 일은 끝까지 마무리합니다"],
  [
    "In my early twenties, I spent about two years serving at military headquarters, coordinating people and administrative work with little room for missed details.",
    "20대 초반에는 약 2년 동안 군 본부에서 복무했습니다. 작은 누락도 다른 사람의 업무에 바로 영향을 주는 환경에서 인원과 행정 업무를 조율했습니다.",
  ],
  [
    "It taught me to stay calm, make responsibilities clear, and finish what others were depending on. Those habits still show up in how I run projects today.",
    "그곳에서는 작은 일도 빠뜨리지 않는 것이 중요했습니다. 상황을 차분히 정리하고, 역할과 책임을 분명히 나누고, 누군가 기다리는 일을 끝까지 마무리하는 습관을 배웠습니다. 지금도 여러 사람이 함께하는 프로젝트에서 지키는 기본입니다.",
  ],
  ["Travel inspires me", "낯선 곳에서는 익숙한 일상도 다르게 보입니다"],
  [
    "Travel has always been a way for me to recharge and reconnect with myself.",
    "여행은 일상에서 잠시 떨어져 다시 제 속도를 찾게 해줍니다.",
  ],
  [
    "I enjoy discovering new places, meeting people from different backgrounds, and finding inspiration in the small moments along the way.",
    "낯선 장소를 걷고, 다른 배경의 사람을 만나고, 길에서 마주친 작은 장면을 오래 기억하는 일을 좋아합니다.",
  ],
  [
    "When people ask me why I love traveling, I still don’t have a specific answer.",
    "왜 여행을 좋아하냐는 질문에는 아직 그럴듯한 답이 없습니다.",
  ],
  [
    "I usually just say, “because I like it.” And maybe that’s enough.",
    "그냥 좋기 때문입니다. 그 정도면 충분하다고 생각합니다.",
  ],
  [
    "Cooking is one of the ways I take care of people",
    "요리로 가족을 돌봅니다",
  ],
  [
    "Cooking has been part of my life for a long time. I loved it enough to study it earlier in my career.",
    "요리는 오래된 취미입니다. 커리어 초기에 따로 공부했을 만큼 좋아했습니다.",
  ],
  [
    "These days, it is one of the ways I care for my family. I am usually the one cooking for my wife and son, and I like that role.",
    "요즘은 주로 아내와 아들을 위해 요리합니다. 메뉴를 정하고 재료를 준비해 한 끼를 만드는 일은, 제가 가족을 돌보는 가장 익숙한 방법입니다.",
  ],
  [
    "I am a Product Designer who starts with questions. I began my career in South Korea and now work in Vancouver as a Senior Product Designer and Product Manager. Over eight years, I have stayed close to the details of the product while taking responsibility for teams, schedules, and product direction.",
    "저는 질문에서 시작하는 프로덕트 디자이너입니다. 한국에서 커리어를 시작했고, 지금은 캐나다 밴쿠버에서 시니어 프로덕트 디자이너이자 프로덕트 매니저로 일합니다. 8년 동안 제품의 세부를 직접 설계하면서 팀과 일정, 제품의 방향까지 함께 책임져왔습니다.",
  ],
  [
    "My role expanded, but I stayed close to design",
    "역할은 넓어졌지만, 디자인에서 멀어지지는 않았습니다",
  ],
  [
    "I began as a hands-on Product Designer. Later, I also worked as a Design Manager, Project Manager, and Product Owner. These responsibilities often overlapped within the same project.",
    "실무 프로덕트 디자이너로 커리어를 시작했습니다. 이후 디자인 매니저와 프로젝트 매니저, 프로덕트 오너 역할도 맡았습니다. 하나의 프로젝트에서 이 역할들을 함께 책임지는 경우가 많았습니다.",
  ],
  [
    "Working across these roles changed the way I see design. A screen is only one part of a product decision. I also consider what the user needs, what the team can build, what the business must decide, and what it takes to launch.",
    "여러 역할을 함께 맡으면서 디자인을 보는 방식도 달라졌습니다. 화면은 제품을 결정하는 일의 한 부분입니다. 사용자가 무엇을 필요로 하는지, 팀이 무엇을 만들 수 있는지, 비즈니스가 무엇을 정해야 하는지, 실제로 출시하려면 무엇이 필요한지까지 함께 봅니다.",
  ],
  [
    "AI makes the work faster. It does not decide what is worth making",
    "AI는 만드는 일을 빠르게 합니다. 무엇을 만들지는 대신 정해주지 않습니다",
  ],
  [
    "I use AI to reduce repetitive work and test ideas faster. But experience and judgment still matter when deciding which problem to solve, what to leave out, and how the product should work for people.",
    "반복 업무를 줄이고 아이디어를 더 빠르게 시험할 때 AI를 씁니다. 하지만 어떤 문제를 풀지, 무엇을 덜어낼지, 사람에게 제품이 어떻게 작동해야 하는지를 정할 때는 여전히 경험과 판단이 필요합니다.",
  ],
  ["Eight years, in five lines", "8년의 경력을 다섯 줄로 정리하면"],
  [
    "OCR Service → Worked on a government-funded OCR service that helps travellers identify allergenic ingredients.",
    "OCR 서비스 → 여행자가 식품 성분에서 알레르기 유발 물질을 확인할 수 있도록 정부 지원 OCR 서비스에 참여했습니다.",
  ],
  [
    "I wanted to turn intuition into a standard we could share",
    "직관을 함께 쓰는 기준으로 바꾸고 싶었습니다",
  ],
  [
    "Product decisions had to make sense to users, clients, business teams, and developers at the same time. Experience gave me intuition, but intuition alone was not enough to explain why one direction was better than another.",
    "제품을 결정할 때는 사용자와 클라이언트, 비즈니스 팀, 개발자가 함께 납득할 수 있어야 했습니다. 경험은 직관을 만들어줬지만, 직관만으로는 왜 한 방향이 다른 방향보다 나은지 설명하기 어려웠습니다.",
  ],
  [
    "That is why I pursued a master’s degree in Service Design. My research, “A Study on Colors to Improve Kiosk Usability for the Elderly,” examined how color could make self-service kiosks more usable and accessible for older adults.",
    "그래서 서비스디자인 석사 과정을 밟았습니다. 논문 「고령자의 키오스크 사용성 향상을 위한 색채 연구」에서는 색채가 고령자의 셀프서비스 키오스크 사용성과 접근성을 어떻게 높일 수 있는지 연구했습니다.",
  ],
  [
    "I learned that trust is built in the small follow-through",
    "신뢰는 작은 일을 끝까지 해내면서 쌓였습니다",
  ],
  [
    "Trust was built through the small, repeatable parts of the work: listening closely, explaining decisions clearly, and finishing what I said I would do.",
    "신뢰는 작지만 반복되는 일에서 쌓였습니다. 자세히 듣고, 결정의 이유를 분명히 설명하고, 하겠다고 말한 일을 끝까지 마치는 일이었습니다.",
  ],
  [
    "Military service taught me to finish the work someone else was waiting for",
    "군복무에서 누군가 기다리는 일을 끝까지 마치는 법을 배웠습니다",
  ],
  [
    "In my early twenties, I spent about two years serving at military headquarters.",
    "20대 초반에는 약 2년 동안 군 본부에서 복무했습니다.",
  ],
  [
    "The work involved coordinating people, schedules, documents, and administrative requests. A small omission could immediately affect someone else’s work. I learned to stay calm, make responsibilities clear, and finish what others were waiting for.",
    "인원과 일정, 문서, 행정 요청을 조율하는 일이었습니다. 작은 누락도 다른 사람의 업무에 바로 영향을 줄 수 있었습니다. 상황을 차분히 정리하고, 역할과 책임을 분명히 나누고, 누군가 기다리는 일을 끝까지 마치는 법을 배웠습니다.",
  ],
  [
    "Talking with other designers shows me where people are getting stuck",
    "다른 디자이너와 대화하면 지금 막히는 지점이 보입니다",
  ],
  [
    "Through ADPList, workshops, and community programs, I review portfolios and talk with designers about product thinking and career decisions. Those conversations show me where designers are getting stuck and what they are trying next.",
    "ADPList와 워크숍, 커뮤니티 프로그램에서 포트폴리오를 리뷰하고 제품을 보는 관점과 커리어 결정을 이야기합니다. 대화를 나누다 보면 디자이너들이 지금 어디에서 막히고, 다음으로 무엇을 시도하는지 알게 됩니다.",
  ],
  [
    "I also run a design community in South Korea and host in-person events in Vancouver. I like creating opportunities for people to compare how they work, share what worked, and decide what they want to try next.",
    "한국에서는 디자인 커뮤니티를 운영하고, 밴쿠버에서는 디자이너들이 직접 만나는 행사를 엽니다. 서로 일하는 방법과 잘된 점을 나누고, 다음에 무엇을 시도할지 정해보는 자리를 만드는 일을 좋아합니다.",
  ],
  [
    "Side projects let me follow a question all the way through",
    "사이드 프로젝트에서는 궁금한 문제를 끝까지 따라가봅니다",
  ],
  [
    "Client work usually begins with a problem that already needs an answer. A side project begins with a question I choose myself. I look for people who have the problem, make the smallest useful version, and watch what they actually do.",
    "클라이언트 프로젝트는 대개 이미 답이 필요한 문제에서 시작합니다. 사이드 프로젝트는 제가 직접 고른 질문에서 시작합니다. 같은 문제를 겪는 사람을 찾고, 쓸 수 있는 가장 작은 형태로 만든 뒤, 사람들이 실제로 어떻게 쓰는지 봅니다.",
  ],
  [
    "Some ideas stop early. Others grow into products. Either way, the point is to replace an assumption with something I can learn from.",
    "어떤 아이디어는 일찍 멈추고, 어떤 아이디어는 제품으로 이어집니다. 어느 쪽이든 추측으로 남겨두지 않고 직접 확인하며 배우는 것이 중요합니다.",
  ],
  ["Time away from work shapes me too", "일하지 않는 시간도 저를 만듭니다"],
  [
    "Travel and cooking are not extensions of my job. They are simply parts of the life I value: stepping out of routine, paying attention to unfamiliar places, and caring for my family in an everyday way.",
    "여행과 요리는 일의 연장이 아닙니다. 일상에서 잠시 벗어나 낯선 곳을 바라보고, 가장 익숙한 방식으로 가족을 돌보는 시간입니다. 제가 소중하게 생각하는 삶의 모습이기도 합니다.",
  ],
  ["I travel because I like it", "좋아해서 여행합니다"],
  [
    "Travel helps me step away from routine and find my own pace again. I like walking through unfamiliar places, meeting people with different backgrounds, and remembering small moments along the way.",
    "여행을 하면 일상에서 잠시 떨어져 다시 제 속도를 찾게 됩니다. 낯선 곳을 걷고, 다른 배경의 사람을 만나고, 길에서 마주친 작은 장면을 오래 기억하는 일을 좋아합니다.",
  ],
  [
    "I still do not have a complicated answer when someone asks why I travel. I simply like it, and that feels like enough.",
    "왜 여행을 좋아하냐는 질문에는 아직 복잡한 답이 없습니다. 그냥 좋아합니다. 그 정도면 충분하다고 생각합니다.",
  ],
  ["Cooking is how I take care of my family", "요리는 제가 가족을 돌보는 방법입니다"],
  [
    "I studied cooking before moving into design, and it has stayed with me as a long-time interest.",
    "디자인을 시작하기 전에 요리를 공부했고, 지금도 오래 이어온 관심사로 남아 있습니다.",
  ],
  [
    "These days, I usually cook for my wife and son. Choosing a menu, preparing ingredients, and making a meal is the most familiar way I care for my family.",
    "요즘은 주로 아내와 아들을 위해 요리합니다. 메뉴를 정하고 재료를 준비해 한 끼를 만드는 일은, 제가 가족을 돌보는 가장 익숙한 방법입니다.",
  ],
  [
    "The work itself continues in the case studies",
    "제가 한 일은 케이스 스터디에서 이어집니다",
  ],
  [
    "This page explains who I am and how I came to work this way. The case studies explain the problems I faced, the decisions I made, and what I built with the team.",
    "이 페이지에서는 제가 어떤 사람이고, 어떻게 지금처럼 일하게 되었는지 이야기했습니다. 케이스 스터디에서는 어떤 문제를 만났고, 무엇을 결정했으며, 팀과 함께 무엇을 만들었는지 설명합니다.",
  ],
  ["View projects", "프로젝트 보기"],
  ["View resume", "이력서 보기"],
  ["Contact", "연락하기"],
  ["Email", "이메일"],
  ["Available for product and AI design work", "제품 및 AI 디자인 프로젝트 문의 가능"],
  ["LinkedIn", "LinkedIn"],
  ["Profile and career history", "프로필과 경력 보기"],
  ["Recommendations", "함께 일한 사람들이 전한 말"],
  ["Global Business Specialist", "글로벌 비즈니스 스페셜리스트"],
  ["UI/UX Designer", "UI/UX 디자이너"],
  ["Product Manager", "프로덕트 매니저"],
  [
    "Erik was a great product design manager and project leader.",
    "Erik은 뛰어난 프로덕트 디자인 매니저이자 프로젝트 리더였습니다.",
  ],
  [
    "He always tried his best to meet his clients' needs while reflecting their guidelines. He also cared for his peers when they needed help. I had a great time working with Erik and recommend him to future employers!",
    "Erik은 클라이언트의 요구와 가이드라인을 반영하기 위해 늘 최선을 다했습니다. 동료에게 도움이 필요할 때도 세심하게 챙겼습니다. Erik과 함께 일한 시간은 즐거웠고, 앞으로 함께할 조직에도 자신 있게 추천합니다.",
  ],
  [
    "I had the pleasure of working with Erik at Brickmate.",
    "Brickmate에서 Erik과 함께 일할 수 있어 기뻤습니다.",
  ],
  [
    "He consistently delivered exceptional results while fostering collaboration and maintaining clear communication. His ability to navigate challenges, align stakeholders, and lead teams effectively makes him a true asset to any organization.",
    "Erik은 명확하게 소통하고 협업을 이끌면서도 꾸준히 뛰어난 결과를 만들었습니다. 어려운 상황을 풀고 이해관계자를 조율하며 팀을 효과적으로 이끄는 역량은 어느 조직에서든 큰 강점이 될 것입니다.",
  ],
  [
    "With a deep sense of responsibility and extensive Product Design experience, Erik possesses the skills to address clients' MVP issues from a UX perspective.",
    "Erik은 강한 책임감과 폭넓은 프로덕트 디자인 경험을 바탕으로, 클라이언트의 MVP 문제를 UX 관점에서 해결할 수 있는 역량을 갖추고 있습니다.",
  ],
  [
    "Additionally, his strong communication skills with colleagues are a notable asset.",
    "동료들과 원활하게 소통하는 능력 또한 돋보이는 강점입니다.",
  ],
  ["Product Strategy", "제품 전략"],
  ["UX Strategy", "UX 전략"],
  ["UI Design", "UI 디자인"],
  ["AI Product Planning", "AI 제품 기획"],
  ["Project Management", "프로젝트 관리"],
  ["Resume", "이력서"],
  ["Designed and coded by Erik", "박세익이 디자인하고 직접 만들었습니다"],
  [
    "AI & Design · Lovable mini hackathon · Mar 2026",
    "AI & Design · Lovable 미니 해커톤 · 2026년 3월",
  ],
  [
    "AI & Design: New Workflows with Lovable — An AI Hackathon & Meetup for Designers",
    "AI & Design: New Workflows with Lovable — 디자이너를 위한 AI 해커톤 & 밋업",
  ],
  [
    "I co-hosted a sold-out workshop in Burnaby where designers moved from rough ideas to working prototypes, then shared what the speed revealed about their product thinking.",
    "버나비에서 열린 매진 워크숍을 공동 주최했습니다. 디자이너들은 거친 아이디어를 실제로 작동하는 프로토타입으로 만들었고, 그 속도가 자신의 제품 사고를 어떻게 드러내는지 함께 확인했습니다.",
  ],
  ["Workshop Hosting", "워크숍 주최"],
  ["Community", "커뮤니티"],
  ["AI Prototyping", "AI 프로토타이핑"],
  ["Portfolio Workshop · Nov 2025", "포트폴리오 워크숍 · 2025년 11월"],
  [
    "Portfolio Roast: practical interview and feedback session.",
    "Portfolio Roast: 실전 포트폴리오 인터뷰와 피드백 세션",
  ],
  [
    "A direct portfolio review session focused on clearer stories, stronger evidence, and the questions hiring teams actually ask.",
    "더 명확한 스토리와 구체적인 근거, 채용 과정에서 실제로 받는 질문을 중심으로 포트폴리오를 직접 리뷰한 세션입니다.",
  ],
  ["Portfolio Critique", "포트폴리오 리뷰"],
  ["Interview Practice", "인터뷰 실습"],
  [
    "Vancouver KDD · Career mentoring · Aug 2025",
    "Vancouver KDD · 커리어 멘토링 · 2025년 8월",
  ],
  [
    "Career Mentoring at the 5th KDD Korean Tech Conference",
    "제5회 KDD Korean Tech Conference 커리어 멘토링",
  ],
  [
    "Mentoring at the 5th KDD Korean Tech Conference",
    "제5회 KDD Korean Tech Conference 커리어 멘토링",
  ],
  [
    "I joined Vancouver's KDD Korean Tech Conference as a career mentor, turning broad questions about an uncertain industry into focused 1:2 conversations.",
    "Vancouver KDD Korean Tech Conference에 커리어 멘토로 참여했습니다. 불확실한 업계에 대한 넓은 고민을 1:2 대화에서 각자의 다음 결정으로 구체화했습니다.",
  ],
  ["Career Mentoring", "커리어 멘토링"],
  ["Product & Design", "프로덕트 & 디자인"],
  [
    "Vancouver KDD · 1:2 career mentoring · Vancouver · Aug 2025",
    "Vancouver KDD · 1:2 커리어 멘토링 · 밴쿠버 · 2025년 8월",
  ],
  [
    "Mentoring at the 5th KDD Korean Tech Conference: Technology in Uncertainty",
    "제5회 KDD Korean Tech Conference: 불확실성 속에서 나눈 커리어 멘토링",
  ],
  [
    "I joined the fifth annual KDD Korean Tech Conference as a career mentor, meeting participants in a 1:2 format to talk about technology careers in Canada. The event brought 211 people together around one practical question: how do we keep moving when the industry itself feels uncertain?",
    "제5회 KDD Korean Tech Conference에 커리어 멘토로 참여했습니다. 캐나다에서 기술 커리어를 탐색하는 참가자들과 1:2로 대화를 나눴습니다. 211명이 모인 행사의 중심에는 한 가지 현실적인 질문이 있었습니다. 업계 자체가 불확실할 때 우리는 어떻게 다음 방향을 정할 수 있을까?",
  ],
  [
    "Career mentor / Product design / Community",
    "커리어 멘토 / 프로덕트 디자인 / 커뮤니티",
  ],
  [
    "The fifth annual conference brought 211 people together at UBC Robson Square in Vancouver.",
    "제5회 컨퍼런스에는 211명이 밴쿠버 UBC Robson Square에 모였습니다.",
  ],
  [
    "Uncertainty was not background noise. It was the topic.",
    "불확실성을 배경에 두지 않고, 대화의 주제로 꺼냈습니다",
  ],
  [
    "By 2025, change in technology careers was no longer an abstract discussion. AI was reshaping how people worked, hiring felt harder to read, and many people were trying to decide which skills and experiences would still matter.",
    "2025년의 기술 커리어에서 변화는 더 이상 막연한 이야기가 아니었습니다. AI는 일하는 방식을 바꾸고 있었고, 채용 시장의 흐름은 읽기 어려워졌습니다. 어떤 경험과 역량이 앞으로도 유효할지 고민하는 사람도 많았습니다.",
  ],
  [
    "Vancouver KDD brought those questions into one full-day conference. Speaker sessions offered different perspectives on change, while the mentoring program gave participants a smaller place to connect those ideas to their own careers. The official event recap recorded 211 participants.",
    "Vancouver KDD는 이 질문들을 하루 동안 함께 다루는 컨퍼런스를 만들었습니다. 연사 세션에서는 변화를 바라보는 여러 관점을 들을 수 있었고, 멘토링에서는 그 이야기를 각자의 커리어에 연결해볼 수 있었습니다. 공식 행사 회고에 따르면 이날 211명이 참여했습니다.",
  ],
  ["Theme", "주제"],
  [
    "Technology in Uncertainty: Change, Challenge, and Opportunity",
    "Technology in Uncertainty: 변화, 도전, 그리고 기회",
  ],
  ["Date and place", "일시와 장소"],
  [
    "August 30, 2025 · UBC Robson Square, Vancouver",
    "2025년 8월 30일 · UBC Robson Square, Vancouver",
  ],
  ["Scale", "규모"],
  ["211 participants", "참가자 211명"],
  ["Mentoring format", "멘토링 구성"],
  [
    "1:2 career conversations alongside talks and community sessions",
    "강연과 커뮤니티 세션과 함께 진행한 1:2 커리어 대화",
  ],
  ["My role", "나의 역할"],
  ["Career mentor", "커리어 멘토"],
  [
    "Small conversations inside a 211-person conference",
    "211명이 모인 컨퍼런스 안의 작은 대화",
  ],
  [
    "I participated as a career mentor, bringing the perspective of a product designer who has also worked across product management, project leadership, and design teams in Korea and Canada.",
    "저는 커리어 멘토로 참여했습니다. 프로덕트 디자이너를 중심으로 프로덕트 매니지먼트, 프로젝트 리딩, 한국과 캐나다의 디자인팀에서 일해온 경험을 나눴습니다.",
  ],
  [
    "The value of the 1:2 format was simple: it made room for context. A large talk can surface a useful idea, but a career decision depends on where someone is starting, what experience they already have, and what they can realistically do next.",
    "1:2 멘토링의 장점은 단순했습니다. 한 사람의 맥락을 들을 수 있다는 점입니다. 큰 강연은 좋은 관점을 던져주지만, 실제 커리어 결정은 어디에서 출발하는지, 이미 어떤 경험을 가지고 있는지, 다음에 무엇을 현실적으로 할 수 있는지에 따라 달라집니다.",
  ],
  [
    "My role was not to hand over one universal roadmap. It was to listen for the decision underneath the job title and help make the next move more concrete.",
    "하나의 정답이나 로드맵을 건네는 것이 제 역할은 아니었습니다. 직무명 뒤에 있는 결정을 함께 찾고, 다음 행동을 조금 더 구체적으로 만드는 일이 중요했습니다.",
  ],
  [
    "The 1:2 mentoring format created room to move from broad industry change to each participant's actual situation.",
    "1:2 멘토링은 업계의 큰 변화를 각 참가자의 실제 상황으로 연결해볼 수 있는 자리를 만들었습니다.",
  ],
  ["Start with the person, not a job title", "직무명보다 먼저, 지금의 사람을 봤습니다"],
  [
    "A job title can hide the actual question. Someone may be asking whether their previous experience still counts, how to enter a new market, or whether the skills they are building lead toward the work they actually want.",
    "직무명만으로는 실제 고민이 잘 보이지 않습니다. 이전 경험이 다음 역할에도 유효한지, 새로운 시장에 어떻게 진입해야 하는지, 지금 쌓는 역량이 정말 원하는 일로 이어지는지를 묻고 있을 수 있습니다.",
  ],
  [
    "The most useful conversations moved through three layers:",
    "대화는 크게 세 가지를 구체화하는 방향으로 이어졌습니다.",
  ],
  ["Layer", "구분"],
  ["What we tried to clarify", "함께 확인한 것"],
  ["Current context", "현재의 맥락"],
  [
    "The experience, constraints, and strengths the person already had",
    "이미 가진 경험과 강점, 지금의 제약",
  ],
  ["Direction", "원하는 방향"],
  [
    "The kind of problem, team, and responsibility they wanted next",
    "다음에 풀고 싶은 문제와 팀, 맡고 싶은 책임",
  ],
  ["Next evidence", "다음 근거"],
  [
    "One realistic way to test that direction through a project, conversation, or application",
    "프로젝트, 대화, 지원을 통해 방향을 시험할 현실적인 행동 하나",
  ],
  [
    "This did not remove uncertainty. It made the uncertainty specific enough to work with.",
    "불확실성이 사라진 것은 아닙니다. 대신 다뤄볼 수 있을 만큼 구체적인 문제가 됐습니다.",
  ],
  [
    "A large conference still made room for individual direction",
    "큰 컨퍼런스 안에서도 각자의 방향을 다룰 수 있었습니다",
  ],
  [
    "The day included talks, career sessions, networking, and 1:2 mentoring. That combination mattered. Participants could hear how experienced people were reading the industry, then step into a smaller conversation about what those changes meant for them.",
    "이날은 강연과 커리어 세션, 네트워킹, 1:2 멘토링이 함께 진행됐습니다. 이 조합이 중요했습니다. 참가자들은 경험 많은 실무자들이 업계를 어떻게 읽는지 들은 뒤, 그 변화가 자신의 상황에서는 무엇을 의미하는지 더 작은 자리에서 이야기할 수 있었습니다.",
  ],
  [
    "The official event recap highlighted both the speaker sessions and the career insight created through mentoring. For me, that was the strength of the format: the conference offered range, while the mentoring made the day personal.",
    "공식 행사 회고에서도 연사 세션과 함께 멘토링에서 얻은 커리어 인사이트를 주요 경험으로 다뤘습니다. 컨퍼런스가 넓은 관점을 열어줬다면, 멘토링은 그 하루를 각자의 이야기로 연결했습니다.",
  ],
  [
    "The people behind the fifth annual conference gathered after a full day of talks, mentoring, and community conversations.",
    "제5회 컨퍼런스를 만든 사람들이 강연과 멘토링, 커뮤니티 대화를 마친 뒤 한자리에 모였습니다.",
  ],
  ["What stayed with me as a mentor", "멘토로서 남은 생각"],
  [
    "I joined the event to share what I had learned, but stepping outside everyday work also gave me a wider view of technology and career. Conversations with people who were still exploring their path made familiar questions feel specific again.",
    "제가 배운 것을 나누기 위해 참여했지만, 일상 업무에서 한 발 떨어져 기술과 커리어를 더 넓게 생각해본 시간이기도 했습니다. 아직 자신의 방향을 탐색하고 있는 사람들과 대화하니 익숙한 질문도 다시 구체적으로 보였습니다.",
  ],
  [
    "Good mentoring does not remove uncertainty. It helps someone make the next decision with more context.",
    "좋은 멘토링은 불확실성을 없애주지 않습니다. 대신 더 많은 맥락을 가지고 다음 결정을 내리게 합니다.",
  ],
  [
    "A mentor cannot choose someone else's career. What we can do is listen carefully, make the trade-offs visible, and help turn a broad concern into a decision that can be tested.",
    "멘토가 다른 사람의 커리어를 대신 선택할 수는 없습니다. 다만 충분히 듣고, 선택의 기준과 트레이드오프를 보이게 하고, 막연한 고민을 시험해볼 수 있는 결정으로 바꾸는 일은 도울 수 있습니다.",
  ],
  [
    "That is what stayed with me from KDD: a large community event can create momentum, but one focused conversation can help someone decide where to place it.",
    "KDD에서 오래 남은 것도 이 점입니다. 큰 커뮤니티 행사가 움직일 힘을 만든다면, 한 번의 집중된 대화는 그 힘을 어디에 쓸지 정하는 데 도움을 줄 수 있습니다.",
  ],
  ["Official event", "공식 이벤트"],
  [
    "AI & Design: New Workflows with Lovable",
    "AI & Design: New Workflows with Lovable 디자이너를 위한 AI 해커톤 & 밋업",
  ],
  ["Burnaby · Mar 22, 2026", "버나비 · 2026년 3월 22일"],
  ["Hosted by", "주최"],
  ["With Dan Jeong and Sue Hwang", "게스트 Dan Jeong, Sue Hwang"],
  ["Supported by", "후원"],
  ["Community & technology partners", "커뮤니티 및 기술 파트너"],
  [
    "A Korean-language workshop for designers in Metro Vancouver",
    "메트로 밴쿠버의 디자이너를 위한 한국어 워크숍",
  ],
  ["Skills", "역량"],
  ["Workshop Design", "워크숍 설계"],
  ["Community Building", "커뮤니티 빌딩"],
  ["Problem Framing", "문제 정의"],
  ["Rapid Prototyping", "빠른 프로토타이핑"],
  ["Facilitation", "퍼실리테이션"],
  [
    "AI & Design · Lovable mini hackathon · Burnaby · Mar 2026",
    "AI & Design · Lovable 미니 해커톤 · 버나비 · 2026년 3월",
  ],
  [
    "I co-hosted a hands-on workshop where designers moved from rough ideas to working prototypes. The speed was impressive. What it revealed about problem framing mattered more.",
    "디자이너들이 아이디어를 실제 프로토타입으로 만드는 실습형 워크숍을 공동 주최했습니다. 제작 속도도 인상적이었지만, 더 중요했던 건 그 속도가 문제 정의의 수준을 그대로 드러냈다는 점입니다.",
  ],
  ["Co-host / Workshop design / Community facilitation", "공동 주최 / 워크숍 설계 / 커뮤니티 퍼실리테이션"],
  ["View event", "이벤트 보기"],
  [
    "Designers, speakers, volunteers, and hosts at the end of the workshop in Burnaby.",
    "버나비 워크숍을 마친 뒤 함께한 디자이너, 연사, 자원봉사자, 주최자들.",
  ],
  ["Why we made this event", "왜 이 행사를 만들었나"],
  [
    "AI was already everywhere in design conversations. But many designers around us were still asking the same practical question: where do I actually start?",
    "AI는 이미 디자인 업계의 모든 대화에 등장하고 있었습니다. 하지만 주변의 많은 디자이너는 여전히 같은 현실적인 질문을 하고 있었습니다. 그래서 어디서부터 시작해야 할까?",
  ],
  [
    "Most AI meetups were built around engineering. So Eun Ahn and I wanted to create a room where designers could learn in the language of design, try a tool without pretending to be experts, and leave with something they had built themselves.",
    "대부분의 AI 밋업은 엔지니어 중심이었습니다. So Eun Ahn님과 저는 디자이너가 디자인의 언어로 배우고, 전문가인 척하지 않아도 도구를 직접 써보고, 자신이 만든 결과물을 가지고 돌아갈 수 있는 자리를 만들고 싶었습니다.",
  ],
  [
    "The event filled up. The official page listed 40 attendees, and the room brought together UX, product, graphic, brand, and motion designers from Metro Vancouver. The range of backgrounds mattered because the workshop was not testing coding knowledge. It was testing how people found a problem, shaped an experience, and made their thinking tangible.",
    "행사는 조기 마감됐고, 공식 페이지에는 40명이 참석 예정으로 표시됐습니다. 메트로 밴쿠버의 UX, 프로덕트, 그래픽, 브랜드, 모션 디자이너가 한자리에 모였습니다. 이 워크숍이 확인하려던 것은 코딩 실력이 아니었습니다. 문제를 찾고, 경험을 설계하고, 자신의 생각을 실제로 만들어내는 과정이었습니다.",
  ],
  ["Format", "구성"],
  [
    "Lightning talk, live Lovable workshop, team build, demos, finalist pitches, and awards",
    "라이트닝 토크, Lovable 라이브 워크숍, 팀 빌딩, 데모, 파이널리스트 발표와 시상",
  ],
  ["Teams", "팀 구성"],
  ["Randomly formed groups of three designers", "현장에서 무작위로 구성한 디자이너 3인 1팀"],
  ["Speakers", "연사"],
  ["Dan Jeong, Lovable Ambassador; Sue Hwang, Product Designer", "Dan Jeong, Lovable 앰배서더 / Sue Hwang, 프로덕트 디자이너"],
  ["Partners", "파트너"],
  ["KDNEW, Lovable, and Canbu", "KDNEW, Lovable, Canbu"],
  ["Make the workflow visible first", "먼저 작업 과정을 눈앞에 보여줬다"],
  [
    "Before the hackathon, the speakers made two different AI workflows concrete. Sue Hwang showed how she used Claude and Codex to build a Figma plugin as a designer. Dan Jeong then took the room through Lovable, from the first prompt to a working product flow.",
    "해커톤을 시작하기 전에 두 연사가 서로 다른 AI 작업 방식을 구체적으로 보여줬습니다. Sue Hwang은 디자이너로서 Claude와 Codex를 활용해 Figma 플러그인을 만든 과정을 공유했습니다. Dan Jeong은 첫 프롬프트부터 실제로 작동하는 제품 흐름까지 Lovable을 사용하는 과정을 직접 보여줬습니다.",
  ],
  [
    "That sequence was intentional. We did not want to start with a blank prompt box and call it empowerment. People needed to see how a designer breaks work into steps, checks the result, and keeps control of the experience.",
    "이 순서는 의도적으로 설계했습니다. 빈 프롬프트 창부터 보여주고 가능성이 열렸다고 말하고 싶지는 않았습니다. 디자이너가 일을 어떻게 나누고, 결과를 확인하며, 경험에 대한 주도권을 유지하는지 먼저 볼 필요가 있었습니다.",
  ],
  [
    "Sue Hwang shared the workflow behind building a Figma plugin with AI agents.",
    "Sue Hwang이 AI 에이전트로 Figma 플러그인을 만든 작업 과정을 공유했습니다.",
  ],
  [
    "Dan Jeong introduced a practical Lovable workflow before the team build began.",
    "팀 빌딩을 시작하기 전, Dan Jeong이 실전 Lovable 워크플로를 소개했습니다.",
  ],
  ["Then the room had 90 minutes to build", "그리고 90분 동안 직접 만들었다"],
  [
    "Once the timer started, rough ideas became products quickly. One team designed Sircle, a dating service for seniors that started with safety and trust instead of swipe speed. Another built an English-learning app for newcomers that paired practical phrases with Canadian cultural context.",
    "타이머가 시작되자 거친 아이디어가 빠르게 제품의 형태를 갖추기 시작했습니다. 한 팀은 스와이프 속도보다 안전과 신뢰에서 출발한 시니어 데이팅 서비스 Sircle을 만들었습니다. 다른 팀은 실용 영어 표현과 캐나다의 문화적 맥락을 함께 제공하는 신규 이민자용 영어 학습 앱을 만들었습니다.",
  ],
  [
    "Other teams explored a community meal-prep platform and an affirmation app that keeps social media locked until the user speaks the phrase correctly. These were not polished products. They were working arguments: a way to see whether the problem, flow, and core interaction held together outside a static screen.",
    "또 다른 팀들은 커뮤니티 기반 밀프렙 플랫폼과 사용자가 문장을 정확히 말할 때까지 소셜미디어를 잠그는 확언 앱을 실험했습니다. 완성된 제품은 아니었습니다. 문제와 흐름, 핵심 인터랙션이 정지된 화면 밖에서도 작동하는지 확인할 수 있는 검증 가능한 가설이었습니다.",
  ],
  [
    "Teams used the build time to test prompts, inspect flows, and help one another through the rough edges.",
    "팀들은 빌딩 시간 동안 프롬프트를 테스트하고 흐름을 점검하며, 막히는 지점에서 서로를 도왔습니다.",
  ],
  ["Speed changed. Judgment still mattered.", "속도는 달라졌다. 판단은 여전히 중요했다."],
  [
    "The most interesting shift was not that AI made the work faster. It was that faster output exposed the quality of the thinking sooner.",
    "가장 흥미로운 변화는 AI가 작업을 빠르게 만들었다는 사실이 아니었습니다. 결과물이 빨리 나오면서 생각의 수준도 더 일찍 드러난다는 점이었습니다.",
  ],
  [
    "If the problem was vague, the prototype became vague just as quickly. If the team had a clear user, a specific tension, and one interaction worth testing, Lovable helped them bring that clarity to life. The tool compressed the distance between an idea and something people could react to. It did not decide which idea deserved to exist.",
    "문제가 모호하면 프로토타입도 빠르게 모호해졌습니다. 반대로 사용자가 분명하고, 구체적인 긴장이 있으며, 검증할 가치가 있는 인터랙션이 하나라도 있으면 Lovable은 그 명확함을 빠르게 실제 경험으로 만들었습니다. 도구는 아이디어와 사람들이 반응할 수 있는 결과물 사이의 거리를 줄였습니다. 어떤 아이디어를 만들어야 하는지까지 결정해주지는 않았습니다.",
  ],
  [
    "A faster prototype is useful because it gives us better questions sooner.",
    "빠른 프로토타입의 가치는 더 나은 질문을 더 일찍 마주하게 해준다는 데 있습니다.",
  ],
  [
    "This is where I think the designer's role is expanding. Designers do not need to become engineers or learn every part of a codebase. But we do need to become builders: people who can shape an idea, make it testable, inspect how it behaves, and collaborate with engineering from a more concrete starting point.",
    "저는 이 지점에서 디자이너의 역할이 넓어진다고 생각합니다. 디자이너가 엔지니어가 되거나 코드베이스의 모든 부분을 배울 필요는 없습니다. 하지만 아이디어를 다듬고, 검증 가능한 형태로 만들고, 실제 동작을 살펴보며, 더 구체적인 상태에서 엔지니어와 협업할 수 있는 빌더는 되어야 합니다.",
  ],
  ["The community was part of the workflow", "커뮤니티도 워크플로의 일부였다"],
  [
    "People came in curious and, in many cases, unsure. They left their own teams to look at another screen, fix a prompt, or explain what had worked. That movement around the room mattered as much as the demos.",
    "사람들은 호기심과 약간의 불확실함을 가지고 행사장에 들어왔습니다. 자신의 팀을 떠나 다른 팀의 화면을 보고, 프롬프트를 고치고, 무엇이 효과가 있었는지 설명했습니다. 행사장을 오가며 생긴 이 교류는 데모만큼 중요했습니다.",
  ],
  [
    "A useful workshop is not a long presentation followed by a rushed exercise. It creates enough structure for people to begin, enough pressure to make a decision, and enough trust for unfinished work to be shared openly.",
    "좋은 워크숍은 긴 발표 뒤에 급하게 실습을 붙이는 방식이 아닙니다. 사람들이 시작할 수 있는 충분한 구조, 결정을 내리게 하는 적당한 압력, 완성되지 않은 작업도 솔직하게 공유할 수 있는 신뢰가 필요합니다.",
  ],
  [
    "My takeaway was simple. AI can help designers move from an idea to a working experience much sooner. But better products still start with better questions, and those questions get stronger when people build, test, and reflect together.",
    "제가 얻은 결론은 단순했습니다. AI는 디자이너가 아이디어를 실제로 작동하는 경험으로 훨씬 빠르게 옮길 수 있게 합니다. 하지만 더 나은 제품은 여전히 더 나은 질문에서 시작합니다. 그리고 그 질문은 함께 만들고, 테스트하고, 돌아볼 때 더 강해집니다.",
  ],
  ["What participants took away", "참가자들이 남긴 이야기"],
  [
    "The reviews pointed to two outcomes: people learned a useful new tool, and they experienced a different pace of collaboration firsthand.",
    "후기에서 공통으로 보인 건 두 가지였습니다. 새로운 도구를 배웠고, 이전과 다른 협업의 속도를 직접 경험했다는 점입니다.",
  ],
  ["5/5 · Survey response · Mar 23", "5/5 · 설문 응답 · 3월 23일"],
  ["5/5 · Survey response · Mar 22", "5/5 · 설문 응답 · 3월 22일"],
  [
    "I was worried that, as a job seeker, I might not be able to keep up with the working professionals in the room. The clear explanations and credits provided in advance helped me follow along. Experiencing the path from the talks to building directly in Lovable made it incredibly valuable.",
    "현장에는 현직자분도 많이 계셔서 저 같은 취준생이 따라갈 수 있을까 걱정이 많았는데 설명도 너무 잘 해주시고 사전에 제공해주신 크레딧 덕분에 충분히 따라갈 수 있었던 것 같습니다. 스피킹부터 직접 Lovable로 제작 플로우까지 경험해볼 수 있어 너무 값진 경험이었습니다 :)",
  ],
  [
    "The program made practical experience possible in a short time. Watching people collaborate under pressure and build a working app with AI in only an hour made me feel that “the future is already here.” It also reinforced that business value comes from combining AI with each person’s experience and domain knowledge.",
    "짧은 시간 안에 실전 경험을 할 수 있도록 구성된 프로그램이었습니다. 시간 압박 속에서도 빠르게 협업하고 결과물을 만들어내는 모습이 매우 인상적이었고, 여기에 AI 도구까지 결합되면서 단 1시간 내에 실제로 작동하는 앱이 만들어지는 과정을 보며, “미래가 이미 와 있구나”라는 것을 강하게 느꼈습니다. 다만 AI만으로 소프트웨어 영역에서 경쟁하는 것보다는, 각자의 경험과 도메인 지식을 기반으로 비즈니스적인 가치를 만들어내는 방향이 더 중요하다는 생각도 함께 하게 되었습니다.",
  ],
  [
    "It was especially interesting to see how working designers use AI and what they actually produce. It was more than a hackathon: the sessions where So Eun, Sue, and Dan shared their approaches and experience added much deeper insight. The whole event felt polished and immediately useful in practice.",
    "이번 이벤트는 특히 현업 디자이너들이 AI를 어떻게 활용하는지, 그리고 실제로 어떤 결과물이 나오는지 직접 볼 수 있어서 굉장히 흥미롭고 유익한 시간이었어요. 단순한 해커톤이 아니라, 소은님, Sue님, Dan님의 AI 활용 방식과 경험을 공유해주는 세션이 함께 있어서 더 깊이 있는 인사이트를 얻을 수 있었던 점이 정말 좋았습니다. 전체적으로 퀄리티가 높고, 실무적으로도 바로 적용해볼 수 있는 정말 좋은 이벤트였습니다 🙌",
  ],
  [
    "On March 22, I co-hosted a sold-out, Korean-language AI workshop and mini hackathon for 40 designers in Metro Vancouver. We combined practitioner talks, a live Lovable workshop, and a 90-minute team build. By the end, first-time users were presenting working apps.",
    "3월 22일, 메트로 밴쿠버의 디자이너 40명과 함께 한국어 AI 워크숍 겸 미니 해커톤을 공동 주최했습니다. 현업 디자이너들의 발표, Lovable 라이브 실습, 90분 팀 빌딩을 하나의 흐름으로 묶었습니다. Lovable을 처음 써본 참가자들도 마지막에는 직접 만든 앱을 발표했습니다.",
  ],
  ["A room for designers to build, not just listen", "듣는 데서 끝나지 않는 자리를 만들고 싶었다"],
  [
    "AI had become impossible to ignore, but a familiar gap kept showing up in conversations with designers around us. Everyone had heard about vibe coding. Far fewer had found a place to try it from a designer's point of view.",
    "AI를 모른 척하기 어려운 시기였습니다. 그런데 주변 디자이너들과 이야기하다 보면 비슷한 간극이 계속 보였습니다. 바이브 코딩이라는 말은 많이 들었지만, 디자이너의 관점에서 직접 시도해볼 자리는 많지 않았습니다.",
  ],
  [
    "Most AI events were built around engineering. So Eun Ahn and I wanted to create a Korean-language event where designers could see real workflows, try a tool without pretending to be experts, and leave with something they had built themselves.",
    "대부분의 AI 행사는 엔지니어를 중심으로 열렸습니다. So Eun Ahn님과 저는 디자이너가 실제 작업 과정을 보고, 전문가인 척하지 않아도 도구를 써보고, 자신이 만든 결과물까지 가져갈 수 있는 한국어 행사를 만들고 싶었습니다.",
  ],
  [
    "Registration filled up, even after we opened a few extra spots. The official event page listed 40 attendees from UX, product, graphic, brand, and motion design across Metro Vancouver. As a co-host, I helped shape the workshop flow, facilitate the teams, and move the room from listening to building and sharing.",
    "몇 자리를 추가로 열었는데도 신청은 빠르게 마감됐습니다. 공식 이벤트 페이지에는 메트로 밴쿠버의 UX, 프로덕트, 그래픽, 브랜드, 모션 디자이너 40명이 참석자로 표시됐습니다. 저는 공동 주최자로서 워크숍의 흐름을 함께 설계하고, 팀 진행을 돕고, 참가자들이 듣는 데서 멈추지 않고 만들고 공유하는 데까지 갈 수 있도록 현장을 운영했습니다.",
  ],
  [
    "Practitioner talks, live Lovable workshop, 90-minute team build, demos, finalist pitches, and awards",
    "현업 세션, Lovable 라이브 워크숍, 90분 팀 빌딩, 데모, 파이널리스트 발표와 시상",
  ],
  ["Contributors", "진행 및 연사"],
  [
    "So Eun Ahn; Dan Jeong, Lovable Ambassador; Sue Hwang, Product Designer",
    "So Eun Ahn / Dan Jeong, Lovable 앰배서더 / Sue Hwang, 프로덕트 디자이너",
  ],
  ["We designed the day as one continuous build", "발표와 실습을 하나의 빌드 과정으로 묶었다"],
  [
    "We did not open a blank prompt box and tell everyone to start. The first half of the event made three parts of an AI-enabled design workflow visible.",
    "빈 프롬프트 창을 열어두고 바로 시작하라고 하지는 않았습니다. 행사의 전반부에서는 AI를 활용한 디자인 워크플로의 세 가지 장면을 먼저 보여줬습니다.",
  ],
  [
    "So Eun shared how designers can use Git and a shared codebase to collaborate more closely with engineers and with one another. Sue Hwang walked through how she built a Figma plugin with Claude and Codex, step by step, as a designer. Dan Jeong then moved from explanation to a live Lovable build, showing how a prompt becomes an editable product flow.",
    "So Eun님은 디자이너가 Git과 하나의 코드베이스를 활용해 엔지니어, 다른 디자이너와 더 가깝게 협업하는 방법을 공유했습니다. Sue Hwang은 디자이너로서 Claude와 Codex를 활용해 Figma 플러그인을 만든 과정을 단계별로 보여줬습니다. 이어 Dan Jeong은 Lovable 라이브 빌드를 진행하며 첫 프롬프트가 수정 가능한 제품 흐름으로 바뀌는 과정을 설명했습니다.",
  ],
  [
    "Each participant received 100 Lovable credits in advance. Then we formed random teams of three and gave them 90 minutes to choose a problem, define one core experience, and make it work well enough to share. The sessions were not separate lectures before a hackathon. They were the setup for the build.",
    "참가자 전원에게는 Lovable 크레딧 100개를 미리 제공했습니다. 이후 무작위로 3인 팀을 만들고, 문제 하나와 핵심 경험 하나를 정해 90분 안에 공유 가능한 수준으로 구현하게 했습니다. 앞의 발표들은 해커톤 전에 따로 붙인 강연이 아니었습니다. 직접 만들기 위해 필요한 준비 과정이었습니다.",
  ],
  [
    "Dan Jeong introduced a practical Lovable workflow before the team challenge began.",
    "팀 챌린지를 시작하기 전, Dan Jeong이 실전 Lovable 워크플로를 소개했습니다.",
  ],
  ["Ninety minutes later, the ideas were working", "90분 뒤, 아이디어가 실제로 움직이기 시작했다"],
  [
    "Crystal Park and Leiah Choi won the mini hackathon with Sircle, a dating service for seniors. Instead of starting with faster matching, they started with a more useful question: how can an older adult know that a new connection is safe and trustworthy?",
    "미니 해커톤 우승팀인 Crystal Park과 Leiah Choi는 시니어 데이팅 서비스 Sircle을 만들었습니다. 더 빠른 매칭보다 먼저 던진 질문이 좋았습니다. 고령의 사용자가 새로운 만남을 안전하고 신뢰할 수 있다고 느끼려면 무엇이 필요할까?",
  ],
  [
    "Another team built an English-learning app for newcomers that paired practical phrases with Canadian cultural context. Other teams created a community meal-prep platform and an affirmation app that kept social media locked until the user spoke the phrase correctly.",
    "다른 팀은 실용 영어 표현에 캐나다의 문화적 맥락을 더한 신규 이민자용 영어 학습 앱을 만들었습니다. 동료의 레시피를 참고할 수 있는 커뮤니티 기반 밀프렙 플랫폼, 사용자가 문장을 정확히 말할 때까지 소셜미디어를 잠그는 확언 앱도 나왔습니다.",
  ],
  [
    "None of these were finished products. That was not the point. Each team had enough of a working experience to explain the user, the problem, and the core interaction, then see where the idea held up and where it did not.",
    "물론 90분 만에 완성된 제품을 만든 것은 아닙니다. 그게 목적도 아니었습니다. 각 팀은 사용자와 문제, 핵심 인터랙션을 설명할 수 있을 만큼 작동하는 경험을 만들었습니다. 덕분에 아이디어의 어떤 부분이 설득력 있고, 어디가 아직 모호한지 바로 확인할 수 있었습니다.",
  ],
  [
    "Teams tested prompts, inspected flows, and helped one another through the rough edges.",
    "팀들은 프롬프트를 테스트하고 흐름을 점검하며, 막히는 지점에서 서로를 도왔습니다.",
  ],
  ["What the room felt like", "사람들이 즐긴 건 결과물만이 아니었다"],
  [
    "At the beginning, people stayed close to their own laptops. Halfway through, they were standing behind other teams, comparing flows, fixing prompts, and explaining what had worked. The room felt less like a class and more like a temporary product studio.",
    "처음에는 모두 자기 팀의 노트북 앞에 머물렀습니다. 시간이 조금 지나자 다른 팀의 화면 뒤에 모여 흐름을 비교하고, 프롬프트를 고치고, 잘된 방법을 설명하기 시작했습니다. 행사장은 강의실보다 잠시 만들어진 하나의 프로덕트 스튜디오에 가까워졌습니다.",
  ],
  [
    "The small operational details mattered too. Participants later mentioned the venue, pacing, food, snacks, and coffee as part of what helped them stay comfortable and focused. A useful workshop is not only the content on the screen. It is the structure and care that let people participate without worrying about whether they belong in the room.",
    "작은 운영 요소도 중요했습니다. 참가자들은 후기에서 장소와 시간 배분, 식사와 다과, 커피까지 편안하게 몰입할 수 있었던 이유로 언급했습니다. 좋은 워크숍은 화면에 띄운 콘텐츠만으로 완성되지 않습니다. 내가 이 자리에 있어도 되는지 걱정하지 않고 참여할 수 있게 만드는 구조와 배려도 필요합니다.",
  ],
  [
    "That became one of the clearest signs that the event worked. A job seeker who had worried about keeping up with working professionals could follow the build. People who had never used Lovable made functional prototypes. Experienced designers openly shared how they were using AI in real work.",
    "행사가 잘 작동했다는 가장 분명한 신호도 여기서 보였습니다. 현직자들 사이에서 따라갈 수 있을지 걱정했던 취업 준비생도 끝까지 실습을 마쳤습니다. Lovable을 처음 쓴 사람들도 기능이 작동하는 프로토타입을 만들었습니다. 현업 디자이너들은 실제 업무에서 AI를 활용하는 과정을 숨김없이 공유했습니다.",
  ],
  [
    "The reviews pointed to more than excitement about a new tool. People valued seeing real workflows, building under a clear time limit, and learning from others with different levels of experience.",
    "후기에서 공통으로 보인 건 새로운 도구에 대한 흥분만이 아니었습니다. 실제 작업 과정을 보고, 제한된 시간 안에 직접 만들고, 서로 다른 경험을 가진 사람들과 배우는 과정 자체를 높게 평가했습니다.",
  ],
  ["What I took away as a co-host", "공동 주최자로서 남은 생각"],
  [
    "AI changed the speed of the work. In 90 minutes, people with little or no Lovable experience moved from an idea to something functional. But the clearest products did not come from the cleverest prompts. They came from teams that had a specific person, a real tension, and one interaction worth testing.",
    "AI는 작업 속도를 분명히 바꿨습니다. Lovable 경험이 거의 없던 사람도 90분 만에 아이디어를 기능이 작동하는 결과물로 옮겼습니다. 하지만 가장 분명한 제품을 만든 팀은 프롬프트를 가장 영리하게 쓴 팀이 아니었습니다. 구체적인 사용자와 실제 긴장, 검증할 가치가 있는 인터랙션 하나를 정한 팀이었습니다.",
  ],
  [
    "AI shortened the distance from idea to prototype. It did not choose the problem worth solving.",
    "AI는 아이디어와 프로토타입 사이의 거리를 줄였습니다. 어떤 문제를 풀지는 대신 정해주지 않았습니다.",
  ],
  [
    "The event worked because people completed the whole loop: see a workflow, choose a problem, build with others, and share unfinished work. They did not leave as AI experts. They left knowing they could start, and with a clearer sense of where their judgment still mattered.",
    "이번 행사가 의미 있었던 이유는 참가자들이 전체 과정을 끝까지 경험했기 때문입니다. 작업 방식을 보고, 문제를 정하고, 낯선 사람과 함께 만들고, 미완성인 결과물을 공유했습니다. 모두가 AI 전문가가 되어 돌아간 것은 아닙니다. 대신 나도 시작할 수 있다는 감각과, 여전히 자신의 판단이 필요한 지점을 더 분명히 알게 됐습니다.",
  ],
  [
    "That is the kind of AI event I want to keep helping create: practical enough to try now, structured enough to learn from, and open enough for people to build in public.",
    "앞으로도 이런 AI 행사를 함께 만들고 싶습니다. 지금 바로 시도할 수 있을 만큼 실용적이고, 경험에서 배울 수 있을 만큼 구조적이며, 미완성인 생각도 사람들 앞에서 꺼내놓을 수 있는 자리 말입니다.",
  ],
  [
    "I co-hosted a sold-out Korean-language workshop where 40 designers moved from practitioner talks to a 90-minute team build and working prototypes.",
    "현업 세션부터 90분 팀 빌딩까지 이어지는 한국어 워크숍을 공동 주최했습니다. 디자이너 40명이 Lovable로 작동하는 프로토타입을 만들었습니다.",
  ],
  [
    "Portfolio Roast: A Live Mock Interview & Fireside Talk for UX Designers",
    "Portfolio Roast: UX 디자이너를 위한 실전 포트폴리오 인터뷰 & 피드백 세션",
  ],
  [
    "I helped organize an evening where two designers presented their portfolios live and more than 20 peers learned from the questions, feedback, and honest career conversation that followed.",
    "두 명의 디자이너가 포트폴리오를 실전처럼 발표하고, 20명 이상의 동료 디자이너가 이어진 질문과 피드백, 솔직한 커리어 대화에서 함께 배운 행사를 운영팀으로 준비했습니다.",
  ],
  ["Event Operations", "행사 운영"],
  [
    "Portfolio Roast · Live mock interview · Burnaby · Nov 2025",
    "Portfolio Roast · 실전 모의 인터뷰 · 버나비 · 2025년 11월",
  ],
  [
    "I helped organize a live portfolio mock interview and fireside talk for more than 20 designers in Burnaby. Two designers presented their case studies with Carlos Melendez, Principal User Experience Designer at Oracle, while the room learned from the questions, feedback, and honest career conversation that followed.",
    "버나비에서 20명 이상의 디자이너가 참여한 실전 포트폴리오 모의 인터뷰와 파이어사이드 토크를 함께 준비했습니다. 두 명의 디자이너가 Oracle의 Principal User Experience Designer인 Carlos Melendez와 함께 케이스 스터디를 발표했고, 참가자들은 이어진 질문과 피드백, 솔직한 커리어 대화를 함께 들었습니다.",
  ],
  [
    "Organizing team / Event operations / Community facilitation",
    "운영팀 / 행사 운영 / 커뮤니티 퍼실리테이션",
  ],
  [
    "More than 20 designers gathered for live portfolio mock interviews, a fireside talk, and an open Q&A in Burnaby.",
    "20명 이상의 디자이너가 실전 포트폴리오 모의 인터뷰와 파이어사이드 토크, 공개 Q&A를 위해 버나비에 모였습니다.",
  ],
  ["A portfolio reads differently when you have to present it", "포트폴리오는 발표하는 순간 다르게 보인다"],
  [
    "Portfolio work is usually done alone. Designers can spend weeks editing a case study, but they often do not learn how the story lands until a real interview begins.",
    "포트폴리오는 대부분 혼자 만듭니다. 몇 주 동안 케이스 스터디를 다듬어도 그 이야기가 상대에게 어떻게 들리는지는 실제 인터뷰가 시작되어야 알게 되는 경우가 많습니다.",
  ],
  [
    "We wanted to make that moment less private and less intimidating. Portfolio Roast put real case studies into a live interview setting, then opened the questions and feedback to the room so everyone could learn from the same conversation.",
    "우리는 그 순간을 조금 덜 낯설고, 덜 부담스럽게 만들고 싶었습니다. Portfolio Roast는 실제 케이스 스터디를 라이브 인터뷰 상황에 놓고, 그 자리에서 나온 질문과 피드백을 모두에게 열어 같은 대화에서 함께 배울 수 있도록 만든 행사였습니다.",
  ],
  [
    "So Eun Ahn brought together the guest, presenters, and community. I worked with So Eun and Suryeon Kim on the organizing team, supporting the program flow and the experience in the room. The official event page listed 25 attendees, and the event recap confirmed that more than 20 designers joined us that evening.",
    "So Eun Ahn님이 게스트와 발표자, 커뮤니티를 한자리에 모았습니다. 저는 So Eun님, Suryeon Kim님과 운영팀으로 함께하며 프로그램의 흐름과 현장 경험을 지원했습니다. 공식 이벤트 페이지에는 25명이 참석자로 표시됐고, 행사 회고에서는 20명 이상의 디자이너가 함께했다고 확인했습니다.",
  ],
  [
    "Live mock interviews, expert feedback, fireside talk, audience Q&A, and networking",
    "실전 모의 인터뷰, 전문가 피드백, 파이어사이드 토크, 참가자 Q&A, 네트워킹",
  ],
  ["Guest", "게스트"],
  [
    "Carlos Melendez, Principal User Experience Designer at Oracle",
    "Carlos Melendez, Oracle Principal User Experience Designer",
  ],
  ["Presenters", "발표자"],
  ["Hayley Lee and Sue Lee", "Hayley Lee, Sue Lee"],
  ["Organizing team", "운영팀"],
  ["So Eun Ahn, Erik Park, and Suryeon Kim", "So Eun Ahn, Erik Park, Suryeon Kim"],
  ["Partner", "파트너"],
  ["KDNEW", "KDNEW"],
  [
    "The evening opened with the people and purpose behind the event before moving into the live sessions.",
    "라이브 세션을 시작하기 전, 이 행사를 함께 만든 사람들과 목적을 먼저 소개했습니다.",
  ],
  ["We put the portfolio into an interview, not a slideshow", "슬라이드 리뷰 대신, 실제 인터뷰에 가깝게"],
  [
    "Hayley Lee and Sue Lee each presented a portfolio case study in front of the room. Carlos responded as an experienced interviewer would: he listened to the story, asked for missing context, and gave direct feedback on what made the work easier or harder to evaluate.",
    "Hayley Lee와 Sue Lee는 각자의 포트폴리오 케이스 스터디를 참가자들 앞에서 발표했습니다. Carlos는 실제 인터뷰어처럼 이야기를 듣고, 빠진 맥락을 질문하고, 어떤 부분이 작업을 이해하기 쉽게 만들거나 어렵게 만드는지 직접 피드백했습니다.",
  ],
  [
    "The live format changed the value of the critique. A question asked of one presenter was useful to everyone. People could see where a polished screen still needed a clearer decision, where the outcome needed stronger evidence, and where the story became easier to follow once the presenter explained the context aloud.",
    "라이브 형식은 피드백의 범위를 바꿨습니다. 한 발표자에게 던진 질문이 모두에게 배움이 됐습니다. 화면은 잘 정리됐지만 결정의 이유가 더 필요한 지점, 결과를 뒷받침할 근거가 부족한 지점, 발표자가 맥락을 설명하자 비로소 이해되기 시작한 지점을 함께 볼 수 있었습니다.",
  ],
  [
    "The mock interviews made the questions behind portfolio evaluation visible to the whole room.",
    "모의 인터뷰를 통해 포트폴리오를 평가할 때 실제로 오가는 질문을 모두에게 공개했습니다.",
  ],
  [
    "The fireside talk followed the questions designers actually carry",
    "파이어사이드 토크는 디자이너들이 실제로 품고 있던 질문으로 이어졌다",
  ],
  [
    "After the presentations, the conversation moved from the individual case studies to the wider questions designers were already bringing into interviews and day-to-day work.",
    "발표가 끝난 뒤에는 개별 케이스 스터디를 넘어, 디자이너들이 인터뷰와 실제 업무에서 계속 마주하는 질문으로 대화를 넓혔습니다.",
  ],
  ["Theme", "주제"],
  ["Questions we discussed", "함께 나눈 질문"],
  ["Portfolio and résumé", "포트폴리오와 이력서"],
  [
    "The right level of case-study detail, what makes work memorable, visual clarity, and how to position experience from graphic design or marketing",
    "케이스 스터디에 필요한 디테일의 수준, 기억에 남는 근거, 시각적 명확성, 그래픽 디자인이나 마케팅 경험을 UX 경력으로 연결하는 방법",
  ],
  ["Interview expectations", "인터뷰와 디자이너 역량"],
  [
    "What separates junior, intermediate, and senior designers, and which interview behaviours create a negative impression",
    "주니어·인터미디어트·시니어를 구분하는 기준과 인터뷰에서 부정적인 인상을 만드는 행동",
  ],
  ["Collaboration and career", "협업과 커리어"],
  [
    "How to explain design decisions to cross-functional partners, which skills matter in the AI era, and what junior designers should focus on in a difficult job market",
    "크로스펑셔널 파트너에게 디자인 결정을 설명하는 방법, AI 시대에 필요한 역량, 어려운 채용 시장에서 주니어 디자이너가 집중할 부분",
  ],
  [
    "The timing mattered. These were not abstract career questions asked at the beginning of the night. Everyone had just watched two real stories being presented and questioned, so the advice had something concrete to attach to.",
    "이 대화가 구체적으로 들린 데는 순서도 중요했습니다. 행사를 시작하자마자 추상적인 커리어 조언부터 꺼낸 것이 아니었습니다. 모두가 두 개의 실제 포트폴리오가 발표되고 질문받는 과정을 본 직후였기 때문에, 조언을 자신의 작업과 바로 연결해볼 수 있었습니다.",
  ],
  ["One person's feedback became shared learning", "한 사람의 피드백이 모두의 학습이 됐다"],
  [
    "Portfolio feedback is often a private exchange between a reviewer and one designer. Here, more than 20 people could watch the same story, hear the same question, and compare it with their own work.",
    "포트폴리오 피드백은 보통 리뷰어와 한 명의 디자이너 사이에서 끝납니다. 이번에는 20명 이상의 참가자가 같은 이야기를 보고, 같은 질문을 듣고, 자신의 작업과 비교할 수 있었습니다.",
  ],
  [
    "That made the room feel less like a panel and more like a working session. The presenters were generous enough to show unfinished parts of their stories. The audience listened closely, asked follow-up questions, and stayed for the conversations that continued after the formal program.",
    "덕분에 행사장은 심사받는 자리보다 함께 포트폴리오를 살펴보는 세션에 가까워졌습니다. 발표자들은 아직 완벽하지 않은 이야기까지 기꺼이 꺼내놓았습니다. 참가자들은 집중해서 듣고 후속 질문을 던졌고, 공식 프로그램이 끝난 뒤에도 대화를 이어갔습니다.",
  ],
  [
    "Presenter · LinkedIn reflection · Dec 2, 2025",
    "발표자 · LinkedIn 회고 · 2025년 12월 2일",
  ],
  [
    "“On November 18th, I gave my first solo presentation about ‘Lento’.”",
    "“11월 18일, Lento 프로젝트로 첫 단독 발표를 했습니다.”",
  ],
  [
    "In her recap, Sue thanked Carlos for the encouragement he gave her just before the presentation and the audience for listening with warmth. For me, that was the clearest outcome of the event: it gave someone a place to practise something difficult before the next real interview.",
    "Sue님은 회고에서 발표 직전 용기를 준 Carlos와 따뜻하게 들어준 참가자들에게 감사를 전했습니다. 저에게는 이것이 행사의 가장 분명한 결과였습니다. 다음 실제 인터뷰 전에 어려운 일을 안전하게 연습해볼 수 있는 자리를 만들었다는 점입니다.",
  ],
  ["What stayed with me as an organizer", "운영팀으로서 남은 생각"],
  [
    "A useful portfolio review cannot stop at making the page look more polished. It has to test whether the designer can explain the problem, the decisions, and the evidence when another person starts asking questions.",
    "좋은 포트폴리오 리뷰는 화면을 더 매끈하게 만드는 조언에서 끝나면 안 됩니다. 다른 사람이 질문을 시작했을 때도 문제와 결정, 근거를 설명할 수 있는지까지 확인해야 합니다.",
  ],
  [
    "A portfolio is not only a finished page. It is a story that has to hold together when the questions begin.",
    "포트폴리오는 완성된 페이지가 아니라, 질문이 시작되어도 이어지는 이야기여야 합니다.",
  ],
  [
    "The evening did not give everyone one perfect portfolio template. It made the evaluation process more visible. Designers left with clearer standards, better questions, and a more realistic sense of what they needed to practise next.",
    "이날 모두에게 하나의 완벽한 포트폴리오 템플릿을 준 것은 아닙니다. 대신 평가가 이루어지는 과정을 더 잘 보이게 만들었습니다. 참가자들은 조금 더 분명한 기준과 더 나은 질문, 그리고 다음에 무엇을 연습해야 하는지에 대한 현실적인 감각을 가지고 돌아갔습니다.",
  ],
  [
    "That is what I want a community event to do. Create enough structure for honest feedback, and enough trust for people to share work before it feels completely ready.",
    "제가 만들고 싶은 커뮤니티 행사의 역할도 여기에 있습니다. 솔직한 피드백이 오갈 수 있는 구조와, 완벽하게 준비되지 않은 작업도 꺼내놓을 수 있는 신뢰를 함께 만드는 것입니다.",
  ],
  [
    "Sponsored by KDNEW · Career Fireside Chat · Jul 2026",
    "KDNEW 후원 · 커리어 파이어사이드 챗 · 2026년 7월",
  ],
  [
    "Building a Career in Canada on a Working Holiday",
    "캐나다 워킹홀리데이로 커리어를 만들어가기까지",
  ],
  [
    "I co-hosted a KDNEW-sponsored Career Fireside Chat for people who wanted to start a career in Canada while here on a working holiday. As one of five speakers, I shared why honest self-assessment should come before adopting someone else’s approach.",
    "워킹홀리데이로 캐나다에서 커리어를 시작하려는 분들을 위한 커리어 파이어사이드 챗을 공동 주최했습니다. KDNEW가 후원했고, 저는 다섯 명의 스피커 중 한 명으로 참여했습니다. 캐나다에서 커리어를 시작한 경험과 자기 객관화부터 시작해야 한다고 생각한 이유를 나눴습니다.",
  ],
  ["Co-hosting", "공동 주최"],
  ["Career Entry", "커리어 시작"],
  [
    "Sponsored by KDNEW · Career Fireside Chat · Burnaby · Jul 2026",
    "KDNEW 후원 · 커리어 파이어사이드 챗 · 버나비 · 2026년 7월",
  ],
  [
    "I co-hosted a KDNEW-sponsored Career Fireside Chat in Burnaby for people who wanted to start a career in Canada while here on a working holiday. As one of five speakers, I shared the choices and difficulties that shaped my own start—and why honest self-assessment is the first step I would take if I were beginning again.",
    "7월 25일, 워킹홀리데이로 캐나다에서 커리어를 시작하려는 분들을 위한 커리어 파이어사이드 챗을 버나비에서 공동 주최했습니다. KDNEW가 후원했고, 저는 다섯 명의 스피커 중 한 명으로 참여했습니다. 캐나다에서 커리어를 시작하며 어떤 선택을 했고 어디에서 어려움을 겪었는지, 다시 시작한다면 왜 자기 객관화부터 할지 나눴습니다.",
  ],
  ["Co-host / Speaker / Product Designer", "공동 주최 / 스피커 / 프로덕트 디자이너"],
  [
    "The challenge was deciding what applied",
    "정보는 많았지만, 내게 맞는 방법을 고르기는 어려웠습니다",
  ],
  [
    "I came to Canada on a working holiday and started my career here. In the session, I walked through the choices I made, the difficulties I encountered, and what I would examine first if I were starting over.",
    "저는 워킹홀리데이로 캐나다에 와서 커리어를 시작했습니다. 세션에서는 어떤 선택을 했고 어디에서 어려움을 겪었는지, 다시 시작한다면 무엇부터 확인할지 이야기했습니다.",
  ],
  [
    "Information about building a career in Canada is easy to find. The harder question is which advice fits your experience, strengths, English communication skills, and current situation. We shaped the event around that challenge: helping participants identify what they needed, not simply giving them more information.",
    "커리어 정보는 어렵지 않게 찾을 수 있습니다. 막상 어려웠던 건 그중 어떤 방법이 내 경험과 강점에 맞는지, 영어로 내 경험을 어느 정도 설명할 수 있는지, 지금 상황에서 무엇부터 해야 하는지 판단하는 일이었습니다. 그래서 이번 이벤트에서는 혼자 찾은 정보만으로는 알기 어려웠던 ‘내게 필요한 것’을 함께 확인해보고 싶었습니다.",
  ],
  ["Audience", "참가 대상"],
  [
    "People on working holiday who want to start a career in Canada",
    "워킹홀리데이로 캐나다에서 커리어를 시작하려는 분들",
  ],
  [
    "July 25, 2026 · 10:30 AM–1:00 PM · Burnaby, BC",
    "2026년 7월 25일 · 오전 10:30–오후 1:00 · BC주 버나비",
  ],
  [
    "Five-speaker fireside panel and networking",
    "다섯 명의 스피커가 참여한 파이어사이드 패널과 네트워킹",
  ],
  ["Co-host and speaker", "공동 주최 및 스피커"],
  ["Sponsor", "스폰서"],
  [
    "Why honest self-assessment comes first",
    "왜 자기 객관화가 먼저일까요",
  ],
  [
    "The point I emphasized was simple: start with an honest self-assessment. Before sending more applications or following someone else’s approach, I asked participants to examine their starting point through four questions.",
    "제가 가장 강조한 건 자기 객관화였습니다. 지원서를 더 보내거나 다른 사람의 방법을 따라가기 전에, 네 가지 질문으로 지금의 자신부터 살펴보자고 이야기했습니다.",
  ],
  ["“What are you good at?”", "“내가 잘하는 일은 무엇인가요?”"],
  ["“Where are you in your career right now?”", "“내 커리어는 지금 어느 단계에 있나요?”"],
  [
    "“How confidently can you communicate your experience in English?”",
    "“내 경험을 영어로 얼마나 자신 있게 설명할 수 있나요?”",
  ],
  [
    "“Can you clearly explain the value of your experience in Korea to Canadian employers?”",
    "“한국에서 쌓은 경험의 가치를 캐나다 채용 담당자에게 명확하게 설명할 수 있나요?”",
  ],
  [
    "Self-assessment is not about cataloguing weaknesses. It is about recognizing the strengths and experience you already have, understanding where you stand, and choosing a realistic next step.",
    "자기 객관화는 부족한 점만 찾는 일이 아닙니다. 이미 무엇을 갖고 있는지, 지금 어디에 서 있는지 확인하고, 다음에 무엇을 할지 정하는 과정입니다.",
  ],
  [
    "Together, the questions turned self-assessment into a practical starting point.",
    "이 질문들을 통해 참가자들이 자신을 조금 더 명확하게 바라볼 수 있기를 바랐습니다.",
  ],
  [
    "Different ways to start, not one formula",
    "서로 다른 방법을 솔직하게 나눴습니다",
  ],
  [
    "Each of the five speakers had started a career in Canada differently. We shared what we tried, how we made decisions, and where we struggled.",
    "저를 포함한 다섯 명의 스피커는 서로 다른 방법으로 캐나다에서 커리어를 시작했습니다. 무엇을 시도했고, 어떤 기준으로 선택했으며, 어디에서 막혔는지 솔직하게 나눴습니다.",
  ],
  [
    "Hearing those differences gave participants several real experiences to compare with their own situation, rather than one success story to treat as a formula.",
    "이 차이가 중요했습니다. 하나의 성공담을 정답처럼 따르기보다, 서로 다른 실제 경험을 자신의 상황과 비교해볼 수 있었기 때문입니다.",
  ],
  [
    "Networking continued after the main session",
    "메인 세션 뒤에도 네트워킹은 이어졌습니다",
  ],
  [
    "After the main session, participants exchanged LinkedIn profiles and continued conversations with others facing similar questions.",
    "메인 세션이 끝난 뒤 참가자들은 LinkedIn 프로필을 교환하며 네트워킹을 이어갔습니다. 비슷한 고민을 가진 참가자들끼리 각자의 경험과 생각을 나누는 대화도 계속됐습니다.",
  ],
  [
    "One participant later messaged me to say that the discussion about self-assessment had been especially helpful. Self-assessment was the point I had emphasized most, so that message stayed with me. It showed that the session had given at least one participant a useful way to examine what to do next.",
    "행사 뒤에는 한 참가자가 자기 객관화에 대한 이야기가 특히 도움이 됐다고 메시지를 보내왔습니다. 제가 가장 강조한 내용이 실제로 도움이 됐다는 걸 직접 들을 수 있어 뜻깊었습니다.",
  ],
  [
    "A clearer starting point mattered more than one answer",
    "하나의 답보다, 자신의 출발점을 더 분명하게 보는 것이 중요했습니다",
  ],
  [
    "Our five stories showed that starting a career in Canada does not follow one formula. The next step depends on the experience and strengths someone brings, how clearly they can communicate that value in English, and what their current situation allows.",
    "캐나다에서 커리어를 시작하는 방법은 하나가 아닙니다. 어떤 경험과 강점을 갖고 있는지, 영어로 그 경험을 얼마나 잘 설명할 수 있는지, 지금 어떤 상황에 있는지에 따라 다음에 할 일도 달라집니다.",
  ],
  [
    "I wanted participants to leave with a clearer view of their own starting point and new professional contacts they could stay in touch with after the event. If they could see themselves more clearly and choose a next step that fit their situation, the event had done what I hoped it would do.",
    "그래서 비슷한 고민을 가진 사람들과 시작한 네트워킹은 이벤트 뒤에도 이어졌으면 했습니다. 무엇보다 참가자들이 자신을 더 명확하게 바라보고, 다음에 무엇을 할지 정하는 데 이번 이벤트가 도움이 되었기를 바랐습니다.",
  ],
  ["Read LinkedIn reflection", "링크드인 회고 읽기"],
  ["All workshops", "전체 워크숍"],
  ["View official event", "공식 이벤트 보기"],
  ["Sponsored by KDNEW", "KDNEW 후원"],
  [
    "AI & Design: New Workflows with Lovable",
    "AI & Design: Lovable로 직접 만들어본 새로운 작업 방식",
  ],
  [
    "I co-hosted a sold-out Korean-language workshop and mini hackathon for 40 designers in Metro Vancouver. I helped connect practitioner workflows, a live Lovable build, and a 90-minute team challenge. The speed was useful, but what it revealed about problem framing mattered more.",
    "메트로 밴쿠버의 디자이너 40명과 함께 한국어 AI 워크숍 겸 미니 해커톤을 공동 주최했습니다. 현업 작업 방식과 Lovable 라이브 실습, 90분 팀 빌딩을 하나의 흐름으로 설계했습니다. 빠르게 만드는 것보다 더 중요했던 건, 그 과정에서 문제 정의의 수준이 그대로 드러났다는 점입니다.",
  ],
  [
    "Designers needed a place to try, not another AI overview",
    "또 하나의 AI 소개보다, 직접 시도할 자리가 필요했습니다",
  ],
  [
    "AI was already part of nearly every design conversation around us. The practical question was different: where could a designer try vibe coding, understand the workflow, and build something without already knowing how to code?",
    "AI는 이미 주변 디자이너들의 대화에 빠지지 않고 등장하고 있었습니다. 정작 어려웠던 건 다른 데 있었습니다. 디자이너가 바이브 코딩의 작업 방식을 이해하고, 코딩 경험이 없어도 직접 만들어볼 자리는 어디에 있을까?",
  ],
  [
    "Many meetups we encountered were organized around engineering workflows. So Eun Ahn and I instead planned a Korean-language event around the work designers already do: define a problem, shape an experience, build a prototype, and explain the decisions behind it.",
    "주변에서 접한 AI 밋업은 대부분 엔지니어의 작업 방식을 중심으로 구성돼 있었습니다. So Eun Ahn님과 저는 디자이너가 이미 해오던 일, 즉 문제를 정하고 경험을 설계하고 프로토타입을 만들고 결정의 이유를 설명하는 과정을 중심으로 한국어 행사를 준비했습니다.",
  ],
  [
    "The event filled all 40 spots, with KDNEW, Lovable, and Canbu joining as partners. As a co-host, I linked the talks, hands-on workshop, team build, and demos so participants could move from watching a workflow to testing one themselves.",
    "40명 정원이 모두 찼고, KDNEW·Lovable·Canbu가 파트너로 함께했습니다. 저는 공동 주최자로서 발표와 실습, 팀 빌딩, 데모를 하나의 흐름으로 묶었습니다. 참가자들이 작업 방식을 보기만 하는 데서 멈추지 않고 직접 시험해볼 수 있게 만드는 것이 제 역할이었습니다.",
  ],
  ["Speakers and facilitators", "스피커와 진행"],
  [
    "We made the workflow visible before asking anyone to build",
    "직접 만들기 전에 작업 방식부터 보여줬습니다",
  ],
  [
    "Each participant received 100 Lovable credits in advance. Then we formed random teams of three and gave them 90 minutes to choose a problem, define one core experience, and make it work well enough to share. The talks were not a preface to the hackathon. Each one supplied a method participants could use in the build.",
    "참가자 전원에게는 Lovable 크레딧 100개를 미리 제공했습니다. 이후 무작위로 3인 팀을 만들고, 문제 하나와 핵심 경험 하나를 정해 90분 안에 공유 가능한 수준으로 구현하게 했습니다. 앞의 발표는 해커톤에 덧붙인 강연이 아니었습니다. 각 세션에서 본 작업 방식을 바로 팀 빌딩에 활용할 수 있도록 순서를 설계했습니다.",
  ],
  [
    "Working prototypes made the product questions visible",
    "프로토타입을 만들자, 가정이 보이기 시작했습니다",
  ],
  [
    "These were not finished products, and we did not evaluate them as if they were. Once each team had enough of a working experience to show the user, problem, and core interaction, they could see which parts of the idea were clear and which still relied on assumptions.",
    "완성된 제품을 기대하지는 않았습니다. 각 팀이 사용자와 문제, 핵심 인터랙션을 보여줄 수 있을 만큼 구현하자 아이디어의 어떤 부분이 분명하고, 어디가 아직 가정에 기대고 있는지 확인할 수 있었습니다.",
  ],
  [
    "The room changed when teams started sharing",
    "서로의 화면을 보기 시작하면서 분위기가 달라졌습니다",
  ],
  [
    "Survey comments also mentioned the pacing, venue, food, coffee, and credits provided in advance. Those details did not teach the tool, but they reduced friction and helped people stay with the workshop.",
    "후기에는 시간 배분과 장소, 식사와 커피, 미리 제공한 크레딧도 언급됐습니다. 이런 요소가 도구를 가르쳐주지는 않지만, 참가자가 중간에 막히지 않고 워크숍을 따라갈 때 생기는 불필요한 어려움을 줄여줬습니다.",
  ],
  [
    "A job seeker who had worried about keeping up with working professionals completed the build. People who had never used Lovable made functional prototypes. Experienced designers openly shared how they were using AI in real work. These were concrete signs that the format worked for participants with different starting points.",
    "현직자들 사이에서 따라갈 수 있을지 걱정했던 취업 준비생도 끝까지 실습을 마쳤습니다. Lovable을 처음 쓴 참가자도 기능이 작동하는 프로토타입을 만들었습니다. 현업 디자이너들은 실제 업무에서 AI를 쓰는 과정을 숨김없이 공유했습니다. 서로 다른 출발점의 참가자가 같은 흐름을 따라갈 수 있었다는 구체적인 신호였습니다.",
  ],
  [
    "Feedback reinforced the same pattern. Participants valued seeing real workflows, building within a clear time limit, and learning alongside people with different levels of experience.",
    "후기에서도 같은 흐름을 확인할 수 있었습니다. 실제 작업 방식을 보고, 정해진 시간 안에 직접 만들고, 경험이 다른 사람들과 함께 배운 점이 반복해서 언급됐습니다.",
  ],
  ["What still required a designer's judgment", "마지막까지 디자이너의 판단이 필요했습니다"],
  [
    "AI clearly changed the speed of the work. In the strongest demos I saw, however, speed followed a specific user, a real tension, and one interaction worth testing. A clever prompt could not compensate for a vague problem.",
    "AI가 작업 속도를 바꾼 건 분명했습니다. 다만 제가 본 데모 가운데 문제와 경험이 가장 잘 드러난 결과물은 구체적인 사용자와 실제 어려움, 시험해볼 인터랙션 하나를 먼저 정한 팀에서 나왔습니다. 프롬프트만 영리하게 쓴다고 모호한 문제가 분명해지지는 않았습니다.",
  ],
  [
    "Participants completed a full loop: see a workflow, choose a problem, build with others, and share unfinished work. They did not need to leave as AI experts. The useful outcome was knowing they could start—and seeing where their own judgment still had to lead.",
    "참가자들은 작업 방식을 보고, 문제를 정하고, 다른 사람과 함께 만들고, 미완성인 결과물을 공유하는 과정까지 경험했습니다. AI 전문가가 될 필요는 없었습니다. 직접 시작해볼 수 있다는 감각과, 어디에서 자신의 판단이 필요한지를 확인하는 일이 더 중요했습니다.",
  ],
  [
    "That is the standard I want to carry into future AI workshops: make the tool accessible, make the work visible, and leave enough room for design judgment to be tested.",
    "앞으로의 AI 워크숍에서도 이 기준을 이어가고 싶습니다. 도구는 쉽게 시작할 수 있게 하고, 작업 과정은 눈에 보이게 열어두며, 디자인 판단은 직접 시험할 수 있게 하는 것입니다.",
  ],
  [
    "I co-hosted a sold-out Korean-language workshop where 40 designers moved from real AI workflows to a 90-minute team build. The speed was useful; what it revealed about problem framing mattered more.",
    "현업 작업 방식부터 90분 팀 빌딩까지 이어지는 한국어 워크숍을 공동 주최했습니다. 디자이너 40명이 직접 만든 결과를 통해 문제 정의의 수준을 확인했습니다.",
  ],
  [
    "I worked on the organizing team for Portfolio Roast, a live mock interview and fireside talk for more than 20 designers in Burnaby. Two designers presented real case studies to Carlos Melendez, Principal User Experience Designer at Oracle. The format made the questions behind portfolio evaluation visible to everyone in the room.",
    "운영팀으로 Portfolio Roast를 함께 준비했습니다. 버나비에서 열린 이 행사에는 20명 이상의 디자이너가 참여했습니다. 두 명의 디자이너가 Oracle의 Principal User Experience Designer인 Carlos Melendez에게 실제 케이스 스터디를 발표했고, 포트폴리오를 평가할 때 어떤 질문이 오가는지 참가자 모두가 볼 수 있었습니다.",
  ],
  [
    "A polished portfolio can still break under questions",
    "잘 정리된 포트폴리오도 질문 앞에서는 흔들릴 수 있습니다",
  ],
  [
    "The event gave designers a lower-stakes place to test that moment. Portfolio Roast put real case studies into a live interview setting, then opened the questions and feedback to the room so everyone could learn from the same conversation.",
    "Portfolio Roast는 그 순간을 실제 인터뷰보다 부담이 적은 자리에서 먼저 시험해보도록 만든 행사였습니다. 실제 케이스 스터디를 라이브 인터뷰 상황에 놓고, 그 자리에서 나온 질문과 피드백을 모두에게 열었습니다.",
  ],
  [
    "So Eun Ahn brought together the guest, presenters, and community. I worked with So Eun and Suryeon Kim on the organizing team, helping shape the program flow and support event operations. KDNEW joined as event partner. The official event page listed 25 attendees, and the event recap confirmed that more than 20 designers joined us that evening.",
    "So Eun Ahn님이 게스트와 발표자, 커뮤니티를 한자리에 모았습니다. 저는 So Eun님, Suryeon Kim님과 운영팀으로 함께하며 프로그램 흐름을 정리하고 현장 운영을 도왔습니다. KDNEW는 이벤트 파트너로 함께했습니다. 공식 이벤트 페이지에는 25명이 참석자로 표시됐고, 행사 회고에서는 20명 이상의 디자이너가 함께했다고 확인했습니다.",
  ],
  [
    "The live format widened the value of each critique. A question asked of one presenter was useful to everyone. People could see where a polished screen still needed a clearer decision, where the outcome needed stronger evidence, and where the story became easier to follow once the presenter explained the context aloud.",
    "라이브 형식은 한 사람에게 주어진 피드백의 범위를 넓혔습니다. 화면은 잘 정리됐지만 결정의 이유가 더 필요한 지점, 결과를 뒷받침할 근거가 부족한 지점, 발표자가 맥락을 설명하자 비로소 이해되기 시작한 지점을 모두가 함께 볼 수 있었습니다.",
  ],
  [
    "The fireside talk started from the work everyone had just seen",
    "파이어사이드 토크는 방금 본 작업에서 시작했습니다",
  ],
  [
    "We discussed how much detail a case study needs, what makes work memorable, and how experience in graphic design or marketing can be positioned for UX roles.",
    "먼저 케이스 스터디에는 어느 정도의 디테일이 필요한지, 무엇이 작업을 기억에 남게 하는지, 그래픽 디자인이나 마케팅 경험을 UX 경력으로 어떻게 설명할지 이야기했습니다.",
  ],
  [
    "From there, the questions widened: what separates junior, intermediate, and senior designers, which interview behaviours create a negative impression, how to explain decisions to cross-functional partners, and what to focus on in a difficult job market.",
    "그다음에는 질문의 범위를 넓혔습니다. 주니어·인터미디어트·시니어를 나누는 기준, 인터뷰에서 부정적인 인상을 주는 행동, 크로스펑셔널 파트너에게 디자인 결정을 설명하는 방법, 어려운 채용 시장에서 무엇에 집중할지를 함께 다뤘습니다.",
  ],
  [
    "One presenter's questions became useful to the whole room",
    "한 발표자에게 던진 질문을 모두가 함께 들었습니다",
  ],
  [
    "In a later LinkedIn recap, Sue described Portfolio Roast as her first solo presentation of Lento. One person's post cannot represent every participant, but it shows one concrete outcome: the event gave a presenter a lower-stakes place to practise a difficult story before the next real interview.",
    "행사 뒤 Sue님은 LinkedIn 회고에 Lento 프로젝트로 첫 단독 발표를 했다고 남겼습니다. 한 사람의 회고가 전체 참가자를 대표하지는 않습니다. 다만 다음 실제 인터뷰 전에 자신의 이야기를 부담이 덜한 자리에서 연습해볼 수 있었다는 한 가지 결과는 확인할 수 있었습니다.",
  ],
  ["A portfolio review has to include the questions", "포트폴리오 리뷰는 질문까지 이어져야 합니다"],
  [
    "A portfolio has to hold together when the questions begin.",
    "포트폴리오의 이야기는 질문이 시작된 뒤에도 이어져야 합니다.",
  ],
  [
    "The event did not produce one portfolio template, and that was never the goal. It made the evaluation process visible: what an interviewer asks, what evidence a story needs, and where context changes how work is understood.",
    "하나의 포트폴리오 템플릿을 만드는 것이 목적은 아니었습니다. 대신 인터뷰어가 무엇을 묻는지, 이야기에 어떤 근거가 필요한지, 맥락이 작업의 이해를 어떻게 바꾸는지를 모두가 볼 수 있게 했습니다.",
  ],
  [
    "As an organizing team member, that was the outcome I cared about: giving designers a place to put unfinished stories in front of real questions, hear direct feedback, and decide what to practise next.",
    "운영팀으로서 중요하게 본 결과도 여기에 있습니다. 아직 완성되지 않은 이야기를 실제 질문 앞에 놓아보고, 직접 피드백을 들은 뒤, 다음에 무엇을 연습할지 정할 수 있는 자리를 만드는 것입니다.",
  ],
  [
    "I helped organize a live mock interview where two designers presented real case studies and more than 20 peers could see the questions, evidence, and context behind portfolio evaluation.",
    "두 명의 디자이너가 실제 케이스 스터디를 발표하고, 20명 이상의 동료 디자이너가 포트폴리오 평가에 필요한 질문과 근거, 맥락을 함께 확인한 라이브 모의 인터뷰를 운영팀으로 준비했습니다.",
  ],
  [
    "I joined the fifth annual KDD Korean Tech Conference as a career mentor. At a conference of 211 people, the 1:2 format created space to turn broad industry uncertainty into each participant's context, direction, and next test.",
    "제5회 KDD Korean Tech Conference에 커리어 멘토로 참여했습니다. 211명이 모인 컨퍼런스 안에서 진행된 1:2 대화에서는 업계의 큰 불확실성을 한 사람의 현재 상황과 원하는 방향, 다음에 해볼 행동으로 좁혀봤습니다.",
  ],
  [
    "The conference treated uncertainty as a question to work with",
    "불확실성을 피하지 않고, 함께 다룰 질문으로 꺼냈습니다",
  ],
  [
    "Vancouver KDD brought those questions into a full-day conference attended by 211 people. Speaker sessions offered different perspectives on change. The mentoring program then gave participants a smaller place to ask what those changes meant for their own careers.",
    "Vancouver KDD는 이 질문들을 하루 동안 함께 다루는 컨퍼런스를 열었고, 211명이 참여했습니다. 스피커 세션에서는 변화를 바라보는 여러 관점을 들을 수 있었습니다. 이어진 멘토링에서는 그 변화가 자신의 커리어에서는 무엇을 의미하는지 더 작은 자리에서 이야기했습니다.",
  ],
  [
    "I was not there to give one answer. My role was to listen for the decision each participant was actually trying to make and narrow the next step until it could be tested.",
    "하나의 답을 건네기 위해 참여한 것은 아니었습니다. 참가자가 실제로 고민하는 결정을 듣고, 다음에 해볼 행동을 직접 확인할 수 있을 만큼 좁히는 것이 제 역할이었습니다.",
  ],
  [
    "A 211-person conference still made room for context",
    "211명이 모인 컨퍼런스에서도 한 사람의 맥락을 들었습니다",
  ],
  [
    "We started with context, then chose one next test",
    "지금의 상황부터 보고, 다음 행동 하나를 정했습니다",
  ],
  [
    "We first looked at the experience, strengths, and constraints the participant already had. Then we clarified the kind of problem, team, and responsibility they wanted next.",
    "먼저 참가자가 이미 가진 경험과 강점, 지금의 제약을 살펴봤습니다. 그다음에는 앞으로 풀고 싶은 문제와 일하고 싶은 팀, 맡고 싶은 책임을 정리했습니다.",
  ],
  [
    "Finally, we chose one realistic way to test that direction through a project, conversation, or application.",
    "마지막에는 프로젝트, 대화, 지원 가운데 그 방향을 현실적으로 시험해볼 행동 하나를 정했습니다.",
  ],
  ["Next test", "다음 확인"],
  [
    "The conversation did not remove uncertainty. It turned a broad concern into a smaller decision someone could work on.",
    "불확실성이 사라진 것은 아닙니다. 다만 막연한 고민을 직접 다뤄볼 수 있는 작은 결정으로 바꿀 수 있었습니다.",
  ],
  [
    "The official event recap highlighted the mentoring program alongside the speaker sessions. That pairing explains the format's value: talks widened the field of view, while mentoring narrowed it to one person's situation.",
    "공식 행사 회고에서도 스피커 세션과 함께 멘토링 프로그램을 주요 경험으로 다뤘습니다. 컨퍼런스가 시야를 넓혔다면, 멘토링은 그 시야를 한 사람의 상황으로 좁혀볼 수 있게 했습니다.",
  ],
  [
    "The day moved from speaker and career sessions into networking and 1:2 mentoring. The order mattered. Participants first heard how experienced people were reading the industry, then discussed what those changes meant for their own situation.",
    "이날은 스피커 세션과 커리어 세션 뒤에 네트워킹과 1:2 멘토링이 이어졌습니다. 이 순서가 중요했습니다. 참가자들은 경험 많은 실무자들이 업계를 어떻게 읽는지 먼저 듣고, 그 변화가 자신의 상황에서는 무엇을 의미하는지 이야기했습니다.",
  ],
  [
    "Talks widened the view; mentoring made it personal",
    "큰 이야기 다음에, 각자의 상황을 이야기했습니다",
  ],
  ["A mentor cannot choose the answer for someone else", "멘토가 대신 답을 정할 수는 없습니다"],
  [
    "A mentor cannot choose another person's career. The useful work is to listen, make trade-offs visible, and turn a broad concern into a decision the person can test.",
    "멘토가 다른 사람의 커리어를 대신 선택할 수는 없습니다. 충분히 듣고, 각 선택에서 무엇을 얻고 포기하는지 함께 확인하고, 막연한 고민을 직접 시험해볼 결정으로 바꾸는 것이 멘토가 할 수 있는 일입니다.",
  ],
  [
    "KDD showed how the two scales can work together: a conference can open new directions, while one focused conversation can help a participant decide which one to test first.",
    "KDD에서는 큰 컨퍼런스와 작은 대화가 함께 작동했습니다. 컨퍼런스가 새로운 방향을 생각하게 했다면, 한 번의 집중된 대화는 그중 무엇부터 해볼지 정하는 데 도움을 줬습니다.",
  ],
  [
    "I joined Vancouver's KDD Korean Tech Conference as a career mentor. The 1:2 format helped turn broad industry uncertainty into each participant's context, direction, and next test.",
    "Vancouver KDD Korean Tech Conference에 커리어 멘토로 참여했습니다. 1:2 대화에서 업계의 큰 불확실성을 각 참가자의 현재 상황과 방향, 다음에 해볼 행동으로 좁혔습니다.",
  ],
]);

const getSavedWorkView = () => {
  try {
    return window.localStorage.getItem(WORK_VIEW_STORAGE_KEY);
  } catch {
    return null;
  }
};

const saveWorkView = (view) => {
  try {
    window.localStorage.setItem(WORK_VIEW_STORAGE_KEY, view);
  } catch {}
};

const resetSavedWorkView = () => {
  try {
    window.localStorage.removeItem(WORK_VIEW_STORAGE_KEY);
  } catch {}
};

const getSavedPortfolioLanguage = () => {
  try {
    return window.sessionStorage.getItem(PORTFOLIO_LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const savePortfolioLanguage = (language) => {
  try {
    window.sessionStorage.setItem(PORTFOLIO_LANGUAGE_STORAGE_KEY, language);
  } catch {}
};

const getPortfolioLanguageScope = () => {
  if (document.body.dataset.page === "workshop") {
    return document.querySelector(".article-main") ? "workshopArticle" : "workshop";
  }

  if (document.querySelector(".profile-feed")) {
    return "about";
  }

  if (document.querySelector(".article-main .case-detail-section")) {
    return "project";
  }

  if (document.querySelector("[data-work-feed]")) {
    return "projects";
  }

  return null;
};

const normalizePortfolioCopy = (copy) => copy.replace(/\s+/g, " ").trim();

const getPortfolioLanguageTargets = (scope) => {
  const selectors = portfolioLanguageSelectors[scope] || [];
  const targets = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));

  return Array.from(new Set(targets));
};

const markTileCaseReturn = () => {
  try {
    window.sessionStorage.setItem(TILE_CASE_RETURN_KEY, "true");
  } catch {}
};

const consumeTileCaseReturn = () => {
  try {
    const shouldSkipReveal = window.sessionStorage.getItem(TILE_CASE_RETURN_KEY) === "true";
    window.sessionStorage.removeItem(TILE_CASE_RETURN_KEY);
    return shouldSkipReveal;
  } catch {
    return false;
  }
};

const getProjectInitials = (title) => {
  const words = title.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return title.slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const createProjectThumb = (project, className, label) => {
  const thumb = document.createElement("div");
  thumb.className = className;
  thumb.setAttribute("aria-hidden", "true");

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const titleElement = document.createElement("strong");
  titleElement.textContent = project.title;

  thumb.append(labelElement, titleElement);
  return thumb;
};

const renderUpcomingProjects = () => {
  workFeeds.forEach((feed) => {
    const fragment = document.createDocumentFragment();
    const existingTitles = new Set(
      Array.from(feed.querySelectorAll(".feed-story h2")).map((title) => title.textContent.trim()),
    );

    upcomingProjects.forEach((project) => {
      if (existingTitles.has(project.title)) {
        return;
      }

      const story = document.createElement("article");
      story.className = "feed-story compact-story upcoming-project-story";
      story.dataset.construction = "Under construction";
      story.style.setProperty("--project-color", project.color);
      story.style.setProperty("--thumb-reveal-color", project.color);
      story.tabIndex = 0;
      story.setAttribute("aria-label", `${project.title} case study under construction`);

      const copy = document.createElement("div");
      copy.className = "story-copy";

      const source = document.createElement("p");
      source.className = "story-source";

      const badge = document.createElement("span");
      badge.className = "source-badge soon";
      badge.textContent = getProjectInitials(project.title);
      source.append(badge, "Coming soon");

      const title = document.createElement("h2");
      title.textContent = project.title;

      const deck = document.createElement("p");
      deck.className = "story-deck";
      deck.textContent = "Case study is being prepared.";

      const actions = document.createElement("div");
      actions.className = "story-actions";

      const caseStudy = document.createElement("span");
      caseStudy.textContent = "Case study";

      const status = document.createElement("span");
      status.textContent = "Under construction";

      actions.append(caseStudy, status);
      copy.append(source, title, deck, actions);

      story.append(
        copy,
        createProjectThumb(project, "story-thumb construction-project-thumb list-story-thumb", "Coming soon"),
        createProjectThumb(project, "story-thumb project-placeholder-thumb tile-story-thumb", "Under construction"),
      );
      fragment.append(story);
    });

    feed.append(fragment);
  });
};

renderUpcomingProjects();

const feedStories = Array.from(document.querySelectorAll(".feed-story"));
const constructionTargets = Array.from(document.querySelectorAll("[data-construction]"));
const menuButton = document.querySelector(".menu-button");
const recommendationRails = Array.from(document.querySelectorAll(".recommendation-rail"));
const thumbVideos = Array.from(document.querySelectorAll(".bero-video-thumb video"));

document.querySelectorAll("a").forEach((link) => {
  const href = link.getAttribute("href") || "";
  const isWorkHomeLink =
    link.classList.contains("medium-wordmark") ||
    link.dataset.nav === "work" ||
    href === "/projects/" ||
    href === "projects/index.html" ||
    href === "../projects/index.html";

  if (isWorkHomeLink) {
    link.addEventListener("click", resetSavedWorkView);
  }
});

const getFeedStoryLink = (story) => {
  const link = story.querySelector(".story-copy h2 a, .story-actions a, .story-thumb[href]");
  const href = link?.getAttribute("href") || "";

  if (!link || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return null;
  }

  return link;
};

feedStories.forEach((story) => {
  const title = story.querySelector("h2")?.textContent.trim();
  const link = getFeedStoryLink(story);

  if (title) {
    story.dataset.tileTitle = title;
  }

  if (!link) {
    return;
  }

  story.tabIndex = 0;
  story.setAttribute("role", "link");
  story.setAttribute("aria-label", link.textContent.trim() || "Open case study");

  link.addEventListener("click", () => {
    if (story.closest("[data-work-feed]")?.classList.contains("is-tile-view")) {
      markTileCaseReturn();
    }
  });

  story.addEventListener("click", (event) => {
    if (event.target.closest("a, button, input, textarea, select, summary, details")) {
      return;
    }

    if (story.closest("[data-work-feed]")?.classList.contains("is-tile-view")) {
      markTileCaseReturn();
    }

    window.location.href = link.href;
  });

  story.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if (event.target.closest("a, button, input, textarea, select, summary, details")) {
      return;
    }

    event.preventDefault();

    if (story.closest("[data-work-feed]")?.classList.contains("is-tile-view")) {
      markTileCaseReturn();
    }

    window.location.href = link.href;
  });
});

const initializePortfolioLanguage = () => {
  const scope = getPortfolioLanguageScope();
  const topbarActions = document.querySelector(".topbar-actions");

  if (!scope || !topbarActions) {
    return;
  }

  const targets = getPortfolioLanguageTargets(scope);
  const originalMarkup = new WeakMap();
  const originalSource = new WeakMap();
  const originalLang = new WeakMap();
  const languageToggle = document.createElement("button");
  let currentLanguage = "en";

  targets.forEach((target) => {
    originalMarkup.set(target, target.innerHTML);
    originalSource.set(target, normalizePortfolioCopy(target.textContent));
    originalLang.set(target, target.getAttribute("lang"));
  });

  languageToggle.className = "language-toggle";
  languageToggle.type = "button";
  languageToggle.dataset.languageToggle = "";

  const contactAction = topbarActions.querySelector(".app-button");
  topbarActions.insertBefore(languageToggle, contactAction);

  const syncStoryLanguage = () => {
    feedStories.forEach((story) => {
      const title = story.querySelector("h2")?.textContent.trim();
      const link = getFeedStoryLink(story);

      if (title) {
        story.dataset.tileTitle = title;
      }

      if (link && story.getAttribute("role") === "link") {
        story.setAttribute("aria-label", link.textContent.trim() || "Open case study");
      }
    });
  };

  const applyPortfolioLanguage = (language) => {
    const isKorean = language === "ko";

    currentLanguage = isKorean ? "ko" : "en";
    document.body.dataset.language = currentLanguage;
    document.documentElement.lang = currentLanguage;

    targets.forEach((target) => {
      const translation = portfolioKoreanTranslations.get(originalSource.get(target));

      if (isKorean && translation) {
        target.textContent = translation;
        target.setAttribute("lang", "ko");
        return;
      }

      target.innerHTML = originalMarkup.get(target);

      const initialLang = originalLang.get(target);
      if (initialLang) {
        target.setAttribute("lang", initialLang);
      } else {
        target.removeAttribute("lang");
      }
    });

    const languageToggleLabel = isKorean ? "View in English" : "한국어로 보기";

    languageToggle.textContent = languageToggleLabel;
    languageToggle.lang = isKorean ? "en" : "ko";
    languageToggle.setAttribute("aria-pressed", String(isKorean));
    languageToggle.setAttribute("aria-label", languageToggleLabel);
    languageToggle.title = languageToggleLabel;
    syncStoryLanguage();
  };

  const togglePortfolioLanguage = () => {
    const nextLanguage = currentLanguage === "ko" ? "en" : "ko";

    applyPortfolioLanguage(nextLanguage);
    savePortfolioLanguage(nextLanguage);
  };

  languageToggle.addEventListener("click", togglePortfolioLanguage);

  languageToggle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    togglePortfolioLanguage();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === PORTFOLIO_LANGUAGE_STORAGE_KEY) {
      applyPortfolioLanguage(event.newValue === "ko" ? "ko" : "en");
    }
  });

  applyPortfolioLanguage(getSavedPortfolioLanguage() === "ko" ? "ko" : "en");
};

initializePortfolioLanguage();

const playThumbVideo = (video) => {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const playPromise = video.play();

  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
};

const syncThumbVideos = () => {
  thumbVideos.forEach((video) => {
    const rect = video.getBoundingClientRect();
    const isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;

    if (isVisible) {
      playThumbVideo(video);
    }
  });
};

if (thumbVideos.length > 0) {
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            playThumbVideo(video);
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    thumbVideos.forEach((video) => videoObserver.observe(video));
  } else {
    syncThumbVideos();
    window.addEventListener("scroll", syncThumbVideos, { passive: true });
  }

  thumbVideos.forEach((video) => {
    video.addEventListener("pause", () => {
      if (!document.hidden) {
        window.requestAnimationFrame(() => syncThumbVideos());
      }
    });
  });

  window.addEventListener("pageshow", syncThumbVideos);
  window.addEventListener("focus", syncThumbVideos);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncThumbVideos();
    }
  });
}

if (menuButton) {
  const mobileMenuQuery = window.matchMedia("(max-width: 940px)");

  const setSidebarCollapsed = (isCollapsed) => {
    document.body.classList.remove("menu-open");
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    menuButton.setAttribute("aria-expanded", String(!isCollapsed));
    menuButton.setAttribute("aria-label", isCollapsed ? "Show menu" : "Hide menu");
  };

  const setMobileMenuOpen = (isOpen) => {
    document.body.classList.remove("sidebar-collapsed");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  const syncMenuMode = () => {
    if (mobileMenuQuery.matches) {
      setMobileMenuOpen(false);
      return;
    }

    setSidebarCollapsed(false);
  };

  menuButton.setAttribute("aria-controls", "portfolio-sidebar");
  syncMenuMode();

  menuButton.addEventListener("click", () => {
    if (mobileMenuQuery.matches) {
      setMobileMenuOpen(!document.body.classList.contains("menu-open"));
      return;
    }

    setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenuQuery.matches) {
        setMobileMenuOpen(false);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMobileMenuOpen(false);
      menuButton.focus();
    }
  });

  if (mobileMenuQuery.addEventListener) {
    mobileMenuQuery.addEventListener("change", syncMenuMode);
  } else {
    mobileMenuQuery.addListener(syncMenuMode);
  }
}

copyButtons.forEach((button) => {
  const defaultLabel = button.textContent;

  button.addEventListener("click", async () => {
    const email = button.getAttribute("data-copy-email");

    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "Email copied";
    } catch {
      button.textContent = email;
    }

    window.setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1800);
  });
});

contactButtons.forEach((button) => {
  const defaultLabel = button.textContent;
  const email = button.href.match(/^mailto:([^?]+)/)?.[1];

  button.addEventListener("click", async () => {
    if (!email || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(decodeURIComponent(email));
      button.textContent = "Email copied";

      window.setTimeout(() => {
        button.textContent = defaultLabel;
      }, 1800);
    } catch {
      button.textContent = decodeURIComponent(email);
    }
  });
});

document.getElementById("year").textContent = String(new Date().getFullYear());

workFeeds.forEach((feed) => {
  const viewButtons = Array.from(feed.querySelectorAll("[data-work-view]"));
  const feedCards = Array.from(feed.querySelectorAll(".feed-story"));
  const savedView = getSavedWorkView();
  const shouldSkipTileReveal = consumeTileCaseReturn();
  let tileRevealObserver = null;

  const stopTileReveal = () => {
    tileRevealObserver?.disconnect();
    tileRevealObserver = null;
    feedCards.forEach((card) => card.classList.remove("tile-revealed"));
  };

  const startTileReveal = () => {
    stopTileReveal();

    if (!("IntersectionObserver" in window)) {
      feedCards.forEach((card) => card.classList.add("tile-revealed"));
      return;
    }

    tileRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("tile-revealed");
          tileRevealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.18,
      },
    );

    feedCards.forEach((card) => tileRevealObserver.observe(card));
  };

  const revealTilesImmediately = () => {
    stopTileReveal();
    feedCards.forEach((card) => card.classList.add("tile-revealed"));
  };

  const setWorkView = (view, options = {}) => {
    feed.classList.toggle("is-tile-view", view === "tiles");

    if (view === "tiles") {
      if (options.revealImmediately) {
        revealTilesImmediately();
      } else {
        startTileReveal();
      }
    } else {
      stopTileReveal();
    }

    viewButtons.forEach((button) => {
      const isActive = button.dataset.workView === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    window.requestAnimationFrame(syncThumbVideos);
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setWorkView(button.dataset.workView);
      saveWorkView(button.dataset.workView);
    });
  });

  if (savedView === "tiles") {
    setWorkView("tiles", { revealImmediately: shouldSkipTileReveal });
  }

  const clearTileInteractionState = () => {
    if (!feed.classList.contains("is-tile-view")) {
      return;
    }

    window.requestAnimationFrame(() => {
      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLElement && feed.contains(activeElement)) {
        activeElement.blur();
      }

      feedCards.forEach((card) => card.classList.add("tile-revealed"));
    });
  };

  window.addEventListener("pageshow", clearTileInteractionState);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      clearTileInteractionState();
    }
  });
});

if (constructionTargets.length > 0) {
  const constructionTooltip = document.createElement("div");
  constructionTooltip.className = "construction-tooltip";
  constructionTooltip.setAttribute("aria-hidden", "true");
  constructionTooltip.innerHTML = '<span class="construction-tooltip-icon"></span><span class="construction-tooltip-text">Under construction</span>';
  document.body.appendChild(constructionTooltip);

  const constructionTooltipText = constructionTooltip.querySelector(".construction-tooltip-text");

  const moveConstructionTooltip = (event) => {
    const padding = 12;
    const offset = 18;
    const rect = constructionTooltip.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - padding;
    const maxTop = window.innerHeight - rect.height - padding;
    const left = Math.min(event.clientX + offset, Math.max(padding, maxLeft));
    const top = Math.min(event.clientY + offset, Math.max(padding, maxTop));

    constructionTooltip.style.left = `${Math.max(padding, left)}px`;
    constructionTooltip.style.top = `${Math.max(padding, top)}px`;
  };

  const showConstructionTooltip = (event, eventCard) => {
    constructionTooltipText.textContent = eventCard.dataset.construction || "Under construction";
    moveConstructionTooltip(event);
    constructionTooltip.classList.add("is-visible");
  };

  const hideConstructionTooltip = () => {
    constructionTooltip.classList.remove("is-visible");
  };

  constructionTargets.forEach((eventCard) => {
    eventCard.addEventListener("mouseenter", (event) => showConstructionTooltip(event, eventCard));
    eventCard.addEventListener("mousemove", moveConstructionTooltip);
    eventCard.addEventListener("mouseleave", hideConstructionTooltip);

    eventCard.addEventListener("focusin", () => {
      const rect = eventCard.getBoundingClientRect();
      showConstructionTooltip(
        {
          clientX: rect.right - 18,
          clientY: rect.top + rect.height / 2,
        },
        eventCard,
      );
    });
    eventCard.addEventListener("focusout", hideConstructionTooltip);
  });

  window.addEventListener("blur", hideConstructionTooltip);
  window.addEventListener("scroll", hideConstructionTooltip, { passive: true });
}

recommendationRails.forEach((rail) => {
  const credit = rail.querySelector(".rail-credit");
  const desktopQuery = window.matchMedia("(min-width: 1101px)");
  const shell = rail.closest(".medium-shell");
  let bottomTop = 0;
  let currentTop = 0;
  let fixedLeft = 0;
  let fixedWidth = 0;
  let isFixed = false;
  let isInitiallyLocked = false;
  let previousScrollY = window.scrollY;
  let resizeSettleTimer = 0;
  let topBoundary = 0;
  let triggerY = 0;

  if (!credit) {
    return;
  }

  const clearRailPosition = () => {
    rail.style.position = "";
    rail.style.top = "";
    rail.style.left = "";
    rail.style.width = "";
    rail.style.zIndex = "";
    isFixed = false;
  };

  const applyFixedRail = () => {
    rail.style.position = "fixed";
    rail.style.top = `${currentTop}px`;
    rail.style.left = `${fixedLeft}px`;
    rail.style.width = `${fixedWidth}px`;
    rail.style.zIndex = "2";
    isFixed = true;
  };

  const measureRail = ({ preserveFixed = false } = {}) => {
    const shouldPreserveFixed = preserveFixed && isFixed;

    if (!desktopQuery.matches) {
      clearRailPosition();
      return;
    }

    if (!shouldPreserveFixed) {
      clearRailPosition();
    }

    const railRect = rail.getBoundingClientRect();
    const creditRect = credit.getBoundingClientRect();
    const railDocumentTop = window.scrollY + railRect.top;
    const creditOffsetBottom = creditRect.bottom - railRect.top;
    const isCreditAlreadyVisible = creditRect.bottom <= window.innerHeight - 20;
    const nextBottomTop = window.innerHeight - 20 - creditOffsetBottom;

    if (!shouldPreserveFixed) {
      isInitiallyLocked = isCreditAlreadyVisible;
    }
    bottomTop = shouldPreserveFixed
      ? Math.min(currentTop, nextBottomTop)
      : isCreditAlreadyVisible
        ? railRect.top
        : nextBottomTop;
    fixedLeft = railRect.left;
    fixedWidth = railRect.width;

    if (!shouldPreserveFixed) {
      topBoundary = railDocumentTop;
      triggerY = isCreditAlreadyVisible ? window.scrollY : railDocumentTop - bottomTop;
    }
  };

  const updateRailPosition = () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - previousScrollY;

    if (!desktopQuery.matches) {
      clearRailPosition();
      previousScrollY = currentScrollY;
      return;
    }

    if (!isFixed && currentScrollY < triggerY) {
      previousScrollY = currentScrollY;
      return;
    }

    if (!isFixed && currentScrollY >= triggerY) {
      currentTop = bottomTop;
      applyFixedRail();
      previousScrollY = currentScrollY;
      return;
    }

    if (isFixed) {
      if (scrollDelta > 0) {
        currentTop = Math.max(bottomTop, currentTop - scrollDelta);
      } else if (scrollDelta < 0) {
        currentTop = Math.min(topBoundary, currentTop - scrollDelta);
      }

      if (currentScrollY <= 0 && !isInitiallyLocked) {
        clearRailPosition();
      } else {
        applyFixedRail();
      }
    }

    previousScrollY = currentScrollY;
  };

  const refreshRailPosition = () => {
    measureRail();
    updateRailPosition();
  };

  const scheduleRailRefresh = () => {
    clearRailPosition();
    window.clearTimeout(resizeSettleTimer);
    resizeSettleTimer = window.setTimeout(refreshRailPosition, 640);
  };

  const isShellColumnTransition = (event) =>
    event.target === shell && event.propertyName === "grid-template-columns";

  const handleShellTransitionEnd = (event) => {
    if (!isShellColumnTransition(event)) {
      return;
    }

    window.clearTimeout(resizeSettleTimer);
    refreshRailPosition();
  };

  rail.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");

    if (!summary) {
      return;
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      if (details.classList.contains("is-animating")) {
        return;
      }

      const isOpening = !details.open;
      const startHeight = details.offsetHeight;
      let endHeight = 0;

      if (isOpening) {
        details.classList.remove("is-closing");
        details.open = true;
        endHeight = details.offsetHeight;
      } else {
        details.classList.add("is-closing");
        details.open = false;
        endHeight = details.offsetHeight;
        details.open = true;
      }

      const finishDetailsAnimation = () => {
        if (!isOpening) {
          details.open = false;
        }

        details.classList.remove("is-animating");
        details.classList.remove("is-closing");
        details.style.height = "";
        window.requestAnimationFrame(refreshRailPosition);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) {
        finishDetailsAnimation();
        return;
      }

      details.classList.add("is-animating");
      details.style.height = `${startHeight}px`;

      const animation = details.animate(
        {
          height: [`${startHeight}px`, `${endHeight}px`],
        },
        {
          duration: 220,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );

      animation.onfinish = finishDetailsAnimation;
      animation.oncancel = finishDetailsAnimation;
    });
  });

  refreshRailPosition();
  window.addEventListener("scroll", updateRailPosition, { passive: true });
  window.addEventListener("resize", scheduleRailRefresh);
  desktopQuery.addEventListener("change", scheduleRailRefresh);
  shell?.addEventListener("transitionrun", scheduleRailRefresh);
  shell?.addEventListener("transitionend", handleShellTransitionEnd);
  shell?.addEventListener("transitioncancel", scheduleRailRefresh);
});

if (sections.length > 0) {
  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });
}
