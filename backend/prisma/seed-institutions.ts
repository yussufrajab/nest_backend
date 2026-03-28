import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Institutions extracted from institutions_list_2026-03-28.pdf
const institutionsData = [
  { name: 'AFISI YA MKURUGENZI WA MASHTAKA', email: 'dppznz@dppznz.go.tz', phoneNumber: '+255-24-2235564', tinNumber: '107779272', voteNumber: '029' },
  { name: 'AFISI YA MWANASHERIA MKUU', email: 'info@agcz.go.tz', phoneNumber: '0242232502', tinNumber: '101817016', voteNumber: '028' },
  { name: 'AFISI YA RAISI KAZI, UCHUMI NA UWEKEZAJI', email: 'info@arkuusmz.go.tz', phoneNumber: '0242230061', tinNumber: '101697533', voteNumber: '006' },
  { name: 'Baraza la Jiji', email: null, phoneNumber: null, tinNumber: '141760874', voteNumber: '201' },
  { name: 'Baraza la Manispaa Magharibi A', email: null, phoneNumber: null, tinNumber: '137175088', voteNumber: '203' },
  { name: 'Baraza la Manispaa Magharibi B', email: null, phoneNumber: null, tinNumber: '129840552', voteNumber: '204' },
  { name: 'Baraza la Manispaa Mjini Unguja', email: null, phoneNumber: null, tinNumber: '121454009', voteNumber: '202' },
  { name: 'Baraza la Mitihani', email: null, phoneNumber: null, tinNumber: '124650941', voteNumber: '547' },
  { name: 'Baraza la Mji Chake Chake', email: null, phoneNumber: null, tinNumber: '119062896', voteNumber: '210' },
  { name: 'Baraza la Mji Kaskazini A Unguja', email: null, phoneNumber: null, tinNumber: '141799118', voteNumber: '207' },
  { name: 'Baraza la Mji Kaskazini B Unguja', email: null, phoneNumber: null, tinNumber: '106226431', voteNumber: '208' },
  { name: 'Baraza la Mji Kati Unguja', email: null, phoneNumber: null, tinNumber: '134349867', voteNumber: '205' },
  { name: 'Baraza la Mji Mkoani', email: null, phoneNumber: null, tinNumber: '119062756', voteNumber: '209' },
  { name: 'Baraza la Mji Wete', email: null, phoneNumber: null, tinNumber: '119065402', voteNumber: '211' },
  { name: 'Bodi ya Huduma za Maktaba', email: null, phoneNumber: null, tinNumber: '114542164', voteNumber: '543' },
  { name: 'Chuo cha Kiislamu', email: null, phoneNumber: null, tinNumber: null, voteNumber: null },
  { name: 'Halmashauri ya Wilaya ya Kusini Unguja', email: null, phoneNumber: null, tinNumber: '137926121', voteNumber: '206' },
  { name: 'Halmashauri ya Wilaya ya Micheweni', email: null, phoneNumber: null, tinNumber: '137833387', voteNumber: '212' },
  { name: 'Hospitali ya Mnazi Mmoja', email: null, phoneNumber: null, tinNumber: '124546745', voteNumber: '025' },
  { name: 'JKU', email: null, phoneNumber: null, tinNumber: null, voteNumber: null },
  { name: 'KAMISHENI YA ARDHI ZANZIBAR', email: 'info@kamisheniardhi.go.tz', phoneNumber: '0774776619', tinNumber: '101816990', voteNumber: '520' },
  { name: 'Kamisheni ya Kazi', email: null, phoneNumber: null, tinNumber: '101817687', voteNumber: '573' },
  { name: 'KAMISHENI YA KUKABILIANA NA MAAFA ZANZIBAR', email: 'zdmc@maafaznz.go.tz', phoneNumber: '+255242234755', tinNumber: '119752302', voteNumber: '510' },
  { name: 'KAMISHENI YA UTALII ZANZIBAR', email: 'info@zanzibartourism.go.tz', phoneNumber: '+255 24 2233485', tinNumber: null, voteNumber: null },
  { name: 'KAMISHENI YA UTUMISHI WA UMMA', email: 'kamisheni.utumishi@zpsc.go.tz', phoneNumber: '+255242230872', tinNumber: '145869242', voteNumber: '036' },
  { name: 'MAMLAKA YA KUDHIBITI NA KUPAMBANA NA DAWA ZA KULEVYA ZANZIBAR', email: 'info@zdcea.go.tz', phoneNumber: '+255242233403', tinNumber: '141776339', voteNumber: '032' },
  { name: 'MAMLAKA YA KUZUIA RUSHWA NA UHUJUMU WA UCHUMI ZANZIBAR', email: 'info@zaeca.go.tz', phoneNumber: '0774824242', tinNumber: '122439755', voteNumber: '035' },
  { name: 'Mamlaka ya Serikali Mtandao (eGAZ)', email: null, phoneNumber: null, tinNumber: '154803912', voteNumber: '038' },
  { name: 'Mamlaka ya Uwezeshaji Wananchi Kiuchumi (ZEA)', email: null, phoneNumber: null, tinNumber: '176332557', voteNumber: '105' },
  { name: 'Ofisi ya Hatimiliki (COSOZA)', email: null, phoneNumber: null, tinNumber: '132175306', voteNumber: '558' },
  { name: 'OFISI YA MAKAMO WA KWANZA WA RAISI', email: 'info@omkr.go.tz', phoneNumber: '+255 242232475', tinNumber: '115615637', voteNumber: '002' },
  { name: 'OFISI YA MAKAMO WA PILI WA RAISI', email: 'info@ompr.go.tz', phoneNumber: '0242231826', tinNumber: '101817601', voteNumber: '003' },
  { name: 'Ofisi ya Mhasibu Mkuu wa Serikali', email: 'info@mofzanzibar.go.tz', phoneNumber: '024776666', tinNumber: '156933775', voteNumber: '022' },
  { name: 'OFISI YA MKAGUZI MKUU WA NDANI WA SERIKALI', email: 'info@oiagsmz.go.tz', phoneNumber: '255743600320', tinNumber: '156958174', voteNumber: '052' },
  { name: 'Ofisi ya Mkaguzi wa Elimu', email: null, phoneNumber: null, tinNumber: '181476419', voteNumber: '546' },
  { name: 'Ofisi ya Mkuu wa Mkoa wa Kaskazini Pemba', email: null, phoneNumber: null, tinNumber: '119060877', voteNumber: '051' },
  { name: 'Ofisi ya Mkuu wa Mkoa wa Kaskazini Unguja', email: null, phoneNumber: null, tinNumber: '107779450', voteNumber: '048' },
  { name: 'Ofisi ya Mkuu wa Mkoa wa Kusini Pemba', email: null, phoneNumber: null, tinNumber: '119062888', voteNumber: '050' },
  { name: 'Ofisi ya Mkuu wa Mkoa wa Kusini Unguja', email: 'info@southunguja.go.tz', phoneNumber: '0777433124', tinNumber: '107779477', voteNumber: '049' },
  { name: 'Ofisi ya Mkuu wa Mkoa wa Mjini Magharibi Unguja', email: null, phoneNumber: null, tinNumber: '107779396', voteNumber: '047' },
  { name: 'Ofisi ya Msajili wa Hazina', email: 'info@trosmz.go.tz', phoneNumber: '111111111111', tinNumber: '176281286', voteNumber: '106' },
  { name: 'OFISI YA MUFTI MKUU WA ZANZIBAR', email: 'info@muftizanzibar.go.tz', phoneNumber: '0777483627', tinNumber: null, voteNumber: null },
  { name: 'OFISI YA RAIS, FEDHA NA MIPANGO', email: 'info@mofzanzibar.go.tz', phoneNumber: '+255 2477666664/5', tinNumber: null, voteNumber: '567' },
  { name: 'OFISI YA RAIS - IKULU', email: 'info@ikuluzanzibar.go.tz', phoneNumber: '+2252230814#5', tinNumber: null, voteNumber: '567' },
  { name: 'OFISI YA RAIS - KATIBA SHERIA UTUMISHI NA UTAWALA BORA', email: 'info@utumishismz.go.tz', phoneNumber: '+255242230034', tinNumber: '141811827', voteNumber: '005' },
  { name: 'OFISI YA RAIS, TAWALA ZA MIKOA, SERIKALI ZA MITAA NA IDARA MAALUMU ZA SMZ', email: 'info@tamisemim.go.tz', phoneNumber: '+255242230034', tinNumber: '101732835', voteNumber: '004' },
  { name: 'Skuli ya Sheria Zanzibar', email: null, phoneNumber: null, tinNumber: '154057374', voteNumber: '570' },
  { name: 'TAASISI YA ELIMU ZANZIBAR', email: 'info@zie.go.tz', phoneNumber: '+255242230193', tinNumber: '165130197', voteNumber: '542' },
  { name: 'TAASISI YA NYARAKA NA KUMBUKUMBU', email: 'info@ziar.go.tz', phoneNumber: '11111111111', tinNumber: '165400550', voteNumber: '057' },
  { name: 'Taasisi ya Utafiti wa Uvuvi (ZAFIRI)', email: null, phoneNumber: null, tinNumber: '140711764', voteNumber: '526' },
  { name: 'Tume ya kusimamia Nidhamu', email: null, phoneNumber: null, tinNumber: null, voteNumber: null },
  { name: 'TUME YA MAADILI YA VIONGOZI WA UMMA', email: 'info@ethicscommission.go.tz', phoneNumber: '+255242235535', tinNumber: '136664387', voteNumber: '113' },
  { name: 'Tume ya Mipango', email: null, phoneNumber: null, tinNumber: '121462354', voteNumber: '024' },
  { name: 'TUME YA UCHAGUZI YA ZANZIBAR', email: 'info@zec.go.tz', phoneNumber: '242231489', tinNumber: '106692653', voteNumber: '031' },
  { name: 'Tume ya Ushindani Halali wa Biashara', email: null, phoneNumber: null, tinNumber: '148444331', voteNumber: '518' },
  { name: 'TUME YA UTUMISHI SERIKALINI', email: 'info@zanajira.go.tz', phoneNumber: '0773101012', tinNumber: '101817199', voteNumber: '037' },
  { name: 'Wakala wa Barabara', email: null, phoneNumber: null, tinNumber: '151578152', voteNumber: '559' },
  { name: 'WAKALA WA MAJENGO ZANZIBAR', email: 'info@zba.go.tz', phoneNumber: '0242232695', tinNumber: '137516160', voteNumber: '522' },
  { name: 'Wakala wa Matrekta', email: null, phoneNumber: null, tinNumber: '136148710', voteNumber: '527' },
  { name: 'Wakala wa Vipimo Zanzibar', email: 'info@zawemasmz.go.tz', phoneNumber: '0778586654', tinNumber: '157124463', voteNumber: '519' },
  { name: 'WIZARA YA AFYA', email: 'info@mohz.go.tz', phoneNumber: '+255242231614', tinNumber: '101817180', voteNumber: '008' },
  { name: 'WIZARA YA ARDHI NA MAENDELEO YA MAKAAZI ZANZIBAR', email: 'info@ardhismz.go.tz', phoneNumber: '0242941193', tinNumber: '101697509', voteNumber: '014' },
  { name: 'WIZARA YA BIASHARA NA MAENDELEO YA VIWANDA', email: 'info@tradesmz.go.tz', phoneNumber: '024-2941140', tinNumber: '101789799', voteNumber: '017' },
  { name: 'WIZARA YA ELIMU NA MAFUNZO YA AMALI', email: 'info@moez.go.tz', phoneNumber: '+255777458878', tinNumber: '101817709', voteNumber: '011' },
  { name: 'WIZARA YA HABARI, VIJANA, UTAMADUNI NA MICHEZO', email: 'info@habarismz.go.tz', phoneNumber: '0242231202', tinNumber: '137692902', voteNumber: '018' },
  { name: 'WIZARA YA KILIMO UMWAGILIAJI MALIASILI NA MIFUGO', email: 'ps@kilimoznz.go.tz', phoneNumber: '0777868306', tinNumber: '101817679', voteNumber: '012' },
  { name: 'WIZARA YA MAENDELEO YA JAMII,JINSIA,WAZEE NA WATOTO', email: 'info@jamiismz.go.tz', phoneNumber: '+255242231413', tinNumber: '157443895', voteNumber: '019' },
  { name: 'WIZARA YA MAJI NISHATI NA MADINI', email: 'info@majismz.go.tz', phoneNumber: '0242232695', tinNumber: '150308305', voteNumber: '015' },
  { name: 'WIZARA YA UCHUMI WA BULUU NA UVUVI', email: 'info@blueeconomy.go.tz', phoneNumber: '242941195', tinNumber: '150874084', voteNumber: '013' },
  { name: 'WIZARA YA UJENZI MAWASILIANO NA UCHUKUZI', email: 'info@moic.go.tz', phoneNumber: '0242941138', tinNumber: '101817156', voteNumber: '016' },
  { name: 'WIZARA YA UTALII NA MAMBO YA KALE', email: 'info@utaliismz.go.tz', phoneNumber: '0242231250', tinNumber: '104480454', voteNumber: '010' },
];

async function main() {
  console.log('Starting institution seeding...');
  console.log(`Total institutions to seed: ${institutionsData.length}`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const instData of institutionsData) {
    // Check if institution already exists by name
    const existingInstitution = await prisma.institution.findFirst({
      where: { name: instData.name },
    });

    if (existingInstitution) {
      console.log(`⏭️  Skipped (exists): ${instData.name}`);
      skippedCount++;
      continue;
    }

    try {
      const institution = await prisma.institution.create({
        data: {
          id: uuidv4(),
          name: instData.name,
          email: instData.email || null,
          phoneNumber: instData.phoneNumber || null,
          tinNumber: instData.tinNumber || null,
          voteNumber: instData.voteNumber || null,
        },
      });

      createdCount++;
      console.log(`✅ [${createdCount}] Created: ${institution.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${instData.name}:`, error);
    }
  }

  console.log(`\n===========================================`);
  console.log(`✅ Successfully created ${createdCount} institutions`);
  console.log(`⏭️  Skipped ${skippedCount} existing institutions`);
  console.log(`===========================================`);
}

main()
  .catch((e) => {
    console.error('Error seeding institutions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
