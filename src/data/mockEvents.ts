// Menu: Data Acara & Tiket

import { EventItem } from '../types/database';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-001',
    event_code: 'RH-OP-01',
    title: 'Terra Comic-Con 2026: Originium Arts Showcase',
    category: 'Anime Con',
    description: 'Konvensi akbar subkultur anime, komik pop Jepang, dan ilustrasi digital terbesar di Terra. Menghadirkan lebih dari 250 booth lingkar kreator doujin ternama, peluncuran artbook edisi terbatas, panggung anisong bertabur bintang dengan penampilan pengisi suara internasional dari Lungmen dan Yan, serta instalasi pameran seni interaktif Originium Arts berskala gigantis. Pengunjung dapat menikmati area pameran figurin eksklusif, photo booth tematik dengan tata pencahayaan profesional, dan merchandise resmi bergaransi 100% original.',
    location: 'District 8 Grand Expo Center, Sector Alpha (Hall A-C), Jakarta International Expo',
    starts_at: '2026-11-14T09:00:00Z',
    ends_at: '2026-11-15T19:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-01T04:00:00Z',
    min_price: 150000,
    available_stock: 240,
    total_quota: 300,
    ticket_types: [
      {
        id: 'tt-001-a',
        event_id: 'evt-001',
        name: 'Presale 1: Regular 1-Day Pass',
        price: 150000,
        quota: 200,
        sold_count: 50,
        perks: [
          'Akses penuh semua hall pameran dan stage area utama',
          'Official Event Directory Booklet & Sticker Pack eksklusif',
          'Jaminan penukaran wristband cepat tanpa antrean manual'
        ]
      },
      {
        id: 'tt-001-b',
        event_id: 'evt-001',
        name: 'VIP Vanguard Pass (Fast-Track & Meet)',
        price: 320000,
        quota: 100,
        sold_count: 10,
        perks: [
          'Jalur antrean prioritas VIP Fast-Track Gate di pintu masuk',
          'Tempat duduk barisan depan (Front-Row) panggung utama',
          'Official Commemorative Artbook Hardcover edisi kolektor',
          'Voucher belanja merchandise resmi promotor Rp 50.000',
          'Akses eksklusif VIP Lounge ber-AC dengan free beverage'
        ]
      }
    ]
  },
  {
    id: 'evt-002',
    event_code: 'RH-OP-02',
    title: 'Lungmen Major Invitational: Tactics Finals',
    category: 'Esports',
    description: 'Turnamen akbar esports strategi taktis dan MOBA kancah regional paling bergengsi tahun ini. Menyaksikan pertarungan puncak perebutan piala Golden Dragon Cup dari 16 tim profesional terbaik dunia yang bertanding langsung di panggung oktagonal megah 360 derajat dengan sistem suara surround stadium dan layar LED raksasa ultra HD. Dilengkapi zona coaching klinik interaktif bersama mantan juara dunia, pertunjukan showmatch eksibisi influencer, serta giveaway perlengkapan gaming periferal setiap pergantian babak pertandingan.',
    location: 'Lungmen Central Cyber Stadium, Hall 3 Arena, Gelora Bung Karno Senayan',
    starts_at: '2026-11-20T13:00:00Z',
    ends_at: '2026-11-21T22:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-05T08:30:00Z',
    min_price: 120000,
    available_stock: 180,
    total_quota: 250,
    ticket_types: [
      {
        id: 'tt-002-a',
        event_id: 'evt-002',
        name: 'Tribun General Seat Tier',
        price: 120000,
        quota: 150,
        sold_count: 50,
        perks: [
          'Kursi bernomor (numbered seat) pandangan sentral panggung LED',
          'Paket suporter cheering kit & thunderstick interaktif',
          'In-game exclusive skin redemption code berhadiah item langka'
        ]
      },
      {
        id: 'tt-002-b',
        event_id: 'evt-002',
        name: 'Floor Ringside + Meet & Greet Pro Team',
        price: 250000,
        quota: 100,
        sold_count: 20,
        perks: [
          'Kursi baris terdepan lantai dasar tepat di samping bilik pemain',
          'Sesi foto bersama dan tanda tangan eksklusif dengan tim finalis',
          'Jersey suporter limited edition & lanyard metalik Rhodes Dispatch'
        ]
      }
    ]
  },
  {
    id: 'evt-003',
    event_code: 'RH-OP-03',
    title: 'Victoria Grand Symphony: Arknights Orchestral Night',
    category: 'Music & Symphony',
    description: 'Malam konser simfoni klasik megah yang dipentaskan oleh 65 musisi orkestra filharmonik kelas dunia bersama paduan suara beranggotakan 40 orang. Membawakan aransemen orkestra dramatis dari lagu-lagu tema ikonik Arknights, solo biola melankolis, dentuman perkusi epik pertempuran Chernobog, serta lagu balada opera Victoria. Suasana auditorium berstandar akustik global menghadirkan pengalaman audio imersif tanpa cela bagi para penikmat musik berkualitas tinggi.',
    location: 'Victoria Royal Opera House, South Wing Grand Auditorium, Aula Simfonia Jakarta',
    starts_at: '2026-12-05T18:30:00Z',
    ends_at: '2026-12-05T21:30:00Z',
    poster_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-10T02:15:00Z',
    min_price: 350000,
    available_stock: 95,
    total_quota: 200,
    ticket_types: [
      {
        id: 'tt-003-a',
        event_id: 'evt-003',
        name: 'Balcony Orchestra Tier',
        price: 350000,
        quota: 120,
        sold_count: 65,
        perks: [
          'Kursi balkon atas dengan pantulan resonansi suara terkalibrasi',
          'Buku program panduan simfoni berdesain mewah cetak hard cover'
        ]
      },
      {
        id: 'tt-003-b',
        event_id: 'evt-003',
        name: 'Royal Stalls & Backstage Reception',
        price: 650000,
        quota: 80,
        sold_count: 40,
        perks: [
          'Kursi barisan utama lantai dasar dengan akustik sempurna',
          'Piringan hitam vinyl edisi kolektor bertanda tangan konduktor',
          'Akses cocktail reception & temu sapa musisi pasca pertunjukan'
        ]
      }
    ]
  },
  {
    id: 'evt-004',
    event_code: 'RH-OP-04',
    title: 'Kazdel Cosplay Masquerade & Armory Expo',
    category: 'Cosplay',
    description: 'Pesta perayaan kostum dan pameran pengerjaan zirah serta replika prop cosplay terbesar di Asia Tenggara. Menghadirkan kompetisi cosplay runway berskala internasional dengan total hadiah puluhan juta rupiah, puluhan studio foto bertema gothic industrial dan fantasi gelap dengan perlengkapan lighting profesional, serta workshop pembuatan kostum dari busa hati, 3D print, dan pewarnaan efek logam yang dipandu langsung oleh cosplayer juara dunia.',
    location: 'Darkzone Industrial Pavilion B, Exhibition Zone, ICE BSD City Tangerang',
    starts_at: '2026-11-28T10:00:00Z',
    ends_at: '2026-11-28T20:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-12T11:00:00Z',
    min_price: 95000,
    available_stock: 310,
    total_quota: 350,
    ticket_types: [
      {
        id: 'tt-004-a',
        event_id: 'evt-004',
        name: 'Visitor Regular Pass',
        price: 95000,
        quota: 250,
        sold_count: 30,
        perks: [
          'Akses seluruh area pameran kostum, runway show, dan stage utama',
          'Tiket voting juri penonton untuk Masquerade Championship'
        ]
      },
      {
        id: 'tt-004-b',
        event_id: 'evt-004',
        name: 'Cosplayer Performer + Ruang Ganti & Locker',
        price: 140000,
        quota: 100,
        sold_count: 10,
        perks: [
          'Akses ruang rias dan ruang ganti kostum ber-AC dengan cermin studio',
          'Fasilitas penitipan barang dan koper prop berkeamanan 24 jam',
          'Prioritas antrean photobooth dengan tata cahaya profesional'
        ]
      }
    ]
  },
  {
    id: 'evt-005',
    event_code: 'RH-OP-05',
    title: 'Sami Winter Game Fest: Indie Tactics & Demos',
    category: 'Gaming',
    description: 'Festival video game bertema eksplorasi taktik dan inovasi gameplay dari developer independen. Pengunjung dapat mencoba langsung lebih dari 40 demo game PC, konsol, dan mobile yang belum dirilis ke publik secara eksklusif. Ikuti sesi bincang hangat bersama produser game, tantangan speedrun berhadiah laptop gaming, serta lounge relaksasi yang menyajikan kuliner musim dingin khas perbatasan Sami.',
    location: 'Northern Frost Civic Forum, Hall C, Sasana Budaya Ganesha Bandung',
    starts_at: '2026-12-12T10:00:00Z',
    ends_at: '2026-12-13T18:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-15T09:40:00Z',
    min_price: 80000,
    available_stock: 420,
    total_quota: 500,
    ticket_types: [
      {
        id: 'tt-005-a',
        event_id: 'evt-005',
        name: 'Weekend All-Access Pass (2 Hari)',
        price: 80000,
        quota: 350,
        sold_count: 60,
        perks: [
          'Akses tanpa batas ke seluruh demo booth game selama 2 hari penuh',
          'Akses ke sesi talkshow & workshop desain game bersama studio indie'
        ]
      },
      {
        id: 'tt-005-b',
        event_id: 'evt-005',
        name: 'Supporter Bundle Pack',
        price: 160000,
        quota: 150,
        sold_count: 20,
        perks: [
          'Tiket 2-Day Pass semua wahana',
          'Paket Steam Key 3 game indie pilihan kurasi festival',
          'Tote bag kanvas premium & enamel pin eksklusif Sami Winter Fest'
        ]
      }
    ]
  },
  {
    id: 'evt-006',
    event_code: 'RH-OP-06',
    title: 'Siracusa Anime & Film Gathering: Premiere Screenings',
    category: 'Anime Con',
    description: 'Ajang pemutaran perdana dua film animasi layar lebar yang sangat dinanti, dilengkapi sesi bincang eksklusif bersama seiyuu (pengisi suara) kawakan dan sutradara animasi. Malam acara ditutup dengan bazaar festival pasar malam ala Sisilia yang menyajikan kuliner khas Italia, pertunjukan musik akustik jalanan, dan lelang karya seni ilustrasi anime bertanda tangan resmi.',
    location: 'Bellona Plaza Cineplex & Atrium Mall, Grand Indonesia West Mall',
    starts_at: '2026-12-19T14:00:00Z',
    ends_at: '2026-12-20T21:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: '2026-09-18T14:20:00Z',
    min_price: 175000,
    available_stock: 150,
    total_quota: 220,
    ticket_types: [
      {
        id: 'tt-006-a',
        event_id: 'evt-006',
        name: 'Cinema Premiere Ticket + Night Market Voucher',
        price: 175000,
        quota: 150,
        sold_count: 50,
        perks: [
          'Tiket kursi bioskop premiere pemutaran 2 judul film animasi',
          'Voucher makanan pasar malam kuliner Siracusa senilai Rp 30.000'
        ]
      },
      {
        id: 'tt-006-b',
        event_id: 'evt-006',
        name: 'Cast Talk & Front Row Seat',
        price: 300000,
        quota: 70,
        sold_count: 20,
        perks: [
          'Kursi barisan tengah depan studio bioskop dengan sudut pandang terbaik',
          'Sesi tanya jawab langsung bersama pengisi suara tamu kehormatan',
          'Poster film bertanda tangan asli dengan cetak foil emas'
        ]
      }
    ]
  },
  {
    id: 'evt-007',
    event_code: 'RH-OP-07',
    title: 'Yan Cyber Championship: Mecha League Finals',
    category: 'Esports',
    description: 'Kompetisi adu pilot robot mecha virtual dan pertarungan simulator realitas tinggi yang memacu adrenalin. Menghadirkan pertarungan 32 pilot mecha terbaik regional dalam kokpit kemudi bersuspensi hidrolik nyata. Di luar arena pertempuran, pengunjung dapat mencoba wahana arena VR berdefinisi 8K, simulator penembak jitu, dan pameran prototipe robotika masa depan persembahan laboratorium teknik Yan.',
    location: 'Bailian Cyberdome, Level 4 Arena, Jogja Expo Center Yogyakarta',
    starts_at: '2027-01-09T11:00:00Z',
    ends_at: '2027-01-10T20:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    status: 'upcoming',
    created_at: '2026-09-22T07:10:00Z',
    min_price: 110000,
    available_stock: 260,
    total_quota: 300,
    ticket_types: [
      {
        id: 'tt-007-a',
        event_id: 'evt-007',
        name: 'Tournament Pass Regular',
        price: 110000,
        quota: 200,
        sold_count: 30,
        perks: [
          'Akses tribun penonton arena pertarungan utama',
          '1x voucher simulator VR cockpit 15 menit tanpa antrean biasa'
        ]
      },
      {
        id: 'tt-007-b',
        event_id: 'evt-007',
        name: 'Challenger VIP Box',
        price: 240000,
        quota: 100,
        sold_count: 10,
        perks: [
          'Akses VIP lounge dengan camilan ringan dan minuman gratis',
          'Official Yan Mecha tournament hoodie & lanyard gantungan kunci akrilik'
        ]
      }
    ]
  },
  {
    id: 'evt-008',
    event_code: 'RH-OP-08',
    title: 'Rhodes Medical & Bio-Tech Convention: Game Lore Summit',
    category: 'Gaming',
    description: 'Simposium mendalam bagi para kreator, penulis cerita, dan penggemar setia yang ingin membedah dunia fiksi ilmiah (world-building) Terra, biologi Originium, dan arsitektur peradaban nomadik. Mengupas rahasia di balik perancangan naskah naratif game Arknights bersama tim penulis cerita, serta pameran sketsa konseptual dan model diorama kapal darat Rhodes Island skala 1:50.',
    location: 'Rhodes Convention Center, Pavilion Hall 1, JICC Senayan Jakarta',
    starts_at: '2027-01-22T09:00:00Z',
    ends_at: '2027-01-23T17:00:00Z',
    poster_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    status: 'upcoming',
    created_at: '2026-09-25T16:00:00Z',
    min_price: 220000,
    available_stock: 80,
    total_quota: 100,
    ticket_types: [
      {
        id: 'tt-008-a',
        event_id: 'evt-008',
        name: 'Delegate Conference Badge',
        price: 220000,
        quota: 60,
        sold_count: 15,
        perks: [
          'Akses seluruh sesi presentasi, panel diskusi, dan keynote lore',
          'Buku dokumentasi teknis & sertifikat kehadiran konferensi digital'
        ]
      },
      {
        id: 'tt-008-b',
        event_id: 'evt-008',
        name: 'Masterclass Concept Art Pass',
        price: 450000,
        quota: 40,
        sold_count: 5,
        perks: [
          'Sesi workshop interaktif menggambar langsung bersama art director',
          'Review portofolio karya seni secara privat dan mendalam',
          'Kit alat lukis digital dan merchandise eksklusif delegasi'
        ]
      }
    ]
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bk-demo-01',
    user_id: 'usr-operator-01',
    booking_code: 'BK-RD-8841',
    total_amount: 300000,
    status: 'confirmed' as const,
    created_at: '2026-10-10T14:32:00Z',
    customer_name: 'Dr. Kaltsit (Operator Rhodes)',
    customer_email: 'kal.operator@rhodes.dispatch',
    items: [
      {
        id: 'bki-01',
        booking_id: 'bk-demo-01',
        ticket_type_id: 'tt-001-a',
        quantity: 2,
        unit_price: 150000,
        ticket_type_name: 'Presale 1: Regular 1-Day Pass',
        event_title: 'Terra Comic-Con 2026: Originium Arts Showcase',
        event_code: 'RH-OP-01'
      }
    ]
  }
];

