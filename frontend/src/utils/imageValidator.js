// Image Validation Engine — Audits product catalog for unique and valid images

export const validateProductCatalogImages = (products) => {
  const imageMap = new Map();
  const duplicates = [];
  const missingImages = [];

  products.forEach((prod) => {
    const img = prod.image || prod.imageUrl;
    if (!img || img.trim() === '') {
      missingImages.push({ id: prod.id, name: prod.name });
      return;
    }

    if (imageMap.has(img)) {
      const existing = imageMap.get(img);
      // Check if they are distinct products
      if (existing.id !== prod.id) {
        duplicates.push({
          image: img,
          product1: { id: existing.id, name: existing.name, category: existing.category },
          product2: { id: prod.id, name: prod.name, category: prod.category }
        });
      }
    } else {
      imageMap.set(img, prod);
    }
  });

  const isValid = duplicates.length === 0 && missingImages.length === 0;

  if (!isValid && process.env.NODE_ENV !== 'production') {
    if (duplicates.length > 0) {
      console.warn(`[IMAGE AUDIT] Detected ${duplicates.length} duplicate image assignments:`, duplicates);
    }
    if (missingImages.length > 0) {
      console.error(`[IMAGE AUDIT] Detected ${missingImages.length} missing product images:`, missingImages);
    }
  }

  return {
    isValid,
    totalProducts: products.length,
    uniqueImagesCount: imageMap.size,
    duplicates,
    missingImages
  };
};
