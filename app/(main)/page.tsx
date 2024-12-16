import { Button } from "@/components/ui/button";
import Link from "next/link";

const ApplicationPage = () => {
  return (
    <>
      <div className="hidden flex-col md:flex pt-12">
        <div className="w-100 flex flex-col items-center justify-center align-center mb-6">
          <h2 className="text-3xl mr-2 leading-5 font-bold tracking-tight bg-secondaryc mb-5">
            Start a Game
          </h2>
          <Link href={"/game?id="+Math.random().toString(36).substring(2, 8)} className="bg-red-900c">
            <Button size="lg" variant="link">
              Create &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
export default ApplicationPage;
