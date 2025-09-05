
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    const { apostila_id, data } = await request.json();
    const jsonData = JSON.stringify(data);

    // Using parameterized query to prevent SQL injection
    const result = await db.sql`
      INSERT INTO apostilas (apostila_id, data, updated_at)
      VALUES (${apostila_id}, ${jsonData}, NOW())
      ON CONFLICT (apostila_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    // It's good practice to not expose detailed error messages to the client.
    // Log the actual error on the server.
    console.error("Error saving apostila:", error);
    
    // Check if the error is an object with a message property
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
