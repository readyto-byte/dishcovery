import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

function EmailConfirmedPage() {
  const [searchParams] = useSearchParams();
  const accountName = searchParams.get('name')?.trim() || 'Chef';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F0] via-[#EDF3E6] to-[#E8F0DD] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-[#8BAE66]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-56 sm:w-80 h-56 sm:h-80 bg-[#BBCB2E]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-[#839705]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-xl">

        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#D6E8C0] overflow-hidden">
          
          <div className="h-1 w-full bg-gradient-to-r from-[#32491B] via-[#839705] to-[#BBCB2E]" />
          
          <div className="p-6 sm:p-10 text-center">
            
            <div className="mx-auto mb-5 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#EEF4DE]">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-[#839705]" aria-hidden />
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3 px-2">
              <span className="text-[#1B211A]">Welcome to </span>
              <span className="relative inline-block">
                <span className="absolute inset-0 blur-lg bg-[#8BAE66]/30 rounded-full"></span>
                <span className="relative bg-gradient-to-r from-[#6B8F4A] to-[#8BAE66] bg-clip-text text-transparent">
                  DISHCOVERY,
                </span>
              </span>
              <span className="text-[#1B211A] break-words"> {accountName}!</span>
            </h1>

            <div className="bg-gradient-to-r from-[#F5F9EF] to-[#EDF5E3] rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 border border-[#D6E8C0]">
              <p className="text-sm sm:text-base text-[#51603A] leading-relaxed">
                Your email is now confirmed!
              </p>
              <p className="text-xs sm:text-sm text-[#6B8F4A] mt-2 font-medium">
                You may now log in to start your culinary journey.
              </p>
            </div>

            <Link
              to="/?auth=login"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2D3A18] to-[#1B211A] px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <p className="text-[10px] sm:text-xs text-[#8BAE66]/60 mt-5 sm:mt-6 px-2">
              Start discovering recipes made just for you
            </p>
          </div>
        </div>

        <div className="hidden sm:block absolute -top-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#BBCB2E]/10 blur-2xl -z-10"></div>
        <div className="hidden sm:block absolute -bottom-4 -left-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#839705]/10 blur-2xl -z-10"></div>
      </div>
    </div>
  );
}

export default EmailConfirmedPage;