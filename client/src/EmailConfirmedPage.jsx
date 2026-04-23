import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

function EmailConfirmedPage() {
  const [searchParams] = useSearchParams();
  const accountName = searchParams.get('name')?.trim() || 'Chef';

  return (
    <div className="min-h-screen bg-[#F7F9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl border border-[#E3EAD1] p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4DE]">
          <CheckCircle2 className="h-8 w-8 text-[#839705]" aria-hidden />
        </div>

        <h1 className="text-3xl font-semibold text-[#2D3A18] tracking-tight">
          Welcome to DISHCOVERY, {accountName}!
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#51603A] leading-relaxed">
          Your email is now confirmed! You may now log in to DISHCOVERY.
        </p>

        <div className="mt-8">
          <Link
            to="/?auth=login"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[#2D3A18] px-8 py-3 text-white font-medium hover:bg-[#243013] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmedPage;
