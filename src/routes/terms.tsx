import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      path: "/terms",
      title: "Terms of Service — The Scrap Co.",
      description:
        "Terms of Service for using The Scrap Co. platform. Read about scheduling, digital weighing, payouts, and cancellations.",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 md:py-20 space-y-8 text-left">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Agreement
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">
            Effective Date: 1 July 2026
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p className="italic text-foreground">
            Please read these terms carefully before using ScrapCo.in or scheduling a doorstep pickup.
          </p>

          <hr className="border-border/60" />

          <h2 className="text-lg font-bold text-foreground mt-8">1. The Service</h2>
          <p>
            The Scrap Co. provides a tech-enabled platform for scheduling doorstep scrap collection from residential apartments and societies in Noida, Greater Noida, and Indirapuram. We collect recyclable materials, weigh them using calibrated digital scales, and pay you the market rate on the spot via UPI.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">2. Service Area</h2>
          <p>We currently serve:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Noida</li>
            <li>Greater Noida</li>
            <li>Indirapuram</li>
          </ul>
          <p>
            If you submit a booking outside our service area, we will notify you and cancel the booking at no charge.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">3. Booking and Scheduling</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Bookings must be scheduled at least <strong>12 hours in advance</strong> of the requested pickup date.</li>
            <li>We confirm your booking slot via WhatsApp.</li>
            <li>Standard pickup hours are between <strong>9 AM and 6 PM, Monday to Saturday</strong>.</li>
            <li>Sunday or public holiday pickups are subject to availability.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">4. Payout and Weighing</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Payment is settled <strong>on the spot via UPI</strong> at the time of scrap collection.</li>
            <li>The payout is calculated using the formula: <strong>Actual Weight (measured on our scale) × Current published rate per kg</strong>.</li>
            <li>You may verify the scale reading during the weighment. We do not support arbitrary weight estimates.</li>
            <li>Current rates are updated regularly on our rates page and are subject to market conditions.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">5. Minimum Quantity</h2>
          <p>
            There is currently no minimum quantity requirement for bookings. However, bookings with very small quantities (under 5 kg total) may be rescheduled or combined with nearby pickups in your sector at our discretion.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">6. Cancellation Policy</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You may cancel or reschedule a booking <strong>up to 2 hours before the scheduled pickup time</strong> via the "My Bookings" page or by contacting us on WhatsApp.</li>
            <li>We reserve the right to cancel or reschedule a booking due to weather, traffic, or resource constraints. You will be notified promptly in such cases.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">7. Materials We Accept</h2>
          <p>We accept:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Paper and cardboard</li>
            <li>Plastics (PET bottles, HDPE containers, mixed clean plastics)</li>
            <li>Metals (ferrous and non-ferrous like iron, steel, copper, brass, aluminium)</li>
            <li>E-Waste (laptops, mobile phones, chargers, batteries, monitors)</li>
            <li>Other items listed on our rates page</li>
          </ul>
          <p>
            We <strong>do not accept</strong> hazardous waste, medical waste, liquid chemicals, asbestos, or any dangerous objects that pose a safety hazard to our collectors.
          </p>

          <h2 className="text-lg font-bold text-foreground mt-8">8. Your Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Ensure the materials are sorted and accessible at the agreed time and location.</li>
            <li>Do not mix prohibited materials or hazardous waste in your scrap piles.</li>
            <li>Provide accurate contact numbers and tower/flat addresses.</li>
            <li>Ensure an adult is present to complete the verification, weighing, and UPI checkout.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">9. Limitation of Liability</h2>
          <p>The Scrap Co. is not liable for:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Delays caused by force majeure events, traffic congestion, or severe weather.</li>
            <li>Payout discrepancies due to customer estimates (our calibrated digital scale is the final binding measure).</li>
            <li>Any property damage during the doorstep pickup unless proven to be caused by gross negligence of our collector.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground mt-8">10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts in Gautam Buddh Nagar (Noida), Uttar Pradesh.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
