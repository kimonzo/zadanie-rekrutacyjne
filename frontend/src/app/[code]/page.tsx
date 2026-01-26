import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  // 1. Validate the link
  // 2. Count the click (RabbitMQ)
  // 3. Send the user to the final destination
  redirect(`http://127.0.0.1:8000/${code}`);
}
