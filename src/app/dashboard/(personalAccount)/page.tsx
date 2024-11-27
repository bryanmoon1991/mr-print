import { PartyPopper } from "lucide-react";

export default function PersonalAccountPage() {
    return (
        <div className="flex flex-col gap-y-4 py-12 h-full w-full items-center justify-center content-center max-w-screen-md mx-auto text-center">
            <PartyPopper className="h-12 w-12 text-gray-400" />
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p>Welcome to Mr. Print! To get started, make a new printer by clicking the dropdown menu in the upper left hand corner.</p>
            <p>After you've made a new printer, activate your printer account through the billing portal!</p>
        </div>
    )
}