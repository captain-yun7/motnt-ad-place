import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 강남대로 점프밀라노 광고 데이터 추가 중...');

  // LED 전광판 카테고리 찾기 또는 생성
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
    console.log('✅ LED 전광판 카테고리 생성');
  } else {
    console.log('✅ LED 전광판 카테고리 찾음');
  }

  // 강남구 찾기 또는 생성
  let gangnamDistrict = await prisma.district.findUnique({
    where: {
      city_name: {
        city: '서울',
        name: '강남구'
      }
    }
  });

  if (!gangnamDistrict) {
    gangnamDistrict = await prisma.district.create({
      data: {
        name: '강남구',
        city: '서울',
      }
    });
    console.log('✅ 강남구 생성');
  } else {
    console.log('✅ 강남구 찾음');
  }

  // 기존에 동일한 slug가 있는지 확인
  const existingAd = await prisma.ad.findUnique({
    where: { slug: 'gangnam-jumpmilano-led' }
  });

  if (existingAd) {
    console.log('⚠️  동일한 slug를 가진 광고가 이미 존재합니다. 업데이트를 진행합니다...');

    // 기존 광고 업데이트
    const updatedAd = await prisma.ad.update({
      where: { id: existingAd.id },
      data: {
        title: '강남대로 점프밀라노 LED 전광판',
        description: '강남대로 역삼동 횡단보도 전면위치 대형 LED 전광판. 장시간 메세지 노출 및 독보적인 주목도와 가시성을 자랑합니다.',
        categoryId: ledCategory.id,
        districtId: gangnamDistrict.id,
        status: 'ACTIVE',
        featured: true,
        tags: ['LED', '강남', '대형전광판', '횡단보도'],
        viewCount: 0,
        favoriteCount: 0,
        inquiryCount: 0,
        verified: true,
        verifiedAt: new Date(),
        location: {
          address: '서울시 강남구 역삼동 815번지',
          coordinates: [127.029, 37.498],
          landmarks: ['강남역', '역삼역', '강남대로'],
          district: '강남구'
        },
        specs: {
          type: 'LED 전광판',
          size: '18m x 8.7m',
          width: '18m',
          height: '8.7m',
          material: 'LED',
          installation: '건물 외벽',
          updateFrequency: '1일 100회 이상'
        },
        pricing: {
          monthly: 15000000,
          weekly: 4200000,
          daily: 1800000,
          deposit: 3000000,
          minimumPeriod: 1,
          currency: 'KRW',
          discounts: {
            '3days': 0,
            '7days': 0
          },
          additionalCosts: {
            threeDay: 5400000
          }
        },
        metadata: {
          traffic: '횡단보도 전면위치로 장시간 노출',
          visibility: '매우 높음 - 강남대로 낮은 위치 설치',
          nearbyBusinesses: ['강남역', '역삼역', '강남대로 상권'],
          operatingHours: '24시간',
          restrictions: []
        }
      }
    });

    // 기존 이미지 삭제
    await prisma.adImage.deleteMany({
      where: { adId: existingAd.id }
    });

    // 새 이미지 추가
    await Promise.all([
      prisma.adImage.create({
        data: {
          adId: updatedAd.id,
          url: '/ads/gangnam-jumpmilano-main.jpg',
          alt: '강남대로 점프밀라노 LED 전광판 야간 뷰',
          order: 0,
        },
      }),
      prisma.adImage.create({
        data: {
          adId: updatedAd.id,
          url: '/ads/gangnam-jumpmilano-map.jpg',
          alt: '강남대로 점프밀라노 위치 지도',
          order: 1,
        },
      }),
    ]);

    console.log(`✅ 광고 업데이트 완료: ${updatedAd.title}`);
    console.log(`   ID: ${updatedAd.id}`);
    console.log(`   Slug: ${updatedAd.slug}`);
  } else {
    // 새 광고 생성
    const newAd = await prisma.ad.create({
      data: {
        title: '강남대로 점프밀라노 LED 전광판',
        slug: 'gangnam-jumpmilano-led',
        description: '강남대로 역삼동 횡단보도 전면위치 대형 LED 전광판. 장시간 메세지 노출 및 독보적인 주목도와 가시성을 자랑합니다.',
        categoryId: ledCategory.id,
        districtId: gangnamDistrict.id,
        status: 'ACTIVE',
        featured: true,
        tags: ['LED', '강남', '대형전광판', '횡단보도'],
        viewCount: 0,
        favoriteCount: 0,
        inquiryCount: 0,
        verified: true,
        verifiedAt: new Date(),
        location: {
          address: '서울시 강남구 역삼동 815번지',
          coordinates: [127.029, 37.498],
          landmarks: ['강남역', '역삼역', '강남대로'],
          district: '강남구'
        },
        specs: {
          type: 'LED 전광판',
          size: '18m x 8.7m',
          width: '18m',
          height: '8.7m',
          material: 'LED',
          installation: '건물 외벽',
          updateFrequency: '1일 100회 이상'
        },
        pricing: {
          monthly: 15000000,
          weekly: 4200000,
          daily: 1800000,
          deposit: 3000000,
          minimumPeriod: 1,
          currency: 'KRW',
          discounts: {
            '3days': 0,
            '7days': 0
          },
          additionalCosts: {
            threeDay: 5400000
          }
        },
        metadata: {
          traffic: '횡단보도 전면위치로 장시간 노출',
          visibility: '매우 높음 - 강남대로 낮은 위치 설치',
          nearbyBusinesses: ['강남역', '역삼역', '강남대로 상권'],
          operatingHours: '24시간',
          restrictions: []
        }
      }
    });

    // 이미지 추가
    await Promise.all([
      prisma.adImage.create({
        data: {
          adId: newAd.id,
          url: '/ads/gangnam-jumpmilano-main.jpg',
          alt: '강남대로 점프밀라노 LED 전광판 야간 뷰',
          order: 0,
        },
      }),
      prisma.adImage.create({
        data: {
          adId: newAd.id,
          url: '/ads/gangnam-jumpmilano-map.jpg',
          alt: '강남대로 점프밀라노 위치 지도',
          order: 1,
        },
      }),
    ]);

    console.log(`✅ 광고 생성 완료: ${newAd.title}`);
    console.log(`   ID: ${newAd.id}`);
    console.log(`   Slug: ${newAd.slug}`);
  }

  console.log('🎉 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
