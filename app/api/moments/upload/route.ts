import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { Prisma } from '@prisma/client';



export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const caption = formData.get('caption') as string | null;
  const location = formData.get('location') as string | null;

  if (!file || !title || !userId) {
    return NextResponse.json({ error: 'Missing required fields or not authenticated' }, { status: 400 });
  }

  // Upload file to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  // Save moment to database
  const moment = await prisma.moment.create({
    data: {
      title,
      image: blob.url,
      location: location || null,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      userId,
    },
  });

  // Update with caption separately if provided
  const finalMoment = caption ? await prisma.moment.update({
    where: { id: moment.id },
    data: { caption } as any
  }) : moment;

  return NextResponse.json({ url: blob.url, moment: finalMoment });
}
