import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      path: "/privacy",
      title: "Privacy Policy — The Scrap Co.",
      description:
        "Read the Privacy Policy of The Scrap Co. Learn how we collect, use and protect your personal data.",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 md:py-20 space-y-8 text-left">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Compliance
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">
            Effective Date: 1 July 2026 • Last Updated: 1 July 2026
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            The Scrap Co. (&quot;ScrapCo&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a tech-enabled doorstep scrap collection service operating in Noida, Greater Noida, Indirapuram, and surrounding areas. We operate the website scrapco.in and related services.
          </p>
          <p>
            For any privacy-related queries, contact us at:
            <br />
            <strong>Email:</strong> bookings.scrapco@gmail.com
            <br />
            <strong>Phone:</strong> +91 72920 16625
            <br />
            <strong>Address:</strong> Noida, Uttar Pradesh, India
          </p>

          <hr className="border-border/60" />

          <h2 className="text-lg font-bold text-foreground mt-8">What Information We Collect</h2>
          <p><strong>Information you provide to us:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Full name</li>
            <li>WhatsApp / mobile phone number</li>
            <li>Apartment society, sector, and flat/tower number</li>
            <li>Preferred pickup date</li>
            <li>Type of scrap materials you want collected</li>
            <li>Email address (if you create an account)</li>
          </ul>

          <p><strong>Information collected automatically:</strong></p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Browser type and device information</li>
            <li>IP address and approximate location (city level)</li>
            <li>Pages visited and time spent on the site</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">Why We Collect This Information</h2>
          <div className="overflow-x-auto rounded-xl border border-border mt-3">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-medium text-foreground">
                  <th className="px-4 py-2.5">Data Type</th>
                  <th className="px-4 py-2.5">Purpose of Processing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Name, phone, address</td>
                  <td className="px-4 py-2.5">To schedule and complete your doorstep scrap pickup</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Materials selected</td>
                  <td className="px-4 py-2.5">To assign the right collector with the appropriate weighing tools</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Email address</td>
                  <td className="px-4 py-2.5">To send confirmations, digital invoices, and account setup instructions</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Location data</td>
                  <td className="px-4 py-2.5">To verify if you are within our current operational service boundaries</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Device/browser data</td>
                  <td className="px-4 py-2.5">To maintain security, optimize mobile responsiveness, and fix bugs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-foreground mt-8">Who We Share Your Information With</h2>
          <p>
            We do <strong>not</strong> sell or rent your personal data to any third party. We share your information only with:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Champion collectors</strong> assigned to your area — they receive your name, phone number, and building address to perform the weighment and pay you out.
            </li>
            <li>
              <strong>Our database and authentication provider</strong>, securely hosted on secure cloud database infrastructure.
            </li>
            <li>
              <strong>Legal authorities</strong> — only if required to do so by Indian law or court subpoena.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">How Long We Keep Your Data</h2>
          <div className="overflow-x-auto rounded-xl border border-border mt-3">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-medium text-foreground">
                  <th className="px-4 py-2.5">Data Category</th>
                  <th className="px-4 py-2.5">Retention Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Booking records</td>
                  <td className="px-4 py-2.5">3 years (required for corporate tax and GST filing purposes)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Account information</td>
                  <td className="px-4 py-2.5">Until you submit a request for your profile deletion</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Communication logs</td>
                  <td className="px-4 py-2.5">1 year (for operational dispute resolution)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-foreground">Anonymous analytics</td>
                  <td className="px-4 py-2.5">Retained indefinitely in aggregated format for performance tracking</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-foreground mt-8">Your Rights (Under India's DPDP Act 2023)</h2>
          <p>
            As a data principal, you have robust rights under the Digital Personal Data Protection Act 2023:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Access</strong> the personal data we hold about you and verify its processing history.</li>
            <li><strong>Correct</strong> any inaccurate or outdated information in your profile.</li>
            <li><strong>Delete</strong> your personal data (subject to tax and regulatory retention laws).</li>
            <li><strong>Withdraw consent</strong> for data processing at any point.</li>
            <li><strong>Nominate</strong> another individual to exercise these rights on your behalf in case of incapacity.</li>
          </ul>
          <p>
            To exercise any of these rights, please email us at <strong>bookings.scrapco@gmail.com</strong> with the subject line <strong>&quot;Data Request&quot;</strong>.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">Cookies</h2>
          <p>
            We use minimal cookies — only what is strictly necessary for session management (keeping you logged in) and basic website performance. We do not use advertising or cross-site tracking cookies.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">Changes to This Policy</h2>
          <p>
            We may update this policy periodically to match operational or legal changes. We will notify registered users via email of any significant changes.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
