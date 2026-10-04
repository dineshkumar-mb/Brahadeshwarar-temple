import { HotspotItem } from '../state/experienceStore'

export interface TimelineEvent {
  year: string
  period: string
  title: string
  tamilTitle?: string
  description: string
  significance: string
  imageRef?: string
}

export const TEMPLE_HOTSPOTS: HotspotItem[] = [
  {
    id: 'kumbam',
    title: 'Monolithic Sikhara & Kalasam',
    tamilTitle: 'சிகரம் & கலசம்',
    category: 'Crown of the Vimana',
    shortDesc: 'A colossal 80-tonne octagonal granite cupola perched 66 meters above ground.',
    historicalContext:
      'According to historical epigraphy and oral tradition, this monolithic granite dome was rolled up to the summit using an inclined earthen ramp extending over 6 kilometers from the village of Sarapallam. It is crowned with an 8-foot gilded bronze kalasam (stupi).',
    position: [0, 58.0, -25],
    cameraTarget: [0, 54.0, -25],
    cameraPos: [-14, 58.0, -12],
    imageRef: '/images/temple/side-view.webp',
  },
  {
    id: 'vimana',
    title: 'Sri Vimana (Dakshina Meru)',
    tamilTitle: 'ஸ்ரீ விமானம் (தக்ஷிண மேரு)',
    category: 'The Great Tower',
    shortDesc: '13 stepped pyramidal tiers rising 216 feet (66m), engineered with hollow corbelling.',
    historicalContext:
      'Referred to in inscriptions as Dakshina Meru (the southern cosmic mountain), the tower is constructed entirely of interlocking granite blocks without any binding mortar. Its stepped pyramid geometry symbolizes Mount Meru.',
    position: [0, 32.0, -25],
    cameraTarget: [0, 30.0, -25],
    cameraPos: [18, 16.0, -2],
    imageRef: '/images/temple/right-sideview.webp',
  },
  {
    id: 'inscriptions',
    title: 'Royal Epigraphy & Inscriptions',
    tamilTitle: 'கல்வெட்டுகள்',
    category: 'Historical Record',
    shortDesc: 'Meticulously chiseled Tamil and Grantha inscriptions covering the granite plinth.',
    historicalContext:
      'Rajaraja I decreed that every single donation—from crowns of gold and pearls down to individual brass spoons—be permanently inscribed on the temple walls. Inscriptions also record the names of 400 temple dancers (Tali-cheri pendugal), musicians, accountants, and master architect Kunjara Mallan Raja Raja Perunthachan.',
    position: [-16.0, 3.8, -25],
    cameraTarget: [-15.0, 3.5, -25],
    cameraPos: [-22.0, 5.0, -22],
    imageRef: '/images/temple/right-sideview.webp',
  },
  {
    id: 'kodimaram',
    title: 'Kodimaram (Dhwajasthambham) & Bali Peetham',
    tamilTitle: 'கொடிமரம் & பலிபீடம்',
    category: 'Sacred Flag Mast & Cosmic Axis',
    shortDesc: 'A towering 16-meter gilded brass flagmast with 33 rings and stepped granite Bali Peetham offering altar.',
    historicalContext:
      'Standing proudly along the temple central East-West cosmic axis between the Rajagopuram entrance and the colossal Nandi Mandapam, the Kodimaram symbolizes the human spine (Sushumna Nadi) with its 33 segmented brass rings representing the vertebrae and states of consciousness. Surmounted by cross-arms (Yasti), consecrated brass temple bells, a fluttering saffron Chola Rishabha flag, and a golden Kalasam pinnacle, it serves as the spiritual antenna connecting Earth to the cosmos. Before entering the sanctum, devotees prostrate before the adjacent Bali Peetham (sacred lotus altar) to symbolically surrender the ego (Ahankara).',
    position: [0, 8.5, 86],
    cameraTarget: [0, 7.5, 86],
    cameraPos: [-8.0, 5.0, 96.0],
    imageRef: '/kodimaram.jpg',
    galleryImages: [
      '/kodimaram.jpg',
      '/images/temple/entrance.jpg',
      '/images/temple/nandhi-sideview.jpg',
      '/images/temple/gopuram-backsideview.webp',
    ],
  },
  {
    id: 'nandi',
    title: 'Monolithic Nandi & Mandapam',
    tamilTitle: 'மகா நந்தி மண்டபம்',
    category: 'Sacred Bull Monolith',
    shortDesc: 'A colossal 25-tonne monolithic black granite Nandi (12 ft high, 19.5 ft long) facing the inner sanctum.',
    historicalContext:
      'Carved from a single massive boulder of deep greenish-black granite, this colossal Nandi is adorned with intricately sculpted brass bell necklaces, floral malas, and harness ropes. It is housed within an ornate hypostyle mandapa constructed during the Nayak period, featuring carved composite Yali pillars and vibrant 16th-century tempera ceiling frescoes in natural lapis lazuli, gold, and vermilion.',
    position: [0, 4.6, 66],
    cameraTarget: [0, 4.2, 65.5],
    cameraPos: [-6.5, 4.6, 52.5],
    imageRef: '/images/temple/nandhi-sideview.jpg',
    galleryImages: [
      '/images/temple/nandhi-sideview.jpg',
      '/images/temple/nandhi-backsideview.jpg',
      '/images/temple/gopuram-backsideview.webp',
    ],
  },
  {
    id: 'lingam',
    title: 'Peruvudaiyar Maha Lingam',
    tamilTitle: 'பெரியவுடையார் மகாலிங்கம்',
    category: 'The Sacred Sanctum (Garbhagriha)',
    shortDesc: 'A colossal 13-foot monolithic black granite Shiva Lingam seated on a 54-foot circumference Avudaiyar.',
    historicalContext:
      'Enshrined inside the double-walled granite Garbhagriha directly beneath the soaring 66-meter Sri Vimana, this colossal monolithic Lingam was consecrated as Adavallan (The Master of Dance) and Dakshina Meru Vitankan by Emperor Rajaraja I in 1010 CE. Rising nearly 4 meters high from a vast circular granite Avudaiyar (Yoni-pitha), it is decorated with sacred Vibhuti (tripundra holy ash), eyes, sandalwood paste, rudraksha malas, and fresh flower garlands, illuminated by tiered bronze deepam lamps in unbroken daily worship.',
    position: [0, 6.2, -25],
    cameraTarget: [0, 6.0, -25],
    cameraPos: [0, 5.5, -17.5],
    imageRef: '/images/lingam.jpg',
    galleryImages: [
      '/images/lingam.jpg',
      '/images/temple/right-sideview.webp',
      '/images/temple/side-view.webp',
    ],
  },
  {
    id: 'nandi-ceiling',
    title: 'Nandi Mandapam Painted Ceilings',
    tamilTitle: 'நந்தி மண்டப மேற்கூரை ஓவியங்கள்',
    category: 'Nayak-Period Murals',
    shortDesc: 'Intricate 16th-century celestial fresco murals and carved Yali capitals above the great Nandi.',
    historicalContext:
      'The underside of the Nandi Mandapa ceiling is covered with exquisite polychromatic frescoes depicting floral mandalas, celestial dancers, and Shiva legends. The rear perspective reveals the massive polished hindquarters of the bull adorned with rows of bells and embroidered saddlecloth, framed by soaring granite capitals.',
    position: [0, 7.5, 66],
    cameraTarget: [0, 4.8, 65.0],
    cameraPos: [0, 3.8, 73.0],
    imageRef: '/images/temple/nandhi-backsideview.jpg',
    galleryImages: [
      '/images/temple/nandhi-backsideview.jpg',
      '/images/temple/nandhi-sideview.jpg',
    ],
  },
  {
    id: 'gopuram',
    title: 'Keralantakan & Rajarajan Gopuram',
    tamilTitle: 'கேரளாந்தகன் திருவாயில்',
    category: 'Monumental Gateway',
    shortDesc: 'Twin granite entrance gateways guarded by monolithic Dvarapala sculptures.',
    historicalContext:
      'Built to commemorate Rajaraja I victory over the Chera navy at Kandalur Salai, this entrance features two gargantuan Dvarapalas (gatekeepers) carved with coiled serpents, fierce expressions, and raised clubs, asserting spiritual protection.',
    position: [0, 9.5, 128],
    cameraTarget: [0, 9.5, 128],
    cameraPos: [0, 3.6, 168.0],
    imageRef: '/images/temple/entrance.jpg',
    galleryImages: [
      '/images/temple/entrance.jpg',
      '/images/temple/entrance.webp',
      '/images/temple/gopuram-sideview.webp',
      '/images/temple/gopuram-backsideview.webp',
    ],
  },
  {
    id: 'mandapa',
    title: 'Ardhamandapa & Mahamandapa',
    tamilTitle: 'அர்த்த மண்டபம்',
    category: 'Axial Halls',
    shortDesc: 'Hypostyle pillared halls connecting the outer courtyard to the Garbhagriha.',
    historicalContext:
      'These monumental assembly halls feature heavy monolithic pillars carved with geometric motifs. Inside the surrounding corridor walls, the Cholas carved 81 of the 108 sacred classical dance karanas described in the ancient Natya Shastra, alongside vibrant fresco paintings.',
    position: [12.5, 6.5, 15],
    cameraTarget: [0, 6.0, 15],
    cameraPos: [22.0, 8.5, 15],
    imageRef: '/images/temple/gopuram-sideview.webp',
  },
]

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '985 CE',
    period: 'Chola Dynasty Ascension',
    title: 'Accession of Rajaraja Chola I',
    tamilTitle: 'முதலாம் இராஜராஜ சோழன்',
    description:
      'Prince Arulmozhi Varman ascends the Chola throne as Rajaraja I, uniting the Tamil kingdoms and establishing administrative and naval supremacy across the Indian Ocean.',
    significance: 'Initiation of the classical Chola architectural renaissance.',
    imageRef: '/images/lingam.jpg',
  },
  {
    year: '1003–1010 CE',
    period: 'Imperial Construction',
    title: 'Seven Years of Sacred Engineering',
    tamilTitle: 'கோயில் கட்டுமானம்',
    description:
      'Rajaraja I commissions the Peruvudaiyar Kovil (Brihadisvara). Master builder Kunjara Mallan Raja Raja Perunthachan oversees thousands of stone masons, artisans, and elephant battalions transporting 130,000 tonnes of granite across 50 km.',
    significance: 'Completed on the 275th day of Rajaraja 25th regnal year (1010 CE).',
    imageRef: '/images/temple/side-view.webp',
  },
  {
    year: '1014 CE',
    period: 'Maritime Empire',
    title: 'Rajendra I & Trans-Oceanic Cholas',
    tamilTitle: 'இராஜேந்திர சோழன்',
    description:
      'Crown Prince Rajendra I continues the legacy, taking Chola fleets to the Ganges, Sri Lanka, Malaya, and the Srivijaya empire of Sumatra, commemorating his triumphs with the sister temple at Gangaikonda Cholapuram.',
    significance: 'Peak of the Chola maritime and cultural golden age.',
  },
  {
    year: '16th–18th Century',
    period: 'Nayak & Maratha Patronage',
    title: 'Fortifications & Artistic Additions',
    tamilTitle: 'நாயக்கர் மற்றும் மராட்டியர் காலம்',
    description:
      'The Thanjavur Nayaks and later the Maratha kings (including Serfoji II) construct the Nandi Mandapa, add outer defensive fortifications (Sivaganga Fort), and restore the ancient frescoes and Sanskrit/Marathi libraries.',
    significance: 'Continuous royal preservation across four dynasties.',
    imageRef: '/images/temple/nandhi-backsideview.jpg',
  },
  {
    year: '1987 CE',
    period: 'Global Recognition',
    title: 'UNESCO World Heritage Designation',
    tamilTitle: 'யுனெஸ்கோ உலக பாரம்பரியக் களம்',
    description:
      'The temple is officially inscribed onto the UNESCO World Heritage list as the primary monument of "The Great Living Chola Temples", recognized as an unmatched masterpiece of human creative genius.',
    significance: 'Global cultural protection and architectural preservation.',
    imageRef: '/images/temple/entrance.webp',
  },
  {
    year: 'Present Day',
    period: 'Unbroken Living Tradition',
    title: 'A Millennium of Living Heritage',
    tamilTitle: 'வாழும் பாரம்பரியம்',
    description:
      'Unlike archaeological ruins elsewhere, Brihadisvara remains an active centre of daily Vedic rituals, Agamic worship, classical music, and annual festivals like Maha Shivaratri and Brahan Natyanjali, continuing an unbroken sacred tradition for over 1,014 years.',
    significance: 'One of the oldest continuously functioning monuments on Earth.',
    imageRef: '/images/temple/gopuram-backsideview.webp',
  },
]
