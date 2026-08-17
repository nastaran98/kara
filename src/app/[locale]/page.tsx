import Image from "next/image";
import {Link} from '@/i18n/navigation'
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations()
  return (
        <Link className="ps-4" href="/about">{t('Nav.about')}</Link>
  );
}
