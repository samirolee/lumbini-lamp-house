import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        sanctuary: 'Sanctuary',
        chronicles: 'Chronicles',
        wisdom: 'Wisdom',
        offerings: 'Offerings',
        support: 'Support',
        visions: 'Visions',
        echoes: 'Echoes',
        connect: 'Connect',
        inquire: 'Inquire'
      },
      hero: {
        sacred_flame: 'The Flame of Eternity',
        title_main: 'Eternal',
        title_sub: 'Radiance',
        description: 'Experience Lumbini: The sacred birthplace of Lord Buddha and the fountain of world peace.\nWe facilitate your personal connection to this hallowed ground through the ancient ritual of light.',
        p1: 'For over two millennia, the flicker of a single lamp in Lumbini has symbolized the triumph of wisdom over the unknown. Here, history is not a memory, but a presence.',
        p2: 'Lumbini Lamp House serves as the custodian of your intention. Whether you are miles away or standing within the sanctuary, your light is tended with monastic devotion.',
        p3: 'Invoke the ritual. Secure your place in the lineage of seekers who have honored the Nativity through the element of fire.',
        cta_primary: 'Invoke the Ritual',
        cta_secondary: 'Discover the Sanctuary'
      },
      history: {
        label: 'Chronicles',
        title: 'Lumbini: The Birthplace of Enlightenment',
        p1: 'Prince Siddhartha Gautama was born here in 623 B.C. This sacred ground is where the Light of Asia first emerged to guide humanity towards global harmony.',
        p2: 'Lumbini Lamp House is strategically located directly in front of the sacred Maya Devi Temple, the heart of the sanctuary. Here, seekers have gathered for centuries to bathe in the spiritual energy of the Nativity site.',
        p3: 'Our mission is centered on World Peace. By lighting a lamp at this geographical source of compassion, you contribute to a collective radiance that prays for the cessation of suffering across the globe.'
      },
      peace_mission: {
        title: 'Global Peace Foundation',
        subtitle: 'Our commitment to a world in harmony',
        p1: 'Every flame lit at the Lumbini Lamp House is a physical prayer for world peace. We believe that by illuminating the birthplace of Buddha, we send a message of non-violence and compassion that resonates across every border.',
        p2: 'Join our mission to light one million lamps for global reconciliation. Your light is not just a personal ritual; it is a contribution to a collective vision of a peaceful future.'
      },
      gallery_info: {
        title: 'Visions of Peace',
        subtitle: 'Sacred Photos & Videos'
      },
      significance: {
        label: 'Wisdom',
        title: 'The Eternal Flame: Deep-Daan',
        p1: 'In Buddhist tradition, lighting a lamp is the symbolic dispelling of Avidya—the darkness of ignorance. The physical flame representing the element of Fire (Tejas) purifies existence and burns away the residues of past karma.',
        p2: 'Offering a light is a profound ritual. As the wick consumes the oil, we are reminded of the impermanence of the self and the radiant clarity of the Buddha’s Wisdom. It is the ultimate gesture of Metta (Loving-kindness).',
        quotes: [
          "Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened.",
          "As a lamp illuminates a dark room, wisdom dispels the darkness of the mind.",
          "Better than a thousand hollow words, is one word that brings peace.",
          "The light of the Dhamma is the only light that never flickers."
        ]
      },
      about: {
        label: 'The Wisdom of Light',
        title_main: 'A Legacy of',
        title_sub: 'Compassion',
        p1: 'In the quiet monastic zone of Lumbini, the act of lighting a lamp transcends time. It is an invitation to witness the flickering dance of wisdom as it overcomes the shadows of the unknown.',
        p2: 'Our sanctuary provides a space for pilgrims and seekers to offer their prayers through the medium of fire—a pure, transformative element that has guided humanity for millennia.',
        stat1_label: 'Auspicious Lamps',
        stat2_label: 'Inner Peace'
      },
      offerings: {
        label: 'Offerings',
        title: 'Ceremony & Lighting Packages',
        description: 'Choose the scale of your world peace ceremony. Each package is prepared with traditional wicks and pure oils to illuminate your path.',
        single: {
          title: 'Single Light',
          material: 'Lamp Material',
          quantity: 'Quantity',
          base_price: 'Base price:',
          confirm: 'Confirm Selection',
          features: {
            clay: '3 hour burn time',
            terracotta: '4 hour burn time',
            stone: '6 hour burn time',
            brass: '8 hour burn time (Extended)',
            oil: 'Sacred cotton wick & pure vegetable oil'
          }
        },
        multiple: {
          title: '108 Lights',
          tag: 'Most Sacred',
          intent_label: 'Dedication Intent',
          intents: {
            general: 'General Peace & Wisdom',
            ancestral: 'Ancestral Blessing',
            healing: 'Healing & Well-being',
            success: 'Success & Prosperity'
          },
          request_label: 'Personalized Request',
          request_placeholder: 'Enter names for dedication or special requests...',
          current_intent: 'Current Intent:',
          keepsake: {
            title: 'Digital Keepsake',
            status: 'Included',
            description: 'High-resolution photograph and a personalized video clip of your 108 lamps being lit.'
          },
          cta: 'Select Offering'
        }
      },
      contact: {
        label: 'Connect',
        title_main: 'Begin Your',
        title_sub: 'Inquiry',
        description: 'Whether you seek a single light or a grand dedication, our team is here to facilitate your spiritual journey.',
        location_label: 'Sanctuary Location',
        location_value: 'Lumbini Monastic Zone, Nepal',
        whatsapp_label: 'WhatsApp Inquiry',
        whatsapp_number: '+977 9813044996',
        form: {
          name: 'Seeker\'s Name',
          email: 'Messenger Path (Email)',
          package: 'Sacred Package',
          contact_method: 'How shall we reach you?',
          message: 'Your Spiritual Intent',
          placeholder_intent: 'Please share your heart with us...',
          send: 'Invoke Inquiry',
          sending: 'Preparing the sacred space...',
          success_title: 'Inquiry Received',
          success_p: 'The sanctuary hears you. A custodian of light will respond once the temple bells resonate.',
          send_another: 'Send another',
          errors: {
            invalid_email: 'Please share a valid path (email) so we may honor your inquiry.',
            message_short: 'Please share more of your heart (at least 10 characters).',
            message_long: 'The scrolls are limited; please keep your intent concise (500 characters).'
          }
        }
      },
      footer: {
        copy: '© {{year}} LUMBINI LAMP HOUSE. Sacred Traditions Preserved.'
      },
      donation: {
        label: 'Sacred Support',
        title: 'Illuminating the Path',
        description: 'Your contribution helps preserve the sanctity of the monastic zone and supports local communities. Every gift, like every flame, brings light to the world.',
        support_type: 'Support Type',
        options: {
          sanctuary: 'Sanctuary Preservation',
          education: 'Local Education Fund',
          monastery: 'Monastic Welfare'
        },
        amount_label: 'Select Your Offering',
        custom_placeholder: 'Other merit...',
        cta: 'Offer Support',
        success_title: 'Meritorious Act',
        success_p: 'Our gratitude. May this act of merit illuminate your path across lifetimes.'
      },
      system: {
        err_name_required: 'Please share your name so we may honor your offering correctly.',
        err_messenger_required: 'Please share a valid path (email) so we may reach you in this life.',
        loading_sacred: 'Preparing the sacred space...',
        empty_plate: 'Your offering plate is currently empty, waiting for your intention.',
        cta_seal: 'Seal the Intent',
        placeholder_heart: 'Share your heart\'s intent with the eternal flame...',
        footer_keep_alive: 'Keep the flame alive in your inbox.',
        err_obscured: 'The sacred archives are currently obscured by shadows. Please try again when the clouds part.'
      }
    }
  },
  ne: {
    translation: {
      nav: {
        sanctuary: 'शरणस्थल',
        chronicles: 'इतिहास',
        wisdom: 'ज्ञान',
        offerings: 'प्रसादहरू',
        support: 'सहयोग',
        visions: 'दृश्यहरू',
        echoes: 'प्रतिध्वनि',
        connect: 'सम्पर्क',
        inquire: 'सोधपुछ'
      },
      hero: {
        sacred_flame: 'पवित्र ज्वाला',
        title_main: 'आफ्नो आत्मा',
        title_sub: 'प्रज्वलित गर्नुहोस्',
        description: 'लुम्बिनीको अनुभव गर्नुहोस्: भगवान बुद्धको पवित्र जन्मस्थल र विश्व शान्तिको मुहान।\nहामी प्रकाशको प्राचीन अनुष्ठान मार्फत यस पवित्र भूमिसँग तपाईंको व्यक्तिगत जडानलाई सहज बनाउँछौं।',
        cta_primary: 'प्रसादहरू हेर्नुहोस्',
        cta_secondary: 'शरणस्थल'
      },
      history: {
        label: 'इतिहास',
        title: 'लुम्बिनी: बुद्धको जन्मस्थल र शान्तिको मुहान',
        p1: 'राजकुमार सिद्धार्थ गौतमको जन्म ईसापूर्व ६२३ मा यही पवित्र भूमिमा भएको थियो। यो त्यो स्थान हो जहाँबाट विश्वव्यापी सद्भावको लागि एसियाको ज्योति उदायो।',
        p2: 'लुम्बिनी ल्याम्प हाउस पवित्र माया देवी मन्दिरको ठीक अगाडि अवस्थित छ। यहाँ, शताब्दीयौंदेखि साधकहरू बुद्धको जन्मस्थलको आध्यात्मिक ऊर्जामा स्नान गर्न भेला हुन्छन्।',
        p3: 'हाम्रो उद्देश्य विश्व शान्तिमा केन्द्रित छ। यस पवित्र स्थानमा दियो बालेर, तपाईं संसारभरको शान्तिको लागि सामूहिक प्रार्थनामा सहभागी हुनुहुनेछ।'
      },
      peace_mission: {
        title: 'विश्व शान्ति फाउण्डेशन',
        subtitle: 'विश्व सद्भावको लागि हाम्रो प्रतिबद्धता',
        p1: 'लुम्बिनी ल्याम्प हाउसमा प्रज्वलित प्रत्येक ज्वाला विश्व शान्तिको लागि एक भौतिक प्रार्थना हो।',
        p2: 'साझा शान्त भविष्यको परिकल्पनामा सहभागी हुनुहोस्।'
      },
      gallery_info: {
        title: 'शान्तिका दृश्यहरू',
        subtitle: 'पवित्र फोटो र भिडियोहरू'
      },
      significance: {
        label: 'ज्ञान',
        title: 'अनन्त ज्वाला: दीप-दान',
        p1: 'बौद्ध परम्परामा, दियो बाल्नु भनेको अज्ञानताको अन्धकारलाई हटाउने प्रतीक हो। आगोको तत्व (तेजस) ले अस्तित्वलाई शुद्ध गर्छ र विगतका कर्मका अवशेषहरूलाई जलाउँछ।',
        p2: 'दीप-दान एक गहिरो अनुष्ठान हो। जसरी बत्तीले तेल खपत गर्छ, त्यसरी ही हामीलाई आत्माको अनित्यता र बुद्धको ज्ञानको स्पष्टताको सम्झना गराउँछ। यो मैत्री (करुणा) को मार्ग हो।',
        quotes: [
          "एउटै मैनबत्तीबाट हजारौं मैनबत्तीहरू बाल्न सकिन्छ, र यसले मैनबत्तीको आयु घटाउँदैन।",
          "जसरी दियोले अँध्यारो कोठालाई उज्यालो पार्छ, ज्ञानले मनको अन्धकार हटाउँछ।",
          "हजारौं खोक्रा शब्दहरू भन्दा, एउटै शान्ति ल्याउने शब्द उत्तम हुन्छ।",
          "धम्मको ज्योति मात्र त्यस्तो ज्योति हो जुन कहिल्यै निभ्दैन।"
        ]
      },
      about: {
        label: 'प्रकाशको ज्ञान',
        title_main: 'करुणाको',
        title_sub: 'विरासत',
        p1: 'लुम्बिनीको शान्त मठ क्षेत्रमा, दियो बाल्ने कार्यले समयलाई पार गर्दछ। यो अज्ञातको छायालाई परास्त गर्ने बुद्धिको झिलिमिली नृत्यको साक्षी बन्ने निमन्त्रणा हो।',
        p2: 'हाम्रो शरणस्थलले तीर्थयात्रीहरू र साधकहरूलाई आफ्ना प्रार्थनाहरू अग्निको माध्यमबाट अर्पण गर्ने ठाउँ प्रदान गर्दछ—एक शुद्ध, रूपान्तरणकारी तत्व जसले सहस्राब्दीदेखि मानवतालाई मार्गदर्शन गरेको छ।',
        stat1_label: 'शुभ दियोहरू',
        stat2_label: 'आन्तरिक शान्ति'
      },
      offerings: {
        label: 'प्रसादहरू',
        title: 'अनुष्ठान र दीप प्रज्वलन प्याकेजहरू',
        description: 'आफ्नो विश्व शान्ति अनुष्ठानको स्तर छनौट गर्नुहोस्। प्रत्येक प्याकेज परम्परागत बत्ती र शुद्ध तेलका साथ तयार गरिन्छ।',
        single: {
          title: 'एकल ज्योति',
          material: 'बत्तीको सामग्री',
          quantity: 'संख्या',
          base_price: 'आधार मूल्य:',
          confirm: 'छनौट पुष्टि गर्नुहोस्',
          features: {
            clay: '३ घण्टा बल्ने समय',
            terracotta: '४ घण्टा बल्ने समय',
            stone: '६ घण्टा बल्ने समय',
            brass: '८ घण्टा बल्ने समय (थप)',
            oil: 'पवित्र सुती सलेदो र शुद्ध वनस्पति तेल'
          }
        },
        multiple: {
          title: '१०८ ज्योतिहरू',
          tag: 'सबैभन्दा पवित्र',
          intent_label: 'समर्पणको उद्देश्य',
          intents: {
            general: 'सामान्य शान्ति र ज्ञान',
            ancestral: 'पितृ आशिर्वाद',
            healing: 'उपचार र कल्याण',
            success: 'सफलता र समृद्धि'
          },
          request_label: 'व्यक्तिगत अनुरोध',
          request_placeholder: 'समर्पणका लागि नामहरू वा विशेष अनुरोधहरू प्रविष्ट गर्नुहोस्...',
          current_intent: 'वर्तमान उद्देश्य:',
          keepsake: {
            title: 'डिजिटल सम्झना',
            status: 'समावेश',
            description: 'तपाईंका १०८ दियोहरू प्रज्वलित गरिएको उच्च-रिजोल्युसन फोटो र व्यक्तिगत भिडियो क्लिप।'
          },
          cta: 'अर्पण छनौट गर्नुहोस्'
        }
      },
      contact: {
        label: 'सम्पर्क',
        title_main: 'आफ्नो सोधपुछ',
        title_sub: 'सुरु गर्नुहोस्',
        description: 'चाहे तपाईं एकल ज्योति खोज्नुहुन्छ वा भव्य समर्पण, हाम्रो टोली तपाईंको आध्यात्मिक यात्रालाई सहज बनाउन यहाँ छ।',
        location_label: 'शरणस्थल स्थान',
        location_value: 'लुम्बिनी मठ क्षेत्र, नेपाल',
        whatsapp_label: 'व्हाट्सएप सोधपुछ',
        whatsapp_number: '+९७७ ९८१३०४४९९६',
        form: {
          name: 'पूरा नाम',
          email: 'इमेल ठेगाना',
          package: 'प्याकेज',
          contact_method: 'सम्पर्क माध्यम',
          message: 'सन्देश',
          placeholder_intent: 'तपाईंको आध्यात्मिक उद्देश्य...',
          send: 'सोधपुछ पठाउनुहोस्',
          sending: 'पठाउँदै...',
          success_title: 'सोधपुछ प्राप्त भयो',
          success_p: 'हाम्रो शरणस्थलको एक सदस्यले तपाईंलाई चाँडै सम्पर्क गर्नेछ।',
          send_another: 'अर्को पठाउनुहोस्',
          errors: {
            invalid_email: 'कृपया एक मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।',
            message_short: 'सन्देश कम्तिमा १० अक्षरको हुनुपर्छ।',
            message_long: 'सन्देश ५०० अक्षर भन्दा बढी हुनु हुँदैन।'
          }
        }
      },
      footer: {
        copy: '© {{year}} लुम्बिनी ल्याम्प हाउस। पवित्र परम्परा संरक्षित।'
      },
      donation: {
        label: 'पवित्र सहयोग',
        title: 'मार्ग प्रज्वलित गर्दै',
        description: 'तपाईको योगदानले मठ क्षेत्रको पवित्रता जोगाउन र स्थानीय समुदायहरूलाई सहयोग गर्न मद्दत गर्दछ। प्रत्येक उपहार, प्रत्येक ज्वाला जस्तै, संसारमा प्रकाश ल्याउँछ।',
        support_type: 'सहयोगको प्रकार',
        options: {
          sanctuary: 'शरणस्थल संरक्षण',
          education: 'स्थानीय शिक्षा कोष',
          monastery: 'मठ कल्याण'
        },
        amount_label: 'रकम छनौट गर्नुहोस्',
        custom_placeholder: 'अन्य रकम...',
        cta: 'सहयोग अर्पण गर्नुहोस्',
        success_title: 'पुण्य कार्य',
        success_p: 'तपाईंको उदार योगदान प्राप्त भएको छ। तपाईंले बाँड्नुभएको प्रकाश हजार गुणा भएर तपाईंकहाँ फर्कियोस्।'
      }
    }
  },
  zh: {
    translation: {
      nav: {
        sanctuary: '圣所',
        chronicles: '编年史',
        wisdom: '智慧',
        offerings: '供奉',
        support: '支持',
        visions: '影像',
        echoes: '鸣响',
        connect: '联系',
        inquire: '咨询'
      },
      hero: {
        sacred_flame: '神圣之火',
        title_main: '点亮',
        title_sub: '你的灵魂',
        description: '体验蓝毗尼：佛陀的圣洁诞生地，世界和平的源泉。\n我们通过古老的光明仪式，助您与这片神圣土地建立心灵连接。',
        cta_primary: '探索供奉',
        cta_secondary: '圣所'
      },
      history: {
        label: '编年史',
        title: '蓝毗尼：佛陀诞生地与和平之源',
        p1: '悉达多·乔达摩王子于公元前623年出生于此。这片圣地是亚洲之光升起的源头，指引世界走向和谐。',
        p2: '蓝毗尼灯舍位于神圣的摩耶夫人寺正前方。数百年来，信众云集于此，感受佛陀降生地的庄严能量。',
        p3: '我们的使命核心是世界和平。在这个慈悲之源点灯，是为全人类的和谐贡献一份光芒。'
      },
      peace_mission: {
        title: '世界和平基金会',
        subtitle: '我们对全球和谐的承诺',
        p1: '在蓝毗尼灯舍点燃的每一团火焰，都是为世界和平祈愿。',
        p2: '加入我们点灯百万的愿景，共创和平未来。'
      },
      gallery_info: {
        title: '和平景象',
        subtitle: '神圣照片与视频'
      },
      significance: {
        label: '智慧',
        title: '永恒之光：点灯供养',
        p1: '在佛教传统中，点燃明灯不仅仅是照明，更是驱散“无明”（Avidya）——即无知的黑暗。代表火元素（Tejas）的物理火焰净化了存在，并燃烧掉过去业力的残余。',
        p2: '点灯供养（Deep-Daan）是一种深刻的修持仪式。当灯芯消耗油脂时，我们被提醒自我的无常和佛陀智慧的璀璨清晰。这是慈悲（Metta）的终极象征。',
        quotes: [
          "一支蜡烛可以点燃成千上万支蜡烛，而它的生命不会因此缩短。",
          "正如明灯照彻暗室，智慧驱散心灵的黑暗。",
          "与其说一千个空洞的字，不如说一个带来和平的字。",
          "佛法之光是唯一永不熄灭的光。"
        ]
      },
      about: {
        label: '智慧之光',
        title_main: '慈悲之',
        title_sub: '传承',
        p1: '在蓝毗尼宁静的寺院区，点燃一盏灯的行为超越了时间。这是一个见证智慧在克服未知阴影时闪烁起舞的邀请。',
        p2: '我们的圣所为朝圣者和寻求者提供了一个通过火——这种引导人类数千年的纯洁、变革性的元素——来表达祈祷的空间。',
        stat1_label: '吉祥明灯',
        stat2_label: '内心平静'
      },
      offerings: {
        label: '供奉',
        title: '仪式与点灯套餐',
        description: '选择您的世界和平仪式规模。每份套餐均采用传统灯芯和纯净油脂精心准备，照亮您的和平之路。',
        single: {
          title: '一盏明灯',
          material: '灯具材质',
          quantity: '数量',
          base_price: '基础价格：',
          confirm: '确认选择',
          features: {
            clay: '3小时燃烧时间',
            terracotta: '4小时燃烧时间',
            stone: '6小时燃烧时间',
            brass: '8小时燃烧时间 (延长)',
            oil: '神圣棉芯与纯净植物油'
          }
        },
        multiple: {
          title: '108盏吉祥灯',
          tag: '最为神圣',
          intent_label: '供奉意愿',
          intents: {
            general: '博大和平与智慧',
            ancestral: '祖先庇佑',
            healing: '康复与安康',
            success: '成功与繁荣'
          },
          request_label: '个性化要求',
          request_placeholder: '输入供奉姓名或特殊要求...',
          current_intent: '当前意愿：',
          keepsake: {
            title: '数字纪念',
            status: '已包含',
            description: '高清照片及为您点燃108盏灯的个性化视频剪辑。'
          },
          cta: '选择供奉'
        }
      },
      contact: {
        label: '联系我们',
        title_main: '开始',
        title_sub: '咨询',
        description: '无论您寻求一盏灯还是一次宏大的奉献，我们的团队都将助力您的心灵旅程。',
        location_label: '圣所位置',
        location_value: '尼泊尔蓝毗尼寺院区',
        whatsapp_label: 'WhatsApp 咨询',
        whatsapp_number: '+977 9813044996',
        form: {
          name: '全名',
          email: '电子邮箱',
          package: '套餐',
          contact_method: '联系方式',
          message: '留言',
          placeholder_intent: '您的心灵意愿...',
          send: '发送咨询',
          sending: '发送中...',
          success_title: '咨询已收到',
          success_p: '我们的工作人员将很快与您联系。',
          send_another: '再次发送',
          errors: {
            invalid_email: '请输入有效的电子邮件地址。',
            message_short: '留言内容至少需要10个字符。',
            message_long: '留言内容不能超过500个字符。'
          }
        }
      },
      footer: {
        copy: '© {{year}} 蓝毗尼灯舍。神圣传统之守护。'
      },
      donation: {
        label: '神圣支持',
        title: '照亮前行之路',
        description: '您的贡献有助于维护寺院区的神圣性并支持当地社区。每一份礼物，如同每一团火焰，都为世界带来光明。',
        support_type: '支持类型',
        options: {
          sanctuary: '圣所保护',
          education: '当地教育基金',
          monastery: '寺院福利'
        },
        amount_label: '选择金额',
        custom_placeholder: '其他金额...',
        cta: '提供支持',
        success_title: '功德无量',
        success_p: '我们已收到您的慷慨捐助。愿您分享的光明以千倍之势回到您的身边。'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
