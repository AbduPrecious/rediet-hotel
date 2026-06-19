export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
}

export interface Room {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: any; // Rich text from Strapi
  price: number;
  capacity: number;
  featured: boolean;
  amenities: string[];
  images?: {
    data: StrapiImage[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}