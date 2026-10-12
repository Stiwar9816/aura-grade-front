"use client";
import Link from 'next/link';
import {useAuth} from '@/hooks';
import {UserRole} from '@/interface';
export default function HomeAccess({primary = false}: {primary?: boolean}) {
 const {user, isLoading} = useAuth();
 const href = user?.role === UserRole.ADMIN ? '/admin/approvals' : user?.role === UserRole.TEACHER ? '/teacher' : user ? '/student' : '/login';
 return <Link href={href} className={primary ? 'btn-primary' : 'btn-ghost'}>{!isLoading && user ? 'Ir a mi panel' : 'Iniciar sesión'}<span aria-hidden="true">→</span></Link>;
}
