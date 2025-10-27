const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 대한민국 전체 시/도 및 시/군/구
const districts = [
  // 서울특별시 (25개 자치구)
  { city: '서울', name: '강남구' },
  { city: '서울', name: '강동구' },
  { city: '서울', name: '강북구' },
  { city: '서울', name: '강서구' },
  { city: '서울', name: '관악구' },
  { city: '서울', name: '광진구' },
  { city: '서울', name: '구로구' },
  { city: '서울', name: '금천구' },
  { city: '서울', name: '노원구' },
  { city: '서울', name: '도봉구' },
  { city: '서울', name: '동대문구' },
  { city: '서울', name: '동작구' },
  { city: '서울', name: '마포구' },
  { city: '서울', name: '서대문구' },
  { city: '서울', name: '서초구' },
  { city: '서울', name: '성동구' },
  { city: '서울', name: '성북구' },
  { city: '서울', name: '송파구' },
  { city: '서울', name: '양천구' },
  { city: '서울', name: '영등포구' },
  { city: '서울', name: '용산구' },
  { city: '서울', name: '은평구' },
  { city: '서울', name: '종로구' },
  { city: '서울', name: '중구' },
  { city: '서울', name: '중랑구' },

  // 부산광역시 (16개 구/군)
  { city: '부산', name: '강서구' },
  { city: '부산', name: '금정구' },
  { city: '부산', name: '기장군' },
  { city: '부산', name: '남구' },
  { city: '부산', name: '동구' },
  { city: '부산', name: '동래구' },
  { city: '부산', name: '부산진구' },
  { city: '부산', name: '북구' },
  { city: '부산', name: '사상구' },
  { city: '부산', name: '사하구' },
  { city: '부산', name: '서구' },
  { city: '부산', name: '수영구' },
  { city: '부산', name: '연제구' },
  { city: '부산', name: '영도구' },
  { city: '부산', name: '중구' },
  { city: '부산', name: '해운대구' },

  // 대구광역시 (8개 구/군)
  { city: '대구', name: '남구' },
  { city: '대구', name: '달서구' },
  { city: '대구', name: '달성군' },
  { city: '대구', name: '동구' },
  { city: '대구', name: '북구' },
  { city: '대구', name: '서구' },
  { city: '대구', name: '수성구' },
  { city: '대구', name: '중구' },

  // 인천광역시 (10개 구/군)
  { city: '인천', name: '강화군' },
  { city: '인천', name: '계양구' },
  { city: '인천', name: '남동구' },
  { city: '인천', name: '동구' },
  { city: '인천', name: '미추홀구' },
  { city: '인천', name: '부평구' },
  { city: '인천', name: '서구' },
  { city: '인천', name: '연수구' },
  { city: '인천', name: '옹진군' },
  { city: '인천', name: '중구' },

  // 광주광역시 (5개 구)
  { city: '광주', name: '광산구' },
  { city: '광주', name: '남구' },
  { city: '광주', name: '동구' },
  { city: '광주', name: '북구' },
  { city: '광주', name: '서구' },

  // 대전광역시 (5개 구)
  { city: '대전', name: '대덕구' },
  { city: '대전', name: '동구' },
  { city: '대전', name: '서구' },
  { city: '대전', name: '유성구' },
  { city: '대전', name: '중구' },

  // 울산광역시 (5개 구/군)
  { city: '울산', name: '남구' },
  { city: '울산', name: '동구' },
  { city: '울산', name: '북구' },
  { city: '울산', name: '울주군' },
  { city: '울산', name: '중구' },

  // 세종특별자치시
  { city: '세종', name: '세종시' },

  // 경기도 (31개 시/군)
  { city: '경기', name: '고양시' },
  { city: '경기', name: '과천시' },
  { city: '경기', name: '광명시' },
  { city: '경기', name: '광주시' },
  { city: '경기', name: '구리시' },
  { city: '경기', name: '군포시' },
  { city: '경기', name: '김포시' },
  { city: '경기', name: '남양주시' },
  { city: '경기', name: '동두천시' },
  { city: '경기', name: '부천시' },
  { city: '경기', name: '성남시' },
  { city: '경기', name: '수원시' },
  { city: '경기', name: '시흥시' },
  { city: '경기', name: '안산시' },
  { city: '경기', name: '안성시' },
  { city: '경기', name: '안양시' },
  { city: '경기', name: '양주시' },
  { city: '경기', name: '양평군' },
  { city: '경기', name: '여주시' },
  { city: '경기', name: '연천군' },
  { city: '경기', name: '오산시' },
  { city: '경기', name: '용인시' },
  { city: '경기', name: '의왕시' },
  { city: '경기', name: '의정부시' },
  { city: '경기', name: '이천시' },
  { city: '경기', name: '파주시' },
  { city: '경기', name: '평택시' },
  { city: '경기', name: '포천시' },
  { city: '경기', name: '하남시' },
  { city: '경기', name: '화성시' },
  { city: '경기', name: '가평군' },

  // 강원특별자치도 (18개 시/군)
  { city: '강원', name: '강릉시' },
  { city: '강원', name: '고성군' },
  { city: '강원', name: '동해시' },
  { city: '강원', name: '삼척시' },
  { city: '강원', name: '속초시' },
  { city: '강원', name: '양구군' },
  { city: '강원', name: '양양군' },
  { city: '강원', name: '영월군' },
  { city: '강원', name: '원주시' },
  { city: '강원', name: '인제군' },
  { city: '강원', name: '정선군' },
  { city: '강원', name: '철원군' },
  { city: '강원', name: '춘천시' },
  { city: '강원', name: '태백시' },
  { city: '강원', name: '평창군' },
  { city: '강원', name: '홍천군' },
  { city: '강원', name: '화천군' },
  { city: '강원', name: '횡성군' },

  // 충청북도 (11개 시/군)
  { city: '충북', name: '괴산군' },
  { city: '충북', name: '단양군' },
  { city: '충북', name: '보은군' },
  { city: '충북', name: '영동군' },
  { city: '충북', name: '옥천군' },
  { city: '충북', name: '음성군' },
  { city: '충북', name: '제천시' },
  { city: '충북', name: '증평군' },
  { city: '충북', name: '진천군' },
  { city: '충북', name: '청주시' },
  { city: '충북', name: '충주시' },

  // 충청남도 (15개 시/군)
  { city: '충남', name: '계룡시' },
  { city: '충남', name: '공주시' },
  { city: '충남', name: '금산군' },
  { city: '충남', name: '논산시' },
  { city: '충남', name: '당진시' },
  { city: '충남', name: '보령시' },
  { city: '충남', name: '부여군' },
  { city: '충남', name: '서산시' },
  { city: '충남', name: '서천군' },
  { city: '충남', name: '아산시' },
  { city: '충남', name: '예산군' },
  { city: '충남', name: '천안시' },
  { city: '충남', name: '청양군' },
  { city: '충남', name: '태안군' },
  { city: '충남', name: '홍성군' },

  // 전북특별자치도 (14개 시/군)
  { city: '전북', name: '고창군' },
  { city: '전북', name: '군산시' },
  { city: '전북', name: '김제시' },
  { city: '전북', name: '남원시' },
  { city: '전북', name: '무주군' },
  { city: '전북', name: '부안군' },
  { city: '전북', name: '순창군' },
  { city: '전북', name: '완주군' },
  { city: '전북', name: '익산시' },
  { city: '전북', name: '임실군' },
  { city: '전북', name: '장수군' },
  { city: '전북', name: '전주시' },
  { city: '전북', name: '정읍시' },
  { city: '전북', name: '진안군' },

  // 전라남도 (22개 시/군)
  { city: '전남', name: '강진군' },
  { city: '전남', name: '고흥군' },
  { city: '전남', name: '곡성군' },
  { city: '전남', name: '광양시' },
  { city: '전남', name: '구례군' },
  { city: '전남', name: '나주시' },
  { city: '전남', name: '담양군' },
  { city: '전남', name: '목포시' },
  { city: '전남', name: '무안군' },
  { city: '전남', name: '보성군' },
  { city: '전남', name: '순천시' },
  { city: '전남', name: '신안군' },
  { city: '전남', name: '여수시' },
  { city: '전남', name: '영광군' },
  { city: '전남', name: '영암군' },
  { city: '전남', name: '완도군' },
  { city: '전남', name: '장성군' },
  { city: '전남', name: '장흥군' },
  { city: '전남', name: '진도군' },
  { city: '전남', name: '함평군' },
  { city: '전남', name: '해남군' },
  { city: '전남', name: '화순군' },

  // 경상북도 (23개 시/군)
  { city: '경북', name: '경산시' },
  { city: '경북', name: '경주시' },
  { city: '경북', name: '고령군' },
  { city: '경북', name: '구미시' },
  { city: '경북', name: '군위군' },
  { city: '경북', name: '김천시' },
  { city: '경북', name: '문경시' },
  { city: '경북', name: '봉화군' },
  { city: '경북', name: '상주시' },
  { city: '경북', name: '성주군' },
  { city: '경북', name: '안동시' },
  { city: '경북', name: '영덕군' },
  { city: '경북', name: '영양군' },
  { city: '경북', name: '영주시' },
  { city: '경북', name: '영천시' },
  { city: '경북', name: '예천군' },
  { city: '경북', name: '울릉군' },
  { city: '경북', name: '울진군' },
  { city: '경북', name: '의성군' },
  { city: '경북', name: '청도군' },
  { city: '경북', name: '청송군' },
  { city: '경북', name: '칠곡군' },
  { city: '경북', name: '포항시' },

  // 경상남도 (18개 시/군)
  { city: '경남', name: '거제시' },
  { city: '경남', name: '거창군' },
  { city: '경남', name: '고성군' },
  { city: '경남', name: '김해시' },
  { city: '경남', name: '남해군' },
  { city: '경남', name: '밀양시' },
  { city: '경남', name: '사천시' },
  { city: '경남', name: '산청군' },
  { city: '경남', name: '양산시' },
  { city: '경남', name: '의령군' },
  { city: '경남', name: '진주시' },
  { city: '경남', name: '창녕군' },
  { city: '경남', name: '창원시' },
  { city: '경남', name: '통영시' },
  { city: '경남', name: '하동군' },
  { city: '경남', name: '함안군' },
  { city: '경남', name: '함양군' },
  { city: '경남', name: '합천군' },

  // 제주특별자치도 (2개 시)
  { city: '제주', name: '서귀포시' },
  { city: '제주', name: '제주시' }
]

async function main() {
  console.log('🌏 전국 시/군/구 데이터 추가 시작...\n')

  let created = 0
  let skipped = 0

  for (const district of districts) {
    try {
      await prisma.district.upsert({
        where: {
          city_name: {
            city: district.city,
            name: district.name
          }
        },
        update: {},
        create: district
      })
      created++
      console.log(`✓ ${district.city} ${district.name}`)
    } catch (error) {
      skipped++
      console.log(`⊘ ${district.city} ${district.name} (이미 존재)`)
    }
  }

  console.log(`\n✅ 완료!`)
  console.log(`   - 추가됨: ${created}개`)
  console.log(`   - 건너뜀: ${skipped}개`)
  console.log(`   - 총: ${districts.length}개 지역`)

  // 최종 확인
  const total = await prisma.district.count()
  console.log(`\n📊 DB에 저장된 총 지역: ${total}개`)
}

main()
  .catch((error) => {
    console.error('❌ 에러 발생:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
