import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
    const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] =
        useCreateCheckoutSessionMutation();

    const purchaseCourseHandler = async () => {
        await createCheckoutSession(courseId);
    };

    useEffect(() => {
        if (isSuccess) {
            if (data?.url) {
                window.location.href = data.url;
            } else {
                toast.error("Invalid response from server.");
            }
        }
        if (isError) {
            toast.error(error?.data?.message || "Failed to create checkout session");
        }
    }, [data, isSuccess, isError, error]);

    return (
        <Button
            disabled={isLoading}
            onClick={purchaseCourseHandler}
            className="w-full bg-[#E8602E] hover:bg-[#d4561f] text-white font-bold rounded-xl py-3.5 h-auto shadow-lg shadow-[#E8602E]/20 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-[#E8602E]/25 disabled:opacity-60 disabled:scale-100"
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Enroll Now
                </span>
            )}
        </Button>
    );
};

export default BuyCourseButton;