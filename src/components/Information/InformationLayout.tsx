import type {ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import HomeAccess from '@/components/HomeAccess';
import ThemeSelect from '@/components/Home/ThemeSelect';
import home from '@/app/home.module.css';
import styles from './information.module.css';

const links = [['/help', 'Ayuda'], ['/privacy', 'Privacidad'], ['/terms', 'Condiciones de uso']];
export default function InformationLayout({eyebrow, title, description, children}: {eyebrow: string; title: string; description: string; children: ReactNode}) {
 const {pathname} = useRouter();
 return <div className={`${home.home} ${styles.page}`}>
  <a href="#main-content" className="skip-link">Saltar al contenido</a>
  <header className={styles.header}>
   <div className={styles.topbar}>
    <Link href="/" className={home.brand} aria-label="AuraGrade — Inicio"><Image src="/logo.png" width={190} height={76} alt="AuraGrade" priority /></Link>
    <div className={styles.actions}><ThemeSelect /><HomeAccess /></div>
   </div>
   <nav className={styles.navigation} aria-label="Información y soporte">{links.map(([href, text]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{text}</Link>)}</nav>
  </header>
  <main id="main-content" tabIndex={-1} className={styles.main}>
   <div className={styles.hero}><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.description}>{description}</p></div>
   {children}
  </main>
  <footer className={styles.footer}><p>AuraGrade · Cada nota, con fundamento.</p><Link href="/">Volver al inicio <span aria-hidden="true">↗</span></Link></footer>
 </div>;
}
