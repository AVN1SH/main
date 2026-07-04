import AICreditSection from '@/components/subscriptions/AICreditSection'
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';

const page = () => {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="sticky top-0 h-16 px-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          {<SidebarTrigger className="cursor-pointer" />}

          <div className="size-10 flex items-center justify-center bg-white rounded-xl p-1 shadow-sm">
            <Image
              src="/images/ai/ai-logo.svg"
              alt="bot"
              width={150}
              height={150}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight">
              Sarthaks AI
            </h1>
            <p className="text-xs text-slate-500">
              Your Exam Preparation Partner
            </p>
          </div>
        </div>
      </div>
      <div className="py-4 md:py-8 px-4 md:px-8">
        <AICreditSection courseKey='' disabled={false} />
      </div>
    </div>
  );
}

export default page;