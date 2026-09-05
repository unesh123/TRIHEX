import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FloatingActionLayer } from "@/components/layout/floating-action-layer";
import { ToastProvider } from "@/components/ui/toast";
import {
  JsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/components/seo/json-ld";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd()]}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <SiteFooter />
      <FloatingActionLayer />
    </ToastProvider>
  );
}
