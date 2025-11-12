import { redirect } from 'next/navigation';

export default function Home() {
  // Redirection automatique vers la page de login
  redirect('/login');
}
