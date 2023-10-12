import PageHeaders from "@/components/PageHeaders";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div >
      <PageHeaders
        h1Text={'Check out our pricing'}
        h2Text={'Our pricing is very simple'} />

      <div className="flex items-center justify-center">
        <div className="bg-white text-slate-700 rounded-lg max-w-sm mx-auto p-4 text-center">
          <h3 className="font-bold text-3xl">Free</h3>
          <h4>Free forever</h4>
          <h5>Two Videos per User per week</h5>
        </div>
        <Link href="mailto:pta.rohit28@gmail.com" className="bg-white text-slate-700 rounded-lg max-w-sm mx-auto p-4 text-center">
          <h3 className="font-bold text-3xl">Premium</h3>
          <h4>Monthly Subscription</h4>
          <h5>Contact us for full access</h5>
        </Link>
      </div>
    </div>
  );
}