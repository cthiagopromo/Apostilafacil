
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET() {
  try {
    const result = await db.sql`
      CREATE TABLE IF NOT EXISTS apostilas (
        apostila_id VARCHAR(255) PRIMARY KEY,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
