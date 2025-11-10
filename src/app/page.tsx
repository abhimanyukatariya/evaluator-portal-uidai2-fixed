import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


export default function Home() {
  const has = cookies().has('evaluator_token');
  redirect(has ? '/landing' : '/login');
}
