import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface ParsedAd {
  title: string;
  slug: string;
  description: string;
  address: string;
  district: string;
  size: string;
  width: string;
  height: string;
  monthly_price: number;
  images: Array<{
    url: string;
    alt: string;
    order: number;
  }>;
  page_number: number;
}

// Price corrections based on PDF content
const priceCorrections: { [key: string]: number } = {
  '강남대로_삼흥빌딩-4': 6000000,
  '강남대로_원앤원빌딩-5': 12000000,
  '강남대로_더몬테-6': 20000000,
  '강남대로_이즈타워-7': 16000000,
  '강남대로_g-vision-8': 13000000,
  '강남대로_규정빌딩-9': 12000000,
  '강남-우신빌딩-10': 7000000,
  '테헤란로_역삼빌딩-11': 12000000,
  '테헤란로_da빌딩-12': 10000000,
  '테헤란로_현익빌딩-13': 12000000,
  '테헤란로_아이타워-14': 12000000,
  '테헤란로_성담빌딩-15': 15000000,
  '도산대로_시그니처도산-16': 12000000,
  '도산대로_벤츠학빌딩-17': 6000000,
  '도산대로_학일빌딩-18': 6000000,
  '도산대로_강남빌딩-19': 12000000,
  '도산대로_s-s타워-20': 12000000,
  '도산대로_신웅빌딩-21': 12000000,
  '도산대로_sb타워-22': 12000000,
  '도산대로_블루펄빌딩-23': 12000000,
};

async function main() {
  console.log('🚀 20개 광고 데이터 일괄 삽입 시작...\n');

  // Read parsed ads data
  const adsData = JSON.parse(
    fs.readFileSync('/tmp/parsed_ads.json', 'utf-8')
  ) as ParsedAd[];

  // Get or create LED category
  let ledCategory = await prisma.category.findUnique({
    where: { name: 'LED 전광판' }
  });

  if (!ledCategory) {
    ledCategory = await prisma.category.create({
      data: {
        name: 'LED 전광판',
        description: '디지털 LED 전광판 광고',
      }
    });
    console.log('✅ LED 전광판 카테고리 생성\n');
  }

  // Get or create districts
  const gangnamDistrict = await prisma.district.upsert({
    where: {
      city_name: {
        city: '서울',
        name: '강남구'
      }
    },
    update: {},
    create: {
      name: '강남구',
      city: '서울',
    }
  });

  const seochoDistrict = await prisma.district.upsert({
    where: {
      city_name: {
        city: '서울',
        name: '서초구'
      }
    },
    update: {},
    create: {
      name: '서초구',
      city: '서울',
    }
  });

  console.log('✅ 지역 정보 준비 완료\n');

  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  for (const adData of adsData) {
    try {
      console.log(`처리중: ${adData.title} (페이지 ${adData.page_number})...`);

      // Correct price if needed
      const correctedPrice = priceCorrections[adData.slug] || adData.monthly_price;
      if (correctedPrice === 0) {
        console.log(`  ⚠️  가격 정보 없음, 기본값 10,000,000원 사용`);
      }
      const finalPrice = correctedPrice > 0 ? correctedPrice : 10000000;

      // Determine district
      const district = adData.address.includes('서초구') ? seochoDistrict : gangnamDistrict;

      // Generate coordinates (approximate based on district)
      const baseCoords = adData.address.includes('서초구')
        ? [127.032, 37.495] // 서초구 중심
        : [127.029, 37.498]; // 강남구 중심

      const coordinates = [
        baseCoords[0] + (Math.random() - 0.5) * 0.02,
        baseCoords[1] + (Math.random() - 0.5) * 0.02
      ];

      // Extract location name for landmarks
      const locationName = adData.title.split('_')[0] || '강남';

      // Check if ad already exists
      const existingAd = await prisma.ad.findUnique({
        where: { slug: adData.slug }
      });

      if (existingAd) {
        // Update existing ad
        const updatedAd = await prisma.ad.update({
          where: { id: existingAd.id },
          data: {
            title: adData.title,
            description: adData.description,
            categoryId: ledCategory.id,
            districtId: district.id,
            status: 'ACTIVE',
            featured: false,
            tags: ['LED', '강남', '전광판', locationName],
            viewCount: 0,
            favoriteCount: 0,
            inquiryCount: 0,
            verified: true,
            verifiedAt: new Date(),
            location: {
              address: adData.address,
              coordinates: coordinates,
              landmarks: [locationName, '강남역'],
              district: district.name
            },
            specs: {
              type: 'LED 전광판',
              size: adData.size,
              width: adData.width,
              height: adData.height,
              material: 'LED',
              installation: '건물 외벽',
              updateFrequency: '1일 100회 이상'
            },
            pricing: {
              monthly: finalPrice,
              deposit: Math.floor(finalPrice * 0.2),
              minimumPeriod: 1,
              currency: 'KRW'
            },
            metadata: {
              traffic: '높은 유동인구',
              visibility: '매우 좋음',
              nearbyBusinesses: [locationName, '강남역', '상권'],
              operatingHours: '24시간',
              restrictions: []
            }
          }
        });

        // Delete existing images
        await prisma.adImage.deleteMany({
          where: { adId: existingAd.id }
        });

        // Add new images
        for (const img of adData.images) {
          await prisma.adImage.create({
            data: {
              adId: updatedAd.id,
              url: img.url,
              alt: img.alt,
              order: img.order,
            },
          });
        }

        console.log(`  ✅ 업데이트 완료 (${finalPrice.toLocaleString()}원/월, 이미지 ${adData.images.length}개)`);
        updateCount++;
      } else {
        // Create new ad
        const newAd = await prisma.ad.create({
          data: {
            title: adData.title,
            slug: adData.slug,
            description: adData.description,
            categoryId: ledCategory.id,
            districtId: district.id,
            status: 'ACTIVE',
            featured: false,
            tags: ['LED', '강남', '전광판', locationName],
            viewCount: 0,
            favoriteCount: 0,
            inquiryCount: 0,
            verified: true,
            verifiedAt: new Date(),
            location: {
              address: adData.address,
              coordinates: coordinates,
              landmarks: [locationName, '강남역'],
              district: district.name
            },
            specs: {
              type: 'LED 전광판',
              size: adData.size,
              width: adData.width,
              height: adData.height,
              material: 'LED',
              installation: '건물 외벽',
              updateFrequency: '1일 100회 이상'
            },
            pricing: {
              monthly: finalPrice,
              deposit: Math.floor(finalPrice * 0.2),
              minimumPeriod: 1,
              currency: 'KRW'
            },
            metadata: {
              traffic: '높은 유동인구',
              visibility: '매우 좋음',
              nearbyBusinesses: [locationName, '강남역', '상권'],
              operatingHours: '24시간',
              restrictions: []
            }
          }
        });

        // Add images
        for (const img of adData.images) {
          await prisma.adImage.create({
            data: {
              adId: newAd.id,
              url: img.url,
              alt: img.alt,
              order: img.order,
            },
          });
        }

        console.log(`  ✅ 생성 완료 (${finalPrice.toLocaleString()}원/월, 이미지 ${adData.images.length}개)`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ 에러 발생: ${error}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 일괄 삽입 완료!');
  console.log(`📊 새로 생성: ${successCount}개`);
  console.log(`📊 업데이트: ${updateCount}개`);
  if (errorCount > 0) {
    console.log(`❌ 에러: ${errorCount}개`);
  }
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
