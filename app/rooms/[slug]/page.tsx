import { getRoomBySlug, getRooms, getHotelInfo } from '@/lib/strapi';
import { Room } from '@/types/strapi';
import RoomDetailClient from './RoomDetailClient';

// ===== GENERATE STATIC PATHS =====
export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room: Room) => ({
    slug: room.slug,
  }));
}

// ===== MAIN PAGE COMPONENT (Server) =====
export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  const hotelInfo = await getHotelInfo();

  // Pass data to client component
  return <RoomDetailClient room={room} slug={slug} hotelName={hotelInfo?.hotelName} />;
}