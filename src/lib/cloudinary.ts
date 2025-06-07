import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryPhoto {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  context?: {
    custom?: {
      caption?: string;
      alt?: string;
    };
  };
}



export default cloudinary;

export async function getPhotos(options: {
  nextCursor?: string;
  limit?: number;
  folder?: string;
} = {}) {
  const { nextCursor, limit = 30, folder = '' } = options;
  
  try {
    let expression = 'resource_type:image';
    if (folder) {
      expression += ` AND folder=${folder}`;
    }
    
    const searchQuery = cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(limit);
    
    if (nextCursor) {
      searchQuery.next_cursor(nextCursor);
    }
    
    const results = await searchQuery.execute();
    
    return {
      photos: results.resources,
      nextCursor: results.next_cursor,
      totalCount: results.total_count,
    };
  } catch (error) {
    console.error('Error fetching photos from Cloudinary:', error);
    throw error;
  }
} 