import { LoaderIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../../components/ui/card";

export const LoadPage = (): JSX.Element => {
  return (
    <div className="bg-[#0961f5c9] flex flex-col items-center justify-center w-full h-screen">
      <Card className="bg-[#0961f5c9] w-full max-w-[393px] h-[852px] relative border-none">
        <CardContent className="flex flex-col items-center justify-center h-full p-0">
          <img
            className="w-[243px] h-[243px] object-cover"
            alt="ChatGPT logo"
            src="/chatgpt-image-19-mai-2025--15-53-02-1.png"
          />

          <div className="mt-40 flex items-center justify-center">
            <LoaderIcon className="w-8 h-8 text-white animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
