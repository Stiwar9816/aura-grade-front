import type {Metadata} from 'next';
export const metadata: Metadata = {title: 'Acceso a tu cuenta | AuraGrade', robots: {index: false, follow: false}};
export default function AuthRouteLayout({children}: {children: React.ReactNode}) { return children; }
