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
const portfolioLanguageSelectors = {
  projects: [".story-copy h2 a", ".story-copy .story-deck"],
  project: [
    ".article-header h1",
    ".article-header .story-deck",
    ".case-detail-section > h2",
    ".case-detail-section > p",
    ".case-detail-section > ul > li",
    ".case-under-construction-section .case-image-kicker",
    ".case-under-construction-section figcaption > strong",
    ".case-under-construction-section figcaption > span",
  ],
  about: [
    ".profile-intro-title",
    ".profile-intro-tags > span",
    ".profile-intro-copy",
    ".profile-feed .profile-interest-card > h2",
    ".profile-feed .profile-interest-card > p",
    ".profile-feed .toolkit-list > li",
    ".profile-feed .profile-timeline h2",
    ".profile-feed .profile-timeline p",
  ],
  workshop: [
    ".story-copy .story-source-copy",
    ".story-copy h2 > a",
    ".story-copy h2:not(:has(a))",
    ".story-copy .story-deck",
    ".story-copy .story-actions > span",
    ".recommendation-rail .rail-section > h2",
    ".recommendation-rail article > p",
    ".recommendation-rail article > h3 > a",
    ".recommendation-rail article > h3:not(:has(a))",
    ".recommendation-rail article > span",
    ".recommendation-rail .topic-cloud > span",
  ],
  workshopArticle: [
    ".article-header .story-source-copy",
    ".article-header h1",
    ".article-header .story-deck",
    ".article-byline > span:not(.avatar-button)",
    ".article-byline .article-source-link",
    ".workshop-figure figcaption",
    ".case-detail-section > h2",
    ".case-detail-section > p",
    ".case-table th",
    ".case-table td",
    ".workshop-pullquote",
    ".workshop-review-meta",
    ".workshop-review-copy",
    ".case-nav-row a",
  ],
};
const portfolioKoreanTranslations = new Map([
  [
    "Turning smart collar data into useful, trustworthy guidance for dog owners.",
    "반려견의 행동 신호를 해석하는 AI 스마트 칼라 서비스",
  ],
  [
    "BeroAI brings the collar, app, and pre-order site into one journey, helping dog owners understand what may be happening and respond with more confidence.",
    "BeroAI는 스마트 칼라와 앱, 사전 주문 사이트를 하나의 여정으로 연결했습니다. 보호자가 반려견의 상태를 이해하고 상황에 맞게 대응할 수 있도록 설계했습니다.",
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
    "BeroAI is an AI IoT pet communication service built around a smart collar, mobile app, and pre-order website. The product challenge was to make collar signals understandable: what may be happening, what the owner should do, and how the service can support care over time.",
    "BeroAI는 스마트 칼라와 모바일 앱, 사전 주문 웹사이트로 구성된 AI IoT 반려동물 커뮤니케이션 서비스입니다. 핵심 과제는 칼라가 수집한 신호를 보호자가 이해할 수 있는 정보로 바꾸는 것이었습니다. 반려견에게 어떤 일이 일어나고 있는지, 보호자가 어떻게 대응해야 하는지, 서비스가 지속적인 돌봄을 어떻게 도울 수 있는지를 보여줘야 했습니다.",
  ],
  [
    "My work connected product strategy, app UX/UI, AI communication logic, avatar interaction, and launch messaging into one service story.",
    "제품 전략, 앱 UX/UI, AI 커뮤니케이션 로직, 아바타 인터랙션, 출시 메시지를 하나의 서비스 이야기로 연결했습니다.",
  ],
  [
    "Reframed BeroAI from a tracking device into an AI communication service.",
    "BeroAI를 단순한 추적 기기가 아닌 AI 커뮤니케이션 서비스로 재정의했습니다.",
  ],
  [
    "Mapped categories for emotion, behavior, and needs with the AI team so interpretation could become usable product logic.",
    "AI 팀과 감정·행동·욕구 체계를 정리해 해석 결과를 실제 제품 로직으로 연결했습니다.",
  ],
  [
    "Structured the app and pre-order funnel around Understand, Respond, and Bond loops.",
    "앱과 사전 주문 흐름을 ‘이해하기-대응하기-유대 쌓기’의 세 가지 반복 구조로 설계했습니다.",
  ],
  ["Problem", "해결해야 했던 문제"],
  [
    "The hardest part of caring for a dog is often the uncertainty of not knowing what a behavior means. Owners can see activity, camera footage, or health numbers, but they still need help understanding what those signals mean and what to do next.",
    "반려견을 돌볼 때 가장 답답한 순간은 행동의 이유를 모를 때입니다. 활동량과 카메라 영상, 건강 수치를 볼 수 있어도 ‘이 신호가 무엇을 뜻하고, 지금 무엇을 해야 하지?’라는 질문은 남습니다.",
  ],
  [
    "BeroAI needed to explain context and care actions without overclaiming that AI can perfectly translate a dog.",
    "BeroAI는 AI가 반려견의 마음을 완벽하게 번역한다고 과장하지 않으면서도, 상황의 맥락과 보호자가 할 수 있는 돌봄 행동을 설명해야 했습니다.",
  ],
  ["Role and Focus", "제가 맡은 역할"],
  [
    "I owned the connective layer between concept, AI logic, app experience, and launch story. Because the product was early, my focus was to define what the service should interpret, how uncertainty should be communicated, and where the owner should take action.",
    "저는 콘셉트, AI 로직, 앱 경험, 출시 메시지를 연결하는 역할을 맡았습니다. 초기 단계의 제품이었기 때문에 무엇을 해석할지, 불확실성을 어떻게 전달할지, 보호자가 언제 행동해야 할지를 정의하는 데 집중했습니다.",
  ],
  ["Research", "화면 설계 전에 확인한 것"],
  [
    "Before designing screens, I used a Pre-PRD research questionnaire to turn the broad idea of an AI pet communicator into product decisions. I focused on owner uncertainty, dog signal taxonomy, narrative logic, privacy, reliability, and responsible engagement.",
    "화면을 설계하기 전에 Pre-PRD 리서치 질문지를 만들어 ‘AI로 반려동물과 소통한다’는 넓은 아이디어를 구체적인 제품 결정으로 바꿨습니다. 보호자가 느끼는 불확실성, 반려견 신호 체계, 내러티브 로직, 개인정보 보호, 신뢰성, 책임 있는 사용 방식을 함께 살폈습니다.",
  ],
  ["Product Positioning", "제품의 약속 정하기"],
  [
    "The positioning needed to be credible. Instead of promising perfect dog translation, I framed BeroAI as a service that interprets patterns, explains possible context, and helps owners respond with better timing.",
    "신뢰할 수 있는 제품이 되려면 과장하지 않는 기준이 필요했습니다. 반려견의 마음을 완벽하게 번역한다고 약속하는 대신, 패턴을 해석하고 가능한 맥락을 설명해 보호자가 적절한 시점에 대응하도록 돕는 서비스로 BeroAI를 정의했습니다.",
  ],
  ["Service Architecture", "서비스의 세 가지 반복 구조"],
  [
    "I organized the product around three loops: understand the dog's state, respond with an appropriate action, and bond through repeated care, training, and rewards.",
    "제품은 세 가지 흐름이 반복되는 구조로 설계했습니다. 반려견의 상태를 이해하고, 알맞은 행동으로 대응하고, 돌봄과 훈련, 보상을 반복하며 유대감을 쌓는 흐름입니다.",
  ],
  ["AI Communication UX", "AI 해석을 설명하는 방법"],
  [
    "The Chat Room became the explanation layer. Need icons show direct states such as hunger, potty, or thirst; Chat explains context, deviation, and why a response may be useful.",
    "Chat Room은 AI의 해석을 설명하는 공간입니다. 배고픔, 배변, 갈증처럼 바로 확인해야 하는 상태는 아이콘으로 보여주고, 평소 패턴과 다른 점, 가능한 맥락, 왜 대응이 필요한지는 대화로 설명했습니다.",
  ],
  [
    "Each message followed a scenario loop: trigger, interpretation, owner action, and resolution. The tone needed enough reasoning to feel credible without sounding as if the system knew the dog's exact inner state.",
    "각 메시지는 ‘신호-해석-보호자의 행동-결과’ 순서로 설계했습니다. 시스템이 반려견의 속마음을 정확히 안다고 단정하지 않으면서도, 사용자가 안내를 신뢰할 수 있을 만큼의 근거를 전달해야 했습니다.",
  ],
  ["Care Home Experience", "한눈에 상태를 보여주는 Care Home"],
  [
    "Care Home became the app's main status surface. It answers the owner's first question: what is happening right now? The answer appears through the avatar, status cards, chat preview, and quick actions.",
    "Care Home은 앱의 핵심 상태 화면입니다. 보호자가 가장 먼저 궁금해하는 ‘지금 무슨 일이 일어나고 있지?’에 아바타, 상태 카드, 채팅 미리보기, 빠른 실행 메뉴로 답했습니다.",
  ],
  ["Dog Space Structure", "유대감을 쌓는 Dog Space"],
  [
    "Dog Space was planned as the bonding loop. It makes the product feel playful, but keeps customization, rewards, and return paths connected to care, walking, training, and repeated visits.",
    "Dog Space는 보호자와 반려견의 유대감을 쌓는 공간으로 기획했습니다. 꾸미기와 보상, 재방문 흐름을 돌봄, 산책, 훈련과 연결해 놀이 요소가 서비스의 핵심 목적에서 벗어나지 않도록 했습니다.",
  ],
  ["Map and Training Systems", "이해에서 행동으로"],
  [
    "Map and Training gave the service an action layer: owners could move from understanding a signal to doing something useful outdoors, during practice, or in daily routines.",
    "Map과 Training은 이해한 내용을 행동으로 옮기는 기능입니다. 보호자가 야외 활동이나 훈련, 일상 루틴에서 바로 실천할 수 있도록 설계했습니다.",
  ],
  ["Pre-order Website and Funnel", "새로운 제품을 설명하고 수요 확인하기"],
  [
    "The pre-order website needed to define a new category, answer trust questions, and collect measurable demand. I led with owner uncertainty and concrete care scenarios before moving into product details and conversion.",
    "사전 주문 사이트는 새로운 제품 범주를 설명하고 신뢰에 관한 질문에 답하면서, 실제 수요도 확인해야 했습니다. 기능과 제품 정보를 먼저 나열하기보다 보호자가 느끼는 불확실성과 구체적인 돌봄 상황을 보여준 뒤 사전 주문으로 이어지게 했습니다.",
  ],
  ["Launch Outcome", "출시 준비도로 결과 확인하기"],
  [
    "The project moved from concept-level UX into a structured product and launch experience. Because mature usage metrics were not available yet, I measured the outcome through product readiness.",
    "장기 사용 지표가 아직 없었기 때문에 결과는 제품의 출시 준비도를 기준으로 판단했습니다. 콘셉트 단계의 UX가 실제로 출시할 수 있는 제품 구조와 경험으로 발전했는지를 확인했습니다.",
  ],
  [
    "Defined BeroAI as an AI IoT communication service rather than a simple pet tracker.",
    "단순한 반려동물 추적기가 아니라 AI IoT 커뮤니케이션 서비스로 제품을 정의했습니다.",
  ],
  [
    "Built a shared Emotion-Behavior-Needs structure with the AI team.",
    "AI 팀과 감정·행동·욕구 체계를 함께 만들었습니다.",
  ],
  [
    "Designed the core app system across Care Home, Chat Room, Dog Space, Map, Training, History, and utility states.",
    "Care Home부터 Chat Room, Dog Space, Map, Training, History와 예외 상태까지 핵심 앱 구조를 설계했습니다.",
  ],
  [
    "Launched a pre-order site with a clearer category story, lead capture, and trust-building FAQ content.",
    "낯선 제품의 쓰임을 설명하는 메시지, 신청 흐름, 신뢰를 높이는 FAQ를 갖춘 사전 주문 사이트를 출시했습니다.",
  ],
  ["Reflection", "돌아보며"],
  [
    "This project reinforced that AI product design is not about making intelligence visible for its own sake. The strongest design move was connecting hardware signals, AI interpretation, app experience, and launch communication into one service that helps owners understand uncertainty and respond with care.",
    "이 프로젝트를 통해 AI 제품 디자인은 AI의 지능을 눈에 띄게 보여주는 일이 아니라는 점을 다시 확인했습니다. 가장 중요한 디자인 결정은 하드웨어 신호, AI 해석, 앱 경험, 출시 커뮤니케이션을 하나의 서비스로 연결하는 것이었습니다. 그래야 보호자도 불확실한 상황을 이해하고 필요한 돌봄 행동으로 옮길 수 있었습니다.",
  ],
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
  ["Hi, I'm Erik Park", "안녕하세요. 박에릭입니다"],
  ["Master's in Service Design", "서비스디자인 석사"],
  [
    "Leads one of South Korea's largest design communities",
    "한국 최대 규모의 디자인 커뮤니티 중 하나를 이끌고 있습니다",
  ],
  [
    "I'm a Senior Product Designer and Product Manager from South Korea, now based in Vancouver, BC. I help teams turn unclear product ideas into clear direction, usable experiences, and products they can launch and improve.",
    "한국에서 프로덕트 디자이너로 커리어를 시작했고, 지금은 캐나다 밴쿠버에서 시니어 프로덕트 디자이너이자 프로덕트 매니저로 일합니다. 아직 정리되지 않은 아이디어에서 풀어야 할 문제를 찾고, 팀이 실제로 만들고 출시할 수 있는 제품으로 구체화합니다.",
  ],
  ["What I Do", "디자인에서 시작해 제품 전체를 봅니다"],
  [
    "I started my career as a Product Designer. Over eight years, I expanded into Design Manager, Project Manager, and Product Owner roles while staying hands-on in design. I often carried these responsibilities in parallel, connecting user needs and design decisions with project delivery and product direction.",
    "프로덕트 디자이너로 커리어를 시작했습니다. 8년 동안 일을 하며 역할이 자연스럽게 넓어졌습니다. 디자인 매니저로 팀을 이끌고, 프로젝트 매니저로 일정과 실행을 관리하고, 프로덕트 오너로 제품 방향을 결정했습니다. 여러 역할을 동시에 맡을 때도 디자인에서 손을 놓지 않았습니다. 사용자에게 필요한 것, 팀이 만들 수 있는 것, 제품이 가야 할 방향을 연결해 왔습니다.",
  ],
  [
    "As AI changes how we work, my strength is not simply creating faster. It is using experience and judgment to identify the problem worth solving, ask better questions, and turn what I learn from real people into product decisions that work in practice.",
    "AI가 일하는 방식을 바꾸면서 만드는 속도는 분명 빨라졌습니다. 하지만 빠르게 만드는 것만으로 좋은 제품이 되지는 않습니다. 저의 강점은 경험과 판단을 바탕으로 풀 가치가 있는 문제를 찾고, 더 나은 질문을 던지고, 실제 사람들에게서 배운 내용을 현실에서 작동하는 제품 결정으로 옮기는 데 있습니다.",
  ],
  [
    "My work spans 30+ projects, including 10+ launched digital products and services in AI and IoT, e-commerce, fintech, healthcare, and community products.",
    "지금까지 AI·IoT, 이커머스, 핀테크, 헬스케어, 커뮤니티 분야에서 30개 넘는 프로젝트에 참여했습니다. 그중 10개 넘는 디지털 제품과 서비스를 실제로 출시했습니다.",
  ],
  ["Career Snapshot", "경력을 짧게 정리하면"],
  [
    "Education → Master’s degree in Service Design.",
    "학력 → 서비스디자인 석사 학위를 받았습니다.",
  ],
  [
    "South Korea & Canada → Built my career in South Korea and now work in Canada.",
    "한국과 캐나다 → 한국에서 경력을 쌓았고, 지금은 캐나다에서 일합니다.",
  ],
  [
    "Global Teams → Collaborated with and led global teams, including team members based in Vietnam.",
    "글로벌 팀 → 베트남에 있는 팀원을 포함해 여러 지역의 동료와 협업하고 팀을 이끌었습니다.",
  ],
  [
    "AI-Assisted Delivery → Integrated AI-assisted workflows into product design and delivery.",
    "AI를 활용한 실행 → 제품을 디자인하고 출시하는 과정에 AI 보조 워크플로를 적용했습니다.",
  ],
  [
    "OCR Service → Developed a government-funded OCR service designed to help travellers identify allergenic ingredients.",
    "OCR 서비스 → 여행자가 식품의 알레르기 유발 성분을 확인할 수 있도록 정부 지원 OCR 서비스를 개발했습니다.",
  ],
  ["How I Work", "저는 이렇게 일합니다"],
  [
    "Product Strategy → Frame the problem, define the direction, and make tradeoffs visible.",
    "제품 전략 → 문제를 정의하고 방향을 정합니다. 우선순위와 선택의 기준, 이번에 하지 않을 일까지 팀과 분명하게 공유합니다.",
  ],
  [
    "Service Design → Map users, touchpoints, operations, and business models into workable service flows.",
    "서비스 디자인 → 사용자와 접점, 운영, 비즈니스 모델을 연결해 실제로 운영할 수 있는 서비스 흐름을 설계합니다.",
  ],
  [
    "UX Systems → Turn complex product logic into clear journeys, screens, and interaction patterns.",
    "UX 시스템 → 복잡한 제품 로직을 사용자가 따라갈 수 있는 여정과 화면, 인터랙션으로 정리합니다.",
  ],
  [
    "Design Management → Align designers, product managers, developers, clients, and priorities through delivery.",
    "디자인 매니지먼트 → 디자이너, PM, 개발자, 클라이언트가 같은 기준으로 판단하고, 정한 우선순위에 따라 끝까지 출시할 수 있도록 조율합니다.",
  ],
  ["Community & Side Projects", "커뮤니티에서 배우고, 사이드 프로젝트로 확인합니다"],
  [
    "Mentoring and community work keep me close to the questions designers are asking now. Through ADPList, workshops, and community events, I offer direct feedback on portfolios, product thinking, and career direction.",
    "멘토링을 하다 보면 지금 디자이너들이 어디에서 막히는지 바로 보입니다. ADPList와 워크숍, 커뮤니티 행사에서 포트폴리오와 제품을 보는 관점, 커리어 방향을 함께 짚습니다.",
  ],
  [
    "I also lead one of South Korea's largest design communities and have hosted in-person events in Vancouver. These spaces let designers compare approaches, share what worked, and learn from one another.",
    "한국 최대 규모의 디자인 커뮤니티 중 하나를 이끌고 있고, 밴쿠버에서도 디자이너들이 직접 만나는 행사를 열었습니다. 이런 자리는 디자이너들이 서로의 접근 방식을 비교하고, 실제로 효과가 있었던 방법을 나누며 함께 배우는 공간입니다.",
  ],
  [
    "Side projects give me another way to test ideas outside formal product work: find a real problem, build enough to learn, and respond to what people actually do.",
    "사이드 프로젝트에서는 아이디어를 오래 설명하기보다 직접 확인합니다. 실제 문제를 찾고, 배울 수 있을 만큼 만들고, 사람들이 어떻게 행동하는지 보고 다음 결정을 내립니다.",
  ],
  ["Master’s Degree in Service Design", "왜 서비스디자인을 공부했나"],
  [
    "I kept running into the same challenge: product decisions had to make sense to clients, business teams, developers, and users at the same time. Good intuition helped, but it was not enough.",
    "일을 하며 같은 질문을 자주 만났습니다. 하나의 제품 결정이 사용자뿐 아니라 클라이언트와 비즈니스 팀, 개발자에게도 납득되어야 했습니다. 직관만으로는 이 모든 관점을 연결하고 설명하기 어려웠습니다.",
  ],
  [
    "That is why I pursued a master’s degree in Service Design. My research, “A Study on Colors to Improve Kiosk Usability for the Elderly,” examined how color could make self-service kiosks more usable and accessible for older adults.",
    "그래서 서비스디자인 석사 과정을 밟았습니다. 논문 「고령자의 키오스크 사용성 향상을 위한 색채 연구」에서는 색채가 고령자의 셀프서비스 키오스크 사용성과 접근성을 어떻게 높일 수 있는지 살폈습니다.",
  ],
  ["What I Learned Working in Korea", "한국에서 팀을 이끌며 배운 것"],
  [
    "In South Korea, I worked as both a hands-on designer and a team lead. On any given project, that could mean reviewing a flow, giving design feedback, resolving a stakeholder disagreement, or helping the team decide what had to ship first.",
    "한국에서는 실무 디자이너이자 팀 리드로 일했습니다. 프로젝트에 따라 화면 흐름을 검토하고, 디자인 피드백을 주고, 이해관계자의 의견 충돌을 조율하고, 무엇을 먼저 출시할지 팀과 결정했습니다.",
  ],
  [
    "I learned that trust is built through the small, repeatable parts of the work: listening closely, explaining decisions clearly, and following through.",
    "이 과정에서 신뢰는 거창한 말보다 반복되는 일의 방식에서 생긴다는 것을 배웠습니다. 제대로 듣고, 결정의 이유를 설명하고, 맡은 일을 끝까지 마무리하는 일입니다.",
  ],
  ["What Military Service Taught Me", "군 복무에서 배운 실행의 기본"],
  [
    "Before my design career, I served at military headquarters, coordinating people and administrative work with little room for missed details.",
    "디자인 일을 시작하기 전에는 군 본부에서 복무했습니다. 작은 누락도 다른 사람의 업무에 바로 영향을 주는 환경에서 인원과 행정 업무를 조율했습니다.",
  ],
  [
    "It taught me to stay calm, make responsibilities clear, and finish what others were depending on. Those habits still show up in how I run projects today.",
    "그 경험을 통해 침착함을 유지하고, 책임을 분명히 나누고, 다른 사람에게 필요한 일을 끝까지 책임지는 습관을 배웠습니다. 이 습관은 지금도 프로젝트를 운영하는 방식에 남아 있습니다.",
  ],
  ["Travel inspires me", "여행을 좋아합니다"],
  [
    "Travel has always been a way for me to recharge and reconnect with myself.",
    "여행을 하면 일상에서 잠시 떨어져 다시 제 속도를 찾게 됩니다.",
  ],
  [
    "I enjoy discovering new places, meeting people from different backgrounds, and finding inspiration in the small moments along the way.",
    "낯선 장소를 걷고, 다른 배경의 사람을 만나고, 별것 아닌 장면을 오래 기억하는 일을 좋아합니다.",
  ],
  [
    "When people ask me why I love traveling, I still don’t have a specific answer.",
    "왜 여행을 좋아하냐는 질문을 받으면, 아직도 그럴듯한 답은 없습니다.",
  ],
  [
    "I usually just say, “because I like it.” And maybe that’s enough.",
    "그냥 ‘좋으니까요’라고 답합니다. 그 정도면 충분하다고 생각합니다.",
  ],
  [
    "Cooking is one of the ways I take care of people",
    "요리는 제가 가족을 돌보는 방법입니다",
  ],
  [
    "Cooking has been part of my life for a long time. I loved it enough to study it earlier in my career.",
    "요리는 오래된 취미입니다. 커리어 초기에 따로 공부했을 만큼 진지하게 좋아했습니다.",
  ],
  [
    "These days, it is one of the ways I care for my family. I am usually the one cooking for my wife and son, and I like that role.",
    "요즘은 주로 아내와 아들을 위해 요리합니다. 제가 가족을 돌보는 가장 익숙한 방법이고, 기꺼이 맡고 싶은 역할입니다.",
  ],
  [
    "AI & Design · Lovable mini hackathon · Mar 2026",
    "AI & Design · Lovable 미니 해커톤 · 2026년 3월",
  ],
  [
    "AI & Design: New Workflows with Lovable — An AI Hackathon & Meetup for Designers",
    "AI & Design: New Workflows with Lovable 디자이너를 위한 AI 해커톤 & 밋업",
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
    "덕분에 행사장은 심사 패널보다 함께 일하는 세션에 가까워졌습니다. 발표자들은 아직 완벽하지 않은 이야기까지 기꺼이 꺼내놓았습니다. 참가자들은 집중해서 듣고 후속 질문을 던졌고, 공식 프로그램이 끝난 뒤에도 대화를 이어갔습니다.",
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
  ["All workshops", "전체 워크숍"],
  ["View official event", "공식 이벤트 보기"],
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