export const INITIAL_TICKETS = [
  {
    id: 'tkt-demo-01',
    booking_item_id: 'bki-01',
    ticket_code: 'TK-RH-8841-A',
    qr_token: 'RD-SEC-TK01-9F83A20B71',
    status: 'valid' as const,
    created_at: '2026-10-10T14:32:00Z',
    event_title: 'Terra Comic-Con 2026: Originium Arts Showcase',
    event_code: 'RH-OP-01',
    ticket_type_name: 'Presale 1: Regular 1-Day Pass',
    customer_name: 'Dr. Kaltsit (Operator Rhodes)',
    event_date: '2026-11-14T09:00:00Z',
    event_location: 'District 8 Grand Expo Center, Sector Alpha (Hall A-C), Jakarta International Expo'
  },
  {
    id: 'tkt-demo-02',
    booking_item_id: 'bki-01',
    ticket_code: 'TK-RH-8841-B',
    qr_token: 'RD-SEC-TK02-4A17B69C12',
    status: 'valid' as const,
    created_at: '2026-10-10T14:32:00Z',
    event_title: 'Terra Comic-Con 2026: Originium Arts Showcase',
    event_code: 'RH-OP-01',
    ticket_type_name: 'Presale 1: Regular 1-Day Pass',
    customer_name: 'Dr. Kaltsit (Operator Rhodes)',
    event_date: '2026-11-14T09:00:00Z',
    event_location: 'District 8 Grand Expo Center, Sector Alpha (Hall A-C), Jakarta International Expo'
  }
];
