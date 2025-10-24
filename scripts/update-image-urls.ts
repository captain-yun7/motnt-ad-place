import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImageUrls() {
  console.log('🔄 Updating image URLs...');

  try {
    // 모든 이미지 조회
    const images = await prisma.adImage.findMany();

    console.log(`Found ${images.length} images to update`);

    let updatedCount = 0;

    for (const image of images) {
      // picsum.photos URL을 placehold.co로 변경
      if (image.url.includes('picsum.photos')) {
        const newUrl = 'https://placehold.co/800x600/png?text=Ad+Image';

        await prisma.adImage.update({
          where: { id: image.id },
          data: { url: newUrl }
        });

        updatedCount++;
        console.log(`✅ Updated image ${image.id}: ${image.url} -> ${newUrl}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} images!`);
  } catch (error) {
    console.error('Error updating image URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls();
