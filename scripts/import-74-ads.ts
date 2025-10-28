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

async function main() {
  console.log('🚀 74개 광고 데이터 일괄 삽입 시작...\n');

  // Read parsed ads data
  const adsData = JSON.parse(
    fs.readFileSync('/tmp/parsed_ads_24_97.json', 'utf-8')
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
  const districtMap = new Map<string, any>();
  const uniqueDistricts = [...new Set(adsData.map(ad => ad.district))];

  for (const districtName of uniqueDistricts) {
    const district = await prisma.district.upsert({
      where: {
        city_name: {
          city: '서울',
          name: districtName
        }
      },
      update: {},
      create: {
        name: districtName,
        city: '서울',
      }
    });
    districtMap.set(districtName, district);
  }

  console.log(`✅ ${uniqueDistricts.length}개 지역 정보 준비 완료\n`);

  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  // Base coordinates for different districts
  const districtCoords: { [key: string]: [number, number] } = {
    '강남구': [127.029, 37.498],
    '서초구': [127.032, 37.495],
    '송파구': [127.100, 37.513],
    '강동구': [127.124, 37.530],
    '영등포구': [126.896, 37.526],
    '구로구': [126.887, 37.495],
    '금천구': [126.895, 37.456],
    '관악구': [126.951, 37.478],
    '동작구': [126.939, 37.512],
    '마포구': [126.902, 37.566],
    '서대문구': [126.936, 37.579],
    '은평구': [126.929, 37.602],
    '종로구': [126.979, 37.573],
    '중구': [126.997, 37.563],
    '용산구': [126.990, 37.532],
    '성동구': [127.037, 37.563],
    '광진구': [127.082, 37.538],
    '동대문구': [127.040, 37.574],
    '중랑구': [127.093, 37.606],
    '성북구': [127.017, 37.589],
    '강북구': [127.026, 37.640],
    '도봉구': [127.047, 37.669],
    '노원구': [127.056, 37.654]
  };

  for (const adData of adsData) {
    try {
      const pageNum = adData.page_number;
      if (pageNum % 10 === 0) {
        console.log(`\n📍 페이지 ${pageNum} 처리 중...`);
      }

      const district = districtMap.get(adData.district);
      if (!district) {
        console.log(`  ⚠️  ${adData.title}: 지역 정보 없음, 건너뜀`);
        errorCount++;
        continue;
      }

      // Ensure price is valid
      const finalPrice = adData.monthly_price > 0 ? adData.monthly_price : 10000000;

      // Generate coordinates
      const baseCoords = districtCoords[adData.district] || [127.029, 37.498];
      const coordinates = [
        baseCoords[0] + (Math.random() - 0.5) * 0.02,
        baseCoords[1] + (Math.random() - 0.5) * 0.02
      ];

      // Extract location name for landmarks
      const locationName = adData.title.split('_')[0] || adData.district;

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
            tags: ['LED', '전광판', adData.district, locationName],
            viewCount: 0,
            favoriteCount: 0,
            inquiryCount: 0,
            verified: true,
            verifiedAt: new Date(),
            location: {
              address: adData.address,
              coordinates: coordinates,
              landmarks: [locationName, adData.district],
              district: adData.district
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
              nearbyBusinesses: [locationName, adData.district],
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
            tags: ['LED', '전광판', adData.district, locationName],
            viewCount: 0,
            favoriteCount: 0,
            inquiryCount: 0,
            verified: true,
            verifiedAt: new Date(),
            location: {
              address: adData.address,
              coordinates: coordinates,
              landmarks: [locationName, adData.district],
              district: adData.district
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
              nearbyBusinesses: [locationName, adData.district],
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

        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ ${adData.title} 에러: ${error}`);
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
  console.log(`📊 총 처리: ${successCount + updateCount}개`);
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
